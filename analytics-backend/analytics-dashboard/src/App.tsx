import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import Dashboard from './components/Dashboard';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';

interface Stats {
  totalVisits: number;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check simple auth
      const simpleAuth = localStorage.getItem('analytics_auth');
      
      setIsAuthenticated(!!(session || simpleAuth === 'true'));
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total visits
      const { count: visitsCount } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true });

      // Fetch revenue and orders from sales_overview
      const { data: salesData } = await supabase
        .from('sales_overview')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      const totalRevenue = salesData?.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0;
      const totalOrders = salesData?.reduce((sum, day) => sum + (day.total_orders || 0), 0) || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        totalVisits: visitsCount || 0,
        totalRevenue,
        totalOrders,
        avgOrderValue,
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('analytics_auth');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Curlea Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1">Real-time insights into your store performance</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
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
            value={`$${stats.totalRevenue.toFixed(2)}`}
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
            value={`$${stats.avgOrderValue.toFixed(2)}`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="text-orange-500"
          />
        </div>

        {/* Dashboard Charts */}
        <Dashboard />

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
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
  );
}

export default App;
