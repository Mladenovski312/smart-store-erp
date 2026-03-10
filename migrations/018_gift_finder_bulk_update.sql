-- ============================================================
-- Gift Finder Age Range Population — Migration 018
-- ============================================================

-- Populate age_range for existing products where possible

-- Example bulk updates by category
UPDATE products SET age_range = '0-3'
WHERE category ILIKE '%бебе%' OR category ILIKE '%baby%';

UPDATE products SET age_range = '3+'
WHERE category ILIKE '%lego%' AND age_range IS NULL;

-- Add check constraint for age_range format
ALTER TABLE products
  ADD CONSTRAINT chk_age_range
  CHECK (age_range ~ '^\d+(-\d+|\+)?$' OR age_range = 'all' OR age_range IS NULL);
