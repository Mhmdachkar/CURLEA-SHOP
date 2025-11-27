-- =====================================================
-- INSERT SAMPLE DATA FOR TESTING
-- Run this if tables are empty and you want to test the dashboard
-- =====================================================

-- 1. INSERT SAMPLE VISITS
INSERT INTO visits (session_id, ip_address, device, browser, os, country, city, region, referrer, landing_page, utm_source, utm_medium, utm_campaign, is_mobile, is_tablet, is_desktop, screen_width, screen_height, language, timezone, created_at)
VALUES
    ('session_001', '192.168.1.1', 'Desktop', 'Chrome', 'Windows', 'United States', 'New York', 'NY', 'https://google.com', '/products', 'google', 'organic', 'summer_sale', false, false, true, 1920, 1080, 'en-US', 'America/New_York', NOW() - INTERVAL '1 day'),
    ('session_002', '192.168.1.2', 'Mobile', 'Safari', 'iOS', 'United States', 'Los Angeles', 'CA', 'https://facebook.com', '/home', 'facebook', 'social', 'spring_promo', true, false, false, 375, 667, 'en-US', 'America/Los_Angeles', NOW() - INTERVAL '2 days'),
    ('session_003', '192.168.1.3', 'Tablet', 'Chrome', 'Android', 'Canada', 'Toronto', 'ON', null, '/about', null, null, null, false, true, false, 768, 1024, 'en-CA', 'America/Toronto', NOW() - INTERVAL '3 days'),
    ('session_004', '192.168.1.4', 'Desktop', 'Firefox', 'Windows', 'United Kingdom', 'London', 'ENG', 'https://instagram.com', '/products', 'instagram', 'social', 'winter_sale', false, false, true, 1920, 1080, 'en-GB', 'Europe/London', NOW() - INTERVAL '4 days'),
    ('session_005', '192.168.1.5', 'Mobile', 'Chrome', 'Android', 'Australia', 'Sydney', 'NSW', 'https://google.com', '/home', 'google', 'organic', null, true, false, false, 360, 640, 'en-AU', 'Australia/Sydney', NOW() - INTERVAL '5 days');

-- 2. INSERT SAMPLE PAGE VIEWS
INSERT INTO page_views (session_id, url, path, title, referrer, scroll_depth, time_on_page, engaged, bounce, exit, created_at)
VALUES
    ('session_001', 'https://curlea.com/products', '/products', 'Products - Curlea', 'https://google.com', 75, 120, true, false, false, NOW() - INTERVAL '1 day'),
    ('session_001', 'https://curlea.com/products/dreamcurl', '/products/dreamcurl', 'DreamCurl Original - Curlea', 'https://curlea.com/products', 90, 180, true, false, true, NOW() - INTERVAL '1 day' + INTERVAL '2 minutes'),
    ('session_002', 'https://curlea.com/home', '/home', 'Home - Curlea', 'https://facebook.com', 50, 60, false, true, true, NOW() - INTERVAL '2 days'),
    ('session_003', 'https://curlea.com/about', '/about', 'About Us - Curlea', null, 100, 300, true, false, true, NOW() - INTERVAL '3 days'),
    ('session_004', 'https://curlea.com/products', '/products', 'Products - Curlea', 'https://instagram.com', 80, 150, true, false, false, NOW() - INTERVAL '4 days');

-- 3. INSERT SAMPLE EVENTS
INSERT INTO events (session_id, event_name, event_category, event_label, event_value, payload, created_at)
VALUES
    ('session_001', 'product_view', 'ecommerce', 'dreamcurl-original', 29.99, '{"product_id": "dreamcurl-original", "price": 29.99}'::jsonb, NOW() - INTERVAL '1 day'),
    ('session_001', 'add_to_cart', 'ecommerce', 'dreamcurl-original', 29.99, '{"product_id": "dreamcurl-original", "quantity": 1}'::jsonb, NOW() - INTERVAL '1 day' + INTERVAL '1 minute'),
    ('session_002', 'video_play', 'engagement', 'hero_video', null, '{"video_id": "hero_001"}'::jsonb, NOW() - INTERVAL '2 days'),
    ('session_003', 'button_click', 'engagement', 'subscribe_newsletter', null, '{"button_text": "Subscribe"}'::jsonb, NOW() - INTERVAL '3 days'),
    ('session_004', 'product_view', 'ecommerce', 'curly-confidence', 34.99, '{"product_id": "curly-confidence", "price": 34.99}'::jsonb, NOW() - INTERVAL '4 days');

-- 4. INSERT SAMPLE CART EVENTS
INSERT INTO cart_events (session_id, event_type, product_id, product_title, variant_id, variant_title, quantity, price, total_value, cart_total, created_at)
VALUES
    ('session_001', 'add', 'dreamcurl-original', 'DreamCurl Original', 'dreamcurl-original-240ml', '240ml', 1, 29.99, 29.99, 29.99, NOW() - INTERVAL '1 day'),
    ('session_001', 'add', 'curly-confidence', 'Curly Confidence Cream', 'curly-confidence-240ml', '240ml', 1, 34.99, 34.99, 64.98, NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
    ('session_001', 'checkout_start', null, null, null, null, 2, null, 64.98, 64.98, NOW() - INTERVAL '1 day' + INTERVAL '10 minutes'),
    ('session_002', 'add', 'gloss-serum', 'Glossy Curls Serum', 'gloss-serum-50ml', '50ml', 1, 24.99, 24.99, 24.99, NOW() - INTERVAL '2 days'),
    ('session_002', 'abandoned', null, null, null, null, 1, null, 24.99, 24.99, NOW() - INTERVAL '2 days' + INTERVAL '30 minutes');

-- 5. INSERT SAMPLE PRODUCTS (if products table is empty)
INSERT INTO products (product_id, title, description, price, cost, compare_at_price, category, subcategory, brand, sku, inventory_count, image_url, is_active, created_at)
VALUES
    ('dreamcurl-original', 'DreamCurl Original', 'Define and enhance your natural curls', 29.99, 12.00, 39.99, 'Hair Care', 'Styling Cream', 'Curlea', 'DREAMCURL-240ML', 150, 'https://example.com/dreamcurl.jpg', true, NOW()),
    ('curly-confidence', 'Curly Confidence Cream', 'Moisturizing curl cream for confident curls', 34.99, 14.00, 44.99, 'Hair Care', 'Styling Cream', 'Curlea', 'CURLYCONF-240ML', 120, 'https://example.com/curlyconf.jpg', true, NOW()),
    ('gloss-serum', 'Glossy Curls Serum', 'Add shine and reduce frizz', 24.99, 10.00, 32.99, 'Hair Care', 'Serum', 'Curlea', 'GLOSS-50ML', 200, 'https://example.com/gloss.jpg', true, NOW()),
    ('hydra-shampoo', 'Hydrating Curl Shampoo', 'Gentle cleansing for curly hair', 22.99, 9.00, null, 'Hair Care', 'Shampoo', 'Curlea', 'HYDRA-SHAMPOO-250ML', 180, 'https://example.com/shampoo.jpg', true, NOW()),
    ('silk-scrunchie', 'Silk Hair Scrunchie', 'Protect your curls while sleeping', 12.99, 4.00, 16.99, 'Hair Accessories', 'Scrunchies', 'Curlea', 'SCRUNCHIE-SILK', 300, 'https://example.com/scrunchie.jpg', true, NOW())
ON CONFLICT (product_id) DO NOTHING;

-- 6. INSERT SAMPLE ANALYTICS ORDERS
INSERT INTO orders (order_id, session_id, customer_email, customer_id, subtotal, discount_total, shipping_total, tax_total, total_value, total_cost, profit, currency, payment_method, shipping_method, source, utm_source, utm_medium, utm_campaign, discount_codes, items, status, fulfillment_status, created_at)
VALUES
    ('ORDER-001', 'session_001', 'customer1@example.com', 'cust_001', 64.98, 5.00, 8.99, 5.50, 74.47, 26.00, 48.47, 'USD', 'card', 'standard', 'web', 'google', 'organic', 'summer_sale', '["SUMMER5"]'::jsonb, '[{"product_id": "dreamcurl-original", "quantity": 1, "price": 29.99}, {"product_id": "curly-confidence", "quantity": 1, "price": 34.99}]'::jsonb, 'completed', 'fulfilled', NOW() - INTERVAL '1 day'),
    ('ORDER-002', 'session_004', 'customer2@example.com', 'cust_002', 34.99, 0, 8.99, 3.50, 47.48, 14.00, 33.48, 'USD', 'card', 'express', 'web', 'instagram', 'social', 'winter_sale', null, '[{"product_id": "curly-confidence", "quantity": 1, "price": 34.99}]'::jsonb, 'completed', 'fulfilled', NOW() - INTERVAL '4 days'),
    ('ORDER-003', 'session_005', 'customer3@example.com', 'cust_003', 62.97, 10.00, 8.99, 5.20, 67.16, 33.00, 34.16, 'USD', 'card', 'standard', 'web', 'google', 'organic', null, '["WELCOME10"]'::jsonb, '[{"product_id": "gloss-serum", "quantity": 1, "price": 24.99}, {"product_id": "hydra-shampoo", "quantity": 1, "price": 22.99}, {"product_id": "silk-scrunchie", "quantity": 1, "price": 12.99}]'::jsonb, 'processing', 'pending', NOW() - INTERVAL '5 days')
ON CONFLICT (order_id) DO NOTHING;

-- 7. VERIFY DATA WAS INSERTED
SELECT 'visits' as table_name, COUNT(*) as row_count FROM visits
UNION ALL
SELECT 'page_views' as table_name, COUNT(*) as row_count FROM page_views
UNION ALL
SELECT 'events' as table_name, COUNT(*) as row_count FROM events
UNION ALL
SELECT 'cart_events' as table_name, COUNT(*) as row_count FROM cart_events
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as row_count FROM orders
UNION ALL
SELECT 'products' as table_name, COUNT(*) as row_count FROM products;

-- =====================================================
-- SUCCESS! You should now see data in your dashboard
-- =====================================================


