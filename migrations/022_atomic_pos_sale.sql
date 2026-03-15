-- ==============================================================================
-- Migration: Atomic POS Sale (stock deduction + sale recording in one transaction)
-- Fixes: race condition where sale could be recorded but stock deduction could fail
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ==============================================================================

CREATE OR REPLACE FUNCTION record_sale_atomic(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_name TEXT;
    v_purchase_price NUMERIC;
    v_selling_price NUMERIC;
    v_stock INTEGER;
    v_total NUMERIC;
    v_profit NUMERIC;
    v_sale_id UUID;
BEGIN
    -- Lock the product row and get current data
    SELECT name, purchase_price, selling_price, stock_quantity
    INTO v_name, v_purchase_price, v_selling_price, v_stock
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    IF v_name IS NULL THEN
        RAISE EXCEPTION 'Product % not found', p_product_id;
    END IF;

    IF v_stock < p_quantity THEN
        RAISE EXCEPTION 'Not enough stock for product % (Requested: %, Available: %)',
            p_product_id, p_quantity, v_stock;
    END IF;

    -- Calculate totals from real DB prices
    v_total := v_selling_price * p_quantity;
    v_profit := (v_selling_price - v_purchase_price) * p_quantity;

    -- Deduct stock
    UPDATE products
    SET stock_quantity = stock_quantity - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;

    -- Insert sale record
    INSERT INTO sales (product_id, product_name, quantity_sold, sold_price, profit)
    VALUES (p_product_id, v_name, p_quantity, v_total, v_profit)
    RETURNING id INTO v_sale_id;

    -- Return the sale details
    RETURN jsonb_build_object(
        'id', v_sale_id,
        'product_id', p_product_id,
        'product_name', v_name,
        'quantity_sold', p_quantity,
        'sold_price', v_total,
        'profit', v_profit
    );
END;
$$;

GRANT EXECUTE ON FUNCTION record_sale_atomic(UUID, INTEGER) TO authenticated;

SELECT 'Successfully created atomic POS sale function!' as status;
