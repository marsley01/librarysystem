-- 009_fix_missing_tables_and_columns.sql
-- Creates tables and columns referenced by code but missing from migrations

-- 0. Atomic increment function for race-condition-safe book returns
CREATE OR REPLACE FUNCTION public.increment_available_copies(p_book_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE books SET available_copies = available_copies + 1 WHERE id = p_book_id;
$$;

-- 1. Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- 2. Data exports log table
CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL,
  file_data JSONB NOT NULL DEFAULT '{}',
  row_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;

-- 3. Add missing columns to borrow_records
ALTER TABLE borrow_records ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
ALTER TABLE borrow_records ADD COLUMN IF NOT EXISTS note TEXT;

-- 4. Add missing columns to demo_requests (status tracking)
ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed'));

-- 5. Index for rate limiting lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at);

-- 6. Index for data exports
CREATE INDEX IF NOT EXISTS idx_data_exports_school ON data_exports(school_id);
