# 🚀 START HERE - Simple 3-Step Fix

## The Problem

❌ Error: `column "order_number" does not exist`
❌ Dashboard showing empty/null values

## The Cause

**Old buggy triggers** are still in your database from previous attempts. Even though we created "fixed" SQL files, the old triggers were never removed, so they kept running the buggy code.

---

## ✅ The Solution (3 Steps)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **"New Query"**

---

### Step 2: Run the Cleanup File

📁 **Copy this entire file:**
```
analytics-backend/supabase/CLEANUP-THEN-FIX.sql
```

**What it does:**
- ❌ Removes ALL old buggy triggers
- ✅ Creates tables if needed
- ✅ Adds all 6 missing columns
- ✅ Creates NEW clean trigger (no bugs!)

**Expected output:**
```
Step 1 Complete: Old triggers removed
Step 2 Complete: Tables verified
Step 3 Complete: All columns added
Step 4 Complete: New trigger function created
Step 5 Complete: New trigger installed
✅ SUCCESS: All setup complete!
```

---

### Step 3: Populate Inventory Data

📁 **Copy this entire file:**
```
analytics-backend/supabase/update-stock-inventory.sql
```

**What it does:**
- Creates `product_variants` table with 470 products
- Creates `inventory_movements` tracking table
- Sets up inventory views

This fixes the empty/null dashboard issue by adding actual data!

---

## ✅ Done!

After running both files:
- ✅ No more "order_number" errors
- ✅ Inventory dashboard will show data
- ✅ Orders will automatically reduce inventory
- ✅ All analytics tables connected

---

## 🧪 Test It

Place a test order and verify:

```sql
-- Check trigger installed
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'orders' AND event_object_schema = 'public';

-- Should see: trigger_reduce_inventory_public

-- Check columns added
SELECT column_name FROM information_schema.columns
WHERE table_name = 'order_items' AND table_schema = 'public'
AND column_name IN ('product_id', 'size', 'color', 'sku', 'variant_details', 'variant_id');

-- Should see all 6 columns

-- Check inventory data
SELECT COUNT(*) FROM product_variants;
-- Should see 470+ rows
```

---

## 📁 Files Reference

| File | Purpose | When to Run |
|------|---------|-------------|
| `CLEANUP-THEN-FIX.sql` | Removes old triggers, adds columns | **RUN FIRST** |
| `update-stock-inventory.sql` | Populates inventory data | **RUN SECOND** |
| `diagnose-database.sql` | (Optional) Shows database state | Before fixes |

---

## 🆘 Still Having Issues?

### Issue: "relation product_variants does not exist"

**Fix:** Run `update-stock-inventory.sql`

### Issue: Dashboard still empty

**Reason:** No orders placed yet

**Fix:** Place a test order through Stripe checkout OR insert test data:

```sql
-- Insert test order
INSERT INTO public.orders (order_number, total_amount, currency, status)
VALUES ('TEST-001', 50.00, 'USD', 'completed');

-- Get the order ID
SELECT id FROM public.orders WHERE order_number = 'TEST-001';

-- Insert test order item (use the ID from above)
INSERT INTO public.order_items (
    order_id, product_name, product_id, size, color, sku,
    quantity, unit_price, total_price
) VALUES (
    'PASTE_ORDER_ID_HERE',
    'DreamCurl Midi - Purple',
    'dreamcurl-midi',
    'Midi',
    'Purple',
    'DC-MIDI-PURPLE',
    1,
    22.99,
    22.99
);
```

---

## 🎯 Summary

The fix was simple: **Remove old triggers, then create new ones.**

Old triggers = old buggy code still running
New triggers = clean code, no column errors

**Just run 2 SQL files and you're done!** ✅

