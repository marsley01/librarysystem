-- 006_system_admin_and_institutions.sql

-- 1. Update the role constraint to include system_admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('librarian', 'admin', 'system_admin'));

-- 2. Drop the NOT NULL constraint on school_id (system admins don't belong to a school)
ALTER TABLE users ALTER COLUMN school_id DROP NOT NULL;

-- 3. Add status column to schools to allow banning
ALTER TABLE schools ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned'));

-- 4. Create a helper function for RLS
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM users WHERE id = auth.uid(); $$;

-- 5. Update RLS policies for system_admin
-- Schools
CREATE POLICY schools_system_admin_all ON schools FOR ALL TO authenticated
  USING (get_user_role() = 'system_admin');

-- Users
CREATE POLICY users_system_admin_all ON users FOR ALL TO authenticated
  USING (get_user_role() = 'system_admin');

-- Demo requests
DROP POLICY IF EXISTS demo_requests_select_auth ON demo_requests;
CREATE POLICY demo_requests_select_system_admin ON demo_requests FOR SELECT TO authenticated
  USING (get_user_role() = 'system_admin');
CREATE POLICY demo_requests_all_system_admin ON demo_requests FOR ALL TO authenticated
  USING (get_user_role() = 'system_admin');

-- Books
CREATE POLICY books_system_admin_all ON books FOR ALL TO authenticated
  USING (get_user_role() = 'system_admin');

-- Borrow Records
CREATE POLICY borrow_records_system_admin_all ON borrow_records FOR ALL TO authenticated
  USING (get_user_role() = 'system_admin');

-- School Settings
CREATE POLICY school_settings_system_admin_all ON school_settings FOR ALL TO authenticated
  USING (get_user_role() = 'system_admin');


-- 6. RPC Function for Institution Registration
CREATE OR REPLACE FUNCTION register_institution(
  p_school_name TEXT,
  p_full_name TEXT,
  p_email TEXT,
  p_user_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id UUID;
BEGIN
  -- Insert the school
  INSERT INTO schools (name)
  VALUES (p_school_name)
  RETURNING id INTO v_school_id;

  -- Create default settings for the school
  INSERT INTO school_settings (school_id, fine_per_day, default_loan_days)
  VALUES (v_school_id, 20.00, 14);

  -- Insert the admin user
  INSERT INTO users (id, school_id, role, full_name, email)
  VALUES (p_user_id, v_school_id, 'admin', p_full_name, p_email);
END;
$$;
