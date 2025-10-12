-- Simple Performance Test - Run this to get actual execution times
-- This will test basic queries and show you real performance numbers

-- Test 1: Simple table query performance
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT COUNT(*) FROM visits WHERE created_at >= NOW() - INTERVAL '7 days';

-- Test 2: Join query performance (more complex)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
    v.session_id,
    COUNT(pv.id) as page_views
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id
WHERE v.created_at >= NOW() - INTERVAL '7 days'
GROUP BY v.session_id
LIMIT 100;

-- Test 3: Aggregation query performance
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
    COUNT(*) as total_visits,
    COUNT(DISTINCT session_id) as unique_visitors,
    COUNT(DISTINCT country) as countries
FROM visits
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Test 4: Check if we have any data to test with
SELECT 
    'visits' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM visits

UNION ALL

SELECT 
    'page_views' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM page_views

UNION ALL

SELECT 
    'cart_events' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM cart_events;

-- Success message with actual timing instructions
SELECT 
    'Simple performance test completed!' as status,
    'Look at the JSON results above for "Actual Total Time" values.' as instructions,
    'Each EXPLAIN ANALYZE query shows execution time in milliseconds.' as explanation;
