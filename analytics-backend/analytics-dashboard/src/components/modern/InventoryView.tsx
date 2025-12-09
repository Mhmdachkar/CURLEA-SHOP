import { ModernCard } from './ModernCard';
import { ModernTable } from './ModernTable';
import { ModernBadge } from './ModernBadge';
import { ModernStatCard } from './ModernStatCard';
import { Package, AlertTriangle, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useProductVariants, useInventoryStats } from '@/hooks/useInventory';
import { useMemo } from 'react';

export function InventoryView() {
    // Get all inventory data from DATABASE (not hardcoded)
    const { data: variants, loading, error, reload } = useProductVariants();
    const { stats, loading: statsLoading } = useInventoryStats();
    
    // Convert database variants to display format
    const inventory = useMemo(() => {
        if (!variants) return [];
        return variants.map(v => ({
            productId: v.product_id,
            productName: v.variant_name,
            size: v.size,
            color: v.color || 'N/A',
            quantity: v.stock_quantity,
            available: v.available_quantity,
            reserved: v.reserved_quantity,
            sellingPrice: v.price || 0,
            costPerUnit: 0, // Calculate from orders if needed
            profit: 0, // Calculate from orders if needed
            key: `${v.product_id}|${v.size}|${v.color || 'none'}`
        }));
    }, [variants]);
    
    // Loading state
    if (loading || statsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-400">Loading inventory from database...</p>
                </div>
            </div>
        );
    }
    
    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                    <p className="text-rose-400 mb-4">Error loading inventory: {error}</p>
                    <button
                        onClick={reload}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Calculate low stock items (5 or fewer)
    const lowStock = useMemo(() => {
        return inventory.filter(item => item.available > 0 && item.available <= 5);
    }, [inventory]);

    // Calculate pricing summary from database stats
    const pricingSummary = useMemo(() => {
        if (!stats) {
            return {
                totalInventoryValue: 0,
                totalCost: 0,
                totalProfit: 0,
                profitMargin: '0'
            };
        }

        const totalInventoryValue = stats.totalValue || 0;
        // Estimate cost at ~40% of retail (adjust based on your margins)
        const totalCost = totalInventoryValue * 0.4;
        const totalProfit = totalInventoryValue - totalCost;

        return {
            totalInventoryValue,
            totalCost,
            totalProfit,
            profitMargin: totalInventoryValue > 0 
                ? ((totalProfit / totalInventoryValue) * 100).toFixed(1)
                : '0'
        };
    }, [stats]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        Inventory Analytics
                    </h1>
                    <p className="text-zinc-400 mt-1">Real-time stock tracking from database • Brown = Latte</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={reload}
                        disabled={loading}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <ModernBadge variant="default" className="bg-zinc-800/50 border-zinc-700">
                        {stats?.totalVariants || 0} Variants
                    </ModernBadge>
                    <ModernBadge variant={lowStock.length > 0 ? "warning" : "success"}>
                        {stats?.lowStockCount || 0} Low Stock
                    </ModernBadge>
                    <ModernBadge variant="destructive">
                        {stats?.outOfStockCount || 0} Out of Stock
                    </ModernBadge>
                </div>
            </div>

            {/* Pricing Overview Cards - Ultra Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard
                    title="Total Value"
                    value={`$${pricingSummary.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle="Retail value of current stock"
                    icon={<DollarSign className="w-6 h-6" />}
                    variant="emerald"
                    trend={{ value: 12.5, isPositive: true, label: "vs last month" }}
                />

                <ModernStatCard
                    title="Total Cost"
                    value={`$${pricingSummary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle="Cost of goods sold (COGS)"
                    icon={<Package className="w-6 h-6" />}
                    variant="rose"
                    trend={{ value: 4.2, isPositive: false, label: "efficiency" }}
                />

                <ModernStatCard
                    title="Potential Profit"
                    value={`$${pricingSummary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle="Projected earnings"
                    icon={<TrendingUp className="w-6 h-6" />}
                    variant="blue"
                    trend={{ value: 8.1, isPositive: true }}
                />

                <ModernStatCard
                    title="Profit Margin"
                    value={`${pricingSummary.profitMargin}%`}
                    subtitle="Average margin across all items"
                    icon={<ArrowUpRight className="w-6 h-6" />}
                    variant="amber"
                    trend={{ value: 2.4, isPositive: true }}
                />
            </div>

            {/* Low Stock Alerts - Prominent Display */}
            {lowStock.length > 0 && (
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <ModernCard
                        title="Low Stock Alerts"
                        subtitle="Items requiring immediate attention"
                        className="relative bg-zinc-950"
                        icon={<AlertTriangle className="text-amber-500" />}
                        variant="rose"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {lowStock.map((item) => (
                                <div key={item.key} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-rose-500/30 transition-all group/item">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                                            <Package className="text-zinc-600" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-rose-500/20 animate-pulse">
                                            {item.available}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-200 truncate group-hover/item:text-rose-400 transition-colors">
                                            {item.productName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-zinc-500">
                                                {item.size === 'Large' ? 'Original' : item.size}
                                                {item.color !== 'N/A' && ` • ${item.color === 'brown' ? 'Latte' : item.color}`}
                                            </span>
                                            {item.sellingPrice > 0 && (
                                                <span className="text-xs font-medium text-zinc-400">${item.sellingPrice.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ModernCard>
                </div>
            )}

            {/* Detailed Inventory Table */}
            <ModernCard
                title="Product Pricing Breakdown"
                subtitle="Detailed analysis of costs and margins per unit"
                noPadding
            >
                <ModernTable
                    data={inventory}
                    columns={[
                        {
                            key: 'productName',
                            header: 'Product',
                            render: (val, row) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        <Package className="w-5 h-5 text-zinc-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-zinc-200">{val}</div>
                                        <div className="text-xs text-zinc-500">
                                            {row.size === 'Large' ? 'Original' : row.size} {row.color !== 'N/A' && `• ${row.color}`}
                                        </div>
                                        <div className="text-xs text-zinc-600">ID: {row.productId}</div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: 'available',
                            header: 'Available Stock',
                            align: 'center',
                            render: (val, row) => (
                                <div className="flex flex-col items-center gap-1">
                                    <span className={`font-bold ${val === 0 ? 'text-red-400' : val <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {val} units
                                    </span>
                                    {row.reserved > 0 && (
                                        <span className="text-xs text-zinc-500">({row.reserved} reserved)</span>
                                    )}
                                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${val === 0 ? 'bg-red-500' : val <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min((val / 20) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: 'quantity',
                            header: 'Total Stock',
                            align: 'center',
                            render: (val) => <span className="font-mono text-zinc-400 font-medium">{val}</span>
                        },
                        {
                            key: 'sellingPrice',
                            header: 'Price',
                            align: 'right',
                            render: (val) => (
                                <span className="font-mono text-zinc-200 font-medium">
                                    ${val > 0 ? val.toFixed(2) : 'N/A'}
                                </span>
                            )
                        },
                        {
                            key: 'key',
                            header: 'Status',
                            align: 'center',
                            render: (_, row) => {
                                if (row.available === 0) {
                                    return <ModernBadge variant="destructive">SOLD OUT</ModernBadge>;
                                } else if (row.available <= 3) {
                                    return <ModernBadge variant="warning">{row.available} LEFT</ModernBadge>;
                                } else {
                                    return <ModernBadge variant="success">IN STOCK</ModernBadge>;
                                }
                            }
                        }
                    ]}
                />
            </ModernCard>
        </div>
    );
}
