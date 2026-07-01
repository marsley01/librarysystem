-- KenyaLibrarySystems - Demo Requests Table (pre-signup contact form)
-- No school_id because this happens before any account exists

CREATE TABLE demo_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  student_count TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (this is a public form)
CREATE POLICY demo_requests_insert_anon ON demo_requests
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can view
CREATE POLICY demo_requests_select_auth ON demo_requests
  FOR SELECT USING (auth.role() = 'authenticated');
