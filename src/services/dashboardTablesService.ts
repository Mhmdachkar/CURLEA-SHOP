/**
 * Dashboard Tables Service
 * 
 * Fetches data for Orders, Customers, Visited Links, and Inventory tables
 */

import { supabase } from '@/lib/supabase';

export interface OrderRow {
  id: string;
  order_id: string;
  order_number?: string;
  customer_email: string | null;
  customer_id: string | null;
  total_amount: number;
  total_value: number;
  status: string;
  payment_method: string | null;
  items_count: number;
  created_at: string;
  currency: string;
}

export interface CustomerRow {
  customer_id: string;
  customer_email: string;
  total_orders: number;
  total_spent: number;
  first_order_date: string;
  last_order_date: string;
  average_order_value: number;
}

export interface VisitedLinkRow {
  url: string;
  page_title: string | null;
  referrer: string | null;
  visit_count: number;
  unique_visitors: number;
  avg_time_on_page: number;
  last_visited: string;
}

export interface InventoryRow {
  id: string;
  product_id: string;
  product_name: string | null;
  variant_name: string;
  size: string;
  color: string | null;
  sku: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  price: number | null;
  stock_status: 'out_of_stock' | 'low_stock' | 'moderate' | 'in_stock';
  sales_last_30_days: number;
  is_active: boolean;
}

export interface CartEventRow {
  id: string;
  session_id: string;
  visit_id: string | null;
  event_type: 'add' | 'remove' | 'update' | 'view' | 'checkout_start' | 'checkout_complete' | 'abandoned';
  product_id: string | null;
  external_product_id: string | null;
  product_title: string | null;
  variant_id: string | null;
  variant_title: string | null;
  variant_size: string | null;
  variant_color: string | null;
  variant_sku: string | null;
  variant_stock_quantity: number | null;
  variant_available_quantity: number | null;
  variant_price: number | null;
  quantity: number;
  price: number | null;
  total_value: number | null;
  cart_total: number | null;
  discount_code: string | null;
  discount_amount: number | null;
  created_at: string;
  // Aggregated stats
  view_count: number;
  add_to_cart_count: number;
  unique_sessions: number;
}

export interface VisitRow {
  id: string;
  session_id: string;
  ip_address: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  referrer: string | null;
  landing_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  is_mobile: boolean;
  is_tablet: boolean;
  is_desktop: boolean;
  screen_width: number | null;
  screen_height: number | null;
  language: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get date range for queries (default: last 30 days)
 */
function getDateRange(days: number = 30): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Fetch Orders Data
 */
export async function fetchOrdersData(limit: number = 50, days: number = 30): Promise<OrderRow[]> {
  try {
    const { start, end } = getDateRange(days);
    
    // Try to fetch from public.orders (Stripe orders) first
    const { data: stripeOrders, error: stripeError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, currency, status, customer_email, created_at')
      .eq('status', 'completed')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(limit);

    let orders: OrderRow[] = [];

    if (!stripeError && stripeOrders && stripeOrders.length > 0) {
      // Fetch order items count for each order
      const orderIds = stripeOrders.map(o => o.id);
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id')
        .in('order_id', orderIds);

      const itemsCountMap = new Map<string, number>();
      orderItems?.forEach(item => {
        itemsCountMap.set(item.order_id, (itemsCountMap.get(item.order_id) || 0) + 1);
      });

      orders = stripeOrders.map(order => ({
        id: order.id,
        order_id: order.order_number || order.id,
        order_number: order.order_number,
        customer_email: order.customer_email || null,
        customer_id: null,
        total_amount: Number(order.total_amount) || 0,
        total_value: Number(order.total_amount) || 0,
        status: order.status || 'completed',
        payment_method: 'stripe',
        items_count: itemsCountMap.get(order.id) || 0,
        created_at: order.created_at,
        currency: order.currency || 'USD',
      }));
    } else {
      // Fallback: Try analytics orders table
      const { data: analyticsOrders, error: analyticsError } = await supabase
        .from('orders')
        .select('id, order_id, total_value, currency, status, customer_email, customer_id, payment_method, items, created_at')
        .eq('status', 'completed')
        .gte('created_at', `${start}T00:00:00`)
        .lte('created_at', `${end}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!analyticsError && analyticsOrders) {
        orders = analyticsOrders.map(order => {
          const items = Array.isArray(order.items) ? order.items : [];
          return {
            id: order.id,
            order_id: order.order_id || order.id,
            order_number: undefined,
            customer_email: order.customer_email || null,
            customer_id: order.customer_id || null,
            total_amount: Number(order.total_value) || 0,
            total_value: Number(order.total_value) || 0,
            status: order.status || 'completed',
            payment_method: order.payment_method || null,
            items_count: items.length,
            created_at: order.created_at,
            currency: order.currency || 'USD',
          };
        });
      }
    }

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Fetch Customers Data (aggregated from orders)
 */
export async function fetchCustomersData(limit: number = 50, days: number = 30): Promise<CustomerRow[]> {
  try {
    const { start, end } = getDateRange(days);
    
    // Get all completed orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('customer_email, customer_id, total_value, created_at')
      .eq('status', 'completed')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`);

    if (error || !orders) {
      // Try public.orders as fallback
      const { data: stripeOrders, error: stripeError } = await supabase
        .from('orders')
        .select('customer_email, total_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', `${start}T00:00:00`)
        .lte('created_at', `${end}T23:59:59`);

      if (stripeError || !stripeOrders) return [];

      // Aggregate customers from Stripe orders
      const customerMap = new Map<string, CustomerRow>();
      
      stripeOrders.forEach(order => {
        const email = order.customer_email || 'guest';
        const customerId = email;
        
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            customer_id: customerId,
            customer_email: email,
            total_orders: 0,
            total_spent: 0,
            first_order_date: order.created_at,
            last_order_date: order.created_at,
            average_order_value: 0,
          });
        }
        
        const customer = customerMap.get(customerId)!;
        customer.total_orders += 1;
        customer.total_spent += Number(order.total_amount) || 0;
        
        if (new Date(order.created_at) < new Date(customer.first_order_date)) {
          customer.first_order_date = order.created_at;
        }
        if (new Date(order.created_at) > new Date(customer.last_order_date)) {
          customer.last_order_date = order.created_at;
        }
      });

      // Calculate AOV
      const customers = Array.from(customerMap.values()).map(c => ({
        ...c,
        average_order_value: c.total_orders > 0 ? c.total_spent / c.total_orders : 0,
      }));

      return customers
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, limit);
    }

    // Aggregate customers from analytics orders
    const customerMap = new Map<string, CustomerRow>();
    
    orders.forEach(order => {
      const email = order.customer_email || 'guest';
      const customerId = order.customer_id || email;
      
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customer_id: customerId,
          customer_email: email,
          total_orders: 0,
          total_spent: 0,
          first_order_date: order.created_at,
          last_order_date: order.created_at,
          average_order_value: 0,
        });
      }
      
      const customer = customerMap.get(customerId)!;
      customer.total_orders += 1;
      customer.total_spent += Number(order.total_value) || 0;
      
      if (new Date(order.created_at) < new Date(customer.first_order_date)) {
        customer.first_order_date = order.created_at;
      }
      if (new Date(order.created_at) > new Date(customer.last_order_date)) {
        customer.last_order_date = order.created_at;
      }
    });

    // Calculate AOV
    const customers = Array.from(customerMap.values()).map(c => ({
      ...c,
      average_order_value: c.total_orders > 0 ? c.total_spent / c.total_orders : 0,
    }));

    return customers
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

/**
 * Fetch Visited Links Data (from page_views)
 * Shows pages visited and where visitors came from (referrer)
 */
export async function fetchVisitedLinksData(limit: number = 50, days: number = 30): Promise<VisitedLinkRow[]> {
  try {
    const { start, end } = getDateRange(days);
    
    // Query page_views with referrer information
    // Note: page_views table has 'title' column, not 'page_title'
    const { data: pageViews, error } = await supabase
      .from('page_views')
      .select('url, title, referrer, session_id, time_on_page, created_at')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching page views:', error);
      return [];
    }

    if (!pageViews || pageViews.length === 0) {
      console.log('No page views found in database');
      return [];
    }

    // Aggregate by URL
    const urlMap = new Map<string, {
      url: string;
      page_title: string | null;
      referrers: Set<string>;
      visit_count: number;
      unique_visitors: Set<string>;
      total_time: number;
      time_count: number;
      last_visited: string;
    }>();

    pageViews.forEach(view => {
      const url = view.url || '/';
      if (!urlMap.has(url)) {
        urlMap.set(url, {
          url,
          page_title: view.title || null, // Use 'title' from page_views table
          referrers: new Set(),
          visit_count: 0,
          unique_visitors: new Set(),
          total_time: 0,
          time_count: 0,
          last_visited: view.created_at,
        });
      }

      const entry = urlMap.get(url)!;
      entry.visit_count += 1;
      entry.unique_visitors.add(view.session_id);
      
      // Track referrers (where visitors came from)
      if (view.referrer && view.referrer.trim() !== '') {
        entry.referrers.add(view.referrer);
      }
      
      if (view.time_on_page) {
        entry.total_time += view.time_on_page;
        entry.time_count += 1;
      }
      
      if (new Date(view.created_at) > new Date(entry.last_visited)) {
        entry.last_visited = view.created_at;
      }
    });

    // Convert to array and calculate averages
    const links = Array.from(urlMap.values()).map(entry => {
      // Get the most common referrer for this URL
      const referrerArray = Array.from(entry.referrers);
      const mostCommonReferrer = referrerArray.length > 0 
        ? referrerArray[0] // For now, just take the first one. Could implement frequency counting if needed
        : null;

      return {
        url: entry.url,
        page_title: entry.page_title,
        referrer: mostCommonReferrer,
        visit_count: entry.visit_count,
        unique_visitors: entry.unique_visitors.size,
        avg_time_on_page: entry.time_count > 0 ? entry.total_time / entry.time_count : 0,
        last_visited: entry.last_visited,
      };
    });

    return links
      .sort((a, b) => b.visit_count - a.visit_count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching visited links:', error);
    return [];
  }
}

/**
 * Fetch Inventory Data (from inventory_dashboard table)
 * This table contains aggregated inventory data with product names, stock status, and sales info
 */
export async function fetchInventoryData(): Promise<InventoryRow[]> {
  try {
    // Fetch from inventory_dashboard view/table
    const { data: inventoryData, error } = await supabase
      .from('inventory_dashboard')
      .select('*')
      .order('available_quantity', { ascending: true });

    if (error) {
      console.error('Error fetching inventory_dashboard:', error);
      return [];
    }

    if (!inventoryData || inventoryData.length === 0) {
      console.log('No inventory data found in inventory_dashboard');
      return [];
    }

    // Map inventory_dashboard data to InventoryRow format
    const inventory = inventoryData.map((item: any) => ({
      id: item.id || '',
      product_id: item.product_id || '',
      product_name: item.product_name || null,
      variant_name: item.variant_name || 'Standard',
      size: item.size || 'Standard',
      color: item.color || null,
      sku: item.sku || null,
      stock_quantity: Number(item.stock_quantity) || 0,
      reserved_quantity: Number(item.reserved_quantity) || 0,
      available_quantity: Number(item.available_quantity) || 0,
      price: item.price ? Number(item.price) : null,
      stock_status: item.stock_status || (item.available_quantity === 0 ? 'out_of_stock' : item.available_quantity < 10 ? 'low_stock' : 'in_stock'),
      sales_last_30_days: Number(item.sales_last_30_days) || 0,
      is_active: item.is_active !== false,
    }));

    // Sort by available quantity (lowest first - to show low stock items first)
    return inventory.sort((a, b) => a.available_quantity - b.available_quantity);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
}

/**
 * Fetch Cart Events Data (from cart_events and product_variants tables)
 * Shows products with most views, clicks, and cart interactions
 */
export async function fetchCartEventsData(limit: number = 50, days: number = 30): Promise<CartEventRow[]> {
  try {
    const { start, end } = getDateRange(days);
    
    // Fetch cart events with all columns
    const { data: cartEvents, error: cartEventsError } = await supabase
      .from('cart_events')
      .select('*')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`)
      .order('created_at', { ascending: false });

    if (cartEventsError) {
      console.error('Error fetching cart events:', cartEventsError);
      return [];
    }

    if (!cartEvents || cartEvents.length === 0) {
      console.log('No cart events found in database');
      return [];
    }

    // Get unique variant IDs to fetch variant details
    const variantIds = [...new Set(cartEvents
      .map(ce => ce.variant_id)
      .filter((id): id is string => id !== null && id !== undefined)
    )];

    // Fetch product variants data
    let variantMap = new Map<string, any>();
    if (variantIds.length > 0) {
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .in('id', variantIds);

      if (!variantsError && variants) {
        variants.forEach(variant => {
          variantMap.set(variant.id, variant);
        });
      }
    }

    // Aggregate cart events by product/variant
    const productMap = new Map<string, {
      product_id: string | null;
      external_product_id: string | null;
      product_title: string | null;
      variant_id: string | null;
      variant_title: string | null;
      variant_size: string | null;
      variant_color: string | null;
      variant_sku: string | null;
      variant_stock_quantity: number | null;
      variant_available_quantity: number | null;
      variant_price: number | null;
      view_count: number;
      add_to_cart_count: number;
      unique_sessions: Set<string>;
      last_event_at: string;
      total_value: number;
    }>();

    cartEvents.forEach(event => {
      const key = event.variant_id || event.external_product_id || event.product_id || 'unknown';
      
      if (!productMap.has(key)) {
        const variant = event.variant_id ? variantMap.get(event.variant_id) : null;
        
        productMap.set(key, {
          product_id: event.product_id || null,
          external_product_id: event.external_product_id || null,
          product_title: event.product_title || null,
          variant_id: event.variant_id || null,
          variant_title: event.variant_title || null,
          variant_size: variant?.size || null,
          variant_color: variant?.color || null,
          variant_sku: variant?.sku || null,
          variant_stock_quantity: variant?.stock_quantity || null,
          variant_available_quantity: variant?.available_quantity || null,
          variant_price: variant?.price || event.price || null,
          view_count: 0,
          add_to_cart_count: 0,
          unique_sessions: new Set(),
          last_event_at: event.created_at,
          total_value: 0,
        });
      }

      const entry = productMap.get(key)!;
      entry.unique_sessions.add(event.session_id);

      // Count views
      if (event.event_type === 'view') {
        entry.view_count += 1;
      }

      // Count add to cart
      if (event.event_type === 'add') {
        entry.add_to_cart_count += 1;
        entry.total_value += (event.total_value || event.price || 0) * (event.quantity || 1);
      }

      // Update last event time
      if (new Date(event.created_at) > new Date(entry.last_event_at)) {
        entry.last_event_at = event.created_at;
      }
    });

    // Convert to array and create CartEventRow objects
    const cartEventRows: CartEventRow[] = Array.from(productMap.values()).map((entry, index) => {
      // Get the most recent event for this product/variant for full details
      const recentEvent = cartEvents.find(ce => 
        (ce.variant_id && ce.variant_id === entry.variant_id) ||
        (ce.external_product_id && ce.external_product_id === entry.external_product_id) ||
        (ce.product_id && ce.product_id === entry.product_id)
      );

      return {
        id: entry.variant_id || entry.external_product_id || entry.product_id || `event-${index}`,
        session_id: recentEvent?.session_id || '',
        visit_id: recentEvent?.visit_id || null,
        event_type: recentEvent?.event_type || 'view',
        product_id: entry.product_id,
        external_product_id: entry.external_product_id,
        product_title: entry.product_title,
        variant_id: entry.variant_id,
        variant_title: entry.variant_title,
        variant_size: entry.variant_size,
        variant_color: entry.variant_color,
        variant_sku: entry.variant_sku,
        variant_stock_quantity: entry.variant_stock_quantity,
        variant_available_quantity: entry.variant_available_quantity,
        variant_price: entry.variant_price,
        quantity: recentEvent?.quantity || 1,
        price: entry.variant_price || recentEvent?.price || null,
        total_value: entry.total_value || recentEvent?.total_value || null,
        cart_total: recentEvent?.cart_total || null,
        discount_code: recentEvent?.discount_code || null,
        discount_amount: recentEvent?.discount_amount || null,
        created_at: entry.last_event_at,
        view_count: entry.view_count,
        add_to_cart_count: entry.add_to_cart_count,
        unique_sessions: entry.unique_sessions.size,
      };
    });

    // Sort by view count (most viewed first), then by add to cart count
    return cartEventRows
      .sort((a, b) => {
        if (b.view_count !== a.view_count) {
          return b.view_count - a.view_count;
        }
        return b.add_to_cart_count - a.add_to_cart_count;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching cart events:', error);
    return [];
  }
}

/**
 * Fetch Visits Data (from visits table)
 * Shows all visitor information including device, location, and UTM parameters
 */
export async function fetchVisitsData(limit: number = 50, days: number = 30): Promise<VisitRow[]> {
  try {
    const { start, end } = getDateRange(days);
    
    // Fetch all visits with all columns
    const { data: visits, error } = await supabase
      .from('visits')
      .select('*')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching visits:', error);
      return [];
    }

    if (!visits || visits.length === 0) {
      console.log('No visits found in database');
      return [];
    }

    // Map visits data to VisitRow format
    const visitRows: VisitRow[] = visits.map((visit: any) => ({
      id: visit.id || '',
      session_id: visit.session_id || '',
      ip_address: visit.ip_address || null,
      device: visit.device || null,
      browser: visit.browser || null,
      os: visit.os || null,
      country: visit.country || null,
      city: visit.city || null,
      region: visit.region || null,
      referrer: visit.referrer || null,
      landing_page: visit.landing_page || null,
      utm_source: visit.utm_source || null,
      utm_medium: visit.utm_medium || null,
      utm_campaign: visit.utm_campaign || null,
      utm_term: visit.utm_term || null,
      utm_content: visit.utm_content || null,
      is_mobile: visit.is_mobile || false,
      is_tablet: visit.is_tablet || false,
      is_desktop: visit.is_desktop !== false, // Default to true if not set
      screen_width: visit.screen_width || null,
      screen_height: visit.screen_height || null,
      language: visit.language || null,
      timezone: visit.timezone || null,
      created_at: visit.created_at || '',
      updated_at: visit.updated_at || visit.created_at || '',
    }));

    return visitRows;
  } catch (error) {
    console.error('Error fetching visits:', error);
    return [];
  }
}

