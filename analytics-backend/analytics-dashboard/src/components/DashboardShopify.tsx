/**
 * Shopify-Style Analytics Dashboard
 * Standalone version for Netlify deployment
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShopifyStatCard } from './dashboard/ShopifyStatCard';
import { ShopifyCard } from './dashboard/ShopifyCard';
import { ShopifyTable } from './dashboard/ShopifyTable';
import { ShopifyBadge } from './dashboard/ShopifyBadge';
import { ShopifyButton } from './dashboard/ShopifyButton';
import { ShopifySidebar } from './dashboard/ShopifySidebar';
import { ShopifyHeader } from './dashboard/ShopifyHeader';
import { Users, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

export default function DashboardShopify() {
  const [activeTab, setActiveTab] = useState('overview');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Analytics data states
  const [dailyOverview, setDailyOverview] = useState<any[]>([]);
  const [trafficSources, setTrafficSources] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [stripeOrders, setStripeOrders] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [cartEvents, setCartEvents] = useState<any[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch daily overview
      const { data: dailyData } = await supabase
        .from('daily_overview')
        .select('*')
        .order('date', { ascending: false })
        .limit(days);
      setDailyOverview(dailyData || []);

      // Fetch traffic sources
      const { data: trafficData } = await supabase
        .from('traffic_by_source')
        .select('*')
        .limit(10);
      setTrafficSources(trafficData || []);

      // Fetch top products
      const { data: productsData } = await supabase
        .from('top_products_summary')
        .select('*')
        .limit(10);
      setTopProducts(productsData || []);

      // Fetch conversion funnel
      const { data: funnelDataResult } = await supabase
        .from('conversion_funnel_summary')
        .select('*')
        .single();
      setFunnelData(funnelDataResult);

      // Fetch Stripe orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setStripeOrders(ordersData || []);

      // Fetch visits
      const { data: visitsData } = await supabase
        .from('visits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setVisits(visitsData || []);

      // Fetch page views
      const { data: pageViewsData } = await supabase
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setPageViews(pageViewsData || []);

      // Fetch events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setEvents(eventsData || []);

      // Fetch cart events
      const { data: cartEventsData } = await supabase
        .from('cart_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setCartEvents(cartEventsData || []);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [days]);

  const totalVisitors = dailyOverview.reduce((sum, d) => sum + (d.unique_visitors || 0), 0);
  const totalRevenue = dailyOverview.reduce((sum, d) => sum + (parseFloat(d.revenue) || 0), 0);
  const totalOrders = dailyOverview.reduce((sum, d) => sum + (d.total_orders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'cancelled':
      case 'refunded':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ShopifySidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <ShopifyHeader
          title="Curlea Analytics Dashboard"
          subtitle="Real-time insights into your store performance"
          showDateRange
          dateRange={days}
          onDateRangeChange={setDays}
          onRefresh={fetchData}
          loading={loading}
          actions={
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live data</span>
              <span className="text-gray-400">•</span>
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          }
        />

        <div className="p-8 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <ShopifyStatCard
                  title="Total Visits"
                  value={formatNumber(totalVisitors)}
                  icon={<Users className="w-5 h-5" />}
                  subtitle={`Last ${days} days`}
                />
                <ShopifyStatCard
                  title="Total Revenue"
                  value={formatCurrency(totalRevenue)}
                  icon={<DollarSign className="w-5 h-5" />}
                  subtitle={`Last ${days} days`}
                />
                <ShopifyStatCard
                  title="Total Orders"
                  value={formatNumber(totalOrders)}
                  icon={<ShoppingBag className="w-5 h-5" />}
                  subtitle={`Last ${days} days`}
                />
                <ShopifyStatCard
                  title="Avg Order Value"
                  value={formatCurrency(avgOrderValue)}
                  icon={<TrendingUp className="w-5 h-5" />}
                  subtitle={`Last ${days} days`}
                />
              </div>

              {/* Conversion Funnel */}
              <ShopifyCard title="Conversion Funnel" subtitle="Last 30 days performance">
                {funnelData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-2">Visits</div>
                        <div className="text-3xl font-bold text-gray-900">
                          {formatNumber(funnelData.total_visits || 0)}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-2">Product Views</div>
                        <div className="text-3xl font-bold text-gray-900">
                          {formatNumber(funnelData.product_views || 0)}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-2">Add to Cart</div>
                        <div className="text-3xl font-bold text-gray-900">
                          {formatNumber(funnelData.add_to_cart || 0)}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-2">Checkout Start</div>
                        <div className="text-3xl font-bold text-gray-900">
                          {formatNumber(funnelData.checkout_started || 0)}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm font-medium text-green-700 mb-2">Purchases</div>
                        <div className="text-3xl font-bold text-green-700">
                          {formatNumber(funnelData.orders_completed || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-2">Visit to Cart Rate</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {funnelData.visit_to_cart_rate?.toFixed(2) || '0.00'}%
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-2">Cart to Purchase Rate</div>
                        <div className="text-2xl font-bold text-green-600">
                          {funnelData.cart_to_purchase_rate?.toFixed(2) || '0.00'}%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Loading funnel data...</div>
                )}
              </ShopifyCard>

              {/* Traffic Sources */}
              <ShopifyCard title="Traffic Sources" subtitle="Where your visitors come from" noPadding>
                <ShopifyTable
                  columns={[
                    { key: 'source', header: 'Source' },
                    { key: 'visit_count', header: 'Visits', align: 'right', render: (val) => formatNumber(val || 0) },
                  ]}
                  data={trafficSources}
                  loading={loading}
                  emptyMessage="No traffic data available"
                />
              </ShopifyCard>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <ShopifyCard title="Daily Sales" subtitle="Sales performance by day" noPadding>
                <ShopifyTable
                  columns={[
                    { key: 'date', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
                    {
                      key: 'total_orders',
                      header: 'Orders',
                      align: 'right',
                      render: (val) => <span className="font-medium">{formatNumber(val || 0)}</span>,
                    },
                    {
                      key: 'revenue',
                      header: 'Revenue',
                      align: 'right',
                      render: (val) => (
                        <span className="font-semibold text-green-600">{formatCurrency(parseFloat(val) || 0)}</span>
                      ),
                    },
                  ]}
                  data={dailyOverview}
                  loading={loading}
                  emptyMessage="No sales data available"
                />
              </ShopifyCard>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <ShopifyCard title="All Orders" subtitle="Recent orders from Stripe" noPadding>
                <ShopifyTable
                  columns={[
                    {
                      key: 'order_number',
                      header: 'Order #',
                      render: (val) => <span className="font-mono text-xs">{val}</span>,
                    },
                    { key: 'customer_email', header: 'Customer' },
                    {
                      key: 'total_amount',
                      header: 'Amount',
                      align: 'right',
                      render: (val) => <span className="font-semibold">{formatCurrency(val)}</span>,
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      render: (val) => <ShopifyBadge variant={getStatusVariant(val)}>{val}</ShopifyBadge>,
                    },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
                  ]}
                  data={stripeOrders}
                  loading={loading}
                  emptyMessage="No orders found"
                />
              </ShopifyCard>
            </div>
          )}

          {/* Traffic Tab */}
          {activeTab === 'traffic' && (
            <div className="space-y-6">
              <ShopifyCard title="Recent Visits" subtitle="Visitor activity" noPadding>
                <ShopifyTable
                  columns={[
                    {
                      key: 'session_id',
                      header: 'Session',
                      render: (val) => <span className="font-mono text-xs">{val?.slice(0, 8)}...</span>,
                    },
                    { key: 'device', header: 'Device', render: (val) => val || '-' },
                    { key: 'browser', header: 'Browser', render: (val) => val || '-' },
                    { key: 'country', header: 'Country', render: (val) => val || '-' },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleString() },
                  ]}
                  data={visits}
                  loading={loading}
                  emptyMessage="No visits found"
                />
              </ShopifyCard>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <ShopifyCard title="Recent Events" subtitle="Custom event tracking" noPadding>
                <ShopifyTable
                  columns={[
                    { key: 'event_name', header: 'Event', render: (val) => <span className="font-medium">{val}</span> },
                    { key: 'event_category', header: 'Category', render: (val) => val || '-' },
                    { key: 'event_label', header: 'Label', render: (val) => val || '-' },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleString() },
                  ]}
                  data={events}
                  loading={loading}
                  emptyMessage="No events found"
                />
              </ShopifyCard>
            </div>
          )}

          {/* Page Views Tab */}
          {activeTab === 'pageviews' && (
            <div className="space-y-6">
              <ShopifyCard title="Page Views" subtitle="Recent page activity" noPadding>
                <ShopifyTable
                  columns={[
                    { key: 'path', header: 'Path', render: (val) => <span className="font-mono text-xs">{val}</span> },
                    { key: 'title', header: 'Title', render: (val) => val || '-' },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleString() },
                  ]}
                  data={pageViews}
                  loading={loading}
                  emptyMessage="No page views found"
                />
              </ShopifyCard>
            </div>
          )}

          {/* Cart Events Tab */}
          {activeTab === 'cartevents' && (
            <div className="space-y-6">
              <ShopifyCard title="Cart Events" subtitle="Shopping cart activity" noPadding>
                <ShopifyTable
                  columns={[
                    {
                      key: 'event_type',
                      header: 'Type',
                      render: (val) => {
                        const variant =
                          val === 'add'
                            ? 'success'
                            : val === 'remove'
                            ? 'error'
                            : val === 'checkout_start'
                            ? 'info'
                            : ('info' as any);
                        return <ShopifyBadge variant={variant}>{val}</ShopifyBadge>;
                      },
                    },
                    { key: 'product_title', header: 'Product', render: (val) => val || '-' },
                    { key: 'quantity', header: 'Qty', align: 'right' },
                    { key: 'price', header: 'Price', align: 'right', render: (val) => formatCurrency(val || 0) },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleString() },
                  ]}
                  data={cartEvents}
                  loading={loading}
                  emptyMessage="No cart events found"
                />
              </ShopifyCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

