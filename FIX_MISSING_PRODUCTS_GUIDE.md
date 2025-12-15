# Fix Missing Products in Inventory

## Problem
Two products are showing as "Out of Stock" on the website even though they have inventory:
1. **CURLEA Geometric Flower Hair Claw Clip Set** (`curly-claw-1`) - 40 units available
2. **CURLEA Elegant Satin Scarf + Scrunchies Set** (`curly-scarf-1`) - 22 units available

## Root Cause
These products were missing from the `product_variants` table in the Supabase database. The original CSV import script had incorrect product IDs for these items.

## Solution

### Option 1: Quick Fix (Recommended)
Run the dedicated fix script that only adds/updates these two products:

1. Open your Supabase Dashboard
2. Navigate to: **SQL Editor**
3. Copy the contents of: `analytics-backend/supabase/fix-missing-accessories.sql`
4. Paste and run the SQL script
5. Verify the products were added using the verification query at the end

### Option 2: Full Inventory Re-import
If you want to ensure all inventory is up to date, run the full import:

1. Open your Supabase Dashboard
2. Navigate to: **SQL Editor**
3. Copy the contents of: `analytics-backend/supabase/inventory-update-from-csv.sql`
4. Paste and run the SQL script
5. This will delete ALL existing inventory and reimport from the CSV data

## What Was Fixed

### Updated Files:
1. **`analytics-backend/supabase/inventory-update-from-csv.sql`**
   - Added correct entry for `curly-claw-1` with 40 units
   - Fixed product ID for `curly-scarf-1` (was using `bow-tie-7set` incorrectly)
   - Updated quantities to match actual inventory

2. **`analytics-backend/supabase/fix-missing-accessories.sql`** (NEW FILE)
   - Quick-fix script to add only the two missing products
   - Safer option that doesn't affect other inventory

## Database Entries

After running the fix, these entries will be in your `product_variants` table:

| product_id      | variant_name                               | size     | color | stock_quantity | price  |
|-----------------|-------------------------------------------|----------|-------|----------------|--------|
| curly-claw-1    | Geometric Flower Hair Claw Clip 10 Set    | Standard | NULL  | 40             | $15.99 |
| curly-scarf-1   | Elegant Satin Scarf + Scrunchies 7 Set   | Standard | NULL  | 22             | $11.99 |

## Verification Steps

After running the SQL script:

1. **Check the database:**
   ```sql
   SELECT 
       product_id,
       variant_name,
       size,
       color,
       stock_quantity,
       available_quantity,
       is_active
   FROM product_variants
   WHERE product_id IN ('curly-claw-1', 'curly-scarf-1');
   ```
   
   Expected result: 2 rows showing both products with stock

2. **Test on the website:**
   - Go to the home page
   - Find these products in the "Trending Now" section or product listings
   - Verify they show "In Stock" status
   - Try adding them to cart (should work now)

3. **Check the console:**
   - Open browser DevTools (F12)
   - Look for any Supabase errors related to these products
   - Should see successful stock queries

## Frontend Configuration

The frontend is already correctly configured to fetch these products:
- **Product IDs:** `curly-claw-1`, `curly-scarf-1`
- **Size:** `'Standard'` (no variants)
- **Color:** `NULL` (no color options)
- **Stock Hook:** `useProductStock` fetches from `product_variants` table

No frontend code changes are needed - the issue was purely missing database entries.

## Troubleshooting

### If products still show as out of stock:

1. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   
2. **Check RLS policies:**
   ```sql
   -- Verify RLS allows reading from product_variants
   SELECT * FROM product_variants WHERE product_id = 'curly-claw-1';
   ```
   
3. **Verify Supabase connection:**
   - Check that your `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Check browser console for connection errors

4. **Check the `is_active` flag:**
   ```sql
   UPDATE product_variants 
   SET is_active = true 
   WHERE product_id IN ('curly-claw-1', 'curly-scarf-1');
   ```

## Next Steps

After fixing these two products, you should:
1. Run the verification queries to confirm the fix
2. Test adding both products to cart on the website
3. Monitor for any other products showing incorrect stock
4. Consider setting up automated inventory sync if you update stock frequently

