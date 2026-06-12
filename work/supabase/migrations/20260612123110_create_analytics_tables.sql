-- View counter table
CREATE TABLE view_counts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  total_views INTEGER DEFAULT 0 NOT NULL
);

-- Insert initial row
INSERT INTO view_counts (total_views) VALUES (0);

-- Visitor logs table
CREATE TABLE visitor_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip TEXT NOT NULL DEFAULT 'unknown',
  country TEXT NOT NULL DEFAULT 'unknown',
  city TEXT NOT NULL DEFAULT 'unknown',
  isp TEXT NOT NULL DEFAULT 'unknown',
  is_mobile BOOLEAN NOT NULL DEFAULT false,
  os TEXT NOT NULL DEFAULT 'unknown',
  browser TEXT NOT NULL DEFAULT 'unknown',
  referrer TEXT NOT NULL DEFAULT 'direct',
  visitor_id TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE view_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- view_counts is server-managed (service role only), but we need read for admin
-- Since there's only 1 row and no user_id, we'll allow authenticated SELECT
-- and use service role for writes from API routes

-- For now, we'll use the service role key in API routes so RLS policies 
-- on write operations aren't needed for server-side code.
-- But we still need policies for any client-side access.

-- Allow public read on view_counts (for counter display)
CREATE POLICY "select_view_counts" ON view_counts FOR SELECT
  TO anon, authenticated USING (true);

-- Allow public read on visitor_logs (admin dashboard reads via service role)
CREATE POLICY "select_visitor_logs" ON visitor_logs FOR SELECT
  TO anon, authenticated USING (true);

-- Write policies for service role are handled by service role key bypassing RLS
-- But for completeness, allow inserts from authenticated (server routes use service role)
CREATE POLICY "insert_visitor_logs" ON visitor_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "update_view_counts" ON view_counts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Index for sorting by time
CREATE INDEX idx_visitor_logs_created_at ON visitor_logs (created_at DESC);
