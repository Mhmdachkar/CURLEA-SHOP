/**
 * Supabase Analytics Tables Utilities
 * Read analytics data from visits, page_views, events, cart_events, orders, and conversion_funnel
 */

import { supabase, Visit, PageView, Event, CartEvent, Order, ConversionFunnel } from '@/lib/supabase';

/**
 * Get recent visits (last N days)
 */
export async function getRecentVisits(days: number = 7): Promise<{
  data: Visit[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get page views for a specific date range
 */
export async function getPageViews(startDate: string, endDate: string): Promise<{
  data: PageView[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get events by category
 */
export async function getEventsByCategory(category: string, limit: number = 50): Promise<{
  data: Event[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_category', category)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get cart events for a session
 */
export async function getCartEventsBySession(sessionId: string): Promise<{
  data: CartEvent[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('cart_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get all cart events (recent)
 */
export async function getAllCartEvents(days: number = 7, limit: number = 100): Promise<{
  data: CartEvent[] | null;
  error: string | null;
}> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('cart_events')
      .select('*')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get all events (recent)
 */
export async function getAllEvents(days: number = 7, limit: number = 100): Promise<{
  data: Event[] | null;
  error: string | null;
}> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get abandoned carts
 */
export async function getAbandonedCarts(days: number = 7): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    // Use the abandoned_carts view
    const { data, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .gte('last_cart_activity', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('last_cart_activity', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get orders for date range (analytics orders table - NOT public.orders)
 */
export async function getOrders(startDate: string, endDate: string): Promise<{
  data: Order[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_id, session_id, visit_id, customer_email, customer_id, subtotal, discount_total, shipping_total, tax_total, total_value, total_cost, profit, currency, payment_method, shipping_method, source, utm_source, utm_medium, utm_campaign, discount_codes, items, status, fulfillment_status, created_at, updated_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(startDate: string, endDate: string): Promise<{
  data: ConversionFunnel[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('conversion_funnel')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('hour', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get daily overview stats (using view)
 */
export async function getDailyOverview(days: number = 30): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_overview')
      .select('*')
      .gte('date', startDate)
      .order('date', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get sales overview (using view)
 */
export async function getSalesOverview(days: number = 30): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('sales_overview')
      .select('*')
      .gte('date', startDate)
      .order('date', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get top products by revenue (using view)
 */
export async function getTopProductsByRevenue(limit: number = 10): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('top_products_by_revenue')
      .select('*')
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get traffic sources (using view)
 */
export async function getTrafficSources(): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('traffic_sources')
      .select('*')
      .order('visitors', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get real-time conversion funnel (using view)
 */
export async function getConversionFunnelRealtime(): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('conversion_funnel_realtime')
      .select('*')
      .limit(1);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

