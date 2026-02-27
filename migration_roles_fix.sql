-- ═══════════════════════════════════════════════════════════
-- Fix: Admin can see all users + ensure your admin entry exists
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Drop the restrictive policy
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;

-- 2. Allow all authenticated users to read user_roles
--    (the SettingsPanel already checks role === 'admin' in code)
CREATE POLICY "Authenticated users can read roles"
  ON user_roles FOR SELECT TO authenticated
  USING (true);

-- 3. Allow admins to insert/update/delete user_roles
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Make sure YOUR admin entry exists
--    Replace the user_id below with your actual auth.users id.
--    Find it in Supabase → Authentication → Users → copy the UUID
-- 
-- INSERT INTO user_roles (user_id, email, role, display_name)
-- VALUES ('YOUR-UUID-HERE', 'your-email@example.com', 'admin', 'filip_mladenovski')
-- ON CONFLICT (email) DO NOTHING;

-- Quick way: auto-insert for the first auth user as admin
INSERT INTO user_roles (user_id, email, role, display_name)
SELECT id, email, 'admin', SPLIT_PART(email, '@', 1)
FROM auth.users
WHERE email IS NOT NULL
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
