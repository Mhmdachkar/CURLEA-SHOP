-- =====================================================
-- STRIPE CHECKOUT ORDERS DATABASE SCHEMA
-- =====================================================
-- 
-- This schema creates the necessary tables for order
-- management in the Stripe checkout system.
--
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ORDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  customer_email TEXT,
  is_guest BOOLEAN DEFAULT false,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE public.orders IS 'Stores customer orders from Stripe checkout';

-- Add comments to columns
COMMENT ON COLUMN public.orders.order_number IS 'Unique human-readable order identifier (e.g., AU-20250120-123456789)';
COMMENT ON COLUMN public.orders.status IS 'Order status: pending, completed, failed, cancelled';
COMMENT ON COLUMN public.orders.stripe_session_id IS 'Stripe checkout session ID';
COMMENT ON COLUMN public.orders.stripe_payment_intent_id IS 'Stripe payment intent ID';

-- Create index on order_number for quick lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- Create index on stripe_session_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);

-- Create index on user_id for customer order queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  variant TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  product_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE public.order_items IS 'Stores individual items within each order';

-- Create index on order_id for joining with orders
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can view their own order items
CREATE POLICY "Users can view own order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Policy: Service role can do everything (for webhooks)
-- Note: Service role key bypasses RLS by default

-- =====================================================
-- SAMPLE QUERIES
-- =====================================================

-- View all orders with items
-- SELECT 
--   o.order_number,
--   o.total_amount,
--   o.currency,
--   o.status,
--   o.created_at,
--   json_agg(json_build_object(
--     'product_name', oi.product_name,
--     'quantity', oi.quantity,
--     'unit_price', oi.unit_price,
--     'total_price', oi.total_price
--   )) as items
-- FROM orders o
-- LEFT JOIN order_items oi ON o.id = oi.order_id
-- GROUP BY o.id
-- ORDER BY o.created_at DESC;

-- View orders by status
-- SELECT * FROM orders WHERE status = 'pending';

-- Get order total by month
-- SELECT 
--   DATE_TRUNC('month', created_at) as month,
--   COUNT(*) as order_count,
--   SUM(total_amount) as revenue
-- FROM orders
-- WHERE status = 'completed'
-- GROUP BY month
-- ORDER BY month DESC;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

