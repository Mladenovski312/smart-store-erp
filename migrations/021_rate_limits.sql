-- Persistent rate limiting via Supabase (replaces in-memory Map)
-- One row per IP per window. Auto-cleaned by check_rate_limit function.

CREATE TABLE IF NOT EXISTS rate_limits (
    key         text PRIMARY KEY,       -- e.g. 'gift-finder:1.2.3.4'
    count       int NOT NULL DEFAULT 1,
    window_end  timestamptz NOT NULL
);

CREATE INDEX idx_rate_limits_window ON rate_limits (window_end);

-- RPC: atomic check-and-increment. Returns true if request is allowed.
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_key text,
    p_max_requests int DEFAULT 20,
    p_window_seconds int DEFAULT 3600
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_now timestamptz := now();
    v_row rate_limits%ROWTYPE;
BEGIN
    -- Try to get existing entry
    SELECT * INTO v_row FROM rate_limits WHERE key = p_key FOR UPDATE;

    IF NOT FOUND OR v_row.window_end < v_now THEN
        -- No entry or expired: create/reset
        INSERT INTO rate_limits (key, count, window_end)
        VALUES (p_key, 1, v_now + (p_window_seconds || ' seconds')::interval)
        ON CONFLICT (key) DO UPDATE SET count = 1, window_end = v_now + (p_window_seconds || ' seconds')::interval;
        RETURN true;
    END IF;

    IF v_row.count >= p_max_requests THEN
        RETURN false;  -- Rate limited
    END IF;

    -- Increment
    UPDATE rate_limits SET count = count + 1 WHERE key = p_key;
    RETURN true;
END;
$$;

-- Cleanup: delete expired rows (run periodically or on each call — lightweight)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    DELETE FROM rate_limits WHERE window_end < now();
$$;

-- RLS: no direct access needed, only via RPC (SECURITY DEFINER)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
