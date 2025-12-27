-- =====================================================
-- Check All Imported Data
-- See what dates you actually have in the database
-- =====================================================

-- 1. Count all records
SELECT 
  '=== TOTAL RECORDS ===' as section,
  COUNT(*) as total_records,
  COUNT(DISTINCT order_date) as unique_dates
FROM sales_analytics;

-- 2. Date range of all data
SELECT 
  '=== DATE RANGE ===' as section,
  MIN(order_date) as earliest_date,
  MAX(order_date) as latest_date,
  MAX(order_date) - MIN(order_date) as days_span
FROM sales_analytics;

-- 3. Records by month
SELECT 
  '=== RECORDS BY MONTH ===' as section,
  TO_CHAR(order_date, 'YYYY-MM') as month,
  COUNT(*) as records,
  ROUND(SUM(total_revenue)::numeric, 2) as revenue
FROM sales_analytics
GROUP BY month
ORDER BY month DESC;

-- 4. Check last 30 days specifically
SELECT 
  '=== LAST 30 DAYS ===' as section,
  COUNT(*) as records,
  MIN(order_date) as earliest,
  MAX(order_date) as latest,
  ROUND(SUM(total_revenue)::numeric, 2) as revenue
FROM sales_analytics
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days';

-- 5. Check last 90 days
SELECT 
  '=== LAST 90 DAYS ===' as section,
  COUNT(*) as records,
  ROUND(SUM(total_revenue)::numeric, 2) as revenue
FROM sales_analytics
WHERE order_date >= CURRENT_DATE - INTERVAL '90 days';

-- 6. Check last 365 days  
SELECT 
  '=== LAST 365 DAYS ===' as section,
  COUNT(*) as records,
  ROUND(SUM(total_revenue)::numeric, 2) as revenue
FROM sales_analytics
WHERE order_date >= CURRENT_DATE - INTERVAL '365 days';

-- 7. Sample of all records
SELECT 
  '=== SAMPLE RECORDS ===' as section;

SELECT 
  order_date,
  product_display_name,
  quantity_sold,
  total_revenue,
  net_profit,
  source
FROM sales_analytics
ORDER BY order_date DESC
LIMIT 10;

-- 8. Diagnosis
SELECT 
  '=== DIAGNOSIS ===' as section,
  CASE 
    WHEN (SELECT COUNT(*) FROM sales_analytics WHERE order_date >= CURRENT_DATE - INTERVAL '30 days') = 0 THEN
      '⚠️ NO DATA IN LAST 30 DAYS - Change dashboard to "Last 365 days" or update import dates'
    WHEN (SELECT COUNT(*) FROM sales_analytics WHERE order_date >= CURRENT_DATE - INTERVAL '90 days') > 0 THEN
      '✅ Data exists in last 90 days - Change dashboard to "Last 90 days"'
    ELSE
      '✅ All data is older - Use "Last 365 days" filter'
  END as recommendation;


