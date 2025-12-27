# Sales Analytics Debugging Guide

## Issue: Dashboard Shows Zero Results

If the Sales Analytics section shows all zeros despite having data in the database, follow these steps:

---

## Step 1: Fix RLS (Row Level Security) Policies

The most common issue is RLS blocking access to the data.

### Run this SQL in Supabase:

```sql
-- File: database/migrations/fix_rls_policies.sql
-- Copy and run the entire file in Supabase SQL Editor
```

**Quick Fix (Disable RLS)**:
```sql
ALTER TABLE sales_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_name_mapping DISABLE ROW LEVEL SECURITY;

GRANT SELECT ON sales_analytics TO anon, authenticated, service_role;
GRANT SELECT ON product_name_mapping TO anon, authenticated, service_role;
GRANT SELECT ON sales_summary TO anon, authenticated, service_role;
GRANT SELECT ON product_performance TO anon, authenticated, service_role;
GRANT SELECT ON customer_purchase_analytics TO anon, authenticated, service_role;
```

---

## Step 2: Verify Data Exists

Run this query in Supabase SQL Editor:

```sql
-- Check if data exists
SELECT 
  COUNT(*) as total_records,
  MIN(order_date) as earliest_date,
  MAX(order_date) as latest_date,
  SUM(total_revenue) as total_revenue,
  SUM(net_profit) as total_profit
FROM sales_analytics
WHERE payment_status = 'completed';
```

**Expected Result**: Should show ~103 records with revenue and profit values.

**If no data**: Re-run `import_sales_data.sql`

---

## Step 3: Test Direct Access

Test if you can query the table directly:

```sql
-- Simple test query
SELECT * FROM sales_analytics LIMIT 5;

-- If this fails with permission error, RLS is blocking access
```

---

## Step 4: Check Browser Console

1. Open your dashboard at `/shopify-home-dashboard`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for these log messages:

```
[Sales Analytics] Fetching data: {start: "...", end: "...", days: 30}
[Sales Analytics] Fetched records: 0 or X
[Sales Metrics] Calculating metrics for: {...}
[Top Products] Fetching for: {...}
```

### Common Error Messages:

#### Error: "new row violates row-level security policy"
**Solution**: Run `fix_rls_policies.sql`

#### Error: "permission denied for table sales_analytics"
**Solution**: Grant permissions:
```sql
GRANT SELECT ON sales_analytics TO anon, authenticated;
```

#### Error: "relation sales_analytics does not exist"
**Solution**: Run `fix_cart_events_and_create_sales_analytics.sql`

---

## Step 5: Check Date Range

The dashboard might be filtering data outside your date range.

### Test with wider date range:

```sql
-- Check all data regardless of date
SELECT 
  order_date,
  COUNT(*) as records
FROM sales_analytics
GROUP BY order_date
ORDER BY order_date DESC;
```

### Adjust date range in code:

The service uses dates from 2024. If your data is from 2025, update the import script:

```sql
-- In import_sales_data.sql, change:
RETURN TO_DATE('2024-' || date_str, 'YYYY-DD-Mon');
-- To:
RETURN TO_DATE('2025-' || date_str, 'YYYY-DD-Mon');
```

---

## Step 6: Verify Supabase Connection

Check if Supabase client is configured correctly:

```typescript
// In browser console:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

---

## Step 7: Manual Test Query

Run this in browser console:

```javascript
// Test direct Supabase query
const { data, error } = await window.supabase
  .from('sales_analytics')
  .select('*')
  .limit(5);

console.log('Data:', data);
console.log('Error:', error);
```

---

## Complete Checklist

- [ ] Run `fix_rls_policies.sql` in Supabase
- [ ] Verify data exists (Step 2 query)
- [ ] Check browser console for errors
- [ ] Verify date range matches your data
- [ ] Test direct Supabase access
- [ ] Check Supabase environment variables
- [ ] Refresh browser and clear cache

---

## Quick Fix Commands

### 1. Disable RLS (Fastest Fix)
```sql
ALTER TABLE sales_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_name_mapping DISABLE ROW LEVEL SECURITY;
```

### 2. Grant All Permissions
```sql
GRANT ALL ON sales_analytics TO anon, authenticated, service_role;
GRANT ALL ON product_name_mapping TO anon, authenticated, service_role;
GRANT SELECT ON sales_summary TO anon, authenticated, service_role;
GRANT SELECT ON product_performance TO anon, authenticated, service_role;
GRANT SELECT ON customer_purchase_analytics TO anon, authenticated, service_role;
```

### 3. Verify Access
```sql
SELECT COUNT(*) FROM sales_analytics;
-- Should return a number, not an error
```

---

## Still Not Working?

### Check These:

1. **Supabase Project**: Make sure you're connected to the correct project
2. **API Keys**: Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. **Table Schema**: Ensure `sales_analytics` table exists with correct columns
4. **Data Import**: Re-run `import_sales_data.sql` if needed
5. **Browser Cache**: Hard refresh (Ctrl+Shift+R) or clear cache

### Get Detailed Logs:

Add this to your `.env.local`:
```
VITE_DEBUG=true
```

Then check console for detailed logs from the service.

---

## Expected Console Output (Working)

```
[Sales Analytics] Fetching data: {start: "2024-11-24", end: "2024-12-24", days: 30}
[Sales Analytics] Fetched records: 103
[Sales Metrics] Calculating metrics for: {start: "2024-11-24", end: "2024-12-24", days: 30}
[Sales Metrics] Processing 103 records
[Top Products] Fetching for: {start: "2024-11-24", end: "2024-12-24", sortBy: "revenue"}
[Top Products] Processing 103 records
```

---

## Expected Console Output (Not Working)

```
[Sales Analytics] Error fetching sales analytics: {code: "42501", message: "permission denied"}
// OR
[Sales Analytics] Fetched records: 0
[Sales Metrics] No data found for date range: {start: "...", end: "..."}
```

---

## Contact Support

If still not working after all steps:
1. Share browser console logs
2. Share Supabase SQL query results
3. Share screenshot of Supabase table structure

---

**Most Common Fix**: Run `fix_rls_policies.sql` ✅

**Last Updated**: December 24, 2025


