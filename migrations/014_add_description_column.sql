-- Migration: Add description column to products table
-- Run this in your Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN products.description IS 'Product description shown on the product detail page (Опис)';
