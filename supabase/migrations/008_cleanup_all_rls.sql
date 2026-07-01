-- 008_cleanup_all_rls.sql
-- This migration ensures all security definer functions exist,
-- drops ALL old recursive policies from the users and schools tables,
-- and recreates them cleanly to prevent infinite loops.

-- 1. Create the security definer functions (These bypass RLS safely)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM users WHERE id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT school_id FROM users WHERE id = auth.uid(); $$;

-- 2. Drop EVERY potentially recursive policy on users and schools
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view users in their school" ON users;
DROP POLICY IF EXISTS "Admins can insert users for their school" ON users;
DROP POLICY IF EXISTS "Admins can update users in their school" ON users;
DROP POLICY IF EXISTS "System admins can manage all users" ON users;
DROP POLICY IF EXISTS "users_read_own_school" ON users;
DROP POLICY IF EXISTS "users_admin_all" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_admin_select" ON users;
DROP POLICY IF EXISTS "users_admin_insert" ON users;
DROP POLICY IF EXISTS "users_admin_update" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_system_admin_all" ON users;

DROP POLICY IF EXISTS "schools_read_own" ON schools;
DROP POLICY IF EXISTS "schools_admin_all" ON schools;
DROP POLICY IF EXISTS "schools_select_auth" ON schools;
DROP POLICY IF EXISTS "schools_system_admin_all" ON schools;

-- 3. Recreate clean, non-recursive policies for users
-- Everyone can read their own profile
CREATE POLICY users_select_own ON users FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Everyone can insert their own initial profile during registration
CREATE POLICY users_insert_own ON users FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- School admins can manage users in their school
CREATE POLICY users_admin_select ON users FOR SELECT TO authenticated
  USING (get_user_school_id() = school_id AND get_user_role() = 'admin');

CREATE POLICY users_admin_insert ON users FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY users_admin_update ON users FOR UPDATE TO authenticated
  USING (get_user_school_id() = school_id AND get_user_role() = 'admin');

-- System admins can manage everyone
CREATE POLICY users_system_admin_all ON users FOR ALL TO authenticated
  USING (get_user_role() = 'system_admin');

-- 4. Recreate clean, non-recursive policies for schools
-- All authenticated users can see schools (needed for relationships)
CREATE POLICY schools_select_auth ON schools FOR SELECT TO authenticated
  USING (true);

-- School admins can manage their own school
CREATE POLICY schools_admin_all ON schools FOR ALL TO authenticated
  USING (get_user_school_id() = id AND get_user_role() = 'admin');

-- System admins can manage all schools
CREATE POLICY schools_system_admin_all ON schools FOR ALL TO authenticated
  USING (get_user_role() = 'system_admin');
