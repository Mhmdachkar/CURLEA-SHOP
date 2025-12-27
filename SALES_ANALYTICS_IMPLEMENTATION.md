# Sales Analytics Implementation Guide

## Overview
This document explains the comprehensive sales analytics system that tracks revenue, costs, profits, and product performance.

## Database Structure

### 1. `sales_analytics` Table
The main table that stores all sales transactions with detailed financial calculations.

**Key Columns:**
- **Order Information**: `order_id`, `order_date`, `order_timestamp`
- **Product Details**: `product_name`, `product_display_name`, `product_category`, `color`, `size`
- **Pricing**: `quantity_sold`, `unit_price`, `subtotal`
- **Revenue**: `delivery_fee`, `total_revenue` (subtotal + delivery_fee)
- **Costs**: `cost_per_unit`, `total_cogs` (Cost of Goods Sold)
- **Profits**: 
  - `gross_profit` = subtotal - total_cogs
  - `net_profit` = gross_profit - delivery_fee
  - `profit_margin` = (net_profit / total_revenue) × 100
- **Payment**: `payment_method`, `payment_status`
- **Customer**: `customer_email`, `customer_id`

### 2. `product_name_mapping` Table
Maps CSV/cart_events product names to actual website product names.

**Purpose:**
- Normalizes product names across different data sources
- Ensures consistency in reporting
- Maps legacy names to current product titles

**Example Mappings:**
```sql
'full set' → 'CURLEA DreamCurl™ Full Set Original'
'single set' → 'CURLEA DreamCurl™ Single Set'
'heat buns' → 'CURLEA HeatBun™'
'flat clips 5pcs' → 'CURLEA FlatClip™ 5-Pack'
```

### 3. Database Views

#### `sales_summary`
Aggregated sales data by day/week/month:
- Total orders, units sold
- Revenue breakdown (with/without delivery)
- Costs and profits
- Average profit margins
- Grouped by product and category

#### `product_performance`
Product-level performance metrics:
- Times sold and total units
- Revenue (with/without delivery)
- Total costs and profits
- Average selling price and profit margin
- First and last sale dates

#### `customer_purchase_analytics`
Customer-level insights:
- Total orders and items purchased
- Lifetime value (LTV)
- Total profit generated
- Average order value
- Customer lifetime (days between first and last purchase)

## File Structure

```
src/
├── types/
│   └── salesAnalytics.ts          # TypeScript interfaces
├── services/
│   └── salesAnalyticsService.ts   # Data fetching and calculations
├── hooks/
│   └── useSalesAnalytics.ts       # React hook for state management
└── components/analytics/
    └── SalesAnalyticsTable.tsx    # UI component

database/migrations/
├── fix_cart_events_and_create_sales_analytics.sql  # Main schema
└── import_sales_data.sql                            # CSV data import
```

## Key Features

### 1. Comprehensive Metrics
- **Revenue Tracking**: Separate tracking for product sales and delivery fees
- **Cost Analysis**: Full COGS tracking with per-unit costs
- **Profit Calculations**: Both gross and net profit with margins
- **Growth Trends**: Period-over-period comparisons

### 2. Product Analytics
- Top performing products by revenue, profit, or units sold
- Product-level profit margins
- Category performance
- Sales velocity tracking

### 3. Customer Insights
- Customer lifetime value
- Purchase frequency
- Average order value
- Profit contribution per customer

### 4. Financial Breakdown
```
Total Revenue = Product Sales + Delivery Fees
Gross Profit = Product Sales - Cost of Goods Sold
Net Profit = Gross Profit - Delivery Fees (if applicable)
Profit Margin = (Net Profit / Total Revenue) × 100
```

## Usage

### 1. Run Database Migrations

```sql
-- Step 1: Create tables and views
\i database/migrations/fix_cart_events_and_create_sales_analytics.sql

-- Step 2: Import historical sales data
\i database/migrations/import_sales_data.sql
```

### 2. Update cart_events Product Names

The migration automatically adds a `corrected_product_name` column to `cart_events` and maps old names to new ones:

```sql
SELECT sync_cart_events_product_names();
```

### 3. Use in Dashboard

The `SalesAnalyticsTable` component is automatically integrated into the Shopify Home Dashboard:

```tsx
import { useSalesAnalytics } from '@/hooks/useSalesAnalytics';
import { SalesAnalyticsTable } from './SalesAnalyticsTable';

function Dashboard() {
  const { metrics, topProducts, loading } = useSalesAnalytics(30); // Last 30 days
  
  return (
    <SalesAnalyticsTable 
      metrics={metrics} 
      topProducts={topProducts} 
      loading={loading} 
    />
  );
}
```

## Data Import from CSV

### CSV Format
Your CSV should have these columns:
- `Date`: Sale date (e.g., "24-May", "5 of jul")
- `Product`: Product name
- `Color`: Product color
- `Size`: Product size
- `Quantity_sold`: Units sold
- `Selling_Price`: Unit price
- `Revenue`: Total revenue (Quantity × Price)
- `Cost_per_unit`: Cost per unit
- `COGS`: Total cost of goods sold
- `Profit`: Calculated profit
- `Key`: Unique identifier (product-color-size)

### Automatic Calculations
The system automatically calculates:
1. **Subtotal**: `quantity_sold × unit_price`
2. **Delivery Fee**: Standard $4.00 (configurable)
3. **Total Revenue**: `subtotal + delivery_fee`
4. **Total COGS**: `quantity_sold × cost_per_unit`
5. **Gross Profit**: `subtotal - total_cogs`
6. **Net Profit**: `gross_profit - delivery_fee`
7. **Profit Margin**: `(net_profit / total_revenue) × 100`

## API Endpoints

### Fetch Sales Metrics
```typescript
const metrics = await calculateSalesMetrics(30); // Last 30 days
// Returns: SalesMetrics object with all financial data
```

### Fetch Top Products
```typescript
const topProducts = await fetchTopProducts(30, 10, 'revenue');
// Parameters: days, limit, sortBy ('revenue' | 'profit' | 'units')
```

### Fetch Product Performance
```typescript
const performance = await fetchProductPerformance(20);
// Returns: Array of ProductPerformance objects
```

### Fetch Customer Analytics
```typescript
const customers = await fetchCustomerAnalytics(50);
// Returns: Array of CustomerPurchaseAnalytics objects
```

## Displayed Metrics

### Key Metrics Cards
1. **Total Revenue**: With growth percentage
2. **Net Profit**: With growth percentage
3. **Total Orders**: With growth percentage
4. **Avg Profit Margin**: With AOV

### Revenue Breakdown
- Product Sales (excluding delivery)
- Delivery Fees
- Total Revenue

### Profit Breakdown
- Gross Profit
- Cost of Goods Sold
- Net Profit

### Top Products Table
- Product name and category
- Units sold
- Total revenue
- Total profit
- Profit margin

### Additional Stats
- Total units sold
- Average units per order
- Average order value
- Total COGS

## Formulas Reference

### Revenue Calculations
```
Subtotal = Quantity × Unit Price
Total Revenue = Subtotal + Delivery Fee
```

### Cost Calculations
```
Total COGS = Quantity × Cost Per Unit
```

### Profit Calculations
```
Gross Profit = Subtotal - Total COGS
Net Profit = Gross Profit - Delivery Fee
Profit Margin = (Net Profit / Total Revenue) × 100
```

### Growth Calculations
```
Revenue Growth = ((Current Revenue - Previous Revenue) / Previous Revenue) × 100
Profit Growth = ((Current Profit - Previous Profit) / Previous Profit) × 100
Order Growth = ((Current Orders - Previous Orders) / Previous Orders) × 100
```

## Best Practices

### 1. Data Consistency
- Always use `product_display_name` for reporting
- Map legacy names through `product_name_mapping`
- Keep `payment_status = 'completed'` for accurate metrics

### 2. Cost Tracking
- Update `cost_per_unit` regularly
- Include all COGS (product cost, packaging, etc.)
- Track delivery fees separately

### 3. Performance
- Use database views for complex aggregations
- Index frequently queried columns
- Limit date ranges for large datasets

### 4. Accuracy
- Verify profit margins are realistic (typically 40-70%)
- Cross-check with Stripe payment data
- Exclude test orders from analytics

## Troubleshooting

### Issue: Products showing wrong names
**Solution**: Run the product name mapping sync:
```sql
SELECT sync_cart_events_product_names();
```

### Issue: Profit margins seem incorrect
**Check**:
1. Cost per unit is accurate
2. Delivery fees are applied correctly
3. Payment status is 'completed'

### Issue: Missing sales data
**Check**:
1. Date range is correct
2. Data was imported properly
3. RLS policies allow access

## Future Enhancements

1. **Real-time Sync**: Auto-sync with Stripe payments
2. **Inventory Integration**: Link with inventory_dashboard
3. **Forecasting**: Predict future sales based on trends
4. **Refunds**: Track and account for refunded orders
5. **Discounts**: Include discount tracking and analysis
6. **Multi-currency**: Support for international sales

## Support

For issues or questions:
1. Check console logs for errors
2. Verify database migrations ran successfully
3. Ensure Supabase RLS policies are configured
4. Review the TypeScript types for data structure

---

**Last Updated**: December 24, 2025
**Version**: 1.0.0


