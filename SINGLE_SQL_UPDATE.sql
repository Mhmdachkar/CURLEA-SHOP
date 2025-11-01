-- =====================================================
-- UPDATE CONVERSION FUNNEL FUNCTION
-- Run this ONE SQL statement in Supabase SQL Editor
-- =====================================================

CREATE OR REPLACE FUNCTION update_conversion_funnel_aggregates(target_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO conversion_funnel (date, total_visits, product_views, add_to_cart, checkout_start, checkout_complete, revenue)
    SELECT 
        target_date,
        COUNT(DISTINCT v.session_id),
        COUNT(DISTINCT CASE WHEN pv.url LIKE '%/product%' THEN v.session_id END),
        COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END),
        COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_start' THEN ce.session_id END),
        COUNT(DISTINCT o.session_id),
        COALESCE(SUM(o.total_value), 0)
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id AND DATE(pv.created_at) = target_date
    LEFT JOIN cart_events ce ON v.session_id = ce.session_id AND DATE(ce.created_at) = target_date
    LEFT JOIN orders o ON v.session_id = o.session_id AND DATE(o.created_at) = target_date AND o.status IN ('completed', 'processing')
    WHERE DATE(v.created_at) = target_date
    ON CONFLICT (date, COALESCE(hour, -1)) 
    DO UPDATE SET
        total_visits = EXCLUDED.total_visits,
        product_views = EXCLUDED.product_views,
        add_to_cart = EXCLUDED.add_to_cart,
        checkout_start = EXCLUDED.checkout_start,
        checkout_complete = EXCLUDED.checkout_complete,
        revenue = EXCLUDED.revenue,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SET search_path = public;

