/**
 * Analytics Dashboard Page - Shopify Style
 * View all Supabase analytics data in one place
 * 
 * NOTE: This file is synced with analytics-backend/analytics-dashboard/src/components/DashboardShopify.tsx
 * Both files should be identical (except function name)
 */

import { useState, useEffect } from 'react';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import {
  useDailyOverview,
  useSalesOverview,
  useTopProducts,
  useTrafficSources,
  useConversionFunnel,
  useAbandonedCarts,
} from '@/hooks/useSupabaseAnalytics';
import { useConversionFunnelHistory } from '@/hooks/useConversionFunnelHistory';
import {
  useRecentVisits,
  useRecentPageViews,
  useRecentEvents,
  useAllCartEvents,
  useStripeOrders,
  useAnalyticsOrders,
  useOrderItems,
} from '@/hooks/useSupabaseRawData';
import { getActiveCampaigns, getCampaignPerformance } from '@/utils/supabase/campaigns';
import { getVisitorStats } from '@/utils/supabase/visitorStats';
import { PricingManagement } from '@/components/PricingManagement';
import { ShopifyStatCard } from '@/components/dashboard/ShopifyStatCard';
import { ShopifyCard } from '@/components/dashboard/ShopifyCard';
import { ShopifyTable } from '@/components/dashboard/ShopifyTable';
import { ShopifyBadge } from '@/components/dashboard/ShopifyBadge';
import { ShopifyButton } from '@/components/dashboard/ShopifyButton';
import { ShopifySidebar } from '@/components/dashboard/ShopifySidebar';
import { ShopifyHeader } from '@/components/dashboard/ShopifyHeader';
import { Users, DollarSign, ShoppingBag, TrendingUp, Eye } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [days, setDays] = useState(30);
  const [campaigns, setCampaigns] = useState<any[] | null>(null);
  const [campaignPerformance, setCampaignPerformance] = useState<any[] | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [visitorStats, setVisitorStats] = useState<{
    unique_visitors: number;
    total_visits: number;
    mobile_visitors: number;
    desktop_visitors: number;
    tablet_visitors: number;
  } | null>(null);
  const [visitorStatsLoading, setVisitorStatsLoading] = useState(true);

  // Products
  const { products: supabaseProducts, loading: productsLoading, syncProducts } = useSupabaseProducts();

  // Analytics hooks (aggregated views)
  const daily = useDailyOverview(days);
  const sales = useSalesOverview(days);
  const topProducts = useTopProducts(10);
  const traffic = useTrafficSources();
  const funnel = useConversionFunnel();
  const abandoned = useAbandonedCarts(7);
  const funnelHistory = useConversionFunnelHistory(days);

  // Raw data hooks (direct table access)
  const visits = useRecentVisits(days);
  const pageViews = useRecentPageViews(days);
  const events = useRecentEvents(undefined, days);
  const cartEvents = useAllCartEvents(days);
  const stripeOrders = useStripeOrders(50);
  const analyticsOrders = useAnalyticsOrders(days);
  const orderItems = useOrderItems(selectedOrderId);

  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [campaignPerformanceLoading, setCampaignPerformanceLoading] = useState(true);
  const [campaignPerformanceError, setCampaignPerformanceError] = useState<string | null>(null);

  // Load campaigns
  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    setCampaignsError(null);
    try {
      const result = await getActiveCampaigns();
      if (result.error) {
        setCampaignsError(result.error);
        setCampaigns([]);
      } else {
        setCampaigns(result.data || []);
      }
    } catch (error: any) {
      setCampaignsError(error.message);
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  };

  // Load campaign performance
  const loadCampaignPerformance = async () => {
    setCampaignPerformanceLoading(true);
    setCampaignPerformanceError(null);
    try {
      const result = await getCampaignPerformance();
      if (result.error) {
        setCampaignPerformanceError(result.error);
        setCampaignPerformance([]);
      } else {
        setCampaignPerformance(result.data || []);
      }
    } catch (error: any) {
      setCampaignPerformanceError(error.message);
      setCampaignPerformance([]);
    } finally {
      setCampaignPerformanceLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
    loadCampaignPerformance();
    loadVisitorStats();
  }, [days]);

  // Load visitor stats directly from visits table
  const loadVisitorStats = async () => {
    setVisitorStatsLoading(true);
    try {
      const result = await getVisitorStats(days);
      if (result.error) {
        console.error('Error loading visitor stats:', result.error);
      } else {
        setVisitorStats(result.data);
      }
    } catch (error) {
      console.error('Error loading visitor stats:', error);
    } finally {
      setVisitorStatsLoading(false);
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

  // Refresh all data
  const refreshData = () => {
    loadCampaigns();
    loadCampaignPerformance();
    loadVisitorStats();
    syncProducts();
  };

  // Get status badge variant
  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'cancelled':
      case 'refunded': return 'error';
      default: return 'neutral' as any;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Shopify-style Sidebar */}
      <ShopifySidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 w-full">
        <ShopifyHeader
          title="Analytics Dashboard"
          subtitle="View and explore your live business metrics"
          showDateRange
          dateRange={days}
          onDateRangeChange={setDays}
          onRefresh={refreshData}
          loading={productsLoading}
          actions={
            <ShopifyButton onClick={() => syncProducts()} loading={productsLoading} className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Sync Products</span>
              <span className="sm:hidden">Sync</span>
            </ShopifyButton>
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <ShopifyStatCard
                  title="Total Visitors"
                  value={visitorStatsLoading ? '...' : formatNumber(visitorStats?.unique_visitors || 0)}
                  icon={<Users className="w-5 h-5" />}
                  subtitle={`Last ${days} days`}
                />
                <ShopifyStatCard
                  title="Total Revenue"
                  value={sales.loading ? '...' : formatCurrency(sales.data?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0)}
                  icon={<DollarSign className="w-5 h-5" />}
                  subtitle={`Last ${days} days`}
                />
                <ShopifyStatCard
                  title="Total Orders"
                  value={sales.loading ? '...' : formatNumber(sales.data?.reduce((sum, d) => sum + (d.total_orders || 0), 0) || 0)}
                  icon={<ShoppingBag className="w-5 h-5" />}
                  subtitle={`Last ${days} days`}
                />
                <ShopifyStatCard
                  title="Avg Order Value"
                  value={sales.loading ? '...' : formatCurrency(sales.data?.reduce((sum, d) => sum + (d.aov || 0), 0) / (sales.data?.length || 1) || 0)}
                  icon={<TrendingUp className="w-5 h-5" />}
                  subtitle={`Last ${days} days`}
                />
              </div>

              {/* Conversion Funnel */}
              <ShopifyCard
                title="Conversion Funnel"
                subtitle="Last 30 days performance"
              >
                {funnel.loading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : funnel.error ? (
                  <div className="text-center py-8 text-red-500">Error: {funnel.error}</div>
                ) : (
                  <div className="space-y-6">
                    {funnel.data?.[0] && (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Visits</div>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{formatNumber(funnel.data[0].total_visits || 0)}</div>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Product Views</div>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{formatNumber(funnel.data[0].product_views || 0)}</div>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Add to Cart</div>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{formatNumber(funnel.data[0].add_to_cart || 0)}</div>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Checkout Start</div>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{formatNumber(funnel.data[0].checkout_start || 0)}</div>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 col-span-2 sm:col-span-1">
                            <div className="text-xs sm:text-sm font-medium text-green-700 mb-1 sm:mb-2">Purchases</div>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700">{formatNumber(funnel.data[0].purchases || 0)}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Visit to Cart Rate</div>
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">
                              {funnel.data[0].visit_to_cart_rate?.toFixed(2) || '0.00'}%
                            </div>
                          </div>
                          <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Cart to Purchase Rate</div>
                            <div className="text-xl sm:text-2xl font-bold text-green-600">
                              {funnel.data[0].cart_to_purchase_rate?.toFixed(2) || '0.00'}%
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </ShopifyCard>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <ShopifyCard
                title="Sales Overview"
                subtitle="Daily sales metrics"
                noPadding
              >
                <ShopifyTable
                  columns={[
                    { key: 'date', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
                    { key: 'total_orders', header: 'Orders', align: 'right', render: (val) => <span className="font-medium">{formatNumber(val || 0)}</span> },
                    { key: 'unique_customers', header: 'Customers', align: 'right', render: (val) => formatNumber(val || 0) },
                    { key: 'revenue', header: 'Revenue', align: 'right', render: (val) => <span className="font-semibold text-green-600">{formatCurrency(val || 0)}</span> },
                    { key: 'profit', header: 'Profit', align: 'right', render: (val) => <span className="font-medium">{formatCurrency(val || 0)}</span> },
                    { key: 'aov', header: 'AOV', align: 'right', render: (val) => formatCurrency(val || 0) },
                  ]}
                  data={sales.data || []}
                  loading={sales.loading}
                  emptyMessage={sales.error || 'No sales data available'}
                />
              </ShopifyCard>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <ShopifyCard
                title="Stripe Orders"
                subtitle={stripeOrders.loading ? 'Loading...' : stripeOrders.error ? `Error: ${stripeOrders.error}` : `${stripeOrders.data?.length || 0} orders from stripe_orders table`}
                noPadding
              >
                {stripeOrders.error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p className="font-semibold">Error loading Stripe orders:</p>
                    <p className="text-sm mt-1">{stripeOrders.error}</p>
                  </div>
                )}
                <ShopifyTable
                  columns={[
                    { key: 'order_number', header: 'Order #', render: (val) => <span className="font-mono text-xs">{val}</span> },
                    { key: 'customer_email', header: 'Customer', render: (val) => val || '-' },
                    { key: 'total_amount', header: 'Amount', align: 'right', render: (val) => <span className="font-semibold">{formatCurrency(val)}</span> },
                    { key: 'currency', header: 'Currency', render: (val) => val || 'USD' },
                    { key: 'status', header: 'Status', render: (val) => <ShopifyBadge variant={getStatusVariant(val)}>{val}</ShopifyBadge> },
                    { key: 'is_guest', header: 'Guest', render: (val) => val ? 'Yes' : 'No' },
                    { key: 'stripe_session_id', header: 'Stripe Session', render: (val) => val ? <span className="font-mono text-xs">{val.substring(0, 20)}...</span> : '-' },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
                    { 
                      key: 'id', 
                      header: 'Actions', 
                      render: (val) => (
                        <ShopifyButton 
                          variant="plain" 
                          size="small"
                          onClick={() => setSelectedOrderId(selectedOrderId === val ? null : val)}
                        >
                          {selectedOrderId === val ? 'Hide' : 'View'} Items
                        </ShopifyButton>
                      ) 
                    },
                  ]}
                  data={stripeOrders.data || []}
                  loading={stripeOrders.loading}
                  emptyMessage={stripeOrders.error || 'No orders found'}
                />
              </ShopifyCard>

              {selectedOrderId && (
                <ShopifyCard
                  title="Order Items"
                  subtitle="Items for selected order"
                  noPadding
                >
                  <ShopifyTable
                    columns={[
                      { key: 'product_name', header: 'Product' },
                      { key: 'product_id', header: 'Product ID', render: (val) => val ? <span className="font-mono text-xs">{val}</span> : '-' },
                      { key: 'variant', header: 'Variant', render: (val) => val || '-' },
                      { key: 'size', header: 'Size', render: (val) => val || '-' },
                      { key: 'color', header: 'Color', render: (val) => val || '-' },
                      { key: 'sku', header: 'SKU', render: (val) => val ? <span className="font-mono text-xs">{val}</span> : '-' },
                      { key: 'quantity', header: 'Qty', align: 'right' },
                      { key: 'unit_price', header: 'Price', align: 'right', render: (val) => formatCurrency(val) },
                      { key: 'total_price', header: 'Total', align: 'right', render: (val) => <span className="font-semibold">{formatCurrency(val)}</span> },
                      { key: 'image_url', header: 'Image', render: (val) => val ? <img src={val} alt="" className="w-10 h-10 object-cover rounded" /> : '-' },
                    ]}
                    data={orderItems.data || []}
                    loading={orderItems.loading}
                    emptyMessage="No items found"
                  />
                </ShopifyCard>
              )}

              <ShopifyCard
                title="Analytics Orders"
                subtitle={analyticsOrders.loading ? 'Loading...' : analyticsOrders.error ? `Error: ${analyticsOrders.error}` : `${analyticsOrders.data?.length || 0} orders from orders table (analytics)`}
                noPadding
              >
                {analyticsOrders.error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p className="font-semibold">Error loading analytics orders:</p>
                    <p className="text-sm mt-1">{analyticsOrders.error}</p>
                  </div>
                )}
                <ShopifyTable
                  columns={[
                    { key: 'order_id', header: 'Order ID', render: (val) => <span className="font-mono text-xs">{val}</span> },
                    { key: 'session_id', header: 'Session', render: (val) => val ? <span className="font-mono text-xs">{val.substring(0, 15)}...</span> : '-' },
                    { key: 'customer_email', header: 'Customer', render: (val) => val || 'Anonymous' },
                    { key: 'customer_id', header: 'Customer ID', render: (val) => val ? <span className="font-mono text-xs">{val}</span> : '-' },
                    { key: 'subtotal', header: 'Subtotal', align: 'right', render: (val) => formatCurrency(val || 0) },
                    { key: 'discount_total', header: 'Discount', align: 'right', render: (val) => formatCurrency(val || 0) },
                    { key: 'shipping_total', header: 'Shipping', align: 'right', render: (val) => formatCurrency(val || 0) },
                    { key: 'tax_total', header: 'Tax', align: 'right', render: (val) => formatCurrency(val || 0) },
                    { key: 'total_value', header: 'Total', align: 'right', render: (val) => <span className="font-semibold text-green-600">{formatCurrency(val)}</span> },
                    { key: 'total_cost', header: 'Cost', align: 'right', render: (val) => val !== null ? formatCurrency(val) : '-' },
                    { key: 'profit', header: 'Profit', align: 'right', render: (val) => val !== null ? formatCurrency(val) : '-' },
                    { key: 'currency', header: 'Currency', render: (val) => val || 'USD' },
                    { key: 'payment_method', header: 'Payment', render: (val) => val || '-' },
                    { key: 'shipping_method', header: 'Shipping Method', render: (val) => val || '-' },
                    { key: 'source', header: 'Source', render: (val) => val || '-' },
                    { key: 'utm_source', header: 'UTM Source', render: (val) => val || '-' },
                    { key: 'utm_medium', header: 'UTM Medium', render: (val) => val || '-' },
                    { key: 'utm_campaign', header: 'UTM Campaign', render: (val) => val || '-' },
                    { key: 'status', header: 'Status', render: (val) => <ShopifyBadge variant={getStatusVariant(val)}>{val || '-'}</ShopifyBadge> },
                    { key: 'fulfillment_status', header: 'Fulfillment', render: (val) => val || '-' },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
                  ]}
                  data={analyticsOrders.data || []}
                  loading={analyticsOrders.loading}
                  emptyMessage={analyticsOrders.error || 'No analytics orders found'}
                />
              </ShopifyCard>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <ShopifyCard
                title="Product Catalog"
                subtitle={supabaseProducts ? `${supabaseProducts.length} products synced` : 'No products synced yet'}
                actions={
                  <ShopifyButton onClick={() => syncProducts()} loading={productsLoading} size="small">
                    Sync Now
                  </ShopifyButton>
                }
              >
                {productsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading products...</div>
                ) : supabaseProducts && supabaseProducts.length > 0 ? (
                  <div className="space-y-3">
                    {supabaseProducts.slice(0, 10).map((product) => (
                      <div key={product.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{product.title}</div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            {product.category}
                            {product.subcategory && ` • ${product.subcategory}`}
                          </div>
                          {product.sku && (
                            <div className="text-xs text-gray-400 mt-1">SKU: {product.sku}</div>
                          )}
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="font-semibold text-sm sm:text-base text-gray-900">{formatCurrency(product.price)}</div>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <div className="text-xs sm:text-sm text-gray-400 line-through">
                              {formatCurrency(product.compare_at_price)}
                            </div>
                          )}
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            Stock: {product.inventory_count || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No products in database yet</p>
                    <ShopifyButton onClick={() => syncProducts()}>Sync Products Now</ShopifyButton>
                  </div>
                )}
              </ShopifyCard>

              <ShopifyCard
                title="Top Products by Revenue"
                subtitle="Best performing products"
                noPadding
              >
                <ShopifyTable
                  columns={[
                    { key: 'title', header: 'Product' },
                    { key: 'units_sold', header: 'Units Sold', align: 'right', render: (val) => formatNumber(val || 0) },
                    { key: 'revenue', header: 'Revenue', align: 'right', render: (val) => <span className="font-semibold text-green-600">{formatCurrency(val || 0)}</span> },
                    { key: 'avg_price', header: 'Avg Price', align: 'right', render: (val) => formatCurrency(val || 0) },
                  ]}
                  data={topProducts.data || []}
                  loading={topProducts.loading}
                  emptyMessage="No product revenue data available"
                />
              </ShopifyCard>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <PricingManagement />
            </div>
          )}

          {/* Traffic Tab */}
          {activeTab === 'traffic' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                <ShopifyStatCard
                  title="Unique Visitors"
                  value={formatNumber(visitorStats?.unique_visitors || 0)}
                  icon={<Users className="w-5 h-5" />}
                  subtitle="From visits table"
                />
                <ShopifyStatCard
                  title="Total Visits"
                  value={formatNumber(visitorStats?.total_visits || 0)}
                  icon={<Eye className="w-5 h-5" />}
                  subtitle="All visit records"
                />
                <ShopifyStatCard
                  title="Mobile Visitors"
                  value={formatNumber(visitorStats?.mobile_visitors || 0)}
                  subtitle="Mobile devices"
                />
                <ShopifyStatCard
                  title="Desktop Visitors"
                  value={formatNumber(visitorStats?.desktop_visitors || 0)}
                  subtitle="Desktop computers"
                />
                <ShopifyStatCard
                  title="Tablet Visitors"
                  value={formatNumber(visitorStats?.tablet_visitors || 0)}
                  subtitle="Tablet devices"
                />
              </div>

              <ShopifyCard
                title="Traffic Sources"
                subtitle="Where your visitors come from"
                noPadding
              >
                <ShopifyTable
                  columns={[
                    { key: 'source', header: 'Source', render: (val) => val || 'Direct' },
                    { key: 'medium', header: 'Medium', render: (val) => val || 'none' },
                    { key: 'visitors', header: 'Visitors', align: 'right', render: (val) => <span className="font-medium">{formatNumber(val || 0)}</span> },
                    { key: 'visits', header: 'Visits', align: 'right', render: (val) => formatNumber(val || 0) },
                  ]}
                  data={traffic.data || []}
                  loading={traffic.loading}
                  emptyMessage="No traffic data available"
                />
              </ShopifyCard>

              <ShopifyCard
                title="Daily Visitors"
                subtitle="Visitor stats by date"
                noPadding
              >
                <ShopifyTable
                  columns={[
                    { key: 'date', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
                    { key: 'unique_visitors', header: 'Unique', align: 'right', render: (val) => <span className="font-medium">{formatNumber(val || 0)}</span> },
                    { key: 'total_visits', header: 'Total', align: 'right', render: (val) => formatNumber(val || 0) },
                    { key: 'mobile_visitors', header: 'Mobile', align: 'right', render: (val) => formatNumber(val || 0) },
                    { key: 'desktop_visitors', header: 'Desktop', align: 'right', render: (val) => formatNumber(val || 0) },
                  ]}
                  data={daily.data || []}
                  loading={daily.loading}
                  emptyMessage="No daily visitor data available"
                />
              </ShopifyCard>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <ShopifyCard
                title="Recent Events"
                subtitle={events.loading ? 'Loading...' : events.error ? `Error: ${events.error}` : `${events.data?.length || 0} events (Last ${days} days)`}
                noPadding
              >
                {events.error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p className="font-semibold">Error loading events:</p>
                    <p className="text-sm mt-1">{events.error}</p>
                  </div>
                )}
                <ShopifyTable
                  columns={[
                    { key: 'event_name', header: 'Event', render: (val) => <span className="font-medium">{val}</span> },
                    { key: 'event_category', header: 'Category', render: (val) => val || '-' },
                    { key: 'event_label', header: 'Label', render: (val) => val || '-' },
                    { key: 'event_value', header: 'Value', align: 'right', render: (val) => val ?? '-' },
                    { key: 'session_id', header: 'Session', render: (val) => val ? <span className="font-mono text-xs">{val.slice(0, 8)}...</span> : '-' },
                    { key: 'visit_id', header: 'Visit ID', render: (val) => val ? <span className="font-mono text-xs">{val.slice(0, 8)}...</span> : '-' },
                    { key: 'payload', header: 'Payload', render: (val) => val ? <span className="font-mono text-xs">{JSON.stringify(val).substring(0, 50)}...</span> : '-' },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleString() },
                  ]}
                  data={events.data || []}
                  loading={events.loading}
                  emptyMessage={events.error || 'No events found'}
                />
              </ShopifyCard>
            </div>
          )}

          {/* Visits Tab */}
          {activeTab === 'visits' && (
            <div className="space-y-6">
              <ShopifyCard
                title="Recent Visits"
                subtitle={visits.loading ? 'Loading...' : visits.error ? `Error: ${visits.error}` : `${visits.data?.length || 0} visits from visits table`}
                noPadding
              >
                {visits.error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p className="font-semibold">Error loading visits:</p>
                    <p className="text-sm mt-1">{visits.error}</p>
                  </div>
                )}
                <ShopifyTable
                  columns={[
                    { key: 'session_id', header: 'Session', render: (val) => <span className="font-mono text-xs">{val?.slice(0, 8)}...</span> },
                    { key: 'ip_address', header: 'IP', render: (val) => val || '-' },
                    { key: 'device', header: 'Device', render: (val) => val || '-' },
                    { key: 'browser', header: 'Browser', render: (val) => val || '-' },
                    { key: 'os', header: 'OS', render: (val) => val || '-' },
                    { key: 'country', header: 'Country', render: (val) => val || '-' },
                    { key: 'city', header: 'City', render: (val) => val || '-' },
                    { key: 'region', header: 'Region', render: (val) => val || '-' },
                    { key: 'referrer', header: 'Referrer', render: (val) => val ? <span className="text-xs truncate max-w-xs">{val}</span> : '-' },
                    { key: 'landing_page', header: 'Landing Page', render: (val) => val ? <span className="text-xs truncate max-w-xs">{val}</span> : '-' },
                    { key: 'utm_source', header: 'UTM Source', render: (val) => val || '-' },
                    { key: 'utm_medium', header: 'UTM Medium', render: (val) => val || '-' },
                    { key: 'utm_campaign', header: 'UTM Campaign', render: (val) => val || '-' },
                    { key: 'utm_term', header: 'UTM Term', render: (val) => val || '-' },
                    { key: 'utm_content', header: 'UTM Content', render: (val) => val || '-' },
                    { key: 'is_mobile', header: 'Mobile', render: (val) => val ? 'Yes' : 'No' },
                    { key: 'is_tablet', header: 'Tablet', render: (val) => val ? 'Yes' : 'No' },
                    { key: 'is_desktop', header: 'Desktop', render: (val) => val ? 'Yes' : 'No' },
                    { key: 'screen_width', header: 'Width', align: 'right', render: (val) => val || '-' },
                    { key: 'screen_height', header: 'Height', align: 'right', render: (val) => val || '-' },
                    { key: 'language', header: 'Language', render: (val) => val || '-' },
                    { key: 'timezone', header: 'Timezone', render: (val) => val || '-' },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleString() },
                  ]}
                  data={visits.data || []}
                  loading={visits.loading}
                  emptyMessage={visits.error || 'No visits found'}
                />
              </ShopifyCard>
            </div>
          )}

          {/* Page Views Tab */}
          {activeTab === 'pageviews' && (
            <div className="space-y-6">
              <ShopifyCard
                title="Recent Page Views"
                subtitle={pageViews.loading ? 'Loading...' : pageViews.error ? `Error: ${pageViews.error}` : `${pageViews.data?.length || 0} page views from page_views table`}
                noPadding
              >
                {pageViews.error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p className="font-semibold">Error loading page views:</p>
                    <p className="text-sm mt-1">{pageViews.error}</p>
                  </div>
                )}
                <ShopifyTable
                  columns={[
                    { key: 'session_id', header: 'Session', render: (val) => val ? <span className="font-mono text-xs">{val.slice(0, 8)}...</span> : '-' },
                    { key: 'visit_id', header: 'Visit ID', render: (val) => val ? <span className="font-mono text-xs">{val.slice(0, 8)}...</span> : '-' },
                    { key: 'url', header: 'URL', render: (val) => val ? <span className="font-mono text-xs truncate max-w-xs">{val}</span> : '-' },
                    { key: 'path', header: 'Path', render: (val, row) => <span className="font-mono text-xs">{val || row.url || '-'}</span> },
                    { key: 'title', header: 'Title', render: (val) => val || '-' },
                    { key: 'referrer', header: 'Referrer', render: (val) => val ? <span className="text-xs truncate max-w-xs">{val}</span> : '-' },
                    { key: 'scroll_depth', header: 'Scroll', align: 'right', render: (val) => `${val || 0}%` },
                    { key: 'time_on_page', header: 'Time (s)', align: 'right', render: (val) => val || 0 },
                    { key: 'engaged', header: 'Engaged', align: 'center', render: (val) => val ? <ShopifyBadge variant="success">Yes</ShopifyBadge> : <ShopifyBadge variant="neutral">No</ShopifyBadge> },
                    { key: 'bounce', header: 'Bounce', align: 'center', render: (val) => val ? <ShopifyBadge variant="error">Yes</ShopifyBadge> : <ShopifyBadge variant="neutral">No</ShopifyBadge> },
                    { key: 'exit', header: 'Exit', align: 'center', render: (val) => val ? <ShopifyBadge variant="warning">Yes</ShopifyBadge> : <ShopifyBadge variant="neutral">No</ShopifyBadge> },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleString() },
                  ]}
                  data={pageViews.data || []}
                  loading={pageViews.loading}
                  emptyMessage={pageViews.error || 'No page views found'}
                />
              </ShopifyCard>
            </div>
          )}

          {/* Cart Events Tab */}
          {activeTab === 'cartevents' && (
            <div className="space-y-6">
              <ShopifyCard
                title="Cart Events"
                subtitle={cartEvents.loading ? 'Loading...' : cartEvents.error ? `Error: ${cartEvents.error}` : `${cartEvents.data?.length || 0} cart events from cart_events table`}
                noPadding
              >
                {cartEvents.error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p className="font-semibold">Error loading cart events:</p>
                    <p className="text-sm mt-1">{cartEvents.error}</p>
                  </div>
                )}
                <ShopifyTable
                  columns={[
                    { 
                      key: 'event_type', 
                      header: 'Type', 
                      render: (val) => {
                        const variant = val === 'add' ? 'success' : val === 'remove' ? 'error' : val === 'checkout_start' ? 'info' : 'neutral' as any;
                        return <ShopifyBadge variant={variant}>{val}</ShopifyBadge>;
                      }
                    },
                    { key: 'session_id', header: 'Session', render: (val) => val ? <span className="font-mono text-xs">{val.slice(0, 8)}...</span> : '-' },
                    { key: 'visit_id', header: 'Visit ID', render: (val) => val ? <span className="font-mono text-xs">{val.slice(0, 8)}...</span> : '-' },
                    { key: 'product_id', header: 'Product ID', render: (val) => val ? <span className="font-mono text-xs">{val.slice(0, 8)}...</span> : '-' },
                    { key: 'external_product_id', header: 'External Product ID', render: (val) => val || '-' },
                    { key: 'product_title', header: 'Product', render: (val) => val || '-' },
                    { key: 'variant_id', header: 'Variant ID', render: (val) => val || '-' },
                    { key: 'variant_title', header: 'Variant', render: (val) => val || '-' },
                    { key: 'quantity', header: 'Qty', align: 'right', render: (val) => val || 0 },
                    { key: 'price', header: 'Price', align: 'right', render: (val) => formatCurrency(val || 0) },
                    { key: 'total_value', header: 'Total Value', align: 'right', render: (val) => val ? formatCurrency(val) : '-' },
                    { key: 'cart_total', header: 'Cart Total', align: 'right', render: (val) => val ? <span className="font-semibold">{formatCurrency(val)}</span> : '-' },
                    { key: 'discount_code', header: 'Discount Code', render: (val) => val || '-' },
                    { key: 'discount_amount', header: 'Discount', align: 'right', render: (val) => val ? formatCurrency(val) : '-' },
                    { key: 'created_at', header: 'Date', render: (val) => new Date(val).toLocaleString() },
                  ]}
                  data={cartEvents.data || []}
                  loading={cartEvents.loading}
                  emptyMessage={cartEvents.error || 'No cart events found'}
                />
              </ShopifyCard>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <ShopifyCard
                title="Active Campaigns"
                subtitle="Marketing campaigns and performance"
              >
                {campaignsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading campaigns...</div>
                ) : campaignsError ? (
                  <div className="text-center py-8 text-red-500">Error: {campaignsError}</div>
                ) : campaigns && campaigns.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {campaigns.map((campaign: any) => (
                      <div key={campaign.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{campaign.name}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">UTM: {campaign.utm_campaign}</div>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <div className="text-xs sm:text-sm text-gray-500">Cost</div>
                            <div className="font-semibold text-sm sm:text-base text-gray-900">{formatCurrency(campaign.cost || 0)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No campaigns found. Create campaigns in Supabase Dashboard to track marketing performance.
                  </p>
                )}
              </ShopifyCard>

              <ShopifyCard
                title="Campaign Performance"
                subtitle="Performance metrics for all campaigns"
                noPadding
              >
                <ShopifyTable
                  columns={[
                    { key: 'name', header: 'Campaign' },
                    { key: 'visitors', header: 'Visitors', align: 'right', render: (val) => formatNumber(val || 0) },
                    { key: 'orders', header: 'Orders', align: 'right', render: (val) => formatNumber(val || 0) },
                    { key: 'revenue', header: 'Revenue', align: 'right', render: (val) => <span className="font-semibold text-green-600">{formatCurrency(val || 0)}</span> },
                    { key: 'roi_percentage', header: 'ROI', align: 'right', render: (val) => `${val?.toFixed(2) || '0.00'}%` },
                  ]}
                  data={campaignPerformance || []}
                  loading={campaignPerformanceLoading}
                  emptyMessage={campaignPerformanceError || 'No campaign performance data available'}
                />
              </ShopifyCard>
            </div>
          )}

          {/* Funnel Tab - Abandoned Carts */}
          {activeTab === 'funnel' && (
            <div className="space-y-6">
              <ShopifyCard
                title="Abandoned Carts"
                subtitle="Last 7 days"
              >
                {abandoned.loading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : abandoned.data && abandoned.data.length > 0 ? (
                  <div className="space-y-3">
                    {abandoned.data.slice(0, 10).map((cart: any) => (
                      <div key={cart.session_id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs text-gray-600">{cart.session_id.slice(0, 8)}...</div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            {cart.items_count} items • {formatCurrency(cart.cart_value || 0)}
                          </div>
                        </div>
                        <div className="text-left sm:text-right text-xs sm:text-sm text-gray-500 flex-shrink-0">
                          {new Date(cart.last_cart_activity).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No abandoned carts found</p>
                )}
              </ShopifyCard>
            </div>
          )}

          {/* Funnel History Tab - Historical Conversion Data */}
          {activeTab === 'funnelhistory' && (
            <div className="space-y-6">
              <ShopifyCard
                title="Historical Conversion Funnel"
                subtitle={`Hourly conversion data (Last ${days} days)`}
                noPadding
              >
                <ShopifyTable
                  columns={[
                    { key: 'date', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
                    { key: 'hour', header: 'Hour', align: 'center', render: (val) => val !== null ? `${val}:00` : 'All Day' },
                    { key: 'total_visits', header: 'Visits', align: 'right', render: (val) => <span className="font-medium">{formatNumber(val || 0)}</span> },
                    { key: 'product_views', header: 'Views', align: 'right', render: (val) => formatNumber(val || 0) },
                    { key: 'add_to_cart', header: 'Add to Cart', align: 'right', render: (val) => formatNumber(val || 0) },
                    { key: 'checkout_start', header: 'Checkout', align: 'right', render: (val) => formatNumber(val || 0) },
                    { key: 'checkout_complete', header: 'Complete', align: 'right', render: (val) => <span className="font-semibold text-green-600">{formatNumber(val || 0)}</span> },
                    { key: 'revenue', header: 'Revenue', align: 'right', render: (val) => <span className="font-semibold text-green-600">{formatCurrency(val || 0)}</span> },
                  ]}
                  data={funnelHistory.data || []}
                  loading={funnelHistory.loading}
                  emptyMessage={funnelHistory.error || 'No funnel history data available'}
                />
              </ShopifyCard>

              {/* Funnel Visualization */}
              {funnelHistory.data && funnelHistory.data.length > 0 && (
                <ShopifyCard
                  title="Daily Funnel Summary"
                  subtitle="Aggregated daily conversion metrics"
                >
                  <div className="space-y-4">
                    {/* Group by date and sum metrics */}
                    {(() => {
                      const dailySummary = funnelHistory.data.reduce((acc: any, row: any) => {
                        const date = new Date(row.date).toLocaleDateString();
                        if (!acc[date]) {
                          acc[date] = {
                            total_visits: 0,
                            product_views: 0,
                            add_to_cart: 0,
                            checkout_start: 0,
                            checkout_complete: 0,
                            revenue: 0
                          };
                        }
                        acc[date].total_visits += row.total_visits || 0;
                        acc[date].product_views += row.product_views || 0;
                        acc[date].add_to_cart += row.add_to_cart || 0;
                        acc[date].checkout_start += row.checkout_start || 0;
                        acc[date].checkout_complete += row.checkout_complete || 0;
                        acc[date].revenue += parseFloat(row.revenue || 0);
                        return acc;
                      }, {});

                      return Object.entries(dailySummary).slice(0, 10).map(([date, metrics]: [string, any]) => (
                        <div key={date} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                          <div className="font-medium text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">{date}</div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                            <div>
                              <div className="text-xs text-gray-500">Visits</div>
                              <div className="text-base sm:text-lg font-semibold text-gray-900">{formatNumber(metrics.total_visits)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Views</div>
                              <div className="text-base sm:text-lg font-semibold text-gray-900">{formatNumber(metrics.product_views)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Cart</div>
                              <div className="text-base sm:text-lg font-semibold text-gray-900">{formatNumber(metrics.add_to_cart)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Checkout</div>
                              <div className="text-base sm:text-lg font-semibold text-gray-900">{formatNumber(metrics.checkout_start)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Complete</div>
                              <div className="text-base sm:text-lg font-semibold text-green-600">{formatNumber(metrics.checkout_complete)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Revenue</div>
                              <div className="text-base sm:text-lg font-semibold text-green-600">{formatCurrency(metrics.revenue)}</div>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </ShopifyCard>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
