-- =====================================================
-- COMPLETE SUPABASE SCHEMA FOR CURLEA
-- Run this entire file in Supabase SQL Editor
-- This combines schema.sql + orders-schema.sql for convenience
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- MAIN ANALYTICS SCHEMA (from schema.sql)
-- =====================================================

-- 1. VISITS TABLE
CREATE TABLE IF NOT EXISTS visits (
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

CREATE INDEX IF NOT EXISTS idx_visits_session_id ON visits(session_id);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_country ON visits(country);
CREATE INDEX IF NOT EXISTS idx_visits_utm_source ON visits(utm_source);
CREATE INDEX IF NOT EXISTS idx_visits_utm_campaign ON visits(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_visits_referrer ON visits(referrer);
CREATE INDEX IF NOT EXISTS idx_visits_device ON visits(device);

-- 2. PAGE VIEWS TABLE
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visit_id ON page_views(visit_id);
CREATE INDEX IF NOT EXISTS idx_page_views_url ON page_views(url);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);

-- 3. CUSTOM EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_category TEXT,
    event_label TEXT,
    event_value NUMERIC,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_visit_id ON events(visit_id);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_event_category ON events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_payload ON events USING GIN(payload);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
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

CREATE INDEX IF NOT EXISTS idx_products_product_id ON products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 5. CART EVENTS TABLE
CREATE TABLE IF NOT EXISTS cart_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('add', 'remove', 'update', 'view', 'checkout_start', 'checkout_complete', 'abandoned')),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_cart_events_session_id ON cart_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_visit_id ON cart_events(visit_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_event_type ON cart_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cart_events_product_id ON cart_events(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_created_at ON cart_events(created_at DESC);

-- 6. ORDERS TABLE (Analytics)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT UNIQUE NOT NULL,
    session_id TEXT NOT NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    customer_email TEXT,
    customer_id TEXT,
    subtotal NUMERIC(10,2) NOT NULL,
    discount_total NUMERIC(10,2) DEFAULT 0,
    shipping_total NUMERIC(10,2) DEFAULT 0,
    tax_total NUMERIC(10,2) DEFAULT 0,
    total_value NUMERIC(10,2) NOT NULL,
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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    fulfillment_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_visit_id ON orders(visit_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source);
CREATE INDEX IF NOT EXISTS idx_orders_utm_campaign ON orders(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 7. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS campaigns (
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

CREATE INDEX IF NOT EXISTS idx_campaigns_utm_campaign ON campaigns(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- 8. CONVERSION FUNNEL TABLE
CREATE TABLE IF NOT EXISTS conversion_funnel (
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

CREATE INDEX IF NOT EXISTS idx_conversion_funnel_date ON conversion_funnel(date DESC);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_date_hour ON conversion_funnel(date DESC, hour DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversion_funnel_unique ON conversion_funnel(date, COALESCE(hour, -1));

-- =====================================================
-- STRIPE ORDERS SCHEMA (from orders-schema.sql)
-- =====================================================

-- STRIPE ORDERS TABLE (public.orders - different from analytics orders above)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  customer_email TEXT,
  is_guest BOOLEAN DEFAULT false,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  variant TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  product_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for public tracking endpoint)
CREATE POLICY IF NOT EXISTS "Allow public insert on visits" ON visits FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow public insert on page_views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow public insert on events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow public insert on cart_events" ON cart_events FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);

-- Policy: Allow service role to read all data (for dashboard)
CREATE POLICY IF NOT EXISTS "Allow service role read on visits" ON visits FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role read on page_views" ON page_views FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role read on events" ON events FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role read on products" ON products FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role read on cart_events" ON cart_events FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role read on orders" ON orders FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role read on campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role read on conversion_funnel" ON conversion_funnel FOR SELECT USING (true);

-- Products: Allow public read for active products
CREATE POLICY IF NOT EXISTS "Allow public read active products" ON products FOR SELECT USING (is_active = true);

-- Stripe Orders: Users can view their own orders
CREATE POLICY IF NOT EXISTS "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_visits_updated_at ON visits;
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversion_funnel_updated_at ON conversion_funnel;
CREATE TRIGGER update_conversion_funnel_updated_at BEFORE UPDATE ON conversion_funnel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
-- COMMENTS
-- =====================================================

COMMENT ON TABLE visits IS 'Tracks unique visitor sessions with device and location information';
COMMENT ON TABLE page_views IS 'Records every page view with engagement metrics like scroll depth and time on page';
COMMENT ON TABLE events IS 'Stores custom user interaction events with flexible JSONB payload';
COMMENT ON TABLE products IS 'Product catalog with pricing and inventory data';
COMMENT ON TABLE cart_events IS 'Tracks all shopping cart interactions including adds, removes, and checkouts';
COMMENT ON TABLE orders IS 'Completed purchases with full revenue and profit tracking';
COMMENT ON TABLE campaigns IS 'Marketing campaigns with cost and ROI tracking';
COMMENT ON TABLE conversion_funnel IS 'Pre-aggregated funnel metrics for performance optimization';
COMMENT ON TABLE public.orders IS 'Stores customer orders from Stripe checkout';
COMMENT ON TABLE public.order_items IS 'Stores individual items within each order';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ All tables, views, functions, and policies have been created successfully!';
    RAISE NOTICE '✅ Your Supabase database is now ready for CURLEA analytics.';
END $$;

