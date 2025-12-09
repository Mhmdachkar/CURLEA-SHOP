-- ==========================================
-- CURLEA INVENTORY UPDATE FROM CSV
-- Source: Book 2(inventory).csv
-- Date: 2025-12-09
-- Color Mapping: purple→Mulberry, pink→CANDY, brown→Latte, green→Olive
-- WARNING: This will DELETE all existing inventory and replace with CSV data
-- ==========================================

BEGIN;

-- Step 1: Clear ALL existing inventory
-- This ensures a clean slate with only CSV data
DELETE FROM product_variants;

-- Reset the sequence (optional, for clean IDs)
-- ALTER SEQUENCE IF EXISTS product_variants_id_seq RESTART WITH 1;

-- ==========================================
-- Step 2: Insert Fresh Inventory from CSV
-- ==========================================

-- ==========================================
-- FULL SETS (DreamCurl Full Sets)
-- Products: dreamcurl-jumbo, dreamcurl-original (Large), dreamcurl-midi, zero-heat-mini
-- ==========================================

-- FULL SETS - JUMBO SIZE
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('dreamcurl-jumbo', 'Full Set Purple Jumbo', 'Jumbo', 'Mulberry', 11, 24.99, 'FS-MULBERRY-JUMBO'),
    ('dreamcurl-jumbo', 'Full Set Pink Jumbo', 'Jumbo', 'CANDY', 12, 24.99, 'FS-CANDY-JUMBO'),
    ('dreamcurl-jumbo', 'Full Set Latte Jumbo', 'Jumbo', 'Latte', 8, 24.99, 'FS-LATTE-JUMBO'),
    ('dreamcurl-jumbo', 'Full Set Green Jumbo', 'Jumbo', 'Olive', 11, 24.99, 'FS-OLIVE-JUMBO');

-- FULL SETS - LARGE SIZE (UI shows as "Original")
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('dreamcurl-original', 'Full Set Purple Large', 'Large', 'Mulberry', 6, 22.99, 'FS-MULBERRY-LARGE'),
    ('dreamcurl-original', 'Full Set Pink Large', 'Large', 'CANDY', 2, 22.99, 'FS-CANDY-LARGE'),
    ('dreamcurl-original', 'Full Set Latte Large', 'Large', 'Latte', 10, 22.99, 'FS-LATTE-LARGE'),
    ('dreamcurl-original', 'Full Set Green Large', 'Large', 'Olive', 9, 22.99, 'FS-OLIVE-LARGE');

-- FULL SETS - MIDI SIZE
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('dreamcurl-midi', 'Full Set Purple Midi', 'Midi', 'Mulberry', 11, 20.99, 'FS-MULBERRY-MIDI'),
    ('dreamcurl-midi', 'Full Set Pink Midi', 'Midi', 'CANDY', 10, 20.99, 'FS-CANDY-MIDI'),
    ('dreamcurl-midi', 'Full Set Latte Midi', 'Midi', 'Latte', 11, 20.99, 'FS-LATTE-MIDI'),
    ('dreamcurl-midi', 'Full Set Green Midi', 'Midi', 'Olive', 11, 20.99, 'FS-OLIVE-MIDI');

-- FULL SETS - MINI SIZE
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('zero-heat-mini', 'Full Set Purple Mini', 'Mini', 'Mulberry', 8, 18.99, 'FS-MULBERRY-MINI'),
    ('zero-heat-mini', 'Full Set Pink Mini', 'Mini', 'CANDY', 11, 18.99, 'FS-CANDY-MINI'),
    ('zero-heat-mini', 'Full Set Latte Mini', 'Mini', 'Latte', 8, 18.99, 'FS-LATTE-MINI'),
    ('zero-heat-mini', 'Full Set Green Mini', 'Mini', 'Olive', 11, 18.99, 'FS-OLIVE-MINI');

-- ==========================================
-- SINGLE SETS (DreamCurl Single Sets)
-- Product: dreamcurl-short-set
-- Special color mapping for single sets
-- ==========================================

-- SINGLE SETS - JUMBO SIZE
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('dreamcurl-short-set', 'Single Set Royal Purple Jumbo', 'Jumbo', 'Royal Purple', 3, 16.99, 'SS-RPURPLE-JUMBO'),
    ('dreamcurl-short-set', 'Single Set Rose Gold Jumbo', 'Jumbo', 'Rose Gold', 2, 16.99, 'SS-RGOLD-JUMBO'),
    ('dreamcurl-short-set', 'Single Set Earl Grey Jumbo', 'Jumbo', 'Earl Grey', 2, 16.99, 'SS-GREY-JUMBO'),
    ('dreamcurl-short-set', 'Single Set Olive Lux Jumbo', 'Jumbo', 'Olive Lux', 1, 16.99, 'SS-OLIVE-JUMBO');

-- SINGLE SETS - LARGE SIZE (UI shows as "Original")
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('dreamcurl-short-set', 'Single Set Royal Purple Large', 'Large', 'Royal Purple', 2, 16.99, 'SS-RPURPLE-LARGE'),
    ('dreamcurl-short-set', 'Single Set Rose Gold Large', 'Large', 'Rose Gold', 0, 16.99, 'SS-RGOLD-LARGE'),
    ('dreamcurl-short-set', 'Single Set Earl Grey Large', 'Large', 'Earl Grey', 1, 16.99, 'SS-GREY-LARGE'),
    ('dreamcurl-short-set', 'Single Set Olive Lux Large', 'Large', 'Olive Lux', 3, 16.99, 'SS-OLIVE-LARGE');

-- SINGLE SETS - MIDI SIZE
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('dreamcurl-short-set', 'Single Set Royal Purple Midi', 'Midi', 'Royal Purple', 2, 16.99, 'SS-RPURPLE-MIDI'),
    ('dreamcurl-short-set', 'Single Set Rose Gold Midi', 'Midi', 'Rose Gold', 3, 16.99, 'SS-RGOLD-MIDI'),
    ('dreamcurl-short-set', 'Single Set Earl Grey Midi', 'Midi', 'Earl Grey', 3, 16.99, 'SS-GREY-MIDI'),
    ('dreamcurl-short-set', 'Single Set Olive Lux Midi', 'Midi', 'Olive Lux', 3, 16.99, 'SS-OLIVE-MIDI');

-- SINGLE SETS - MINI SIZE
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('dreamcurl-short-set', 'Single Set Royal Purple Mini', 'Mini', 'Royal Purple', 3, 16.99, 'SS-RPURPLE-MINI'),
    ('dreamcurl-short-set', 'Single Set Rose Gold Mini', 'Mini', 'Rose Gold', 2, 16.99, 'SS-RGOLD-MINI'),
    ('dreamcurl-short-set', 'Single Set Earl Grey Mini', 'Mini', 'Earl Grey', 3, 16.99, 'SS-GREY-MINI'),
    ('dreamcurl-short-set', 'Single Set Olive Lux Mini', 'Mini', 'Olive Lux', 3, 16.99, 'SS-OLIVE-MINI');

-- ==========================================
-- HEAT BUNS / BUN BONS (Heatless Curling System)
-- Product: heatless-5
-- ==========================================

-- HEAT BUNS - JUMBO SIZE
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('heatless-5', 'Bun Bons Purple Jumbo', 'Jumbo', 'Mulberry', 1, 22.99, 'HB-MULBERRY-JUMBO'),
    ('heatless-5', 'Bun Bons Pink Jumbo', 'Jumbo', 'CANDY', 1, 22.99, 'HB-CANDY-JUMBO'),
    ('heatless-5', 'Bun Bons Latte Jumbo', 'Jumbo', 'Latte', 2, 22.99, 'HB-LATTE-JUMBO'),
    ('heatless-5', 'Bun Bons Green Jumbo', 'Jumbo', 'Olive', 3, 22.99, 'HB-OLIVE-JUMBO');

-- HEAT BUNS - LARGE SIZE (UI shows as "Original")
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('heatless-5', 'Bun Bons Purple Large', 'Large', 'Mulberry', 0, 22.99, 'HB-MULBERRY-LARGE'),
    ('heatless-5', 'Bun Bons Pink Large', 'Large', 'CANDY', 0, 22.99, 'HB-CANDY-LARGE'),
    ('heatless-5', 'Bun Bons Latte Large', 'Large', 'Latte', 2, 22.99, 'HB-LATTE-LARGE'),
    ('heatless-5', 'Bun Bons Green Large', 'Large', 'Olive', 1, 22.99, 'HB-OLIVE-LARGE');

-- HEAT BUNS - MIDI SIZE (ALL SOLD OUT)
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('heatless-5', 'Bun Bons Purple Midi', 'Midi', 'Mulberry', 0, 22.99, 'HB-MULBERRY-MIDI'),
    ('heatless-5', 'Bun Bons Pink Midi', 'Midi', 'CANDY', 0, 22.99, 'HB-CANDY-MIDI'),
    ('heatless-5', 'Bun Bons Latte Midi', 'Midi', 'Latte', 0, 22.99, 'HB-LATTE-MIDI'),
    ('heatless-5', 'Bun Bons Green Midi', 'Midi', 'Olive', 0, 22.99, 'HB-OLIVE-MIDI');

-- HEAT BUNS - MINI SIZE
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('heatless-5', 'Bun Bons Purple Mini', 'Mini', 'Mulberry', 3, 22.99, 'HB-MULBERRY-MINI'),
    ('heatless-5', 'Bun Bons Pink Mini', 'Mini', 'CANDY', 0, 22.99, 'HB-CANDY-MINI'),
    ('heatless-5', 'Bun Bons Latte Mini', 'Mini', 'Latte', 3, 22.99, 'HB-LATTE-MINI'),
    ('heatless-5', 'Bun Bons Green Mini', 'Mini', 'Olive', 3, 22.99, 'HB-OLIVE-MINI');

-- ==========================================
-- ACCESSORIES (No size/color variants)
-- ==========================================

INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku)
VALUES
    ('satin-scrunchies-french-5pc', 'Scrunchies 5 Set', 'Standard', NULL, 42, 6.77, 'SCRUNCHIES-5PC'),
    ('korean-clips-10set', 'Korean Clips 10 Set', 'Standard', NULL, 23, 11.99, 'KOREAN-CLIPS-10'),
    ('curly-clip-1', 'Flat Clips 9 Set', 'Standard', NULL, 14, 14.99, 'FLAT-CLIPS-9'),
    ('bow-tie-7set', 'Bow Tie 7 Set', 'Standard', NULL, 22, 12.99, 'BOWTIE-CLIPS-7');

COMMIT;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check total variants inserted
SELECT 
    'Total Variants' as metric,
    COUNT(*) as count
FROM product_variants;

-- Check stock by product
SELECT 
    product_id,
    COUNT(*) as variants,
    SUM(stock_quantity) as total_stock,
    SUM(CASE WHEN stock_quantity > 0 THEN 1 ELSE 0 END) as in_stock_variants,
    SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as sold_out_variants
FROM product_variants
GROUP BY product_id
ORDER BY product_id;

-- Check if any "brown" colors remain (should be 0)
SELECT 
    'Brown Color Check' as metric,
    COUNT(*) as count
FROM product_variants
WHERE LOWER(color) = 'brown';

-- Show Latte color products
SELECT 
    product_id,
    variant_name,
    size,
    color,
    stock_quantity
FROM product_variants
WHERE color = 'Latte'
ORDER BY product_id, size;

