import { useRecentVisits, useStripeOrders, useAllCartEvents, useRecentPageViews } from '@/hooks/useSupabaseRawData';
import { ModernCard } from './ModernCard';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

export function FunnelView() {
    const { data: visits, loading: visitsLoading } = useRecentVisits(30);
    const { data: pageViews, loading: viewsLoading } = useRecentPageViews(30);
    const { data: cartEvents, loading: cartLoading } = useAllCartEvents(30);
    const { data: orders, loading: ordersLoading } = useStripeOrders(1000);

    // Calculate Funnel Metrics
    const funnel = useMemo(() => {
        const totalVisits = visits?.length || 0;

        const productViewSessions = new Set(
            pageViews?.filter(pv => pv.url.includes('/product') || pv.url.includes('/shop')).map(pv => pv.session_id)
        ).size;

        const addToCartSessions = new Set(
            cartEvents?.filter(ce => ce.event_type === 'add').map(ce => ce.session_id)
        ).size;

        const checkoutSessions = new Set(
            cartEvents?.filter(ce => ce.event_type === 'checkout_start').map(ce => ce.session_id)
        ).size;

        const purchaseCount = orders?.length || 0;

        return [
            { id: 'visits', label: 'Total Visits', count: totalVisits, gradient: 'from-zinc-600 to-zinc-700', icon: '👥' },
            { id: 'products', label: 'Viewed Product', count: productViewSessions, gradient: 'from-blue-600 to-blue-700', icon: '👀' },
            { id: 'cart', label: 'Added to Cart', count: addToCartSessions, gradient: 'from-violet-600 to-violet-700', icon: '🛒' },
            { id: 'checkout', label: 'Started Checkout', count: checkoutSessions, gradient: 'from-indigo-600 to-indigo-700', icon: '💳' },
            { id: 'purchase', label: 'Purchased', count: purchaseCount, gradient: 'from-emerald-500 to-emerald-600', icon: '✅' },
        ];
    }, [visits, pageViews, cartEvents, orders]);

    return (
        <div className="space-y-6">
            <ModernCard
                title="Conversion Funnel"
                subtitle="User journey from visit to purchase (Last 30 Days)"
            >
                <div className="flex flex-col gap-6 mt-4">
                    {funnel.map((step, index) => {
                        const prevCount = index > 0 ? funnel[index - 1].count : step.count;
                        const conversionRate = prevCount > 0 ? ((step.count / prevCount) * 100).toFixed(1) : 0;
                        const dropOff = prevCount > 0 ? (100 - parseFloat(String(conversionRate))).toFixed(1) : 0;
                        const width = funnel[0].count > 0 ? (step.count / funnel[0].count) * 100 : 0;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                className="relative group"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{step.icon}</span>
                                        <div>
                                            <span className="font-bold text-white text-lg">{step.label}</span>
                                            {index > 0 && (
                                                <span className="ml-3 text-xs font-mono px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                                                    {conversionRate}% converted
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                            {step.count.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative h-16 bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${width}%` }}
                                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${step.gradient} flex items-center justify-between px-4 shadow-lg`}
                                    >
                                        <div className="flex items-center gap-2 text-white/90 font-medium">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            <span className="text-sm">{width.toFixed(1)}% of total</span>
                                        </div>

                                        {index > 0 && parseFloat(String(dropOff)) > 0 && (
                                            <div className="flex items-center gap-2 text-rose-300 text-xs font-mono bg-black/20 px-2 py-1 rounded">
                                                ↓ {dropOff}% drop
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Show remaining as gray */}
                                    <div
                                        className="absolute top-0 right-0 h-full bg-zinc-800/30"
                                        style={{ width: `${100 - width}%` }}
                                    />
                                </div>

                                {/* Connection line to next step */}
                                {index < funnel.length - 1 && (
                                    <div className="absolute left-8 top-full h-6 w-0.5 bg-gradient-to-b from-zinc-700 to-transparent" />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </ModernCard>
        </div>
    );
}
