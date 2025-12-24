/**
 * Sales Analytics Service
 * Handles fetching and processing sales analytics data from Supabase
 */

import { supabase } from '../lib/supabase';
import type {
  SalesAnalyticsRow,
  SalesSummary,
  ProductPerformance,
  CustomerPurchaseAnalytics,
  SalesMetrics,
  TopProduct,
} from '../types/salesAnalytics';

/**
 * Minimum date for sales analytics - only show data from November 1, 2025 onwards
 */
const MIN_SALES_DATE = '2025-11-01';

/**
 * Get date range for queries
 * Only shows data from November 1, 2025 onwards (recent orders only)
 */
function getDateRange(days: number = 30): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  
  // Minimum date: November 1, 2025 (only show recent orders)
  const minDate = new Date(MIN_SALES_DATE);
  const actualStart = start < minDate ? minDate : start;
  
  return {
    start: actualStart.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Fetch sales analytics data
 */
export async function fetchSalesAnalytics(
  days: number = 30,
  limit: number = 100
): Promise<SalesAnalyticsRow[]> {
  try {
    const { start, end } = getDateRange(days);
    
    console.log('[Sales Analytics] Fetching data:', { start, end, days });
    
    const { data, error } = await supabase
      .from('sales_analytics')
      .select('*')
      .gte('order_date', MIN_SALES_DATE) // Only November 2025 onwards
      .gte('order_date', start)  // And within selected date range
      .lte('order_date', end)
      .eq('payment_status', 'completed')
      .order('order_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[Sales Analytics] Error fetching sales analytics:', error);
      console.error('[Sales Analytics] Error details:', JSON.stringify(error, null, 2));
      return [];
    }
    
    console.log('[Sales Analytics] Fetched records for date range:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('[Sales Analytics] First record:', data[0]);
    }
    
    return data || [];
  } catch (error) {
    console.error('[Sales Analytics] Exception in fetchSalesAnalytics:', error);
    return [];
  }
}

/**
 * Fetch sales summary (aggregated by time period)
 */
export async function fetchSalesSummary(days: number = 30): Promise<SalesSummary[]> {
  try {
    const { start, end } = getDateRange(days);
    
    const { data, error } = await supabase
      .from('sales_summary')
      .select('*')
      .gte('day', start)
      .lte('day', end)
      .order('day', { ascending: false });
    
    if (error) {
      console.error('Error fetching sales summary:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchSalesSummary:', error);
    return [];
  }
}

/**
 * Fetch product performance data
 */
export async function fetchProductPerformance(limit: number = 20): Promise<ProductPerformance[]> {
  try {
    const { data, error } = await supabase
      .from('product_performance')
      .select('*')
      .order('total_profit', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching product performance:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchProductPerformance:', error);
    return [];
  }
}

/**
 * Fetch customer purchase analytics
 */
export async function fetchCustomerAnalytics(limit: number = 50): Promise<CustomerPurchaseAnalytics[]> {
  try {
    const { data, error } = await supabase
      .from('customer_purchase_analytics')
      .select('*')
      .order('lifetime_value', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching customer analytics:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchCustomerAnalytics:', error);
    return [];
  }
}

/**
 * Calculate comprehensive sales metrics
 */
export async function calculateSalesMetrics(days: number = 30): Promise<SalesMetrics> {
  try {
    const { start, end } = getDateRange(days);
    
    console.log('[Sales Metrics] Calculating metrics for:', { start, end, days });
    
    // Fetch current period data - NO LIMIT to get all records
    const { data: currentData, error: currentError } = await supabase
      .from('sales_analytics')
      .select('*')
      .gte('order_date', MIN_SALES_DATE) // Only November 2025 onwards
      .gte('order_date', start)   // And within selected date range
      .lte('order_date', end)
      .eq('payment_status', 'completed')
      .order('order_date', { ascending: false });
    
    if (currentError) {
      console.error('[Sales Metrics] Error fetching current sales data:', currentError);
      console.error('[Sales Metrics] Error details:', JSON.stringify(currentError, null, 2));
      return getEmptyMetrics();
    }
    
    if (!currentData || currentData.length === 0) {
      console.warn('[Sales Metrics] No data found for date range:', { start, end });
      return getEmptyMetrics();
    }
    
    console.log('[Sales Metrics] Processing', currentData.length, 'records');
    
    // Calculate previous period for comparison
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days);
    
    // Only compare with data from November 1, 2025 onwards
    const prevStartDate = prevStart < new Date(MIN_SALES_DATE) ? MIN_SALES_DATE : prevStart.toISOString().split('T')[0];
    
    const { data: prevData, error: prevError } = await supabase
      .from('sales_analytics')
      .select('*')
      .gte('order_date', MIN_SALES_DATE) // Only November 2025 onwards
      .gte('order_date', prevStartDate)
      .lte('order_date', prevEnd.toISOString().split('T')[0])
      .eq('payment_status', 'completed');
    
    // Calculate current period metrics
    const totalRevenue = currentData.reduce((sum, row) => sum + Number(row.total_revenue), 0);
    const totalRevenueExclDelivery = currentData.reduce((sum, row) => sum + Number(row.subtotal), 0);
    const totalDeliveryFees = currentData.reduce((sum, row) => sum + Number(row.delivery_fee), 0);
    const totalCogs = currentData.reduce((sum, row) => sum + Number(row.total_cogs), 0);
    const grossProfit = currentData.reduce((sum, row) => sum + Number(row.gross_profit), 0);
    const netProfit = currentData.reduce((sum, row) => sum + Number(row.net_profit), 0);
    const totalUnitsSold = currentData.reduce((sum, row) => sum + Number(row.quantity_sold), 0);
    
    // Count unique orders
    // If order_id exists, count unique order_ids
    // Otherwise, count unique combinations of order_date + customer_email (or just count records)
    const orderIds = currentData.map(row => row.order_id).filter(Boolean);
    const uniqueOrders = orderIds.length > 0 ? new Set(orderIds).size : 0;
    
    // If we have order_ids, use them. Otherwise, try to count by date+customer, or fall back to total records
    let totalOrders = uniqueOrders;
    if (totalOrders === 0) {
      // Try to count by unique date+customer combinations
      const dateCustomerCombos = currentData.map(row => 
        `${row.order_date}_${row.customer_email || 'guest'}`
      );
      const uniqueCombos = new Set(dateCustomerCombos).size;
      totalOrders = uniqueCombos > 0 ? uniqueCombos : currentData.length;
    }
    
    console.log('[Sales Metrics] Order counting:', {
      totalRecords: currentData.length,
      uniqueOrderIds: uniqueOrders,
      finalOrderCount: totalOrders
    });
    
    const avgProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgUnitsPerOrder = totalOrders > 0 ? totalUnitsSold / totalOrders : 0;
    
    // Calculate previous period metrics for growth
    const prevRevenue = prevData ? prevData.reduce((sum, row) => sum + Number(row.total_revenue), 0) : 0;
    const prevProfit = prevData ? prevData.reduce((sum, row) => sum + Number(row.net_profit), 0) : 0;
    const prevOrders = prevData ? new Set(prevData.map(row => row.order_id).filter(Boolean)).size : 0;
    
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const profitGrowth = prevProfit > 0 ? ((netProfit - prevProfit) / prevProfit) * 100 : 0;
    const orderGrowth = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;
    
    return {
      total_revenue: totalRevenue,
      total_revenue_excl_delivery: totalRevenueExclDelivery,
      total_delivery_fees: totalDeliveryFees,
      total_cogs: totalCogs,
      gross_profit: grossProfit,
      net_profit: netProfit,
      avg_profit_margin: avgProfitMargin,
      total_orders: totalOrders,
      total_units_sold: totalUnitsSold,
      avg_order_value: avgOrderValue,
      avg_units_per_order: avgUnitsPerOrder,
      revenue_growth: revenueGrowth,
      profit_growth: profitGrowth,
      order_growth: orderGrowth,
    };
  } catch (error) {
    console.error('Error calculating sales metrics:', error);
    return getEmptyMetrics();
  }
}

/**
 * Fetch top products by revenue or profit
 */
export async function fetchTopProducts(
  days: number = 30,
  limit: number = 10,
  sortBy: 'revenue' | 'profit' | 'units' = 'revenue'
): Promise<TopProduct[]> {
  try {
    const { start, end } = getDateRange(days);
    
    console.log('[Top Products] Fetching for:', { start, end, sortBy });
    
    // Fetch ALL records - NO LIMIT to get all 18 orders
    const { data, error } = await supabase
      .from('sales_analytics')
      .select('*')
      .gte('order_date', MIN_SALES_DATE) // Only November 2025 onwards
      .gte('order_date', start)   // And within selected date range
      .lte('order_date', end)
      .eq('payment_status', 'completed')
      .order('order_date', { ascending: false });
    
    if (error) {
      console.error('[Top Products] Error fetching top products:', error);
      console.error('[Top Products] Error details:', JSON.stringify(error, null, 2));
      return [];
    }
    
    if (!data || data.length === 0) {
      console.warn('[Top Products] No data found');
      return [];
    }
    
    console.log('[Top Products] Processing', data.length, 'records');
    
    // Aggregate by product
    const productMap = new Map<string, TopProduct>();
    
    data.forEach(row => {
      const key = row.product_display_name;
      
      if (!productMap.has(key)) {
        productMap.set(key, {
          product_display_name: row.product_display_name,
          product_category: row.product_category,
          total_units: 0,
          total_revenue: 0,
          total_profit: 0,
          profit_margin: 0,
        });
      }
      
      const product = productMap.get(key)!;
      product.total_units += Number(row.quantity_sold);
      product.total_revenue += Number(row.total_revenue);
      product.total_profit += Number(row.net_profit);
    });
    
    // Calculate profit margins
    const products = Array.from(productMap.values()).map(p => ({
      ...p,
      profit_margin: p.total_revenue > 0 ? (p.total_profit / p.total_revenue) * 100 : 0,
    }));
    
    // Sort based on criteria
    products.sort((a, b) => {
      if (sortBy === 'revenue') return b.total_revenue - a.total_revenue;
      if (sortBy === 'profit') return b.total_profit - a.total_profit;
      return b.total_units - a.total_units;
    });
    
    return products.slice(0, limit);
  } catch (error) {
    console.error('Error in fetchTopProducts:', error);
    return [];
  }
}

/**
 * Helper function to return empty metrics
 */
function getEmptyMetrics(): SalesMetrics {
  return {
    total_revenue: 0,
    total_revenue_excl_delivery: 0,
    total_delivery_fees: 0,
    total_cogs: 0,
    gross_profit: 0,
    net_profit: 0,
    avg_profit_margin: 0,
    total_orders: 0,
    total_units_sold: 0,
    avg_order_value: 0,
    avg_units_per_order: 0,
    revenue_growth: 0,
    profit_growth: 0,
    order_growth: 0,
  };
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

