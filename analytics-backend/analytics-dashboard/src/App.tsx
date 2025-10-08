import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import Dashboard from './components/Dashboard'
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react'

interface Stats {
  totalVisits: number
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
}

function App() {
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchStats = useCallback(async () => {
    try {
      // Fetch total visits
      const { count: visitsCount } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })

      // Fetch revenue and orders
      const { data: salesData } = await supabase
        .from('total_sales_summary')
        .select('*')
        .single()

      // Fetch AOV
      const { data: aovData } = await supabase
        .from('aov_summary')
        .select('*')
        .single()

      setStats({
        totalVisits: visitsCount || 0,
        totalRevenue: salesData?.total_revenue || 0,
        totalOrders: salesData?.total_orders || 0,
        avgOrderValue: aovData?.aov || 0,
      })
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [fetchStats])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Curlea Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time insights into your store performance</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Visits"
            value={stats.totalVisits}
            icon={<Users className="w-5 h-5" />}
            color="text-blue-500"
          />
          <StatCard
            title="Total Revenue"
            value={`€${stats.totalRevenue.toFixed(2)}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="text-green-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="text-purple-500"
          />
          <StatCard
            title="Avg Order Value"
            value={`€${stats.avgOrderValue.toFixed(2)}`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="text-orange-500"
          />
        </div>

        {/* Dashboard Charts */}
        <Dashboard />
      </main>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={color}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  )
}

export default App

