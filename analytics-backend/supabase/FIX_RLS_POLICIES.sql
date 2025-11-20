-- =====================================================
-- FIX RLS (Row Level Security) POLICIES
-- Run this if tables exist but dashboard shows no data
-- This allows anonymous/authenticated users to read data
-- =====================================================

-- IMPORTANT: Only run this if you've confirmed:
-- 1. Tables exist
-- 2. Tables have data (run DIAGNOSE_EMPTY_TABLES.sql first)
-- 3. Dashboard still shows nothing

-- Option 1: DISABLE RLS COMPLETELY (simplest for analytics dashboard)
-- This allows all users to read all data
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- Option 2: ENABLE RLS WITH PERMISSIVE POLICIES (if you want RLS enabled)
-- Uncomment the section below if you want to keep RLS enabled

/*
-- Enable RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies to allow SELECT for all users
CREATE POLICY "Allow public read access" ON visits FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON page_views FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON cart_events FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON inventory_movements FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.order_items FOR SELECT USING (true);

-- Allow INSERT for authenticated users (for webhooks/API)
CREATE POLICY "Allow authenticated insert" ON visits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON page_views FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON cart_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON product_variants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON inventory_movements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);

-- Allow service role to do anything
CREATE POLICY "Allow service role all access" ON visits FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all access" ON page_views FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all access" ON events FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all access" ON cart_events FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all access" ON orders FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all access" ON products FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all access" ON product_variants FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all access" ON inventory_movements FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all access" ON public.orders FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all access" ON public.order_items FOR ALL TO service_role USING (true);
*/

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this, check RLS status:
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('visits', 'page_views', 'events', 'cart_events', 'orders', 'products', 'product_variants', 'inventory_movements')
ORDER BY tablename;

