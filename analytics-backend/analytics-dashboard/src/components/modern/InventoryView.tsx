import { ModernCard } from './ModernCard';
import { ModernTable } from './ModernTable';
import { ModernBadge } from './ModernBadge';
import { ModernStatCard } from './ModernStatCard';
import { Package, AlertTriangle, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useMemo } from 'react';
import { inventoryStore } from '@/utils/inventoryManager';

export function InventoryView() {
    // Get all inventory data
    const inventory = useMemo(() => inventoryStore.getAllInventory(), []);

    // Calculate low stock items (5 or fewer)
    const lowStock = useMemo(() => {
        return inventory.filter(item => item.quantity > 0 && item.quantity <= 5);
    }, [inventory]);

    // Calculate pricing summary
    const pricingSummary = useMemo(() => {
        const totalInventoryValue = inventory.reduce((sum, item) =>
            sum + (item.sellingPrice * item.quantity), 0
        );
        const totalCost = inventory.reduce((sum, item) =>
            sum + (item.costPerUnit * item.quantity), 0
        );
        const totalProfit = inventory.reduce((sum, item) =>
            sum + (item.profit * item.quantity), 0
        );

        return {
            totalInventoryValue,
            totalCost,
            totalProfit,
            profitMargin: ((totalProfit / totalInventoryValue) * 100).toFixed(1)
        };
    }, [inventory]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        Inventory Analytics
                    </h1>
                    <p className="text-zinc-400 mt-1">Real-time stock tracking and financial valuation</p>
                </div>
                <div className="flex gap-2">
                    <ModernBadge variant="default" className="bg-zinc-800/50 border-zinc-700">
                        {inventory.length} Variants
                    </ModernBadge>
                    <ModernBadge variant={lowStock.length > 0 ? "warning" : "success"}>
                        {lowStock.length} Low Stock
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
                                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-rose-500/30 transition-all group/item">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="text-zinc-600" />
                                            )}
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-rose-500/20 animate-pulse">
                                            {item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-200 truncate group-hover/item:text-rose-400 transition-colors">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-zinc-500">{item.color || item.size || 'Standard'}</span>
                                            <span className="text-xs font-medium text-zinc-400">${item.sellingPrice}</span>
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
                            key: 'name',
                            header: 'Product',
                            render: (val, row) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden">
                                        {row.image ? (
                                            <img src={row.image} alt={val} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-5 h-5 m-auto text-zinc-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-zinc-200">{val}</div>
                                        <div className="text-xs text-zinc-500">{row.color || row.size || 'Standard'}</div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: 'quantity',
                            header: 'Stock Level',
                            align: 'center',
                            render: (val) => (
                                <div className="flex flex-col items-center gap-1">
                                    <span className={`font-bold ${val <= 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {val} units
                                    </span>
                                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${val <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min((val / 20) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: 'costPerUnit',
                            header: 'Unit Cost',
                            align: 'right',
                            render: (val) => <span className="font-mono text-zinc-400">${val.toFixed(2)}</span>
                        },
                        {
                            key: 'sellingPrice',
                            header: 'Selling Price',
                            align: 'right',
                            render: (val) => <span className="font-mono text-zinc-200 font-medium">${val.toFixed(2)}</span>
                        },
                        {
                            key: 'profit',
                            header: 'Profit/Unit',
                            align: 'right',
                            render: (val) => (
                                <span className="font-mono text-emerald-400 font-bold">
                                    +${val.toFixed(2)}
                                </span>
                            )
                        },
                        {
                            key: 'margin',
                            header: 'Margin',
                            align: 'right',
                            render: (_, row) => {
                                const margin = ((row.profit / row.sellingPrice) * 100).toFixed(1);
                                return (
                                    <ModernBadge variant="default" className="bg-zinc-800 text-zinc-300">
                                        {margin}%
                                    </ModernBadge>
                                );
                            }
                        }
                    ]}
                />
            </ModernCard>
        </div>
    );
}
