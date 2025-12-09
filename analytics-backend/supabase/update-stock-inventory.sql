-- ==========================================
-- CURLEA INVENTORY UPDATE SCRIPT
-- Generated from: Book 2(inventory).csv
-- Date: 2025-12-07
-- Total Variants: 53
-- Color Mapping (CSV → Database): purple→Mulberry, pink→CANDY, brown→Latte, green→Olive
-- Note: CSV uses lowercase "brown" but database stores "Latte" (proper color name)
-- Size Mapping: large→Large (UI shows "Original"), jumbo→Jumbo, midi→Midi, mini→Mini
-- ==========================================

-- Step 1: Ensure product_variants table exists with proper structure
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT,
    sku TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - COALESCE(reserved_quantity, 0)) STORED,
    price NUMERIC(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, size, color)
);

-- Drop existing unique constraint on sku if it exists (SKU should not be unique, only product_id+size+color)
-- This allows multiple variants to potentially share the same SKU if needed
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_sku_key;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_product_variants_available ON product_variants(available_quantity);

-- Step 2: Insert/Update all inventory data from CSV
-- Using UPSERT (INSERT ... ON CONFLICT UPDATE) to handle existing records

-- ==========================================
-- FULL SETS - DreamCurl™ Jumbo (dreamcurl-jumbo)
-- CSV: full sets, jumbo → "CURLEA DreamCurl™ Full Set Jumbo"
-- ==========================================
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('dreamcurl-jumbo', 'CURLEA DreamCurl™ Full Set Jumbo - Mulberry', 'Jumbo', 'Mulberry', 11, 22.99, 'DC-JUMBO-MULBERRY'),
    ('dreamcurl-jumbo', 'CURLEA DreamCurl™ Full Set Jumbo - CANDY', 'Jumbo', 'CANDY', 12, 22.99, 'DC-JUMBO-CANDY'),
    ('dreamcurl-jumbo', 'CURLEA DreamCurl™ Full Set Jumbo - Latte', 'Jumbo', 'Latte', 8, 22.99, 'DC-JUMBO-LATTE'),
    ('dreamcurl-jumbo', 'CURLEA DreamCurl™ Full Set Jumbo - Olive', 'Jumbo', 'Olive', 11, 22.99, 'DC-JUMBO-OLIVE')
ON CONFLICT (product_id, size, color)
DO UPDATE SET
    variant_name = EXCLUDED.variant_name,
    stock_quantity = EXCLUDED.stock_quantity,
    price = EXCLUDED.price,
    sku = EXCLUDED.sku,
    updated_at = NOW();

-- ==========================================
-- FULL SETS - DreamCurl™ Original/Large (dreamcurl-original)
-- CSV: full sets, large → "CURLEA DreamCurl™ Full Set Original"
-- ==========================================
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('dreamcurl-original', 'CURLEA DreamCurl™ Full Set Original - Mulberry', 'Large', 'Mulberry', 6, 22.99, 'DC-ORIG-MULBERRY'),
    ('dreamcurl-original', 'CURLEA DreamCurl™ Full Set Original - CANDY', 'Large', 'CANDY', 2, 22.99, 'DC-ORIG-CANDY'),
    ('dreamcurl-original', 'CURLEA DreamCurl™ Full Set Original - Latte', 'Large', 'Latte', 10, 22.99, 'DC-ORIG-LATTE'),
    ('dreamcurl-original', 'CURLEA DreamCurl™ Full Set Original - Olive', 'Large', 'Olive', 9, 22.99, 'DC-ORIG-OLIVE')
ON CONFLICT (product_id, size, color)
DO UPDATE SET
    variant_name = EXCLUDED.variant_name,
    stock_quantity = EXCLUDED.stock_quantity,
    price = EXCLUDED.price,
    sku = EXCLUDED.sku,
    updated_at = NOW();

-- ==========================================
-- FULL SETS - DreamCurl™ Midi (dreamcurl-midi)
-- CSV: full sets, midi → "CURLEA DreamCurl™ Full Set Midi"
-- ==========================================
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('dreamcurl-midi', 'CURLEA DreamCurl™ Full Set Midi - Mulberry', 'Midi', 'Mulberry', 11, 22.99, 'DC-MIDI-MULBERRY'),
    ('dreamcurl-midi', 'CURLEA DreamCurl™ Full Set Midi - CANDY', 'Midi', 'CANDY', 10, 22.99, 'DC-MIDI-CANDY'),
    ('dreamcurl-midi', 'CURLEA DreamCurl™ Full Set Midi - Latte', 'Midi', 'Latte', 11, 22.99, 'DC-MIDI-LATTE'),
    ('dreamcurl-midi', 'CURLEA DreamCurl™ Full Set Midi - Olive', 'Midi', 'Olive', 11, 22.99, 'DC-MIDI-OLIVE')
ON CONFLICT (product_id, size, color)
DO UPDATE SET
    variant_name = EXCLUDED.variant_name,
    stock_quantity = EXCLUDED.stock_quantity,
    price = EXCLUDED.price,
    sku = EXCLUDED.sku,
    updated_at = NOW();

-- ==========================================
-- FULL SETS - DreamCurl™ Mini (zero-heat-mini)
-- CSV: full sets, mini → "CURLEA DreamCurl™ Full Set Mini"
-- ==========================================
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('zero-heat-mini', 'CURLEA DreamCurl™ Full Set Mini - Mulberry', 'Mini', 'Mulberry', 8, 22.99, 'DC-MINI-MULBERRY'),
    ('zero-heat-mini', 'CURLEA DreamCurl™ Full Set Mini - CANDY', 'Mini', 'CANDY', 11, 22.99, 'DC-MINI-CANDY'),
    ('zero-heat-mini', 'CURLEA DreamCurl™ Full Set Mini - Latte', 'Mini', 'Latte', 8, 22.99, 'DC-MINI-LATTE'),
    ('zero-heat-mini', 'CURLEA DreamCurl™ Full Set Mini - Olive', 'Mini', 'Olive', 11, 22.99, 'DC-MINI-OLIVE')
ON CONFLICT (product_id, size, color)
DO UPDATE SET
    variant_name = EXCLUDED.variant_name,
    stock_quantity = EXCLUDED.stock_quantity,
    price = EXCLUDED.price,
    sku = EXCLUDED.sku,
    updated_at = NOW();

-- ==========================================
-- SINGLE SETS - DreamCurl™ Single Set (dreamcurl-short-set)
-- CSV: single sets → "CURLEA DreamCurl™ Single Set"
-- Note: For single sets, colors map differently: purple→Royal Purple, pink→Rose Gold, brown→Earl Grey, green→Olive Lux
-- ==========================================
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    -- Jumbo variants
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Jumbo - Royal Purple', 'Jumbo', 'Royal Purple', 3, 16.99, 'DC-SINGLE-RPURPLE-JUMBO'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Jumbo - Rose Gold', 'Jumbo', 'Rose Gold', 2, 16.99, 'DC-SINGLE-RGOLD-JUMBO'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Jumbo - Earl Grey', 'Jumbo', 'Earl Grey', 2, 16.99, 'DC-SINGLE-GREY-JUMBO'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Jumbo - Olive Lux', 'Jumbo', 'Olive Lux', 2, 16.99, 'DC-SINGLE-OLIVE-JUMBO'),
    
    -- Large variants
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Large - Royal Purple', 'Large', 'Royal Purple', 2, 16.99, 'DC-SINGLE-RPURPLE-LARGE'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Large - Rose Gold', 'Large', 'Rose Gold', 0, 16.99, 'DC-SINGLE-RGOLD-LARGE'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Large - Earl Grey', 'Large', 'Earl Grey', 1, 16.99, 'DC-SINGLE-GREY-LARGE'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Large - Olive Lux', 'Large', 'Olive Lux', 3, 16.99, 'DC-SINGLE-OLIVE-LARGE'),
    
    -- Midi variants
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Midi - Royal Purple', 'Midi', 'Royal Purple', 2, 16.99, 'DC-SINGLE-RPURPLE-MIDI'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Midi - Rose Gold', 'Midi', 'Rose Gold', 3, 16.99, 'DC-SINGLE-RGOLD-MIDI'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Midi - Earl Grey', 'Midi', 'Earl Grey', 3, 16.99, 'DC-SINGLE-GREY-MIDI'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Midi - Olive Lux', 'Midi', 'Olive Lux', 3, 16.99, 'DC-SINGLE-OLIVE-MIDI'),
    
    -- Mini variants
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Mini - Royal Purple', 'Mini', 'Royal Purple', 3, 16.99, 'DC-SINGLE-RPURPLE-MINI'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Mini - Rose Gold', 'Mini', 'Rose Gold', 2, 16.99, 'DC-SINGLE-RGOLD-MINI'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Mini - Earl Grey', 'Mini', 'Earl Grey', 3, 16.99, 'DC-SINGLE-GREY-MINI'),
    ('dreamcurl-short-set', 'CURLEA DreamCurl™ Single Set Mini - Olive Lux', 'Mini', 'Olive Lux', 3, 16.99, 'DC-SINGLE-OLIVE-MINI')
ON CONFLICT (product_id, size, color)
DO UPDATE SET
    variant_name = EXCLUDED.variant_name,
    stock_quantity = EXCLUDED.stock_quantity,
    price = EXCLUDED.price,
    sku = EXCLUDED.sku,
    updated_at = NOW();

-- ==========================================
-- HEAT BUNS (heatless-5)
-- CSV: Heat buns → "CURLEA Bun Bons Heatless Curling System"
-- Color Mapping (CSV → Database): purple→Mulberry, pink→CANDY, brown→Latte (not brown!), green→Olive
-- Database stores: Mulberry, CANDY, Latte, Olive (proper color names)
-- ==========================================
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    -- Jumbo variants
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Jumbo - Mulberry', 'Jumbo', 'Mulberry', 1, 22.99, 'HB-MULBERRY-JUMBO'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Jumbo - CANDY', 'Jumbo', 'CANDY', 1, 22.99, 'HB-CANDY-JUMBO'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Jumbo - Latte', 'Jumbo', 'Latte', 2, 22.99, 'HB-LATTE-JUMBO'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Jumbo - Olive', 'Jumbo', 'Olive', 3, 22.99, 'HB-OLIVE-JUMBO'),
    
    -- Large variants (UI shows as "Original")
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Original - Mulberry', 'Large', 'Mulberry', 0, 22.99, 'HB-MULBERRY-LARGE'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Original - CANDY', 'Large', 'CANDY', 0, 22.99, 'HB-CANDY-LARGE'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Original - Latte', 'Large', 'Latte', 2, 22.99, 'HB-LATTE-LARGE'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Original - Olive', 'Large', 'Olive', 1, 22.99, 'HB-OLIVE-LARGE'),
    
    -- Midi variants (ALL SOLD OUT)
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Midi - Mulberry', 'Midi', 'Mulberry', 0, 22.99, 'HB-MULBERRY-MIDI'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Midi - CANDY', 'Midi', 'CANDY', 0, 22.99, 'HB-CANDY-MIDI'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Midi - Latte', 'Midi', 'Latte', 0, 22.99, 'HB-LATTE-MIDI'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Midi - Olive', 'Midi', 'Olive', 0, 22.99, 'HB-OLIVE-MIDI'),
    
    -- Mini variants
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Mini - Mulberry', 'Mini', 'Mulberry', 3, 22.99, 'HB-MULBERRY-MINI'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Mini - CANDY', 'Mini', 'CANDY', 0, 22.99, 'HB-CANDY-MINI'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Mini - Latte', 'Mini', 'Latte', 3, 22.99, 'HB-LATTE-MINI'),
    ('heatless-5', 'CURLEA Bun Bons Heatless Curling System Mini - Olive', 'Mini', 'Olive', 3, 22.99, 'HB-OLIVE-MINI')
ON CONFLICT (product_id, size, color)
DO UPDATE SET
    variant_name = EXCLUDED.variant_name,
    stock_quantity = EXCLUDED.stock_quantity,
    price = EXCLUDED.price,
    sku = EXCLUDED.sku,
    updated_at = NOW();

-- ==========================================
-- ACCESSORIES (No size/color variants)
-- CSV MAPPINGS:
--   scrunchies/5set (current_stock=42) → satin-scrunchies-french-5pc (CURLEA Satin Scrunchies Luxury French 5 Piece)
--   flat clips/9set (current_stock=15) → curly-clip-1 (CURLEA Curved Resin Hair Clip)
--   bow tie/7set (current_stock=22) → curly-scarf-1 (CURLEA Elegant Satin Scarf + Scrunchies Set)
--   korean clips/10set (current_stock=23) → korean-clips-10set
-- ==========================================
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    -- scrunchies/5set → satin-scrunchies-french-5pc (CURLEA Satin Scrunchies Luxury French 5 Piece)
    ('satin-scrunchies-french-5pc', 'CURLEA Satin Scrunchies Luxury French 5 Piece', 'Standard', NULL, 42, 6.77, 'SCRUNCHIES-5PC'),
    -- korean clips/10set → korean-clips-10set
    ('korean-clips-10set', 'Korean Clips 10-Set', 'Standard', NULL, 23, 11.99, 'KOREAN-CLIPS-10'),
    -- flat clips/9set → curly-clip-1 (CURLEA Curved Resin Hair Clip - Duckbill Grip & Strong Teeth)
    ('curly-clip-1', 'CURLEA Curved Resin Hair Clip - Duckbill Grip & Strong Teeth', 'Standard', NULL, 15, 14.99, 'FLAT-CLIPS-9'),
    -- bow tie/7set → curly-scarf-1 (CURLEA Elegant Satin Scarf + Scrunchies Set)
    ('curly-scarf-1', 'CURLEA Elegant Satin Scarf + Scrunchies Set', 'Standard', NULL, 22, 11.99, 'BOWTIE-CLIPS-7'),
    -- Products not in CSV but need database entries for stock tracking
    ('curly-claw-1', 'CURLEA Geometric Flower Hair Claw Clip Set', 'Standard', NULL, 0, 15.99, 'CLAW-CLIPS-10'),
    ('songmay-hair-clips', 'CURLEA Luxe Alloy Hair Clips', 'Standard', NULL, 0, 3.99, 'ALLOY-CLIPS-2')
ON CONFLICT (product_id, size, color)
DO UPDATE SET
    variant_name = EXCLUDED.variant_name,
    stock_quantity = EXCLUDED.stock_quantity,
    price = EXCLUDED.price,
    sku = EXCLUDED.sku,
    updated_at = NOW();

-- ==========================================
-- Step 3: Create inventory_movements table if not exists
-- ==========================================
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'restock', 'adjustment', 'damage', 'return')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER,
    new_stock INTEGER,
    order_id TEXT,
    notes TEXT,
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_id ON inventory_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- ==========================================
-- Verification Queries
-- ==========================================

-- Count total variants inserted
SELECT 'Total Variants' as metric, COUNT(*) as count FROM product_variants;

-- Count sold out items
SELECT 'Sold Out Items' as metric, COUNT(*) as count 
FROM product_variants 
WHERE stock_quantity = 0;

-- Count low stock items (≤ 3)
SELECT 'Low Stock Items' as metric, COUNT(*) as count 
FROM product_variants 
WHERE stock_quantity > 0 AND stock_quantity <= 3;

-- Show all sold out variants
SELECT 
    product_id,
    variant_name,
    size,
    color,
    stock_quantity
FROM product_variants
WHERE stock_quantity = 0
ORDER BY product_id, size, color;

-- Show inventory summary by product
SELECT 
    product_id,
    COUNT(*) as variant_count,
    SUM(stock_quantity) as total_stock,
    MIN(stock_quantity) as min_stock,
    MAX(stock_quantity) as max_stock
FROM product_variants
GROUP BY product_id
ORDER BY product_id;
