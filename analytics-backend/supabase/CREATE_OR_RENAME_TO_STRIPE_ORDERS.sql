-- =====================================================
-- CREATE OR RENAME TO stripe_orders TABLE
-- =====================================================
-- 
-- This script handles two scenarios:
-- 1. If public.orders exists: Rename it to stripe_orders
-- 2. If public.orders doesn't exist: Create stripe_orders
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: CHECK IF public.orders EXISTS AND RENAME
-- =====================================================

DO $$
BEGIN
    -- Check if public.orders table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
    ) THEN
        -- Check if stripe_orders already exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'stripe_orders'
        ) THEN
            RAISE NOTICE 'stripe_orders already exists. Skipping rename.';
        ELSE
            -- Rename public.orders to stripe_orders
            ALTER TABLE public.orders RENAME TO stripe_orders;
            RAISE NOTICE 'Renamed public.orders to stripe_orders';
        END IF;
    END IF;
END $$;

-- =====================================================
-- STEP 2: CREATE stripe_orders IF IT DOESN'T EXIST
-- =====================================================

CREATE TABLE IF NOT EXISTS public.stripe_orders (
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
COMMENT ON TABLE public.stripe_orders IS 'Stores customer orders from Stripe checkout';

-- Add comments to columns
COMMENT ON COLUMN public.stripe_orders.order_number IS 'Unique human-readable order identifier (e.g., AU-20250120-123456789)';
COMMENT ON COLUMN public.stripe_orders.status IS 'Order status: pending, completed, failed, cancelled';
COMMENT ON COLUMN public.stripe_orders.stripe_session_id IS 'Stripe checkout session ID';
COMMENT ON COLUMN public.stripe_orders.stripe_payment_intent_id IS 'Stripe payment intent ID';

-- =====================================================
-- STEP 3: UPDATE FOREIGN KEY IN order_items
-- =====================================================

-- Drop old foreign key if it references orders
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_order_id_fkey'
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE public.order_items 
        DROP CONSTRAINT order_items_order_id_fkey;
        RAISE NOTICE 'Dropped old foreign key constraint';
    END IF;
END $$;

-- Add new foreign key pointing to stripe_orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_order_id_fkey'
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE public.order_items 
        ADD CONSTRAINT order_items_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.stripe_orders(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key to stripe_orders';
    END IF;
END $$;

-- =====================================================
-- STEP 4: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_stripe_orders_order_number ON public.stripe_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_stripe_session ON public.stripe_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_user_id ON public.stripe_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_status ON public.stripe_orders(status);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_created_at ON public.stripe_orders(created_at DESC);

-- =====================================================
-- STEP 5: UPDATE TRIGGERS
-- =====================================================

-- Drop old trigger if it exists on orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_stripe_orders_updated_at ON public.stripe_orders;

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on stripe_orders
CREATE TRIGGER update_stripe_orders_updated_at
  BEFORE UPDATE ON public.stripe_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: UPDATE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on stripe_orders
ALTER TABLE public.stripe_orders ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.stripe_orders;

-- Create new policy for stripe_orders
CREATE POLICY "Users can view own orders"
  ON public.stripe_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Update order_items policy to reference stripe_orders
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

CREATE POLICY "Users can view own order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stripe_orders
      WHERE stripe_orders.id = order_items.order_id
      AND stripe_orders.user_id = auth.uid()
    )
  );

-- =====================================================
-- STEP 7: VERIFY
-- =====================================================

-- Check if stripe_orders exists and has data
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM public.stripe_orders;
    RAISE NOTICE 'stripe_orders table exists with % rows', row_count;
END $$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    '✅ stripe_orders table is ready!' as status,
    (SELECT COUNT(*) FROM public.stripe_orders) as total_orders;

