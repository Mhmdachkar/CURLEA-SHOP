-- =====================================================
-- Verify and Fix 18 Orders Issue
-- Check what data exists and ensure all 18 orders are showing
-- =====================================================

-- 1. Check total records from November 2025 onwards
SELECT 
  '=== TOTAL RECORDS (November 2025+) ===' as status,
  COUNT(*) as total_records,
  COUNT(DISTINCT order_id) as unique_orders,
  ROUND(SUM(total_revenue)::numeric, 2) as total_revenue,
  ROUND(SUM(net_profit)::numeric, 2) as total_profit
FROM sales_analytics
WHERE order_date >= '2025-11-01'
  AND payment_status = 'completed';

-- 2. Show all orders with details
SELECT 
  '=== ALL ORDERS (November 2025+) ===' as status;

SELECT 
  order_id,
  order_date,
  product_display_name,
  quantity_sold,
  unit_price,
  total_revenue,
  net_profit,
  payment_status,
  source
FROM sales_analytics
WHERE order_date >= '2025-11-01'
  AND payment_status = 'completed'
ORDER BY order_date DESC, order_id;

-- 3. Group by order_id to see unique orders
SELECT 
  '=== UNIQUE ORDERS COUNT ===' as status,
  COUNT(DISTINCT order_id) as unique_order_count,
  COUNT(*) as total_line_items
FROM sales_analytics
WHERE order_date >= '2025-11-01'
  AND payment_status = 'completed'
  AND order_id IS NOT NULL;

-- 4. If order_id is NULL, count by date/product combination
SELECT 
  '=== ORDERS BY DATE (if order_id is NULL) ===' as status,
  order_date,
  COUNT(*) as items_on_date,
  COUNT(DISTINCT product_display_name) as unique_products,
  ROUND(SUM(total_revenue)::numeric, 2) as revenue_per_date
FROM sales_analytics
WHERE order_date >= '2025-11-01'
  AND payment_status = 'completed'
GROUP BY order_date
ORDER BY order_date DESC;

-- 5. Check if we need to create order_ids for records that don't have them
SELECT 
  '=== RECORDS WITHOUT ORDER_ID ===' as status,
  COUNT(*) as records_without_order_id
FROM sales_analytics
WHERE order_date >= '2025-11-01'
  AND payment_status = 'completed'
  AND (order_id IS NULL OR order_id = '');

-- 6. Show sample of records without order_id
SELECT 
  '=== SAMPLE RECORDS WITHOUT ORDER_ID ===' as status;

SELECT 
  id,
  order_date,
  product_display_name,
  total_revenue,
  order_id
FROM sales_analytics
WHERE order_date >= '2025-11-01'
  AND payment_status = 'completed'
  AND (order_id IS NULL OR order_id = '')
LIMIT 10;

-- 7. Diagnosis
SELECT 
  '=== DIAGNOSIS ===' as status,
  CASE 
    WHEN COUNT(*) < 18 THEN 
      '⚠️ Only ' || COUNT(*) || ' records found. Need to import/verify all 18 orders.'
    WHEN COUNT(DISTINCT order_id) < 18 AND COUNT(DISTINCT order_id) > 0 THEN
      '⚠️ ' || COUNT(DISTINCT order_id) || ' unique orders found, but ' || COUNT(*) || ' line items. This is normal if orders have multiple items.'
    WHEN COUNT(DISTINCT order_id) = 0 THEN
      '⚠️ No order_ids found. Records may need order_id assignment.'
    ELSE
      '✅ ' || COUNT(DISTINCT order_id) || ' unique orders found with ' || COUNT(*) || ' line items.'
  END as diagnosis
FROM sales_analytics
WHERE order_date >= '2025-11-01'
  AND payment_status = 'completed';

-- =====================================================
-- NEXT STEPS:
-- If you see less than 18 orders, you need to:
-- 1. Import the missing orders into sales_analytics table
-- 2. Or verify that all 18 orders are in the database
-- 3. Make sure each order has a unique order_id
-- =====================================================


