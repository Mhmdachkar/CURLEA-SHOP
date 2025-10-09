-- =====================================================
-- 🛒 CART QUANTITY FIX - Run This in Supabase SQL Editor
-- Fixes dashboard to show actual quantities instead of session counts
-- =====================================================

-- Drop existing views
DROP VIEW IF EXISTS top_products_summary;
DROP VIEW IF EXISTS conversion_funnel_summary;

-- Recreate Top Products Summary with quantity fix
CREATE VIEW top_products_summary AS
SELECT 
    p.product_id,
    p.title as product_name,
    p.category,
    COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_name = 'product_view') as view_count,
    COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'add') as unique_cart_adds,
    COALESCE(SUM(ce.quantity) FILTER (WHERE ce.event_type = 'add'), 0) as cart_adds,
    COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'checkout_complete') as purchases,
    COALESCE(SUM(ce.total_value) FILTER (WHERE ce.event_type = 'checkout_complete'), 0) as revenue
FROM products p
LEFT JOIN events e ON e.payload->>'product_id' = p.product_id 
    AND e.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN cart_events ce ON p.id = ce.product_id 
    AND ce.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.product_id, p.title, p.category
ORDER BY cart_adds DESC
LIMIT 10;

-- Recreate Conversion Funnel Summary with quantity fix
CREATE VIEW conversion_funnel_summary AS
SELECT 
    COUNT(DISTINCT v.session_id) as total_visits,
    COUNT(DISTINCT CASE WHEN pv.url LIKE '%/product%' OR pv.path LIKE '%/product%' THEN v.session_id END) as product_views,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END) as unique_cart_adds,
    COALESCE(SUM(CASE WHEN ce.event_type = 'add' THEN ce.quantity ELSE 0 END), 0) as add_to_cart,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_start' THEN ce.session_id END) as checkout_started,
    COUNT(DISTINCT CASE WHEN o.status IN ('completed', 'processing') THEN o.session_id END) as orders_completed
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id
LEFT JOIN cart_events ce ON v.session_id = ce.session_id
LEFT JOIN orders o ON v.session_id = o.session_id
WHERE v.created_at >= NOW() - INTERVAL '30 days';

-- Grant permissions
GRANT SELECT ON top_products_summary TO anon;
GRANT SELECT ON top_products_summary TO authenticated;
GRANT SELECT ON conversion_funnel_summary TO anon;
GRANT SELECT ON conversion_funnel_summary TO authenticated;

-- Test the fix with sample data (optional - uncomment to test)
/*
INSERT INTO cart_events (
    session_id, 
    event_type, 
    external_product_id, 
    product_title, 
    quantity, 
    price, 
    total_value
) VALUES (
    'test-session-' || NOW(),
    'add',
    'heatless-curler-1',
    'Heatless Hair Curling Rod Set',
    5,  -- Quantity = 5
    29.99,
    149.95
);
*/

-- Success message
SELECT 'Cart quantity fix applied successfully! Dashboard will now show correct quantities.' as status,
       'Refresh your dashboard to see the updated numbers' as next_step;
