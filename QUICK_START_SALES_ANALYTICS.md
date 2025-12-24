# Quick Start: Sales Analytics Setup

## 🚀 3-Step Setup (5 minutes)

### Step 1: Run Schema Migration (2 min)
1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Copy entire contents of: `database/migrations/fix_cart_events_and_create_sales_analytics.sql`
4. Click **"Run"**
5. ✅ Should see: "Success. No rows returned"

### Step 2: Import Sales Data (1 min)
1. In **SQL Editor**, click **"New Query"**
2. Copy entire contents of: `database/migrations/import_sales_data.sql`
3. Click **"Run"**
4. ✅ Should see: "Success. No rows returned"

### Step 3: Verify Installation (2 min)
1. In **SQL Editor**, click **"New Query"**
2. Copy entire contents of: `database/migrations/verify_installation.sql`
3. Click **"Run"**
4. ✅ Check all tests show "✅ PASS"

---

## ✅ What You Get

### New Dashboard Section
Navigate to: `/shopify-home-dashboard`

Scroll down to see **"Sales Analytics"** with:

#### 📊 Key Metrics (4 Cards)
- **Total Revenue**: $X,XXX.XX (+15% ↑)
- **Net Profit**: $X,XXX.XX (+12% ↑)
- **Total Orders**: XXX (+8% ↑)
- **Avg Profit Margin**: XX.X%

#### 💰 Financial Breakdowns
- **Revenue**: Product Sales + Delivery Fees = Total
- **Profit**: Gross Profit - COGS = Net Profit

#### 🏆 Top 10 Products Table
| Product | Units | Revenue | Profit | Margin |
|---------|-------|---------|--------|--------|
| CURLEA DreamCurl™... | 45 | $1,034.55 | $719.55 | 69.5% |

#### 📈 Additional Stats
- Total units sold
- Avg units per order
- Avg order value
- Total COGS

---

## 🔍 Quick Verification

After setup, run this query to see your data:

```sql
SELECT 
  COUNT(*) as total_sales,
  ROUND(SUM(total_revenue)::numeric, 2) as total_revenue,
  ROUND(SUM(net_profit)::numeric, 2) as total_profit
FROM sales_analytics
WHERE payment_status = 'completed';
```

**Expected**: ~103 sales, revenue and profit values

---

## 🎯 What's Tracked

### Revenue
```
Product Sales + Delivery Fee ($4) = Total Revenue
```

### Costs
```
Quantity × Cost Per Unit = Total COGS
```

### Profit
```
Gross Profit = Product Sales - COGS
Net Profit = Gross Profit - Delivery Fee
Profit Margin = (Net Profit / Total Revenue) × 100
```

---

## 🐛 Troubleshooting

### ❌ "relation sales_analytics does not exist"
**Fix**: Run Step 1 again (schema migration)

### ❌ "column ce.product_name does not exist"  
**Fix**: Use the updated SQL files (already fixed)

### ❌ No data showing in dashboard
**Fix**: 
1. Check browser console for errors
2. Verify Step 2 ran successfully
3. Run verification script (Step 3)

### ❌ Wrong profit margins
**Fix**: Check `cost_per_unit` values in database

---

## 📱 Test It Out

1. Go to `/shopify-home-dashboard`
2. Change date range (Today, Last 7 days, Last 30 days)
3. Watch metrics update
4. Check growth percentages
5. Review top products

---

## 📚 Full Documentation

- **Technical Guide**: `SALES_ANALYTICS_IMPLEMENTATION.md`
- **Summary**: `SALES_ANALYTICS_SUMMARY.md`
- **Migration Guide**: `database/migrations/README.md`

---

## ✨ Features

✅ Real-time profit tracking  
✅ Delivery fee separation  
✅ Product name mapping  
✅ Growth comparisons  
✅ Top products ranking  
✅ Customer lifetime value  
✅ Date range filtering  
✅ Shopify Polaris design  

---

**Setup Time**: ~5 minutes  
**Status**: Ready to use  
**Last Updated**: December 24, 2025

🎉 **You're all set!** Your sales analytics are now live.

