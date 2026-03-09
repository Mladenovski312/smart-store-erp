-- ============================================================
-- Gift Finder Schema — Migration 010
-- Adds age_range column needed by AI Gift Finder
-- ============================================================

-- Age range for Gift Finder matching
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS age_range VARCHAR(20);
-- Examples: '0-2', '3-5', '6-10', '10+', 'all'
