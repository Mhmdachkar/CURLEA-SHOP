import { useStripeOrders, useRecentVisits } from '@/hooks/useSupabaseRawData';
import { ModernCard } from './ModernCard';
import { ModernTable } from './ModernTable';
import { ModernBadge } from './ModernBadge';
import { Users, Globe } from 'lucide-react';
import { useMemo } from 'react';

export function CustomersView() {
    // Fetch more data for analytics (limit 1000 for client-side aggregation)
    const { data: orders, loading: ordersLoading } = useStripeOrders(1000);
    const { data: visits, loading: visitsLoading } = useRecentVisits(30); // 30 days of visits

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    // Aggregate Customers
    const customers = useMemo(() => {
        if (!orders) return [];

        const customerMap = new Map<string, {
            id: string;
            email: string;
            totalSpend: number;
            orderCount: number;
            lastOrderDate: string;
            isGuest: boolean;
        }>();

        orders.forEach(order => {
            const email = order.customer_email || 'Unknown';
            const current = customerMap.get(email) || {
                id: email,
                email,
                totalSpend: 0,
                orderCount: 0,
                lastOrderDate: order.created_at,
                isGuest: order.is_guest || false,
            };

            current.totalSpend += order.total_value || 0;
            current.orderCount += 1;
            if (new Date(order.created_at) > new Date(current.lastOrderDate)) {
                current.lastOrderDate = order.created_at;
            }

            customerMap.set(email, current);
        });

        return Array.from(customerMap.values())
            .sort((a, b) => b.totalSpend - a.totalSpend)
            .slice(0, 50); // Top 50 customers
    }, [orders]);

    // Aggregate Countries
    const countries = useMemo(() => {
        if (!visits) return [];

        const countryMap = new Map<string, {
            id: string;
            code: string;
            visitors: number;
        }>();

        visits.forEach(visit => {
            const country = visit.country || 'Unknown';
            const current = countryMap.get(country) || {
                id: country,
                code: country,
                visitors: 0,
            };

            current.visitors += 1;
            countryMap.set(country, current);
        });

        return Array.from(countryMap.values())
            .sort((a, b) => b.visitors - a.visitors);
    }, [visits]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Customers */}
                <div className="lg:col-span-2">
                    <ModernCard
                        title="Top Customers"
                        subtitle="Highest spending customers"
                        actions={
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <Users size={16} />
                                <span>{customers.length} Active Customers</span>
                            </div>
                        }
                        noPadding
                    >
                        <ModernTable
                            data={customers}
                            loading={ordersLoading}
                            emptyMessage="No customer data available"
                            columns={[
                                {
                                    key: 'email',
                                    header: 'Customer',
                                    render: (val, row) => (
                                        <div>
                                            <div className="font-medium text-white">{val}</div>
                                            {row.isGuest && <span className="text-xs text-zinc-500">Guest</span>}
                                        </div>
                                    )
                                },
                                {
                                    key: 'orderCount',
                                    header: 'Orders',
                                    align: 'center',
                                    render: (val) => <ModernBadge variant="neutral">{val}</ModernBadge>
                                },
                                {
                                    key: 'totalSpend',
                                    header: 'Total Spend',
                                    align: 'right',
                                    render: (val) => <span className="font-bold text-emerald-400">{formatCurrency(val)}</span>
                                },
                                {
                                    key: 'lastOrderDate',
                                    header: 'Last Order',
                                    align: 'right',
                                    render: (val) => <span className="text-zinc-500 text-xs">{new Date(val).toLocaleDateString()}</span>
                                },
                            ]}
                        />
                    </ModernCard>
                </div>

                {/* Geographic Distribution */}
                <div className="lg:col-span-1">
                    <ModernCard
                        title="Demographics"
                        subtitle="Visitors by country"
                        noPadding
                    >
                        <ModernTable
                            data={countries}
                            loading={visitsLoading}
                            emptyMessage="No location data available"
                            columns={[
                                {
                                    key: 'code',
                                    header: 'Country',
                                    render: (val) => (
                                        <div className="flex items-center gap-2">
                                            <Globe size={14} className="text-zinc-500" />
                                            <span>{val}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'visitors',
                                    header: 'Visitors',
                                    align: 'right',
                                    render: (val) => <span className="font-medium text-white">{val}</span>
                                },
                            ]}
                        />
                    </ModernCard>
                </div>
            </div>
        </div>
    );
}
