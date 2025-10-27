-- =====================================================
-- DELETE OLD PRODUCTS - IMMEDIATE EXECUTION
-- This will IMMEDIATELY delete all products NOT in our current list
-- =====================================================

-- Step 1: Show what will be deleted BEFORE deletion
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

-- Step 2: IMMEDIATELY DELETE the products
DELETE FROM products 
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
);

-- Step 3: Verify remaining products after deletion
SELECT 
    product_id,
    title,
    category,
    price,
    is_active,
    '✅ REMAINING' AS status
FROM products
ORDER BY category, title;

