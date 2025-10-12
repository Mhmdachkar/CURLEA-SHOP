-- Measurable Performance Test - This will show you actual numbers!
-- Instead of JSON, we'll measure performance with timestamps and row counts

-- Test 1: Measure query execution time manually
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time_ms INTEGER;
    row_count INTEGER;
BEGIN
    -- Start timing
    start_time := clock_timestamp();
    
    -- Run the query
    SELECT COUNT(*) INTO row_count 
    FROM visits 
    WHERE created_at >= NOW() - INTERVAL '7 days';
    
    -- End timing
    end_time := clock_timestamp();
    
    -- Calculate execution time in milliseconds
    execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    -- Display results
    RAISE NOTICE 'Query 1 - Visits Count: % rows, Execution time: % ms', row_count, execution_time_ms;
END $$;

-- Test 2: Measure join query performance
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time_ms INTEGER;
    row_count INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO row_count
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    WHERE v.created_at >= NOW() - INTERVAL '7 days';
    
    end_time := clock_timestamp();
    execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    RAISE NOTICE 'Query 2 - Join Query: % rows, Execution time: % ms', row_count, execution_time_ms;
END $$;

-- Test 3: Measure aggregation performance
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time_ms INTEGER;
    row_count INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO row_count
    FROM visits
    WHERE created_at >= NOW() - INTERVAL '30 days';
    
    end_time := clock_timestamp();
    execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    RAISE NOTICE 'Query 3 - Aggregation: % rows, Execution time: % ms', row_count, execution_time_ms;
END $$;

-- Show data summary for context
SELECT 
    'DATA SUMMARY' as test_type,
    'visits' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT country) as unique_countries,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM visits

UNION ALL

SELECT 
    'DATA SUMMARY' as test_type,
    'page_views' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT url) as unique_urls,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM page_views

UNION ALL

SELECT 
    'DATA SUMMARY' as test_type,
    'cart_events' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT product_id) as unique_products,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM cart_events;

-- Final summary with instructions
SELECT 
    'PERFORMANCE TEST COMPLETED' as status,
    'Check the NOTICE messages above for actual execution times in milliseconds' as instructions,
    'Use these numbers for your resume performance metrics' as next_steps,
    'Look for messages like: "Query 1 - Visits Count: X rows, Execution time: Y ms"' as where_to_find_results;
