-- =====================================================
-- Diagnostic Script for Sales Analytics
-- Run this to identify why dashboard shows zeros
-- =====================================================

-- Test 1: Check if tables exist
SELECT 
  '=== TEST 1: Tables Exist ===' as test,
  tablename,
  CASE WHEN tablename IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('sales_analytics', 'product_name_mapping')
ORDER BY tablename;

-- Test 2: Check if data exists
SELECT 
  '=== TEST 2: Data Count ===' as test,
  COUNT(*) as total_records,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
    ELSE '❌ NO DATA - Run import_sales_data.sql'
  END as status
FROM sales_analytics;

-- Test 3: Check RLS status
SELECT 
  '=== TEST 3: RLS Status ===' as test,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = false THEN '✅ DISABLED (Good for testing)'
    WHEN rowsecurity = true THEN '⚠️ ENABLED (May block access)'
  END as status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'sales_analytics';

-- Test 4: Check permissions
SELECT 
  '=== TEST 4: Permissions ===' as test,
  grantee,
  privilege_type,
  CASE 
    WHEN grantee IN ('anon', 'authenticated') AND privilege_type = 'SELECT' THEN '✅ HAS ACCESS'
    ELSE '⚠️ LIMITED ACCESS'
  END as status
FROM information_schema.role_table_grants
WHERE table_name = 'sales_analytics'
  AND table_schema = 'public';

-- Test 5: Check date range of data
SELECT 
  '=== TEST 5: Date Range ===' as test,
  MIN(order_date) as earliest_date,
  MAX(order_date) as latest_date,
  CASE 
    WHEN MAX(order_date) >= CURRENT_DATE - INTERVAL '30 days' THEN '✅ RECENT DATA'
    ELSE '⚠️ OLD DATA (May not show in Last 30 days filter)'
  END as status
FROM sales_analytics;

-- Test 6: Sample data
SELECT 
  '=== TEST 6: Sample Records ===' as test;

SELECT 
  order_date,
  product_display_name,
  quantity_sold,
  total_revenue,
  net_profit,
  payment_status
FROM sales_analytics
ORDER BY order_date DESC
LIMIT 5;

-- Test 7: Check payment status
SELECT 
  '=== TEST 7: Payment Status Distribution ===' as test,
  payment_status,
  COUNT(*) as count,
  CASE 
    WHEN payment_status = 'completed' THEN '✅ WILL SHOW IN DASHBOARD'
    ELSE '⚠️ FILTERED OUT'
  END as status
FROM sales_analytics
GROUP BY payment_status;

-- Test 8: Check if views are accessible
SELECT 
  '=== TEST 8: Views Accessibility ===' as test;

-- Try to query views
SELECT COUNT(*) as sales_summary_count FROM sales_summary;
SELECT COUNT(*) as product_performance_count FROM product_performance;
SELECT COUNT(*) as customer_analytics_count FROM customer_purchase_analytics;

-- Test 9: Calculate metrics manually
SELECT 
  '=== TEST 9: Manual Metrics Calculation ===' as test,
  COUNT(*) as total_orders,
  SUM(quantity_sold) as total_units,
  ROUND(SUM(total_revenue)::numeric, 2) as total_revenue,
  ROUND(SUM(net_profit)::numeric, 2) as total_profit,
  ROUND(AVG(profit_margin)::numeric, 2) as avg_margin
FROM sales_analytics
WHERE payment_status = 'completed';

-- Test 10: Check last 30 days specifically
SELECT 
  '=== TEST 10: Last 30 Days Data ===' as test,
  COUNT(*) as records_last_30_days,
  ROUND(SUM(total_revenue)::numeric, 2) as revenue_last_30_days,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ HAS RECENT DATA'
    ELSE '❌ NO DATA IN LAST 30 DAYS'
  END as status
FROM sales_analytics
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
  AND payment_status = 'completed';

-- =====================================================
-- DIAGNOSIS SUMMARY
-- =====================================================

SELECT '=== DIAGNOSIS SUMMARY ===' as summary;

SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM sales_analytics) = 0 THEN 
      '❌ ISSUE: No data in sales_analytics table. Run import_sales_data.sql'
    WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'sales_analytics' AND schemaname = 'public') = true THEN
      '⚠️ ISSUE: RLS is enabled. Run fix_rls_policies.sql to disable it'
    WHEN (SELECT COUNT(*) FROM sales_analytics WHERE order_date >= CURRENT_DATE - INTERVAL '30 days') = 0 THEN
      '⚠️ ISSUE: No data in last 30 days. Check date range or update import script year'
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.role_table_grants 
      WHERE table_name = 'sales_analytics' 
        AND grantee IN ('anon', 'authenticated') 
        AND privilege_type = 'SELECT'
    ) THEN
      '❌ ISSUE: Missing permissions. Run fix_rls_policies.sql'
    ELSE
      '✅ ALL CHECKS PASSED - Data should be visible in dashboard'
  END as diagnosis,
  
  CASE 
    WHEN (SELECT COUNT(*) FROM sales_analytics) = 0 THEN 
      'Run: database/migrations/import_sales_data.sql'
    WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'sales_analytics' AND schemaname = 'public') = true THEN
      'Run: database/migrations/fix_rls_policies.sql'
    WHEN (SELECT COUNT(*) FROM sales_analytics WHERE order_date >= CURRENT_DATE - INTERVAL '30 days') = 0 THEN
      'Update year in import_sales_data.sql from 2024 to 2025, then re-run'
    ELSE
      'Check browser console for frontend errors'
  END as recommended_action;

-- =====================================================
-- Quick Fix Commands (Copy if needed)
-- =====================================================

SELECT '=== QUICK FIX COMMANDS ===' as quick_fix;

SELECT 
  'If RLS is the issue, run these commands:' as instruction
UNION ALL
SELECT 
  'ALTER TABLE sales_analytics DISABLE ROW LEVEL SECURITY;'
UNION ALL
SELECT 
  'ALTER TABLE product_name_mapping DISABLE ROW LEVEL SECURITY;'
UNION ALL
SELECT 
  'GRANT SELECT ON sales_analytics TO anon, authenticated, service_role;'
UNION ALL
SELECT 
  'GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;';

-- =====================================================
-- End of Diagnostic Script
-- =====================================================


