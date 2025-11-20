-- =====================================================
-- FIX: Orders Table Name Conflict
-- =====================================================
--
-- PROBLEM: Two tables named "orders" in public schema:
--   1. orders (analytics) - has order_id column
--   2. public.orders (Stripe) - has order_number column
--
-- When both exist, queries get confused about which to use!
--
-- SOLUTION: Rename the Stripe orders table to avoid conflict
-- =====================================================

-- Step 1: Check which orders tables exist
SELECT 
    table_schema,
    table_name,
    (SELECT column_name FROM information_schema.columns 
     WHERE table_schema = t.table_schema 
     AND table_name = t.table_name 
     AND column_name IN ('order_id', 'order_number') 
     LIMIT 1) as key_column
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE '%order%'
ORDER BY table_name;

-- =====================================================
-- OPTION 1: Rename Stripe Orders Table (RECOMMENDED)
-- =====================================================

-- Rename public.orders to public.stripe_orders
ALTER TABLE IF EXISTS public.orders RENAME TO stripe_orders;

-- Rename the foreign key constraint on order_items
ALTER TABLE IF EXISTS public.order_items 
  DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE IF EXISTS public.order_items 
  ADD CONSTRAINT order_items_order_id_fkey 
  FOREIGN KEY (order_id) 
  REFERENCES public.stripe_orders(id) 
  ON DELETE CASCADE;

-- Update indexes
DROP INDEX IF EXISTS public.idx_orders_order_number;
DROP INDEX IF EXISTS public.idx_orders_stripe_session;
DROP INDEX IF EXISTS public.idx_orders_user_id;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_created_at;

CREATE INDEX IF NOT EXISTS idx_stripe_orders_order_number ON public.stripe_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_stripe_session ON public.stripe_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_user_id ON public.stripe_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_status ON public.stripe_orders(status);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_created_at ON public.stripe_orders(created_at DESC);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.stripe_orders;
CREATE POLICY "Users can view own orders"
  ON public.stripe_orders
  FOR SELECT
  USING (auth.uid() = user_id);

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

-- Update trigger
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.stripe_orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.stripe_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that both tables now exist with correct columns
SELECT 
    'orders (analytics)' as table_name,
    COUNT(*) as row_count,
    (SELECT column_name FROM information_schema.columns 
     WHERE table_name = 'orders' 
     AND table_schema = 'public'
     AND column_name IN ('order_id', 'order_number')) as key_column
FROM public.orders

UNION ALL

SELECT 
    'stripe_orders' as table_name,
    COUNT(*) as row_count,
    (SELECT column_name FROM information_schema.columns 
     WHERE table_name = 'stripe_orders' 
     AND table_schema = 'public'
     AND column_name IN ('order_id', 'order_number')) as key_column
FROM public.stripe_orders;

-- List all columns in each table
SELECT 'orders (analytics)' as table_source, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

SELECT 'stripe_orders' as table_source, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'stripe_orders'
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Now you have:
--   • public.orders (analytics) - has order_id
--   • public.stripe_orders - has order_number
--
-- No more conflicts!
-- =====================================================

