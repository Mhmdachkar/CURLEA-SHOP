-- =====================================================
-- MISSING VIEWS FOR DASHBOARD
-- These views are referenced in the dashboard but don't exist yet
-- =====================================================

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
ALTER VIEW traffic_by_source SET (security_invoker = true);

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
ALTER VIEW top_products_summary SET (security_invoker = true);

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
ALTER VIEW conversion_funnel SET (security_invoker = true);

-- View: Total Sales Summary (for stats cards)
CREATE OR REPLACE VIEW total_sales_summary AS
SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(total_value), 0) as total_revenue,
    COALESCE(SUM(profit), 0) as total_profit
FROM orders
WHERE status IN ('completed', 'processing')
    AND created_at >= NOW() - INTERVAL '30 days';
ALTER VIEW total_sales_summary SET (security_invoker = true);

-- View: Average Order Value Summary (for stats cards)
CREATE OR REPLACE VIEW aov_summary AS
SELECT 
    COALESCE(AVG(total_value), 0) as aov
FROM orders
WHERE status IN ('completed', 'processing')
    AND created_at >= NOW() - INTERVAL '30 days';
ALTER VIEW aov_summary SET (security_invoker = true);

-- View: Real-time Active Visitors
CREATE OR REPLACE VIEW active_visitors_realtime AS
SELECT 
    COUNT(DISTINCT session_id) as active_count
FROM page_views
WHERE created_at >= NOW() - INTERVAL '5 minutes';
ALTER VIEW active_visitors_realtime SET (security_invoker = true);

-- View: Today's Performance
CREATE OR REPLACE VIEW today_performance AS
SELECT 
    COUNT(DISTINCT v.session_id) as visitors_today,
    COUNT(pv.id) as pageviews_today,
    COUNT(DISTINCT o.id) as orders_today,
    COALESCE(SUM(o.total_value), 0) as revenue_today
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id AND DATE(pv.created_at) = CURRENT_DATE
LEFT JOIN orders o ON v.session_id = o.session_id AND DATE(o.created_at) = CURRENT_DATE 
    AND o.status IN ('completed', 'processing')
WHERE DATE(v.created_at) = CURRENT_DATE;
ALTER VIEW today_performance SET (security_invoker = true);

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
ALTER VIEW hourly_performance SET (security_invoker = true);

-- View: Geographic Performance
CREATE OR REPLACE VIEW geographic_performance AS
SELECT 
    COALESCE(country, 'Unknown') as country,
    COUNT(DISTINCT session_id) as visitors,
    COUNT(DISTINCT o.id) as orders,
    COALESCE(SUM(o.total_value), 0) as revenue
FROM visits v
LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
WHERE v.created_at >= NOW() - INTERVAL '30 days'
GROUP BY country
ORDER BY revenue DESC
LIMIT 20;
ALTER VIEW geographic_performance SET (security_invoker = true);

-- View: Device Performance
CREATE OR REPLACE VIEW device_performance AS
SELECT 
    CASE 
        WHEN is_mobile THEN 'Mobile'
        WHEN is_tablet THEN 'Tablet'
        ELSE 'Desktop'
    END as device_type,
    COUNT(DISTINCT session_id) as visitors,
    COUNT(DISTINCT o.id) as orders,
    COALESCE(SUM(o.total_value), 0) as revenue,
    ROUND(100.0 * COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT session_id), 0), 2) as conversion_rate
FROM visits v
LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
WHERE v.created_at >= NOW() - INTERVAL '30 days'
GROUP BY device_type
ORDER BY visitors DESC;
ALTER VIEW device_performance SET (security_invoker = true);

-- Grant permissions for anonymous access (dashboard uses anon key)
GRANT SELECT ON traffic_by_source TO anon;
GRANT SELECT ON top_products_summary TO anon;
GRANT SELECT ON conversion_funnel TO anon;
GRANT SELECT ON total_sales_summary TO anon;
GRANT SELECT ON aov_summary TO anon;
GRANT SELECT ON active_visitors_realtime TO anon;
GRANT SELECT ON today_performance TO anon;
GRANT SELECT ON hourly_performance TO anon;
GRANT SELECT ON geographic_performance TO anon;
GRANT SELECT ON device_performance TO anon;

-- Grant permissions for authenticated users
GRANT SELECT ON traffic_by_source TO authenticated;
GRANT SELECT ON top_products_summary TO authenticated;
GRANT SELECT ON conversion_funnel TO authenticated;
GRANT SELECT ON total_sales_summary TO authenticated;
GRANT SELECT ON aov_summary TO authenticated;
GRANT SELECT ON active_visitors_realtime TO authenticated;
GRANT SELECT ON today_performance TO authenticated;
GRANT SELECT ON hourly_performance TO authenticated;
GRANT SELECT ON geographic_performance TO authenticated;
GRANT SELECT ON device_performance TO authenticated;
