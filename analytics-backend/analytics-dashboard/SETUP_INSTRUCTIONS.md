# 🚀 Real-Time Analytics Dashboard - Setup Instructions

## ✅ Current Status
Your dashboard is **RUNNING** at `http://localhost:3000/`

However, it needs the database views to display real-time data.

---

## 📋 What You Need to Do (2 Simple Steps)

### Step 1: Run the Correct Database Setup

❌ **Don't use:** `setup-database.sql` (this has an error)  
✅ **Use instead:** `setup-dashboard-views.sql` (corrected version)

**How to run it:**

1. Go to your **Supabase Dashboard** (https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `setup-dashboard-views.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Ctrl+Enter)

You should see:
```
✅ Dashboard views created successfully! Real-time analytics is now enabled.
```

### Step 2: Refresh Your Dashboard

1. Go back to `http://localhost:3000/`
2. The dashboard will automatically connect to Supabase
3. You should see the live data indicator (green dot) at the top

---

## 🎯 What This Does

The SQL script creates **6 database views** that the dashboard uses:

1. ✅ `traffic_by_source` - Shows where visitors come from
2. ✅ `top_products_summary` - Displays top performing products
3. ✅ `conversion_funnel_summary` - Tracks user journey
4. ✅ `total_sales_summary` - Revenue and order statistics
5. ✅ `aov_summary` - Average order value
6. ✅ `hourly_performance` - Today's hourly trends

**Plus enables real-time updates** for:
- Visits
- Orders  
- Page views
- Cart events
- Custom events

---

## 🔄 How Real-Time Analytics Works

### Your Dashboard Has 2 Types of Real-Time Updates:

#### 1. **Automatic Polling** (Every 30 seconds)
- Dashboard automatically refreshes all data
- No action needed from you
- Works even if real-time subscriptions aren't enabled

#### 2. **Instant Updates** (Supabase Real-Time)
- Dashboard gets **instant notifications** when new data arrives
- Updates immediately when:
  - New visitor arrives
  - New order is placed
  - Cart events happen
  - Page views occur

### You'll see:
- 🟢 **Green "Live data" indicator** = Connected and updating
- ⏰ **Last updated timestamp** = Shows when data was refreshed
- 🔄 **Automatic charts updates** = No page refresh needed

---

## 🧪 Testing Real-Time Updates

### Option 1: Add Sample Data
Run this in Supabase SQL Editor to add test data:

```sql
-- Sample visit
INSERT INTO visits (session_id, ip_address, device, browser, country, utm_source, utm_medium) 
VALUES ('test-session-' || NOW(), '192.168.1.1', 'Desktop', 'Chrome', 'US', 'google', 'cpc');

-- Sample page view
INSERT INTO page_views (session_id, url, path, title, time_on_page) 
VALUES ('test-session-' || NOW(), 'https://curlea.com/', '/', 'Homepage', 45);
```

Your dashboard should update automatically within 30 seconds (or instantly if real-time is working)!

### Option 2: Use Your Real Website
Once you integrate the analytics SDK on your main website, real visits will show up in the dashboard in real-time!

---

## 🐛 Troubleshooting

### ❌ "Error loading dashboard" message?
**Fix:** Run the `setup-dashboard-views.sql` file in Supabase

### ❌ Charts show "No data"?
**Fix:** You need to add some data first (see testing section above)

### ❌ Real-time updates not working?
**Check:**
1. Supabase real-time is enabled in your project settings
2. Browser console for any errors (F12 → Console)
3. Green live indicator is showing

### ❌ "Permission denied" errors?
**Fix:** The SQL script includes GRANT statements, make sure they ran successfully

---

## 📊 What You'll See in the Dashboard

Once set up, your dashboard displays:

### 📈 **Top Stats Cards**
- Total Visits (last 30 days)
- Total Revenue 
- Total Orders
- Average Order Value

### 📊 **Charts**
- **Traffic Sources** - Pie chart of visitor sources
- **Top Products** - Bar chart of product performance  
- **Conversion Funnel** - User journey visualization
- **Hourly Performance** - Today's trends by hour

### 📋 **Tables**
- Product performance with metrics
- Real-time data updates

---

## ✨ Real-Time Features

✅ **Live Status Indicator** - Shows connection status  
✅ **Auto-refresh** - Updates every 30 seconds  
✅ **Instant Notifications** - Real-time Supabase subscriptions  
✅ **Error Handling** - Retry buttons if connection fails  
✅ **Last Updated Time** - Shows when data was last refreshed  
✅ **Responsive Design** - Works on mobile, tablet, desktop  

---

## 🎉 You're All Set!

After running `setup-dashboard-views.sql`, your dashboard will have:
- ✅ Real-time data from Supabase
- ✅ Live updates every 30 seconds
- ✅ Instant notifications for new data
- ✅ Beautiful charts and metrics
- ✅ Full analytics tracking

**Dashboard URL:** http://localhost:3000/

---

## 📚 Additional Resources

- **Main schema:** `schema.sql` (already in Supabase)
- **Advanced functions:** `functions.sql` (optional)
- **Dashboard code:** `src/components/Dashboard.tsx`
- **Supabase config:** `src/lib/supabase.ts`

---

**Questions?** Check the browser console (F12) for any errors and make sure the SQL script ran successfully!
