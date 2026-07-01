-- Changelog / Issue Tracking table for admin portal
CREATE TABLE IF NOT EXISTS changelog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('feature', 'fix', 'improvement', 'issue', 'announcement')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;

CREATE POLICY changelog_all_admin ON changelog
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY changelog_select_auth ON changelog
  FOR SELECT TO authenticated
  USING (school_id = (SELECT get_user_school_id()) OR school_id IS NULL);
