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
                        subtitle="Items requiring immediate restocking"
                        className="relative bg-zinc-900/90 backdrop-blur-xl border-rose-900/30"
                        actions={
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                Action Required
                            </div>
                        }
                        noPadding
                    >
                        <ModernTable
                            data={lowStock}
                            loading={false}
                            emptyMessage="No low stock alerts"
                            columns={[
                                {
                                    key: 'productName',
                                    header: 'Product',
                                    render: (val) => <span className="font-medium text-white">{val}</span>
                                },
                                {
                                    key: 'size',
                                    header: 'Size',
                                    render: (val) => <span className="text-zinc-400 capitalize bg-zinc-800/50 px-2 py-0.5 rounded text-xs">{val}</span>
                                },
                                {
                                    key: 'color',
                                    header: 'Color',
                                    render: (val) => (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: val }} />
                                            <span className="text-zinc-400 capitalize">{val}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'quantity',
                                    header: 'Stock Level',
                                    align: 'right',
                                    render: (val) => (
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-rose-500 rounded-full"
                                                    style={{ width: `${(val / 10) * 100}%` }}
                                                />
                                            </div>
                                            <span className="font-mono text-rose-400 font-bold w-6 text-right">{val}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'sellingPrice',
                                    header: 'Revenue Risk',
                                    align: 'right',
                                    render: (val, row) => (
                                        <span className="text-zinc-500 font-mono text-xs">
                                            Potential: <span className="text-white">${(val * row.quantity).toFixed(2)}</span>
                                        </span>
                                    )
                                },
                            ]}
                        />
                    </ModernCard>
                </div>
            )}

            {/* Main Inventory Table - Glassmorphism */}
            <ModernCard
                title="Global Inventory Status"
                subtitle="Comprehensive breakdown of all product variants"
                actions={
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white">
                            <ArrowDownRight className="w-4 h-4" />
                        </button>
                    </div>
                }
                className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm"
                noPadding
            >
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <ModernTable
                        data={inventory.filter(item => item.size !== 'default')}
                        loading={false}
                        emptyMessage="No pricing data found"
                        columns={[
                            {
                                key: 'productName',
                                header: 'Product Variant',
                                width: '30%',
                                render: (val) => (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                                            {val.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-zinc-200 text-sm">{val.replace('CURLEA ', '')}</span>
                                    </div>
                                )
                            },
                            {
                                key: 'size',
                                header: 'Specs',
                                width: '15%',
                                render: (val, row) => (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-zinc-400 capitalize flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                                            {val}
                                        </span>
                                        <span className="text-xs text-zinc-500 capitalize flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                            {row.color}
                                        </span>
                                    </div>
                                )
                            },
                            {
                                key: 'quantity',
                                header: 'Availability',
                                align: 'center',
                                width: '15%',
                                render: (val) => (
                                    <div className="flex flex-col items-center gap-1">
                                        <span className={`font-mono font-bold text-sm ${val === 0 ? 'text-rose-400' : val <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            {val} units
                                        </span>
                                        <div className={`w-16 h-1 rounded-full ${val === 0 ? 'bg-rose-500/20' : val <= 5 ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                                            <div
                                                className={`h-full rounded-full ${val === 0 ? 'bg-rose-500' : val <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min((val / 20) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            },
                            {
                                key: 'sellingPrice',
                                header: 'Financials',
                                align: 'right',
                                width: '20%',
                                render: (val, row) => (
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-emerald-400 font-mono text-sm font-medium">${val.toFixed(2)}</span>
                                        <span className="text-zinc-600 text-[10px] uppercase tracking-wider">Cost: ${row.costPerUnit.toFixed(2)}</span>
                                    </div>
                                )
                            },
                            {
                                key: 'profit',
                                header: 'Profitability',
                                align: 'right',
                                width: '20%',
                                render: (val, row) => (
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-blue-400 font-mono text-sm font-bold">${val.toFixed(2)}</span>
                                            <span className="text-zinc-600 text-xs">/unit</span>
                                        </div>
                                        <div className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-medium">
                                            Total: ${(val * row.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                )
                            },
                        ]}
                    />
                </div>
            </ModernCard>
        </div>
    );
}
