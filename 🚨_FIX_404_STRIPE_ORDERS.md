# 🚨 Fix: 404 Error - stripe_orders Table Not Found

## 🔴 **Error You're Seeing**

```
GET https://vfhxwzcbjdlfmizakvqc.supabase.co/rest/v1/stripe_orders?... 404 (Not Found)
```

**Root Cause:** The code is trying to query `stripe_orders` table, but it doesn't exist in your database yet!

---

## ✅ **Solution: Run SQL Script**

The table needs to be **renamed** from `public.orders` to `stripe_orders` (or created if it doesn't exist).

### **Step 1: Open Supabase SQL Editor**

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### **Step 2: Run the Fix Script**

Copy and paste the entire contents of:
```
analytics-backend/supabase/CREATE_OR_RENAME_TO_STRIPE_ORDERS.sql
```

Then click **Run** (or press `Ctrl+Enter`)

### **Step 3: Verify**

After running, you should see:
```
✅ stripe_orders table is ready!
```

---

## 🔍 **What the Script Does**

1. ✅ **Checks if `public.orders` exists** → Renames it to `stripe_orders`
2. ✅ **Creates `stripe_orders`** if it doesn't exist
3. ✅ **Updates foreign keys** in `order_items` table
4. ✅ **Creates indexes** for performance
5. ✅ **Updates triggers** for `updated_at` column
6. ✅ **Updates RLS policies** for security

---

## 📋 **After Running the Script**

### **Expected Result:**

✅ **No more 404 errors**  
✅ **Stripe Orders table shows data**  
✅ **All existing orders are preserved** (if table was renamed)

### **Verify in Browser:**

1. **Refresh the dashboard**
2. **Open Console (F12)**
3. **Check Network tab:**
   - Should see: `200 OK` instead of `404 Not Found`
   - URL: `/rest/v1/stripe_orders?...`

---

## ⚠️ **Important Notes**

### **If `public.orders` Has Data:**

The script will **preserve all your data** when renaming. Your orders won't be lost!

### **If `public.orders` Doesn't Exist:**

The script will create an empty `stripe_orders` table. You'll need to:
- Run your webhook handlers to populate orders
- Or manually insert test data

---

## 🔧 **Troubleshooting**

### **If Script Fails:**

1. **Check for existing `stripe_orders` table:**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'stripe_orders';
   ```

2. **Check for foreign key conflicts:**
   ```sql
   SELECT * FROM information_schema.table_constraints 
   WHERE table_name = 'order_items';
   ```

3. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'stripe_orders';
   ```

### **If Still Getting 404:**

1. **Verify table exists:**
   ```sql
   SELECT COUNT(*) FROM public.stripe_orders;
   ```

2. **Check table name spelling:**
   - Should be: `stripe_orders` (with underscore)
   - Not: `stripeorders` or `stripe_Orders`

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R`

---

## ✅ **Quick Fix Summary**

1. Open Supabase SQL Editor
2. Run: `CREATE_OR_RENAME_TO_STRIPE_ORDERS.sql`
3. Refresh dashboard
4. Verify data appears

**That's it!** The 404 error will be gone! 🎉

---

## 📝 **Why This Happened**

The code was updated to use `stripe_orders` to avoid conflicts with the analytics `orders` table, but the database table wasn't renamed yet.

**Now both are in sync:**
- ✅ Code queries: `stripe_orders`
- ✅ Database has: `stripe_orders`

Perfect match! 🎯

