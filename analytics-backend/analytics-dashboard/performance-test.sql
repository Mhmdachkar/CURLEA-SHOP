-- Performance Testing Script for Database Queries
-- Run this in Supabase SQL Editor to measure actual query performance

-- Test 1: Measure dashboard view query performance
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
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

-- Test 2: Measure conversion funnel query performance
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
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

-- Test 3: Measure traffic sources query performance
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
    COALESCE(utm_source, 'direct') as source,
    COUNT(DISTINCT session_id) as visit_count,
    COUNT(*) as total_visits
FROM visits
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_source
ORDER BY visit_count DESC;

-- Test 4: Check index usage and performance
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Test 5: Check table sizes and statistics
SELECT 
    schemaname,
    relname as tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- Test 6: Performance comparison with and without indexes
-- First, let's see current query plans
EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) FROM cart_events WHERE created_at >= NOW() - INTERVAL '7 days';

EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*) FROM visits WHERE created_at >= NOW() - INTERVAL '7 days';

EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*) FROM page_views WHERE created_at >= NOW() - INTERVAL '7 days';

-- Test 7: Check for missing indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Test 8: Measure view performance vs direct queries
-- Note: Supabase doesn't support \timing, but we can measure with EXPLAIN ANALYZE

-- Time the view queries with EXPLAIN ANALYZE
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM top_products_summary LIMIT 10;
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM conversion_funnel_summary;
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM traffic_by_source LIMIT 10;

-- Success message with instructions
SELECT 'Performance test completed! Check the execution times above.' as status,
       'Look for "Execution Time" in the EXPLAIN ANALYZE results.' as instructions,
       'Compare the timing results to establish baseline performance.' as next_steps;
