/**
 * Customer Journey Analytics Dashboard
 * Track customer paths, touchpoints, and conversion journeys
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShopifyCard } from '@/components/dashboard/ShopifyCard';
import { ShopifyTable } from '@/components/dashboard/ShopifyTable';
import { ShopifyStatCard } from '@/components/dashboard/ShopifyStatCard';
import { ShopifyBadge } from '@/components/dashboard/ShopifyBadge';
import { Route, MousePointer, Clock, Repeat, TrendingUp } from 'lucide-react';

interface CustomerJourney {
  session_id: string;
  first_page: string;
  last_page: string;
  pages_visited: number;
  total_time: number;
  events_triggered: number;
  products_viewed: number;
  items_added_to_cart: number;
  checkout_attempted: boolean;
  order_completed: boolean;
  order_value: number | null;
  device: string;
  utm_campaign: string | null;
  created_at: string;
}

interface PopularPath {
  path_sequence: string;
  sessions: number;
  conversion_rate: number;
  avg_order_value: number;
}

export default function CustomerJourneyDashboard() {
  const [journeys, setJourneys] = useState<CustomerJourney[] | null>(null);
  const [popularPaths, setPopularPaths] = useState<PopularPath[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadJourneyData();
  }, [days]);

  const loadJourneyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      // Get all visits
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('session_id, device, utm_campaign, landing_page, created_at')
        .gte('created_at', startDateStr)
        .order('created_at', { ascending: false })
        .limit(100);

      if (visitsError) throw visitsError;

      // Get page views for each session
      const { data: pageViews, error: pageViewsError } = await supabase
        .from('page_views')
        .select('session_id, url, time_on_page, created_at')
        .gte('created_at', startDateStr);

      if (pageViewsError) throw pageViewsError;

      // Get events for each session
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('session_id, event_name')
        .gte('created_at', startDateStr);

      if (eventsError) throw eventsError;

      // Get cart events
      const { data: cartEvents, error: cartError } = await supabase
        .from('cart_events')
        .select('session_id, event_type, product_title')
        .gte('created_at', startDateStr);

      if (cartError) throw cartError;

      // Get orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('session_id, total_value, status')
        .gte('created_at', startDateStr);

      if (ordersError) throw ordersError;

      // Build journey data
      const journeyData: CustomerJourney[] = visits?.map((visit: any) => {
        const sessionPageViews = pageViews?.filter((pv: any) => pv.session_id === visit.session_id) || [];
        const sessionEvents = events?.filter((e: any) => e.session_id === visit.session_id) || [];
        const sessionCartEvents = cartEvents?.filter((ce: any) => ce.session_id === visit.session_id) || [];
        const sessionOrders = orders?.filter((o: any) => o.session_id === visit.session_id) || [];

        const productViewedEvents = sessionEvents.filter((e: any) => 
          e.event_name === 'ProductViewed' || e.event_name === 'ViewContent'
        );
        const addToCartEvents = sessionCartEvents.filter((ce: any) => ce.event_type === 'add');
        const checkoutEvents = sessionCartEvents.filter((ce: any) => ce.event_type === 'checkout_start');
        const completedOrders = sessionOrders.filter((o: any) => o.status === 'completed');

        const totalTime = sessionPageViews.reduce((sum: number, pv: any) => sum + (pv.time_on_page || 0), 0);
        const lastPage = sessionPageViews.length > 0 
          ? sessionPageViews[sessionPageViews.length - 1].url 
          : visit.landing_page;

        return {
          session_id: visit.session_id,
          first_page: visit.landing_page || '/',
          last_page: lastPage,
          pages_visited: sessionPageViews.length,
          total_time: totalTime,
          events_triggered: sessionEvents.length,
          products_viewed: productViewedEvents.length,
          items_added_to_cart: addToCartEvents.length,
          checkout_attempted: checkoutEvents.length > 0,
          order_completed: completedOrders.length > 0,
          order_value: completedOrders.length > 0 ? parseFloat(completedOrders[0].total_value) : null,
          device: visit.device,
          utm_campaign: visit.utm_campaign,
          created_at: visit.created_at,
        };
      }) || [];

      setJourneys(journeyData);

      // Calculate popular paths (simplified)
      const pathMap = new Map<string, any>();
      
      journeyData.forEach((journey) => {
        const pathKey = `${journey.first_page} → ${journey.last_page}`;
        if (!pathMap.has(pathKey)) {
          pathMap.set(pathKey, {
            path_sequence: pathKey,
            sessions: 0,
            conversions: 0,
            total_order_value: 0,
          });
        }
        const pathData = pathMap.get(pathKey);
        pathData.sessions++;
        if (journey.order_completed) {
          pathData.conversions++;
          pathData.total_order_value += journey.order_value || 0;
        }
      });

      const popularPathsData: PopularPath[] = Array.from(pathMap.values())
        .map((path) => ({
          path_sequence: path.path_sequence,
          sessions: path.sessions,
          conversion_rate: path.sessions > 0 ? (path.conversions / path.sessions) * 100 : 0,
          avg_order_value: path.conversions > 0 ? path.total_order_value / path.conversions : 0,
        }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10);

      setPopularPaths(popularPathsData);

    } catch (err: any) {
      setError(err.message);
      console.error('[Customer Journey] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  // Calculate key metrics
  const avgPagesPerSession = journeys?.reduce((sum, j) => sum + j.pages_visited, 0) / (journeys?.length || 1) || 0;
  const avgTimePerSession = journeys?.reduce((sum, j) => sum + j.total_time, 0) / (journeys?.length || 1) || 0;
  const avgEventsPerSession = journeys?.reduce((sum, j) => sum + j.events_triggered, 0) / (journeys?.length || 1) || 0;
  const conversionRate = journeys?.filter(j => j.order_completed).length / (journeys?.length || 1) * 100 || 0;
  const avgProductViews = journeys?.reduce((sum, j) => sum + j.products_viewed, 0) / (journeys?.length || 1) || 0;

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Journey Analytics</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Key Journey Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <ShopifyStatCard
          title="Avg Pages/Session"
          value={avgPagesPerSession.toFixed(1)}
          icon={<Route className="w-5 h-5" />}
          subtitle="Page depth"
        />
        <ShopifyStatCard
          title="Avg Time/Session"
          value={formatTime(avgTimePerSession)}
          icon={<Clock className="w-5 h-5" />}
          subtitle="Engagement time"
        />
        <ShopifyStatCard
          title="Avg Events/Session"
          value={avgEventsPerSession.toFixed(1)}
          icon={<MousePointer className="w-5 h-5" />}
          subtitle="User interactions"
        />
        <ShopifyStatCard
          title="Avg Products Viewed"
          value={avgProductViews.toFixed(1)}
          icon={<Repeat className="w-5 h-5" />}
          subtitle="Per session"
        />
        <ShopifyStatCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(2)}%`}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          subtitle="Journey to purchase"
        />
      </div>

      {/* Popular Conversion Paths */}
      <ShopifyCard
        title="Top Conversion Paths"
        subtitle="Most common customer journeys"
        noPadding
      >
        <ShopifyTable
          columns={[
            {
              key: 'path_sequence',
              header: 'Path',
              render: (val) => (
                <div className="font-mono text-sm text-gray-700 max-w-md truncate" title={val}>
                  {val}
                </div>
              ),
            },
            {
              key: 'sessions',
              header: 'Sessions',
              align: 'right',
              render: (val) => <span className="font-medium">{formatNumber(val)}</span>,
            },
            {
              key: 'conversion_rate',
              header: 'Conv. Rate',
              align: 'right',
              render: (val) => `${val.toFixed(2)}%`,
            },
            {
              key: 'avg_order_value',
              header: 'Avg Order Value',
              align: 'right',
              render: (val) => val > 0 ? formatCurrency(val) : '-',
            },
            {
              key: 'conversion_rate',
              header: 'Performance',
              render: (val) => {
                const variant = val > 5 ? 'success' : val > 2 ? 'warning' : 'neutral';
                return (
                  <ShopifyBadge variant={variant as any}>
                    {val > 5 ? 'High' : val > 2 ? 'Medium' : 'Low'}
                  </ShopifyBadge>
                );
              },
            },
          ]}
          data={popularPaths || []}
          loading={loading}
          emptyMessage="No journey data available"
        />
      </ShopifyCard>

      {/* Individual Customer Journeys */}
      <ShopifyCard
        title="Recent Customer Journeys"
        subtitle={`Last ${journeys?.length || 0} sessions`}
        noPadding
      >
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-semibold">Error loading journeys:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        <ShopifyTable
          columns={[
            {
              key: 'session_id',
              header: 'Session',
              render: (val) => <span className="font-mono text-xs">{val.slice(0, 8)}...</span>,
            },
            {
              key: 'device',
              header: 'Device',
              render: (val) => val || 'Unknown',
            },
            {
              key: 'utm_campaign',
              header: 'Campaign',
              render: (val) => val || '-',
            },
            {
              key: 'pages_visited',
              header: 'Pages',
              align: 'right',
              render: (val) => formatNumber(val),
            },
            {
              key: 'total_time',
              header: 'Time',
              align: 'right',
              render: (val) => formatTime(val),
            },
            {
              key: 'products_viewed',
              header: 'Products',
              align: 'right',
              render: (val) => formatNumber(val),
            },
            {
              key: 'items_added_to_cart',
              header: 'Cart Adds',
              align: 'right',
              render: (val) => formatNumber(val),
            },
            {
              key: 'checkout_attempted',
              header: 'Checkout',
              render: (val) => (
                <ShopifyBadge variant={val ? 'info' : 'neutral'}>
                  {val ? 'Yes' : 'No'}
                </ShopifyBadge>
              ),
            },
            {
              key: 'order_completed',
              header: 'Purchased',
              render: (val) => (
                <ShopifyBadge variant={val ? 'success' : 'neutral'}>
                  {val ? 'Yes' : 'No'}
                </ShopifyBadge>
              ),
            },
            {
              key: 'order_value',
              header: 'Order Value',
              align: 'right',
              render: (val) => val ? <span className="font-semibold text-green-600">{formatCurrency(val)}</span> : '-',
            },
            {
              key: 'created_at',
              header: 'Date',
              render: (val) => new Date(val).toLocaleDateString(),
            },
          ]}
          data={journeys || []}
          loading={loading}
          emptyMessage="No customer journeys tracked yet"
        />
      </ShopifyCard>
    </div>
  );
}

