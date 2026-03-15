-- Add quantity > 0 guard to record_sale_atomic RPC
-- This prevents negative quantities from inflating stock

CREATE OR REPLACE FUNCTION record_sale_atomic(p_product_id UUID, p_quantity INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product RECORD;
    v_stock INTEGER;
    v_sale_id UUID;
    v_profit NUMERIC;
BEGIN
    -- Guard: quantity must be positive
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than 0';
    END IF;

    -- Lock the product row
    SELECT id, name, selling_price, purchase_price, stock_quantity
    INTO v_product
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found';
    END IF;

    v_stock := v_product.stock_quantity;

    IF v_stock < p_quantity THEN
        RAISE EXCEPTION 'Not enough stock. Available: %, Requested: %', v_stock, p_quantity;
    END IF;

    -- Deduct stock
    UPDATE products
    SET stock_quantity = stock_quantity - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;

    -- Calculate profit
    v_profit := (v_product.selling_price - v_product.purchase_price) * p_quantity;

    -- Insert sale record
    INSERT INTO sales (product_id, product_name, quantity_sold, sold_price, profit)
    VALUES (p_product_id, v_product.name, p_quantity, v_product.selling_price * p_quantity, v_profit)
    RETURNING id INTO v_sale_id;

    RETURN jsonb_build_object(
        'id', v_sale_id,
        'product_id', p_product_id,
        'product_name', v_product.name,
        'quantity_sold', p_quantity,
        'sold_price', v_product.selling_price * p_quantity,
        'profit', v_profit
    );
END;
$$;
