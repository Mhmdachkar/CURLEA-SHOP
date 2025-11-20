-- =====================================================
-- DIAGNOSTIC SCRIPT - Check Why Tables Are Empty
-- Run this in Supabase SQL Editor to diagnose the issue
-- =====================================================

-- 1. CHECK IF TABLES EXIST
SELECT 
    tablename as table_name,
    schemaname as schema
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('visits', 'page_views', 'events', 'cart_events', 'orders', 'products', 'product_variants', 'inventory_movements')
ORDER BY tablename;

-- 2. CHECK ROW COUNTS FOR ALL TABLES
SELECT 
    'visits' as table_name, 
    COUNT(*) as row_count 
FROM visits
UNION ALL
SELECT 
    'page_views' as table_name, 
    COUNT(*) as row_count 
FROM page_views
UNION ALL
SELECT 
    'events' as table_name, 
    COUNT(*) as row_count 
FROM events
UNION ALL
SELECT 
    'cart_events' as table_name, 
    COUNT(*) as row_count 
FROM cart_events
UNION ALL
SELECT 
    'orders (analytics)' as table_name, 
    COUNT(*) as row_count 
FROM orders
UNION ALL
SELECT 
    'public.orders (Stripe)' as table_name, 
    COUNT(*) as row_count 
FROM public.orders
UNION ALL
SELECT 
    'public.order_items' as table_name, 
    COUNT(*) as row_count 
FROM public.order_items
UNION ALL
SELECT 
    'products' as table_name, 
    COUNT(*) as row_count 
FROM products
UNION ALL
SELECT 
    'product_variants' as table_name, 
    COUNT(*) as row_count 
FROM product_variants
UNION ALL
SELECT 
    'inventory_movements' as table_name, 
    COUNT(*) as row_count 
FROM inventory_movements
ORDER BY table_name;

-- 3. CHECK RLS (Row Level Security) STATUS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('visits', 'page_views', 'events', 'cart_events', 'orders', 'products', 'product_variants', 'inventory_movements')
ORDER BY tablename;

-- 4. CHECK RLS POLICIES (if any exist)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('visits', 'page_views', 'events', 'cart_events', 'orders', 'products', 'product_variants', 'inventory_movements');

-- 5. SAMPLE DATA FROM EACH TABLE (first 2 rows if they exist)
SELECT 'visits' as table_name, * FROM visits LIMIT 2;
SELECT 'page_views' as table_name, * FROM page_views LIMIT 2;
SELECT 'events' as table_name, * FROM events LIMIT 2;
SELECT 'cart_events' as table_name, * FROM cart_events LIMIT 2;
SELECT 'orders' as table_name, * FROM orders LIMIT 2;
SELECT 'public.orders' as table_name, * FROM public.orders LIMIT 2;
SELECT 'products' as table_name, * FROM products LIMIT 2;
SELECT 'product_variants' as table_name, * FROM product_variants LIMIT 2;
SELECT 'inventory_movements' as table_name, * FROM inventory_movements LIMIT 2;

-- 6. CHECK IF VIEWS EXIST
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('daily_overview', 'sales_overview', 'top_products_by_revenue', 'traffic_sources', 'conversion_funnel_realtime', 'abandoned_carts', 'inventory_dashboard', 'low_stock_alerts')
ORDER BY table_name;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- If tables exist but have 0 rows: You need to populate data
-- If RLS is enabled: You need to disable it or add policies
-- If tables don't exist: Run COMPLETE_SCHEMA.sql first
-- If views don't exist: Run COMPLETE_SCHEMA.sql first
-- =====================================================

