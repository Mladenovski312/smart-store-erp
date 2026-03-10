-- ============================================================
-- Интер Стар Џамбо — Analytics & Gift Finder Schema
-- Migration 016
-- Run after: 015_fix_slug_transliteration.sql
-- ============================================================

-- ── Products table additions ────────────────────────────────

-- Age range for Gift Finder matching
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS age_range VARCHAR(20);
-- Examples: '0-2', '3-5', '6-10', '10+', 'all'

-- Optional gender hint for Gift Finder (use carefully)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS gender_hint VARCHAR(10) DEFAULT 'neutral';
-- Values: 'neutral', 'girl', 'boy'

-- Reorder threshold for low stock alerts
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;

-- Last time this product was sold (updated by trigger below)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS last_sold_at TIMESTAMPTZ;

-- AI scanner tracking
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS was_ai_edited BOOLEAN DEFAULT false;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMPTZ;


-- ── Orders table additions ──────────────────────────────────

-- Track order source for online vs POS split
-- (may already exist — add IF NOT EXISTS)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'online';
-- Values: 'online', 'pos'

-- Cancellation reason for operations analytics
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;


-- ── New table: product_edits (AI scanner audit trail) ───────

CREATE TABLE IF NOT EXISTS product_edits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  field_name VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  edited_by UUID REFERENCES auth.users(id),
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_edits_product_id ON product_edits(product_id);
CREATE INDEX IF NOT EXISTS idx_product_edits_edited_at ON product_edits(edited_at);


-- ── New table: page_views (optional — conversion tracking) ──
-- Only needed for "Conversion Rate by Category" metric
-- Skip if you don't want to add client-side view tracking

CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  session_id VARCHAR(64),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  source VARCHAR(20) DEFAULT 'organic'
  -- source: 'organic', 'search', 'gift_finder', 'related'
);

CREATE INDEX IF NOT EXISTS idx_page_views_product_id ON page_views(product_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);


-- ── Trigger: update last_sold_at on order completion ────────

CREATE OR REPLACE FUNCTION update_last_sold_at()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
BEGIN
  -- Iterate through the JSON array in NEW.items
  IF NEW.status = 'completed' AND NEW.items IS NOT NULL THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
      UPDATE products
      SET last_sold_at = NOW()
      WHERE id = (item->>'productId')::UUID;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_last_sold_at ON orders;
CREATE TRIGGER trg_update_last_sold_at
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_last_sold_at();


-- ── RLS Policies ─────────────────────────────────────────────

-- product_edits: admin read/write, no public access
ALTER TABLE product_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage product_edits"
  ON product_edits
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- page_views: public insert (anonymous tracking), admin read
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert page views"
  ON page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can read page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
