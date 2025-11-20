# Inventory Dashboard Update

## Overview
The analytics dashboard now includes a comprehensive **Inventory Management** section that displays real-time stock levels, low stock alerts, and inventory movement history.

## What's New

### 1. New Inventory Tab
A dedicated "Inventory" tab has been added to the sidebar navigation, providing complete visibility into:
- Product variants
- Stock levels (total, reserved, available)
- Stock status (in stock, low stock, out of stock)
- Pricing information
- Inventory movement history

### 2. New React Hooks (`useInventory.ts`)
Created custom hooks for accessing inventory data:

#### `useProductVariants()`
Fetches all product variants from the `product_variants` table.
- Returns: variant details including size, color, SKU, stock quantities, and pricing

#### `useInventoryDashboard()`
Fetches data from the `inventory_dashboard` view.
- Returns: enriched inventory data with product names, stock status, and sales metrics

#### `useLowStockAlerts()`
Fetches items with low stock from the `low_stock_alerts` view.
- Returns: products with available quantity < 5 units

#### `useInventoryMovements(limit)`
Fetches recent inventory changes from the `inventory_movements` table.
- Returns: movement history including type (sale, restock, adjustment, return, damage)

#### `useInventoryStats()`
Calculates aggregate inventory statistics.
- Returns: total variants, total stock, total value, low stock count, out of stock count

#### `adjustStock(variantId, quantity, movementType, notes)`
Helper function to manually adjust stock levels.
- Updates `product_variants` table
- Logs the change in `inventory_movements` table

### 3. Database Integration
The inventory system connects to the following Supabase tables and views:

**Tables:**
- `product_variants` - Stores all product variants with stock information
- `inventory_movements` - Tracks all stock changes (sales, restocks, adjustments)

**Views:**
- `inventory_dashboard` - Joins variants with product names and calculates stock status
- `low_stock_alerts` - Filters products with available_quantity < 5

### 4. Dashboard Features

#### Key Metrics Cards
- **Total Variants**: Number of active SKUs
- **Total Stock**: Total units across all variants
- **Inventory Value**: Total value of current stock (quantity × price)
- **Low Stock Items**: Variants with < 5 units available
- **Out of Stock**: Variants with 0 units available

#### Low Stock Alerts Table
Displays products that need attention:
- Product ID
- Variant name
- SKU
- Available quantity (color-coded: red for 0, yellow for low)
- Last updated date

#### Inventory Dashboard Table
Complete inventory overview:
- Product ID & Variant details
- Size & Color
- SKU
- Stock quantity (total)
- Reserved quantity (orders in progress)
- Available quantity (stock - reserved)
- Stock status badge (out of stock, low stock, moderate, in stock)
- Price

#### Recent Inventory Movements Table
Audit trail of all stock changes:
- Variant ID
- Movement type (sale, restock, adjustment, return, damage)
- Quantity change (+/- with color coding)
- Previous stock level
- New stock level
- Related order ID (if applicable)
- Notes
- Timestamp

### 5. Color-Coded Status Indicators
- **Green**: In stock (≥ 5 units)
- **Yellow**: Low stock (1-4 units)
- **Red**: Out of stock (0 units)

### 6. Real-Time Updates
The inventory system automatically updates when:
- Orders are completed (triggers `reduce_inventory_on_order` in the database)
- Manual stock adjustments are made
- Products are restocked
- Returns are processed

## Files Modified

### New Files
- `analytics-backend/analytics-dashboard/src/hooks/useInventory.ts`
  - All inventory-related hooks and types

### Modified Files
- `analytics-backend/analytics-dashboard/src/components/dashboard/ShopifySidebar.tsx`
  - Added "Inventory" navigation item with Box icon
  
- `analytics-backend/analytics-dashboard/src/components/DashboardShopify.tsx`
  - Imported inventory hooks and icons
  - Added inventory tab rendering
  - Integrated 5 new statistical cards
  - Added 3 new data tables (Low Stock Alerts, Inventory Dashboard, Inventory Movements)

## Database Setup Required

Before the inventory tab will work, you must:

1. **Run the SQL file** to create tables, views, and triggers:
```bash
psql -h [your-supabase-host] -U postgres -d postgres -f analytics-backend/supabase/update-stock-inventory.sql
```

Or execute in Supabase SQL Editor:
- Navigate to your Supabase project
- Go to SQL Editor
- Copy and paste the contents of `update-stock-inventory.sql`
- Run the query

2. **Verify tables exist**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('product_variants', 'inventory_movements');
```

3. **Verify views exist**:
```sql
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('inventory_dashboard', 'low_stock_alerts');
```

## How Inventory Reduction Works

When an order is completed:

1. **Order completion triggers** the `reduce_inventory_on_order()` function
2. **For each item** in the order:
   - Looks up the variant in `product_variants` by matching:
     - `product_id` from `order_items`
     - `size` and `color` from `order_items.variant_details`
   - Reduces `stock_quantity` by the order quantity
   - Logs the change in `inventory_movements` with:
     - `movement_type: 'sale'`
     - `order_id: [the order ID]`
     - Previous and new stock levels

3. **Available quantity** is automatically recalculated:
```sql
available_quantity = stock_quantity - reserved_quantity
```

4. **Stock status** is automatically determined:
- `out_of_stock`: available_quantity = 0
- `low_stock`: available_quantity < 5
- `moderate`: available_quantity 5-19
- `in_stock`: available_quantity ≥ 20

## Testing the Inventory System

### 1. Initial Setup
```bash
cd analytics-backend/analytics-dashboard
npm install
npm run dev
```

### 2. Navigate to Inventory Tab
- Open the dashboard
- Click "Inventory" in the sidebar
- You should see:
  - 5 stat cards with current inventory metrics
  - Low stock alerts (if any items < 5 units)
  - Complete inventory table
  - Recent inventory movements

### 3. Verify Data
- Check that all product variants are displayed
- Verify stock quantities match your actual inventory
- Confirm low stock items appear in the alerts section

### 4. Test Inventory Reduction
1. Create a test order with `order_status = 'completed'`
2. Check the inventory movements table
3. Verify the stock quantity decreased
4. Confirm the movement was logged with type 'sale'

## Troubleshooting

### "No inventory data available"
- Ensure the SQL file has been run successfully
- Check that `product_variants` table has data
- Verify Supabase environment variables are correct

### "Low Stock Alerts" not showing
- Low stock alerts only show for items with 0 < available_quantity < 5
- If all items are well-stocked, this section won't appear

### Inventory not reducing on orders
- Check that the trigger is installed:
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'orders';
```
- Verify order status is exactly 'completed' (case-sensitive)
- Check that `order_items` has matching `product_id`, `size`, and `color`

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Check that `@/hooks/useInventory` is in the `tsconfig.json` paths

## Mobile Responsiveness

The inventory tab is fully responsive:
- **Mobile (< 640px)**: Single column layout, stacked cards
- **Tablet (640px - 1024px)**: 2-column grid for stat cards
- **Desktop (> 1024px)**: Full 5-column layout

Tables automatically switch to mobile card view on small screens.

## Future Enhancements

Potential additions to the inventory system:
- **Manual Stock Adjustment UI**: Add/remove stock directly from the dashboard
- **Restock Notifications**: Email alerts when items reach restock threshold
- **Inventory Reports**: Export CSV of stock levels and movements
- **Batch Updates**: Bulk edit stock quantities
- **Supplier Management**: Track which supplier provides each variant
- **Reorder Points**: Automatic reorder suggestions based on sales velocity
- **Stock Forecasting**: Predict when items will run out based on sales trends

## Summary

The inventory management system is now fully integrated into the analytics dashboard, providing real-time visibility into stock levels, automated inventory reduction on sales, and comprehensive movement tracking. The system is production-ready and will automatically maintain accurate stock counts as orders are processed.

