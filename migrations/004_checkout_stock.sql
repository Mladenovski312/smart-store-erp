-- ==============================================================================
-- Migration: Add Atomic Stock Subtraction for Checkout
-- Description: Creates a secure RPC function that safely deducts stock for 
--              multiple items in a single atomic transaction. Important to 
--              prevent race conditions (overselling) during checkout.
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ==============================================================================

-- We use JSONB so the frontend can send an array of { id: "product-uuid", quantity: 2 }
CREATE OR REPLACE FUNCTION process_checkout_stock(items JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as the admin so public users can subtract stock safely
AS $$
DECLARE
    item RECORD;
    current_stock INTEGER;
BEGIN
    -- Loop through each item in the JSON array
    FOR item IN SELECT * FROM jsonb_to_recordset(items) AS x(id UUID, quantity INTEGER)
    LOOP
        -- Check current stock and lock the row for update (prevents race conditions)
        SELECT stock_quantity INTO current_stock
        FROM products 
        WHERE id = item.id
        FOR UPDATE;

        IF current_stock IS NULL THEN
            RAISE EXCEPTION 'Product % not found', item.id;
        END IF;

        IF current_stock < item.quantity THEN
            RAISE EXCEPTION 'Not enough stock for product % (Requested: %, Available: %)', item.id, item.quantity, current_stock;
        END IF;

        -- Deduct the stock
        UPDATE products
        SET stock_quantity = stock_quantity - item.quantity,
            updated_at = NOW()
        WHERE id = item.id;
    END LOOP;

    RETURN TRUE;
END;
$$;

-- Grant execute permission to the public (anon) and authenticated users so they can checkout
GRANT EXECUTE ON FUNCTION process_checkout_stock(JSONB) TO anon, authenticated;

SELECT 'Successfully created atomic stock subtraction function for checkout!' as status;
