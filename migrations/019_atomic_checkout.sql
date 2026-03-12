-- ==============================================================================
-- Migration: Atomic Checkout (stock deduction + order creation in one transaction)
-- Fixes: AUDIT.md #5 — stock deduction and order insert are no longer separate.
--        Also enforces server-side price validation (AUDIT.md #3).
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ==============================================================================

CREATE OR REPLACE FUNCTION create_order_atomic(
    p_order_id UUID,
    p_items JSONB,          -- [{ "id": "uuid", "quantity": 2, "name": "...", "imageUrl": "..." }]
    p_customer_name TEXT,
    p_customer_first_name TEXT,
    p_customer_last_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_delivery_city TEXT,
    p_delivery_address TEXT,
    p_note TEXT DEFAULT NULL,
    p_payment_method TEXT DEFAULT 'cod'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item RECORD;
    current_stock INTEGER;
    real_price NUMERIC;
    verified_items JSONB := '[]'::JSONB;
    calculated_subtotal NUMERIC := 0;
BEGIN
    -- Loop through each item: verify stock, get real price, deduct stock
    FOR item IN SELECT * FROM jsonb_to_recordset(p_items)
        AS x(id UUID, quantity INTEGER, name TEXT, "imageUrl" TEXT)
    LOOP
        -- Lock the product row and get real price + stock
        SELECT stock_quantity, selling_price
        INTO current_stock, real_price
        FROM products
        WHERE id = item.id
        FOR UPDATE;

        IF current_stock IS NULL THEN
            RAISE EXCEPTION 'Product % not found', item.id;
        END IF;

        IF current_stock < item.quantity THEN
            RAISE EXCEPTION 'Not enough stock for product % (Requested: %, Available: %)',
                item.id, item.quantity, current_stock;
        END IF;

        -- Deduct stock
        UPDATE products
        SET stock_quantity = stock_quantity - item.quantity,
            updated_at = NOW()
        WHERE id = item.id;

        -- Build verified item with real DB price
        verified_items := verified_items || jsonb_build_object(
            'productId', item.id,
            'name', item.name,
            'price', real_price,
            'quantity', item.quantity,
            'imageUrl', item."imageUrl"
        );

        calculated_subtotal := calculated_subtotal + (real_price * item.quantity);
    END LOOP;

    -- Insert the order with server-verified prices
    INSERT INTO orders (
        id, customer_name, customer_first_name, customer_last_name,
        customer_email, customer_phone, delivery_city, delivery_address,
        note, items, subtotal, total, status, payment_method
    ) VALUES (
        p_order_id, p_customer_name, p_customer_first_name, p_customer_last_name,
        p_customer_email, p_customer_phone, p_delivery_city, p_delivery_address,
        p_note, verified_items, calculated_subtotal, calculated_subtotal,
        'pending', p_payment_method
    );

    -- Return the verified items and subtotal so the frontend can use them for display/email
    RETURN jsonb_build_object(
        'items', verified_items,
        'subtotal', calculated_subtotal
    );
END;
$$;

GRANT EXECUTE ON FUNCTION create_order_atomic(UUID, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

SELECT 'Successfully created atomic checkout function!' as status;
