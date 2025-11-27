/**
 * Pixel Analytics Dashboard
 * Track Meta Pixel and GA4 event performance with SQL data
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShopifyCard } from '@/components/dashboard/ShopifyCard';
import { ShopifyTable } from '@/components/dashboard/ShopifyTable';
import { ShopifyBadge } from '@/components/dashboard/ShopifyBadge';
import { ShopifyStatCard } from '@/components/dashboard/ShopifyStatCard';
import { Activity, Eye, ShoppingCart, CreditCard, CheckCircle, TrendingUp } from 'lucide-react';

interface PixelEvent {
  event_name: string;
  event_count: number;
  unique_sessions: number;
  avg_value: number;
  total_value: number;
  conversion_rate: number;
}

interface EventTrend {
  date: string;
  event_name: string;
  event_count: number;
  unique_sessions: number;
}

export default function PixelAnalyticsDashboard() {
  const [pixelEvents, setPixelEvents] = useState<PixelEvent[] | null>(null);
  const [eventTrends, setEventTrends] = useState<EventTrend[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadPixelAnalytics();
  }, [days]);

  const loadPixelAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get all events aggregated by event name
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('event_name, event_value, session_id, created_at')
        .gte('created_at', startDate.toISOString());

      if (eventsError) throw eventsError;

      // Get total visits for conversion rate calculation
      const { count: totalVisits } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Aggregate event data
      const eventMap = new Map<string, any>();
      
      events?.forEach((event: any) => {
        if (!eventMap.has(event.event_name)) {
          eventMap.set(event.event_name, {
            event_name: event.event_name,
            event_count: 0,
            unique_sessions: new Set(),
            total_value: 0,
            values: [],
          });
        }
        
        const eventData = eventMap.get(event.event_name);
        eventData.event_count++;
        eventData.unique_sessions.add(event.session_id);
        
        if (event.event_value) {
          eventData.total_value += parseFloat(event.event_value) || 0;
          eventData.values.push(parseFloat(event.event_value));
        }
      });

      // Calculate metrics
      const pixelEventData: PixelEvent[] = Array.from(eventMap.values()).map((event) => ({
        event_name: event.event_name,
        event_count: event.event_count,
        unique_sessions: event.unique_sessions.size,
        avg_value: event.values.length > 0 
          ? event.total_value / event.values.length 
          : 0,
        total_value: event.total_value,
        conversion_rate: totalVisits ? (event.unique_sessions.size / totalVisits) * 100 : 0,
      }));

      setPixelEvents(pixelEventData);

      // Get daily event trends
      const trendsMap = new Map<string, any>();
      events?.forEach((event: any) => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        const key = `${date}-${event.event_name}`;
        
        if (!trendsMap.has(key)) {
          trendsMap.set(key, {
            date,
            event_name: event.event_name,
            event_count: 0,
            unique_sessions: new Set(),
          });
        }
        
        const trendData = trendsMap.get(key);
        trendData.event_count++;
        trendData.unique_sessions.add(event.session_id);
      });

      const trendsData: EventTrend[] = Array.from(trendsMap.values()).map((trend) => ({
        date: trend.date,
        event_name: trend.event_name,
        event_count: trend.event_count,
        unique_sessions: trend.unique_sessions.size,
      })).sort((a, b) => b.date.localeCompare(a.date));

      setEventTrends(trendsData);

    } catch (err: any) {
      setError(err.message);
      console.error('[Pixel Analytics] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  // Calculate key metrics
  const totalEvents = pixelEvents?.reduce((sum, e) => sum + e.event_count, 0) || 0;
  const productViewedEvents = pixelEvents?.find(e => e.event_name === 'ProductViewed');
  const addToCartEvents = pixelEvents?.find(e => e.event_name === 'AddToCart');
  const purchaseEvents = pixelEvents?.filter(e => 
    e.event_name.toLowerCase().includes('purchase') || 
    e.event_name === 'checkout_complete'
  );
  const totalPurchaseValue = purchaseEvents?.reduce((sum, e) => sum + e.total_value, 0) || 0;

  // Standard Meta Pixel events to track
  const standardEvents = [
    'PageView',
    'ViewContent',
    'AddToCart',
    'InitiateCheckout',
    'Purchase',
    'ProductViewed',
    'AddToCart',
    'CartViewed',
  ];

  const standardEventData = standardEvents.map(eventName => {
    const event = pixelEvents?.find(e => 
      e.event_name === eventName || 
      e.event_name.toLowerCase() === eventName.toLowerCase()
    );
    return {
      event_name: eventName,
      event_count: event?.event_count || 0,
      unique_sessions: event?.unique_sessions || 0,
      avg_value: event?.avg_value || 0,
      total_value: event?.total_value || 0,
      conversion_rate: event?.conversion_rate || 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pixel & Event Analytics</h2>
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

      {/* Key Pixel Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <ShopifyStatCard
          title="Total Events"
          value={formatNumber(totalEvents)}
          icon={<Activity className="w-5 h-5" />}
          subtitle={`Last ${days} days`}
        />
        <ShopifyStatCard
          title="Product Views"
          value={formatNumber(productViewedEvents?.event_count || 0)}
          icon={<Eye className="w-5 h-5" />}
          subtitle={`${formatNumber(productViewedEvents?.unique_sessions || 0)} unique sessions`}
        />
        <ShopifyStatCard
          title="Add to Cart Events"
          value={formatNumber(addToCartEvents?.event_count || 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
          subtitle={`${formatNumber(addToCartEvents?.unique_sessions || 0)} unique sessions`}
        />
        <ShopifyStatCard
          title="Purchase Value"
          value={formatCurrency(totalPurchaseValue)}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          subtitle={`${formatNumber(purchaseEvents?.reduce((sum, e) => sum + e.event_count, 0) || 0)} purchases`}
        />
      </div>

      {/* Standard Pixel Events Performance */}
      <ShopifyCard
        title="Standard Pixel Events"
        subtitle="Meta Pixel & GA4 event tracking"
        noPadding
      >
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-semibold">Error loading pixel events:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        <ShopifyTable
          columns={[
            {
              key: 'event_name',
              header: 'Event Name',
              render: (val) => (
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{val}</span>
                </div>
              ),
            },
            {
              key: 'event_count',
              header: 'Total Fires',
              align: 'right',
              render: (val) => <span className="font-semibold">{formatNumber(val)}</span>,
            },
            {
              key: 'unique_sessions',
              header: 'Unique Sessions',
              align: 'right',
              render: (val) => formatNumber(val),
            },
            {
              key: 'conversion_rate',
              header: 'Conversion Rate',
              align: 'right',
              render: (val) => `${val.toFixed(2)}%`,
            },
            {
              key: 'avg_value',
              header: 'Avg Value',
              align: 'right',
              render: (val) => val > 0 ? formatCurrency(val) : '-',
            },
            {
              key: 'total_value',
              header: 'Total Value',
              align: 'right',
              render: (val) => val > 0 ? (
                <span className="font-semibold text-green-600">{formatCurrency(val)}</span>
              ) : '-',
            },
            {
              key: 'event_count',
              header: 'Status',
              render: (val) => (
                <ShopifyBadge variant={val > 0 ? 'success' : 'neutral'}>
                  {val > 0 ? 'Tracking' : 'No Data'}
                </ShopifyBadge>
              ),
            },
          ]}
          data={standardEventData}
          loading={loading}
          emptyMessage="No pixel events tracked yet"
        />
      </ShopifyCard>

      {/* All Custom Events */}
      <ShopifyCard
        title="All Tracked Events"
        subtitle={`${pixelEvents?.length || 0} unique event types`}
        noPadding
      >
        <ShopifyTable
          columns={[
            {
              key: 'event_name',
              header: 'Event Name',
              render: (val) => <span className="font-medium">{val}</span>,
            },
            {
              key: 'event_count',
              header: 'Total Count',
              align: 'right',
              render: (val) => formatNumber(val),
            },
            {
              key: 'unique_sessions',
              header: 'Unique Sessions',
              align: 'right',
              render: (val) => formatNumber(val),
            },
            {
              key: 'event_count',
              header: 'Avg per Session',
              align: 'right',
              render: (val, row) => {
                const avg = row.unique_sessions > 0 ? val / row.unique_sessions : 0;
                return avg.toFixed(2);
              },
            },
            {
              key: 'conversion_rate',
              header: 'Conv. Rate',
              align: 'right',
              render: (val) => `${val.toFixed(2)}%`,
            },
            {
              key: 'avg_value',
              header: 'Avg Value',
              align: 'right',
              render: (val) => val > 0 ? formatCurrency(val) : '-',
            },
            {
              key: 'total_value',
              header: 'Total Value',
              align: 'right',
              render: (val) => val > 0 ? formatCurrency(val) : '-',
            },
          ]}
          data={pixelEvents || []}
          loading={loading}
          emptyMessage="No events tracked"
        />
      </ShopifyCard>

      {/* Daily Event Trends */}
      {eventTrends && eventTrends.length > 0 && (
        <ShopifyCard
          title="Daily Event Trends"
          subtitle="Event firing patterns over time"
          noPadding
        >
          <ShopifyTable
            columns={[
              {
                key: 'date',
                header: 'Date',
                render: (val) => new Date(val).toLocaleDateString(),
              },
              {
                key: 'event_name',
                header: 'Event',
                render: (val) => <span className="font-medium">{val}</span>,
              },
              {
                key: 'event_count',
                header: 'Count',
                align: 'right',
                render: (val) => formatNumber(val),
              },
              {
                key: 'unique_sessions',
                header: 'Unique Sessions',
                align: 'right',
                render: (val) => formatNumber(val),
              },
            ]}
            data={eventTrends}
            loading={loading}
            emptyMessage="No trend data available"
          />
        </ShopifyCard>
      )}
    </div>
  );
}

