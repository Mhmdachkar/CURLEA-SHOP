import { useSupabaseProducts, useAnalyticsOrders, useRecentPageViews } from '@/hooks/useSupabaseRawData';
import { ModernCard } from './ModernCard';
import { ModernTable } from './ModernTable';
import { ModernBadge } from './ModernBadge';
import { Package, TrendingUp, Eye, ShoppingBag } from 'lucide-react';
import { useMemo } from 'react';

export function ProductsView() {
    const { data: products, loading: productsLoading } = useSupabaseProducts();
    const { data: orders, loading: ordersLoading } = useAnalyticsOrders(30); // Last 30 days
    const { data: views, loading: viewsLoading } = useRecentPageViews(30); // Last 30 days

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    // Aggregate Product Performance
    const productPerformance = useMemo(() => {
        if (!products) return [];

        return products.map(product => {
            // Count views for this product (simple matching by URL or ID if available)
            // Assuming URL structure contains product ID or handle
            const productViews = views?.filter(v => v.url.includes(product.product_id) || v.url.includes(product.title.toLowerCase().replace(/\s+/g, '-'))).length || 0;

            // Count orders containing this product
            // Note: This requires order items, but for now we'll estimate or use a placeholder if order items aren't easily linked in this view without a join.
            // Ideally we'd use a joined query. For now, let's simulate "Orders" based on a mock or if we have order items loaded.
            // actually useAnalyticsOrders returns orders, not items. 
            // Let's use a random multiplier for demo purposes if we can't link exact items, OR better, just show Views and Price for now.
            // Wait, I can use `useOrderItems` if I want exact data, but that might be heavy.
            // Let's stick to what we have: Products and Price.

            // REAL IMPLEMENTATION:
            // We need order items to count product sales.
            // For this specific view, let's focus on Inventory and Price, and if we had views, show them.

            return {
                id: product.id,
                title: product.title,
                price: product.price,
                category: product.category,
                inventory: product.inventory_count || 0,
                views: productViews,
                // conversionRate: productViews > 0 ? ((ordersCount / productViews) * 100).toFixed(1) : 0
            };
        }).sort((a, b) => b.price - a.price); // Sort by price for now
    }, [products, views]);

    return (
        <div className="space-y-6">
            <ModernCard
                title="Product Performance"
                subtitle="Inventory and pricing overview"
                actions={
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Package size={16} />
                        <span>{products?.length || 0} Products</span>
                    </div>
                }
                noPadding
            >
                <ModernTable
                    data={productPerformance}
                    loading={productsLoading}
                    emptyMessage="No products found"
                    columns={[
                        {
                            key: 'title',
                            header: 'Product',
                            render: (val, row) => (
                                <div>
                                    <div className="font-medium text-white">{val}</div>
                                    <div className="text-xs text-zinc-500">{row.category || 'Uncategorized'}</div>
                                </div>
                            )
                        },
                        {
                            key: 'price',
                            header: 'Price',
                            align: 'right',
                            render: (val) => <span className="font-medium text-zinc-300">{formatCurrency(val)}</span>
                        },
                        {
                            key: 'inventory',
                            header: 'Stock',
                            align: 'center',
                            render: (val) => (
                                <ModernBadge variant={val > 10 ? 'success' : val > 0 ? 'warning' : 'danger'}>
                                    {val > 0 ? `${val} in stock` : 'Out of stock'}
                                </ModernBadge>
                            )
                        },
                        {
                            key: 'views',
                            header: 'Views (30d)',
                            align: 'right',
                            render: (val) => (
                                <div className="flex items-center justify-end gap-1 text-zinc-400">
                                    <Eye size={14} />
                                    <span>{val}</span>
                                </div>
                            )
                        }
                    ]}
                />
            </ModernCard>
        </div>
    );
}
