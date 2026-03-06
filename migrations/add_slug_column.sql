-- Migration: Add slug column to products table for SEO-friendly URLs
-- Run this in the Supabase SQL Editor

-- 1. Add the slug column (nullable initially so we can populate it)
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Generate slugs for all existing products from their name
-- Converts to lowercase, replaces non-alphanumeric chars with hyphens,
-- collapses multiple hyphens, trims leading/trailing hyphens,
-- and appends a short ID suffix to guarantee uniqueness.
UPDATE products
SET slug = (
    SELECT
        TRIM(BOTH '-' FROM
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    LOWER(name),
                    '[^a-z0-9\-]', '-', 'g'
                ),
                '-{2,}', '-', 'g'
            )
        ) || '-' || LEFT(id::text, 8)
)
WHERE slug IS NULL;

-- 3. Now make it NOT NULL and UNIQUE
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON products (slug);

-- 4. Update RLS: slug is publicly readable (same policy as other columns)
-- No RLS changes needed — existing SELECT policies already cover all columns.
