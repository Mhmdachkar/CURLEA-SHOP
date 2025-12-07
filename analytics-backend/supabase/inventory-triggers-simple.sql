-- ==========================================
-- SIMPLIFIED INVENTORY TRIGGERS
-- No dependency on order tables
-- ==========================================

-- NOTE: This version skips order automation since your database
-- doesn't have order tables yet. You can add them later.

-- ==========================================
-- Function: Prevent negative stock
-- ==========================================
CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_quantity < 0 THEN
        RAISE EXCEPTION 'Stock quantity cannot be negative for variant %', NEW.variant_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent negative stock
DROP TRIGGER IF EXISTS trigger_prevent_negative_stock ON product_variants;
CREATE TRIGGER trigger_prevent_negative_stock
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION prevent_negative_stock();

-- ==========================================
-- Function: Update timestamp on product_variants change
-- ==========================================
CREATE OR REPLACE FUNCTION update_variant_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamps
DROP TRIGGER IF EXISTS trigger_update_variant_timestamp ON product_variants;
CREATE TRIGGER trigger_update_variant_timestamp
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_variant_timestamp();

-- ==========================================
-- Helper function: Manually deduct stock
-- (Use this when processing orders manually)
-- ==========================================
CREATE OR REPLACE FUNCTION manual_deduct_stock(
    p_product_id TEXT,
    p_size TEXT,
    p_color TEXT,
    p_quantity INTEGER,
    p_order_id TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, new_stock INTEGER) AS $$
DECLARE
    v_variant_id UUID;
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Find the variant
    SELECT id, stock_quantity 
    INTO v_variant_id, v_current_stock
    FROM product_variants
    WHERE product_id = p_product_id
      AND size = p_size
      AND (color = p_color OR (color IS NULL AND p_color IS NULL))
    LIMIT 1;
    
    -- Check if variant exists
    IF v_variant_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Variant not found', 0;
        RETURN;
    END IF;
    
    -- Check stock
    IF v_current_stock < p_quantity THEN
        RETURN QUERY SELECT FALSE, 
            format('Insufficient stock: requested %s, available %s', p_quantity, v_current_stock),
            v_current_stock;
        RETURN;
    END IF;
    
    -- Deduct stock
    UPDATE product_variants
    SET stock_quantity = stock_quantity - p_quantity
    WHERE id = v_variant_id
    RETURNING stock_quantity INTO v_new_stock;
    
    -- Log the movement
    INSERT INTO inventory_movements (
        variant_id,
        movement_type,
        quantity,
        previous_stock,
        new_stock,
        order_id,
        notes,
        created_by
    ) VALUES (
        v_variant_id,
        'sale',
        -p_quantity,
        v_current_stock,
        v_new_stock,
        p_order_id,
        COALESCE(p_notes, 'Manual deduction'),
        'manual'
    );
    
    RETURN QUERY SELECT TRUE, 'Stock deducted successfully', v_new_stock;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Helper function: Manually add stock
-- (Use this for restocking)
-- ==========================================
CREATE OR REPLACE FUNCTION manual_add_stock(
    p_product_id TEXT,
    p_size TEXT,
    p_color TEXT,
    p_quantity INTEGER,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, new_stock INTEGER) AS $$
DECLARE
    v_variant_id UUID;
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Find the variant
    SELECT id, stock_quantity 
    INTO v_variant_id, v_current_stock
    FROM product_variants
    WHERE product_id = p_product_id
      AND size = p_size
      AND (color = p_color OR (color IS NULL AND p_color IS NULL))
    LIMIT 1;
    
    -- Check if variant exists
    IF v_variant_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Variant not found', 0;
        RETURN;
    END IF;
    
    -- Add stock
    UPDATE product_variants
    SET stock_quantity = stock_quantity + p_quantity
    WHERE id = v_variant_id
    RETURNING stock_quantity INTO v_new_stock;
    
    -- Log the movement
    INSERT INTO inventory_movements (
        variant_id,
        movement_type,
        quantity,
        previous_stock,
        new_stock,
        notes,
        created_by
    ) VALUES (
        v_variant_id,
        'restock',
        p_quantity,
        v_current_stock,
        v_new_stock,
        COALESCE(p_notes, 'Manual restock'),
        'manual'
    );
    
    RETURN QUERY SELECT TRUE, 'Stock added successfully', v_new_stock;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMMENTS
-- ==========================================
COMMENT ON FUNCTION prevent_negative_stock() IS 'Prevents stock quantity from going negative';
COMMENT ON FUNCTION update_variant_timestamp() IS 'Automatically updates the updated_at timestamp';
COMMENT ON FUNCTION manual_deduct_stock(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT) IS 'Manually deduct stock for orders (call this when processing orders)';
COMMENT ON FUNCTION manual_add_stock(TEXT, TEXT, TEXT, INTEGER, TEXT) IS 'Manually add stock for restocking';

-- ==========================================
-- SUCCESS
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '✅ Inventory triggers created successfully!';
    RAISE NOTICE '💡 Use manual_deduct_stock() function to deduct inventory when processing orders';
    RAISE NOTICE '💡 Use manual_add_stock() function to restock inventory';
END $$;
