# 🗄️ Supabase Analytics Backend Setup Guide

This guide will walk you through setting up the complete Supabase backend for your Shopify-style analytics platform.

---

## 📋 Prerequisites

- Supabase account (free tier works fine to start)
- Basic understanding of SQL
- Text editor or IDE

---

## 🚀 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `curlea-analytics` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (can upgrade later)
4. Click **"Create new project"**
5. Wait 2-3 minutes for project initialization

---

## 🔧 Step 2: Deploy Database Schema

### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase project dashboard, navigate to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this repository
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **"Run"** (or press `Ctrl/Cmd + Enter`)
7. Wait for execution to complete - you should see "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

---

## 📊 Step 3: Deploy Analytics Functions

1. In **SQL Editor**, create another new query
2. Open `supabase/functions.sql`
3. Copy and paste the entire contents
4. Click **"Run"**
5. Verify success

---

## 🔑 Step 4: Get Your API Keys

1. Go to **Project Settings** → **API** (left sidebar)
2. You'll need two keys:
   - **`anon public`** key - for client-side tracking (safe to expose)
   - **`service_role`** key - for server-side operations (keep secret!)

3. Copy both keys and store them securely

**Environment Variables Setup:**
```env
# For your tracking SDK (public)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# For your analytics dashboard and Edge Functions (private)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## ✅ Step 5: Verify Installation

Run these test queries in SQL Editor to verify everything is working:

### Test 1: Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Result**: You should see:
- `campaigns`
- `cart_events`
- `conversion_funnel`
- `events`
- `orders`
- `page_views`
- `products`
- `visits`

### Test 2: Check Functions
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

**Expected Result**: You should see all analytics functions listed.

### Test 3: Check Views
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Result**:
- `abandoned_carts`
- `campaign_performance`
- `conversion_funnel_realtime`
- `daily_overview`
- `sales_overview`
- `top_products_by_revenue`
- `traffic_sources`

### Test 4: Check Sample Data
```sql
SELECT * FROM products;
```

**Expected Result**: 3 sample products (Heatless Curler, Silk Bonnet, Curly Claw)

### Test 5: Test a Function
```sql
SELECT * FROM get_realtime_stats();
```

**Expected Result**: A row with zeros (since no real data yet)

---

## 🔐 Step 6: Configure Row Level Security

The schema already has RLS policies set up, but let's verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

**Important Security Notes:**

1. **Public Insert Endpoints**: Tables allow anonymous inserts via the `anon` key for tracking. This is intentional and safe.

2. **Dashboard Access**: Use the `service_role` key for your admin dashboard. Never expose this key in client-side code.

3. **Optional**: Add authenticated user policies if you want role-based access:

```sql
-- Example: Add policy for authenticated admin users
CREATE POLICY "Admin users can do everything" ON visits
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 📈 Step 7: Test Data Ingestion

Let's insert some test data to verify everything works:

```sql
-- Insert a test visit
INSERT INTO visits (session_id, device, browser, country, landing_page)
VALUES ('test-session-001', 'Desktop', 'Chrome', 'United States', '/');

-- Insert a test page view
INSERT INTO page_views (session_id, url, title, scroll_depth, time_on_page)
VALUES ('test-session-001', 'https://yoursite.com/', 'Home Page', 75, 45);

-- Insert a test cart event
INSERT INTO cart_events (
  session_id, 
  event_type, 
  product_id, 
  external_product_id,
  product_title,
  quantity, 
  price,
  total_value
)
VALUES (
  'test-session-001', 
  'add', 
  (SELECT id FROM products WHERE product_id = 'heatless-curler-1'),
  'heatless-curler-1',
  'Heatless Hair Curling Rod Set',
  1, 
  29.99,
  29.99
);

-- Verify the data
SELECT * FROM visits WHERE session_id = 'test-session-001';
SELECT * FROM page_views WHERE session_id = 'test-session-001';
SELECT * FROM cart_events WHERE session_id = 'test-session-001';
```

---

## 🎯 Step 8: Test Analytics Queries

Now let's test some analytics functions:

```sql
-- Get stats for the last 30 days
SELECT * FROM get_stats_for_period(
  NOW() - INTERVAL '30 days',
  NOW()
);

-- Get conversion funnel
SELECT * FROM get_conversion_funnel_detailed();

-- Get top products
SELECT * FROM get_top_products('revenue', 10);

-- Get traffic by source
SELECT * FROM get_traffic_by_source();

-- Get abandoned carts
SELECT * FROM get_abandoned_carts_detailed();
```

---

## 🧹 Step 9: Set Up Scheduled Maintenance (Optional)

You can set up pg_cron for automatic maintenance:

```sql
-- Update conversion funnel daily at midnight
SELECT cron.schedule(
  'update-funnel-daily',
  '0 0 * * *',
  $$SELECT update_conversion_funnel_aggregates(CURRENT_DATE - 1)$$
);

-- Cleanup old data monthly
SELECT cron.schedule(
  'cleanup-old-data',
  '0 2 1 * *',
  $$SELECT cleanup_old_analytics_data(365)$$
);

-- Optimize tables weekly
SELECT cron.schedule(
  'optimize-tables-weekly',
  '0 3 * * 0',
  $$SELECT optimize_analytics_tables()$$
);
```

---

## 📊 Step 10: Understanding Your Schema

### Key Tables:

1. **`visits`** - One row per unique visitor session
   - Tracks device, location, UTM parameters
   - Parent table for session-based analytics

2. **`page_views`** - Every page view
   - Includes engagement metrics (scroll depth, time on page)
   - Links to visits via `session_id`

3. **`events`** - Custom tracking events
   - Flexible JSONB payload for any data
   - Use for: button clicks, video plays, form submissions, etc.

4. **`products`** - Your product catalog
   - Includes pricing and cost for profit calculation
   - Sync this with your e-commerce platform

5. **`cart_events`** - Shopping cart interactions
   - Tracks: add, remove, checkout start, checkout complete
   - Key for funnel analysis

6. **`orders`** - Completed purchases
   - Full revenue and profit tracking
   - Links to visits for attribution

7. **`campaigns`** - Marketing campaign metadata
   - Track costs and ROI by campaign
   - Links to visits via UTM parameters

8. **`conversion_funnel`** - Pre-aggregated metrics
   - Improves dashboard performance
   - Update daily via scheduled job

---

## 🔄 Next Steps

✅ **Database**: Complete!  
🌐 **Next**: Set up the Frontend Tracking SDK (PROJECT 2)  
⚙️ **Then**: Create Edge Functions for data ingestion (PROJECT 3)  
📊 **Finally**: Build the analytics dashboard (PROJECT 4)

---

## 🆘 Troubleshooting

### Issue: "permission denied for table visits"
**Solution**: Make sure you're using the correct API key. Use `service_role` for admin operations.

### Issue: Functions not appearing
**Solution**: Re-run `functions.sql` and check for SQL errors in the output.

### Issue: RLS blocking inserts
**Solution**: Verify policies with:
```sql
SELECT * FROM pg_policies WHERE tablename = 'visits';
```

### Issue: Slow queries
**Solution**: Check indexes:
```sql
SELECT * FROM pg_indexes WHERE tablename IN ('visits', 'page_views', 'events', 'cart_events', 'orders');
```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)

---

## 🎉 Success Criteria

You've successfully completed PROJECT 1 if:

- ✅ All tables are created
- ✅ All indexes are in place
- ✅ All functions and views work
- ✅ RLS policies are enabled
- ✅ Test queries return results
- ✅ You have both API keys saved

**You're now ready to move on to PROJECT 2: Frontend Tracking SDK!**

