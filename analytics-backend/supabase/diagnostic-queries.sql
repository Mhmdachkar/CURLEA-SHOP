-- ==========================================
-- DIAGNOSTIC QUERIES - Run these in Supabase SQL Editor
-- ==========================================

-- 1. CHECK IF TABLE EXISTS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'product_variants';
-- Expected: Should return 1 row with 'product_variants'

-- 2. COUNT TOTAL ROWS IN TABLE
SELECT COUNT(*) as total_variants FROM product_variants;
-- Expected: Should return 53

-- 3. VIEW FIRST 10 ROWS
SELECT * FROM product_variants ORDER BY product_id LIMIT 10;
-- Expected: Should show your products with stock quantities

-- 4. CHECK RLS (Row Level Security) STATUS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'product_variants';
-- If rowsecurity = true, RLS is enabled and might be blocking

-- 5. CHECK EXISTING RLS POLICIES
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'product_variants';
-- Shows what policies exist

-- 6. TEST SPECIFIC PRODUCT QUERY (what frontend is doing)
SELECT * 
FROM product_variants
WHERE product_id = 'dreamcurl-midi'
  AND size = 'Midi'
  AND color = 'CANDY'
  AND is_active = true;
-- Expected: Should return 1 row with stock_quantity = 10

-- ==========================================
-- FIX: DISABLE RLS (Run this if RLS is blocking)
-- ==========================================
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, add a public read policy:
CREATE POLICY "Allow public read on product_variants"
ON product_variants
FOR SELECT
USING (true);

-- ==========================================
-- VERIFICATION: Check a sold-out item
-- ==========================================
SELECT product_id, variant_name, size, color, stock_quantity
FROM product_variants
WHERE stock_quantity = 0
ORDER BY product_id;
-- Expected: 8 rows (sold out items)
