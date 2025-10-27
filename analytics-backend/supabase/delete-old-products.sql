-- =====================================================
-- DELETE OLD PRODUCTS
-- Remove all products that are NOT in the current product list
-- =====================================================

-- List of valid product IDs we want to keep
WITH valid_products AS (
    SELECT unnest(ARRAY[
        'dreamcurl-original',
        'dreamcurl-short-set',
        'dreamcurl-midi',
        'dreamcurl-jumbo',
        'heatless-5',
        'curly-clip-1',
        'curly-scarf-1',
        'curly-claw-1',
        'songmay-hair-clips',
        'curlea-comb'
    ]) AS product_id
),

-- Show what will be deleted (preview)
products_to_delete AS (
    SELECT p.*
    FROM products p
    WHERE p.product_id NOT IN (SELECT product_id FROM valid_products)
)

-- Display products that will be deleted
SELECT 
    product_id,
    title,
    category,
    price,
    is_active,
    created_at,
    updated_at,
    'Will be deleted' AS status
FROM products_to_delete
ORDER BY category, title;

-- Uncomment the line below to actually delete the products
-- DELETE FROM products 
-- WHERE product_id NOT IN (SELECT product_id FROM valid_products);

-- =====================================================
-- AFTER DELETION - Show remaining products
-- =====================================================

-- SELECT 
--     product_id,
--     title,
--     category,
--     price,
--     is_active,
--     COUNT(*) OVER () as total_remaining
-- FROM products
-- ORDER BY category, title;

