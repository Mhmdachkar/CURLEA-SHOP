# 🔓 Fix Inventory RLS (Row Level Security) - Quick Guide

## Problem
Your website is getting **"406 Not Acceptable"** or **0 rows** when trying to read `product_variants` from Supabase.

## Root Cause
Row Level Security (RLS) is enabled on the `product_variants` table, but there's no policy allowing anonymous/public users to read it. This blocks your frontend from accessing inventory data.

## Solution

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
1. Open the file: `analytics-backend/supabase/FIX_INVENTORY_RLS.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press `Ctrl+Enter`)

### Step 3: Verify the Fix
The script will automatically run verification queries. Look for:
- ✅ **"RLS DISABLED"** or **"Still enabled (check policies)"** with policies listed
- ✅ **"TEST QUERY"** showing a product variant with stock data
- ✅ **"TOTAL VARIANTS"** showing 53 (or your actual count)

### Step 4: Test Your Website
1. Refresh your website
2. Open browser DevTools (F12) → Console tab
3. Look for successful API calls to `product_variants`
4. Check that "Sold Out" badges appear on products with `stock_quantity = 0`
5. Check that "Only X left!" warnings appear for low stock items

## What the Script Does

### Option A: Disable RLS (Default - Recommended)
```sql
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
```
- **Pros**: Simplest, works immediately
- **Cons**: Less secure (anyone can read inventory)
- **Best for**: Public inventory display

### Option B: Enable RLS with Public Read Policy
```sql
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on product_variants"
ON product_variants FOR SELECT USING (true);
```
- **Pros**: More secure, keeps RLS enabled
- **Cons**: Slightly more complex
- **Best for**: When you want to keep RLS enabled but allow public reads

## Troubleshooting

### Still Getting Errors?

1. **Check Table Exists**
   ```sql
   SELECT COUNT(*) FROM product_variants;
   ```
   If this fails, run `update-stock-inventory.sql` first to create and populate the table.

2. **Check RLS Status**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE tablename = 'product_variants';
   ```
   Should show `rowsecurity = false` after running the fix.

3. **Check Environment Variables**
   - Verify `VITE_SUPABASE_URL` in your `.env` file
   - Verify `VITE_SUPABASE_ANON_KEY` in your `.env` file
   - Make sure they match your Supabase project settings

4. **Check Browser Console**
   - Look for specific error messages
   - Check Network tab for failed API requests
   - Verify the request URL includes your Supabase project URL

5. **Test Direct Query**
   ```sql
   SELECT * FROM product_variants 
   WHERE product_id = 'dreamcurl-midi' 
   LIMIT 1;
   ```
   This should return data if RLS is fixed.

## Files Reference

- **Fix Script**: `analytics-backend/supabase/FIX_INVENTORY_RLS.sql`
- **Diagnostic Queries**: `analytics-backend/supabase/diagnostic-queries.sql`
- **Inventory Data**: `analytics-backend/supabase/update-stock-inventory.sql`
- **RLS Policies (All Tables)**: `analytics-backend/supabase/FIX_RLS_POLICIES.sql`

## Next Steps After Fix

Once RLS is fixed and inventory is loading:
1. ✅ "Sold Out" badges will appear automatically
2. ✅ "Only X left!" warnings will show for low stock
3. ✅ Stock updates will reflect in real-time
4. ✅ Cart will prevent adding out-of-stock items

---

**Need Help?** Check the browser console for specific error messages and share them for further debugging.

