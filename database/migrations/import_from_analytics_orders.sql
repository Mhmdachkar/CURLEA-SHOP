-- =====================================================
-- Import from Analytics Orders Table
-- Uses the correct column names from your table structure
-- =====================================================

-- First, check what data we have
SELECT 
  '=== CHECKING ORDERS ===' as status,
  COUNT(*) as total_orders,
  MIN(created_at) as earliest,
  MAX(created_at) as latest,
  ROUND(SUM(total_value)::numeric, 2) as total_revenue
FROM orders
WHERE created_at >= '2025-11-01'
  AND status = 'completed';

-- Show sample orders
SELECT 
  order_id,
  total_value,
  subtotal,
  shipping_total,
  total_cost,
  profit,
  customer_email,
  created_at
FROM orders
WHERE created_at >= '2025-11-01'
  AND status = 'completed'
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- IMPORT ORDERS
-- =====================================================

-- Option 1: Import as single record per order (if items JSONB is complex)
INSERT INTO sales_analytics (
  order_id,
  order_date,
  product_name,
  product_display_name,
  product_category,
  quantity_sold,
  unit_price,
  subtotal,
  delivery_fee,
  total_revenue,
  cost_per_unit,
  total_cogs,
  gross_profit,
  net_profit,
  profit_margin,
  payment_method,
  payment_status,
  customer_email,
  source
)
SELECT 
  o.order_id,
  o.created_at::date as order_date,
  'Order Items' as product_name,
  'Order #' || o.order_id as product_display_name,
  'General' as product_category,
  1 as quantity_sold,
  o.total_value as unit_price,
  COALESCE(o.subtotal, o.total_value - COALESCE(o.shipping_total, 4.00)) as subtotal,
  COALESCE(o.shipping_total, 4.00) as delivery_fee,
  o.total_value as total_revenue,
  -- Use existing total_cost if available, otherwise estimate 30%
  COALESCE(
    o.total_cost / NULLIF(COALESCE(o.subtotal, o.total_value - COALESCE(o.shipping_total, 4.00)), 0),
    (COALESCE(o.subtotal, o.total_value - COALESCE(o.shipping_total, 4.00)) * 0.30)
  ) as cost_per_unit,
  COALESCE(o.total_cost, (COALESCE(o.subtotal, o.total_value - COALESCE(o.shipping_total, 4.00)) * 0.30)) as total_cogs,
  -- Use existing profit if available, otherwise calculate
  COALESCE(
    o.profit + COALESCE(o.shipping_total, 4.00), -- Add shipping back to get gross profit
    (COALESCE(o.subtotal, o.total_value - COALESCE(o.shipping_total, 4.00)) * 0.70)
  ) as gross_profit,
  COALESCE(o.profit, (COALESCE(o.subtotal, o.total_value - COALESCE(o.shipping_total, 4.00)) * 0.70 - COALESCE(o.shipping_total, 4.00))) as net_profit,
  -- Calculate profit margin
  CASE 
    WHEN o.total_value > 0 THEN
      (COALESCE(o.profit, (COALESCE(o.subtotal, o.total_value - COALESCE(o.shipping_total, 4.00)) * 0.70 - COALESCE(o.shipping_total, 4.00))) / o.total_value) * 100
    ELSE 0
  END as profit_margin,
  COALESCE(o.payment_method, 'stripe') as payment_method,
  o.status as payment_status,
  o.customer_email,
  COALESCE(o.source, 'imported') as source
FROM orders o
WHERE o.created_at >= '2025-11-01'
  AND o.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM sales_analytics sa 
    WHERE sa.order_id = o.order_id
  );

-- =====================================================
-- OPTION 2: Import individual items from items JSONB
-- Uncomment this if you want separate records for each item
-- =====================================================

/*
INSERT INTO sales_analytics (
  order_id,
  order_date,
  product_name,
  product_display_name,
  product_category,
  color,
  size,
  quantity_sold,
  unit_price,
  subtotal,
  delivery_fee,
  total_revenue,
  cost_per_unit,
  total_cogs,
  gross_profit,
  net_profit,
  profit_margin,
  payment_method,
  payment_status,
  customer_email,
  source
)
SELECT 
  o.order_id,
  o.created_at::date as order_date,
  COALESCE(item->>'name', item->>'product_name', 'Unknown Product') as product_name,
  COALESCE(item->>'name', item->>'product_name', 'Unknown Product') as product_display_name,
  COALESCE(item->>'category', 'General') as product_category,
  item->>'color' as color,
  item->>'size' as size,
  COALESCE((item->>'quantity')::integer, 1) as quantity_sold,
  COALESCE((item->>'price')::numeric, (item->>'unit_price')::numeric, 0) as unit_price,
  COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
    COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) as subtotal,
  -- Distribute shipping across items proportionally
  CASE 
    WHEN o.total_value > 0 THEN
      COALESCE(o.shipping_total, 4.00) * 
      (COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
        COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) / o.total_value)
    ELSE 0
  END as delivery_fee,
  -- Total revenue per item
  COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
    COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) +
  CASE 
    WHEN o.total_value > 0 THEN
      COALESCE(o.shipping_total, 4.00) * 
      (COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
        COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) / o.total_value)
    ELSE 0
  END as total_revenue,
  -- Cost (30% of item price)
  COALESCE((item->>'price')::numeric, (item->>'unit_price')::numeric, 0) * 0.30 as cost_per_unit,
  COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
    COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) * 0.30 as total_cogs,
  -- Profit
  COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
    COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) * 0.70 as gross_profit,
  COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
    COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) * 0.70 -
  CASE 
    WHEN o.total_value > 0 THEN
      COALESCE(o.shipping_total, 4.00) * 
      (COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
        COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) / o.total_value)
    ELSE 0
  END as net_profit,
  -- Profit margin
  CASE 
    WHEN COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
        COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) > 0 THEN
      ((COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
        COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) * 0.70 -
      CASE 
        WHEN o.total_value > 0 THEN
          COALESCE(o.shipping_total, 4.00) * 
          (COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
            COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) / o.total_value)
        ELSE 0
      END) / 
      (COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
        COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) +
      CASE 
        WHEN o.total_value > 0 THEN
          COALESCE(o.shipping_total, 4.00) * 
          (COALESCE((item->>'total')::numeric, (item->>'total_price')::numeric, 
            COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)) / o.total_value)
        ELSE 0
      END)) * 100
    ELSE 0
  END as profit_margin,
  COALESCE(o.payment_method, 'stripe') as payment_method,
  o.status as payment_status,
  o.customer_email,
  COALESCE(o.source, 'imported') as source
FROM orders o
CROSS JOIN LATERAL jsonb_array_elements(o.items) as item
WHERE o.created_at >= '2025-11-01'
  AND o.status = 'completed'
  AND o.items IS NOT NULL
  AND jsonb_array_length(o.items) > 0
ON CONFLICT DO NOTHING;
*/

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 
  '=== VERIFICATION ===' as status,
  COUNT(DISTINCT order_id) as total_orders,
  COUNT(*) as total_records,
  ROUND(SUM(total_revenue)::numeric, 2) as total_revenue,
  ROUND(SUM(net_profit)::numeric, 2) as total_profit,
  ROUND(AVG(profit_margin)::numeric, 2) as avg_profit_margin
FROM sales_analytics
WHERE order_date >= '2025-11-01'
  AND payment_status = 'completed';

-- Show all imported orders
SELECT 
  order_id,
  order_date,
  product_display_name,
  quantity_sold,
  total_revenue,
  net_profit,
  profit_margin
FROM sales_analytics
WHERE order_date >= '2025-11-01'
  AND payment_status = 'completed'
ORDER BY order_date DESC, order_id;

