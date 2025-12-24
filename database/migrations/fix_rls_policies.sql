-- =====================================================
-- Fix RLS Policies for Sales Analytics Tables
-- This allows public access to sales analytics data
-- =====================================================

-- Disable RLS temporarily and set proper policies
ALTER TABLE sales_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_name_mapping DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, use these policies instead:
-- (Uncomment the section below if you prefer RLS)

/*
-- Enable RLS
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_name_mapping ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read sales_analytics" ON sales_analytics;
DROP POLICY IF EXISTS "Allow service role to manage sales_analytics" ON sales_analytics;
DROP POLICY IF EXISTS "Allow public read access to sales_analytics" ON sales_analytics;

-- Create new policies that allow public read access
CREATE POLICY "Allow public read access to sales_analytics"
  ON sales_analytics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users full access to sales_analytics"
  ON sales_analytics FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access to sales_analytics"
  ON sales_analytics FOR ALL
  TO service_role
  USING (true);

-- Policies for product_name_mapping
DROP POLICY IF EXISTS "Allow public read access to product_name_mapping" ON product_name_mapping;

CREATE POLICY "Allow public read access to product_name_mapping"
  ON product_name_mapping FOR SELECT
  TO public
  USING (true);
*/

-- Grant necessary permissions
GRANT SELECT ON sales_analytics TO anon, authenticated, service_role;
GRANT SELECT ON product_name_mapping TO anon, authenticated, service_role;
GRANT SELECT ON sales_summary TO anon, authenticated, service_role;
GRANT SELECT ON product_performance TO anon, authenticated, service_role;
GRANT SELECT ON customer_purchase_analytics TO anon, authenticated, service_role;

-- Verify the changes
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE tablename IN ('sales_analytics', 'product_name_mapping')
  AND schemaname = 'public';

-- Check if data exists
SELECT 
  'sales_analytics' as table_name,
  COUNT(*) as row_count,
  MIN(order_date) as earliest_date,
  MAX(order_date) as latest_date
FROM sales_analytics
UNION ALL
SELECT 
  'product_name_mapping' as table_name,
  COUNT(*) as row_count,
  NULL as earliest_date,
  NULL as latest_date
FROM product_name_mapping;

-- Test query to verify access
SELECT 
  COUNT(*) as total_records,
  SUM(total_revenue) as total_revenue,
  SUM(net_profit) as total_profit
FROM sales_analytics
WHERE payment_status = 'completed';

-- =====================================================
-- Success Message
-- =====================================================
SELECT '✅ RLS policies updated! Data should now be accessible from the frontend.' as status;

