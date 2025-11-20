# 🔧 Inventory System - Fixed for Existing Data

## ✅ Problem Fixed

**Error:** `duplicate key value violates unique constraint "unique_variant_per_product"`

**Cause:** The `product_variants` table already existed with some data, and trying to INSERT the same variants again caused a duplicate key error.

**Solution:** Updated the SQL script to use `INSERT ... ON CONFLICT DO UPDATE` (UPSERT pattern)

---

## 🆕 What Changed

### Before (Would Fail):
```sql
INSERT INTO product_variants (...) VALUES (...);
-- Error if variant already exists!
```

### After (Now Safe):
```sql
INSERT INTO product_variants (...) VALUES (...)
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();
-- Updates existing or creates new!
```

---

## ✅ Now the Script is:

1. **Safe to re-run** - Won't create duplicates
2. **Updates existing data** - Refreshes stock quantities
3. **Adds new variants** - Creates missing entries
4. **Idempotent** - Can run multiple times safely

---

## 🔄 Key Changes Made

### 1. Table Creation
```sql
CREATE TABLE IF NOT EXISTS product_variants (...)
-- Won't fail if table already exists
```

### 2. Index Creation
```sql
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
-- Won't fail if index already exists
```

### 3. Data Insertion (UPSERT)
Every INSERT now includes:
```sql
ON CONFLICT (product_id, size, color) 
DO UPDATE SET 
    stock_quantity = EXCLUDED.stock_quantity,
    variant_name = EXCLUDED.variant_name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    updated_at = NOW();
```

This means:
- ✅ If variant exists → **UPDATE** stock quantity
- ✅ If variant doesn't exist → **INSERT** new record
- ✅ No duplicates ever created

### 4. Size Differentiation for Singles
Changed size names for single sets to avoid conflicts:
- `'Midi'` → `'Midi Single'` for single sets
- `'Jumbo'` → `'Jumbo Single'` for single sets
- `'Midi'` → `'Midi Bonnet'` for midi bonnets
- `'Original'` → `'Original Bonnet'` for original bonnets
- `'Jumbo'` → `'Jumbo Bonnet'` for jumbo bonnets

This ensures full sets and single sets don't conflict even with same color.

---

## 📋 Run the Script Now

### Steps:
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of:
   ```
   analytics-backend/supabase/update-stock-inventory.sql
   ```
4. Paste into SQL Editor
5. Click **Run** (or press Ctrl+Enter)

### What Will Happen:
- ✅ Table created (if not exists)
- ✅ Existing variants updated with new stock quantities
- ✅ New variants inserted
- ✅ Indexes created (if not exist)
- ✅ Triggers set up for auto-inventory reduction
- ✅ Views created for dashboard

### No Errors Expected
The script should run successfully without any duplicate key errors!

---

## 🔍 Verify After Running

Check that variants were updated/inserted:

```sql
-- View all variants
SELECT * FROM inventory_dashboard
ORDER BY product_id, size, color;

-- Count total variants
SELECT COUNT(*) FROM product_variants;
-- Should show around 40-50 variants

-- Check total stock
SELECT SUM(stock_quantity) FROM product_variants;
-- Should be 470 units

-- View by product
SELECT 
    product_id,
    COUNT(*) as variant_count,
    SUM(stock_quantity) as total_stock
FROM product_variants
GROUP BY product_id
ORDER BY product_id;
```

---

## 📊 What You Should See

### Expected Counts:
- **Full Sets:** ~16 variants (4 sizes × 4 colors)
- **Single Sets:** ~13 variants
- **Bun Bons:** ~10 variants
- **Accessories:** 4 variants

**Total:** ~43 variants with 470 total units

---

## 🎯 Next Steps

After running the script successfully:

1. ✅ Check inventory dashboard view
2. ✅ Verify stock quantities are correct
3. ✅ Test that orders reduce inventory
4. ✅ Check low stock alerts

```sql
-- Check low stock items
SELECT * FROM low_stock_alerts;

-- Test inventory movement (manual)
UPDATE product_variants
SET stock_quantity = stock_quantity - 1
WHERE sku = 'DC-MIDI-PURPLE';

-- Verify the movement was logged
SELECT * FROM inventory_movements
ORDER BY created_at DESC
LIMIT 5;
```

---

## ⚠️ If You Still Get Errors

If you still see duplicate key errors, you can:

### Option 1: Check what's already in the table
```sql
SELECT * FROM product_variants
WHERE product_id = 'dreamcurl-midi' AND size = 'Midi' AND color = 'Green';
```

### Option 2: Drop and recreate (CAUTION: Deletes all data!)
```sql
-- Only do this if you want to start fresh!
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;

-- Then run the full script again
```

---

## ✅ Summary

**Problem:** Duplicate key constraint violation  
**Solution:** Changed INSERT to INSERT ... ON CONFLICT DO UPDATE  
**Result:** Script now safe to run multiple times  
**Status:** Ready to deploy ✅

Just re-run the updated SQL script and it should work perfectly!

