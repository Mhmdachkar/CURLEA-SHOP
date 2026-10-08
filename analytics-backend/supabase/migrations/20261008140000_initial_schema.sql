-- =====================================================
-- CURLEA — single initial migration
-- Run this once in the Supabase SQL editor on an empty project.
--
-- Merged from:
--   schema.sql
--   orders-schema.sql
--   functions.sql
--   analytics-dashboard-views.sql
--   inventory-triggers.sql
--   inventory-update-from-csv.sql
--
-- orders is one table. Checkout writes analytics columns
-- (order_id, session_id, total_value, items) and Stripe/COD
-- columns (order_number, total_amount, stripe_session_id)
-- on that same table. order_items carries product_id, size,
-- and color so stock deduction can match a variant.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    is_mobile BOOLEAN DEFAULT false,
    is_tablet BOOLEAN DEFAULT false,
    is_desktop BOOLEAN DEFAULT true,
    screen_width INTEGER,
    screen_height INTEGER,
    language TEXT,
    timezone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    path TEXT,
    title TEXT,
    referrer TEXT,
    scroll_depth INTEGER DEFAULT 0,
    time_on_page INTEGER DEFAULT 0,
    engaged BOOLEAN DEFAULT false,
    bounce BOOLEAN DEFAULT false,
    exit BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_category TEXT,
    event_label TEXT,
    event_value NUMERIC,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    cost NUMERIC(10,2),
    compare_at_price NUMERIC(10,2),
    category TEXT,
    subcategory TEXT,
    brand TEXT,
    sku TEXT,
    inventory_count INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('add', 'remove', 'update', 'view', 'checkout_start', 'checkout_complete', 'abandoned')),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    external_product_id TEXT,
    product_title TEXT,
    variant_id TEXT,
    variant_title TEXT,
    quantity INTEGER DEFAULT 1,
    price NUMERIC(10,2),
    total_value NUMERIC(10,2),
    cart_total NUMERIC(10,2),
    discount_code TEXT,
    discount_amount NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics orders and Stripe/COD orders share this table.
-- Analytics inserts leave order_number null.
-- Storefront inserts leave order_id null.
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT UNIQUE,
    order_number TEXT UNIQUE,
    session_id TEXT DEFAULT 'anonymous',
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email TEXT,
    customer_id TEXT,
    is_guest BOOLEAN DEFAULT false,
    subtotal NUMERIC(10,2) DEFAULT 0,
    discount_total NUMERIC(10,2) DEFAULT 0,
    shipping_total NUMERIC(10,2) DEFAULT 0,
    tax_total NUMERIC(10,2) DEFAULT 0,
    total_value NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2),
    total_cost NUMERIC(10,2),
    profit NUMERIC(10,2),
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    shipping_method TEXT,
    source TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    discount_codes JSONB,
    items JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed')),
    fulfillment_status TEXT,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    billing_address JSONB,
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    variant TEXT,
    product_id TEXT,
    size TEXT,
    color TEXT,
    sku TEXT,
    variant_details JSONB,
    variant_id TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    product_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT NOT NULL UNIQUE,
    utm_term TEXT,
    utm_content TEXT,
    cost NUMERIC(10,2) DEFAULT 0,
    budget NUMERIC(10,2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversion_funnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    hour INTEGER,
    total_visits INTEGER DEFAULT 0,
    product_views INTEGER DEFAULT 0,
    add_to_cart INTEGER DEFAULT 0,
    checkout_start INTEGER DEFAULT 0,
    checkout_complete INTEGER DEFAULT 0,
    revenue NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    size TEXT NOT NULL DEFAULT 'Standard',
    color TEXT,
    sku TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (GREATEST(stock_quantity - reserved_quantity, 0)) STORED,
    price NUMERIC(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'restock', 'adjustment', 'return', 'damage')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    order_id TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_visits_session_id ON public.visits(session_id);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON public.visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_country ON public.visits(country);
CREATE INDEX IF NOT EXISTS idx_visits_utm_source ON public.visits(utm_source);
CREATE INDEX IF NOT EXISTS idx_visits_utm_campaign ON public.visits(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_visits_referrer ON public.visits(referrer);
CREATE INDEX IF NOT EXISTS idx_visits_device ON public.visits(device);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visit_id ON public.page_views(visit_id);
CREATE INDEX IF NOT EXISTS idx_page_views_url ON public.page_views(url);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_session_id ON public.events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_visit_id ON public.events(visit_id);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON public.events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_event_category ON public.events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_payload ON public.events USING GIN(payload);

CREATE INDEX IF NOT EXISTS idx_products_product_id ON public.products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cart_events_session_id ON public.cart_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_visit_id ON public.cart_events(visit_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_event_type ON public.cart_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cart_events_product_id ON public.cart_events(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_created_at ON public.cart_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON public.orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_visit_id ON public.orders(visit_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_source ON public.orders(source);
CREATE INDEX IF NOT EXISTS idx_orders_utm_campaign ON public.orders(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_utm_campaign ON public.campaigns(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON public.campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_funnel_date ON public.conversion_funnel(date DESC);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_date_hour ON public.conversion_funnel(date DESC, hour DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversion_funnel_unique ON public.conversion_funnel(date, COALESCE(hour, -1));

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_lookup ON public.product_variants(product_id, size, color);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_id ON public.inventory_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at DESC);

-- =====================================================
-- UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_visits_updated_at ON public.visits;
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversion_funnel_updated_at ON public.conversion_funnel;
CREATE TRIGGER update_conversion_funnel_updated_at BEFORE UPDATE ON public.conversion_funnel FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- INVENTORY TRIGGERS
-- =====================================================

-- ==========================================
-- INVENTORY AUTOMATION TRIGGERS
-- Auto-deduct stock when orders are placed
-- ==========================================

-- Function: Deduct inventory when order items are created
CREATE OR REPLACE FUNCTION deduct_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
    v_variant_id UUID;
    v_current_stock INTEGER;
    v_variant_size TEXT;
    v_variant_color TEXT;
BEGIN
    -- Extract size and color from order item
    -- Assuming order_items has size and color columns or variant info
    v_variant_size := COALESCE(NEW.size, 'Standard');
    v_variant_color := NEW.color;
    
    -- Find the matching variant
    SELECT id, stock_quantity 
    INTO v_variant_id, v_current_stock
    FROM product_variants
    WHERE product_id = NEW.product_id
      AND size = v_variant_size
      AND (color = v_variant_color OR (color IS NULL AND v_variant_color IS NULL))
    LIMIT 1;
    
    -- If variant not found, try without color/size matching (for accessories)
    IF v_variant_id IS NULL THEN
        SELECT id, stock_quantity 
        INTO v_variant_id, v_current_stock
        FROM product_variants
        WHERE product_id = NEW.product_id
        LIMIT 1;
    END IF;
    
    -- If still not found, log error but don't fail the order
    IF v_variant_id IS NULL THEN
        RAISE WARNING 'No variant found for product_id: %, size: %, color: %', 
            NEW.product_id, v_variant_size, v_variant_color;
        RETURN NEW;
    END IF;
    
    -- Check if sufficient stock
    IF v_current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product %: requested %, available %', 
            NEW.product_id, NEW.quantity, v_current_stock;
    END IF;
    
    -- Deduct stock
    UPDATE product_variants
    SET stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = v_variant_id;
    
    -- Log the movement
    INSERT INTO inventory_movements (
        variant_id,
        movement_type,
        quantity,
        previous_stock,
        new_stock,
        order_id,
        notes,
        created_by
    ) VALUES (
        v_variant_id,
        'sale',
        -NEW.quantity,
        v_current_stock,
        v_current_stock - NEW.quantity,
        NEW.order_id,
        'Automatic deduction from order',
        'system'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger on order_items table
DROP TRIGGER IF EXISTS trigger_deduct_inventory ON public.order_items;
CREATE TRIGGER trigger_deduct_inventory
    AFTER INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION deduct_inventory_on_order();

-- ==========================================
-- Function: Restore inventory on order cancellation
-- ==========================================
CREATE OR REPLACE FUNCTION restore_inventory_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
    v_variant_id UUID;
    v_current_stock INTEGER;
    v_variant_size TEXT;
    v_variant_color TEXT;
BEGIN
    -- Only restore if order status changed to 'cancelled' or 'refunded'
    IF NEW.status IN ('cancelled', 'refunded') AND OLD.status NOT IN ('cancelled', 'refunded') THEN
        
        -- Get all order items for this order
        FOR v_variant_id, v_variant_size, v_variant_color IN
            SELECT pv.id, oi.size, oi.color
            FROM public.order_items oi
            JOIN product_variants pv ON pv.product_id = oi.product_id
            WHERE oi.order_id = NEW.id
              AND pv.size = COALESCE(oi.size, 'Standard')
              AND (pv.color = oi.color OR (pv.color IS NULL AND oi.color IS NULL))
        LOOP
            -- Get current stock
            SELECT stock_quantity INTO v_current_stock
            FROM product_variants
            WHERE id = v_variant_id;
            
            -- Restore stock
            UPDATE product_variants
            SET stock_quantity = stock_quantity + (
                SELECT quantity FROM public.order_items oi
                WHERE oi.order_id = NEW.id
                  AND oi.size = v_variant_size
                  AND oi.color = v_variant_color
                LIMIT 1
            ),
            updated_at = NOW()
            WHERE id = v_variant_id;
            
            -- Log the restoration
            INSERT INTO inventory_movements (
                variant_id,
                movement_type,
                quantity,
                previous_stock,
                new_stock,
                order_id,
                notes,
                created_by
            ) SELECT
                v_variant_id,
                'return',
                quantity,
                v_current_stock,
                v_current_stock + quantity,
                NEW.id,
                'Stock restored due to order ' || NEW.status,
                'system'
            FROM public.order_items
            WHERE order_id = NEW.id
              AND size = v_variant_size
              AND color = v_variant_color
            LIMIT 1;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_restore_inventory ON public.orders;
CREATE TRIGGER trigger_restore_inventory
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION restore_inventory_on_cancel();

-- ==========================================
-- Function: Prevent negative stock
-- ==========================================
CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_quantity < 0 THEN
        RAISE EXCEPTION 'Stock quantity cannot be negative for variant %', NEW.variant_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to prevent negative stock
DROP TRIGGER IF EXISTS trigger_prevent_negative_stock ON product_variants;
CREATE TRIGGER trigger_prevent_negative_stock
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION prevent_negative_stock();

-- ==========================================
-- Function: Update timestamp on product_variants change
-- ==========================================
CREATE OR REPLACE FUNCTION update_variant_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-updating timestamps
DROP TRIGGER IF EXISTS trigger_update_variant_timestamp ON product_variants;
CREATE TRIGGER trigger_update_variant_timestamp
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_variant_timestamp();


-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- View: Daily Overview Stats
CREATE OR REPLACE VIEW daily_overview AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT session_id) as unique_visitors,
    COUNT(*) as total_visits,
    COUNT(DISTINCT CASE WHEN is_mobile THEN session_id END) as mobile_visitors,
    COUNT(DISTINCT CASE WHEN is_desktop THEN session_id END) as desktop_visitors,
    COUNT(DISTINCT country) as countries_count
FROM visits
GROUP BY DATE(created_at)
ORDER BY date DESC;
ALTER VIEW daily_overview SET (security_invoker = true);

-- View: Sales Overview
CREATE OR REPLACE VIEW sales_overview AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_orders,
    COUNT(DISTINCT customer_email) as unique_customers,
    SUM(total_value) as revenue,
    SUM(total_cost) as cogs,
    SUM(profit) as profit,
    AVG(total_value) as aov,
    SUM(discount_total) as total_discounts
FROM orders
WHERE status IN ('completed', 'processing')
GROUP BY DATE(created_at)
ORDER BY date DESC;
ALTER VIEW sales_overview SET (security_invoker = true);

-- View: Top Products by Revenue
CREATE OR REPLACE VIEW top_products_by_revenue AS
SELECT 
    p.product_id,
    p.title,
    p.category,
    COUNT(ce.id) as units_sold,
    SUM(ce.total_value) as revenue,
    AVG(ce.price) as avg_price
FROM products p
LEFT JOIN cart_events ce ON p.id = ce.product_id
WHERE ce.event_type = 'checkout_complete'
GROUP BY p.product_id, p.title, p.category
ORDER BY revenue DESC;
ALTER VIEW top_products_by_revenue SET (security_invoker = true);

-- View: Traffic Sources
CREATE OR REPLACE VIEW traffic_sources AS
SELECT 
    COALESCE(utm_source, 'direct') as source,
    COALESCE(utm_medium, 'none') as medium,
    COUNT(DISTINCT session_id) as visitors,
    COUNT(*) as visits
FROM visits
GROUP BY utm_source, utm_medium
ORDER BY visitors DESC;
ALTER VIEW traffic_sources SET (security_invoker = true);

-- View: Conversion Funnel Real-time
CREATE OR REPLACE VIEW conversion_funnel_realtime AS
SELECT 
    COUNT(DISTINCT v.session_id) as total_visits,
    COUNT(DISTINCT CASE WHEN pv.url LIKE '%/product%' OR pv.path LIKE '%/product%' THEN v.session_id END) as product_views,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END) as add_to_cart,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_start' THEN ce.session_id END) as checkout_start,
    -- Count ALL orders with status 'completed' or 'processing' in the last 30 days, not just those matching visits
    (SELECT COUNT(DISTINCT session_id) FROM orders WHERE status IN ('completed', 'processing') AND created_at >= NOW() - INTERVAL '30 days') as purchases,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as visit_to_cart_rate,
    ROUND(100.0 * (SELECT COUNT(DISTINCT session_id) FROM orders WHERE status IN ('completed', 'processing') AND created_at >= NOW() - INTERVAL '30 days') / NULLIF(COUNT(DISTINCT ce.session_id), 0), 2) as cart_to_purchase_rate
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id
LEFT JOIN cart_events ce ON v.session_id = ce.session_id
WHERE v.created_at >= NOW() - INTERVAL '30 days';
ALTER VIEW conversion_funnel_realtime SET (security_invoker = true);

-- View: Abandoned Carts
CREATE OR REPLACE VIEW abandoned_carts AS
SELECT 
    v.session_id,
    v.created_at as visit_time,
    MAX(ce.created_at) as last_cart_activity,
    SUM(ce.total_value) FILTER (WHERE ce.event_type = 'add') as cart_value,
    COUNT(*) FILTER (WHERE ce.event_type = 'add') as items_count,
    CASE WHEN o.id IS NULL THEN true ELSE false END as is_abandoned
FROM visits v
JOIN cart_events ce ON v.session_id = ce.session_id
LEFT JOIN orders o ON v.session_id = o.session_id
WHERE ce.event_type IN ('add', 'checkout_start')
GROUP BY v.session_id, v.created_at, o.id
HAVING CASE WHEN o.id IS NULL THEN true ELSE false END = true
ORDER BY last_cart_activity DESC;
ALTER VIEW abandoned_carts SET (security_invoker = true);

-- View: Campaign Performance
CREATE OR REPLACE VIEW campaign_performance AS
SELECT 
    c.name,
    c.utm_campaign,
    c.cost as campaign_cost,
    COUNT(DISTINCT v.session_id) as visitors,
    COUNT(DISTINCT o.id) as orders,
    COALESCE(SUM(o.total_value), 0) as revenue,
    COALESCE(SUM(o.profit), 0) as profit,
    COALESCE(SUM(o.profit), 0) - c.cost as roi,
    ROUND(100.0 * COALESCE(SUM(o.profit), 0) / NULLIF(c.cost, 0), 2) as roi_percentage,
    ROUND(COALESCE(SUM(o.total_value), 0) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as revenue_per_visitor
FROM campaigns c
LEFT JOIN visits v ON v.utm_campaign = c.utm_campaign
LEFT JOIN orders o ON o.utm_campaign = c.utm_campaign
GROUP BY c.id, c.name, c.utm_campaign, c.cost
ORDER BY revenue DESC;
ALTER VIEW campaign_performance SET (security_invoker = true);

-- 1. Traffic by Source View
CREATE VIEW traffic_by_source AS
SELECT 
    COALESCE(v.utm_source, 'direct') as source,
    COALESCE(v.utm_medium, 'none') as medium,
    COUNT(DISTINCT v.session_id) as visit_count,
    COUNT(pv.id) as pageview_count,
    COUNT(DISTINCT o.id) as order_count,
    COALESCE(SUM(o.total_value), 0) as revenue
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id
LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
GROUP BY v.utm_source, v.utm_medium
ORDER BY visit_count DESC;

-- 2. Top Products Summary View
CREATE VIEW top_products_summary AS
SELECT 
    p.product_id,
    p.title as product_name,
    p.category,
    COUNT(DISTINCT CASE WHEN e.event_name = 'product_view' THEN e.session_id END) as view_count,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END) as cart_adds,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_complete' THEN ce.session_id END) as purchases,
    COALESCE(SUM(CASE WHEN ce.event_type = 'checkout_complete' THEN ce.total_value ELSE 0 END), 0) as revenue
FROM products p
LEFT JOIN events e ON e.payload->>'product_id' = p.product_id
LEFT JOIN cart_events ce ON p.id = ce.product_id
GROUP BY p.product_id, p.title, p.category
ORDER BY revenue DESC;

-- 3. Conversion Funnel Summary View
CREATE VIEW conversion_funnel_summary AS
SELECT 
    COUNT(DISTINCT v.session_id) as total_visits,
    COUNT(DISTINCT CASE WHEN pv.url LIKE '%/product%' OR pv.path LIKE '%/product%' THEN v.session_id END) as product_views,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END) as add_to_cart,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_start' THEN ce.session_id END) as checkout_started,
    (SELECT COUNT(DISTINCT session_id) FROM orders WHERE status IN ('completed', 'processing')) as orders_completed
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id
LEFT JOIN cart_events ce ON v.session_id = ce.session_id;

-- 4. Hourly Performance View
CREATE VIEW hourly_performance AS
SELECT 
    EXTRACT(HOUR FROM v.created_at)::INTEGER as hour,
    COUNT(DISTINCT v.session_id) as visitors,
    COUNT(pv.id) as pageviews,
    COUNT(DISTINCT o.id) as orders,
    COALESCE(SUM(o.total_value), 0) as revenue
FROM visits v
LEFT JOIN page_views pv ON v.session_id = pv.session_id AND DATE(pv.created_at) = CURRENT_DATE
LEFT JOIN orders o ON v.session_id = o.session_id AND DATE(o.created_at) = CURRENT_DATE AND o.status IN ('completed', 'processing')
WHERE DATE(v.created_at) = CURRENT_DATE
GROUP BY EXTRACT(HOUR FROM v.created_at)::INTEGER
ORDER BY hour;

-- 5. Total Sales Summary View
CREATE VIEW total_sales_summary AS
SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(total_value), 0) as total_revenue
FROM orders
WHERE status IN ('completed', 'processing');

-- 6. Average Order Value (AOV) Summary View
CREATE VIEW aov_summary AS
SELECT 
    COALESCE(AVG(total_value), 0) as aov
FROM orders
WHERE status IN ('completed', 'processing');


CREATE OR REPLACE VIEW public.inventory_dashboard
WITH (security_invoker = true) AS
SELECT
    pv.id,
    pv.product_id,
    p.title AS product_name,
    pv.variant_name,
    pv.size,
    pv.color,
    pv.sku,
    pv.stock_quantity,
    pv.reserved_quantity,
    pv.available_quantity,
    pv.price,
    CASE
        WHEN pv.available_quantity <= 0 THEN 'out_of_stock'
        WHEN pv.available_quantity < 5 THEN 'low_stock'
        WHEN pv.available_quantity < 10 THEN 'moderate'
        ELSE 'in_stock'
    END AS stock_status,
    COALESCE((
        SELECT SUM(oi.quantity)::INTEGER
        FROM public.order_items oi
        JOIN public.orders o ON o.id = oi.order_id
        WHERE oi.product_id = pv.product_id
          AND COALESCE(oi.size, 'Standard') = pv.size
          AND oi.color IS NOT DISTINCT FROM pv.color
          AND o.status IN ('completed', 'processing')
          AND o.created_at >= NOW() - INTERVAL '30 days'
    ), 0) AS sales_last_30_days,
    pv.is_active,
    pv.updated_at
FROM public.product_variants pv
LEFT JOIN public.products p ON p.product_id = pv.product_id;

CREATE OR REPLACE VIEW public.low_stock_alerts
WITH (security_invoker = true) AS
SELECT
    id,
    product_id,
    product_name,
    variant_name,
    sku,
    available_quantity,
    updated_at
FROM public.inventory_dashboard
WHERE is_active = true
  AND available_quantity < 5;


-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Function: Get active visitors (last 5 minutes)
CREATE OR REPLACE FUNCTION get_active_visitors()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT session_id)
        FROM page_views
        WHERE created_at >= NOW() - INTERVAL '5 minutes'
    );
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function: Get stats for date range
CREATE OR REPLACE FUNCTION get_stats_for_period(
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
)
RETURNS TABLE (
    total_visitors BIGINT,
    total_pageviews BIGINT,
    total_orders BIGINT,
    total_revenue NUMERIC,
    total_profit NUMERIC,
    avg_order_value NUMERIC,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT v.session_id) as total_visitors,
        COUNT(pv.id) as total_pageviews,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_value), 0) as total_revenue,
        COALESCE(SUM(o.profit), 0) as total_profit,
        COALESCE(AVG(o.total_value), 0) as avg_order_value,
        ROUND(100.0 * COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as conversion_rate
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
    WHERE v.created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function: Get hourly stats for today
CREATE OR REPLACE FUNCTION get_hourly_stats_today()
RETURNS TABLE (
    hour INTEGER,
    visitors BIGINT,
    pageviews BIGINT,
    orders BIGINT,
    revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM v.created_at)::INTEGER as hour,
        COUNT(DISTINCT v.session_id) as visitors,
        COUNT(pv.id) as pageviews,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(o.total_value), 0) as revenue
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
    WHERE DATE(v.created_at) = CURRENT_DATE
    GROUP BY EXTRACT(HOUR FROM v.created_at)::INTEGER
    ORDER BY hour;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function: Update conversion funnel aggregates
CREATE OR REPLACE FUNCTION update_conversion_funnel_aggregates(target_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO conversion_funnel (date, total_visits, product_views, add_to_cart, checkout_start, checkout_complete, revenue)
    SELECT 
        target_date,
        COUNT(DISTINCT v.session_id),
        COUNT(DISTINCT CASE WHEN pv.url LIKE '%/product%' THEN v.session_id END),
        COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END),
        COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_start' THEN ce.session_id END),
        COUNT(DISTINCT o.session_id),
        COALESCE(SUM(o.total_value), 0)
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id AND DATE(pv.created_at) = target_date
    LEFT JOIN cart_events ce ON v.session_id = ce.session_id AND DATE(ce.created_at) = target_date
    LEFT JOIN orders o ON v.session_id = o.session_id AND DATE(o.created_at) = target_date AND o.status IN ('completed', 'processing')
    WHERE DATE(v.created_at) = target_date
    ON CONFLICT (date, COALESCE(hour, -1)) 
    DO UPDATE SET
        total_visits = EXCLUDED.total_visits,
        product_views = EXCLUDED.product_views,
        add_to_cart = EXCLUDED.add_to_cart,
        checkout_start = EXCLUDED.checkout_start,
        checkout_complete = EXCLUDED.checkout_complete,
        revenue = EXCLUDED.revenue,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =====================================================
-- ADVANCED ANALYTICS FUNCTIONS
-- Additional SQL functions for complex queries
-- =====================================================

-- Function: Get top products by metric
CREATE OR REPLACE FUNCTION get_top_products(
    metric TEXT DEFAULT 'revenue', -- 'revenue', 'units', 'profit'
    limit_count INTEGER DEFAULT 10,
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    product_id TEXT,
    product_title TEXT,
    category TEXT,
    units_sold BIGINT,
    revenue NUMERIC,
    cost NUMERIC,
    profit NUMERIC,
    avg_price NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.product_id,
        p.title as product_title,
        p.category,
        COUNT(ce.id) as units_sold,
        COALESCE(SUM(ce.total_value), 0) as revenue,
        COALESCE(SUM(p.cost * ce.quantity), 0) as cost,
        COALESCE(SUM(ce.total_value) - SUM(p.cost * ce.quantity), 0) as profit,
        COALESCE(AVG(ce.price), 0) as avg_price
    FROM products p
    LEFT JOIN cart_events ce ON p.id = ce.product_id 
        AND ce.event_type = 'checkout_complete'
        AND ce.created_at BETWEEN start_date AND end_date
    GROUP BY p.product_id, p.title, p.category
    ORDER BY 
        CASE 
            WHEN metric = 'revenue' THEN COALESCE(SUM(ce.total_value), 0)
            WHEN metric = 'units' THEN COUNT(ce.id)::NUMERIC
            WHEN metric = 'profit' THEN COALESCE(SUM(ce.total_value) - SUM(p.cost * ce.quantity), 0)
            ELSE COALESCE(SUM(ce.total_value), 0)
        END DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function: Get traffic by source with conversion metrics
CREATE OR REPLACE FUNCTION get_traffic_by_source(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    source TEXT,
    medium TEXT,
    visitors BIGINT,
    sessions BIGINT,
    pageviews BIGINT,
    orders BIGINT,
    revenue NUMERIC,
    conversion_rate NUMERIC,
    revenue_per_visitor NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(v.utm_source, 'direct') as source,
        COALESCE(v.utm_medium, 'none') as medium,
        COUNT(DISTINCT v.session_id) as visitors,
        COUNT(v.id) as sessions,
        COUNT(pv.id) as pageviews,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(o.total_value), 0) as revenue,
        ROUND(100.0 * COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as conversion_rate,
        ROUND(COALESCE(SUM(o.total_value), 0) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as revenue_per_visitor
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
    WHERE v.created_at BETWEEN start_date AND end_date
    GROUP BY v.utm_source, v.utm_medium
    ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function: Get geographic breakdown
CREATE OR REPLACE FUNCTION get_traffic_by_country(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW(),
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    country TEXT,
    visitors BIGINT,
    pageviews BIGINT,
    orders BIGINT,
    revenue NUMERIC,
    avg_order_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(v.country, 'Unknown') as country,
        COUNT(DISTINCT v.session_id) as visitors,
        COUNT(pv.id) as pageviews,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(o.total_value), 0) as revenue,
        COALESCE(AVG(o.total_value), 0) as avg_order_value
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
    WHERE v.created_at BETWEEN start_date AND end_date
    GROUP BY v.country
    ORDER BY revenue DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function: Get device breakdown
CREATE OR REPLACE FUNCTION get_traffic_by_device(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    device_type TEXT,
    visitors BIGINT,
    pageviews BIGINT,
    avg_session_duration NUMERIC,
    bounce_rate NUMERIC,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN v.is_mobile THEN 'Mobile'
            WHEN v.is_tablet THEN 'Tablet'
            ELSE 'Desktop'
        END as device_type,
        COUNT(DISTINCT v.session_id) as visitors,
        COUNT(pv.id) as pageviews,
        ROUND(AVG(pv.time_on_page)::NUMERIC, 2) as avg_session_duration,
        ROUND(100.0 * COUNT(*) FILTER (WHERE pv.bounce = true) / NULLIF(COUNT(pv.id), 0), 2) as bounce_rate,
        ROUND(100.0 * COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as conversion_rate
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id AND o.status IN ('completed', 'processing')
    WHERE v.created_at BETWEEN start_date AND end_date
    GROUP BY device_type
    ORDER BY visitors DESC;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function: Get conversion funnel with drop-off rates
CREATE OR REPLACE FUNCTION get_conversion_funnel_detailed(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    step TEXT,
    count BIGINT,
    percentage NUMERIC,
    drop_off_rate NUMERIC
) AS $$
DECLARE
    total_visits BIGINT;
    product_views BIGINT;
    add_to_cart BIGINT;
    checkout_start BIGINT;
    purchases BIGINT;
BEGIN
    -- Calculate funnel metrics
    SELECT 
        COUNT(DISTINCT v.session_id),
        COUNT(DISTINCT CASE WHEN pv.url LIKE '%/product%' OR pv.path LIKE '%/product%' THEN v.session_id END),
        COUNT(DISTINCT CASE WHEN ce.event_type = 'add' THEN ce.session_id END),
        COUNT(DISTINCT CASE WHEN ce.event_type = 'checkout_start' THEN ce.session_id END),
        COUNT(DISTINCT CASE WHEN o.status IN ('completed', 'processing') THEN o.session_id END)
    INTO total_visits, product_views, add_to_cart, checkout_start, purchases
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id
    LEFT JOIN cart_events ce ON v.session_id = ce.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id
    WHERE v.created_at BETWEEN start_date AND end_date;

    -- Return funnel with drop-off rates
    RETURN QUERY
    SELECT '1. Visits'::TEXT, total_visits, 100.0, 0.0
    UNION ALL
    SELECT '2. Product Views'::TEXT, product_views, ROUND(100.0 * product_views / NULLIF(total_visits, 0), 2), 
           ROUND(100.0 * (total_visits - product_views) / NULLIF(total_visits, 0), 2)
    UNION ALL
    SELECT '3. Add to Cart'::TEXT, add_to_cart, ROUND(100.0 * add_to_cart / NULLIF(total_visits, 0), 2),
           ROUND(100.0 * (product_views - add_to_cart) / NULLIF(product_views, 0), 2)
    UNION ALL
    SELECT '4. Checkout Start'::TEXT, checkout_start, ROUND(100.0 * checkout_start / NULLIF(total_visits, 0), 2),
           ROUND(100.0 * (add_to_cart - checkout_start) / NULLIF(add_to_cart, 0), 2)
    UNION ALL
    SELECT '5. Purchase'::TEXT, purchases, ROUND(100.0 * purchases / NULLIF(total_visits, 0), 2),
           ROUND(100.0 * (checkout_start - purchases) / NULLIF(checkout_start, 0), 2);
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function: Get cohort analysis (customers by first purchase date)
CREATE OR REPLACE FUNCTION get_cohort_analysis(
    cohort_type TEXT DEFAULT 'monthly' -- 'daily', 'weekly', 'monthly'
)
RETURNS TABLE (
    cohort_period TEXT,
    total_customers BIGINT,
    total_orders BIGINT,
    total_revenue NUMERIC,
    avg_order_value NUMERIC,
    repeat_purchase_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH first_purchases AS (
        SELECT 
            customer_email,
            MIN(created_at) as first_purchase_date
        FROM orders
        WHERE status IN ('completed', 'processing')
        GROUP BY customer_email
    ),
    cohorts AS (
        SELECT 
            CASE 
                WHEN cohort_type = 'daily' THEN TO_CHAR(fp.first_purchase_date, 'YYYY-MM-DD')
                WHEN cohort_type = 'weekly' THEN TO_CHAR(DATE_TRUNC('week', fp.first_purchase_date), 'YYYY-MM-DD')
                ELSE TO_CHAR(DATE_TRUNC('month', fp.first_purchase_date), 'YYYY-MM')
            END as cohort_period,
            fp.customer_email,
            COUNT(o.id) as order_count,
            SUM(o.total_value) as revenue
        FROM first_purchases fp
        JOIN orders o ON fp.customer_email = o.customer_email AND o.status IN ('completed', 'processing')
        GROUP BY cohort_period, fp.customer_email
    )
    SELECT 
        c.cohort_period,
        COUNT(DISTINCT c.customer_email) as total_customers,
        SUM(c.order_count)::BIGINT as total_orders,
        COALESCE(SUM(c.revenue), 0) as total_revenue,
        COALESCE(AVG(c.revenue / c.order_count), 0) as avg_order_value,
        ROUND(100.0 * COUNT(*) FILTER (WHERE c.order_count > 1) / NULLIF(COUNT(*), 0), 2) as repeat_purchase_rate
    FROM cohorts c
    GROUP BY c.cohort_period
    ORDER BY c.cohort_period DESC;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function: Get abandoned cart details with recovery potential
CREATE OR REPLACE FUNCTION get_abandoned_carts_detailed(
    hours_since_abandonment INTEGER DEFAULT 24,
    limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
    session_id TEXT,
    visit_time TIMESTAMPTZ,
    last_activity TIMESTAMPTZ,
    hours_since_last_activity NUMERIC,
    cart_value NUMERIC,
    items_count BIGINT,
    utm_source TEXT,
    utm_campaign TEXT,
    country TEXT,
    device TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.session_id,
        v.created_at as visit_time,
        MAX(ce.created_at) as last_activity,
        ROUND(EXTRACT(EPOCH FROM (NOW() - MAX(ce.created_at))) / 3600, 2) as hours_since_last_activity,
        SUM(ce.total_value) FILTER (WHERE ce.event_type = 'add') as cart_value,
        COUNT(*) FILTER (WHERE ce.event_type = 'add') as items_count,
        v.utm_source,
        v.utm_campaign,
        v.country,
        v.device
    FROM visits v
    JOIN cart_events ce ON v.session_id = ce.session_id
    LEFT JOIN orders o ON v.session_id = o.session_id
    WHERE ce.event_type IN ('add', 'checkout_start')
        AND o.id IS NULL
        AND ce.created_at >= NOW() - (hours_since_abandonment || ' hours')::INTERVAL
    GROUP BY v.session_id, v.created_at, v.utm_source, v.utm_campaign, v.country, v.device
    ORDER BY cart_value DESC, last_activity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get real-time dashboard stats
CREATE OR REPLACE FUNCTION get_realtime_stats()
RETURNS TABLE (
    active_visitors INTEGER,
    visitors_today BIGINT,
    pageviews_today BIGINT,
    orders_today BIGINT,
    revenue_today NUMERIC,
    active_carts BIGINT,
    trending_product TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE created_at >= NOW() - INTERVAL '5 minutes')::INTEGER as active_visitors,
        (SELECT COUNT(DISTINCT session_id) FROM visits WHERE DATE(created_at) = CURRENT_DATE) as visitors_today,
        (SELECT COUNT(*) FROM page_views WHERE DATE(created_at) = CURRENT_DATE) as pageviews_today,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status IN ('completed', 'processing')) as orders_today,
        (SELECT COALESCE(SUM(total_value), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status IN ('completed', 'processing')) as revenue_today,
        (SELECT COUNT(DISTINCT session_id) FROM cart_events WHERE created_at >= NOW() - INTERVAL '1 hour' AND event_type = 'add') as active_carts,
        (SELECT p.title FROM products p 
         JOIN cart_events ce ON p.id = ce.product_id 
         WHERE ce.created_at >= NOW() - INTERVAL '24 hours' 
         GROUP BY p.id, p.title 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as trending_product;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get product performance comparison
CREATE OR REPLACE FUNCTION compare_product_performance(
    product_ids TEXT[],
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    product_id TEXT,
    product_title TEXT,
    views BIGINT,
    add_to_cart BIGINT,
    purchases BIGINT,
    revenue NUMERIC,
    view_to_cart_rate NUMERIC,
    cart_to_purchase_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.product_id,
        p.title as product_title,
        COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_name = 'product_view') as views,
        COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'add') as add_to_cart,
        COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'checkout_complete') as purchases,
        COALESCE(SUM(ce.total_value) FILTER (WHERE ce.event_type = 'checkout_complete'), 0) as revenue,
        ROUND(100.0 * COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'add') / 
              NULLIF(COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_name = 'product_view'), 0), 2) as view_to_cart_rate,
        ROUND(100.0 * COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'checkout_complete') / 
              NULLIF(COUNT(DISTINCT ce.session_id) FILTER (WHERE ce.event_type = 'add'), 0), 2) as cart_to_purchase_rate
    FROM products p
    LEFT JOIN events e ON e.payload->>'product_id' = p.product_id 
        AND e.created_at BETWEEN start_date AND end_date
    LEFT JOIN cart_events ce ON p.id = ce.product_id 
        AND ce.created_at BETWEEN start_date AND end_date
    WHERE p.product_id = ANY(product_ids)
    GROUP BY p.product_id, p.title
    ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get time-based performance trends
CREATE OR REPLACE FUNCTION get_hourly_performance_trends(
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    hour INTEGER,
    visitors BIGINT,
    pageviews BIGINT,
    cart_events BIGINT,
    orders BIGINT,
    revenue NUMERIC,
    avg_session_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM v.created_at)::INTEGER as hour,
        COUNT(DISTINCT v.session_id) as visitors,
        COUNT(pv.id) as pageviews,
        COUNT(ce.id) as cart_events,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(o.total_value), 0) as revenue,
        ROUND(COALESCE(SUM(o.total_value), 0) / NULLIF(COUNT(DISTINCT v.session_id), 0), 2) as avg_session_value
    FROM visits v
    LEFT JOIN page_views pv ON v.session_id = pv.session_id AND DATE(pv.created_at) = target_date
    LEFT JOIN cart_events ce ON v.session_id = ce.session_id AND DATE(ce.created_at) = target_date
    LEFT JOIN orders o ON v.session_id = o.session_id AND DATE(o.created_at) = target_date AND o.status IN ('completed', 'processing')
    WHERE DATE(v.created_at) = target_date
    GROUP BY hour
    ORDER BY hour;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- SCHEDULED JOBS / MAINTENANCE FUNCTIONS
-- =====================================================

-- Function: Clean old data (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data(retention_days INTEGER DEFAULT 365)
RETURNS VOID AS $$
BEGIN
    DELETE FROM page_views WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    DELETE FROM events WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    DELETE FROM cart_events WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    DELETE FROM visits WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    
    RAISE NOTICE 'Cleaned up analytics data older than % days', retention_days;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function: Vacuum and analyze tables for performance
CREATE OR REPLACE FUNCTION optimize_analytics_tables()
RETURNS VOID AS $$
BEGIN
    VACUUM ANALYZE visits;
    VACUUM ANALYZE page_views;
    VACUUM ANALYZE events;
    VACUUM ANALYZE cart_events;
    VACUUM ANALYZE orders;
    
    RAISE NOTICE 'Optimized analytics tables';
END;
$$ LANGUAGE plpgsql SET search_path = public;

COMMENT ON FUNCTION get_top_products IS 'Get top performing products by revenue, units sold, or profit';
COMMENT ON FUNCTION get_traffic_by_source IS 'Get traffic breakdown by UTM source and medium with conversion metrics';
COMMENT ON FUNCTION get_conversion_funnel_detailed IS 'Get detailed conversion funnel with drop-off rates at each step';
COMMENT ON FUNCTION get_abandoned_carts_detailed IS 'Get detailed abandoned cart information for recovery campaigns';
COMMENT ON FUNCTION get_realtime_stats IS 'Get real-time dashboard statistics for current activity';



-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on visits" ON public.visits;
DROP POLICY IF EXISTS "Allow public insert on page_views" ON public.page_views;
DROP POLICY IF EXISTS "Allow public insert on events" ON public.events;
DROP POLICY IF EXISTS "Allow public insert on cart_events" ON public.cart_events;
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public read on visits" ON public.visits;
DROP POLICY IF EXISTS "Allow public read on page_views" ON public.page_views;
DROP POLICY IF EXISTS "Allow public read on events" ON public.events;
DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
DROP POLICY IF EXISTS "Allow public read on cart_events" ON public.cart_events;
DROP POLICY IF EXISTS "Allow public read on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public read on campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Allow public read on conversion_funnel" ON public.conversion_funnel;
DROP POLICY IF EXISTS "Allow public read active products" ON public.products;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public read on product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow public update on product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow public insert on inventory_movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Allow public read on inventory_movements" ON public.inventory_movements;

CREATE POLICY "Allow public insert on visits" ON public.visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on page_views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on cart_events" ON public.cart_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on order_items" ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on visits" ON public.visits FOR SELECT USING (true);
CREATE POLICY "Allow public read on page_views" ON public.page_views FOR SELECT USING (true);
CREATE POLICY "Allow public read on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read on cart_events" ON public.cart_events FOR SELECT USING (true);
CREATE POLICY "Allow public read on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public read on order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public read on campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public read on conversion_funnel" ON public.conversion_funnel FOR SELECT USING (true);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "Allow public read on product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Allow public update on product_variants" ON public.product_variants FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public insert on inventory_movements" ON public.inventory_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on inventory_movements" ON public.inventory_movements FOR SELECT USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.daily_overview, public.sales_overview, public.top_products_by_revenue, public.traffic_sources, public.conversion_funnel_realtime, public.abandoned_carts, public.campaign_performance, public.traffic_by_source, public.top_products_summary, public.conversion_funnel_summary, public.hourly_performance, public.total_sales_summary, public.aov_summary, public.inventory_dashboard, public.low_stock_alerts TO anon, authenticated, service_role;

-- =====================================================
-- STARTING INVENTORY
-- From inventory-update-from-csv.sql (2025-12-09).
-- Accessories curly-claw-1 and curly-scarf-1 are included.
-- =====================================================

INSERT INTO public.product_variants (product_id, variant_name, size, color, stock_quantity, price, sku, is_active)
VALUES
    ('dreamcurl-jumbo', 'Full Set Purple Jumbo', 'Jumbo', 'Mulberry', 11, 24.99, 'FS-MULBERRY-JUMBO', true),
    ('dreamcurl-jumbo', 'Full Set Pink Jumbo', 'Jumbo', 'CANDY', 12, 24.99, 'FS-CANDY-JUMBO', true),
    ('dreamcurl-jumbo', 'Full Set Latte Jumbo', 'Jumbo', 'Latte', 8, 24.99, 'FS-LATTE-JUMBO', true),
    ('dreamcurl-jumbo', 'Full Set Green Jumbo', 'Jumbo', 'Olive', 11, 24.99, 'FS-OLIVE-JUMBO', true),
    ('dreamcurl-original', 'Full Set Purple Large', 'Large', 'Mulberry', 6, 22.99, 'FS-MULBERRY-LARGE', true),
    ('dreamcurl-original', 'Full Set Pink Large', 'Large', 'CANDY', 2, 22.99, 'FS-CANDY-LARGE', true),
    ('dreamcurl-original', 'Full Set Latte Large', 'Large', 'Latte', 10, 22.99, 'FS-LATTE-LARGE', true),
    ('dreamcurl-original', 'Full Set Green Large', 'Large', 'Olive', 9, 22.99, 'FS-OLIVE-LARGE', true),
    ('dreamcurl-midi', 'Full Set Purple Midi', 'Midi', 'Mulberry', 11, 20.99, 'FS-MULBERRY-MIDI', true),
    ('dreamcurl-midi', 'Full Set Pink Midi', 'Midi', 'CANDY', 10, 20.99, 'FS-CANDY-MIDI', true),
    ('dreamcurl-midi', 'Full Set Latte Midi', 'Midi', 'Latte', 11, 20.99, 'FS-LATTE-MIDI', true),
    ('dreamcurl-midi', 'Full Set Green Midi', 'Midi', 'Olive', 11, 20.99, 'FS-OLIVE-MIDI', true),
    ('zero-heat-mini', 'Full Set Purple Mini', 'Mini', 'Mulberry', 8, 18.99, 'FS-MULBERRY-MINI', true),
    ('zero-heat-mini', 'Full Set Pink Mini', 'Mini', 'CANDY', 11, 18.99, 'FS-CANDY-MINI', true),
    ('zero-heat-mini', 'Full Set Latte Mini', 'Mini', 'Latte', 8, 18.99, 'FS-LATTE-MINI', true),
    ('zero-heat-mini', 'Full Set Green Mini', 'Mini', 'Olive', 11, 18.99, 'FS-OLIVE-MINI', true),
    ('dreamcurl-short-set', 'Single Set Royal Purple Jumbo', 'Jumbo', 'Royal Purple', 3, 16.99, 'SS-RPURPLE-JUMBO', true),
    ('dreamcurl-short-set', 'Single Set Rose Gold Jumbo', 'Jumbo', 'Rose Gold', 2, 16.99, 'SS-RGOLD-JUMBO', true),
    ('dreamcurl-short-set', 'Single Set Earl Grey Jumbo', 'Jumbo', 'Earl Grey', 2, 16.99, 'SS-GREY-JUMBO', true),
    ('dreamcurl-short-set', 'Single Set Olive Lux Jumbo', 'Jumbo', 'Olive Lux', 1, 16.99, 'SS-OLIVE-JUMBO', true),
    ('dreamcurl-short-set', 'Single Set Royal Purple Large', 'Large', 'Royal Purple', 2, 16.99, 'SS-RPURPLE-LARGE', true),
    ('dreamcurl-short-set', 'Single Set Rose Gold Large', 'Large', 'Rose Gold', 0, 16.99, 'SS-RGOLD-LARGE', true),
    ('dreamcurl-short-set', 'Single Set Earl Grey Large', 'Large', 'Earl Grey', 1, 16.99, 'SS-GREY-LARGE', true),
    ('dreamcurl-short-set', 'Single Set Olive Lux Large', 'Large', 'Olive Lux', 3, 16.99, 'SS-OLIVE-LARGE', true),
    ('dreamcurl-short-set', 'Single Set Royal Purple Midi', 'Midi', 'Royal Purple', 2, 16.99, 'SS-RPURPLE-MIDI', true),
    ('dreamcurl-short-set', 'Single Set Rose Gold Midi', 'Midi', 'Rose Gold', 3, 16.99, 'SS-RGOLD-MIDI', true),
    ('dreamcurl-short-set', 'Single Set Earl Grey Midi', 'Midi', 'Earl Grey', 3, 16.99, 'SS-GREY-MIDI', true),
    ('dreamcurl-short-set', 'Single Set Olive Lux Midi', 'Midi', 'Olive Lux', 3, 16.99, 'SS-OLIVE-MIDI', true),
    ('dreamcurl-short-set', 'Single Set Royal Purple Mini', 'Mini', 'Royal Purple', 3, 16.99, 'SS-RPURPLE-MINI', true),
    ('dreamcurl-short-set', 'Single Set Rose Gold Mini', 'Mini', 'Rose Gold', 2, 16.99, 'SS-RGOLD-MINI', true),
    ('dreamcurl-short-set', 'Single Set Earl Grey Mini', 'Mini', 'Earl Grey', 3, 16.99, 'SS-GREY-MINI', true),
    ('dreamcurl-short-set', 'Single Set Olive Lux Mini', 'Mini', 'Olive Lux', 3, 16.99, 'SS-OLIVE-MINI', true),
    ('heatless-5', 'Bun Bons Purple Jumbo', 'Jumbo', 'Mulberry', 1, 22.99, 'HB-MULBERRY-JUMBO', true),
    ('heatless-5', 'Bun Bons Pink Jumbo', 'Jumbo', 'CANDY', 1, 22.99, 'HB-CANDY-JUMBO', true),
    ('heatless-5', 'Bun Bons Latte Jumbo', 'Jumbo', 'Latte', 2, 22.99, 'HB-LATTE-JUMBO', true),
    ('heatless-5', 'Bun Bons Green Jumbo', 'Jumbo', 'Olive', 3, 22.99, 'HB-OLIVE-JUMBO', true),
    ('heatless-5', 'Bun Bons Purple Large', 'Large', 'Mulberry', 0, 22.99, 'HB-MULBERRY-LARGE', true),
    ('heatless-5', 'Bun Bons Pink Large', 'Large', 'CANDY', 0, 22.99, 'HB-CANDY-LARGE', true),
    ('heatless-5', 'Bun Bons Latte Large', 'Large', 'Latte', 2, 22.99, 'HB-LATTE-LARGE', true),
    ('heatless-5', 'Bun Bons Green Large', 'Large', 'Olive', 1, 22.99, 'HB-OLIVE-LARGE', true),
    ('heatless-5', 'Bun Bons Purple Midi', 'Midi', 'Mulberry', 0, 22.99, 'HB-MULBERRY-MIDI', true),
    ('heatless-5', 'Bun Bons Pink Midi', 'Midi', 'CANDY', 0, 22.99, 'HB-CANDY-MIDI', true),
    ('heatless-5', 'Bun Bons Latte Midi', 'Midi', 'Latte', 0, 22.99, 'HB-LATTE-MIDI', true),
    ('heatless-5', 'Bun Bons Green Midi', 'Midi', 'Olive', 0, 22.99, 'HB-OLIVE-MIDI', true),
    ('heatless-5', 'Bun Bons Purple Mini', 'Mini', 'Mulberry', 3, 22.99, 'HB-MULBERRY-MINI', true),
    ('heatless-5', 'Bun Bons Pink Mini', 'Mini', 'CANDY', 0, 22.99, 'HB-CANDY-MINI', true),
    ('heatless-5', 'Bun Bons Latte Mini', 'Mini', 'Latte', 3, 22.99, 'HB-LATTE-MINI', true),
    ('heatless-5', 'Bun Bons Green Mini', 'Mini', 'Olive', 3, 22.99, 'HB-OLIVE-MINI', true),
    ('satin-scrunchies-french-5pc', 'Scrunchies 5 Set', 'Standard', NULL, 42, 11.99, 'SCRUNCHIES-5PC', true),
    ('curly-claw-1', 'Geometric Flower Hair Claw Clip 10 Set', 'Standard', NULL, 40, 15.99, 'CLAW-CLIPS-10', true),
    ('curly-clip-1', 'Curved Resin Hair Clip 9 Set', 'Standard', NULL, 149, 14.99, 'FLAT-CLIPS-9', true),
    ('curly-scarf-1', 'Elegant Satin Scarf + Scrunchies 7 Set', 'Standard', NULL, 22, 11.99, 'SCARF-SCRUNCHIES-7', true);

COMMENT ON TABLE public.visits IS 'Tracks unique visitor sessions with device and location information';
COMMENT ON TABLE public.page_views IS 'Records every page view with engagement metrics';
COMMENT ON TABLE public.events IS 'Stores custom user interaction events';
COMMENT ON TABLE public.products IS 'Product catalog with pricing and cost data';
COMMENT ON TABLE public.cart_events IS 'Tracks shopping cart interactions';
COMMENT ON TABLE public.orders IS 'Store and analytics orders, including Stripe checkout fields';
COMMENT ON TABLE public.order_items IS 'Line items for each order, including size and color for inventory';
COMMENT ON TABLE public.campaigns IS 'Marketing campaigns with cost and ROI tracking';
COMMENT ON TABLE public.conversion_funnel IS 'Pre-aggregated funnel metrics';
COMMENT ON TABLE public.product_variants IS 'Sellable variants and on-hand stock';
COMMENT ON TABLE public.inventory_movements IS 'Stock changes from sales, returns, and adjustments';
