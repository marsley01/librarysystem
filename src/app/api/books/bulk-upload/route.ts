import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createRouteHandler, jsonResponse } from '@/lib/api-utils';
import { ValidationError, AuthError } from '@/lib/errors';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

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

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('school_id, role')
    .eq('id', authUser.id)
    .single();

  if (profileError || !profile) throw new AuthError('Profile not found');

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) throw new ValidationError('No file provided');
  if (!file.name.endsWith('.csv')) throw new ValidationError('Only .csv files are accepted');

  const text = await file.text();
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) {
    throw new ValidationError('CSV file must have a header row and at least one data row');
  }

  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const requiredFields = ['title', 'author'];
  const missingHeaders = requiredFields.filter((f) => !headers.includes(f));
  if (missingHeaders.length > 0) {
    throw new ValidationError(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  const errors: string[] = [];
  let success = 0;
  const BATCH_SIZE = 100;

  let qrCounter = 0;

  for (let i = 1; i < lines.length; i += BATCH_SIZE) {
    const batch = lines.slice(i, i + BATCH_SIZE);
    const booksToInsert: any[] = [];

    for (const line of batch) {
      const values = parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      if (!row.title || !row.author) {
        errors.push(`Row ${i + batch.indexOf(line) + 1}: missing title or author`);
        continue;
      }

      const totalCopies = parseInt(row.total_copies, 10) || 1;
      const uniqueSuffix = `${Date.now().toString(36).toUpperCase()}-${(++qrCounter).toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      booksToInsert.push({
        school_id: profile.school_id,
        title: row.title,
        author: row.author,
        isbn: row.isbn || null,
        publication_year: row.publication_year ? parseInt(row.publication_year, 10) : null,
        category: row.category || null,
        subject: row.subject || null,
        department: row.department || null,
        total_copies: totalCopies,
        available_copies: totalCopies,
        shelf_number: row.shelf_number || null,
        rack_number: row.rack_number || null,
        condition: row.condition && ['new', 'good', 'fair', 'poor', 'damaged'].includes(row.condition)
          ? row.condition : null,
        supplier: row.supplier || null,
        acquisition_date: row.acquisition_date || null,
        purchase_cost: row.purchase_cost ? parseFloat(row.purchase_cost) : null,
        qr_code_value: `KLS-${uniqueSuffix}`,
      });
    }

    if (booksToInsert.length > 0) {
      const { error } = await supabase.from('books').insert(booksToInsert);
      if (error) {
        errors.push(`Batch ${Math.ceil(i / BATCH_SIZE)}: ${error.message}`);
      } else {
        success += booksToInsert.length;
      }
    }
  }

  return jsonResponse({ success, errors: errors.slice(0, 50) });
}, { rateLimit: 'upload' });
