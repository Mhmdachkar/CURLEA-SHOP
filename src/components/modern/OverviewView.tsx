import {
    Users,
    DollarSign,
    ShoppingBag,
    TrendingUp,
    ArrowRight,
    MousePointerClick,
    Clock
} from 'lucide-react';
import { ModernStatCard } from './ModernStatCard';
import { ModernCard } from './ModernCard';
import { ModernTable } from './ModernTable';
import {
    useDailyOverview,
    useSalesOverview,
    useTrafficSources,
    useConversionFunnel
} from '@/hooks/useSupabaseAnalytics';
import { useRecentVisits } from '@/hooks/useSupabaseRawData';

interface OverviewViewProps {
    days: number;
}

export function OverviewView({ days }: OverviewViewProps) {
    const sales = useSalesOverview(days);
    const traffic = useTrafficSources();
    const funnel = useConversionFunnel();
    const visits = useRecentVisits(days);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num || 0);
    };

    // Calculate totals
    const totalRevenue = sales.data?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0;
    const totalOrders = sales.data?.reduce((sum, d) => sum + (d.total_orders || 0), 0) || 0;
    const totalVisitors = traffic.data?.reduce((sum, d) => sum + (d.visitors || 0), 0) || 0;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ModernStatCard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    subtitle={`Last ${days} days`}
                    icon={<DollarSign size={20} />}
                    trend={{ value: 12.5, isPositive: true }}
                />
                <ModernStatCard
                    title="Total Orders"
                    value={formatNumber(totalOrders)}
                    subtitle={`Last ${days} days`}
                    icon={<ShoppingBag size={20} />}
                    trend={{ value: 8.2, isPositive: true }}
                />
                <ModernStatCard
                    title="Total Visitors"
                    value={formatNumber(totalVisitors)}
                    subtitle={`Last ${days} days`}
                    icon={<Users size={20} />}
                    trend={{ value: 5.1, isPositive: true }}
                />
                <ModernStatCard
                    title="Avg Order Value"
                    value={formatCurrency(aov)}
                    subtitle={`Last ${days} days`}
                    icon={<TrendingUp size={20} />}
                    trend={{ value: 2.3, isPositive: false }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversion Funnel */}
                <div className="lg:col-span-2">
                    <ModernCard title="Conversion Funnel" subtitle="Visitor journey from landing to purchase">
                        {funnel.loading ? (
                            <div className="h-64 flex items-center justify-center text-zinc-500">Loading funnel data...</div>
                        ) : (
                            <div className="space-y-6 mt-4">
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: 'Visits', value: funnel.data?.[0]?.total_visits || 0, icon: Users },
                                        { label: 'Views', value: funnel.data?.[0]?.product_views || 0, icon: MousePointerClick },
                                        { label: 'Add to Cart', value: funnel.data?.[0]?.add_to_cart || 0, icon: ShoppingBag },
                                        { label: 'Purchases', value: funnel.data?.[0]?.purchases || 0, icon: DollarSign },
                                    ].map((step, i) => (
                                        <div key={i} className="relative p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
                                            <div className="flex justify-center mb-2 text-zinc-500">
                                                <step.icon size={20} />
                                            </div>
                                            <div className="text-2xl font-bold text-white mb-1">{formatNumber(step.value)}</div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{step.label}</div>
                                            {i < 3 && (
                                                <div className="hidden lg:block absolute top-1/2 -right-6 -translate-y-1/2 text-zinc-700 z-10">
                                                    <ArrowRight size={20} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg flex justify-between items-center">
                                        <span className="text-violet-300 font-medium">Visit to Cart</span>
                                        <span className="text-2xl font-bold text-violet-400">
                                            {funnel.data?.[0]?.visit_to_cart_rate?.toFixed(1) || '0.0'}%
                                        </span>
                                    </div>
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex justify-between items-center">
                                        <span className="text-emerald-300 font-medium">Cart to Purchase</span>
                                        <span className="text-2xl font-bold text-emerald-400">
                                            {funnel.data?.[0]?.cart_to_purchase_rate?.toFixed(1) || '0.0'}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ModernCard>
                </div>

                {/* Traffic Sources */}
                <div className="lg:col-span-1">
                    <ModernCard title="Top Traffic Sources" subtitle="Where your users are coming from" noPadding>
                        <ModernTable
                            data={traffic.data?.slice(0, 5) || []}
                            loading={traffic.loading}
                            columns={[
                                { key: 'source', header: 'Source', render: (val) => <span className="font-medium text-white">{val || 'Direct'}</span> },
                                { key: 'visitors', header: 'Visitors', align: 'right', render: (val) => formatNumber(val) },
                            ]}
                        />
                    </ModernCard>
                </div>
            </div>

            {/* Recent Activity */}
            <ModernCard title="Recent Visits" subtitle="Real-time visitor log" noPadding>
                <ModernTable
                    data={visits.data?.slice(0, 5) || []}
                    loading={visits.loading}
                    columns={[
                        {
                            key: 'created_at',
                            header: 'Time',
                            render: (val) => (
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Clock size={14} />
                                    <span>{new Date(val).toLocaleTimeString()}</span>
                                </div>
                            )
                        },
                        { key: 'country', header: 'Location', render: (val) => val || 'Unknown' },
                        { key: 'device', header: 'Device', render: (val) => val || '-' },
                        { key: 'landing_page', header: 'Landing Page', render: (val) => <span className="font-mono text-xs text-zinc-400">{val || '/'}</span> },
                    ]}
                />
            </ModernCard>
        </div>
    );
}
