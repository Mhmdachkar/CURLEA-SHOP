/**
 * Sales Analytics Types
 * Comprehensive types for sales tracking and analysis
 */

export interface SalesAnalyticsRow {
  id: string;
  
  // Order Information
  order_id: string | null;
  order_date: string; // Date string
  order_timestamp: string;
  
  // Product Information
  product_name: string;
  product_display_name: string;
  product_category: string | null;
  color: string | null;
  size: string | null;
  
  // Quantity & Pricing
  quantity_sold: number;
  unit_price: number;
  
  // Revenue Calculations
  subtotal: number;
  delivery_fee: number;
  total_revenue: number;
  
  // Cost & Profit Calculations
  cost_per_unit: number;
  total_cogs: number; // Cost of Goods Sold
  gross_profit: number;
  net_profit: number;
  profit_margin: number | null;
  
  // Payment Information
  payment_method: string;
  payment_status: string;
  
  // Customer Information
  customer_email: string | null;
  customer_id: string | null;
  
  // Metadata
  source: string;
  notes: string | null;
  csv_key: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface SalesSummary {
  day: string;
  week: string;
  month: string;
  total_orders: number;
  total_units_sold: number;
  total_subtotal: number;
  total_delivery_fees: number;
  total_revenue: number;
  total_cogs: number;
  total_gross_profit: number;
  total_net_profit: number;
  avg_profit_margin: number;
  product_display_name: string;
  product_category: string | null;
}

export interface ProductPerformance {
  product_display_name: string;
  product_category: string | null;
  times_sold: number;
  total_units: number;
  total_revenue_excl_delivery: number;
  total_revenue_incl_delivery: number;
  total_costs: number;
  total_profit: number;
  avg_selling_price: number;
  avg_profit_margin: number;
  first_sale_date: string;
  last_sale_date: string;
}

export interface CustomerPurchaseAnalytics {
  customer_email: string;
  customer_id: string | null;
  total_orders: number;
  total_items_purchased: number;
  lifetime_value: number;
  total_profit_generated: number;
  avg_order_value: number;
  first_purchase_date: string;
  last_purchase_date: string;
  customer_lifetime_days: number;
}

export interface SalesMetrics {
  // Revenue Metrics
  total_revenue: number;
  total_revenue_excl_delivery: number;
  total_delivery_fees: number;
  
  // Cost & Profit Metrics
  total_cogs: number;
  gross_profit: number;
  net_profit: number;
  avg_profit_margin: number;
  
  // Sales Volume
  total_orders: number;
  total_units_sold: number;
  avg_order_value: number;
  avg_units_per_order: number;
  
  // Trends (compared to previous period)
  revenue_growth: number;
  profit_growth: number;
  order_growth: number;
}

export interface TopProduct {
  product_display_name: string;
  product_category: string | null;
  total_units: number;
  total_revenue: number;
  total_profit: number;
  profit_margin: number;
}

export interface ProductNameMapping {
  id: string;
  csv_name: string;
  website_name: string;
  product_category: string | null;
  created_at: string;
}


