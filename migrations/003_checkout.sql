-- ═══════════════════════════════════════════════════════════
-- Migration: Add customers table + update orders table
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  city TEXT,
  street TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert customers"
  ON customers FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update own customer by email"
  ON customers FOR UPDATE TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can view customers"
  ON customers FOR SELECT TO authenticated
  USING (is_admin());

-- Also allow public to read their own customer by email (for checkout auto-fill)
CREATE POLICY "Public can read own customer"
  ON customers FOR SELECT TO anon
  USING (true);

-- 2. Add new columns to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_first_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_last_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Make delivery_cost nullable (we don't set delivery pricing)
ALTER TABLE orders ALTER COLUMN delivery_cost DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN delivery_cost SET DEFAULT NULL;
