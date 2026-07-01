-- KenyaLibrarySystems (KLS) Database Schema
-- Phase 1: Inventory + QR Borrow/Return

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SCHOOLS TABLE (multi-tenant root)
-- ============================================================
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  fine_per_day NUMERIC(10, 2) NOT NULL DEFAULT 20.00,
  default_loan_days INT NOT NULL DEFAULT 14,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS TABLE (linked to Supabase Auth)
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('librarian', 'admin')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- BOOKS TABLE
-- ============================================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  publication_year INT,
  category TEXT,
  subject TEXT,
  department TEXT,
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  shelf_number TEXT,
  rack_number TEXT,
  condition TEXT CHECK (condition IN ('new', 'good', 'fair', 'poor', 'damaged')),
  supplier TEXT,
  acquisition_date DATE,
  purchase_cost NUMERIC(10, 2),
  qr_code_value TEXT UNIQUE NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_copies CHECK (available_copies >= 0 AND available_copies <= total_copies)
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_books_school_id ON books(school_id);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_subject ON books(subject);
CREATE INDEX idx_books_department ON books(department);
CREATE INDEX idx_books_archived ON books(archived);
CREATE INDEX idx_books_qr_code ON books(qr_code_value);

-- ============================================================
-- BORROW RECORDS TABLE
-- ============================================================
CREATE TABLE borrow_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  student_class TEXT NOT NULL,
  borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date DATE NOT NULL,
  actual_return_date DATE,
  status TEXT NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue')),
  fine_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  issued_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE borrow_records ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_borrow_records_school_id ON borrow_records(school_id);
CREATE INDEX idx_borrow_records_book_id ON borrow_records(book_id);
CREATE INDEX idx_borrow_records_status ON borrow_records(status);
CREATE INDEX idx_borrow_records_admission ON borrow_records(admission_number);
CREATE INDEX idx_borrow_records_expected_return ON borrow_records(expected_return_date);

-- ============================================================
-- SCHOOL SETTINGS TABLE (for overrides per school)
-- ============================================================
CREATE TABLE school_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE UNIQUE,
  fine_per_day NUMERIC(10, 2) NOT NULL DEFAULT 20.00,
  default_loan_days INT NOT NULL DEFAULT 14,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- SCHOOLS: only admins can manage, all authenticated users can read their own school
CREATE POLICY schools_read_own ON schools
  FOR SELECT USING (
    id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY schools_admin_all ON schools
  FOR ALL USING (
    id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- USERS: read within school, admin manages
CREATE POLICY users_read_own_school ON users
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY users_admin_all ON users
  FOR ALL USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY users_insert_own ON users
  FOR INSERT WITH CHECK (
    id = auth.uid()
  );

-- BOOKS: full access within school
CREATE POLICY books_select_own_school ON books
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY books_insert_own_school ON books
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY books_update_own_school ON books
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY books_delete_own_school ON books
  FOR DELETE USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- BORROW RECORDS: full access within school (librarians and admins)
CREATE POLICY borrow_records_select_own_school ON borrow_records
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY borrow_records_insert_own_school ON borrow_records
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY borrow_records_update_own_school ON borrow_records
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY borrow_records_delete_own_school ON borrow_records
  FOR DELETE USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- SCHOOL SETTINGS: read for all, write for admin
CREATE POLICY school_settings_select_own ON school_settings
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY school_settings_admin_all ON school_settings
  FOR ALL USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- AUTO-UPDATE UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_school_settings_updated_at
  BEFORE UPDATE ON school_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
