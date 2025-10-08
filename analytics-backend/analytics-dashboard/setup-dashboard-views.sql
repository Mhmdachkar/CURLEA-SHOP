-- =====================================================
-- DASHBOARD VIEWS SETUP - CORRECTED VERSION
-- Run this in your Supabase SQL Editor
-- This version works with the existing conversion_funnel TABLE
-- =====================================================

-- View: Traffic by Source (for pie chart)
DROP VIEW IF EXISTS traffic_by_source;
CREATE VIEW traffic_by_source AS
SELECT 
    COALESCE(utm_source, 'direct') as source,
    COUNT(DISTINCT session_id) as visit_count,
    COUNT(*) as total_visits
FROM visits
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_source
ORDER BY visit_count DESC;

-- View: Top Products Summary (for bar chart)
DROP VIEW IF EXISTS top_products_summary;
CREATE VIEW top_products_summary AS
SELECT 
    p.product_id,
    p.title as product_name,
    p.category,
    COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_name = 'product_view') as view_count,
    COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'add') as cart_adds,
    COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'checkout_complete') as purchases,
    COALESCE(SUM(ce.total_value) FILTER (WHERE ce.event_type = 'checkout_complete'), 0) as revenue
FROM products p
LEFT JOIN events e ON e.payload->>'product_id' = p.product_id 
    AND e.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN cart_events ce ON p.id = ce.product_id 
    AND ce.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.product_id, p.title, p.category
ORDER BY view_count DESC
LIMIT 10;

-- View: Conversion Funnel Summary (uses the existing conversion_funnel_realtime view)
-- Since conversion_funnel is a table, we'll create an alias view
DROP VIEW IF EXISTS conversion_funnel_summary;
CREATE VIEW conversion_funnel_summary AS
SELECT 
    COUNT(DISTINCT v.session_id) as total_visits,
    COUNT(DISTINCT CASE WHEN pv.url LIKE '%/product%' OR pv.path LIKE '%/product%' THEN v.session_id END) as product_views,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END) as add_to_cart,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_start' THEN ce.session_id END) as checkout_started,
    COUNT(DISTINCT CASE WHEN o.status IN ('completed', 'processing') THEN o.session_id END) as orders_completed
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id
LEFT JOIN cart_events ce ON v.session_id = ce.session_id
LEFT JOIN orders o ON v.session_id = o.session_id
WHERE v.created_at >= NOW() - INTERVAL '30 days';

-- View: Total Sales Summary (for stats cards)
DROP VIEW IF EXISTS total_sales_summary;
CREATE VIEW total_sales_summary AS
SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(total_value), 0) as total_revenue,
    COALESCE(SUM(profit), 0) as total_profit
FROM orders
WHERE status IN ('completed', 'processing')
    AND created_at >= NOW() - INTERVAL '30 days';

-- View: Average Order Value Summary (for stats cards)
DROP VIEW IF EXISTS aov_summary;
CREATE VIEW aov_summary AS
SELECT 
    COALESCE(AVG(total_value), 0) as aov
FROM orders
WHERE status IN ('completed', 'processing')
    AND created_at >= NOW() - INTERVAL '30 days';

-- View: Hourly Performance (for line chart)
DROP VIEW IF EXISTS hourly_performance;
CREATE VIEW hourly_performance AS
SELECT 
    EXTRACT(HOUR FROM v.created_at)::INTEGER as hour,
    COUNT(DISTINCT v.session_id) as visitors,
    COUNT(pv.id) as pageviews,
    COUNT(DISTINCT o.id) as orders,
    COALESCE(SUM(o.total_value), 0) as revenue
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id AND DATE(pv.created_at) = CURRENT_DATE
LEFT JOIN orders o ON v.session_id = o.session_id AND DATE(o.created_at) = CURRENT_DATE 
    AND o.status IN ('completed', 'processing')
WHERE DATE(v.created_at) = CURRENT_DATE
GROUP BY hour
ORDER BY hour;

-- Grant permissions for anonymous access (dashboard uses anon key)
GRANT SELECT ON traffic_by_source TO anon;
GRANT SELECT ON top_products_summary TO anon;
GRANT SELECT ON conversion_funnel_summary TO anon;
GRANT SELECT ON total_sales_summary TO anon;
GRANT SELECT ON aov_summary TO anon;
GRANT SELECT ON hourly_performance TO anon;

-- Grant permissions for authenticated users
GRANT SELECT ON traffic_by_source TO authenticated;
GRANT SELECT ON top_products_summary TO authenticated;
GRANT SELECT ON conversion_funnel_summary TO authenticated;
GRANT SELECT ON total_sales_summary TO authenticated;
GRANT SELECT ON aov_summary TO authenticated;
GRANT SELECT ON hourly_performance TO authenticated;

-- Enable real-time for the tables the dashboard needs to listen to
-- This allows the dashboard to get instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE visits;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE page_views;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_events;
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Success message
SELECT 'Dashboard views created successfully! Real-time analytics is now enabled.' as status,
       'Visit http://localhost:3000 to see your dashboard' as next_step;
