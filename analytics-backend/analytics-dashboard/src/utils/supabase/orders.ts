/**
 * Supabase Orders & Order Items Utilities
 * Manage Stripe orders and order items
 */

import { supabase, StripeOrder, OrderItem } from '@/lib/supabase';

/**
 * Get all Stripe orders
 */
export async function getStripeOrders(limit: number = 50): Promise<{
  data: StripeOrder[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
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
 * Get order by order number
 */
export async function getOrderByOrderNumber(orderNumber: string): Promise<{
  data: StripeOrder | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get order items for an order
 */
export async function getOrderItems(orderId: string): Promise<{
  data: OrderItem[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
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
 * Get order with items (joined query)
 */
export async function getOrderWithItems(orderNumber: string): Promise<{
  order: StripeOrder | null;
  items: OrderItem[];
  error: string | null;
}> {
  try {
    // Get order
    const orderResult = await getOrderByOrderNumber(orderNumber);
    if (orderResult.error || !orderResult.data) {
      return { order: null, items: [], error: orderResult.error };
    }

    // Get items
    const itemsResult = await getOrderItems(orderResult.data.id);
    if (itemsResult.error) {
      return { order: orderResult.data, items: [], error: itemsResult.error };
    }

    return {
      order: orderResult.data,
      items: itemsResult.data || [],
      error: null,
    };
  } catch (error: any) {
    return { order: null, items: [], error: error.message };
  }
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: string): Promise<{
  data: StripeOrder[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
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
 * Get orders by customer email
 */
export async function getOrdersByEmail(email: string): Promise<{
  data: StripeOrder[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

