-- ==============================================================================
-- Migration: Add Atomic Stock Restoration for Order Cancellation
-- Description: Creates a secure RPC function that safely restores stock for
--              all items in a cancelled order in a single atomic transaction.
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- NOTE: Run migration_checkout_stock.sql first if you haven't already.
-- ==============================================================================

-- Mirror image of process_checkout_stock — adds stock back instead of subtracting.
CREATE OR REPLACE FUNCTION restore_order_stock(items JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as admin so authenticated employees can update stock
AS $$
DECLARE
    item RECORD;
BEGIN
    -- Loop through each item and restore its quantity
    FOR item IN SELECT * FROM jsonb_to_recordset(items) AS x(id UUID, quantity INTEGER)
    LOOP
        UPDATE products
        SET stock_quantity = stock_quantity + item.quantity,
            updated_at = NOW()
        WHERE id = item.id;
    END LOOP;

    RETURN TRUE;
END;
$$;

-- Grant execute to authenticated employees/admins only (not public anon)
GRANT EXECUTE ON FUNCTION restore_order_stock(JSONB) TO authenticated;

SELECT 'Successfully created atomic stock restoration function for order cancellation!' as status;
