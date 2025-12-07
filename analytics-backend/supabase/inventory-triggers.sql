-- ==========================================
-- INVENTORY AUTOMATION TRIGGERS
-- Auto-deduct stock when orders are placed
-- ==========================================

-- Function: Deduct inventory when order items are created
CREATE OR REPLACE FUNCTION deduct_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
    v_variant_id UUID;
    v_current_stock INTEGER;
    v_variant_size TEXT;
    v_variant_color TEXT;
BEGIN
    -- Extract size and color from order item
    -- Assuming order_items has size and color columns or variant info
    v_variant_size := COALESCE(NEW.size, 'Standard');
    v_variant_color := NEW.color;
    
    -- Find the matching variant
    SELECT id, stock_quantity 
    INTO v_variant_id, v_current_stock
    FROM product_variants
    WHERE product_id = NEW.product_id
      AND size = v_variant_size
      AND (color = v_variant_color OR (color IS NULL AND v_variant_color IS NULL))
    LIMIT 1;
    
    -- If variant not found, try without color/size matching (for accessories)
    IF v_variant_id IS NULL THEN
        SELECT id, stock_quantity 
        INTO v_variant_id, v_current_stock
        FROM product_variants
        WHERE product_id = NEW.product_id
        LIMIT 1;
    END IF;
    
    -- If still not found, log error but don't fail the order
    IF v_variant_id IS NULL THEN
        RAISE WARNING 'No variant found for product_id: %, size: %, color: %', 
            NEW.product_id, v_variant_size, v_variant_color;
        RETURN NEW;
    END IF;
    
    -- Check if sufficient stock
    IF v_current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product %: requested %, available %', 
            NEW.product_id, NEW.quantity, v_current_stock;
    END IF;
    
    -- Deduct stock
    UPDATE product_variants
    SET stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = v_variant_id;
    
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
        -NEW.quantity,
        v_current_stock,
        v_current_stock - NEW.quantity,
        NEW.order_id,
        'Automatic deduction from order',
        'system'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on order_items table
DROP TRIGGER IF EXISTS trigger_deduct_inventory ON public.order_items;
CREATE TRIGGER trigger_deduct_inventory
    AFTER INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION deduct_inventory_on_order();

-- ==========================================
-- Function: Restore inventory on order cancellation
-- ==========================================
CREATE OR REPLACE FUNCTION restore_inventory_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
    v_variant_id UUID;
    v_current_stock INTEGER;
    v_variant_size TEXT;
    v_variant_color TEXT;
BEGIN
    -- Only restore if order status changed to 'cancelled' or 'refunded'
    IF NEW.status IN ('cancelled', 'refunded') AND OLD.status NOT IN ('cancelled', 'refunded') THEN
        
        -- Get all order items for this order
        FOR v_variant_id, v_variant_size, v_variant_color IN
            SELECT pv.id, oi.size, oi.color
            FROM public.order_items oi
            JOIN product_variants pv ON pv.product_id = oi.product_id
            WHERE oi.order_id = NEW.id
              AND pv.size = COALESCE(oi.size, 'Standard')
              AND (pv.color = oi.color OR (pv.color IS NULL AND oi.color IS NULL))
        LOOP
            -- Get current stock
            SELECT stock_quantity INTO v_current_stock
            FROM product_variants
            WHERE id = v_variant_id;
            
            -- Restore stock
            UPDATE product_variants
            SET stock_quantity = stock_quantity + (
                SELECT quantity FROM public.order_items oi
                WHERE oi.order_id = NEW.id
                  AND oi.size = v_variant_size
                  AND oi.color = v_variant_color
                LIMIT 1
            ),
            updated_at = NOW()
            WHERE id = v_variant_id;
            
            -- Log the restoration
            INSERT INTO inventory_movements (
                variant_id,
                movement_type,
                quantity,
                previous_stock,
                new_stock,
                order_id,
                notes,
                created_by
            ) SELECT
                v_variant_id,
                'return',
                quantity,
                v_current_stock,
                v_current_stock + quantity,
                NEW.id,
                'Stock restored due to order ' || NEW.status,
                'system'
            FROM public.order_items
            WHERE order_id = NEW.id
              AND size = v_variant_size
              AND color = v_variant_color
            LIMIT 1;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_restore_inventory ON public.orders;
CREATE TRIGGER trigger_restore_inventory
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION restore_inventory_on_cancel();

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
-- Verification: Test the triggers (optional)
-- ==========================================

-- To test, uncomment and run:
/*
-- Test 1: Check if triggers exist
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%inventory%'
ORDER BY trigger_name;

-- Test 2: Simulate an order (DO NOT RUN IN PRODUCTION)
-- INSERT INTO order_items (order_id, product_id, size, color, quantity, price)
-- VALUES ('TEST-ORDER-001', 'dream curl-jumbo', 'Jumbo', 'Mulberry', 1, 22.99);

-- Test 3: Check inventory movement log
-- SELECT * FROM inventory_movements ORDER BY created_at DESC LIMIT 10;
*/

COMMENT ON FUNCTION deduct_inventory_on_order() IS 'Automatically deducts stock when order items are inserted';
COMMENT ON FUNCTION restore_inventory_on_cancel() IS 'Restores stock when orders are cancelled or refunded';
COMMENT ON FUNCTION prevent_negative_stock() IS 'Prevents stock quantity from going negative';
COMMENT ON FUNCTION update_variant_timestamp() IS 'Automatically updates the updated_at timestamp';
