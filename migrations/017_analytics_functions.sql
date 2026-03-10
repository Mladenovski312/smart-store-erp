-- ============================================================
-- Analytics RPC Functions — Migration 017
-- ============================================================

-- Revenue by day (for Revenue Over Time chart)
CREATE OR REPLACE FUNCTION get_revenue_by_day(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE(
  day DATE,
  online_revenue NUMERIC,
  pos_revenue NUMERIC,
  order_count BIGINT
) AS $$
  SELECT
    DATE(created_at) as day,
    SUM(CASE WHEN source = 'online' THEN total ELSE 0 END),
    SUM(CASE WHEN source = 'pos' THEN total ELSE 0 END),
    COUNT(*)
  FROM orders
  WHERE status = 'completed'
    AND DATE(created_at) BETWEEN start_date AND end_date
  GROUP BY DATE(created_at)
  ORDER BY day;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- Category scorecard (Replaces Brand scorecard)
CREATE OR REPLACE FUNCTION get_category_scorecard(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE(
  category TEXT,
  revenue NUMERIC,
  units_sold BIGINT,
  avg_margin_pct NUMERIC,
  turnover_ratio NUMERIC
) AS $$
  WITH extracted_items AS (
    SELECT 
      o.id as order_id,
      (item->>'productId')::UUID as product_id,
      (item->>'quantity')::INTEGER as quantity,
      (item->>'price')::NUMERIC as unit_price
    FROM orders o
    CROSS JOIN jsonb_array_elements(o.items) as item
    WHERE o.status = 'completed'
      AND DATE(o.created_at) BETWEEN start_date AND end_date
  )
  SELECT
    p.category,
    SUM(ei.unit_price * ei.quantity) as revenue,
    SUM(ei.quantity) as units_sold,
    ROUND(
      AVG((ei.unit_price - p.purchase_price) / NULLIF(ei.unit_price, 0) * 100),
      1
    ) as avg_margin_pct,
    ROUND(
      SUM(ei.unit_price * ei.quantity) /
      NULLIF(SUM(p.purchase_price * p.stock_quantity), 0),
      2
    ) as turnover_ratio
  FROM extracted_items ei
  JOIN products p ON p.id = ei.product_id
  GROUP BY p.category
  ORDER BY revenue DESC;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- Aging stock report
CREATE OR REPLACE FUNCTION get_aging_stock()
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  category TEXT,
  category_name TEXT,
  days_since_sold INTEGER,
  stock_qty INTEGER,
  stock_value NUMERIC,
  suggested_action TEXT
) AS $$
  SELECT
    p.id,
    p.name,
    p.category,
    c.name as category_name,
    COALESCE(
      EXTRACT(DAY FROM NOW() - p.last_sold_at)::INTEGER,
      999
    ) as days_since_sold,
    p.stock_quantity,
    ROUND(p.purchase_price * p.stock_quantity, 2) as stock_value,
    CASE
      WHEN p.last_sold_at IS NULL OR NOW() - p.last_sold_at > INTERVAL '180 days'
        THEN 'Clearance'
      WHEN NOW() - p.last_sold_at > INTERVAL '90 days'
        THEN 'Bundle Deal'
      ELSE 'Monitor'
    END as suggested_action
  FROM products p
  LEFT JOIN categories c ON c.name = p.category
  WHERE p.stock_quantity > 0
    AND (
      p.last_sold_at IS NULL
      OR NOW() - p.last_sold_at > INTERVAL '90 days'
    )
  ORDER BY days_since_sold DESC;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- Hourly sales heatmap
CREATE OR REPLACE FUNCTION get_hourly_sales_heatmap(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE(
  day_of_week INTEGER,  -- 0=Monday, 6=Sunday
  hour_of_day INTEGER,
  total_sales NUMERIC,
  order_count BIGINT
) AS $$
  SELECT
    EXTRACT(DOW FROM created_at)::INTEGER as day_of_week,
    EXTRACT(HOUR FROM created_at)::INTEGER as hour_of_day,
    SUM(total),
    COUNT(*)
  FROM orders
  WHERE status = 'completed'
    AND DATE(created_at) BETWEEN start_date AND end_date
  GROUP BY day_of_week, hour_of_day
  ORDER BY day_of_week, hour_of_day;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
