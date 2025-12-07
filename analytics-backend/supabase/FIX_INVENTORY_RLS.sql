-- ==========================================
-- FIX INVENTORY RLS (Row Level Security)
-- Run this in Supabase SQL Editor to unlock product_variants table
-- ==========================================
-- 
-- PROBLEM: Getting "406 Not Acceptable" or 0 rows when querying product_variants
-- CAUSE: RLS is enabled but no policy allows public/anonymous reads
-- SOLUTION: Either disable RLS or add a public read policy
-- ==========================================

-- ==========================================
-- STEP 1: DIAGNOSTIC - Check Current State
-- ==========================================

-- 1.1 Check if table exists
SELECT 
    'TABLE EXISTS' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_variants')
        THEN '✅ Table exists'
        ELSE '❌ Table does NOT exist - run update-stock-inventory.sql first'
    END as status;

-- 1.2 Count total rows (if accessible)
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM product_variants;
    RAISE NOTICE 'Total variants in table: %', row_count;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cannot read table - likely RLS blocking: %', SQLERRM;
END $$;

-- 1.3 Check RLS status
SELECT 
    'RLS STATUS' as check_type,
    tablename,
    CASE 
        WHEN rowsecurity THEN '🔒 RLS ENABLED (likely blocking)'
        ELSE '✅ RLS DISABLED (should work)'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'product_variants';

-- 1.4 Check existing policies
SELECT 
    'EXISTING POLICIES' as check_type,
    policyname,
    permissive,
    roles,
    cmd as command
FROM pg_policies
WHERE tablename = 'product_variants';

-- ==========================================
-- STEP 2: FIX - Choose ONE Option Below
-- ==========================================

-- ==========================================
-- OPTION A: DISABLE RLS (Simplest - Recommended for Inventory)
-- ==========================================
-- This allows all users (including anonymous) to read product_variants
-- Best for: Public inventory display where everyone needs to see stock

ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- OPTION B: ENABLE RLS WITH PUBLIC READ POLICY (More Secure)
-- ==========================================
-- Uncomment the section below if you prefer to keep RLS enabled
-- but allow public reads

/*
-- First, drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read on product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public read access" ON product_variants;

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy that allows anyone to read
CREATE POLICY "Allow public read on product_variants"
ON product_variants
FOR SELECT
USING (true);

-- Optional: Allow authenticated users to insert/update (for admin dashboard)
CREATE POLICY "Allow authenticated write on product_variants"
ON product_variants
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
*/

-- ==========================================
-- STEP 3: VERIFICATION - Test the Fix
-- ==========================================

-- 3.1 Verify RLS status after fix
SELECT 
    'AFTER FIX - RLS STATUS' as check_type,
    tablename,
    CASE 
        WHEN rowsecurity THEN '🔒 Still enabled (check policies)'
        ELSE '✅ Disabled (should work now)'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'product_variants';

-- 3.2 Test query (what your frontend does)
SELECT 
    'TEST QUERY' as check_type,
    product_id,
    variant_name,
    size,
    color,
    stock_quantity,
    available_quantity,
    CASE 
        WHEN stock_quantity = 0 THEN '🔴 Sold Out'
        WHEN stock_quantity <= 3 THEN '⚠️ Low Stock'
        ELSE '✅ In Stock'
    END as status
FROM product_variants
WHERE product_id = 'dreamcurl-midi'
  AND size = 'Midi'
  AND color = 'CANDY'
  AND is_active = true
LIMIT 1;

-- 3.3 Count all variants
SELECT 
    'TOTAL VARIANTS' as metric,
    COUNT(*) as count 
FROM product_variants;

-- 3.4 Count sold out items
SELECT 
    'SOLD OUT ITEMS' as metric,
    COUNT(*) as count 
FROM product_variants 
WHERE stock_quantity = 0;

-- 3.5 Count low stock items (≤ 3)
SELECT 
    'LOW STOCK ITEMS (≤3)' as metric,
    COUNT(*) as count 
FROM product_variants 
WHERE stock_quantity > 0 AND stock_quantity <= 3;

-- 3.6 Show sample of sold out items
SELECT 
    'SOLD OUT SAMPLE' as info,
    product_id,
    variant_name,
    size,
    color,
    stock_quantity
FROM product_variants
WHERE stock_quantity = 0
ORDER BY product_id, size, color
LIMIT 5;

-- ==========================================
-- STEP 4: NEXT STEPS
-- ==========================================
-- After running this script:
-- 1. Refresh your website
-- 2. Check browser console - should see stock data loading
-- 3. "Sold Out" badges should appear on products with stock_quantity = 0
-- 4. "Only X left!" warnings should appear for low stock items
-- 
-- If still getting errors:
-- - Check Supabase project settings → API → anon key is correct
-- - Check browser console for specific error messages
-- - Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
-- ==========================================

