-- =====================================================
-- Migration: Fix cart_events and Create Sales Analytics
-- Purpose: 
-- 1. Update cart_events to use correct product titles
-- 2. Create comprehensive sales_analytics table
-- =====================================================

-- Step 1: Create a mapping table for product name normalization
-- This maps CSV product names to actual website product names
CREATE TABLE IF NOT EXISTS product_name_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  csv_name TEXT NOT NULL, -- Name from CSV/cart_events
  website_name TEXT NOT NULL, -- Actual product name on website
  product_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert product name mappings
INSERT INTO product_name_mapping (csv_name, website_name, product_category) VALUES
  ('full set', 'CURLEA DreamCurl™ Full Set Original', 'DreamCurl™ Collection'),
  ('full sets', 'CURLEA DreamCurl™ Full Set Original', 'DreamCurl™ Collection'),
  ('single set', 'CURLEA DreamCurl™ Single Set', 'DreamCurl™ Collection'),
  ('single and heat', 'CURLEA DreamCurl™ Single & Heat Bundle', 'DreamCurl™ Collection'),
  ('heat buns', 'CURLEA HeatBun™', 'DreamCurl™ Collection'),
  ('heat bun', 'CURLEA HeatBun™', 'DreamCurl™ Collection'),
  ('flat clips 4pcs', 'CURLEA FlatClip™ 4-Pack', 'Accessories'),
  ('flat clips 5pcs', 'CURLEA FlatClip™ 5-Pack', 'Accessories'),
  ('flat clips 9pcs', 'CURLEA FlatClip™ 9-Pack', 'Accessories'),
  ('bow tie', 'CURLEA BowTie™ Clip', 'Accessories'),
  ('bow tie 7pcs', 'CURLEA BowTie™ 7-Pack', 'Accessories'),
  ('scrunchies', 'CURLEA Silk Scrunchie', 'Accessories'),
  ('full set/korean free', 'CURLEA DreamCurl™ Full Set + Korean Clip', 'Bundles'),
  ('heat buns/full set', 'CURLEA Heat & Full Set Bundle', 'Bundles'),
  ('heat buns/flat clips 4pcs', 'CURLEA Heat & Clips Bundle', 'Bundles'),
  ('flat clips 9pcs/scrrunchies', 'CURLEA Clips & Scrunchie Bundle', 'Bundles'),
  ('flat clips 4pcs/ bowtie', 'CURLEA Clips & BowTie Bundle', 'Bundles')
ON CONFLICT DO NOTHING;

-- Step 2: Create comprehensive sales_analytics table
CREATE TABLE IF NOT EXISTS sales_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Order Information
  order_id TEXT,
  order_date DATE NOT NULL,
  order_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Product Information
  product_name TEXT NOT NULL,
  product_display_name TEXT NOT NULL, -- Website display name
  product_category TEXT,
  color TEXT,
  size TEXT,
  
  -- Quantity & Pricing
  quantity_sold INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  
  -- Revenue Calculations
  subtotal DECIMAL(10, 2) NOT NULL, -- quantity * unit_price
  delivery_fee DECIMAL(10, 2) DEFAULT 4.00, -- Standard $4 delivery
  total_revenue DECIMAL(10, 2) NOT NULL, -- subtotal + delivery_fee
  
  -- Cost & Profit Calculations
  cost_per_unit DECIMAL(10, 2) NOT NULL,
  total_cogs DECIMAL(10, 2) NOT NULL, -- Cost of Goods Sold
  gross_profit DECIMAL(10, 2) NOT NULL, -- subtotal - total_cogs
  net_profit DECIMAL(10, 2) NOT NULL, -- gross_profit - delivery_fee (if applicable)
  profit_margin DECIMAL(5, 2), -- (net_profit / total_revenue) * 100
  
  -- Payment Information
  payment_method TEXT DEFAULT 'stripe', -- stripe, cod, etc.
  payment_status TEXT DEFAULT 'completed', -- completed, pending, refunded
  
  -- Customer Information
  customer_email TEXT,
  customer_id TEXT,
  
  -- Metadata
  source TEXT DEFAULT 'imported', -- imported, stripe, manual, etc.
  notes TEXT,
  csv_key TEXT, -- Original CSV key for reference
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_analytics_order_date ON sales_analytics(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_product_name ON sales_analytics(product_name);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_product_display_name ON sales_analytics(product_display_name);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_customer_email ON sales_analytics(customer_email);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_payment_method ON sales_analytics(payment_method);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_order_id ON sales_analytics(order_id);

-- Create a view for quick sales summaries
CREATE OR REPLACE VIEW sales_summary AS
SELECT 
  DATE_TRUNC('day', order_date) as day,
  DATE_TRUNC('week', order_date) as week,
  DATE_TRUNC('month', order_date) as month,
  COUNT(DISTINCT order_id) as total_orders,
  SUM(quantity_sold) as total_units_sold,
  SUM(subtotal) as total_subtotal,
  SUM(delivery_fee) as total_delivery_fees,
  SUM(total_revenue) as total_revenue,
  SUM(total_cogs) as total_cogs,
  SUM(gross_profit) as total_gross_profit,
  SUM(net_profit) as total_net_profit,
  AVG(profit_margin) as avg_profit_margin,
  product_display_name,
  product_category
FROM sales_analytics
WHERE payment_status = 'completed'
GROUP BY day, week, month, product_display_name, product_category;

-- Create a view for product performance
CREATE OR REPLACE VIEW product_performance AS
SELECT 
  product_display_name,
  product_category,
  COUNT(*) as times_sold,
  SUM(quantity_sold) as total_units,
  SUM(subtotal) as total_revenue_excl_delivery,
  SUM(total_revenue) as total_revenue_incl_delivery,
  SUM(total_cogs) as total_costs,
  SUM(net_profit) as total_profit,
  AVG(unit_price) as avg_selling_price,
  AVG(profit_margin) as avg_profit_margin,
  MIN(order_date) as first_sale_date,
  MAX(order_date) as last_sale_date
FROM sales_analytics
WHERE payment_status = 'completed'
GROUP BY product_display_name, product_category
ORDER BY total_profit DESC;

-- Create a view for customer analytics
CREATE OR REPLACE VIEW customer_purchase_analytics AS
SELECT 
  customer_email,
  customer_id,
  COUNT(DISTINCT order_id) as total_orders,
  SUM(quantity_sold) as total_items_purchased,
  SUM(total_revenue) as lifetime_value,
  SUM(net_profit) as total_profit_generated,
  AVG(total_revenue) as avg_order_value,
  MIN(order_date) as first_purchase_date,
  MAX(order_date) as last_purchase_date,
  MAX(order_date) - MIN(order_date) as customer_lifetime_days
FROM sales_analytics
WHERE payment_status = 'completed' AND customer_email IS NOT NULL
GROUP BY customer_email, customer_id
ORDER BY lifetime_value DESC;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_sales_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_update_sales_analytics_timestamp ON sales_analytics;
CREATE TRIGGER trigger_update_sales_analytics_timestamp
  BEFORE UPDATE ON sales_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_analytics_updated_at();

-- Step 3: Function to sync cart_events with proper product names
CREATE OR REPLACE FUNCTION sync_cart_events_product_names()
RETURNS INTEGER AS $$
DECLARE
  rows_updated INTEGER := 0;
BEGIN
  -- This function would update cart_events if it exists
  -- Check if cart_events table exists first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_events') THEN
    -- Add a column for corrected product name if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'cart_events' AND column_name = 'corrected_product_name'
    ) THEN
      ALTER TABLE cart_events ADD COLUMN corrected_product_name TEXT;
    END IF;
    
    -- Update cart_events with correct product names
    -- Note: cart_events uses 'product_title' not 'product_name'
    UPDATE cart_events ce
    SET corrected_product_name = pnm.website_name
    FROM product_name_mapping pnm
    WHERE LOWER(TRIM(ce.product_title)) = LOWER(TRIM(pnm.csv_name));
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
  END IF;
  
  RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;

-- Execute the sync function (optional - only if cart_events has data)
-- SELECT sync_cart_events_product_names();

-- Step 4: Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON sales_analytics TO authenticated;
GRANT SELECT ON sales_summary TO authenticated;
GRANT SELECT ON product_performance TO authenticated;
GRANT SELECT ON customer_purchase_analytics TO authenticated;
GRANT SELECT ON product_name_mapping TO authenticated;

-- Enable RLS (Row Level Security) if needed
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_name_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies for sales_analytics (adjust based on your auth requirements)
DROP POLICY IF EXISTS "Allow authenticated users to read sales_analytics" ON sales_analytics;
CREATE POLICY "Allow authenticated users to read sales_analytics"
  ON sales_analytics FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow service role to manage sales_analytics" ON sales_analytics;
CREATE POLICY "Allow service role to manage sales_analytics"
  ON sales_analytics FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- End of Migration
-- =====================================================

