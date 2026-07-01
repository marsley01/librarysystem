-- Fix RLS infinite recursion by replacing all policies with security definer function approach

-- Drop old recursive policies
DROP POLICY IF EXISTS schools_read_own ON schools;
DROP POLICY IF EXISTS schools_admin_all ON schools;
DROP POLICY IF EXISTS users_read_own_school ON users;
DROP POLICY IF EXISTS users_admin_all ON users;
DROP POLICY IF EXISTS users_insert_own ON users;
DROP POLICY IF EXISTS books_select_own_school ON books;
DROP POLICY IF EXISTS books_insert_own_school ON books;
DROP POLICY IF EXISTS books_update_own_school ON books;
DROP POLICY IF EXISTS books_delete_own_school ON books;
DROP POLICY IF EXISTS borrow_records_select_own_school ON borrow_records;
DROP POLICY IF EXISTS borrow_records_insert_own_school ON borrow_records;
DROP POLICY IF EXISTS borrow_records_update_own_school ON borrow_records;
DROP POLICY IF EXISTS borrow_records_delete_own_school ON borrow_records;
DROP POLICY IF EXISTS school_settings_select_own ON school_settings;
DROP POLICY IF EXISTS school_settings_admin_all ON school_settings;
DROP POLICY IF EXISTS demo_requests_insert_anon ON demo_requests;
DROP POLICY IF EXISTS demo_requests_select_auth ON demo_requests;

-- Security definer function to break RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT school_id FROM users WHERE id = auth.uid(); $$;

-- SCHOOLS
CREATE POLICY schools_select_auth ON schools FOR SELECT TO authenticated USING (true);
CREATE POLICY schools_admin_all ON schools FOR ALL TO authenticated
  USING (get_user_school_id() = id AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- USERS
CREATE POLICY users_select_own ON users FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY users_admin_select ON users FOR SELECT TO authenticated
  USING (get_user_school_id() = school_id AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY users_insert_own ON users FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY users_admin_insert ON users FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY users_admin_update ON users FOR UPDATE TO authenticated
  USING (get_user_school_id() = school_id AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- BOOKS
CREATE POLICY books_select_school ON books FOR SELECT TO authenticated USING (school_id = get_user_school_id());
CREATE POLICY books_insert_school ON books FOR INSERT TO authenticated WITH CHECK (school_id = get_user_school_id());
CREATE POLICY books_update_school ON books FOR UPDATE TO authenticated USING (school_id = get_user_school_id());
CREATE POLICY books_delete_school ON books FOR DELETE TO authenticated USING (school_id = get_user_school_id());

-- BORROW RECORDS
CREATE POLICY borrow_records_select_school ON borrow_records FOR SELECT TO authenticated USING (school_id = get_user_school_id());
CREATE POLICY borrow_records_insert_school ON borrow_records FOR INSERT TO authenticated WITH CHECK (school_id = get_user_school_id());
CREATE POLICY borrow_records_update_school ON borrow_records FOR UPDATE TO authenticated USING (school_id = get_user_school_id());
CREATE POLICY borrow_records_delete_school ON borrow_records FOR DELETE TO authenticated USING (school_id = get_user_school_id());

-- SCHOOL SETTINGS
CREATE POLICY school_settings_select_school ON school_settings FOR SELECT TO authenticated USING (school_id = get_user_school_id());
CREATE POLICY school_settings_admin_all ON school_settings FOR ALL TO authenticated
  USING (get_user_school_id() = school_id AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- DEMO REQUESTS
CREATE POLICY demo_requests_insert_anon ON demo_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY demo_requests_select_auth ON demo_requests FOR SELECT TO authenticated USING (true);
