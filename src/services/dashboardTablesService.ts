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
 * Fetch Orders Data from analytics orders table
 */
export async function fetchOrdersData(limit: number = 50): Promise<OrderRow[]> {
  try {
    const { start, end } = getDateRange(90); // Increased to 90 days to get more data
    
    // Fetch from analytics orders table (uses order_id, total_value, items JSONB)
    const { data: analyticsOrders, error: analyticsError } = await supabase
      .from('orders')
      .select('id, order_id, total_value, currency, status, customer_email, customer_id, payment_method, items, created_at')
      .eq('status', 'completed')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (analyticsError) {
      console.error('Error fetching orders from analytics orders table:', analyticsError);
      return [];
    }

    if (!analyticsOrders || analyticsOrders.length === 0) {
      console.log('No completed orders found in analytics orders table');
      return [];
    }

    const orders: OrderRow[] = analyticsOrders.map(order => {
      // Parse items from JSONB to count them
      const items = Array.isArray(order.items) ? order.items : [];
      const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
      return {
        id: order.id,
        order_id: order.order_id || order.id,
        order_number: order.order_id, // Use order_id as order_number for display
        customer_email: order.customer_email || null,
        customer_id: order.customer_id || null,
        total_amount: Number(order.total_value) || 0,
        total_value: Number(order.total_value) || 0,
        status: order.status || 'completed',
        payment_method: order.payment_method || 'unknown',
        items_count: itemsCount || 1,
        created_at: order.created_at,
        currency: order.currency || 'USD',
      };
    });

    console.log(`Successfully fetched ${orders.length} orders from analytics orders table`);
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Fetch Customers Data (aggregated from analytics orders table)
 */
export async function fetchCustomersData(limit: number = 50): Promise<CustomerRow[]> {
  try {
    const { start, end } = getDateRange(90); // Increased to 90 days to get more data
    
    // Get all completed orders from analytics orders table (uses total_value, not total_amount)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('customer_email, customer_id, total_value, created_at')
      .eq('status', 'completed')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`);

    if (error) {
      console.error('Error fetching orders for customers:', error);
      return [];
    }

    if (!orders || orders.length === 0) {
      console.log('No completed orders found for customer aggregation');
      return [];
    }

    // Aggregate customers from orders
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
      customer.total_spent += Number(order.total_value) || 0; // Use total_value, not total_amount
      
      if (new Date(order.created_at) < new Date(customer.first_order_date)) {
        customer.first_order_date = order.created_at;
      }
      if (new Date(order.created_at) > new Date(customer.last_order_date)) {
        customer.last_order_date = order.created_at;
      }
    });

    // Calculate AOV and convert to array
    const customers = Array.from(customerMap.values()).map(c => ({
      ...c,
      average_order_value: c.total_orders > 0 ? c.total_spent / c.total_orders : 0,
    }));

    console.log(`Successfully aggregated ${customers.length} customers from ${orders.length} orders`);

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
export async function fetchVisitedLinksData(limit: number = 50): Promise<VisitedLinkRow[]> {
  try {
    const { start, end } = getDateRange(30);
    
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
 * New Table Types
 */
export interface PageViewRow {
  id: string;
  session_id: string;
  url: string;
  path: string | null;
  title: string | null;
  referrer: string | null;
  scroll_depth: number;
  time_on_page: number;
  engaged: boolean;
  bounce: boolean;
  exit: boolean;
  created_at: string;
}

export interface VisitRow {
  id: string;
  session_id: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  landing_page: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  is_mobile: boolean;
  is_tablet: boolean;
  is_desktop: boolean;
  created_at: string;
}

export interface CartEventRow {
  id: string;
  session_id: string;
  event_type: string;
  product_title: string | null;
  quantity: number;
  price: number | null;
  cart_total: number | null;
  discount_code: string | null;
  created_at: string;
}

/**
 * Fetch Page Views Data
 */
export async function fetchPageViewsData(limit: number = 50): Promise<PageViewRow[]> {
  try {
    const { start, end } = getDateRange(90);
    
    const { data: pageViews, error } = await supabase
      .from('page_views')
      .select('id, session_id, url, path, title, referrer, scroll_depth, time_on_page, engaged, bounce, exit, created_at')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching page views:', error);
      return [];
    }

    console.log(`Successfully fetched ${pageViews?.length || 0} page views`);
    return pageViews || [];
  } catch (error) {
    console.error('Error fetching page views:', error);
    return [];
  }
}

/**
 * Fetch Visits Data (visitor sessions)
 */
export async function fetchVisitsData(limit: number = 50): Promise<VisitRow[]> {
  try {
    const { start, end } = getDateRange(90);
    
    const { data: visits, error } = await supabase
      .from('visits')
      .select('id, session_id, device, browser, os, country, city, referrer, landing_page, utm_source, utm_campaign, is_mobile, is_tablet, is_desktop, created_at')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching visits:', error);
      return [];
    }

    console.log(`Successfully fetched ${visits?.length || 0} visitor sessions`);
    return visits || [];
  } catch (error) {
    console.error('Error fetching visits:', error);
    return [];
  }
}

/**
 * Fetch Cart Events Data
 */
export async function fetchCartEventsData(limit: number = 50): Promise<CartEventRow[]> {
  try {
    const { start, end } = getDateRange(90);
    
    const { data: cartEvents, error } = await supabase
      .from('cart_events')
      .select('id, session_id, event_type, product_title, quantity, price, cart_total, discount_code, created_at')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching cart events:', error);
      return [];
    }

    console.log(`Successfully fetched ${cartEvents?.length || 0} cart events`);
    return cartEvents || [];
  } catch (error) {
    console.error('Error fetching cart events:', error);
    return [];
  }
}

