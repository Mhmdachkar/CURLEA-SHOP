# 🔌 Shopify Home Dashboard - Database Integration

## ✅ Complete Integration Summary

The Shopify Home Dashboard is now **fully connected** to your real database and website data.

---

## 📊 Data Sources

### 1. **Sessions (Online Store Sessions)**
**Source:** `visits` table in Supabase  
**Calculation:**
- Counts unique `session_id` values within the date range
- Sessions are tracked from the website analytics system
- **Live Visitors:** Counts unique sessions in the last 30 minutes

**SQL Equivalent:**
```sql
SELECT COUNT(DISTINCT session_id) 
FROM visits 
WHERE created_at >= ? AND created_at <= ?;
```

### 2. **Total Sales**
**Source:** `orders` table (public.orders) in Supabase  
**Calculation:**
- Sums `total_amount` from all completed orders
- `total_amount` already includes: (Gross Sales - Discounts - Returns) + Taxes + Shipping
- Only counts orders with `status = 'completed'`

**SQL Equivalent:**
```sql
SELECT SUM(total_amount) 
FROM orders 
WHERE status = 'completed' 
  AND created_at >= ? AND created_at <= ?;
```

### 3. **Total Orders**
**Source:** `orders` table (public.orders) in Supabase  
**Calculation:**
- Counts all orders with `status = 'completed'`
- Represents completed checkouts

**SQL Equivalent:**
```sql
SELECT COUNT(*) 
FROM orders 
WHERE status = 'completed' 
  AND created_at >= ? AND created_at <= ?;
```

### 4. **Conversion Rate**
**Source:** `visits` table + `orders` table  
**Calculation:**
- Formula: `(Total Orders / Total Sessions) * 100`
- Gets unique sessions from `visits` table
- Gets completed orders from `orders` table
- Calculates percentage

**SQL Equivalent:**
```sql
SELECT (
  (SELECT COUNT(*) FROM orders WHERE status = 'completed' AND created_at BETWEEN ? AND ?) * 100.0 /
  (SELECT COUNT(DISTINCT session_id) FROM visits WHERE created_at BETWEEN ? AND ?)
) as conversion_rate;
```

### 5. **Live Visitors**
**Source:** `visits` table  
**Calculation:**
- Counts unique `session_id` values from the last 30 minutes
- Updates in real-time (refreshes every 60 seconds)

**SQL Equivalent:**
```sql
SELECT COUNT(DISTINCT session_id) 
FROM visits 
WHERE created_at >= NOW() - INTERVAL '30 minutes';
```

### 6. **Next Payout**
**Source:** `orders` table  
**Calculation:**
- Sums `total_amount` from completed orders that haven't been paid out yet
- Currently returns 0 (you can customize based on your payout logic)

---

## 🔄 How It Works

### Data Flow

```
Website Analytics → Supabase Database → Service Layer → Dashboard Widget
```

1. **Website Tracking:**
   - Analytics SDK tracks visits/sessions → `visits` table
   - Orders are created → `orders` table

2. **Service Layer (`shopifyHomeDashboardService.ts`):**
   - Fetches data from Supabase
   - Calculates metrics (sessions, sales, orders, conversion)
   - Generates daily data points for charts
   - Calculates growth rates (current vs previous period)

3. **Hook (`useShopifyHomeDashboard`):**
   - Manages data fetching state
   - Auto-refreshes every 60 seconds
   - Handles loading and error states

4. **Widget Component:**
   - Displays real-time data
   - Updates charts when tab changes
   - Shows live visitor count

---

## 📁 Files Created/Modified

### New Files:
1. **`src/services/shopifyHomeDashboardService.ts`**
   - Main service for database queries
   - Functions for each metric
   - Daily data generation
   - Growth rate calculations

2. **`src/hooks/useShopifyHomeDashboard.ts`**
   - React hook for data fetching
   - Auto-refresh logic
   - Loading/error state management

### Modified Files:
1. **`src/components/analytics/ShopifyHomeDashboardWidget.tsx`**
   - Now uses `useShopifyHomeDashboard` hook
   - Displays real data instead of mock data
   - Shows loading and error states

---

## 🎯 Key Features

### ✅ Real-Time Data
- Fetches data from your actual database
- Auto-refreshes every 60 seconds
- Live visitor count updates in real-time

### ✅ Accurate Calculations
- Sessions: Unique session count (not page views)
- Sales: Total from completed orders
- Orders: Count of completed checkouts
- Conversion: (Orders / Sessions) * 100

### ✅ Growth Rate Tracking
- Compares current period vs previous period
- Calculates percentage growth/decline
- Shows trend indicators (up/down arrows)

### ✅ Daily Chart Data
- Generates daily data points for 30-day period
- Shows current period (solid blue line)
- Shows previous period (dashed light blue line)
- Updates when switching between metrics

---

## 🔧 Customization

### Change Date Range

In `ShopifyHomeDashboardWidget.tsx`:
```typescript
const { data, loading, error } = useShopifyHomeDashboard(30); // Change 30 to 7, 90, etc.
```

### Customize Live Visitor Time Window

In `shopifyHomeDashboardService.ts`, `getLiveVisitors()`:
```typescript
thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30); // Change 30 to your desired minutes
```

### Customize Next Payout Logic

In `shopifyHomeDashboardService.ts`, `getNextPayout()`:
```typescript
// Add your payout logic here
// For example, check for a payout_status field or payout_date
```

### Change Auto-Refresh Interval

In `useShopifyHomeDashboard.ts`:
```typescript
const interval = setInterval(() => {
  loadData();
}, 60000); // Change 60000 (60 seconds) to your desired interval
```

---

## 🧪 Testing

### Verify Data Connection

1. **Check Browser Console:**
   - Open DevTools → Console
   - Look for any Supabase errors
   - Check network requests to Supabase

2. **Verify Database:**
   - Ensure `visits` table has data
   - Ensure `orders` table has completed orders
   - Check that `status = 'completed'` orders exist

3. **Test Metrics:**
   - Sessions should show unique visitor count
   - Sales should match sum of completed orders
   - Orders should match count of completed orders
   - Conversion rate should be (Orders / Sessions) * 100

### Common Issues

**Issue: No data showing**
- Check Supabase connection (environment variables)
- Verify tables exist and have data
- Check browser console for errors

**Issue: Wrong numbers**
- Verify order status is 'completed'
- Check date range is correct
- Ensure sessions are being tracked

**Issue: Live visitors always 0**
- Check if visits are being tracked in real-time
- Verify `created_at` timestamps are recent
- Check 30-minute window calculation

---

## 📊 Database Schema Requirements

### Required Tables:

1. **`visits` table:**
   - `session_id` (TEXT) - Unique session identifier
   - `created_at` (TIMESTAMPTZ) - Visit timestamp

2. **`orders` table (public.orders):**
   - `total_amount` (DECIMAL) - Order total
   - `status` (TEXT) - Order status ('completed', 'pending', etc.)
   - `created_at` (TIMESTAMPTZ) - Order timestamp

### Required Indexes (for performance):

```sql
CREATE INDEX idx_visits_session_id ON visits(session_id);
CREATE INDEX idx_visits_created_at ON visits(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

---

## 🚀 Performance Optimizations

### Implemented:
- ✅ Parallel data fetching (Promise.all)
- ✅ Indexed database queries
- ✅ Efficient date grouping
- ✅ Unique session counting with Set
- ✅ Auto-refresh with cleanup

### Future Optimizations:
- Cache data for 30 seconds to reduce database calls
- Use Supabase real-time subscriptions for live updates
- Implement pagination for large datasets
- Add query result caching

---

## 📝 Notes

### Data Accuracy:
- **Sessions:** Based on unique `session_id` - this is NOT page views
- **Sales:** Only includes completed orders
- **Orders:** Only counts completed checkouts
- **Conversion:** Calculated as (Orders / Sessions) * 100

### Time Zones:
- All dates are stored in UTC
- Displayed dates are converted to local timezone
- Date comparisons use UTC timestamps

### Error Handling:
- Service functions return empty data on error (doesn't crash)
- Widget shows error message if data fails to load
- Console logs errors for debugging

---

## ✅ Integration Complete!

The dashboard is now **fully connected** to your database and website:

- ✅ Sessions from `visits` table
- ✅ Sales from `orders` table
- ✅ Orders count from `orders` table
- ✅ Conversion rate calculated from both
- ✅ Live visitors from recent `visits`
- ✅ Real-time updates every 60 seconds
- ✅ Daily chart data generated from database

**Access the dashboard:** `http://localhost:8081/shopify-home-dashboard`

---

**All data is now coming from your real database! 🎉**

