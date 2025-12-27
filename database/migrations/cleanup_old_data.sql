-- =====================================================
-- Cleanup Old Sales Data (Before November 2025)
-- Removes all sales data before November 1, 2025
-- =====================================================

-- Show what will be deleted
SELECT 
  '=== RECORDS TO BE DELETED ===' as status,
  COUNT(*) as old_records,
  MIN(order_date) as earliest_date,
  MAX(order_date) as latest_date,
  ROUND(SUM(total_revenue)::numeric, 2) as total_revenue
FROM sales_analytics
WHERE order_date < '2025-11-01';

-- Show what will remain
SELECT 
  '=== RECORDS TO KEEP (November 2025+) ===' as status,
  COUNT(*) as recent_records,
  MIN(order_date) as earliest_date,
  MAX(order_date) as latest_date,
  ROUND(SUM(total_revenue)::numeric, 2) as total_revenue
FROM sales_analytics
WHERE order_date >= '2025-11-01';

-- Delete old data (before November 2025)
DELETE FROM sales_analytics 
WHERE order_date < '2025-11-01';

-- Verify deletion
SELECT 
  '=== FINAL STATUS ===' as status,
  COUNT(*) as total_records,
  MIN(order_date) as earliest_date,
  MAX(order_date) as latest_date,
  ROUND(SUM(total_revenue)::numeric, 2) as total_revenue,
  ROUND(SUM(net_profit)::numeric, 2) as total_profit
FROM sales_analytics
WHERE payment_status = 'completed';

-- Show remaining records by month
SELECT 
  '=== REMAINING RECORDS BY MONTH ===' as status,
  TO_CHAR(order_date, 'YYYY-MM') as month,
  COUNT(*) as records,
  ROUND(SUM(total_revenue)::numeric, 2) as revenue
FROM sales_analytics
GROUP BY month
ORDER BY month DESC;

-- Final confirmation
SELECT 
  CASE 
    WHEN COUNT(*) > 0 AND MIN(order_date) >= '2025-11-01' THEN 
      '✅ SUCCESS! Only recent orders (November 2025+) remain.'
    ELSE 
      '⚠️ WARNING! Check the data.'
  END as final_status
FROM sales_analytics;


