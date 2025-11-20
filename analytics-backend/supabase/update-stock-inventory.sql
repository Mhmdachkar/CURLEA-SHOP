-- =====================================================
-- CURLEA STOCK & INVENTORY MANAGEMENT SYSTEM
-- =====================================================
-- This script creates a complete inventory management system for CURLEA products
-- It handles variant-based stock tracking and automatic inventory reduction on orders
--
-- IMPORTANT: This script is SAFE TO RE-RUN!
-- - Uses CREATE TABLE IF NOT EXISTS
-- - Uses CREATE INDEX IF NOT EXISTS  
-- - Uses INSERT ... ON CONFLICT DO UPDATE (UPSERT)
-- - Will update existing variants instead of creating duplicates
-- - Creates new variants if they don't exist
--
-- If you already have some data in product_variants table, this script will:
-- ✅ Update existing variants with new stock quantities
-- ✅ Add new variants that don't exist yet
-- ✅ Not create duplicate entries
--
-- NOTE: Hair accessories use ON CONFLICT (sku) since they have unique SKUs
--       Other products use ON CONFLICT (product_id, size, color)
--       This prevents duplicate SKU errors when re-running the script

-- =====================================================
-- 1. CREATE OR UPDATE PRODUCT VARIANTS TABLE
-- =====================================================
-- This table stores individual variants (size + color combinations) with their stock levels

-- Drop existing table if you want to start fresh (CAUTION: This deletes all data!)
-- Uncomment the next line if you want to recreate the table from scratch:
-- DROP TABLE IF EXISTS product_variants CASCADE;

-- Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL, -- Links to products table (e.g., 'dreamcurl-midi')
    variant_name TEXT NOT NULL, -- Full variant name (e.g., 'Midi - Purple')
    size TEXT NOT NULL, -- Size: 'Large', 'Jumbo', 'Midi', 'Small', 'Mini', 'Original'
    color TEXT, -- Color: 'Purple', 'Pink', 'Brown', 'Green', 'Candy', 'Latte', 'Mulberry', 'Olive'
    sku TEXT UNIQUE, -- SKU for inventory tracking
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0, -- For pending orders/carts
    available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
    price NUMERIC(10,2), -- Variant-specific price (if different from base)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_variant_per_product UNIQUE(product_id, size, color)
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_variants_size ON product_variants(size);
CREATE INDEX IF NOT EXISTS idx_variants_available ON product_variants(available_quantity);

-- =====================================================
-- 2. UPSERT CURRENT STOCK LEVELS
-- =====================================================
-- This section uses INSERT ... ON CONFLICT to update existing records or insert new ones

-- -----------------------------------------------
-- FULL SETS (Total: 156 units)
-- -----------------------------------------------

-- Large Full Sets (27 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('dreamcurl-original', 'Original Large - Purple', 'Large', 'Purple', 'DC-LARGE-PURPLE', 6, 22.99),
('dreamcurl-original', 'Original Large - Pink', 'Large', 'Pink', 'DC-LARGE-PINK', 2, 22.99),
('dreamcurl-original', 'Original Large - Brown', 'Large', 'Brown', 'DC-LARGE-BROWN', 10, 22.99),
('dreamcurl-original', 'Original Large - Green', 'Large', 'Green', 'DC-LARGE-GREEN', 9, 22.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Jumbo Full Sets (44 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('dreamcurl-jumbo', 'DreamCurl Jumbo - Brown', 'Jumbo', 'Brown', 'DC-JUMBO-BROWN', 10, 22.99),
('dreamcurl-jumbo', 'DreamCurl Jumbo - Purple', 'Jumbo', 'Purple', 'DC-JUMBO-PURPLE', 11, 22.99),
('dreamcurl-jumbo', 'DreamCurl Jumbo - Green', 'Jumbo', 'Green', 'DC-JUMBO-GREEN', 11, 22.99),
('dreamcurl-jumbo', 'DreamCurl Jumbo - Pink', 'Jumbo', 'Pink', 'DC-JUMBO-PINK', 12, 22.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Midi Full Sets (46 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('dreamcurl-midi', 'DreamCurl Midi - Green', 'Midi', 'Green', 'DC-MIDI-GREEN', 11, 22.99),
('dreamcurl-midi', 'DreamCurl Midi - Purple', 'Midi', 'Purple', 'DC-MIDI-PURPLE', 12, 22.99),
('dreamcurl-midi', 'DreamCurl Midi - Pink', 'Midi', 'Pink', 'DC-MIDI-PINK', 12, 22.99),
('dreamcurl-midi', 'DreamCurl Midi - Brown', 'Midi', 'Brown', 'DC-MIDI-BROWN', 11, 22.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Small Full Sets (39 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('zero-heat-mini', 'Zero Heat Small - Purple', 'Small', 'Purple', 'ZH-SMALL-PURPLE', 9, 22.99),
('zero-heat-mini', 'Zero Heat Small - Brown', 'Small', 'Brown', 'ZH-SMALL-BROWN', 8, 22.99),
('zero-heat-mini', 'Zero Heat Small - Pink', 'Small', 'Pink', 'ZH-SMALL-PINK', 11, 22.99),
('zero-heat-mini', 'Zero Heat Small - Green', 'Small', 'Green', 'ZH-SMALL-GREEN', 11, 22.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- -----------------------------------------------
-- SINGLE SETS (Total: 37 units)
-- -----------------------------------------------

-- Mini Single Sets (11 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('zero-heat-mini', 'Zero Heat Mini - Pink', 'Mini', 'Pink', 'ZH-MINI-PINK-SINGLE', 2, 16.99),
('zero-heat-mini', 'Zero Heat Mini - Brown', 'Mini', 'Brown', 'ZH-MINI-BROWN-SINGLE', 3, 16.99),
('zero-heat-mini', 'Zero Heat Mini - Purple', 'Mini', 'Purple', 'ZH-MINI-PURPLE-SINGLE', 3, 16.99),
('zero-heat-mini', 'Zero Heat Mini - Green', 'Mini', 'Green', 'ZH-MINI-GREEN-SINGLE', 3, 16.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Midi Single Sets (11 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('dreamcurl-midi', 'DreamCurl Midi Single - Green', 'Midi Single', 'Green', 'DC-MIDI-GREEN-SINGLE', 3, 16.99),
('dreamcurl-midi', 'DreamCurl Midi Single - Purple', 'Midi Single', 'Purple', 'DC-MIDI-PURPLE-SINGLE', 2, 16.99),
('dreamcurl-midi', 'DreamCurl Midi Single - Pink', 'Midi Single', 'Pink', 'DC-MIDI-PINK-SINGLE', 3, 16.99),
('dreamcurl-midi', 'DreamCurl Midi Single - Brown', 'Midi Single', 'Brown', 'DC-MIDI-BROWN-SINGLE', 3, 16.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Original Single Sets (6 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('dreamcurl-original', 'Original Single - Green', 'Original', 'Green', 'DC-ORIGINAL-GREEN-SINGLE', 3, 16.99),
('dreamcurl-original', 'Original Single - Brown', 'Original', 'Brown', 'DC-ORIGINAL-BROWN-SINGLE', 1, 16.99),
('dreamcurl-original', 'Original Single - Purple', 'Original', 'Purple', 'DC-ORIGINAL-PURPLE-SINGLE', 2, 16.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Jumbo Single Sets (9 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('dreamcurl-jumbo', 'DreamCurl Jumbo Single - Brown', 'Jumbo Single', 'Brown', 'DC-JUMBO-BROWN-SINGLE', 2, 16.99),
('dreamcurl-jumbo', 'DreamCurl Jumbo Single - Pink', 'Jumbo Single', 'Pink', 'DC-JUMBO-PINK-SINGLE', 2, 16.99),
('dreamcurl-jumbo', 'DreamCurl Jumbo Single - Purple', 'Jumbo Single', 'Purple', 'DC-JUMBO-PURPLE-SINGLE', 3, 16.99),
('dreamcurl-jumbo', 'DreamCurl Jumbo Single - Green', 'Jumbo Single', 'Green', 'DC-JUMBO-GREEN-SINGLE', 2, 16.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- -----------------------------------------------
-- HEAT BUN BONS (Total: 24 units)
-- -----------------------------------------------

-- Mini Bun Bons (9 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('peau-de-soie-bonnet', 'Heat Bun Bon Mini - Purple', 'Mini', 'Purple', 'HBB-MINI-PURPLE', 3, 12.99),
('peau-de-soie-bonnet', 'Heat Bun Bon Mini - Green', 'Mini', 'Green', 'HBB-MINI-GREEN', 3, 12.99),
('peau-de-soie-bonnet', 'Heat Bun Bon Mini - Brown', 'Mini', 'Brown', 'HBB-MINI-BROWN', 3, 12.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Midi Bun Bons (3 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('peau-de-soie-bonnet', 'Heat Bun Bon Midi - Green', 'Midi Bonnet', 'Green', 'HBB-MIDI-GREEN', 1, 12.99),
('peau-de-soie-bonnet', 'Heat Bun Bon Midi - Brown', 'Midi Bonnet', 'Brown', 'HBB-MIDI-BROWN', 2, 12.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Original Bun Bons (3 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('peau-de-soie-bonnet', 'Heat Bun Bon Original - Green', 'Original Bonnet', 'Green', 'HBB-ORIGINAL-GREEN', 1, 12.99),
('peau-de-soie-bonnet', 'Heat Bun Bon Original - Brown', 'Original Bonnet', 'Brown', 'HBB-ORIGINAL-BROWN', 2, 12.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Jumbo Bun Bons (9 units)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('peau-de-soie-bonnet', 'Heat Bun Bon Jumbo - Brown', 'Jumbo Bonnet', 'Brown', 'HBB-JUMBO-BROWN', 3, 12.99),
('peau-de-soie-bonnet', 'Heat Bun Bon Jumbo - Purple', 'Jumbo Bonnet', 'Purple', 'HBB-JUMBO-PURPLE', 2, 12.99),
('peau-de-soie-bonnet', 'Heat Bun Bon Jumbo - Pink', 'Jumbo Bonnet', 'Pink', 'HBB-JUMBO-PINK', 1, 12.99),
('peau-de-soie-bonnet', 'Heat Bun Bon Jumbo - Green', 'Jumbo Bonnet', 'Green', 'HBB-JUMBO-GREEN', 3, 12.99)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();

-- -----------------------------------------------
-- HAIR ACCESSORIES (Total: 253 units)
-- -----------------------------------------------

-- Scrunchies (42 pcs)
-- Use ON CONFLICT (sku) since SKU is unique and more specific
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('scrunchies-7pc', 'Scrunchies 5 Tone Satin 5pcs Set', 'One Size', NULL, 'SCRUNCHIE-5TONE-5PCS', 42, 14.99)
ON CONFLICT (sku) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    product_id = EXCLUDED.product_id,
    size = EXCLUDED.size,
    color = EXCLUDED.color,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Korean Hair Claws (40 sets)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('curly-clip-2', 'Korean Hair Claws 10pcs Set', 'One Size', NULL, 'KOREAN-CLAW-10PCS', 40, 14.99)
ON CONFLICT (sku) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    product_id = EXCLUDED.product_id,
    size = EXCLUDED.size,
    color = EXCLUDED.color,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Flat Claw Clips (149 pcs)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('curly-clip-1', 'Flat Claw Clips 9pcs Set', 'One Size', NULL, 'FLAT-CLAW-9PCS', 149, 14.99)
ON CONFLICT (sku) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    product_id = EXCLUDED.product_id,
    size = EXCLUDED.size,
    color = EXCLUDED.color,
    price = EXCLUDED.price,
    updated_at = NOW();

-- Bow Tie Scrunchies (22 sets)
INSERT INTO product_variants (product_id, variant_name, size, color, sku, stock_quantity, price) VALUES
('bow-tie-scrunchies', 'Bow Tie Scrunchies 7pcs Set', 'One Size', NULL, 'BOW-SCRUNCHIE-7PCS', 22, 14.99)
ON CONFLICT (sku) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    product_id = EXCLUDED.product_id,
    size = EXCLUDED.size,
    color = EXCLUDED.color,
    price = EXCLUDED.price,
    updated_at = NOW();

-- =====================================================
-- 3. CREATE INVENTORY MOVEMENT LOG TABLE
-- =====================================================
-- Track all stock movements (sales, restocks, adjustments)

CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'restock', 'adjustment', 'return', 'damage')),
    quantity INTEGER NOT NULL, -- Positive for additions, negative for reductions
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    order_id UUID, -- Reference to order if it's a sale
    notes TEXT,
    created_by TEXT, -- User/system that made the change
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_id ON inventory_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_order_id ON inventory_movements(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- =====================================================
-- 4. CREATE FUNCTION TO REDUCE STOCK ON ORDER
-- =====================================================
-- This function automatically reduces inventory when an order is completed

CREATE OR REPLACE FUNCTION reduce_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
    order_items JSONB;
    item JSONB;
    variant RECORD;
    item_name TEXT;
    item_variant TEXT;
    item_quantity INTEGER;
BEGIN
    -- Only process when order status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Get items from order
        order_items := NEW.items;
        
        -- If no items, skip
        IF order_items IS NULL THEN
            RETURN NEW;
        END IF;
        
        -- Loop through each item in the order
        FOR item IN SELECT * FROM jsonb_array_elements(order_items)
        LOOP
            -- Extract item details
            item_name := item->>'name';
            item_variant := item->>'variant';
            item_quantity := COALESCE((item->>'quantity')::INTEGER, 1);
            
            -- Try to find matching variant by variant name or by parsing size/color
            SELECT * INTO variant
            FROM product_variants
            WHERE 
                is_active = true
                AND (
                    -- Match by full variant name
                    variant_name ILIKE '%' || COALESCE(item_variant, '') || '%'
                    -- Or try to match by product name and size/color in variant
                    OR (
                        item_variant IS NOT NULL 
                        AND (
                            (size ILIKE '%' || item_variant || '%') 
                            OR (color ILIKE '%' || item_variant || '%')
                        )
                    )
                )
            ORDER BY 
                -- Prioritize exact matches
                CASE WHEN variant_name = item_variant THEN 1 ELSE 2 END,
                available_quantity DESC
            LIMIT 1;
            
            -- If variant found, reduce stock
            IF FOUND THEN
                -- Check if enough stock available
                IF variant.available_quantity >= item_quantity THEN
                    -- Reduce stock
                    UPDATE product_variants
                    SET 
                        stock_quantity = stock_quantity - item_quantity,
                        updated_at = NOW()
                    WHERE id = variant.id;
                    
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
                        variant.id,
                        'sale',
                        -item_quantity,
                        variant.stock_quantity,
                        variant.stock_quantity - item_quantity,
                        NEW.id,
                        'Automatic reduction from order: ' || NEW.order_id,
                        'system'
                    );
                ELSE
                    -- Log warning but don't block the order
                    RAISE WARNING 'Insufficient stock for variant % (Order: %). Available: %, Requested: %',
                        variant.variant_name, NEW.order_id, variant.available_quantity, item_quantity;
                END IF;
            ELSE
                -- Log warning if variant not found
                RAISE WARNING 'Variant not found for item: % - % (Order: %)', item_name, item_variant, NEW.order_id;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREATE TRIGGER ON ORDERS TABLE
-- =====================================================
-- Automatically reduce inventory when order is completed

DROP TRIGGER IF EXISTS trigger_reduce_inventory ON orders;

CREATE TRIGGER trigger_reduce_inventory
    AFTER INSERT OR UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION reduce_inventory_on_order();

-- =====================================================
-- 6. CREATE TRIGGER ON PUBLIC.ORDERS TABLE (Stripe Orders)
-- =====================================================
-- Also reduce inventory for Stripe orders

CREATE OR REPLACE FUNCTION reduce_inventory_on_public_order()
RETURNS TRIGGER AS $$
DECLARE
    order_item RECORD;
    variant RECORD;
BEGIN
    -- Only process when order status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Loop through order_items for this order
        FOR order_item IN 
            SELECT * FROM public.order_items WHERE order_id = NEW.id
        LOOP
            -- Try to find matching variant
            SELECT * INTO variant
            FROM product_variants
            WHERE 
                is_active = true
                AND (
                    -- Match by variant name
                    variant_name ILIKE '%' || COALESCE(order_item.variant, '') || '%'
                    -- Or try to match by product name and size/color
                    OR (
                        order_item.product_name ILIKE '%' || size || '%'
                        OR order_item.product_name ILIKE '%' || COALESCE(color, '') || '%'
                        OR (
                            order_item.variant IS NOT NULL 
                            AND (
                                (size ILIKE '%' || order_item.variant || '%') 
                                OR (COALESCE(color, '') ILIKE '%' || order_item.variant || '%')
                            )
                        )
                    )
                )
            ORDER BY 
                -- Prioritize exact matches
                CASE WHEN variant_name = order_item.variant THEN 1 ELSE 2 END,
                available_quantity DESC
            LIMIT 1;
            
            -- If variant found, reduce stock
            IF FOUND THEN
                IF variant.available_quantity >= order_item.quantity THEN
                    -- Reduce stock
                    UPDATE product_variants
                    SET 
                        stock_quantity = stock_quantity - order_item.quantity,
                        updated_at = NOW()
                    WHERE id = variant.id;
                    
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
                        variant.id,
                        'sale',
                        -order_item.quantity,
                        variant.stock_quantity,
                        variant.stock_quantity - order_item.quantity,
                        NEW.id,
                        'Automatic reduction from Stripe order',
                        'system'
                    );
                ELSE
                    RAISE WARNING 'Insufficient stock for variant % (Order ID: %). Available: %, Requested: %',
                        variant.variant_name, NEW.id, variant.available_quantity, order_item.quantity;
                END IF;
            ELSE
                RAISE WARNING 'Variant not found for item: % - % (Order ID: %)', 
                    order_item.product_name, order_item.variant, NEW.id;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reduce_inventory_public ON public.orders;

CREATE TRIGGER trigger_reduce_inventory_public
    AFTER INSERT OR UPDATE OF status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION reduce_inventory_on_public_order();

-- =====================================================
-- 7. UPDATE PRODUCTS TABLE WITH TOTAL INVENTORY
-- =====================================================
-- Update the main products table with aggregated inventory counts

CREATE OR REPLACE FUNCTION update_product_inventory_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the products table with sum of all variant stock for this product
    UPDATE products
    SET 
        inventory_count = (
            SELECT COALESCE(SUM(stock_quantity), 0)
            FROM product_variants
            WHERE product_variants.product_id = 
                CASE 
                    WHEN TG_OP = 'DELETE' THEN OLD.product_id
                    ELSE NEW.product_id
                END
                AND is_active = true
        ),
        updated_at = NOW()
    WHERE product_id = 
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.product_id
            ELSE NEW.product_id
        END;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_inventory ON product_variants;

CREATE TRIGGER trigger_update_product_inventory
    AFTER INSERT OR UPDATE OF stock_quantity OR DELETE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_product_inventory_count();

-- =====================================================
-- 8. CREATE VIEW FOR INVENTORY DASHBOARD
-- =====================================================

CREATE OR REPLACE VIEW inventory_dashboard AS
SELECT 
    pv.id,
    pv.product_id,
    p.title as product_name,
    pv.variant_name,
    pv.size,
    pv.color,
    pv.sku,
    pv.stock_quantity,
    pv.reserved_quantity,
    pv.available_quantity,
    pv.price,
    pv.is_active,
    pv.updated_at,
    CASE 
        WHEN pv.available_quantity = 0 THEN 'out_of_stock'
        WHEN pv.available_quantity < 5 THEN 'low_stock'
        WHEN pv.available_quantity < 10 THEN 'moderate'
        ELSE 'in_stock'
    END as stock_status,
    (
        SELECT COUNT(*)
        FROM inventory_movements im
        WHERE im.variant_id = pv.id
        AND im.movement_type = 'sale'
        AND im.created_at >= NOW() - INTERVAL '30 days'
    ) as sales_last_30_days
FROM product_variants pv
LEFT JOIN products p ON p.product_id = pv.product_id
ORDER BY pv.product_id, pv.size, pv.color;

-- =====================================================
-- 9. CREATE VIEW FOR LOW STOCK ALERTS
-- =====================================================

CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT 
    pv.id,
    pv.product_id,
    p.title as product_name,
    pv.variant_name,
    pv.sku,
    pv.available_quantity,
    pv.updated_at
FROM product_variants pv
LEFT JOIN products p ON p.product_id = pv.product_id
WHERE pv.is_active = true
AND pv.available_quantity < 5
ORDER BY pv.available_quantity ASC, pv.updated_at DESC;

-- =====================================================
-- 10. INITIAL INVENTORY COUNT UPDATE
-- =====================================================
-- Update products table with current inventory totals

UPDATE products p
SET inventory_count = (
    SELECT COALESCE(SUM(stock_quantity), 0)
    FROM product_variants pv
    WHERE pv.product_id = p.product_id
    AND pv.is_active = true
)
WHERE p.product_id IN (
    SELECT DISTINCT product_id FROM product_variants
);

-- =====================================================
-- SUMMARY
-- =====================================================
/*
This SQL script provides:

1. ✅ Product Variants Table - Stores all product variants with size/color combinations
2. ✅ Current Stock Data - All 217 units entered (156 full sets + 37 single sets + 24 bun bons)
3. ✅ Hair Accessories - 253 units (scrunchies, clips, claws)
4. ✅ Inventory Movements Log - Tracks all stock changes
5. ✅ Auto-Reduce on Orders - Automatically reduces stock when orders are completed
6. ✅ Triggers for Both Order Tables - Works with both analytics.orders and public.orders
7. ✅ Products Table Sync - Updates main products table with total inventory
8. ✅ Inventory Dashboard View - Easy-to-view stock status
9. ✅ Low Stock Alerts - Shows items that need restocking

TOTAL INVENTORY COUNTS:
- Full Sets: 156 units
- Single Sets: 37 units
- Heat Bun Bons: 24 units
- Hair Accessories: 253 units
- GRAND TOTAL: 470 units

The dashboard will now:
- Show real-time stock levels
- Automatically reduce inventory on each order
- Alert when stock is low (< 5 units)
- Track all inventory movements
- Display available vs reserved quantities
*/

