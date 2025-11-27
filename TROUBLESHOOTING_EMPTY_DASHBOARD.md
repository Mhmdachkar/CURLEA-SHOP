# 🔍 Troubleshooting Empty Dashboard

## Issue: Dashboard shows no data for any tables

This guide will help you diagnose and fix the issue step by step.

---

## 📋 Step-by-Step Diagnosis

### **Step 1: Check if tables exist and have data**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this file: `analytics-backend/supabase/DIAGNOSE_EMPTY_TABLES.sql`
3. Look at the results:

**Expected output:**
```
table_name              | row_count
------------------------|-----------
visits                  | 5
page_views             | 10
events                 | 15
cart_events            | 20
orders                 | 5
products               | 50
...
```

**Problem indicators:**
- ❌ **Tables don't exist** → Go to Step 2
- ❌ **All tables show 0 rows** → Go to Step 3
- ❌ **RLS is enabled** → Go to Step 4
- ✅ **Tables have data but dashboard is empty** → Go to Step 5

---

### **Step 2: Create the database schema**

If tables don't exist, run this file:

```
analytics-backend/supabase/COMPLETE_SCHEMA.sql
```

This will create all tables, views, and triggers.

After running, go back to **Step 1** to verify.

---

### **Step 3: Add sample data for testing**

If tables exist but are empty, run this file:

```
analytics-backend/supabase/INSERT_SAMPLE_DATA.sql
```

This will add:
- 5 sample visits
- 5 sample page views
- 5 sample events
- 5 sample cart events
- 3 sample orders
- 5 sample products

After running, **refresh your dashboard** - you should see data!

---

### **Step 4: Fix RLS (Row Level Security)**

If tables have data but dashboard shows nothing, RLS might be blocking access.

Run this file:

```
analytics-backend/supabase/FIX_RLS_POLICIES.sql
```

This will **disable RLS** for all analytics tables, allowing the dashboard to read data.

After running, **refresh your dashboard** - you should see data!

---

### **Step 5: Check environment variables**

If tables have data and RLS is disabled, check your `.env` file:

**File:** `analytics-backend/analytics-dashboard/.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these values:**
1. Go to **Supabase Dashboard** → **Project Settings** → **API**
2. Copy **Project URL** → paste as `VITE_SUPABASE_URL`
3. Copy **anon public** key → paste as `VITE_SUPABASE_ANON_KEY`
4. **Restart your dev server** after updating `.env`

---

### **Step 6: Check browser console**

If still no data:

1. Open browser **DevTools** (F12)
2. Go to **Console** tab
3. Look for errors like:
   - `Missing Supabase environment variables`
   - `Failed to fetch`
   - `401 Unauthorized`
   - `relation "visits" does not exist`

**Common fixes:**
- ❌ `Missing Supabase environment variables` → Check Step 5
- ❌ `relation "visits" does not exist` → Run Step 2
- ❌ `401 Unauthorized` → Check anon key in Step 5
- ❌ `Failed to fetch` → Check Supabase project is running

---

## 🎯 Quick Checklist

Run these in order:

- [ ] **Step 1:** Run `DIAGNOSE_EMPTY_TABLES.sql` to check status
- [ ] **Step 2:** Run `COMPLETE_SCHEMA.sql` if tables don't exist
- [ ] **Step 3:** Run `INSERT_SAMPLE_DATA.sql` to add test data
- [ ] **Step 4:** Run `FIX_RLS_POLICIES.sql` to disable RLS
- [ ] **Step 5:** Check `.env` file has correct Supabase credentials
- [ ] **Step 6:** Restart dev server after updating `.env`
- [ ] **Step 7:** Refresh dashboard and check browser console

---

## 🚀 Expected Result

After completing all steps, your dashboard should show:

✅ Visits table with 5+ rows
✅ Page Views table with 5+ rows  
✅ Events table with 5+ rows
✅ Cart Events table with 5+ rows
✅ Orders table with 3+ rows
✅ Products table with 5+ rows
✅ Inventory dashboard with data
✅ All stats and metrics populated

---

## 💡 Most Common Issues

1. **Tables don't exist** → Run `COMPLETE_SCHEMA.sql`
2. **Tables are empty** → Run `INSERT_SAMPLE_DATA.sql`
3. **RLS is blocking** → Run `FIX_RLS_POLICIES.sql`
4. **Wrong .env values** → Check Supabase Project Settings → API
5. **Dev server not restarted** → Restart after changing `.env`

---

## 📞 Still Having Issues?

If none of the above works, run this complete diagnostic:

```sql
-- Run in Supabase SQL Editor
SELECT 
    'Table Exists' as check_type,
    tablename as detail,
    'OK' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('visits', 'page_views', 'events', 'cart_events', 'orders')

UNION ALL

SELECT 
    'Row Count' as check_type,
    'visits' as detail,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'EMPTY' END as status
FROM visits

UNION ALL

SELECT 
    'RLS Status' as check_type,
    tablename as detail,
    CASE WHEN rowsecurity THEN 'ENABLED (may block)' ELSE 'DISABLED (OK)' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'visits';
```

Share the output with your team to identify the exact issue.

---

## ✅ Success!

Once data appears in your dashboard, you're all set! 🎉

The dashboard will now show real-time analytics from your Supabase database.


