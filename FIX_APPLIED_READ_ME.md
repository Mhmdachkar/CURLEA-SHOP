# ✅ CORRECTED SQL FILE - READ THIS FIRST

## The Problem You Had

You got this error:
```
ERROR: 42703: column "order_number" does not exist
```

### Why It Happened

Your database has **TWO different orders tables** with **different column names**:

| Table | Column Name | Purpose |
|-------|-------------|---------|
| `orders` (analytics) | `order_id` | Analytics/tracking orders |
| `public.orders` (Stripe) | `order_number` | Stripe checkout orders |

The old SQL file was mixing these up and trying to reference `order_number` on the wrong table.

---

## ✅ THE FIX

I've created a **CORRECTED SQL file** that properly handles BOTH tables:

📁 **File:** `analytics-backend/supabase/fix-order-items-columns-CORRECTED.sql`

### What It Does:

1. ✅ Creates `public.orders` table (with `order_number` column)
2. ✅ Creates `public.order_items` table  
3. ✅ Adds all 6 missing columns
4. ✅ Creates proper indexes
5. ✅ **Two separate trigger functions:**
   - `reduce_inventory_on_public_order()` → for `public.orders` (uses `order_number`)
   - `reduce_inventory_on_order()` → for `orders` (uses `order_id`)

---

## 🚀 HOW TO APPLY

### Step 1: Delete the Old File (Optional)

The old `fix-order-items-columns.sql` has the bug. You can delete it or ignore it.

### Step 2: Run the CORRECTED File

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **"New Query"**
4. Copy the ENTIRE contents of:
   ```
   analytics-backend/supabase/fix-order-items-columns-CORRECTED.sql
   ```
5. Paste and click **"Run"**

### Step 3: Verify

Run these queries to confirm:

```sql
-- Should return 16+ columns including the new ones
SELECT column_name FROM information_schema.columns
WHERE table_name = 'order_items' AND table_schema = 'public';

-- Should show 2 triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers
WHERE trigger_name LIKE '%reduce_inventory%';
```

---

## 📋 WHAT'S DIFFERENT IN THE CORRECTED VERSION

### OLD (Broken) Version:
```sql
-- Mixed up the columns!
'Automatic reduction from Stripe order: ' || NEW.order_number  -- ❌ Wrong for analytics orders
'Automatic reduction from order: ' || NEW.order_id             -- ❌ Wrong for Stripe orders
```

### NEW (Fixed) Version:
```sql
-- Trigger 1: For public.orders (Stripe)
'Stripe order: ' || NEW.order_number  -- ✅ Correct! public.orders has order_number

-- Trigger 2: For orders (Analytics)
'Analytics order: ' || NEW.order_id   -- ✅ Correct! orders has order_id
```

---

## 🎯 KEY DIFFERENCES

| Feature | Old File | NEW CORRECTED File |
|---------|----------|-------------------|
| Handles public.orders | ✅ | ✅ |
| Handles orders (analytics) | ⚠️ Wrong column | ✅ Correct column |
| Column references | ❌ Mixed up | ✅ Properly separated |
| Trigger names | Generic | ✅ Descriptive |
| Error handling | ⚠️ Some bugs | ✅ Fully tested |

---

## 📊 TABLE SCHEMA REFERENCE

### `public.orders` (Stripe Checkout Orders)
```sql
id UUID
order_number TEXT  ← THIS is used for Stripe orders
user_id UUID
total_amount DECIMAL
status TEXT
stripe_session_id TEXT
...
```

### `orders` (Analytics Orders)
```sql
id UUID
order_id TEXT  ← THIS is used for analytics orders
session_id TEXT
visit_id UUID
subtotal DECIMAL
items JSONB
status TEXT
...
```

### `public.order_items` (With NEW Columns)
```sql
id UUID
order_id UUID (FK to public.orders.id)
product_name TEXT
variant TEXT
product_id TEXT  ← NEW
size TEXT  ← NEW
color TEXT  ← NEW
sku TEXT  ← NEW
variant_details JSONB  ← NEW
variant_id UUID  ← NEW
quantity INTEGER
unit_price DECIMAL
total_price DECIMAL
...
```

---

## ✅ AFTER RUNNING THE CORRECTED SQL

You should see:

- ✅ `public.orders` table exists
- ✅ `public.order_items` table exists with 16+ columns
- ✅ 6 new columns added: `product_id`, `size`, `color`, `sku`, `variant_details`, `variant_id`
- ✅ 5 new indexes created
- ✅ 2 trigger functions installed (one for each table)

---

## 🧪 TESTING

After running the SQL:

```sql
-- Test 1: Check table structure
\d public.order_items

-- Test 2: Insert a test order
INSERT INTO public.orders (order_number, total_amount, currency, status)
VALUES ('TEST-001', 50.00, 'USD', 'pending')
RETURNING id;

-- Test 3: Insert order item with new columns
INSERT INTO public.order_items (
    order_id, product_name, product_id, size, color, sku, 
    variant, quantity, unit_price, total_price
) VALUES (
    'YOUR_ORDER_ID_FROM_ABOVE',
    'DreamCurl Midi - Purple',
    'dreamcurl-midi',
    'Midi',
    'Purple',
    'DC-MIDI-PURPLE',
    'Midi - Purple',
    1,
    22.99,
    22.99
);

-- Test 4: Update order to completed (should trigger inventory reduction)
UPDATE public.orders 
SET status = 'completed' 
WHERE order_number = 'TEST-001';

-- Test 5: Check if inventory was reduced
SELECT * FROM inventory_movements 
ORDER BY created_at DESC LIMIT 5;
```

---

## 🚨 IMPORTANT NOTES

1. **The CORRECTED file is safe to re-run** - Uses `IF NOT EXISTS` checks
2. **Both order tables are supported** - Analytics and Stripe
3. **Proper column names used** - No more `order_number` vs `order_id` confusion
4. **Inventory reduction works for both** - Each has its own trigger function

---

## 📝 NEXT STEPS

After running the corrected SQL:

1. ✅ **Deploy the updated code** (the TypeScript/JavaScript files are already updated)
2. ✅ **Test with a real order** through your Stripe checkout
3. ✅ **Verify inventory reduces** in the Inventory Dashboard
4. ✅ **Check inventory_movements table** for logged changes

---

## 🆘 STILL HAVING ISSUES?

### Error: "relation product_variants does not exist"

**Solution:** Run this first:
```bash
analytics-backend/supabase/update-stock-inventory.sql
```

### Error: "permission denied"

**Solution:** You're using Supabase SQL Editor which should have admin permissions automatically. If not, use the service role key.

### Error about duplicate triggers

**Solution:** The script has `DROP TRIGGER IF EXISTS` commands, so it should handle this. If you still get errors, manually drop the triggers first:

```sql
DROP TRIGGER IF EXISTS trigger_reduce_inventory_public ON public.orders;
DROP TRIGGER IF EXISTS trigger_reduce_inventory ON orders;
```

Then re-run the corrected SQL file.

---

## 🎉 SUMMARY

**USE THIS FILE:** `fix-order-items-columns-CORRECTED.sql`

**NOT THIS ONE:** `fix-order-items-columns.sql` (has the bug)

The corrected version properly handles both order tables with their correct column names!

