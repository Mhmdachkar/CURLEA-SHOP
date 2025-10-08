-- =====================================================
-- DATABASE SETUP SCRIPT FOR DASHBOARD
-- Run this in your Supabase SQL Editor to create missing views
-- =====================================================

-- First, make sure you have the basic tables from schema.sql
-- Then run these views:

-- View: Traffic by Source (for pie chart)
CREATE OR REPLACE VIEW traffic_by_source AS
SELECT 
    COALESCE(utm_source, 'direct') as source,
    COUNT(DISTINCT session_id) as visit_count,
    COUNT(*) as total_visits
FROM visits
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_source
ORDER BY visit_count DESC;

-- View: Top Products Summary (for bar chart)
CREATE OR REPLACE VIEW top_products_summary AS
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

-- View: Conversion Funnel Summary (for funnel chart)
CREATE OR REPLACE VIEW conversion_funnel AS
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
CREATE OR REPLACE VIEW total_sales_summary AS
SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(total_value), 0) as total_revenue,
    COALESCE(SUM(profit), 0) as total_profit
FROM orders
WHERE status IN ('completed', 'processing')
    AND created_at >= NOW() - INTERVAL '30 days';

-- View: Average Order Value Summary (for stats cards)
CREATE OR REPLACE VIEW aov_summary AS
SELECT 
    COALESCE(AVG(total_value), 0) as aov
FROM orders
WHERE status IN ('completed', 'processing')
    AND created_at >= NOW() - INTERVAL '30 days';

-- View: Hourly Performance (for line chart)
CREATE OR REPLACE VIEW hourly_performance AS
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
GRANT SELECT ON conversion_funnel TO anon;
GRANT SELECT ON total_sales_summary TO anon;
GRANT SELECT ON aov_summary TO anon;
GRANT SELECT ON hourly_performance TO anon;

-- Grant permissions for authenticated users
GRANT SELECT ON traffic_by_source TO authenticated;
GRANT SELECT ON top_products_summary TO authenticated;
GRANT SELECT ON conversion_funnel TO authenticated;
GRANT SELECT ON total_sales_summary TO authenticated;
GRANT SELECT ON aov_summary TO authenticated;
GRANT SELECT ON hourly_performance TO authenticated;

-- Insert some sample data for testing (optional)
-- Uncomment these lines if you want to test with sample data

/*
-- Sample visits
INSERT INTO visits (session_id, ip_address, device, browser, country, utm_source, utm_medium) VALUES
('session-1', '192.168.1.1', 'Desktop', 'Chrome', 'US', 'google', 'cpc'),
('session-2', '192.168.1.2', 'Mobile', 'Safari', 'US', 'facebook', 'social'),
('session-3', '192.168.1.3', 'Desktop', 'Firefox', 'CA', 'direct', 'none'),
('session-4', '192.168.1.4', 'Mobile', 'Chrome', 'UK', 'instagram', 'social'),
('session-5', '192.168.1.5', 'Desktop', 'Chrome', 'US', 'google', 'organic');

-- Sample page views
INSERT INTO page_views (session_id, url, path, title, time_on_page) VALUES
('session-1', 'https://curlea.com/', '/', 'Homepage', 45),
('session-1', 'https://curlea.com/product/heatless-curler', '/product/heatless-curler', 'Product Page', 120),
('session-2', 'https://curlea.com/', '/', 'Homepage', 30),
('session-3', 'https://curlea.com/products', '/products', 'Products', 60);

-- Sample events
INSERT INTO events (session_id, event_name, event_category, payload) VALUES
('session-1', 'product_view', 'engagement', '{"product_id": "heatless-curler-1"}'),
('session-2', 'product_view', 'engagement', '{"product_id": "silk-bonnet-1"}'),
('session-3', 'product_view', 'engagement', '{"product_id": "curly-claw-1"}');

-- Sample cart events
INSERT INTO cart_events (session_id, event_type, external_product_id, product_title, quantity, price, total_value) VALUES
('session-1', 'add', 'heatless-curler-1', 'Heatless Hair Curling Rod Set', 1, 29.99, 29.99),
('session-2', 'add', 'silk-bonnet-1', 'PEAU DE SOIE Satin Bonnet', 2, 24.99, 49.98),
('session-3', 'add', 'curly-claw-1', 'Curly Hair Claw Clip', 1, 19.99, 19.99);

-- Sample orders
INSERT INTO orders (order_id, session_id, customer_email, subtotal, total_value, status) VALUES
('order-1', 'session-1', 'customer1@example.com', 29.99, 29.99, 'completed'),
('order-2', 'session-2', 'customer2@example.com', 49.98, 49.98, 'completed');
*/

-- Success message
SELECT 'Database views created successfully! Your dashboard should now work with real-time data.' as message;
