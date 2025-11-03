/**
 * Analytics Dashboard Page
 * View all Supabase analytics data in one place
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsDashboard() {
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">View all your Supabase analytics data</p>
        </div>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border rounded-md"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button onClick={() => syncProducts()} disabled={productsLoading}>
            {productsLoading ? 'Syncing...' : 'Sync Products'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="pageviews">Pages</TabsTrigger>
          <TabsTrigger value="cartevents">Cart Events</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {visitorStatsLoading
                    ? '...'
                    : formatNumber(visitorStats?.unique_visitors || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique visitors from visits table (Last {days} days)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {visitorStatsLoading
                    ? '...'
                    : formatNumber(visitorStats?.total_visits || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All visit records from visits table (Last {days} days)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sales.loading ? '...' : formatCurrency(sales.data?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Last {days} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sales.loading ? '...' : formatNumber(sales.data?.reduce((sum, d) => sum + (d.total_orders || 0), 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Last {days} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sales.loading
                    ? '...'
                    : formatCurrency(
                        sales.data?.reduce((sum, d) => sum + (d.aov || 0), 0) / (sales.data?.length || 1) || 0
                      )}
                </div>
                <p className="text-xs text-muted-foreground">Last {days} days</p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel (Real-time)</CardTitle>
              <CardDescription>Last 30 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              {funnel.loading ? (
                <p>Loading...</p>
              ) : funnel.error ? (
                <p className="text-red-500">Error: {funnel.error}</p>
              ) : (
                <div className="space-y-4">
                  {funnel.data?.[0] && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Visits</div>
                          <div className="text-2xl font-bold">{formatNumber(funnel.data[0].total_visits || 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Product Views</div>
                          <div className="text-2xl font-bold">{formatNumber(funnel.data[0].product_views || 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Add to Cart</div>
                          <div className="text-2xl font-bold">{formatNumber(funnel.data[0].add_to_cart || 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Checkout Start</div>
                          <div className="text-2xl font-bold">{formatNumber(funnel.data[0].checkout_start || 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Purchases</div>
                          <div className="text-2xl font-bold">{formatNumber(funnel.data[0].purchases || 0)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Visit to Cart Rate</div>
                          <div className="text-xl font-bold">
                            {funnel.data[0].visit_to_cart_rate?.toFixed(2) || '0.00'}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Cart to Purchase Rate</div>
                          <div className="text-xl font-bold">
                            {funnel.data[0].cart_to_purchase_rate?.toFixed(2) || '0.00'}%
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Daily sales metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {sales.loading ? (
                <p>Loading sales data...</p>
              ) : sales.error ? (
                <p className="text-red-500">Error: {sales.error}</p>
              ) : sales.data && sales.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-right p-2">Orders</th>
                        <th className="text-right p-2">Customers</th>
                        <th className="text-right p-2">Revenue</th>
                        <th className="text-right p-2">Profit</th>
                        <th className="text-right p-2">AOV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.data.map((day: any) => (
                        <tr key={day.date} className="border-b">
                          <td className="p-2">{new Date(day.date).toLocaleDateString()}</td>
                          <td className="text-right p-2">{formatNumber(day.total_orders || 0)}</td>
                          <td className="text-right p-2">{formatNumber(day.unique_customers || 0)}</td>
                          <td className="text-right p-2 font-medium">{formatCurrency(day.revenue || 0)}</td>
                          <td className="text-right p-2">{formatCurrency(day.profit || 0)}</td>
                          <td className="text-right p-2">{formatCurrency(day.aov || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No sales data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab - Shows all orders from both tables */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Orders (public.orders)</CardTitle>
              <CardDescription>All orders from Stripe payments with order items</CardDescription>
            </CardHeader>
            <CardContent>
              {stripeOrders.loading ? (
                <p>Loading orders...</p>
              ) : stripeOrders.error ? (
                <p className="text-red-500">Error: {stripeOrders.error}</p>
              ) : stripeOrders.data && stripeOrders.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Order #</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-right p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stripeOrders.data.map((order: any) => (
                        <tr key={order.id} className="border-b">
                          <td className="p-2 font-mono text-xs">{order.order_number}</td>
                          <td className="p-2 text-xs">
                            <div className="font-medium">{order.customer_email || 'N/A'}</div>
                            {/* Extract phone from shipping_address JSONB */}
                            {order.shipping_address?.phone && (
                              <div className="text-muted-foreground text-xs mt-1">📞 {order.shipping_address.phone}</div>
                            )}
                            {order.billing_address?.phone && !order.shipping_address?.phone && (
                              <div className="text-muted-foreground text-xs mt-1">📞 {order.billing_address.phone}</div>
                            )}
                          </td>
                          <td className="text-right p-2 font-medium">
                            {formatCurrency(order.total_amount)}
                          </td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="p-2 text-xs">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setSelectedOrderId(selectedOrderId === order.id ? null : order.id)
                              }
                            >
                              {selectedOrderId === order.id ? 'Hide' : 'View'} Items
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No Stripe orders found</p>
              )}
            </CardContent>
          </Card>

          {selectedOrderId && (
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Items for selected order</CardDescription>
              </CardHeader>
              <CardContent>
                {orderItems.loading ? (
                  <p>Loading items...</p>
                ) : orderItems.error ? (
                  <p className="text-red-500">Error: {orderItems.error}</p>
                ) : orderItems.data && orderItems.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Product</th>
                          <th className="text-left p-2">Variant</th>
                          <th className="text-right p-2">Quantity</th>
                          <th className="text-right p-2">Unit Price</th>
                          <th className="text-right p-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.data.map((item: any) => (
                          <tr key={item.id} className="border-b">
                            <td className="p-2">{item.product_name}</td>
                            <td className="p-2 text-muted-foreground">{item.variant || 'N/A'}</td>
                            <td className="text-right p-2">{item.quantity}</td>
                            <td className="text-right p-2">{formatCurrency(item.unit_price)}</td>
                            <td className="text-right p-2 font-medium">
                              {formatCurrency(item.total_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No items found for this order</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Analytics Orders (orders table)</CardTitle>
              <CardDescription>Order tracking for analytics and reporting</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsOrders.loading ? (
                <p>Loading analytics orders...</p>
              ) : analyticsOrders.error ? (
                <p className="text-red-500">Error: {analyticsOrders.error}</p>
              ) : analyticsOrders.data && analyticsOrders.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Order ID</th>
                        <th className="text-left p-2">Customer</th>
                        <th className="text-right p-2">Subtotal</th>
                        <th className="text-right p-2">Discount</th>
                        <th className="text-right p-2">Shipping</th>
                        <th className="text-right p-2">Total</th>
                        <th className="text-left p-2">Payment</th>
                        <th className="text-left p-2">Shipping Method</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Source</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsOrders.data.map((order: any) => (
                        <tr key={order.id} className="border-b">
                          <td className="p-2 font-mono text-xs">{order.order_id}</td>
                          <td className="p-2 text-xs">
                            <div className="font-medium">{order.customer_email || 'Anonymous'}</div>
                            {/* Extract phone from items JSONB if available */}
                            {(() => {
                              const phone = order.items && Array.isArray(order.items) && order.items.length > 0
                                ? order.items[0]?.customer_phone || null
                                : null;
                              return phone ? (
                                <div className="text-muted-foreground text-xs mt-1">📞 {phone}</div>
                              ) : null;
                            })()}
                            {order.customer_id && (
                              <div className="text-muted-foreground text-xs mt-1">ID: {order.customer_id.slice(0, 8)}...</div>
                            )}
                          </td>
                          <td className="text-right p-2">{formatCurrency(order.subtotal || 0)}</td>
                          <td className="text-right p-2 text-red-600">
                            -{formatCurrency(order.discount_total || 0)}
                          </td>
                          <td className="text-right p-2">{formatCurrency(order.shipping_total || 0)}</td>
                          <td className="text-right p-2 font-medium">
                            {formatCurrency(order.total_value)}
                          </td>
                          <td className="p-2 text-xs">{order.payment_method || 'N/A'}</td>
                          <td className="p-2 text-xs">{order.shipping_method || 'N/A'}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status || 'N/A'}
                            </span>
                            {order.fulfillment_status && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Fulfillment: {order.fulfillment_status}
                              </div>
                            )}
                          </td>
                          <td className="p-2 text-xs">{order.source || 'Direct'}</td>
                          <td className="p-2 text-xs">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No analytics orders found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Products</CardTitle>
              <CardDescription>
                {supabaseProducts ? `${supabaseProducts.length} products synced` : 'No products synced yet'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <p>Loading products...</p>
              ) : supabaseProducts && supabaseProducts.length > 0 ? (
                <div className="space-y-2">
                  {supabaseProducts.slice(0, 10).map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category}
                          {product.subcategory && ` • ${product.subcategory}`}
                          {product.brand && ` • ${product.brand}`}
                        </div>
                        {product.sku && (
                          <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(product.price)}</div>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatCurrency(product.compare_at_price)}
                          </div>
                        )}
                        {product.cost && (
                          <div className="text-xs text-muted-foreground">
                            Cost: {formatCurrency(product.cost)}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          Stock: {product.inventory_count || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No products in Supabase yet</p>
                  <Button onClick={() => syncProducts()}>Sync Products Now</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.loading ? (
                <p>Loading...</p>
              ) : topProducts.data && topProducts.data.length > 0 ? (
                <div className="space-y-2">
                  {topProducts.data.map((product: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(product.units_sold || 0)} units sold
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(product.revenue || 0)}</div>
                        <div className="text-sm text-muted-foreground">Avg: {formatCurrency(product.avg_price || 0)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No product revenue data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Management Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <PricingManagement />
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors come from</CardDescription>
            </CardHeader>
            <CardContent>
              {traffic.loading ? (
                <p>Loading traffic data...</p>
              ) : traffic.data && traffic.data.length > 0 ? (
                <div className="space-y-2">
                  {traffic.data.map((source: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{source.source || 'Direct'}</div>
                        <div className="text-sm text-muted-foreground">{source.medium || 'none'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(source.visitors || 0)} visitors</div>
                        <div className="text-sm text-muted-foreground">{formatNumber(source.visits || 0)} visits</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No traffic data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Visitors (from daily_overview view)</CardTitle>
              <CardDescription>
                Data from visits table aggregated by date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {daily.loading ? (
                <p>Loading...</p>
              ) : daily.data && daily.data.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {daily.data.map((day: any) => (
                    <div key={day.date} className="flex justify-between items-center p-2 border rounded">
                      <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                      <div className="flex gap-4 text-sm">
                        <span>
                          <span className="font-semibold">{formatNumber(day.unique_visitors || 0)}</span> unique
                        </span>
                        <span>
                          <span className="font-semibold">{formatNumber(day.total_visits || 0)}</span> total
                        </span>
                        <span className="text-muted-foreground">
                          {formatNumber(day.mobile_visitors || 0)} mobile
                        </span>
                        <span className="text-muted-foreground">
                          {formatNumber(day.desktop_visitors || 0)} desktop
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No visitor data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visitor Statistics Summary (Direct from visits table)</CardTitle>
              <CardDescription>
                Calculated directly from visits table for accurate counts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visitorStatsLoading ? (
                <p>Loading visitor statistics...</p>
              ) : visitorStats ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Unique Visitors</div>
                    <div className="text-2xl font-bold">{formatNumber(visitorStats.unique_visitors)}</div>
                    <div className="text-xs text-muted-foreground mt-1">From visits.session_id</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Visits</div>
                    <div className="text-2xl font-bold">{formatNumber(visitorStats.total_visits)}</div>
                    <div className="text-xs text-muted-foreground mt-1">All visit records</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Mobile</div>
                    <div className="text-2xl font-bold">{formatNumber(visitorStats.mobile_visitors)}</div>
                    <div className="text-xs text-muted-foreground mt-1">From is_mobile flag</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Desktop</div>
                    <div className="text-2xl font-bold">{formatNumber(visitorStats.desktop_visitors)}</div>
                    <div className="text-xs text-muted-foreground mt-1">From is_desktop flag</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tablet</div>
                    <div className="text-2xl font-bold">{formatNumber(visitorStats.tablet_visitors)}</div>
                    <div className="text-xs text-muted-foreground mt-1">From is_tablet flag</div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No visitor statistics available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Marketing campaigns and performance</CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <p>Loading campaigns...</p>
              ) : campaignsError ? (
                <p className="text-red-500">Error: {campaignsError}</p>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="p-4 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-lg">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">UTM: {campaign.utm_campaign}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Cost</div>
                          <div className="font-medium">{formatCurrency(campaign.cost || 0)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No campaigns found. Create campaigns in Supabase Dashboard to track marketing performance.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Performance metrics for all campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaignPerformanceLoading ? (
                <p>Loading campaign performance...</p>
              ) : campaignPerformanceError ? (
                <p className="text-red-500">Error: {campaignPerformanceError}</p>
              ) : campaignPerformance && campaignPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Campaign</th>
                        <th className="text-right p-2">Visitors</th>
                        <th className="text-right p-2">Orders</th>
                        <th className="text-right p-2">Revenue</th>
                        <th className="text-right p-2">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignPerformance.map((campaign: any) => (
                        <tr key={campaign.utm_campaign} className="border-b">
                          <td className="p-2">{campaign.name}</td>
                          <td className="text-right p-2">{formatNumber(campaign.visitors || 0)}</td>
                          <td className="text-right p-2">{formatNumber(campaign.orders || 0)}</td>
                          <td className="text-right p-2">{formatCurrency(campaign.revenue || 0)}</td>
                          <td className="text-right p-2">
                            {campaign.roi_percentage?.toFixed(2) || '0.00'}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No campaign performance data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>All custom events from events table (Last {days} days)</CardDescription>
            </CardHeader>
            <CardContent>
              {events.loading ? (
                <p>Loading events...</p>
              ) : events.error ? (
                <p className="text-red-500">Error: {events.error}</p>
              ) : events.data && events.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {events.data.length} events
                  </div>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="text-left p-2">Event</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">Label</th>
                          <th className="text-right p-2">Value</th>
                          <th className="text-left p-2">Session</th>
                          <th className="text-left p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.data.map((event: any) => (
                          <tr key={event.id} className="border-b">
                            <td className="p-2 font-medium">{event.event_name}</td>
                            <td className="p-2 text-muted-foreground">{event.event_category || 'N/A'}</td>
                            <td className="p-2 text-muted-foreground">{event.event_label || 'N/A'}</td>
                            <td className="text-right p-2">{event.event_value ?? 'N/A'}</td>
                            <td className="p-2 font-mono text-xs">{event.session_id?.slice(0, 8) || 'N/A'}...</td>
                            <td className="p-2 text-xs">
                              {event.created_at ? new Date(event.created_at).toLocaleString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No events found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Visits</CardTitle>
              <CardDescription>Raw visit data from visits table</CardDescription>
            </CardHeader>
            <CardContent>
              {visits.loading ? (
                <p>Loading visits...</p>
              ) : visits.error ? (
                <p className="text-red-500">Error: {visits.error}</p>
              ) : visits.data && visits.data.length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="text-left p-2">Session</th>
                        <th className="text-left p-2">Device</th>
                        <th className="text-left p-2">Browser</th>
                        <th className="text-left p-2">Country</th>
                        <th className="text-left p-2">City</th>
                        <th className="text-left p-2">Source</th>
                        <th className="text-left p-2">Campaign</th>
                        <th className="text-left p-2">Landing Page</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.data.map((visit: any) => (
                        <tr key={visit.id} className="border-b">
                          <td className="p-2 font-mono text-xs">{visit.session_id.slice(0, 8)}...</td>
                          <td className="p-2">
                            <div>{visit.device || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">
                              {visit.is_mobile && 'Mobile'}
                              {visit.is_desktop && 'Desktop'}
                              {visit.is_tablet && 'Tablet'}
                            </div>
                          </td>
                          <td className="p-2">
                            <div>{visit.browser || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{visit.os || 'N/A'}</div>
                          </td>
                          <td className="p-2">{visit.country || 'N/A'}</td>
                          <td className="p-2 text-xs">{visit.city || 'N/A'}</td>
                          <td className="p-2 text-xs">
                            <div>{visit.utm_source || visit.referrer || 'Direct'}</div>
                            {visit.utm_medium && (
                              <div className="text-muted-foreground">Medium: {visit.utm_medium}</div>
                            )}
                          </td>
                          <td className="p-2 text-xs">
                            <div>{visit.utm_campaign || 'N/A'}</div>
                            {visit.utm_term && (
                              <div className="text-muted-foreground">Term: {visit.utm_term}</div>
                            )}
                            {visit.utm_content && (
                              <div className="text-muted-foreground">Content: {visit.utm_content}</div>
                            )}
                          </td>
                          <td className="p-2 text-xs font-mono max-w-xs truncate">
                            {visit.landing_page || 'N/A'}
                          </td>
                          <td className="p-2 text-xs">{new Date(visit.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No visits found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Views Tab */}
        <TabsContent value="pageviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Page Views</CardTitle>
              <CardDescription>Raw page view data from page_views table</CardDescription>
            </CardHeader>
            <CardContent>
              {pageViews.loading ? (
                <p>Loading page views...</p>
              ) : pageViews.error ? (
                <p className="text-red-500">Error: {pageViews.error}</p>
              ) : pageViews.data && pageViews.data.length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="text-left p-2">Path</th>
                        <th className="text-left p-2">Title</th>
                        <th className="text-right p-2">Scroll</th>
                        <th className="text-right p-2">Time (s)</th>
                        <th className="text-center p-2">Engaged</th>
                        <th className="text-center p-2">Bounce</th>
                        <th className="text-center p-2">Exit</th>
                        <th className="text-left p-2">Session</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageViews.data.map((view: any) => (
                        <tr key={view.id} className="border-b">
                          <td className="p-2 font-mono text-xs">{view.path || view.url}</td>
                          <td className="p-2 text-sm">{view.title || 'N/A'}</td>
                          <td className="text-right p-2">{view.scroll_depth || 0}%</td>
                          <td className="text-right p-2">{view.time_on_page || 0}s</td>
                          <td className="text-center p-2">
                            {view.engaged ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Yes</span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">No</span>
                            )}
                          </td>
                          <td className="text-center p-2">
                            {view.bounce ? (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Yes</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">No</span>
                            )}
                          </td>
                          <td className="text-center p-2">
                            {view.exit ? (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Yes</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">No</span>
                            )}
                          </td>
                          <td className="p-2 font-mono text-xs">{view.session_id.slice(0, 8)}...</td>
                          <td className="p-2 text-xs">{new Date(view.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No page views found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cart Events Tab */}
        <TabsContent value="cartevents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cart Events</CardTitle>
              <CardDescription>All cart events from cart_events table</CardDescription>
            </CardHeader>
            <CardContent>
              {cartEvents.loading ? (
                <p>Loading cart events...</p>
              ) : cartEvents.error ? (
                <p className="text-red-500">Error: {cartEvents.error}</p>
              ) : cartEvents.data && cartEvents.data.length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="text-left p-2">Event Type</th>
                        <th className="text-left p-2">Product</th>
                        <th className="text-left p-2">Variant</th>
                        <th className="text-right p-2">Quantity</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">Total</th>
                        <th className="text-right p-2">Cart Total</th>
                        <th className="text-left p-2">Discount</th>
                        <th className="text-left p-2">Session</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartEvents.data.map((event: any) => (
                        <tr key={event.id} className="border-b">
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                event.event_type === 'add'
                                  ? 'bg-green-100 text-green-800'
                                  : event.event_type === 'remove'
                                  ? 'bg-red-100 text-red-800'
                                  : event.event_type === 'checkout_start'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {event.event_type}
                            </span>
                          </td>
                          <td className="p-2">
                            <div>{event.product_title || 'N/A'}</div>
                            {event.external_product_id && (
                              <div className="text-xs text-muted-foreground">ID: {event.external_product_id.slice(0, 12)}...</div>
                            )}
                          </td>
                          <td className="p-2 text-xs">
                            {event.variant_title || event.variant_id || 'N/A'}
                          </td>
                          <td className="text-right p-2">{event.quantity || 1}</td>
                          <td className="text-right p-2">{formatCurrency(event.price || 0)}</td>
                          <td className="text-right p-2">{formatCurrency(event.total_value || 0)}</td>
                          <td className="text-right p-2 font-medium">
                            {event.cart_total ? formatCurrency(event.cart_total) : 'N/A'}
                          </td>
                          <td className="p-2 text-xs">
                            {event.discount_code && (
                              <div>Code: {event.discount_code}</div>
                            )}
                            {event.discount_amount && (
                              <div className="text-red-600">-{formatCurrency(event.discount_amount)}</div>
                            )}
                            {!event.discount_code && !event.discount_amount && 'N/A'}
                          </td>
                          <td className="p-2 font-mono text-xs">{event.session_id.slice(0, 8)}...</td>
                          <td className="p-2 text-xs">{new Date(event.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No cart events found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funnel Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abandoned Carts</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {abandoned.loading ? (
                <p>Loading...</p>
              ) : abandoned.data && abandoned.data.length > 0 ? (
                <div className="space-y-2">
                  {abandoned.data.slice(0, 10).map((cart: any) => (
                    <div key={cart.session_id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-mono text-xs">{cart.session_id.slice(0, 8)}...</div>
                        <div className="text-sm text-muted-foreground">
                          {cart.items_count} items • {formatCurrency(cart.cart_value || 0)}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {new Date(cart.last_cart_activity).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No abandoned carts found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

