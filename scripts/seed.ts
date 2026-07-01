/**
 * KenyaLibrarySystems - Seed Script
 *
 * Run this after setting up your Supabase project and schema.
 * This script creates a demo school and sample data.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Prerequisites:
 *   - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 *   - Run the schema migration first (supabase/migrations/001_schema.sql)
 *   - Have at least one auth user created via Supabase Auth dashboard
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SCHOOL_ID = '00000000-0000-0000-0000-000000000001';

const books = [
  { title: 'The River Between', author: 'Ngugi wa Thiong\'o', isbn: '9789966463685', year: 1965, category: 'Fiction', subject: 'English', department: 'Languages', copies: 5, shelf: 'A1', rack: 'R1', condition: 'good', supplier: 'Textbook Centre', date: '2024-01-15', cost: 850, qr: 'KLS-BV9A-3XQ8' },
  { title: 'Weep Not, Child', author: 'Ngugi wa Thiong\'o', isbn: '9789966463692', year: 1964, category: 'Fiction', subject: 'English', department: 'Languages', copies: 3, shelf: 'A1', rack: 'R1', condition: 'good', supplier: 'Textbook Centre', date: '2024-01-15', cost: 780, qr: 'KLS-C2MB-7KR1' },
  { title: 'A Doll\'s House', author: 'Henrik Ibsen', isbn: '9780486270623', year: 1879, category: 'Fiction', subject: 'English', department: 'Languages', copies: 4, shelf: 'A2', rack: 'R1', condition: 'good', supplier: 'Bookpoint Ltd', date: '2024-02-10', cost: 650, qr: 'KLS-D4NC-9WT2' },
  { title: 'Betrayal in the City', author: 'Francis Imbuga', isbn: '9789966498007', year: 1976, category: 'Fiction', subject: 'English', department: 'Languages', copies: 3, shelf: 'A2', rack: 'R1', condition: 'fair', supplier: 'Textbook Centre', date: '2024-01-20', cost: 620, qr: 'KLS-E5OD-1VY3' },
  { title: 'Secondary Mathematics Form 2', author: 'KICD', isbn: '9789966431127', year: 2020, category: 'Textbook', subject: 'Mathematics', department: 'Mathematics', copies: 20, shelf: 'B1', rack: 'R2', condition: 'new', supplier: 'KICD', date: '2024-01-05', cost: 550, qr: 'KLS-F6PE-2UZ4' },
  { title: 'KLB Biology Form 3', author: 'Kenya Literature Bureau', isbn: '9789966642189', year: 2019, category: 'Textbook', subject: 'Biology', department: 'Sciences', copies: 15, shelf: 'C1', rack: 'R3', condition: 'good', supplier: 'Kenya Literature Bureau', date: '2024-01-10', cost: 720, qr: 'KLS-G7QF-3TA5' },
  { title: 'Understanding Chemistry Form 1', author: 'Peter M. M. G. Kirima', isbn: '9789966499325', year: 2018, category: 'Textbook', subject: 'Chemistry', department: 'Sciences', copies: 12, shelf: 'C2', rack: 'R3', condition: 'good', supplier: 'East African Educational Publishers', date: '2024-02-01', cost: 680, qr: 'KLS-H8RG-4SB6' },
  { title: 'Secondary Physics Form 4', author: 'Stephen M. N. Mwangi', isbn: '9789966498106', year: 2019, category: 'Textbook', subject: 'Physics', department: 'Sciences', copies: 10, shelf: 'C3', rack: 'R3', condition: 'good', supplier: 'Oxford University Press East Africa', date: '2024-01-25', cost: 750, qr: 'KLS-I9SH-5RC7' },
  { title: 'History and Government Form 2', author: 'J. M. Mbugua', isbn: '9789966254382', year: 2018, category: 'Textbook', subject: 'History & Government', department: 'Humanities', copies: 8, shelf: 'D1', rack: 'R4', condition: 'fair', supplier: 'Longhorn Publishers', date: '2023-09-15', cost: 600, qr: 'KLS-J0TI-6QD8' },
  { title: 'Geography Form 3', author: 'F. M. Njoroge', isbn: '9789966254399', year: 2019, category: 'Textbook', subject: 'Geography', department: 'Humanities', copies: 6, shelf: 'D2', rack: 'R4', condition: 'good', supplier: 'Longhorn Publishers', date: '2024-02-20', cost: 620, qr: 'KLS-K1UJ-7RE9' },
  { title: 'Computer Studies Form 1', author: 'S. M. Mwangi', isbn: '9789966498335', year: 2020, category: 'Textbook', subject: 'Computer Studies', department: 'Technical & Creative', copies: 7, shelf: 'E1', rack: 'R5', condition: 'new', supplier: 'Textbook Centre', date: '2024-03-01', cost: 800, qr: 'KLS-L2VK-8SF0' },
  { title: 'The Pearl', author: 'John Steinbeck', isbn: '9780140177374', year: 1947, category: 'Fiction', subject: 'English', department: 'Languages', copies: 4, shelf: 'A3', rack: 'R1', condition: 'good', supplier: 'Bookpoint Ltd', date: '2024-01-18', cost: 450, qr: 'KLS-M3WL-9TG1' },
  { title: 'Encyclopedia of Mathematics', author: 'James Stuart Tanton', isbn: '9780691166418', year: 2015, category: 'Reference', subject: 'Mathematics', department: 'Mathematics', copies: 2, shelf: 'B3', rack: 'R2', condition: 'good', supplier: 'Oxford University Press', date: '2024-02-05', cost: 2500, qr: 'KLS-N4XM-0UH2' },
  { title: 'Kiswahili Mufti Form 1', author: 'S. A. Mohamed', isbn: '9789966463593', year: 2019, category: 'Textbook', subject: 'Kiswahili', department: 'Languages', copies: 14, shelf: 'A4', rack: 'R1', condition: 'good', supplier: 'Kenya Literature Bureau', date: '2024-01-12', cost: 580, qr: 'KLS-O5YN-1VI3' },
  { title: 'CRE Today Form 2', author: 'W. N. Wanjohi', isbn: '9789966254276', year: 2018, category: 'Textbook', subject: 'CRE', department: 'Humanities', copies: 8, shelf: 'D3', rack: 'R4', condition: 'good', supplier: 'East African Educational Publishers', date: '2023-10-01', cost: 520, qr: 'KLS-P6ZO-2WJ4' },
  { title: 'Business Studies Form 3', author: 'J. K. Kiboss', isbn: '9789966498380', year: 2019, category: 'Textbook', subject: 'Business Studies', department: 'Humanities', copies: 9, shelf: 'D4', rack: 'R4', condition: 'fair', supplier: 'Longhorn Publishers', date: '2024-02-15', cost: 590, qr: 'KLS-Q7AP-3XK5' },
  { title: 'The Life and Times of Jomo Kenyatta', author: 'George Delf', isbn: '9789966251121', year: 1961, category: 'Biography', subject: 'History & Government', department: 'Humanities', copies: 2, shelf: 'D5', rack: 'R4', condition: 'poor', supplier: 'Oxford University Press', date: '2023-06-01', cost: 1200, qr: 'KLS-R8BQ-4YL6' },
];

async function seed() {
  console.log('Seeding KenyaLibrarySystems...\n');

  // Check if school exists
  const { data: existing } = await supabase
    .from('schools')
    .select('id')
    .eq('id', SCHOOL_ID)
    .single();

  if (!existing) {
    console.log('Creating school...');
    await supabase.from('schools').insert({
      id: SCHOOL_ID,
      name: 'Nairobi Premier School',
      fine_per_day: 20.00,
      default_loan_days: 14,
    });

    await supabase.from('school_settings').insert({
      school_id: SCHOOL_ID,
      fine_per_day: 20.00,
      default_loan_days: 14,
    });
    console.log('  School created: Nairobi Premier School\n');
  } else {
    console.log('  School already exists\n');
  }

  // Insert books
  console.log('Inserting books...');
  for (const book of books) {
    const { data: b } = await supabase
      .from('books')
      .select('id')
      .eq('qr_code_value', book.qr)
      .single();

    if (!b) {
      await supabase.from('books').insert({
        school_id: SCHOOL_ID,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publication_year: book.year,
        category: book.category,
        subject: book.subject,
        department: book.department,
        total_copies: book.copies,
        available_copies: book.copies,
        shelf_number: book.shelf,
        rack_number: book.rack,
        condition: book.condition,
        supplier: book.supplier,
        acquisition_date: book.date,
        purchase_cost: book.cost,
        qr_code_value: book.qr,
      });
      console.log(`  + ${book.title}`);
    } else {
      console.log(`  ~ ${book.title} (exists)`);
    }
  }

  console.log('\nSeed complete!\n');
  console.log('Next steps:');
  console.log('  1. Create a Supabase Auth user (email/password)');
  console.log('  2. Run this SQL to link the user:');
  console.log('     INSERT INTO users (id, school_id, role, full_name, email)');
  console.log("     VALUES ('<AUTH_USER_ID>', '00000000-0000-0000-0000-000000000001', 'admin', 'Admin', 'admin@school.ac.ke');");
  console.log('  3. Start the app: npm run dev');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
