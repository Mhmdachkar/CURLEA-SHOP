# 🚨 EMPTY DASHBOARD FIX - START HERE

## Your dashboard shows no data? Follow these 3 steps:

---

## ⚡ **Step 1: Check Database** (2 minutes)

1. Open **Supabase Dashboard** (https://app.supabase.com)
2. Go to **SQL Editor**
3. Copy and paste this file: 

```
analytics-backend/supabase/DIAGNOSE_EMPTY_TABLES.sql
```

4. Click **Run**
5. Look at the **"row_count"** column

---

## 📊 **What do you see?**

### Option A: "0 rows for all tables" ❌

**Problem:** Tables exist but are empty

**Solution:** Run this file to add sample data:

```
analytics-backend/supabase/INSERT_SAMPLE_DATA.sql
```

After running → **Refresh dashboard** → ✅ Data should appear!

---

### Option B: "relation does not exist" ❌

**Problem:** Tables don't exist yet

**Solution:** Run this file to create all tables:

```
analytics-backend/supabase/COMPLETE_SCHEMA.sql
```

Then run:

```
analytics-backend/supabase/INSERT_SAMPLE_DATA.sql
```

After running → **Refresh dashboard** → ✅ Data should appear!

---

### Option C: "Tables have data but RLS is enabled" ❌

**Problem:** Row Level Security is blocking access

**Solution:** Run this file to disable RLS:

```
analytics-backend/supabase/FIX_RLS_POLICIES.sql
```

After running → **Refresh dashboard** → ✅ Data should appear!

---

## ⚡ **Step 2: Check Environment Variables** (1 minute)

1. Open: `analytics-backend/analytics-dashboard/.env`
2. Make sure you have:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Get correct values:
   - Go to **Supabase Dashboard** → **Project Settings** → **API**
   - Copy **Project URL**
   - Copy **anon public** key

4. **Restart your dev server** after updating

---

## ⚡ **Step 3: Verify Dashboard** (30 seconds)

1. Open dashboard in browser
2. Press **F12** → Go to **Console** tab
3. Look for errors:
   - ❌ "Missing Supabase environment variables" → Go back to Step 2
   - ❌ "401 Unauthorized" → Check your anon key
   - ✅ No errors → Dashboard should show data!

---

## 🎯 **Quick Summary**

**Most common issue:** Tables are empty

**Quick fix:**
1. Run `INSERT_SAMPLE_DATA.sql` in Supabase SQL Editor
2. Refresh dashboard
3. Done! ✅

---

## 📚 Need more help?

Read the full guide: `TROUBLESHOOTING_EMPTY_DASHBOARD.md`

---

## ✅ **Success Checklist**

- [ ] Ran `DIAGNOSE_EMPTY_TABLES.sql`
- [ ] Identified the problem (empty tables / no tables / RLS)
- [ ] Ran the appropriate fix SQL file
- [ ] Checked `.env` file
- [ ] Restarted dev server
- [ ] Refreshed dashboard
- [ ] **Data is showing!** 🎉

