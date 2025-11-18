import { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign,
  ShoppingCart,
  Eye,
  Activity,
  Settings,
  Filter
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface ShopifySidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'sales', label: 'Sales', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-5 h-5" /> },
  { id: 'products', label: 'Products', icon: <Package className="w-5 h-5" /> },
  { id: 'pricing', label: 'Pricing', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'traffic', label: 'Traffic', icon: <Users className="w-5 h-5" /> },
  { id: 'events', label: 'Events', icon: <Activity className="w-5 h-5" /> },
  { id: 'visits', label: 'Visits', icon: <Eye className="w-5 h-5" /> },
  { id: 'pageviews', label: 'Page Views', icon: <Eye className="w-5 h-5" /> },
  { id: 'cartevents', label: 'Cart Events', icon: <ShoppingCart className="w-5 h-5" /> },
  { id: 'campaigns', label: 'Campaigns', icon: <Filter className="w-5 h-5" /> },
  { id: 'funnel', label: 'Abandoned Carts', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'funnelhistory', label: 'Funnel History', icon: <Activity className="w-5 h-5" /> },
];

export function ShopifySidebar({ activeTab, onTabChange }: ShopifySidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">CURLEA Analytics</h1>
        <p className="text-xs text-gray-400 mt-1">Business Intelligence</p>
      </div>

      {/* Navigation */}
      <nav className="py-4">
        <div className="px-3 mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Analytics
          </span>
        </div>
        
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
              ${activeTab === item.id 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

