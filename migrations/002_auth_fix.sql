-- ═══════════════════════════════════════════════════════════
-- Migration: Fix user_roles for invite flow + cleanup test user
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Remove the test user that was created via signup
DELETE FROM user_roles WHERE email = 'filip_mladenovski@yahoo.com';

-- 2. Make user_id nullable in user_roles (needed for invite flow
--    where user is created first, then user_id is set when they accept)
ALTER TABLE user_roles ALTER COLUMN user_id DROP NOT NULL;

-- 3. Drop the unique constraint on user_id if it exists,
--    and re-add it but allowing nulls (unique ignores nulls by default)
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_unique ON user_roles(user_id) WHERE user_id IS NOT NULL;

-- 4. Add a unique constraint on email to prevent duplicates
ALTER TABLE user_roles ADD CONSTRAINT user_roles_email_unique UNIQUE (email);

-- 5. Allow authenticated users to read their own role (needed for login)
CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- NOTE: After running this, add your Supabase Service Role Key to .env.local:
-- SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
-- (Find it in Supabase Dashboard → Settings → API → service_role key)
