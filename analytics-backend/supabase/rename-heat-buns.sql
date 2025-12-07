-- ==========================================
-- UPDATE: Rename Heat Buns Product ID
-- Change from "heatless-5" to "heat-buns"
-- ==========================================

-- Update all Heat Buns variants to use correct product_id
UPDATE product_variants
SET product_id = 'heat-buns',
    variant_name = REPLACE(variant_name, 'Heat Buns', 'Heat Buns'),
    updated_at = NOW()
WHERE product_id = 'heatless-5';

-- Verify the update
SELECT 
    product_id,
    variant_name,
    size,
    color,
    stock_quantity
FROM product_variants
WHERE product_id = 'heat-buns'
ORDER BY size, color;

-- Check total count (should be 16 variants)
SELECT 
    product_id,
    COUNT(*) as variant_count,
    SUM(stock_quantity) as total_stock
FROM product_variants
WHERE product_id = 'heat-buns'
GROUP BY product_id;
