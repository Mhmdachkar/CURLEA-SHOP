# Automatic Stock Deduction Setup

## Overview
The system now automatically deducts stock from the database when orders are placed through the website. No manual database editing is required.

## How It Works

### 1. SQL Trigger System
A PostgreSQL trigger (`deduct_inventory_on_order`) automatically runs when order items are inserted into the `order_items` table:

- **Location**: `analytics-backend/supabase/inventory-triggers.sql`
- **Trigger**: `trigger_deduct_inventory` on `public.order_items` table
- **Function**: `deduct_inventory_on_order()`

### 2. Order Processing Flow

1. **Order Creation**: When a customer completes checkout (Stripe or COD), order items are created in `public.order_items` table
2. **Automatic Stock Deduction**: The SQL trigger automatically:
   - Finds the matching product variant by `product_id`, `size`, and `color`
   - Checks if sufficient stock is available
   - Deducts the ordered quantity from `stock_quantity`
   - Logs the movement in `inventory_movements` table

### 3. Order Item Data Requirements

For automatic stock deduction to work, order items must include:
- `product_id`: The product identifier (e.g., 'curly-clip-1', 'dreamcurl-jumbo')
- `size`: The size (e.g., 'Standard', 'Large', 'Jumbo', 'Mini', 'Midi')
- `color`: The color (e.g., 'Mulberry', 'CANDY', 'Latte', 'Olive') or `NULL` for products without colors
- `quantity`: The quantity ordered

### 4. Product ID Mapping

The system automatically maps product names to product IDs for all curly hair collection products:

- **Satin Scrunchies**: `satin-scrunchies-french-5pc`
- **Korean Clips**: `korean-clips-10set`
- **Curved Resin Hair Clip (Flat Clips)**: `curly-clip-1`
- **Geometric Flower Hair Claw Clip**: `curly-claw-1`
- **Satin Scarf + Scrunchies Set**: `curly-scarf-1`
- **Luxe Alloy Hair Clips**: `songmay-hair-clips`
- **Bow Tie Clips**: `bow-tie-7set`

### 5. Size and Color Normalization

The system automatically normalizes UI sizes/colors to database format:

**Size Mapping**:
- `Original` → `Large`
- `Large` → `Large`
- `Mini` → `Mini`
- `Midi` → `Midi`
- `Jumbo` → `Jumbo`
- `Standard` → `Standard` (for accessories)

**Color Mapping**:
- `PURPLE` / `Purple` → `Mulberry`
- `CANDY` / `Candy` → `CANDY`
- `LATTE` / `Latte` → `Latte`
- `OLIVE` / `Olive` → `Olive`

## Database Setup

### Required Tables

1. **`product_variants`**: Stores inventory for each product variant
   - Columns: `product_id`, `size`, `color`, `stock_quantity`, `available_quantity`
   - Unique constraint: `(product_id, size, color)`

2. **`order_items`**: Stores order line items
   - Columns: `order_id`, `product_id`, `size`, `color`, `quantity`
   - Trigger: `trigger_deduct_inventory` (fires on INSERT)

3. **`inventory_movements`**: Logs all stock changes
   - Columns: `variant_id`, `movement_type`, `quantity`, `previous_stock`, `new_stock`, `order_id`

### SQL Scripts to Run

1. **Create/Update Inventory Data**:
   ```sql
   -- Run: analytics-backend/supabase/update-stock-inventory.sql
   -- This creates/updates all product variants with current stock levels
   ```

2. **Create Triggers**:
   ```sql
   -- Run: analytics-backend/supabase/inventory-triggers.sql
   -- This creates the automatic stock deduction trigger
   ```

## All Curly Hair Collection Products

All curly hair collection products are now connected to the database:

✅ **curly-clip-1** - Curved Resin Hair Clip (9-piece set)
✅ **curly-scarf-1** - Elegant Satin Scarf + Scrunchies Set
✅ **satin-scrunchies-french-5pc** - Satin Scrunchies Luxury French 5 Piece
✅ **curly-claw-1** - Geometric Flower Hair Claw Clip Set
✅ **korean-clips-10set** - Korean Clips 10-Set
✅ **bow-tie-7set** - Bow Tie Clips 7-Set
✅ **songmay-hair-clips** - Luxe Alloy Hair Clips

## Stock Display

All products now display:
- **"SOLD OUT"** badge when stock = 0
- **"X LEFT"** badge when stock ≤ 3
- Stock information is loaded from the database in real-time

## Testing

To verify automatic stock deduction:

1. Place a test order through the website
2. Check the `product_variants` table - stock should be reduced
3. Check the `inventory_movements` table - a new entry should be logged

## Error Handling

- If a variant is not found, the trigger logs a warning but does not fail the order
- If insufficient stock, the trigger raises an exception (order should be prevented at checkout)
- Stock cannot go negative (enforced by `prevent_negative_stock` trigger)

## Notes

- Stock deduction happens **automatically** when orders are placed
- No manual database editing is required
- Stock is updated in real-time
- All movements are logged in `inventory_movements` for audit trail

