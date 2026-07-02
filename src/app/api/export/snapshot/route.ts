import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createRouteHandler, jsonResponse } from '@/lib/api-utils';
import { AuthError } from '@/lib/errors';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

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
    .select('school_id, role')
    .eq('id', authUser.id)
    .single();

  if (!profile) throw new AuthError('Profile not found');

  const body = await request.json();
  const exportType = body.type || 'full';

  if (!['books', 'borrow_records', 'full'].includes(exportType)) {
    return jsonResponse({ error: 'Invalid export type' }, 400);
  }

  const result: any = {};

  if (exportType === 'books' || exportType === 'full') {
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .eq('school_id', profile.school_id);

    if (booksError) throw new Error('Failed to export books');
    result.books = books;
    result.books_count = books?.length || 0;
  }

  if (exportType === 'borrow_records' || exportType === 'full') {
    const { data: records, error: recordsError } = await supabase
      .from('borrow_records')
      .select('*, book:books(title, author)')
      .eq('school_id', profile.school_id);

    if (recordsError) throw new Error('Failed to export borrow records');
    result.borrow_records = records;
    result.borrow_records_count = records?.length || 0;
  }

  const { error: insertError } = await supabase
    .from('data_exports')
    .insert({
      school_id: profile.school_id,
      export_type: exportType,
      file_data: result,
      row_count: (result.books_count || 0) + (result.borrow_records_count || 0),
    });

  if (insertError) {
    console.error('Failed to log export:', insertError);
  }

  result.exported_at = new Date().toISOString();

  return jsonResponse(result);
}, { rateLimit: 'strict' });
