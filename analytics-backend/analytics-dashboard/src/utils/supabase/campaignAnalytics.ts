/**
 * Campaign Analytics Utilities
 * Comprehensive SQL queries for campaign performance tracking
 */

import { supabase } from '@/lib/supabase';

export interface CampaignMetrics {
  campaign_id: string;
  campaign_name: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string;
  utm_term: string | null;
  utm_content: string | null;
  cost: number;
  budget: number | null;
  is_active: boolean;
  
  // Traffic metrics
  total_visits: number;
  unique_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  
  // Engagement metrics
  avg_session_duration: number;
  bounce_rate: number;
  pages_per_visit: number;
  
  // Conversion metrics
  product_views: number;
  add_to_cart: number;
  checkout_initiated: number;
  orders_completed: number;
  
  // Revenue metrics
  total_revenue: number;
  avg_order_value: number;
  
  // Performance metrics
  conversion_rate: number;
  cart_conversion_rate: number;
  cost_per_click: number;
  cost_per_acquisition: number;
  return_on_ad_spend: number;
  roi_percentage: number;
  
  // Time-based
  first_visit: string | null;
  last_visit: string | null;
  days_active: number;
}

/**
 * Get comprehensive campaign metrics with all calculations
 */
export async function getCampaignMetrics(
  startDate?: string,
  endDate?: string
): Promise<{ data: CampaignMetrics[] | null; error: string | null }> {
  try {
    // Build complex query with all metrics
    const query = supabase.rpc('get_campaign_metrics', {
      p_start_date: startDate || null,
      p_end_date: endDate || null,
    });

    const { data, error } = await query;

    if (error) {
      // Fallback to manual calculation if stored procedure doesn't exist
      return await calculateCampaignMetricsManually(startDate, endDate);
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('[Campaign Analytics] Error fetching metrics:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Manual calculation of campaign metrics (fallback)
 */
async function calculateCampaignMetricsManually(
  startDate?: string,
  endDate?: string
): Promise<{ data: CampaignMetrics[] | null; error: string | null }> {
  try {
    // Get all campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campaignsError) throw campaignsError;
    if (!campaigns) return { data: [], error: null };

    // Calculate metrics for each campaign
    const metricsPromises = campaigns.map(async (campaign) => {
      // Build date filter
      let visitQuery = supabase
        .from('visits')
        .select('*', { count: 'exact' })
        .eq('utm_campaign', campaign.utm_campaign);

      if (startDate) visitQuery = visitQuery.gte('created_at', startDate);
      if (endDate) visitQuery = visitQuery.lte('created_at', endDate);

      const { data: visits, count: visitCount } = await visitQuery;

      // Get unique visitors
      const uniqueVisitors = visits
        ? new Set(visits.map((v: any) => v.session_id)).size
        : 0;

      // Get orders for this campaign
      let ordersQuery = supabase
        .from('orders')
        .select('total_value', { count: 'exact' })
        .eq('utm_campaign', campaign.utm_campaign);

      if (startDate) ordersQuery = ordersQuery.gte('created_at', startDate);
      if (endDate) ordersQuery = ordersQuery.lte('created_at', endDate);

      const { data: orders, count: ordersCount } = await ordersQuery;

      const totalRevenue = orders
        ? orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total_value) || 0), 0)
        : 0;

      // Get cart events
      let cartQuery = supabase
        .from('cart_events')
        .select('event_type', { count: 'exact' });

      // Match cart events to visits from this campaign
      if (visits && visits.length > 0) {
        const sessionIds = visits.map((v: any) => v.session_id);
        cartQuery = cartQuery.in('session_id', sessionIds);
      }

      if (startDate) cartQuery = cartQuery.gte('created_at', startDate);
      if (endDate) cartQuery = cartQuery.lte('created_at', endDate);

      const { data: cartEvents } = await cartQuery;

      const productViews = cartEvents?.filter((e: any) => e.event_type === 'view').length || 0;
      const addToCart = cartEvents?.filter((e: any) => e.event_type === 'add').length || 0;
      const checkoutInitiated = cartEvents?.filter((e: any) => e.event_type === 'checkout_start').length || 0;

      // Calculate metrics
      const conversionRate = visitCount ? ((ordersCount || 0) / visitCount) * 100 : 0;
      const cartConversionRate = addToCart ? ((ordersCount || 0) / addToCart) * 100 : 0;
      const avgOrderValue = ordersCount ? totalRevenue / ordersCount : 0;
      const cpc = visitCount ? campaign.cost / visitCount : 0;
      const cpa = ordersCount ? campaign.cost / ordersCount : 0;
      const roas = campaign.cost > 0 ? totalRevenue / campaign.cost : 0;
      const roi = campaign.cost > 0 ? ((totalRevenue - campaign.cost) / campaign.cost) * 100 : 0;

      return {
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        utm_source: campaign.utm_source,
        utm_medium: campaign.utm_medium,
        utm_campaign: campaign.utm_campaign,
        utm_term: campaign.utm_term,
        utm_content: campaign.utm_content,
        cost: parseFloat(campaign.cost) || 0,
        budget: campaign.budget ? parseFloat(campaign.budget) : null,
        is_active: campaign.is_active,
        
        total_visits: visitCount || 0,
        unique_visitors: uniqueVisitors,
        new_visitors: uniqueVisitors, // Simplified
        returning_visitors: 0, // Would need more complex logic
        
        avg_session_duration: 0, // Would need page_views data
        bounce_rate: 0, // Would need page_views data
        pages_per_visit: 0, // Would need page_views data
        
        product_views: productViews,
        add_to_cart: addToCart,
        checkout_initiated: checkoutInitiated,
        orders_completed: ordersCount || 0,
        
        total_revenue: totalRevenue,
        avg_order_value: avgOrderValue,
        
        conversion_rate: conversionRate,
        cart_conversion_rate: cartConversionRate,
        cost_per_click: cpc,
        cost_per_acquisition: cpa,
        return_on_ad_spend: roas,
        roi_percentage: roi,
        
        first_visit: visits && visits.length > 0 ? visits[0].created_at : null,
        last_visit: visits && visits.length > 0 ? visits[visits.length - 1].created_at : null,
        days_active: campaign.start_date ? 
          Math.floor((Date.now() - new Date(campaign.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      } as CampaignMetrics;
    });

    const data = await Promise.all(metricsPromises);

    return { data, error: null };
  } catch (err: any) {
    console.error('[Campaign Analytics] Manual calculation error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Get daily campaign performance breakdown
 */
export async function getDailyCampaignPerformance(
  campaignId: string,
  days: number = 30
): Promise<{ data: any[] | null; error: string | null }> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('utm_campaign')
      .eq('id', campaignId)
      .single();

    if (campaignError) throw campaignError;

    // Get daily visits
    const { data: dailyVisits, error: visitsError } = await supabase
      .from('visits')
      .select('created_at')
      .eq('utm_campaign', campaign.utm_campaign)
      .gte('created_at', startDate.toISOString());

    if (visitsError) throw visitsError;

    // Get daily orders
    const { data: dailyOrders, error: ordersError } = await supabase
      .from('orders')
      .select('created_at, total_value')
      .eq('utm_campaign', campaign.utm_campaign)
      .gte('created_at', startDate.toISOString());

    if (ordersError) throw ordersError;

    // Group by date
    const dailyMetrics = new Map<string, any>();

    // Process visits
    dailyVisits?.forEach((visit: any) => {
      const date = new Date(visit.created_at).toISOString().split('T')[0];
      if (!dailyMetrics.has(date)) {
        dailyMetrics.set(date, { date, visits: 0, orders: 0, revenue: 0 });
      }
      dailyMetrics.get(date).visits++;
    });

    // Process orders
    dailyOrders?.forEach((order: any) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!dailyMetrics.has(date)) {
        dailyMetrics.set(date, { date, visits: 0, orders: 0, revenue: 0 });
      }
      const metrics = dailyMetrics.get(date);
      metrics.orders++;
      metrics.revenue += parseFloat(order.total_value) || 0;
    });

    // Convert to array and sort
    const data = Array.from(dailyMetrics.values()).sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Get campaign funnel breakdown
 */
export async function getCampaignFunnel(
  campaignId: string
): Promise<{ data: any | null; error: string | null }> {
  try {
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('utm_campaign')
      .eq('id', campaignId)
      .single();

    if (campaignError) throw campaignError;

    // Get visits
    const { count: visits } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('utm_campaign', campaign.utm_campaign);

    // Get session IDs for this campaign
    const { data: visitData } = await supabase
      .from('visits')
      .select('session_id')
      .eq('utm_campaign', campaign.utm_campaign);

    const sessionIds = visitData?.map((v: any) => v.session_id) || [];

    if (sessionIds.length === 0) {
      return {
        data: {
          visits: 0,
          product_views: 0,
          add_to_cart: 0,
          checkout_initiated: 0,
          orders_completed: 0,
        },
        error: null,
      };
    }

    // Get cart events
    const { data: cartEvents } = await supabase
      .from('cart_events')
      .select('event_type')
      .in('session_id', sessionIds);

    const productViews = cartEvents?.filter((e: any) => e.event_type === 'view').length || 0;
    const addToCart = cartEvents?.filter((e: any) => e.event_type === 'add').length || 0;
    const checkoutInitiated = cartEvents?.filter((e: any) => e.event_type === 'checkout_start').length || 0;

    // Get orders
    const { count: orders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('utm_campaign', campaign.utm_campaign);

    return {
      data: {
        visits: visits || 0,
        product_views: productViews,
        add_to_cart: addToCart,
        checkout_initiated: checkoutInitiated,
        orders_completed: orders || 0,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Get top performing campaigns
 */
export async function getTopCampaigns(
  metric: 'revenue' | 'orders' | 'roi' | 'conversion_rate' = 'revenue',
  limit: number = 10
): Promise<{ data: CampaignMetrics[] | null; error: string | null }> {
  try {
    const { data, error } = await getCampaignMetrics();
    
    if (error || !data) return { data: null, error };

    // Sort by specified metric
    const sorted = [...data].sort((a, b) => {
      switch (metric) {
        case 'revenue':
          return b.total_revenue - a.total_revenue;
        case 'orders':
          return b.orders_completed - a.orders_completed;
        case 'roi':
          return b.roi_percentage - a.roi_percentage;
        case 'conversion_rate':
          return b.conversion_rate - a.conversion_rate;
        default:
          return 0;
      }
    });

    return { data: sorted.slice(0, limit), error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

