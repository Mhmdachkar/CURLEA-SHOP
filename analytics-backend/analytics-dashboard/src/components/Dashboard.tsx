import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatNumber } from '../lib/utils'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function Dashboard() {
  const [trafficBySource, setTrafficBySource] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [conversionFunnel, setConversionFunnel] = useState<any[]>([])
  const [hourlyData, setHourlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null)
      
      // Traffic by source
      const { data: trafficData, error: trafficError } = await supabase
        .from('traffic_by_source')
        .select('*')
        .limit(10)

      if (trafficError) throw trafficError

      // Top products
      const { data: productsData, error: productsError } = await supabase
        .from('top_products_summary')
        .select('*')
        .limit(10)

      if (productsError) throw productsError

      // Conversion funnel
      const { data: funnelData, error: funnelError } = await supabase
        .from('conversion_funnel_summary')
        .select('*')
        .single()

      if (funnelError) throw funnelError

      // Hourly performance data
      const { data: hourlyData, error: hourlyError } = await supabase
        .from('hourly_performance')
        .select('*')
        .order('hour')

      if (hourlyError) throw hourlyError

      setTrafficBySource(trafficData || [])
      setTopProducts(productsData || [])
      setHourlyData(hourlyData || [])
      
      if (funnelData) {
        setConversionFunnel([
          { stage: 'Visits', count: funnelData.total_visits },
          { stage: 'Product Views', count: funnelData.product_views },
          { stage: 'Add to Cart', count: funnelData.add_to_cart },
          { stage: 'Checkout Started', count: funnelData.checkout_started },
          { stage: 'Orders', count: funnelData.orders_completed },
        ])
      }
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    
    // Set up Supabase real-time subscriptions
    const visitsSubscription = supabase
      .channel('visits_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'visits' 
      }, () => {
        console.log('Visits data changed, refreshing...')
        fetchDashboardData()
      })
      .subscribe()

    const ordersSubscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, () => {
        console.log('Orders data changed, refreshing...')
        fetchDashboardData()
      })
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(visitsSubscription)
      supabase.removeChannel(ordersSubscription)
    }
  }, [fetchDashboardData])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-3 text-muted-foreground">Loading analytics data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading dashboard: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Real-time indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live data</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
      {/* Traffic Sources */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Traffic Sources</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={trafficBySource}
              dataKey="visit_count"
              nameKey="source"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.source}: ${entry.visit_count}`}
            >
              {trafficBySource.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Top Products</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product_name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => formatNumber(value)}
              labelFormatter={(label) => `Product: ${label}`}
            />
            <Legend />
            <Bar dataKey="view_count" fill="#8884d8" name="Views" />
            <Bar dataKey="cart_adds" fill="#82ca9d" name="Cart Adds" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Conversion Funnel</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={conversionFunnel} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={150} />
            <Tooltip formatter={(value: any) => formatNumber(value)} />
            <Legend />
            <Bar dataKey="count" fill="#0088FE" name="Users" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Performance */}
      {hourlyData.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Today's Hourly Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                label={{ value: 'Hour', position: 'insideBottom', offset: -10 }}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                  name === 'visitors' ? 'Visitors' : 
                  name === 'pageviews' ? 'Page Views' :
                  name === 'orders' ? 'Orders' : 'Revenue'
                ]}
                labelFormatter={(label) => `Hour ${label}:00`}
              />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="visitors" 
                stroke="#8884d8" 
                name="Visitors"
                strokeWidth={2}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="pageviews" 
                stroke="#82ca9d" 
                name="Page Views"
                strokeWidth={2}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="orders" 
                stroke="#ffc658" 
                name="Orders"
                strokeWidth={2}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="revenue" 
                stroke="#ff7300" 
                name="Revenue"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Products Table */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Top Products by Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Views</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Cart Adds</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Conversion</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground">{product.product_name}</td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">{formatNumber(product.view_count)}</td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">{formatNumber(product.cart_adds)}</td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">
                    {product.view_count > 0 
                      ? `${((product.cart_adds / product.view_count) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-foreground font-medium">
                    {formatCurrency(product.revenue || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

