# Sales Analytics Database Migrations

## ⚠️ IMPORTANT: Run in Correct Order

These migrations must be run in the correct order. Follow the steps below exactly.

## Prerequisites

- Access to Supabase SQL Editor
- Admin/service role permissions

## Step-by-Step Instructions

### Step 1: Run the Main Schema Migration

**File**: `fix_cart_events_and_create_sales_analytics.sql`

**What it does**:
- Creates `product_name_mapping` table
- Creates `sales_analytics` table
- Creates database views (sales_summary, product_performance, customer_purchase_analytics)
- Creates functions and triggers
- Sets up RLS policies

**How to run**:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Click "New Query"
4. Copy and paste the **entire contents** of `fix_cart_events_and_create_sales_analytics.sql`
5. Click "Run"
6. ✅ You should see "Success. No rows returned"

**Expected Result**: All tables, views, and functions are created.

---

### Step 2: Run the Data Import Migration

**File**: `import_sales_data.sql`

**What it does**:
- Imports all 103 sales records from your CSV
- Calculates all financial metrics automatically
- Maps product names to website titles

**How to run**:
1. In Supabase SQL Editor
2. Click "New Query"
3. Copy and paste the **entire contents** of `import_sales_data.sql`
4. Click "Run"
5. ✅ You should see "Success. No rows returned" (data is inserted silently)

**Expected Result**: All historical sales data is imported.

---

### Step 3: Verify the Data

Run these queries to verify everything worked:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('sales_analytics', 'product_name_mapping');

-- Count imported sales records
SELECT COUNT(*) as total_sales FROM sales_analytics;
-- Expected: 103 rows (or more if you have additional data)

-- Check product name mappings
SELECT * FROM product_name_mapping LIMIT 10;

-- View sales summary
SELECT * FROM sales_summary ORDER BY day DESC LIMIT 10;

-- Check top products
SELECT * FROM product_performance ORDER BY total_profit DESC LIMIT 10;

-- Verify total revenue
SELECT 
  SUM(total_revenue) as total_revenue,
  SUM(net_profit) as total_profit,
  COUNT(*) as total_orders
FROM sales_analytics
WHERE payment_status = 'completed';
```

---

## Troubleshooting

### Error: "relation sales_analytics does not exist"

**Cause**: Step 1 wasn't run successfully or completely.

**Solution**: 
1. Run `fix_cart_events_and_create_sales_analytics.sql` again
2. Check for any error messages in the output
3. Make sure you copied the entire file

---

### Error: "column ce.product_name does not exist"

**Cause**: This error is now fixed. The column name is `product_title` not `product_name`.

**Solution**: 
1. Use the updated `fix_cart_events_and_create_sales_analytics.sql` file
2. The function now correctly references `ce.product_title`

---

### Error: "duplicate key value violates unique constraint"

**Cause**: Data was already imported.

**Solution**: 
```sql
-- Clear existing data if you want to re-import
DELETE FROM sales_analytics WHERE source = 'imported';

-- Then run import_sales_data.sql again
```

---

### Error: "permission denied"

**Cause**: Insufficient permissions.

**Solution**: 
1. Make sure you're using the service role key
2. Or run as database owner/admin
3. Check RLS policies are set correctly

---

## Optional: Sync cart_events Product Names

If you have existing data in `cart_events` and want to update product names:

```sql
-- Run this function to sync product names
SELECT sync_cart_events_product_names();

-- Check the results
SELECT 
  product_title,
  corrected_product_name,
  COUNT(*) as count
FROM cart_events
WHERE corrected_product_name IS NOT NULL
GROUP BY product_title, corrected_product_name
ORDER BY count DESC;
```

---

## Rollback (if needed)

If something goes wrong and you need to start over:

```sql
-- Drop all created objects (in reverse order)
DROP VIEW IF EXISTS customer_purchase_analytics CASCADE;
DROP VIEW IF EXISTS product_performance CASCADE;
DROP VIEW IF EXISTS sales_summary CASCADE;
DROP TABLE IF EXISTS sales_analytics CASCADE;
DROP TABLE IF EXISTS product_name_mapping CASCADE;
DROP FUNCTION IF EXISTS sync_cart_events_product_names() CASCADE;
DROP FUNCTION IF EXISTS update_sales_analytics_updated_at() CASCADE;
DROP FUNCTION IF EXISTS parse_sale_date(TEXT) CASCADE;

-- Then start over from Step 1
```

---

## After Successful Migration

1. ✅ Navigate to `/shopify-home-dashboard` in your app
2. ✅ Scroll down to see the new "Sales Analytics" section
3. ✅ Verify metrics are displaying correctly
4. ✅ Test different date ranges

---

## Need Help?

Check the console logs in your browser for any frontend errors, or check Supabase logs for backend issues.

**Common Issues**:
- RLS policies blocking access → Check policies in Supabase Dashboard
- Data not showing → Verify `payment_status = 'completed'`
- Wrong calculations → Check `cost_per_unit` values

---

**Last Updated**: December 24, 2025


