-- =====================================================
-- CLEAR ALL ANALYTICS DATA
-- This script deletes all analytics tracking data
-- Use before launch to start with a clean database
-- =====================================================
-- 
-- IMPORTANT: This only deletes ANALYTICS/TRACKING data
-- It does NOT delete:
-- - products (product catalog)
-- - campaigns (marketing campaigns setup)
-- - orders (Stripe orders - actual customer orders)
-- - order_items (actual order items)
--
-- Run this in Supabase SQL Editor before launch
-- =====================================================

-- Disable foreign key checks temporarily (if needed)
SET session_replication_role = 'replica';

-- 1. Clear conversion_funnel table (analytics tracking)
DELETE FROM conversion_funnel;
SELECT 'Cleared conversion_funnel table' as status;

-- 2. Clear cart_events table (cart tracking events)
DELETE FROM cart_events;
SELECT 'Cleared cart_events table' as status;

-- 3. Clear events table (custom events tracking)
DELETE FROM events;
SELECT 'Cleared events table' as status;

-- 4. Clear page_views table (page view tracking)
DELETE FROM page_views;
SELECT 'Cleared page_views table' as status;

-- 5. Clear visits table (visit tracking)
DELETE FROM visits;
SELECT 'Cleared visits table' as status;

-- 6. Clear orders table (analytics orders - NOT Stripe orders)
-- IMPORTANT: This deletes from the ANALYTICS orders table (has session_id field)
-- It does NOT delete from public.orders (Stripe orders with order_number)
-- If both use the same table, only delete analytics tracking orders (those with session_id)
DELETE FROM orders
WHERE session_id IS NOT NULL;  -- Analytics orders have session_id, Stripe orders don't
SELECT 'Cleared analytics orders table (only orders with session_id)' as status;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify data has been cleared
-- =====================================================

-- Check remaining row counts for analytics tables
SELECT 'visits' as table_name, COUNT(*) as remaining_rows FROM visits
UNION ALL
SELECT 'page_views', COUNT(*) FROM page_views
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'cart_events', COUNT(*) FROM cart_events
UNION ALL
SELECT 'conversion_funnel', COUNT(*) FROM conversion_funnel
UNION ALL
SELECT 'orders (analytics only)', COUNT(*) FROM orders WHERE session_id IS NOT NULL;

-- Verify preserved data (should NOT be deleted)
-- Run these separately if you want to verify preserved data
-- They may fail if tables don't exist, which is fine

-- Uncomment to verify preserved tables:
-- SELECT 'products (preserved)' as table_name, COUNT(*) as remaining_rows FROM products
-- UNION ALL
-- SELECT 'campaigns (preserved)', COUNT(*) FROM campaigns
-- UNION ALL
-- SELECT 'public.orders (Stripe - preserved)', COUNT(*) FROM public.orders;

-- =====================================================
-- NOTES:
-- 1. This script preserves:
--    - products table (product catalog)
--    - campaigns table (marketing campaigns)
--    - public.orders table (Stripe orders - if separate)
--    - order_items table (actual order items)
--
-- 2. If orders table contains BOTH analytics and Stripe orders:
--    You may need to modify the DELETE statement to be more specific
--    or delete analytics orders separately from Stripe orders
--
-- 3. After running this script:
--    - All visitor tracking data will be cleared
--    - All event tracking data will be cleared
--    - All analytics will start fresh from launch day
--    - Product catalog and campaigns remain intact
-- =====================================================

