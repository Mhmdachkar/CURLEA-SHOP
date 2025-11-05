-- Fix Conversion Funnel Real-time View
-- This fixes the issue where purchases weren't being counted because orders weren't joined properly
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE VIEW conversion_funnel_realtime AS
SELECT 
    COUNT(DISTINCT v.session_id) as total_visits,
    COUNT(DISTINCT CASE WHEN pv.url LIKE '%/product%' OR pv.path LIKE '%/product%' THEN v.session_id END) as product_views,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END) as add_to_cart,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_start' THEN ce.session_id END) as checkout_start,
    -- Count ALL orders with status 'completed' or 'processing' in the last 30 days, not just those matching visits
    (SELECT COUNT(DISTINCT session_id) FROM orders WHERE status IN ('completed', 'processing') AND created_at >= NOW() - INTERVAL '30 days') as purchases,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as visit_to_cart_rate,
    ROUND(100.0 * (SELECT COUNT(DISTINCT session_id) FROM orders WHERE status IN ('completed', 'processing') AND created_at >= NOW() - INTERVAL '30 days') / NULLIF(COUNT(DISTINCT ce.session_id), 0), 2) as cart_to_purchase_rate
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id
LEFT JOIN cart_events ce ON v.session_id = ce.session_id
WHERE v.created_at >= NOW() - INTERVAL '30 days';

