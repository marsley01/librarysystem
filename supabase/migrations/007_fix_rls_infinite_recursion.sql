-- 007_fix_rls_infinite_recursion.sql
-- Replaces direct selects on the users table within policies with the get_user_role() function to break infinite recursion.

-- Ensure get_user_role exists (it was created in 006, but redefining just in case)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM users WHERE id = auth.uid(); $$;

-- SCHOOLS
DROP POLICY IF EXISTS schools_admin_all ON schools;
CREATE POLICY schools_admin_all ON schools FOR ALL TO authenticated
  USING (get_user_school_id() = id AND get_user_role() = 'admin');

-- USERS
DROP POLICY IF EXISTS users_admin_select ON users;
CREATE POLICY users_admin_select ON users FOR SELECT TO authenticated
  USING (get_user_school_id() = school_id AND get_user_role() = 'admin');

DROP POLICY IF EXISTS users_admin_insert ON users;
CREATE POLICY users_admin_insert ON users FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'admin');

DROP POLICY IF EXISTS users_admin_update ON users;
CREATE POLICY users_admin_update ON users FOR UPDATE TO authenticated
  USING (get_user_school_id() = school_id AND get_user_role() = 'admin');

-- SCHOOL SETTINGS
DROP POLICY IF EXISTS school_settings_admin_all ON school_settings;
CREATE POLICY school_settings_admin_all ON school_settings FOR ALL TO authenticated
  USING (get_user_school_id() = school_id AND get_user_role() = 'admin');
