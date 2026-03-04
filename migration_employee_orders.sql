-- ==============================================================================
-- Migration: Grant Employees Access to Orders
-- Description: Updates the Row Level Security (RLS) policies on the `orders` 
--              table so that all authenticated users (Employees and Admins) 
--              can view and update orders, rather than just Admins.
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ==============================================================================

-- 1. Drop the old restrictive admin-only policies
DROP POLICY IF EXISTS "Admins can view orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- 2. Create new inclusive policies for all authenticated staff
CREATE POLICY "Employees and Admins can view orders"
  ON orders FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Employees and Admins can update orders"
  ON orders FOR UPDATE TO authenticated
  USING (true);

-- Success message
SELECT 'Successfully updated RLS policies: Employees now have full access to Orders tab!' as status;
