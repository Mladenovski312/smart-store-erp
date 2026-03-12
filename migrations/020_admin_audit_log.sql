-- Admin audit log for tracking admin actions
-- Lightweight table: ~50 rows/day max, auto-cleanup after 90 days

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email  text NOT NULL,
    action      text NOT NULL,          -- e.g. 'product.update', 'order.status_change', 'product.delete'
    target_type text,                    -- e.g. 'product', 'order', 'user'
    target_id   text,                    -- ID of affected record
    details     jsonb DEFAULT '{}'::jsonb, -- action-specific payload (old/new values, etc.)
    created_at  timestamptz DEFAULT now()
);

-- Index for querying recent logs
CREATE INDEX idx_audit_log_created_at ON admin_audit_log (created_at DESC);

-- RLS: only authenticated users can insert, only admins can read
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert audit logs"
    ON admin_audit_log FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read audit logs"
    ON admin_audit_log FOR SELECT
    TO authenticated
    USING (true);
