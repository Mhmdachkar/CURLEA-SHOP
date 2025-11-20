import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Type definitions for database tables
export interface Visit {
  id: string;
  session_id: string;
  ip_address?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  region?: string;
  referrer?: string;
  landing_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  is_mobile: boolean;
  is_tablet: boolean;
  is_desktop: boolean;
  screen_width?: number;
  screen_height?: number;
  language?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface PageView {
  id: string;
  session_id: string;
  visit_id?: string;
  url: string;
  path?: string;
  title?: string;
  referrer?: string;
  scroll_depth: number;
  time_on_page: number;
  engaged: boolean;
  bounce: boolean;
  exit: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  session_id: string;
  visit_id?: string;
  event_name: string;
  event_category?: string;
  event_label?: string;
  event_value?: number;
  payload?: any;
  created_at: string;
}

export interface CartEvent {
  id: string;
  session_id: string;
  visit_id?: string;
  event_type: 'add' | 'remove' | 'update' | 'view' | 'checkout_start' | 'checkout_complete' | 'abandoned';
  product_id?: string;
  external_product_id?: string;
  product_title?: string;
  variant_id?: string;
  variant_title?: string;
  quantity: number;
  price?: number;
  total_value?: number;
  cart_total?: number;
  discount_code?: string;
  discount_amount?: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_id: string;
  session_id: string;
  visit_id?: string;
  customer_email?: string;
  customer_id?: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total_value: number;
  total_cost?: number;
  profit?: number;
  currency: string;
  payment_method?: string;
  shipping_method?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  discount_codes?: any;
  items?: any;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  fulfillment_status?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversionFunnel {
  id: string;
  date: string;
  hour?: number;
  total_visits: number;
  product_views: number;
  add_to_cart: number;
  checkout_start: number;
  checkout_complete: number;
  revenue: number;
  created_at: string;
  updated_at: string;
}

export interface StripeOrder {
  id: string;
  order_number: string;
  user_id?: string;
  total_amount: number;
  currency: string;
  status: string;
  customer_email?: string;
  is_guest?: boolean;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  billing_address?: any;
  shipping_address?: any;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  variant?: string;
  product_id?: string;
  size?: string;
  color?: string;
  sku?: string;
  variant_details?: any;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
  product_metadata?: any;
  created_at: string;
}
