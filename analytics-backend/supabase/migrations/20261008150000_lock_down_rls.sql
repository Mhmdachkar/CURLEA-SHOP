-- Close public access to orders, customers, analytics, and stock writes.
-- The storefront now reads stock and writes orders through Netlify functions
-- using the service role key, which bypasses row level security.

DROP POLICY IF EXISTS "Allow public read on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public insert on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public read on visits" ON public.visits;
DROP POLICY IF EXISTS "Allow public insert on visits" ON public.visits;
DROP POLICY IF EXISTS "Allow public read on page_views" ON public.page_views;
DROP POLICY IF EXISTS "Allow public insert on page_views" ON public.page_views;
DROP POLICY IF EXISTS "Allow public read on events" ON public.events;
DROP POLICY IF EXISTS "Allow public insert on events" ON public.events;
DROP POLICY IF EXISTS "Allow public read on cart_events" ON public.cart_events;
DROP POLICY IF EXISTS "Allow public insert on cart_events" ON public.cart_events;
DROP POLICY IF EXISTS "Allow public read on campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Allow public read on conversion_funnel" ON public.conversion_funnel;
DROP POLICY IF EXISTS "Allow public update on product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow public read on product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow public insert on inventory_movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Allow public read on inventory_movements" ON public.inventory_movements;

CREATE POLICY "Allow public read of active variants"
  ON public.product_variants
  FOR SELECT
  USING (is_active = true);

REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.visits FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.page_views FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.events FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.cart_events FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.campaigns FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.conversion_funnel FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.product_variants FROM anon;
REVOKE ALL ON public.inventory_movements FROM anon;
REVOKE SELECT ON public.orders, public.order_items, public.visits, public.page_views, public.events, public.cart_events, public.campaigns, public.conversion_funnel FROM anon;

REVOKE SELECT ON public.daily_overview, public.sales_overview, public.top_products_by_revenue, public.traffic_sources, public.conversion_funnel_realtime, public.abandoned_carts, public.campaign_performance, public.traffic_by_source, public.top_products_summary, public.conversion_funnel_summary, public.hourly_performance, public.total_sales_summary, public.aov_summary, public.inventory_dashboard, public.low_stock_alerts FROM anon;

