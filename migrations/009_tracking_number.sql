-- ==============================================================================
-- Migration: Add tracking_number column to orders table
-- Description: Stores the optional courier tracking number when an order is shipped.
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ==============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

SELECT 'Successfully added tracking_number column to orders table!' as status;
