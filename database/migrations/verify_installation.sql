-- =====================================================
-- Verification Script for Sales Analytics Installation
-- Run this after completing both migration steps
-- =====================================================

-- 1. Check if all tables exist
SELECT 
  'Tables Check' as check_type,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASS - All tables exist'
    ELSE '❌ FAIL - Missing tables'
  END as status,
  COUNT(*) as found_tables,
  2 as expected_tables
FROM information_schema.tables 
WHERE table_name IN ('sales_analytics', 'product_name_mapping');

-- 2. Check if all views exist
SELECT 
  'Views Check' as check_type,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ PASS - All views exist'
    ELSE '❌ FAIL - Missing views'
  END as status,
  COUNT(*) as found_views,
  3 as expected_views
FROM information_schema.views 
WHERE table_name IN ('sales_summary', 'product_performance', 'customer_purchase_analytics');

-- 3. Check if functions exist
SELECT 
  'Functions Check' as check_type,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ PASS - Functions exist'
    ELSE '❌ FAIL - Missing functions'
  END as status,
  COUNT(*) as found_functions
FROM information_schema.routines 
WHERE routine_name IN ('sync_cart_events_product_names', 'update_sales_analytics_updated_at');

-- 4. Check sales_analytics data
SELECT 
  'Data Import Check' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS - Data imported'
    ELSE '❌ FAIL - No data found'
  END as status,
  COUNT(*) as total_records
FROM sales_analytics;

-- 5. Check product name mappings
SELECT 
  'Product Mapping Check' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS - Mappings exist'
    ELSE '❌ FAIL - No mappings found'
  END as status,
  COUNT(*) as total_mappings
FROM product_name_mapping;

-- 6. Verify financial calculations
SELECT 
  'Financial Calculations Check' as check_type,
  CASE 
    WHEN SUM(total_revenue) > 0 AND SUM(net_profit) IS NOT NULL THEN '✅ PASS - Calculations working'
    ELSE '❌ FAIL - Calculation issues'
  END as status,
  ROUND(SUM(total_revenue)::numeric, 2) as total_revenue,
  ROUND(SUM(net_profit)::numeric, 2) as total_net_profit,
  ROUND(AVG(profit_margin)::numeric, 2) as avg_profit_margin
FROM sales_analytics
WHERE payment_status = 'completed';

-- 7. Check RLS policies
SELECT 
  'RLS Policies Check' as check_type,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ PASS - Policies configured'
    ELSE '⚠️ WARNING - Limited policies'
  END as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'sales_analytics';

-- =====================================================
-- Detailed Data Preview
-- =====================================================

-- Show sample sales records
SELECT 
  '=== SAMPLE SALES RECORDS ===' as section;

SELECT 
  order_date,
  product_display_name,
  quantity_sold,
  unit_price,
  total_revenue,
  net_profit,
  profit_margin
FROM sales_analytics
ORDER BY order_date DESC
LIMIT 5;

-- Show product performance summary
SELECT 
  '=== TOP 5 PRODUCTS BY REVENUE ===' as section;

SELECT 
  product_display_name,
  product_category,
  total_units,
  ROUND(total_revenue_incl_delivery::numeric, 2) as revenue,
  ROUND(total_profit::numeric, 2) as profit,
  ROUND(avg_profit_margin::numeric, 1) as margin_pct
FROM product_performance
ORDER BY total_revenue_incl_delivery DESC
LIMIT 5;

-- Show monthly summary
SELECT 
  '=== MONTHLY SUMMARY ===' as section;

SELECT 
  TO_CHAR(month, 'YYYY-MM') as month,
  SUM(total_orders) as orders,
  SUM(total_units_sold) as units,
  ROUND(SUM(total_revenue)::numeric, 2) as revenue,
  ROUND(SUM(total_net_profit)::numeric, 2) as profit,
  ROUND(AVG(avg_profit_margin)::numeric, 1) as avg_margin
FROM sales_summary
GROUP BY month
ORDER BY month DESC
LIMIT 6;

-- Show product name mappings
SELECT 
  '=== PRODUCT NAME MAPPINGS ===' as section;

SELECT 
  csv_name,
  website_name,
  product_category
FROM product_name_mapping
ORDER BY product_category, csv_name
LIMIT 10;

-- =====================================================
-- Final Summary
-- =====================================================

SELECT 
  '=== INSTALLATION SUMMARY ===' as section;

SELECT 
  'Total Sales Records' as metric,
  COUNT(*)::text as value
FROM sales_analytics
UNION ALL
SELECT 
  'Total Revenue',
  '$' || ROUND(SUM(total_revenue)::numeric, 2)::text
FROM sales_analytics
WHERE payment_status = 'completed'
UNION ALL
SELECT 
  'Total Net Profit',
  '$' || ROUND(SUM(net_profit)::numeric, 2)::text
FROM sales_analytics
WHERE payment_status = 'completed'
UNION ALL
SELECT 
  'Average Profit Margin',
  ROUND(AVG(profit_margin)::numeric, 1)::text || '%'
FROM sales_analytics
WHERE payment_status = 'completed'
UNION ALL
SELECT 
  'Total Orders',
  COUNT(DISTINCT order_id)::text
FROM sales_analytics
WHERE payment_status = 'completed'
UNION ALL
SELECT 
  'Product Mappings',
  COUNT(*)::text
FROM product_name_mapping
UNION ALL
SELECT 
  'Date Range',
  TO_CHAR(MIN(order_date), 'YYYY-MM-DD') || ' to ' || TO_CHAR(MAX(order_date), 'YYYY-MM-DD')
FROM sales_analytics;

-- =====================================================
-- Next Steps
-- =====================================================

SELECT 
  '=== NEXT STEPS ===' as section;

SELECT 
  '1. If all checks passed, navigate to /shopify-home-dashboard' as instruction
UNION ALL
SELECT 
  '2. Scroll down to see the Sales Analytics section'
UNION ALL
SELECT 
  '3. Verify metrics match the summary above'
UNION ALL
SELECT 
  '4. Test different date ranges (Today, Last 7/30/90 days)'
UNION ALL
SELECT 
  '5. Check that product names display correctly'
UNION ALL
SELECT 
  '6. Review profit margins for accuracy';

-- =====================================================
-- End of Verification Script
-- =====================================================


