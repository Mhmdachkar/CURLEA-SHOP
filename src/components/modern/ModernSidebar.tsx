import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Settings,
    Package,
    CreditCard,
    LogOut,
    Menu,
    X,
    Activity,
    Megaphone,
    Smartphone,
    Filter
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ModernSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function ModernSidebar({ activeTab, onTabChange }: ModernSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'funnel', label: 'Funnel', icon: Filter },
        { id: 'marketing', label: 'Marketing', icon: Megaphone },
        { id: 'behavior', label: 'Behavior', icon: Smartphone },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'analytics', label: 'Realtime', icon: Activity },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'pricing', label: 'Pricing', icon: CreditCard },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 text-white rounded-lg border border-zinc-800"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed top-0 left-0 z-40 h-screen w-64 bg-zinc-950 border-r border-zinc-800 transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-zinc-800">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <span className="text-white font-bold text-xl tracking-tight">Curlea</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onTabChange(item.id);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                    )}
                                >
                                    <Icon size={18} className={cn(isActive ? "text-violet-400" : "text-zinc-500 group-hover:text-white")} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-zinc-800">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                <Users size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">Admin User</p>
                                <p className="text-xs text-zinc-500 truncate">admin@curlea.com</p>
                            </div>
                            <button className="text-zinc-500 hover:text-white transition-colors">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
