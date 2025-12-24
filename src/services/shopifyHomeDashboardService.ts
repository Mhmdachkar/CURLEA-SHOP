/**
 * Shopify Home Dashboard Service
 * 
 * Fetches and calculates real data from database for the Home Dashboard widget
 * Connects to Supabase to get sessions, orders, sales, and conversion data
 */

import { supabase } from '@/lib/supabase';
import type { DashboardData, DailyDataPoint } from '@/data/shopifyHomeDashboardData';

/**
 * Get date range for query (default: last 30 days)
 */
function getDateRange(days: number = 30): { start: string; end: string; compareStart: string; compareEnd: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  const compareEnd = new Date(start);
  compareEnd.setDate(compareEnd.getDate() - 1);
  const compareStart = new Date(compareEnd);
  compareStart.setDate(compareStart.getDate() - days);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    compareStart: compareStart.toISOString().split('T')[0],
    compareEnd: compareEnd.toISOString().split('T')[0],
  };
}

/**
 * Generate daily data points for a date range
 */
function generateDailyDataPoints(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  
  return dates;
}

/**
 * Fetch sessions data from visits table
 */
async function fetchSessionsData(
  startDate: string,
  endDate: string,
  compareStart: string,
  compareEnd: string
): Promise<{ total: number; growthRate: number; dailyData: DailyDataPoint[] }> {
  try {
    // Get current period sessions (unique session_id count)
    const { data: currentSessions, error: currentError } = await supabase
      .from('visits')
      .select('session_id, created_at')
      .gte('created_at', startDate)
      .lte('created_at', `${endDate}T23:59:59`);

    if (currentError) {
      console.error('Error fetching current sessions:', currentError);
      throw currentError;
    }

    // Get previous period sessions
    const { data: previousSessions, error: previousError } = await supabase
      .from('visits')
      .select('session_id, created_at')
      .gte('created_at', compareStart)
      .lte('created_at', `${compareEnd}T23:59:59`);

    if (previousError) {
      console.error('Error fetching previous sessions:', previousError);
      throw previousError;
    }

    // Count unique sessions
    const currentUniqueSessions = new Set(currentSessions?.map(v => v.session_id) || []).size;
    const previousUniqueSessions = new Set(previousSessions?.map(v => v.session_id) || []).size;

    // Calculate growth rate
    const growthRate = previousUniqueSessions > 0
      ? ((currentUniqueSessions - previousUniqueSessions) / previousUniqueSessions) * 100
      : 0;

    // Generate daily data
    const dailyDates = generateDailyDataPoints(startDate, endDate);
    const compareDailyDates = generateDailyDataPoints(compareStart, compareEnd);

    // Group sessions by date
    const currentByDate = new Map<string, Set<string>>();
    currentSessions?.forEach(visit => {
      const date = visit.created_at.split('T')[0];
      if (!currentByDate.has(date)) {
        currentByDate.set(date, new Set());
      }
      currentByDate.get(date)!.add(visit.session_id);
    });

    const previousByDate = new Map<string, Set<string>>();
    previousSessions?.forEach(visit => {
      const date = visit.created_at.split('T')[0];
      if (!previousByDate.has(date)) {
        previousByDate.set(date, new Set());
      }
      previousByDate.get(date)!.add(visit.session_id);
    });

    const dailyData: DailyDataPoint[] = dailyDates.map((date, index) => {
      const compareDate = compareDailyDates[index] || date;
      return {
        date,
        current: currentByDate.get(date)?.size || 0,
        previous: previousByDate.get(compareDate)?.size || 0,
      };
    });

    return {
      total: currentUniqueSessions,
      growthRate,
      dailyData,
    };
  } catch (error) {
    console.error('Error in fetchSessionsData:', error);
    return {
      total: 0,
      growthRate: 0,
      dailyData: [],
    };
  }
}

/**
 * Fetch total sales data from orders table
 */
async function fetchTotalSalesData(
  startDate: string,
  endDate: string,
  compareStart: string,
  compareEnd: string
): Promise<{ grossAmount: number; growthRate: number; dailyData: DailyDataPoint[] }> {
  try {
    // Get current period orders (completed status)
    // Use orders table (public.orders by default in Supabase)
    const { data: currentOrdersRaw, error: currentError } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('status', 'completed')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    let currentOrdersData: any[] = [];
    
    if (currentError) {
      console.warn('Error fetching current orders, trying analytics table:', currentError);
      // If error, try with total_value (analytics orders table)
      const { data: analyticsOrders, error: analyticsError } = await supabase
        .from('orders')
        .select('total_value, created_at')
        .eq('status', 'completed')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);
      
      if (analyticsError) {
        console.error('Error fetching orders from both tables:', { currentError, analyticsError });
        return {
          grossAmount: 0,
          growthRate: 0,
          dailyData: [],
        };
      }
      
      // Use analytics orders data
      currentOrdersData = analyticsOrders?.map(order => ({
        total_amount: order.total_value || 0,
        created_at: order.created_at,
      })) || [];
    } else {
      currentOrdersData = currentOrdersRaw || [];
    }

    // Get previous period orders
    const { data: previousOrdersRaw, error: previousError } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('status', 'completed')
      .gte('created_at', `${compareStart}T00:00:00`)
      .lte('created_at', `${compareEnd}T23:59:59`);

    let previousOrdersData: any[] = [];
    
    if (previousError) {
      console.warn('Error fetching previous orders, trying analytics table:', previousError);
      // Try analytics orders table
      const { data: prevAnalyticsOrders, error: prevAnalyticsError } = await supabase
        .from('orders')
        .select('total_value, created_at')
        .eq('status', 'completed')
        .gte('created_at', `${compareStart}T00:00:00`)
        .lte('created_at', `${compareEnd}T23:59:59`);
      
      if (!prevAnalyticsError && prevAnalyticsOrders) {
        previousOrdersData = prevAnalyticsOrders.map(order => ({
          total_amount: order.total_value || 0,
          created_at: order.created_at,
        }));
      } else {
        console.error('Error fetching previous orders from both tables:', prevAnalyticsError);
        previousOrdersData = [];
      }
    } else {
      previousOrdersData = previousOrdersRaw || [];
    }

    // Calculate total sales (total_amount already includes all components)
    const currentTotal = currentOrdersData.reduce((sum, order) => {
      const amount = typeof order.total_amount === 'string' 
        ? parseFloat(order.total_amount) 
        : (order.total_amount || 0);
      return sum + amount;
    }, 0);
    
    const previousTotal = previousOrdersData.reduce((sum, order) => {
      const amount = typeof order.total_amount === 'string' 
        ? parseFloat(order.total_amount) 
        : (order.total_amount || 0);
      return sum + amount;
    }, 0);

    // Calculate growth rate
    const growthRate = previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;

    // Generate daily data
    const dailyDates = generateDailyDataPoints(startDate, endDate);
    const compareDailyDates = generateDailyDataPoints(compareStart, compareEnd);

    // Group orders by date
    const currentByDate = new Map<string, number>();
    currentOrdersData.forEach(order => {
      const date = order.created_at?.split('T')[0] || '';
      const amount = typeof order.total_amount === 'string' 
        ? parseFloat(order.total_amount) 
        : (order.total_amount || 0);
      if (date) {
        currentByDate.set(date, (currentByDate.get(date) || 0) + amount);
      }
    });

    const previousByDate = new Map<string, number>();
    previousOrdersData.forEach(order => {
      const date = order.created_at?.split('T')[0] || '';
      const amount = typeof order.total_amount === 'string' 
        ? parseFloat(order.total_amount) 
        : (order.total_amount || 0);
      if (date) {
        previousByDate.set(date, (previousByDate.get(date) || 0) + amount);
      }
    });

    const dailyData: DailyDataPoint[] = dailyDates.map((date, index) => {
      const compareDate = compareDailyDates[index] || date;
      return {
        date,
        current: currentByDate.get(date) || 0,
        previous: previousByDate.get(compareDate) || 0,
      };
    });

    return {
      grossAmount: currentTotal,
      growthRate,
      dailyData,
    };
  } catch (error) {
    console.error('Error in fetchTotalSalesData:', error);
    return {
      grossAmount: 0,
      growthRate: 0,
      dailyData: [],
    };
  }
}

/**
 * Fetch total orders data
 */
async function fetchTotalOrdersData(
  startDate: string,
  endDate: string,
  compareStart: string,
  compareEnd: string
): Promise<{ orderCount: number; growthRate: number; dailyData: DailyDataPoint[] }> {
  try {
    // Get current period orders count
    const { data: currentOrdersRaw, error: currentError } = await supabase
      .from('orders')
      .select('id, created_at')
      .eq('status', 'completed')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    let currentOrders: any[] = [];
    
    if (currentError) {
      console.warn('Error fetching current orders count:', currentError);
      currentOrders = [];
    } else {
      currentOrders = currentOrdersRaw || [];
    }

    // Get previous period orders count
    const { data: previousOrdersRaw, error: previousError } = await supabase
      .from('orders')
      .select('id, created_at')
      .eq('status', 'completed')
      .gte('created_at', `${compareStart}T00:00:00`)
      .lte('created_at', `${compareEnd}T23:59:59`);

    let previousOrders: any[] = [];
    
    if (previousError) {
      console.warn('Error fetching previous orders count:', previousError);
      previousOrders = [];
    } else {
      previousOrders = previousOrdersRaw || [];
    }

    const currentCount = currentOrders.length;
    const previousCount = previousOrders.length;

    // Calculate growth rate
    const growthRate = previousCount > 0
      ? ((currentCount - previousCount) / previousCount) * 100
      : 0;

    // Generate daily data
    const dailyDates = generateDailyDataPoints(startDate, endDate);
    const compareDailyDates = generateDailyDataPoints(compareStart, compareEnd);

    // Group orders by date
    const currentByDate = new Map<string, number>();
    currentOrders.forEach(order => {
      const date = order.created_at?.split('T')[0] || '';
      if (date) {
        currentByDate.set(date, (currentByDate.get(date) || 0) + 1);
      }
    });

    const previousByDate = new Map<string, number>();
    previousOrders.forEach(order => {
      const date = order.created_at?.split('T')[0] || '';
      if (date) {
        previousByDate.set(date, (previousByDate.get(date) || 0) + 1);
      }
    });

    const dailyData: DailyDataPoint[] = dailyDates.map((date, index) => {
      const compareDate = compareDailyDates[index] || date;
      return {
        date,
        current: currentByDate.get(date) || 0,
        previous: previousByDate.get(compareDate) || 0,
      };
    });

    return {
      orderCount: currentCount,
      growthRate,
      dailyData,
    };
  } catch (error) {
    console.error('Error in fetchTotalOrdersData:', error);
    return {
      orderCount: 0,
      growthRate: 0,
      dailyData: [],
    };
  }
}

/**
 * Fetch conversion rate data
 */
async function fetchConversionRateData(
  startDate: string,
  endDate: string,
  compareStart: string,
  compareEnd: string
): Promise<{ percentage: number; growthRate: number; dailyData: DailyDataPoint[] }> {
  try {
    // Get sessions and orders for current period
    const { data: currentSessions, error: sessionsError } = await supabase
      .from('visits')
      .select('session_id, created_at')
      .gte('created_at', startDate)
      .lte('created_at', `${endDate}T23:59:59`);

    if (sessionsError) {
      console.error('Error fetching sessions for conversion:', sessionsError);
      throw sessionsError;
    }

    const { data: currentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, created_at')
      .eq('status', 'completed')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    if (ordersError) {
      console.error('Error fetching orders for conversion:', ordersError);
      throw ordersError;
    }

    // Get sessions and orders for previous period
    const { data: previousSessions, error: prevSessionsError } = await supabase
      .from('visits')
      .select('session_id, created_at')
      .gte('created_at', `${compareStart}T00:00:00`)
      .lte('created_at', `${compareEnd}T23:59:59`);

    if (prevSessionsError) {
      console.error('Error fetching previous sessions:', prevSessionsError);
      throw prevSessionsError;
    }

    const { data: previousOrders, error: prevOrdersError } = await supabase
      .from('orders')
      .select('id, created_at')
      .eq('status', 'completed')
      .gte('created_at', `${compareStart}T00:00:00`)
      .lte('created_at', `${compareEnd}T23:59:59`);

    if (prevOrdersError) {
      console.error('Error fetching previous orders:', prevOrdersError);
      throw prevOrdersError;
    }

    // Calculate conversion rates
    const currentUniqueSessions = new Set(currentSessions?.map(v => v.session_id) || []).size;
    const currentOrderCount = currentOrders?.length || 0;
    const currentConversionRate = currentUniqueSessions > 0
      ? (currentOrderCount / currentUniqueSessions) * 100
      : 0;

    const previousUniqueSessions = new Set(previousSessions?.map(v => v.session_id) || []).size;
    const previousOrderCount = previousOrders?.length || 0;
    const previousConversionRate = previousUniqueSessions > 0
      ? (previousOrderCount / previousUniqueSessions) * 100
      : 0;

    // Calculate growth rate
    const growthRate = previousConversionRate > 0
      ? ((currentConversionRate - previousConversionRate) / previousConversionRate) * 100
      : 0;

    // Generate daily data
    const dailyDates = generateDailyDataPoints(startDate, endDate);
    const compareDailyDates = generateDailyDataPoints(compareStart, compareEnd);

    // Group sessions and orders by date
    const currentSessionsByDate = new Map<string, Set<string>>();
    currentSessions?.forEach(visit => {
      const date = visit.created_at.split('T')[0];
      if (!currentSessionsByDate.has(date)) {
        currentSessionsByDate.set(date, new Set());
      }
      currentSessionsByDate.get(date)!.add(visit.session_id);
    });

    const currentOrdersByDate = new Map<string, number>();
    currentOrders?.forEach(order => {
      const date = order.created_at.split('T')[0];
      currentOrdersByDate.set(date, (currentOrdersByDate.get(date) || 0) + 1);
    });

    const previousSessionsByDate = new Map<string, Set<string>>();
    previousSessions?.forEach(visit => {
      const date = visit.created_at.split('T')[0];
      if (!previousSessionsByDate.has(date)) {
        previousSessionsByDate.set(date, new Set());
      }
      previousSessionsByDate.get(date)!.add(visit.session_id);
    });

    const previousOrdersByDate = new Map<string, number>();
    previousOrders?.forEach(order => {
      const date = order.created_at.split('T')[0];
      previousOrdersByDate.set(date, (previousOrdersByDate.get(date) || 0) + 1);
    });

    const dailyData: DailyDataPoint[] = dailyDates.map((date, index) => {
      const compareDate = compareDailyDates[index] || date;
      const currentSessions = currentSessionsByDate.get(date)?.size || 0;
      const currentOrders = currentOrdersByDate.get(date) || 0;
      const previousSessions = previousSessionsByDate.get(compareDate)?.size || 0;
      const previousOrders = previousOrdersByDate.get(compareDate) || 0;

      const currentRate = currentSessions > 0 ? (currentOrders / currentSessions) * 100 : 0;
      const previousRate = previousSessions > 0 ? (previousOrders / previousSessions) * 100 : 0;

      return {
        date,
        current: currentRate,
        previous: previousRate,
      };
    });

    return {
      percentage: currentConversionRate,
      growthRate,
      dailyData,
    };
  } catch (error) {
    console.error('Error in fetchConversionRateData:', error);
    return {
      percentage: 0,
      growthRate: 0,
      dailyData: [],
    };
  }
}

/**
 * Get live visitors count (active sessions with recent page views in last 5 minutes)
 * This checks for actual activity, not just when the visit was created
 */
async function getLiveVisitors(): Promise<number> {
  try {
    // Check for page views in the last 5 minutes (active users)
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    // First, try to get active sessions from recent page views
    const { data: recentPageViews, error: pageViewsError } = await supabase
      .from('page_views')
      .select('session_id')
      .gte('created_at', fiveMinutesAgo.toISOString());

    if (!pageViewsError && recentPageViews && recentPageViews.length > 0) {
      // Count unique sessions with recent activity
      const uniqueActiveSessions = new Set(recentPageViews.map(pv => pv.session_id)).size;
      return uniqueActiveSessions;
    }

    // Fallback: If no recent page views, check for visits created in last 10 minutes
    // (new visitors who just landed)
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    const { data: recentVisits, error: visitsError } = await supabase
      .from('visits')
      .select('session_id')
      .gte('created_at', tenMinutesAgo.toISOString());

    if (visitsError) {
      console.error('Error fetching live visitors:', visitsError);
      return 0;
    }

    // Count unique sessions
    const uniqueSessions = new Set(recentVisits?.map(v => v.session_id) || []).size;
    return uniqueSessions;
  } catch (error) {
    console.error('Error in getLiveVisitors:', error);
    return 0;
  }
}

/**
 * Get next payout amount
 * 
 * For Stripe, payouts are typically processed daily or weekly.
 * This calculates the sum of REAL (live mode) completed Stripe orders from the last payout period.
 * 
 * IMPORTANT: 
 * - Only includes orders where payment_method = 'stripe' (excludes COD/cash on delivery)
 * - Only includes real payments, excludes test payments
 * - Test payments are identified by stripe_session_id starting with "cs_test_" or stripe_payment_intent_id starting with "pi_test_"
 * 
 * You can customize this based on your payout schedule:
 * - Daily payouts: Last 1-2 days
 * - Weekly payouts: Last 7 days
 * - Monthly payouts: Last 30 days
 */
async function getNextPayout(): Promise<number> {
  try {
    // Stripe typically processes payouts daily or weekly
    // Calculate payout period: last 7 days (weekly) or last 2 days (daily)
    // Adjust this based on your Stripe payout schedule
    const payoutPeriodDays = 7; // Change to 1-2 for daily payouts, 7 for weekly, 30 for monthly
    
    const payoutStartDate = new Date();
    payoutStartDate.setDate(payoutStartDate.getDate() - payoutPeriodDays);
    const startDate = payoutStartDate.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    // Only get REAL Stripe orders from public.orders
    // Filter by payment_method = 'stripe' to exclude COD payments
    // Also exclude test payments (stripe_session_id starting with "cs_test_" or stripe_payment_intent_id starting with "pi_test_")
    const { data: stripeOrders, error: stripeError } = await supabase
      .from('orders')
      .select('total_amount, stripe_session_id, stripe_payment_intent_id, payment_method')
      .eq('status', 'completed')
      .eq('payment_method', 'stripe') // Only Stripe payments, exclude COD
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    if (stripeError) {
      console.warn('Error fetching Stripe orders for payout:', stripeError);
      return 0;
    }

    if (!stripeOrders || stripeOrders.length === 0) {
      return 0;
    }

    // Filter out test payments and sum only real payments
    // Test payments have:
    // - stripe_session_id starting with "cs_test_"
    // - stripe_payment_intent_id starting with "pi_test_"
    const realOrders = stripeOrders.filter(order => {
      const sessionId = order.stripe_session_id || '';
      const paymentIntentId = order.stripe_payment_intent_id || '';
      
      // Exclude if it's a test payment
      const isTestSession = sessionId.startsWith('cs_test_');
      const isTestPaymentIntent = paymentIntentId.startsWith('pi_test_');
      
      // Only include if it's NOT a test payment
      return !isTestSession && !isTestPaymentIntent;
    });

    // Sum all real completed orders from the payout period
    const totalPayout = realOrders.reduce((sum, order) => {
      const amount = typeof order.total_amount === 'string' 
        ? parseFloat(order.total_amount) 
        : (order.total_amount || 0);
      return sum + amount;
    }, 0);
    
    return totalPayout;
  } catch (error) {
    console.error('Error in getNextPayout:', error);
    return 0;
  }
}

/**
 * Fetch complete dashboard data from database
 */
export async function fetchShopifyHomeDashboardData(days: number = 30): Promise<DashboardData> {
  try {
    const { start, end, compareStart, compareEnd } = getDateRange(days);

    // Fetch all metrics in parallel
    const [
      sessionsData,
      salesData,
      ordersData,
      conversionData,
      liveVisitors,
      nextPayout,
    ] = await Promise.all([
      fetchSessionsData(start, end, compareStart, compareEnd),
      fetchTotalSalesData(start, end, compareStart, compareEnd),
      fetchTotalOrdersData(start, end, compareStart, compareEnd),
      fetchConversionRateData(start, end, compareStart, compareEnd),
      getLiveVisitors(),
      getNextPayout(),
    ]);

    return {
      selected_date_range: {
        start,
        end,
      },
      compare_date_range: {
        start: compareStart,
        end: compareEnd,
      },
      metrics: {
        sessions: {
          total_count: sessionsData.total,
          growth_rate: sessionsData.growthRate,
          daily_data: sessionsData.dailyData,
        },
        total_sales: {
          gross_amount: salesData.grossAmount,
          currency: 'USD',
          growth_rate: salesData.growthRate,
          daily_data: salesData.dailyData,
        },
        total_orders: {
          order_count: ordersData.orderCount,
          growth_rate: ordersData.growthRate,
          daily_data: ordersData.dailyData,
        },
        conversion_rate: {
          percentage: conversionData.percentage,
          growth_rate: conversionData.growthRate,
          daily_data: conversionData.dailyData,
        },
      },
      live_visitors: liveVisitors,
      next_payout: nextPayout,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return empty data structure on error
    const { start, end, compareStart, compareEnd } = getDateRange(days);
    return {
      selected_date_range: { start, end },
      compare_date_range: { start: compareStart, end: compareEnd },
      metrics: {
        sessions: { total_count: 0, growth_rate: 0, daily_data: [] },
        total_sales: { gross_amount: 0, currency: 'USD', growth_rate: 0, daily_data: [] },
        total_orders: { order_count: 0, growth_rate: 0, daily_data: [] },
        conversion_rate: { percentage: 0, growth_rate: 0, daily_data: [] },
      },
      live_visitors: 0,
      next_payout: 0,
    };
  }
}

