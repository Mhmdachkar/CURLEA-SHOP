# ✅ SKU Conflict Error - FIXED!

## The Error You Got

```
ERROR: 23505: duplicate key value violates unique constraint "product_variants_sku_key"
DETAIL: Key (sku)=(SCRUNCHIE-5TONE-5PCS) already exists.
```

## Why It Happened

The `product_variants` table has **TWO unique constraints**:
1. `sku TEXT UNIQUE` - SKU must be unique
2. `UNIQUE(product_id, size, color)` - Product variant combination must be unique

When you ran the script:
- It tried to insert a row with `ON CONFLICT (product_id, size, color)`
- But the SKU `SCRUNCHIE-5TONE-5PCS` already existed from a previous run
- PostgreSQL saw the SKU conflict and threw an error

## ✅ The Fix

I've updated the **hair accessories section** to use `ON CONFLICT (sku)` instead:

### Before (Broken):
```sql
INSERT INTO product_variants (...) VALUES (...)
ON CONFLICT (product_id, size, color)  -- ❌ Doesn't handle SKU conflicts
DO UPDATE SET ...;
```

### After (Fixed):
```sql
INSERT INTO product_variants (...) VALUES (...)
ON CONFLICT (sku)  -- ✅ Handles SKU conflicts properly
DO UPDATE SET ...;
```

## 📋 What Was Changed

Updated these 4 hair accessory inserts:
- ✅ Scrunchies (`SCRUNCHIE-5TONE-5PCS`)
- ✅ Korean Hair Claws (`KOREAN-CLAW-10PCS`)
- ✅ Flat Claw Clips (`FLAT-CLAW-9PCS`)
- ✅ Bow Tie Scrunchies (`BOW-SCRUNCHIE-7PCS`)

All other product inserts still use `ON CONFLICT (product_id, size, color)` which is correct for those.

## 🚀 How to Run Now

1. **Open Supabase SQL Editor**
2. **Copy/paste** the updated `update-stock-inventory.sql` file
3. **Click Run**
4. ✅ Should work without errors!

The script will now:
- Update existing rows if SKU already exists
- Insert new rows if SKU doesn't exist
- Update stock quantities, prices, and other fields
- **No more duplicate key errors!**

## 🧪 Verify It Worked

After running, check:

```sql
-- Should show 470+ rows
SELECT COUNT(*) FROM product_variants;

-- Should show the scrunchies with correct stock
SELECT product_id, variant_name, sku, stock_quantity 
FROM product_variants 
WHERE sku = 'SCRUNCHIE-5TONE-5PCS';

-- Should show all hair accessories
SELECT product_id, variant_name, sku, stock_quantity 
FROM product_variants 
WHERE product_id IN ('scrunchies-7pc', 'curly-clip-1', 'curly-clip-2', 'bow-tie-scrunchies');
```

## 📝 Summary

**Problem:** SKU unique constraint conflict when re-running script
**Solution:** Changed hair accessories to use `ON CONFLICT (sku)` 
**Result:** Script can now be safely re-run multiple times ✅

The fix ensures that if a SKU already exists, it updates that row instead of trying to create a duplicate!

