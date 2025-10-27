-- =====================================================
-- DELETE OLD PRODUCTS - FINAL VERSION
-- This will permanently delete all products NOT in our current list
-- =====================================================

-- Step 1: Preview what will be deleted
SELECT 
    product_id,
    title,
    category,
    price,
    created_at,
    '⚠️ WILL BE DELETED' AS warning
FROM products
WHERE product_id NOT IN (
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
)
ORDER BY category, title;

-- Step 2: Uncomment the line below to actually DELETE the products
-- ⚠️ WARNING: This will permanently delete products not in our list!
-- DELETE FROM products 
-- WHERE product_id NOT IN (
--     'dreamcurl-original',
--     'dreamcurl-short-set',
--     'dreamcurl-midi',
--     'dreamcurl-jumbo',
--     'heatless-5',
--     'curly-clip-1',
--     'curly-scarf-1',
--     'curly-claw-1',
--     'songmay-hair-clips',
--     'curlea-comb'
-- );

-- Step 3: Verify remaining products (run after deletion)
-- SELECT 
--     product_id,
--     title,
--     category,
--     price,
--     is_active
-- FROM products
-- ORDER BY category, title;

