-- KenyaLibrarySystems - Seed Data
-- Run this after applying the schema to set up demo data

-- Create a default school
INSERT INTO schools (id, name, fine_per_day, default_loan_days)
VALUES ('00000000-0000-0000-0000-000000000001', 'Nairobi Premier School', 20.00, 14);

-- Create school settings
INSERT INTO school_settings (school_id, fine_per_day, default_loan_days)
VALUES ('00000000-0000-0000-0000-000000000001', 20.00, 14);

-- Create an admin user (you'll need to set up a real Supabase auth user first)
-- The auth user ID should match the ID below
-- For demo purposes, sign up via Supabase Auth then run:
-- INSERT INTO users (id, school_id, role, full_name, email)
-- VALUES ('<AUTH_USER_ID>', '00000000-0000-0000-0000-000000000001', 'admin', 'Admin User', 'admin@school.ac.ke');

-- Sample Books
INSERT INTO books (school_id, title, author, isbn, publication_year, category, subject, department, total_copies, available_copies, shelf_number, rack_number, condition, supplier, acquisition_date, purchase_cost, qr_code_value)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'The River Between', 'Ngugi wa Thiong''o', '9789966463685', 1965, 'Fiction', 'English', 'Languages', 5, 4, 'A1', 'R1', 'good', 'Textbook Centre', '2024-01-15', 850.00, 'KLS-BV9A-3XQ8'),
  ('00000000-0000-0000-0000-000000000001', 'Weep Not, Child', 'Ngugi wa Thiong''o', '9789966463692', 1964, 'Fiction', 'English', 'Languages', 3, 3, 'A1', 'R1', 'good', 'Textbook Centre', '2024-01-15', 780.00, 'KLS-C2MB-7KR1'),
  ('00000000-0000-0000-0000-000000000001', 'A Doll''s House', 'Henrik Ibsen', '9780486270623', 1879, 'Fiction', 'English', 'Languages', 4, 2, 'A2', 'R1', 'good', 'Bookpoint Ltd', '2024-02-10', 650.00, 'KLS-D4NC-9WT2'),
  ('00000000-0000-0000-0000-000000000001', 'Betrayal in the City', 'Francis Imbuga', '9789966498007', 1976, 'Fiction', 'English', 'Languages', 3, 3, 'A2', 'R1', 'fair', 'Textbook Centre', '2024-01-20', 620.00, 'KLS-E5OD-1VY3'),
  ('00000000-0000-0000-0000-000000000001', 'Secondary Mathematics Form 2', 'Kenya Institute of Curriculum Development', '9789966431127', 2020, 'Textbook', 'Mathematics', 'Mathematics', 20, 18, 'B1', 'R2', 'new', 'KICD', '2024-01-05', 550.00, 'KLS-F6PE-2UZ4'),
  ('00000000-0000-0000-0000-000000000001', 'KLB Biology Form 3', 'Kenya Literature Bureau', '9789966642189', 2019, 'Textbook', 'Biology', 'Sciences', 15, 12, 'C1', 'R3', 'good', 'Kenya Literature Bureau', '2024-01-10', 720.00, 'KLS-G7QF-3TA5'),
  ('00000000-0000-0000-0000-000000000001', 'Understanding Chemistry Form 1', 'Peter M. M. G. Kirima', '9789966499325', 2018, 'Textbook', 'Chemistry', 'Sciences', 12, 10, 'C2', 'R3', 'good', 'East African Educational Publishers', '2024-02-01', 680.00, 'KLS-H8RG-4SB6'),
  ('00000000-0000-0000-0000-000000000001', 'Secondary Physics Form 4', 'Stephen M. N. Mwangi', '9789966498106', 2019, 'Textbook', 'Physics', 'Sciences', 10, 7, 'C3', 'R3', 'good', 'Oxford University Press East Africa', '2024-01-25', 750.00, 'KLS-I9SH-5RC7'),
  ('00000000-0000-0000-0000-000000000001', 'History and Government Form 2', 'J. M. Mbugua', '9789966254382', 2018, 'Textbook', 'History & Government', 'Humanities', 8, 8, 'D1', 'R4', 'fair', 'Longhorn Publishers', '2023-09-15', 600.00, 'KLS-J0TI-6QD8'),
  ('00000000-0000-0000-0000-000000000001', 'Geography Form 3', 'F. M. Njoroge', '9789966254399', 2019, 'Textbook', 'Geography', 'Humanities', 6, 5, 'D2', 'R4', 'good', 'Longhorn Publishers', '2024-02-20', 620.00, 'KLS-K1UJ-7RE9'),
  ('00000000-0000-0000-0000-000000000001', 'Computer Studies Form 1', 'S. M. Mwangi', '9789966498335', 2020, 'Textbook', 'Computer Studies', 'Technical & Creative', 7, 7, 'E1', 'R5', 'new', 'Textbook Centre', '2024-03-01', 800.00, 'KLS-L2VK-8SF0'),
  ('00000000-0000-0000-0000-000000000001', 'The Pearl', 'John Steinbeck', '9780140177374', 1947, 'Fiction', 'English', 'Languages', 4, 3, 'A3', 'R1', 'good', 'Bookpoint Ltd', '2024-01-18', 450.00, 'KLS-M3WL-9TG1'),
  ('00000000-0000-0000-0000-000000000001', 'Encyclopedia of Mathematics', 'James Stuart Tanton', '9780691166418', 2015, 'Reference', 'Mathematics', 'Mathematics', 2, 2, 'B3', 'R2', 'good', 'Oxford University Press', '2024-02-05', 2500.00, 'KLS-N4XM-0UH2'),
  ('00000000-0000-0000-0000-000000000001', 'Kiswahili Mufti Form 1', 'S. A. Mohamed', '9789966463593', 2019, 'Textbook', 'Kiswahili', 'Languages', 14, 12, 'A4', 'R1', 'good', 'Kenya Literature Bureau', '2024-01-12', 580.00, 'KLS-O5YN-1VI3'),
  ('00000000-0000-0000-0000-000000000001', 'CRE Today Form 2', 'W. N. Wanjohi', '9789966254276', 2018, 'Textbook', 'CRE', 'Humanities', 8, 8, 'D3', 'R4', 'good', 'East African Educational Publishers', '2023-10-01', 520.00, 'KLS-P6ZO-2WJ4'),
  ('00000000-0000-0000-0000-000000000001', 'Business Studies Form 3', 'J. K. Kiboss', '9789966498380', 2019, 'Textbook', 'Business Studies', 'Humanities', 9, 7, 'D4', 'R4', 'fair', 'Longhorn Publishers', '2024-02-15', 590.00, 'KLS-Q7AP-3XK5'),
  ('00000000-0000-0000-0000-000000000001', 'The Life and Times of Jomo Kenyatta', 'George Delf', '9789966251121', 1961, 'Biography', 'History & Government', 'Humanities', 2, 2, 'D5', 'R4', 'poor', 'Oxford University Press', '2023-06-01', 1200.00, 'KLS-R8BQ-4YL6');

-- Sample Borrow Records (assuming a user exists)
-- Uncomment and adjust the issued_by UUID when you have a user
-- INSERT INTO borrow_records (school_id, book_id, student_name, admission_number, student_class, borrow_date, expected_return_date, status, issued_by)
-- VALUES
--   ('00000000-0000-0000-0000-000000000001', (SELECT id FROM books WHERE qr_code_value = 'KLS-BV9A-3XQ8'), 'Jane Muthoni', '2024/5678', 'Form 2A', '2025-06-10', '2025-06-24', 'borrowed', '<USER_ID>'),
--   ('00000000-0000-0000-0000-000000000001', (SELECT id FROM books WHERE qr_code_value = 'KLS-D4NC-9WT2'), 'Peter Kamau', '2024/1234', 'Form 3B', '2025-06-01', '2025-06-15', 'borrowed', '<USER_ID>'),
--   ('00000000-0000-0000-0000-000000000001', (SELECT id FROM books WHERE qr_code_value = 'KLS-K1UJ-7RE9'), 'Grace Wanjiku', '2023/8901', 'Form 4A', '2025-05-15', '2025-06-05', 'overdue', '<USER_ID>'),
--   ('00000000-0000-0000-0000-000000000001', (SELECT id FROM books WHERE qr_code_value = 'KLS-F6PE-2UZ4'), 'James Ochieng', '2024/3456', 'Form 2B', '2025-05-20', '2025-06-03', 'borrowed', '<USER_ID>');
