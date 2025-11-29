/**
 * Modern Analytics Dashboard
 * Replaces the old Shopify-style dashboard with a premium dark theme
 */

import { useState } from 'react';
import { ModernLayout } from './modern/ModernLayout';
import { OverviewView } from './modern/OverviewView';
import { OrdersView } from './modern/OrdersView';
import { InventoryView } from './modern/InventoryView';
import { MarketingView } from './modern/MarketingView';
import { FunnelView } from './modern/FunnelView';
import { BehaviorView } from './modern/BehaviorView';
import { CustomersView } from './modern/CustomersView';
import { ProductsView } from './modern/ProductsView';
import { RealtimeView } from './modern/RealtimeView';
import { PricingManagement } from './PricingManagement';

export default function DashboardShopify() {
  const [activeTab, setActiveTab] = useState('overview');
  const [days, setDays] = useState(30);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView days={days} />;
      case 'orders':
        return <OrdersView />;
      case 'inventory':
        return <InventoryView />;
      case 'marketing':
        return <MarketingView />;
      case 'funnel':
        return <FunnelView />;
      case 'behavior':
        return <BehaviorView />;
      case 'customers':
        return <CustomersView />;
      case 'products':
        return <ProductsView />;
      case 'analytics':
        return <RealtimeView />;
      case 'pricing':
        return <PricingManagement />;
      default:
        return (
          <div className="flex items-center justify-center h-96 text-zinc-500">
            This section is under construction.
          </div>
        );
    }
  };

  return (
    <ModernLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
      subtitle={`Overview of your ${activeTab} metrics`}
      headerActions={
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${days === d
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              {d}d
            </button>
          ))}
        </div>
      }
    >
      {renderContent()}
    </ModernLayout>
  );
}
