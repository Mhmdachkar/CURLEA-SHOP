-- =====================================================
-- COMPLETE PRODUCT SYNC
-- This script will:
-- 1. Update/insert all current products
-- 2. Delete all old products not in the list
-- =====================================================

-- =====================================================
-- STEP 1: SHOW OLD PRODUCTS THAT WILL BE DELETED
-- =====================================================

SELECT 
    'OLD PRODUCTS THAT WILL BE DELETED:' AS info,
    product_id,
    title,
    category,
    price
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

-- =====================================================
-- STEP 2: DELETE OLD PRODUCTS
-- =====================================================

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

-- =====================================================
-- STEP 3: INSERT/UPDATE CURRENT PRODUCTS
-- =====================================================

-- DreamCurl™ Original Set
INSERT INTO products (product_id, title, description, price, cost, category, subcategory, brand, image_url, is_active)
VALUES (
    'dreamcurl-original',
    'DreamCurl™ Original Set',
    'The Original Heatless Curler - by CURLEA. For bouncy, voluminous curls overnight. Designed for medium to long hair.',
    39.99,
    18.00,
    'DreamCurl™ Collection',
    'Heatless Curlers',
    'CURLEA',
    '/assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp',
    true
)
ON CONFLICT (product_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    brand = EXCLUDED.brand,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- DreamCurl™ Short Set
INSERT INTO products (product_id, title, description, price, cost, category, subcategory, brand, image_url, is_active)
VALUES (
    'dreamcurl-short-set',
    'DreamCurl™ Short Set',
    'The Short Set Collection - Perfect for every hair type and style. Professional heatless curling system designed for versatility.',
    24.99,
    12.00,
    'DreamCurl™ Collection',
    'Heatless Curlers',
    'CURLEA',
    '/assets/Heatless Hair Curling Rod/product-1.webp',
    true
)
ON CONFLICT (product_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    brand = EXCLUDED.brand,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- DreamCurl™ Midi
INSERT INTO products (product_id, title, description, price, cost, category, subcategory, brand, image_url, is_active)
VALUES (
    'dreamcurl-midi',
    'DreamCurl™ Midi',
    'The Perfect Middle Ground - DreamCurl™ Midi. Ideal for medium-length hair that needs just the right amount of curl.',
    34.99,
    16.00,
    'DreamCurl™ Collection',
    'Heatless Curlers',
    'CURLEA',
    '/assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp',
    true
)
ON CONFLICT (product_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    brand = EXCLUDED.brand,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- DreamCurl™ Jumbo Size
INSERT INTO products (product_id, title, description, price, cost, category, subcategory, brand, image_url, is_active)
VALUES (
    'dreamcurl-jumbo',
    'DreamCurl™ JUMBO SIZE',
    'Jumbo Heatless Curler - by CURLEA. For soft, voluminous waves with a looser curl shape. Designed for hair below the shoulders.',
    39.99,
    18.00,
    'DreamCurl™ Collection',
    'Heatless Curlers',
    'CURLEA',
    '/assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp',
    true
)
ON CONFLICT (product_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    brand = EXCLUDED.brand,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- BUN BONS Heatless Curling System
INSERT INTO products (product_id, title, description, price, cost, category, subcategory, brand, image_url, is_active)
VALUES (
    'heatless-5',
    'BUN BONS - Heatless Curling System',
    'Experience overnight blowout-style volume with exceptional comfort and secure sleep. Unique curling system encased within a protective capsule.',
    89.99,
    35.00,
    'Heatless Tools',
    'Heatless Styling',
    'CURLEA',
    '/assets/Heatless Hair Curling Rod/product5/pppp1.webp',
    true
)
ON CONFLICT (product_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    brand = EXCLUDED.brand,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Curved Resin Hair Clip
INSERT INTO products (product_id, title, description, price, cost, category, subcategory, brand, image_url, is_active)
VALUES (
    'curly-clip-1',
    'Curved Resin Hair Clip - Duckbill Grip & Strong Teeth',
    'Comfortable curved resin design with duckbill grip. Strong teeth for secure and stylish hair styling. Perfect for parties, weddings, and daily use.',
    15.99,
    6.00,
    'Hair Accessories',
    'Hair Clips',
    'CURLEA',
    '/assets/curly hair collection/product1/p1.jpg',
    true
)
ON CONFLICT (product_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    brand = EXCLUDED.brand,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- MIO Elegant Scarf
INSERT INTO products (product_id, title, description, price, cost, category, subcategory, brand, image_url, is_active)
VALUES (
    'curly-scarf-1',
    'MIO Elegant Scarf - Soft Satin Hair Band & Scrunchies',
    'Soft satin material prevents hair breakage and frizz. Elegant solid color design with fashionable ribbon bow. Perfect for protecting hair while sleeping or styling.',
    12.99,
    5.00,
    'Hair Accessories',
    'Hair Bands',
    'MIO',
    '/assets/curly hair collection/product2/pp1.jpg',
    true
)
ON CONFLICT (product_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    brand = EXCLUDED.brand,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Fashion Geometric Hair Claw
INSERT INTO products (product_id, title, description, price, cost, category, subcategory, brand, image_url, is_active)
VALUES (
    'curly-claw-1',
    'HC027D Fashion Solid Elegant Neutral Geometric Flower Hair Claw Clips',
    'Fashion solid elegant neutral geometric flower design. Large matte hair claw clamps perfect for thick hair. Durable construction with strong grip for secure hold.',
    19.99,
    8.00,
    'Hair Accessories',
    'Hair Claws',
    'CURLEA',
    '/assets/curly hair collection/product3/ppp1.jpg',
    true
)
ON CONFLICT (product_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    brand = EXCLUDED.brand,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- SongMay Woman Hair Clips
INSERT INTO products (product_id, title, description, price, cost, category, subcategory, brand, image_url, is_active)
VALUES (
    'songmay-hair-clips',
    'SongMay Woman Hair Clips',
    'Premium alloy construction with elegant gold finish for luxury styling. Large U-shaped design perfect for securing medium to long hair.',
    18.99,
    7.00,
    'Hair Accessories',
    'Hair Clips',
    'SongMay',
    '/assets/curly hair collection/product4/SongMay Woman Hair Clips.jpg',
    true
)
ON CONFLICT (product_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    brand = EXCLUDED.brand,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- CURLEA Comb
INSERT INTO products (product_id, title, description, price, cost, category, subcategory, brand, image_url, is_active)
VALUES (
    'curlea-comb',
    'CURLEA Comb',
    'Specially designed curl comb that preserves your curls integrity while achieving that effortlessly chic brushed out look.',
    12.99,
    5.00,
    'Hair Accessories',
    'Styling Tools',
    'CURLEA',
    '/assets/curly hair collection/product7/product7.webp',
    true
)
ON CONFLICT (product_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    brand = EXCLUDED.brand,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =====================================================
-- STEP 4: VERIFY FINAL PRODUCTS
-- =====================================================

SELECT 
    product_id,
    title,
    category,
    price,
    is_active,
    created_at,
    updated_at
FROM products
ORDER BY category, title;

