import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createRouteHandler, jsonResponse } from '@/lib/api-utils';
import { ValidationError, AuthError, NotFoundError } from '@/lib/errors';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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
  const { borrow_record_id, fine_amount, note } = body;

  if (!borrow_record_id) {
    throw new ValidationError('Missing borrow_record_id');
  }

  const { data: record, error: recordError } = await supabase
    .from('borrow_records')
    .select('*, book:books(*)')
    .eq('id', borrow_record_id)
    .eq('school_id', profile.school_id)
    .single();

  if (recordError || !record) throw new NotFoundError('Borrow record not found');
  if (record.status === 'returned') {
    throw new ValidationError('This book has already been returned');
  }

  const today = new Date().toISOString().split('T')[0];

  const { error: updateError } = await supabase
    .from('borrow_records')
    .update({
      actual_return_date: today,
      status: 'returned',
      fine_amount: fine_amount || 0,
      note: note || null,
    })
    .eq('id', borrow_record_id)
    .eq('status', record.status);

  if (updateError) throw new Error('Failed to update borrow record');

  if (record.book) {
    const { error: bookError } = await supabase
      .from('books')
      .update({ available_copies: (record.book as any).available_copies + 1 })
      .eq('id', record.book_id);

    if (bookError) {
      console.error('Failed to increment available copies after return:', bookError);
    }
  }

  return jsonResponse({
    id: borrow_record_id,
    book_title: (record.book as any)?.title,
    student_name: record.student_name,
    fine_amount: fine_amount || 0,
    return_date: today,
  });
}, { rateLimit: 'default' });
