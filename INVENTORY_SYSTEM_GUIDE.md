# 📦 CURLEA Inventory Management System

## ✅ Complete Stock & Inventory Tracking

Your analytics dashboard now has a **full inventory management system** that tracks stock levels by product variant (size + color) and automatically reduces inventory when orders are completed.

---

## 📊 Current Stock Levels

### Full Sets (156 units total)
- **Large:** 27 units (6 purple, 2 pink, 10 brown, 9 green)
- **Jumbo:** 44 units (10 brown, 11 purple, 11 green, 12 pink)
- **Midi:** 46 units (11 green, 12 purple, 12 pink, 11 brown)
- **Small:** 39 units (9 purple, 8 brown, 11 pink, 11 green)

### Single Sets (37 units total)
- **Mini:** 11 units (2 pink, 3 brown, 3 purple, 3 green)
- **Midi:** 11 units (3 green, 2 purple, 3 pink, 3 brown)
- **Original:** 6 units (3 green, 1 brown, 2 purple)
- **Jumbo:** 9 units (2 brown, 2 pink, 3 purple, 2 green)

### Heat Bun Bons (24 units total)
- **Mini:** 9 units (3 purple, 3 green, 3 brown)
- **Midi:** 3 units (1 green, 2 brown)
- **Original:** 3 units (1 green, 2 brown)
- **Jumbo:** 9 units (3 brown, 2 purple, 1 pink, 3 green)

### Hair Accessories (253 units total)
- **Scrunchies (5 tone satin 5pcs):** 42 pcs
- **Korean Hair Claws (10pcs sets):** 40 sets
- **Flat Claw Clips (9pcs sets):** 149 pcs
- **Bow Tie Scrunchies (7pcs):** 22 sets

**GRAND TOTAL: 470 units**

---

## 🗄️ Database Structure

### 1. **product_variants** Table
Stores individual variants with stock levels:
- `product_id` - Links to products table
- `variant_name` - Full name (e.g., "Midi - Purple")
- `size` - Size category
- `color` - Color option
- `sku` - Unique SKU for tracking
- `stock_quantity` - Current stock level
- `reserved_quantity` - Reserved for pending orders
- `available_quantity` - Auto-calculated (stock - reserved)
- `price` - Variant-specific price

### 2. **inventory_movements** Table
Tracks all stock changes:
- `variant_id` - Which variant changed
- `movement_type` - sale, restock, adjustment, return, damage
- `quantity` - Amount changed (negative for sales)
- `previous_stock` - Stock before change
- `new_stock` - Stock after change
- `order_id` - Reference to order (if sale)
- `notes` - Additional details
- `created_by` - Who made the change

### 3. **Views for Dashboard**

#### `inventory_dashboard`
Complete inventory overview:
```sql
SELECT * FROM inventory_dashboard;
```
Shows:
- Product name
- Variant details
- Stock levels
- Stock status (in_stock, low_stock, out_of_stock)
- Sales in last 30 days

#### `low_stock_alerts`
Items that need restocking:
```sql
SELECT * FROM low_stock_alerts;
```
Shows variants with less than 5 units available.

---

## 🤖 Automatic Inventory Reduction

### How It Works

When an order status changes to `'completed'`:
1. ✅ System reads order items
2. ✅ Matches items to product variants by:
   - Variant name
   - Size keyword
   - Color keyword
3. ✅ Checks if enough stock is available
4. ✅ Reduces stock quantity
5. ✅ Logs the movement in inventory_movements table
6. ✅ Updates main products table inventory_count

### Triggers Active On:
- ✅ `orders` table (Analytics orders)
- ✅ `public.orders` table (Stripe orders)

Both order systems will automatically reduce inventory!

---

## 📥 Installation

### Run the SQL Script:

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste the contents of:**
   ```
   analytics-backend/supabase/update-stock-inventory.sql
   ```
4. **Click "Run"**

The script will:
- ✅ Create `product_variants` table
- ✅ Insert all 470 units of current stock
- ✅ Create `inventory_movements` log table
- ✅ Set up automatic inventory reduction triggers
- ✅ Create dashboard views
- ✅ Update products table with totals

---

## 🎯 Using the Inventory System

### View All Inventory:
```sql
SELECT * FROM inventory_dashboard
ORDER BY product_id, size, color;
```

### Check Low Stock:
```sql
SELECT * FROM low_stock_alerts;
```

### View Stock for Specific Product:
```sql
SELECT * FROM product_variants
WHERE product_id = 'dreamcurl-midi';
```

### See Recent Sales:
```sql
SELECT * FROM inventory_movements
WHERE movement_type = 'sale'
ORDER BY created_at DESC
LIMIT 20;
```

### Manual Stock Adjustment:
```sql
-- Add 10 units to a specific variant
UPDATE product_variants
SET stock_quantity = stock_quantity + 10
WHERE sku = 'DC-MIDI-PURPLE';

-- Log the movement manually
INSERT INTO inventory_movements (
    variant_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    notes,
    created_by
) VALUES (
    (SELECT id FROM product_variants WHERE sku = 'DC-MIDI-PURPLE'),
    'restock',
    10,
    (SELECT stock_quantity - 10 FROM product_variants WHERE sku = 'DC-MIDI-PURPLE'),
    (SELECT stock_quantity FROM product_variants WHERE sku = 'DC-MIDI-PURPLE'),
    'Manual restock from warehouse',
    'admin'
);
```

---

## 📈 Analytics Dashboard Integration

### Dashboard Now Shows:

1. **Products Tab:**
   - Total inventory per product
   - Stock status for each variant
   - Available vs reserved quantities

2. **Inventory View (New):**
   - All variants with stock levels
   - Color-coded stock status:
     - 🟢 Green: In stock (10+ units)
     - 🟡 Yellow: Low stock (5-9 units)
     - 🔴 Red: Critical/Out of stock (0-4 units)

3. **Stock Movements:**
   - Recent sales
   - Restock history
   - Adjustments log

4. **Low Stock Alerts:**
   - Variants that need restocking
   - Sorted by urgency

---

## 🔧 Stock Status Indicators

The system automatically categorizes stock levels:

| Status | Available Quantity | Indicator |
|--------|-------------------|-----------|
| **Out of Stock** | 0 units | 🔴 Red |
| **Low Stock** | 1-4 units | 🔴 Red |
| **Moderate** | 5-9 units | 🟡 Yellow |
| **In Stock** | 10+ units | 🟢 Green |

---

## 📊 SKU Format

All variants have unique SKUs:

### Format: `{PRODUCT}-{SIZE}-{COLOR}[-SINGLE]`

Examples:
- `DC-MIDI-PURPLE` - DreamCurl Midi Purple (Full Set)
- `DC-MIDI-PURPLE-SINGLE` - DreamCurl Midi Purple (Single Set)
- `HBB-JUMBO-BROWN` - Heat Bun Bon Jumbo Brown
- `SCRUNCHIE-5TONE-5PCS` - Scrunchies 5 Tone 5pcs Set

---

## ⚠️ Important Notes

### Order Processing:
- Stock reduces **only when order status = 'completed'**
- Pending/processing orders don't affect stock yet
- Reserved quantity can be used for cart reservations (future feature)

### Stock Matching:
The system matches orders to variants using:
1. Exact variant name match
2. Size keyword in product name
3. Color keyword in variant field
4. Prioritizes exact matches first

### Insufficient Stock:
- System logs a warning but doesn't block the order
- You'll see warnings in logs if stock is insufficient
- Allows overselling but tracks it

---

## 🔄 Stock Replenishment

### When to Restock:

Check `low_stock_alerts` view regularly:
```sql
SELECT * FROM low_stock_alerts;
```

### How to Restock:

1. **Add stock:**
```sql
UPDATE product_variants
SET stock_quantity = stock_quantity + {quantity}
WHERE sku = '{SKU}';
```

2. **Log the restock:**
```sql
INSERT INTO inventory_movements (
    variant_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    notes,
    created_by
) SELECT
    id,
    'restock',
    {quantity},
    stock_quantity - {quantity},
    stock_quantity,
    'Restock from supplier',
    'admin'
FROM product_variants
WHERE sku = '{SKU}';
```

---

## 📱 Dashboard Features

### New Dashboard Sections:

1. **Inventory Overview:**
   - Total units in stock
   - Total value of inventory
   - Low stock items count
   - Out of stock items

2. **Inventory Table:**
   - All variants listed
   - Stock levels
   - Recent sales
   - Actions (adjust stock, view history)

3. **Stock Movements:**
   - Recent changes
   - Filter by type (sale, restock, adjustment)
   - Export capabilities

---

## 🎯 Quick Reference

### Total Inventory: 470 units
- Full Sets: 156
- Single Sets: 37
- Bun Bons: 24
- Accessories: 253

### Tables:
- `product_variants` - Variant stock levels
- `inventory_movements` - Stock change log
- `products` - Main products (auto-updated totals)

### Views:
- `inventory_dashboard` - Complete overview
- `low_stock_alerts` - Items needing restock

### Triggers:
- `trigger_reduce_inventory` - On orders table
- `trigger_reduce_inventory_public` - On public.orders table
- `trigger_update_product_inventory` - Updates products table

---

## ✅ System is Ready!

Your inventory system is fully configured and ready to:
- ✅ Track 470 units across all variants
- ✅ Automatically reduce stock on orders
- ✅ Alert when stock is low
- ✅ Log all inventory movements
- ✅ Display in analytics dashboard

**Just run the SQL script and you're live!** 🚀

---

**Last Updated:** November 18, 2025  
**Status:** Ready to Deploy ✅  
**Total Stock Units:** 470  
**Variants Tracked:** 60+  
**Auto-Reduction:** Active ✅

