-- =====================================================
-- ANALYTICS DASHBOARD VIEWS
-- Run this in Supabase SQL Editor to create views needed by the dashboard
-- =====================================================

-- Drop existing views first to avoid column name conflicts
DROP VIEW IF EXISTS traffic_by_source CASCADE;
DROP VIEW IF EXISTS top_products_summary CASCADE;
DROP VIEW IF EXISTS conversion_funnel_summary CASCADE;
DROP VIEW IF EXISTS hourly_performance CASCADE;
DROP VIEW IF EXISTS total_sales_summary CASCADE;
DROP VIEW IF EXISTS aov_summary CASCADE;

-- 1. Traffic by Source View
CREATE VIEW traffic_by_source AS
SELECT 
    COALESCE(v.utm_source, 'direct') as source,
    COALESCE(v.utm_medium, 'none') as medium,
    COUNT(DISTINCT v.session_id) as visit_count,
    COUNT(pv.id) as pageview_count,
    COUNT(DISTINCT o.id) as order_count,
    COALESCE(SUM(o.total_value), 0) as revenue
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id
LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
GROUP BY v.utm_source, v.utm_medium
ORDER BY visit_count DESC;

-- 2. Top Products Summary View
CREATE VIEW top_products_summary AS
SELECT 
    p.product_id,
    p.title as product_name,
    p.category,
    COUNT(DISTINCT CASE WHEN e.event_name = 'product_view' THEN e.session_id END) as view_count,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END) as cart_adds,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_complete' THEN ce.session_id END) as purchases,
    COALESCE(SUM(CASE WHEN ce.event_type = 'checkout_complete' THEN ce.total_value ELSE 0 END), 0) as revenue
FROM products p
LEFT JOIN events e ON e.payload->>'product_id' = p.product_id
LEFT JOIN cart_events ce ON p.id = ce.product_id
GROUP BY p.product_id, p.title, p.category
ORDER BY revenue DESC;

-- 3. Conversion Funnel Summary View
CREATE VIEW conversion_funnel_summary AS
SELECT 
    COUNT(DISTINCT v.session_id) as total_visits,
    COUNT(DISTINCT CASE WHEN pv.url LIKE '%/product%' OR pv.path LIKE '%/product%' THEN v.session_id END) as product_views,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END) as add_to_cart,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_start' THEN ce.session_id END) as checkout_started,
    (SELECT COUNT(DISTINCT session_id) FROM orders WHERE status IN ('completed', 'processing')) as orders_completed
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id
LEFT JOIN cart_events ce ON v.session_id = ce.session_id;

-- 4. Hourly Performance View
CREATE VIEW hourly_performance AS
SELECT 
    EXTRACT(HOUR FROM v.created_at)::INTEGER as hour,
    COUNT(DISTINCT v.session_id) as visitors,
    COUNT(pv.id) as pageviews,
    COUNT(DISTINCT o.id) as orders,
    COALESCE(SUM(o.total_value), 0) as revenue
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id AND DATE(pv.created_at) = CURRENT_DATE
LEFT JOIN orders o ON v.session_id = o.session_id AND DATE(o.created_at) = CURRENT_DATE AND o.status IN ('completed', 'processing')
WHERE DATE(v.created_at) = CURRENT_DATE
GROUP BY EXTRACT(HOUR FROM v.created_at)::INTEGER
ORDER BY hour;

-- 5. Total Sales Summary View
CREATE VIEW total_sales_summary AS
SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(total_value), 0) as total_revenue
FROM orders
WHERE status IN ('completed', 'processing');

-- 6. Average Order Value (AOV) Summary View
CREATE VIEW aov_summary AS
SELECT 
    COALESCE(AVG(total_value), 0) as aov
FROM orders
WHERE status IN ('completed', 'processing');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant read access to authenticated users on all views
GRANT SELECT ON traffic_by_source TO authenticated;
GRANT SELECT ON top_products_summary TO authenticated;
GRANT SELECT ON conversion_funnel_summary TO authenticated;
GRANT SELECT ON hourly_performance TO authenticated;
GRANT SELECT ON total_sales_summary TO authenticated;
GRANT SELECT ON aov_summary TO authenticated;

-- Grant read access to anon users (for dashboard if using anon key)
GRANT SELECT ON traffic_by_source TO anon;
GRANT SELECT ON top_products_summary TO anon;
GRANT SELECT ON conversion_funnel_summary TO anon;
GRANT SELECT ON hourly_performance TO anon;
GRANT SELECT ON total_sales_summary TO anon;
GRANT SELECT ON aov_summary TO anon;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ All analytics dashboard views have been created successfully!';
    RAISE NOTICE '✅ Your analytics dashboard should now display data correctly.';
END $$;

