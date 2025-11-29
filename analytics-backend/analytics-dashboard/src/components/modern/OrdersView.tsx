import { useState } from 'react';
import { useStripeOrders, useOrderItems } from '@/hooks/useSupabaseRawData';
import { ModernCard } from './ModernCard';
import { ModernTable } from './ModernTable';
import { ModernBadge } from './ModernBadge';
import { Eye, Search, Filter, Download } from 'lucide-react';

export function OrdersView() {
    const { data: orders, loading, error } = useStripeOrders(50);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const { data: orderItems, loading: itemsLoading } = useOrderItems(selectedOrderId);
    const [searchTerm, setSearchTerm] = useState('');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'success';
            case 'succeeded': return 'success';
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'cancelled': return 'error';
            case 'refunded': return 'error';
            default: return 'neutral';
        }
    };

    const filteredOrders = orders?.filter(order =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search orders, emails, or IDs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors">
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <ModernCard noPadding className="overflow-hidden">
                {error && (
                    <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-sm">
                        Error loading orders: {error}
                    </div>
                )}

                <ModernTable
                    data={filteredOrders}
                    loading={loading}
                    emptyMessage="No orders found matching your search."
                    columns={[
                        {
                            key: 'order_number',
                            header: 'Order',
                            render: (val, row) => (
                                <div>
                                    <div className="font-medium text-white">#{val || row.id?.slice(0, 8)}</div>
                                    <div className="text-xs text-zinc-500">{new Date(row.created_at).toLocaleDateString()}</div>
                                </div>
                            )
                        },
                        {
                            key: 'customer_email',
                            header: 'Customer',
                            render: (val, row) => (
                                <div>
                                    <div className="text-zinc-200">{val || 'Guest Customer'}</div>
                                    {row.is_guest && <span className="text-xs text-zinc-500">Guest Checkout</span>}
                                </div>
                            )
                        },
                        {
                            key: 'status',
                            header: 'Status',
                            render: (val) => (
                                <ModernBadge variant={getStatusVariant(val)}>{val || 'Unknown'}</ModernBadge>
                            )
                        },
                        {
                            key: 'total_amount',
                            header: 'Total',
                            align: 'right',
                            render: (val) => <span className="font-medium text-white">{formatCurrency(val)}</span>
                        },
                        {
                            key: 'id',
                            header: 'Actions',
                            align: 'right',
                            render: (val) => (
                                <button
                                    onClick={() => setSelectedOrderId(selectedOrderId === val ? null : val)}
                                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                >
                                    <Eye size={18} />
                                </button>
                            )
                        }
                    ]}
                />
            </ModernCard>

            {/* Order Details Drawer/Panel */}
            {selectedOrderId && (
                <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-zinc-950 border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white">Order Details</h3>
                            <button
                                onClick={() => setSelectedOrderId(null)}
                                className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white"
                            >
                                <Eye size={20} />
                            </button>
                        </div>

                        {itemsLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-24 bg-zinc-900 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    {orderItems?.map((item, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="w-16 h-16 object-cover rounded-md bg-zinc-800" />
                                            ) : (
                                                <div className="w-16 h-16 bg-zinc-800 rounded-md flex items-center justify-center text-zinc-600">
                                                    <ShoppingBag size={24} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-white truncate">{item.product_name}</h4>
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    {item.variant && <span className="mr-2">{item.variant}</span>}
                                                    x{item.quantity}
                                                </p>
                                                <div className="mt-2 font-medium text-sm text-zinc-300">
                                                    {formatCurrency(item.total_price)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-zinc-800 pt-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Subtotal</span>
                                        <span className="text-white">{formatCurrency(orders?.find(o => o.id === selectedOrderId)?.total_amount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Shipping</span>
                                        <span className="text-white">Free</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold pt-3 border-t border-zinc-800">
                                        <span className="text-white">Total</span>
                                        <span className="text-white">{formatCurrency(orders?.find(o => o.id === selectedOrderId)?.total_amount || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
