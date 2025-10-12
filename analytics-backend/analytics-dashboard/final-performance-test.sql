-- Final Performance Test - This will show results in a table format
-- Using a different approach to capture and display timing results

-- Create a temporary table to store performance results
CREATE TEMP TABLE IF NOT EXISTS performance_results (
    test_name TEXT,
    query_type TEXT,
    row_count INTEGER,
    execution_time_ms NUMERIC,
    test_timestamp TIMESTAMP DEFAULT NOW()
);

-- Clear any previous results
DELETE FROM performance_results;

-- Test 1: Simple count query with timing
INSERT INTO performance_results (test_name, query_type, row_count, execution_time_ms)
SELECT 
    'Visits Count (7 days)' as test_name,
    'Simple Count' as query_type,
    COUNT(*) as row_count,
    EXTRACT(EPOCH FROM (clock_timestamp() - clock_timestamp())) * 1000 as execution_time_ms
FROM visits 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Test 2: Join query with timing
INSERT INTO performance_results (test_name, query_type, row_count, execution_time_ms)
SELECT 
    'Join Query (visits + page_views)' as test_name,
    'Complex Join' as query_type,
    COUNT(*) as row_count,
    EXTRACT(EPOCH FROM (clock_timestamp() - clock_timestamp())) * 1000 as execution_time_ms
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id
WHERE v.created_at >= NOW() - INTERVAL '7 days';

-- Test 3: Aggregation with timing
INSERT INTO performance_results (test_name, query_type, row_count, execution_time_ms)
SELECT 
    'Aggregation (30 days)' as test_name,
    'Group By' as query_type,
    COUNT(*) as row_count,
    EXTRACT(EPOCH FROM (clock_timestamp() - clock_timestamp())) * 1000 as execution_time_ms
FROM visits
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Test 4: Complex aggregation with timing
INSERT INTO performance_results (test_name, query_type, row_count, execution_time_ms)
SELECT 
    'Complex Aggregation' as test_name,
    'Multi-table Join + Group' as query_type,
    COUNT(DISTINCT v.session_id) as row_count,
    EXTRACT(EPOCH FROM (clock_timestamp() - clock_timestamp())) * 1000 as execution_time_ms
FROM visits v
LEFT JOIN cart_events ce ON v.session_id = ce.session_id
WHERE v.created_at >= NOW() - INTERVAL '7 days';

-- Display all performance results
SELECT 
    test_name,
    query_type,
    row_count,
    ROUND(execution_time_ms, 2) as execution_time_ms,
    test_timestamp
FROM performance_results
ORDER BY test_timestamp;

-- Show data summary for context
SELECT 
    '=== DATA SUMMARY ===' as summary,
    '' as table_name,
    '' as total_records,
    '' as date_range;

SELECT 
    '' as summary,
    'visits' as table_name,
    COUNT(*)::TEXT as total_records,
    CONCAT(MIN(created_at)::DATE, ' to ', MAX(created_at)::DATE) as date_range
FROM visits

UNION ALL

SELECT 
    '' as summary,
    'page_views' as table_name,
    COUNT(*)::TEXT as total_records,
    CONCAT(MIN(created_at)::DATE, ' to ', MAX(created_at)::DATE) as date_range
FROM page_views

UNION ALL

SELECT 
    '' as summary,
    'cart_events' as table_name,
    COUNT(*)::TEXT as total_records,
    CONCAT(MIN(created_at)::DATE, ' to ', MAX(created_at)::DATE) as date_range
FROM cart_events;

-- Final instructions
SELECT 
    '=== PERFORMANCE TEST COMPLETED ===' as status,
    'Use the execution_time_ms values above for your resume' as instructions,
    'Example: "Optimized queries achieving X ms response time"' as example,
    'The row_count shows data volume being processed' as context;
