import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createRouteHandler, jsonResponse } from '@/lib/api-utils';
import { ValidationError, AuthError, NotFoundError } from '@/lib/errors';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export const POST = createRouteHandler(async (request: Request) => {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() {},
    },
  });

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) throw new AuthError();

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!profile) throw new AuthError('Profile not found');

  const body = await request.json();
  const { book_id, student_name, admission_number, student_class, expected_return_date, idempotency_key } = body;

  if (!book_id || !student_name || !admission_number || !student_class || !expected_return_date) {
    throw new ValidationError('Missing required fields');
  }

  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('*')
    .eq('id', book_id)
    .eq('school_id', profile.school_id)
    .eq('archived', false)
    .single();

  if (bookError || !book) throw new NotFoundError('Book not found');
  if (book.available_copies <= 0) throw new ValidationError('No available copies to borrow');

  const key = idempotency_key || generateIdempotencyKey();

  const { data: existing } = await supabase
    .from('borrow_records')
    .select('id')
    .eq('idempotency_key', key)
    .maybeSingle();

  if (existing) {
    return jsonResponse({ id: existing.id, idempotency_key: key, already_processed: true });
  }

  const { data: newRecord, error: insertError } = await supabase
    .from('borrow_records')
    .insert({
      school_id: profile.school_id,
      book_id: book.id,
      student_name,
      admission_number,
      student_class,
      borrow_date: new Date().toISOString().split('T')[0],
      expected_return_date,
      status: 'borrowed',
      issued_by: authUser.id,
      idempotency_key: key,
    })
    .select()
    .single();

  if (insertError) throw new Error('Failed to create borrow record');

  const { error: updateError } = await supabase
    .from('books')
    .update({ available_copies: book.available_copies - 1 })
    .eq('id', book.id);

  if (updateError) {
    await supabase.from('borrow_records').delete().eq('id', newRecord.id);
    throw new Error('Failed to update book inventory. Transaction rolled back.');
  }

  return jsonResponse({
    id: newRecord.id,
    idempotency_key: key,
    book_title: book.title,
    student_name,
    expected_return_date,
  });
}, { rateLimit: 'default' });
