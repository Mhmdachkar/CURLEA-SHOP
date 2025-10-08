-- =====================================================
-- ADVANCED ANALYTICS FUNCTIONS
-- Additional SQL functions for complex queries
-- =====================================================

-- Function: Get top products by metric
CREATE OR REPLACE FUNCTION get_top_products(
    metric TEXT DEFAULT 'revenue', -- 'revenue', 'units', 'profit'
    limit_count INTEGER DEFAULT 10,
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    product_id TEXT,
    product_title TEXT,
    category TEXT,
    units_sold BIGINT,
    revenue NUMERIC,
    cost NUMERIC,
    profit NUMERIC,
    avg_price NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.product_id,
        p.title as product_title,
        p.category,
        COUNT(ce.id) as units_sold,
        COALESCE(SUM(ce.total_value), 0) as revenue,
        COALESCE(SUM(p.cost * ce.quantity), 0) as cost,
        COALESCE(SUM(ce.total_value) - SUM(p.cost * ce.quantity), 0) as profit,
        COALESCE(AVG(ce.price), 0) as avg_price
    FROM products p
    LEFT JOIN cart_events ce ON p.id = ce.product_id 
        AND ce.event_type = 'checkout_complete'
        AND ce.created_at BETWEEN start_date AND end_date
    GROUP BY p.product_id, p.title, p.category
    ORDER BY 
        CASE 
            WHEN metric = 'revenue' THEN COALESCE(SUM(ce.total_value), 0)
            WHEN metric = 'units' THEN COUNT(ce.id)::NUMERIC
            WHEN metric = 'profit' THEN COALESCE(SUM(ce.total_value) - SUM(p.cost * ce.quantity), 0)
            ELSE COALESCE(SUM(ce.total_value), 0)
        END DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get traffic by source with conversion metrics
CREATE OR REPLACE FUNCTION get_traffic_by_source(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    source TEXT,
    medium TEXT,
    visitors BIGINT,
    sessions BIGINT,
    pageviews BIGINT,
    orders BIGINT,
    revenue NUMERIC,
    conversion_rate NUMERIC,
    revenue_per_visitor NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(v.utm_source, 'direct') as source,
        COALESCE(v.utm_medium, 'none') as medium,
        COUNT(DISTINCT v.session_id) as visitors,
        COUNT(v.id) as sessions,
        COUNT(pv.id) as pageviews,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(o.total_value), 0) as revenue,
        ROUND(100.0 * COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as conversion_rate,
        ROUND(COALESCE(SUM(o.total_value), 0) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as revenue_per_visitor
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
    WHERE v.created_at BETWEEN start_date AND end_date
    GROUP BY v.utm_source, v.utm_medium
    ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get geographic breakdown
CREATE OR REPLACE FUNCTION get_traffic_by_country(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW(),
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    country TEXT,
    visitors BIGINT,
    pageviews BIGINT,
    orders BIGINT,
    revenue NUMERIC,
    avg_order_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(v.country, 'Unknown') as country,
        COUNT(DISTINCT v.session_id) as visitors,
        COUNT(pv.id) as pageviews,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(o.total_value), 0) as revenue,
        COALESCE(AVG(o.total_value), 0) as avg_order_value
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
    WHERE v.created_at BETWEEN start_date AND end_date
    GROUP BY v.country
    ORDER BY revenue DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get device breakdown
CREATE OR REPLACE FUNCTION get_traffic_by_device(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    device_type TEXT,
    visitors BIGINT,
    pageviews BIGINT,
    avg_session_duration NUMERIC,
    bounce_rate NUMERIC,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN v.is_mobile THEN 'Mobile'
            WHEN v.is_tablet THEN 'Tablet'
            ELSE 'Desktop'
        END as device_type,
        COUNT(DISTINCT v.session_id) as visitors,
        COUNT(pv.id) as pageviews,
        ROUND(AVG(pv.time_on_page)::NUMERIC, 2) as avg_session_duration,
        ROUND(100.0 * COUNT(*) FILTER (WHERE pv.bounce = true) / NULLIF(COUNT(pv.id), 0), 2) as bounce_rate,
        ROUND(100.0 * COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as conversion_rate
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
    WHERE v.created_at BETWEEN start_date AND end_date
    GROUP BY device_type
    ORDER BY visitors DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get conversion funnel with drop-off rates
CREATE OR REPLACE FUNCTION get_conversion_funnel_detailed(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    step TEXT,
    count BIGINT,
    percentage NUMERIC,
    drop_off_rate NUMERIC
) AS $$
DECLARE
    total_visits BIGINT;
    product_views BIGINT;
    add_to_cart BIGINT;
    checkout_start BIGINT;
    purchases BIGINT;
BEGIN
    -- Calculate funnel metrics
    SELECT 
        COUNT(DISTINCT v.session_id),
        COUNT(DISTINCT CASE WHEN pv.url LIKE '%/product%' OR pv.path LIKE '%/product%' THEN v.session_id END),
        COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END),
        COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_start' THEN ce.session_id END),
        COUNT(DISTINCT CASE WHEN o.status IN ('completed', 'processing') THEN o.session_id END)
    INTO total_visits, product_views, add_to_cart, checkout_start, purchases
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    LEFT JOIN cart_events ce ON v.session_id = ce.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id
    WHERE v.created_at BETWEEN start_date AND end_date;

    -- Return funnel with drop-off rates
    RETURN QUERY
    SELECT '1. Visits'::TEXT, total_visits, 100.0, 0.0
    UNION ALL
    SELECT '2. Product Views'::TEXT, product_views, ROUND(100.0 * product_views / NULLIF(total_visits, 0), 2), 
           ROUND(100.0 * (total_visits - product_views) / NULLIF(total_visits, 0), 2)
    UNION ALL
    SELECT '3. Add to Cart'::TEXT, add_to_cart, ROUND(100.0 * add_to_cart / NULLIF(total_visits, 0), 2),
           ROUND(100.0 * (product_views - add_to_cart) / NULLIF(product_views, 0), 2)
    UNION ALL
    SELECT '4. Checkout Start'::TEXT, checkout_start, ROUND(100.0 * checkout_start / NULLIF(total_visits, 0), 2),
           ROUND(100.0 * (add_to_cart - checkout_start) / NULLIF(add_to_cart, 0), 2)
    UNION ALL
    SELECT '5. Purchase'::TEXT, purchases, ROUND(100.0 * purchases / NULLIF(total_visits, 0), 2),
           ROUND(100.0 * (checkout_start - purchases) / NULLIF(checkout_start, 0), 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get cohort analysis (customers by first purchase date)
CREATE OR REPLACE FUNCTION get_cohort_analysis(
    cohort_type TEXT DEFAULT 'monthly' -- 'daily', 'weekly', 'monthly'
)
RETURNS TABLE (
    cohort_period TEXT,
    total_customers BIGINT,
    total_orders BIGINT,
    total_revenue NUMERIC,
    avg_order_value NUMERIC,
    repeat_purchase_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH first_purchases AS (
        SELECT 
            customer_email,
            MIN(created_at) as first_purchase_date
        FROM orders
        WHERE status IN ('completed', 'processing')
        GROUP BY customer_email
    ),
    cohorts AS (
        SELECT 
            CASE 
                WHEN cohort_type = 'daily' THEN TO_CHAR(fp.first_purchase_date, 'YYYY-MM-DD')
                WHEN cohort_type = 'weekly' THEN TO_CHAR(DATE_TRUNC('week', fp.first_purchase_date), 'YYYY-MM-DD')
                ELSE TO_CHAR(DATE_TRUNC('month', fp.first_purchase_date), 'YYYY-MM')
            END as cohort_period,
            fp.customer_email,
            COUNT(o.id) as order_count,
            SUM(o.total_value) as revenue
        FROM first_purchases fp
        JOIN orders o ON fp.customer_email = o.customer_email AND o.status IN ('completed', 'processing')
        GROUP BY cohort_period, fp.customer_email
    )
    SELECT 
        c.cohort_period,
        COUNT(DISTINCT c.customer_email) as total_customers,
        SUM(c.order_count)::BIGINT as total_orders,
        COALESCE(SUM(c.revenue), 0) as total_revenue,
        COALESCE(AVG(c.revenue / c.order_count), 0) as avg_order_value,
        ROUND(100.0 * COUNT(*) FILTER (WHERE c.order_count > 1) / NULLIF(COUNT(*), 0), 2) as repeat_purchase_rate
    FROM cohorts c
    GROUP BY c.cohort_period
    ORDER BY c.cohort_period DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get abandoned cart details with recovery potential
CREATE OR REPLACE FUNCTION get_abandoned_carts_detailed(
    hours_since_abandonment INTEGER DEFAULT 24,
    limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
    session_id TEXT,
    visit_time TIMESTAMPTZ,
    last_activity TIMESTAMPTZ,
    hours_since_last_activity NUMERIC,
    cart_value NUMERIC,
    items_count BIGINT,
    utm_source TEXT,
    utm_campaign TEXT,
    country TEXT,
    device TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.session_id,
        v.created_at as visit_time,
        MAX(ce.created_at) as last_activity,
        ROUND(EXTRACT(EPOCH FROM (NOW() - MAX(ce.created_at))) / 3600, 2) as hours_since_last_activity,
        SUM(ce.total_value) FILTER (WHERE ce.event_type = 'add') as cart_value,
        COUNT(*) FILTER (WHERE ce.event_type = 'add') as items_count,
        v.utm_source,
        v.utm_campaign,
        v.country,
        v.device
    FROM visits v
    JOIN cart_events ce ON v.session_id = ce.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id
    WHERE ce.event_type IN ('add', 'checkout_start')
        AND o.id IS NULL
        AND ce.created_at >= NOW() - (hours_since_abandonment || ' hours')::INTERVAL
    GROUP BY v.session_id, v.created_at, v.utm_source, v.utm_campaign, v.country, v.device
    ORDER BY cart_value DESC, last_activity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get real-time dashboard stats
CREATE OR REPLACE FUNCTION get_realtime_stats()
RETURNS TABLE (
    active_visitors INTEGER,
    visitors_today BIGINT,
    pageviews_today BIGINT,
    orders_today BIGINT,
    revenue_today NUMERIC,
    active_carts BIGINT,
    trending_product TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE created_at >= NOW() - INTERVAL '5 minutes')::INTEGER as active_visitors,
        (SELECT COUNT(DISTINCT session_id) FROM visits WHERE DATE(created_at) = CURRENT_DATE) as visitors_today,
        (SELECT COUNT(*) FROM page_views WHERE DATE(created_at) = CURRENT_DATE) as pageviews_today,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status IN ('completed', 'processing')) as orders_today,
        (SELECT COALESCE(SUM(total_value), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status IN ('completed', 'processing')) as revenue_today,
        (SELECT COUNT(DISTINCT session_id) FROM cart_events WHERE created_at >= NOW() - INTERVAL '1 hour' AND event_type = 'add') as active_carts,
        (SELECT p.title FROM products p 
         JOIN cart_events ce ON p.id = ce.product_id 
         WHERE ce.created_at >= NOW() - INTERVAL '24 hours' 
         GROUP BY p.id, p.title 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as trending_product;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get product performance comparison
CREATE OR REPLACE FUNCTION compare_product_performance(
    product_ids TEXT[],
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    product_id TEXT,
    product_title TEXT,
    views BIGINT,
    add_to_cart BIGINT,
    purchases BIGINT,
    revenue NUMERIC,
    view_to_cart_rate NUMERIC,
    cart_to_purchase_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.product_id,
        p.title as product_title,
        COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_name = 'product_view') as views,
        COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'add') as add_to_cart,
        COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'checkout_complete') as purchases,
        COALESCE(SUM(ce.total_value) FILTER (WHERE ce.event_type = 'checkout_complete'), 0) as revenue,
        ROUND(100.0 * COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'add') / 
              NULLIF(COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_name = 'product_view'), 0), 2) as view_to_cart_rate,
        ROUND(100.0 * COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'checkout_complete') / 
              NULLIF(COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'add'), 0), 2) as cart_to_purchase_rate
    FROM products p
    LEFT JOIN events e ON e.payload->>'product_id' = p.product_id 
        AND e.created_at BETWEEN start_date AND end_date
    LEFT JOIN cart_events ce ON p.id = ce.product_id 
        AND ce.created_at BETWEEN start_date AND end_date
    WHERE p.product_id = ANY(product_ids)
    GROUP BY p.product_id, p.title
    ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get time-based performance trends
CREATE OR REPLACE FUNCTION get_hourly_performance_trends(
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    hour INTEGER,
    visitors BIGINT,
    pageviews BIGINT,
    cart_events BIGINT,
    orders BIGINT,
    revenue NUMERIC,
    avg_session_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM v.created_at)::INTEGER as hour,
        COUNT(DISTINCT v.session_id) as visitors,
        COUNT(pv.id) as pageviews,
        COUNT(ce.id) as cart_events,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(o.total_value), 0) as revenue,
        ROUND(COALESCE(SUM(o.total_value), 0) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as avg_session_value
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id AND DATE(pv.created_at) = target_date
    LEFT JOIN cart_events ce ON v.session_id = ce.session_id AND DATE(ce.created_at) = target_date
    LEFT JOIN orders o ON v.session_id = o.session_id AND DATE(o.created_at) = target_date AND o.status IN ('completed', 'processing')
    WHERE DATE(v.created_at) = target_date
    GROUP BY hour
    ORDER BY hour;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- SCHEDULED JOBS / MAINTENANCE FUNCTIONS
-- =====================================================

-- Function: Clean old data (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data(retention_days INTEGER DEFAULT 365)
RETURNS VOID AS $$
BEGIN
    DELETE FROM page_views WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    DELETE FROM events WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    DELETE FROM cart_events WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    DELETE FROM visits WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    
    RAISE NOTICE 'Cleaned up analytics data older than % days', retention_days;
END;
$$ LANGUAGE plpgsql;

-- Function: Vacuum and analyze tables for performance
CREATE OR REPLACE FUNCTION optimize_analytics_tables()
RETURNS VOID AS $$
BEGIN
    VACUUM ANALYZE visits;
    VACUUM ANALYZE page_views;
    VACUUM ANALYZE events;
    VACUUM ANALYZE cart_events;
    VACUUM ANALYZE orders;
    
    RAISE NOTICE 'Optimized analytics tables';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_top_products IS 'Get top performing products by revenue, units sold, or profit';
COMMENT ON FUNCTION get_traffic_by_source IS 'Get traffic breakdown by UTM source and medium with conversion metrics';
COMMENT ON FUNCTION get_conversion_funnel_detailed IS 'Get detailed conversion funnel with drop-off rates at each step';
COMMENT ON FUNCTION get_abandoned_carts_detailed IS 'Get detailed abandoned cart information for recovery campaigns';
COMMENT ON FUNCTION get_realtime_stats IS 'Get real-time dashboard statistics for current activity';

