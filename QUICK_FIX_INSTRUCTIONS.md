# QUICK FIX: Run This SQL File

## The Error You Got

```
ERROR: 42P01: relation "public.order_items" does not exist
```

This happened because the `order_items` table didn't exist in your database yet.

---

## ✅ FIXED!

The SQL file has been updated to **automatically create** both tables if they don't exist:
1. `public.orders` (parent table)
2. `public.order_items` (child table)  
3. All 6 new columns
4. All indexes
5. Updated trigger functions

---

## How to Run the Fixed SQL File

### Option 1: Supabase SQL Editor (Recommended)

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy the ENTIRE contents of this file:
   ```
   curlea-luxe-animation-main/analytics-backend/supabase/fix-order-items-columns.sql
   ```
5. Paste into the SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)

### Option 2: Supabase CLI

```bash
cd curlea-luxe-animation-main/analytics-backend
supabase db push
```

---

## What Will Happen

The script will:

✅ **Create `public.orders` table** (if it doesn't exist)
- With all required columns (order_number, status, customer_email, etc.)
- With all indexes
- **Safe if table already exists - won't overwrite**

✅ **Create `public.order_items` table** (if it doesn't exist)  
- With basic columns (product_name, variant, quantity, price, etc.)
- **Safe if table already exists - won't overwrite**

✅ **Add 6 new columns** to `order_items`:
- `product_id` - Product identifier
- `size` - Variant size
- `color` - Variant color
- `sku` - Product SKU
- `variant_details` - Full variant info as JSONB
- `variant_id` - Foreign key to product_variants

✅ **Create indexes** on all new columns

✅ **Update trigger functions** with multi-strategy matching

✅ **100% Safe to re-run** - Uses `IF NOT EXISTS` and `DO $$ BEGIN ... END $$` blocks

---

## Verification

After running, verify with:

```sql
-- Check orders table exists
SELECT COUNT(*) FROM public.orders;

-- Check order_items table exists with all columns
SELECT 
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'order_items'
ORDER BY ordinal_position;

-- Should show at least 16 columns including:
-- product_id, size, color, sku, variant_details, variant_id
```

---

## Next Step

After running this SQL successfully:

1. ✅ **Database is ready**
2. ⏭️ **Deploy the updated code** (see `APPLY_INVENTORY_FIX.md`)
3. 🧪 **Test with an order**

---

## Still Getting Errors?

### Error: "relation product_variants does not exist"

**Solution:** Run the inventory setup first:
```bash
# File: analytics-backend/supabase/update-stock-inventory.sql
```

### Error: "permission denied"

**Solution:** Make sure you're using the **service role key** or running as the database owner.

In Supabase SQL Editor, you should be automatically authenticated with admin permissions.

### Error: "schema public does not exist"

**Solution:** The public schema should exist by default. If not:
```sql
CREATE SCHEMA IF NOT EXISTS public;
```

---

## Summary

The SQL file now:
- ✅ Creates tables if they don't exist
- ✅ Adds columns if they don't exist  
- ✅ Creates indexes if they don't exist
- ✅ Updates functions safely
- ✅ **100% safe to re-run multiple times**

Just run it in Supabase SQL Editor and you're good to go! 🚀

