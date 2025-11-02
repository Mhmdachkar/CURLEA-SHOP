# Clear Analytics Data Before Launch

## 🎯 Purpose

Clear all **analytics tracking data** from your Supabase database before launch, so you can start with fresh analytics data from day one.

## ⚠️ Important Notes

This script **ONLY** deletes **analytics/tracking data**. It **preserves**:
- ✅ Products (product catalog)
- ✅ Campaigns (marketing campaigns setup)
- ✅ Stripe Orders (`public.orders` - actual customer orders)
- ✅ Order Items (`public.order_items` - actual order items)

## 📋 What Gets Deleted

The following analytics tracking tables will be cleared:

1. **`visits`** - Visitor tracking data
2. **`page_views`** - Page view tracking
3. **`events`** - Custom event tracking
4. **`cart_events`** - Shopping cart interaction tracking
5. **`conversion_funnel`** - Conversion funnel analytics
6. **`orders`** (analytics only) - Only analytics tracking orders (those with `session_id`)

## 🚀 How to Run

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Run the Clear Script

1. Copy the contents of `analytics-backend/supabase/clear-analytics-data.sql`
2. Paste into the SQL Editor
3. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify

After running, check the verification queries at the bottom of the script. You should see:
- **0 rows** in all analytics tables
- **Preserved data** still exists (products, campaigns, Stripe orders)

## 📊 Expected Results

### Analytics Tables (Should be 0):
```
visits: 0 rows
page_views: 0 rows
events: 0 rows
cart_events: 0 rows
conversion_funnel: 0 rows
orders (analytics): 0 rows
```

### Preserved Tables (Should remain):
```
products: [your product count]
campaigns: [your campaign count]
public.orders (Stripe): [your order count]
order_items: [your order items count]
```

## ✅ After Running

1. All analytics tracking will start fresh from launch day
2. Dashboard will show 0 visitors/events initially
3. Real analytics data will accumulate from launch day forward
4. Product catalog and campaigns remain intact

## 🔄 If You Need to Re-run

You can safely run this script multiple times - it only affects analytics tracking data.

---

**File:** `analytics-backend/supabase/clear-analytics-data.sql`

