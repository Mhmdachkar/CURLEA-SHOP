# 📋 Complete Table & Column Reference

## All Database Tables and Their Columns

---

## 1. **`visits`** - Visitor Tracking
```sql
CREATE TABLE visits (
    id UUID PRIMARY KEY,
    session_id TEXT NOT NULL,
    ip_address INET,
    device TEXT,
    browser TEXT,
    os TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    referrer TEXT,
    landing_page TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    is_mobile BOOLEAN,
    is_tablet BOOLEAN,
    is_desktop BOOLEAN,
    screen_width INTEGER,
    screen_height INTEGER,
    language TEXT,
    timezone TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```
**25 columns total**

---

## 2. **`page_views`** - Page View Tracking
```sql
CREATE TABLE page_views (
    id UUID PRIMARY KEY,
    session_id TEXT NOT NULL,
    visit_id UUID,
    url TEXT NOT NULL,
    path TEXT,
    title TEXT,
    referrer TEXT,
    scroll_depth INTEGER,
    time_on_page INTEGER,
    engaged BOOLEAN,
    bounce BOOLEAN,
    exit BOOLEAN,
    created_at TIMESTAMPTZ
);
```
**13 columns total**

---

## 3. **`events`** - Custom Event Tracking
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY,
    session_id TEXT NOT NULL,
    visit_id UUID,
    event_name TEXT NOT NULL,
    event_category TEXT,
    event_label TEXT,
    event_value NUMERIC,
    payload JSONB,
    created_at TIMESTAMPTZ
);
```
**9 columns total**

---

## 4. **`cart_events`** - Shopping Cart Events
```sql
CREATE TABLE cart_events (
    id UUID PRIMARY KEY,
    session_id TEXT NOT NULL,
    visit_id UUID,
    event_type TEXT NOT NULL,
    product_id UUID,
    external_product_id TEXT,
    product_title TEXT,
    variant_id TEXT,
    variant_title TEXT,
    quantity INTEGER,
    price NUMERIC(10,2),
    total_value NUMERIC(10,2),
    cart_total NUMERIC(10,2),
    discount_code TEXT,
    discount_amount NUMERIC(10,2),
    created_at TIMESTAMPTZ
);
```
**16 columns total**

---

## 5. **`orders`** - Analytics Orders (NOT Stripe!)
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,          ← NOTE: order_id (not order_number)
    session_id TEXT NOT NULL,
    visit_id UUID,
    customer_email TEXT,
    customer_id TEXT,
    subtotal NUMERIC(10,2),
    discount_total NUMERIC(10,2),
    shipping_total NUMERIC(10,2),
    tax_total NUMERIC(10,2),
    total_value NUMERIC(10,2),
    total_cost NUMERIC(10,2),
    profit NUMERIC(10,2),
    currency TEXT,
    payment_method TEXT,
    shipping_method TEXT,
    source TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    discount_codes JSONB,
    items JSONB,
    status TEXT,
    fulfillment_status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```
**26 columns total**

---

## 6. **`stripe_orders`** - Stripe Checkout Orders (RENAMED to avoid conflict)
```sql
CREATE TABLE stripe_orders (
    id UUID PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,      ← NOTE: order_number (not order_id)
    user_id UUID,
    total_amount DECIMAL(10,2),
    currency TEXT,
    status TEXT,
    customer_email TEXT,
    is_guest BOOLEAN,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    billing_address JSONB,
    shipping_address JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```
**14 columns total**

---

## 7. **`public.order_items`** - Stripe Order Items
```sql
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    variant TEXT,
    product_id TEXT,
    size TEXT,
    color TEXT,
    sku TEXT,
    variant_details JSONB,
    variant_id TEXT,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    image_url TEXT,
    product_metadata JSONB,
    created_at TIMESTAMPTZ
);
```
**16 columns total**

---

## 8. **`products`** - Product Catalog
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    product_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2),
    cost NUMERIC(10,2),
    compare_at_price NUMERIC(10,2),
    category TEXT,
    subcategory TEXT,
    brand TEXT,
    sku TEXT,
    inventory_count INTEGER,
    image_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```
**16 columns total**

---

## 9. **`product_variants`** - Product Variants & Inventory
```sql
CREATE TABLE product_variants (
    id UUID PRIMARY KEY,
    product_id TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT,
    sku TEXT UNIQUE,
    stock_quantity INTEGER,
    reserved_quantity INTEGER,
    available_quantity INTEGER,
    price NUMERIC(10,2),
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```
**13 columns total**

---

## 10. **`inventory_movements`** - Inventory Change Log
```sql
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY,
    variant_id UUID NOT NULL,
    movement_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    previous_stock INTEGER,
    new_stock INTEGER,
    order_id TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ
);
```
**10 columns total**

---

## 11. **`campaigns`** - Marketing Campaigns
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT UNIQUE NOT NULL,
    utm_term TEXT,
    utm_content TEXT,
    cost NUMERIC(10,2),
    budget NUMERIC(10,2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN,
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```
**15 columns total**

---

## 🔴 **CRITICAL: Two Different Orders Tables!**

### **`orders`** (Analytics Table)
- **Table name:** `orders` (no schema prefix)
- **Primary key column:** `order_id` (TEXT)
- **Purpose:** Analytics tracking and reporting
- **Used for:** Analytics Orders dashboard, conversion tracking

### **`stripe_orders`** (Stripe Table) - RENAMED!
- **Table name:** `stripe_orders` (renamed from `public.orders`)
- **Primary key column:** `order_number` (TEXT)
- **Purpose:** Stripe checkout orders
- **Used for:** Stripe Orders dashboard, actual customer orders
- **⚠️ NOTE:** Renamed to avoid conflict with analytics `orders` table

### **Query Examples:**

**✅ CORRECT - Stripe Orders:**
```sql
SELECT order_number, customer_email, total_amount 
FROM stripe_orders;  -- Renamed table!
```

**❌ WRONG - Stripe Orders:**
```sql
SELECT order_number, customer_email, total_amount 
FROM orders;  -- This queries the analytics table (missing order_number)!
```

**✅ CORRECT - Analytics Orders:**
```sql
SELECT order_id, customer_email, total_value 
FROM orders;
```

---

## 📊 Dashboard Table Mapping

| Dashboard Table | Database Table | Key Column |
|----------------|----------------|------------|
| Visits | `visits` | `session_id` |
| Page Views | `page_views` | `url` |
| Events | `events` | `event_name` |
| Cart Events | `cart_events` | `event_type` |
| **Stripe Orders** | **`stripe_orders`** | **`order_number`** ⚠️ |
| **Analytics Orders** | **`orders`** | **`order_id`** ⚠️ |
| Order Items | `public.order_items` | `product_name` |
| Products | `products` | `product_id` |
| Inventory Dashboard | `inventory_dashboard` (view) | `sku` |
| Low Stock Alerts | `low_stock_alerts` (view) | `sku` |
| Inventory Movements | `inventory_movements` | `movement_type` |

---

## 🎯 Quick Reference

### Querying Stripe Orders:
```typescript
// ✅ CORRECT
const { data } = await supabase
  .from('stripe_orders')  // Table renamed to avoid conflict
  .select('order_number, customer_email, total_amount');
```

### Querying Analytics Orders:
```typescript
// ✅ CORRECT
const { data } = await supabase
  .from('orders')
  .select('order_id, customer_email, total_value');
```

**Note:** The Stripe orders table was renamed to `stripe_orders` to avoid conflict with the analytics `orders` table. Always use `from('stripe_orders')` for Stripe orders!

