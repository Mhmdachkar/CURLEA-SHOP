/**
 * Modern Analytics Dashboard
 * Replaces the old Shopify-style dashboard with a premium dark theme
 */

import { useState } from 'react';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { OverviewView } from '@/components/modern/OverviewView';
import { OrdersView } from '@/components/modern/OrdersView';
import { CustomersView } from '@/components/modern/CustomersView';
import { RealtimeView } from '@/components/modern/RealtimeView';
import { ProductsView } from '@/components/modern/ProductsView';
import { MarketingView } from '@/components/modern/MarketingView';
import { BehaviorView } from '@/components/modern/BehaviorView';
import { FunnelView } from '@/components/modern/FunnelView';
import { InventoryView } from '@/components/modern/InventoryView';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [days, setDays] = useState(30);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView days={days} />;
      case 'orders':
        return <OrdersView />;
      case 'customers':
        return <CustomersView />;
      case 'analytics': // Using 'analytics' tab for Realtime for now, or could be separate
        return <RealtimeView />;
      case 'products':
        return <ProductsView />;
      case 'marketing':
        return <MarketingView />;
      case 'behavior':
        return <BehaviorView />;
      case 'funnel':
        return <FunnelView />;
      case 'inventory':
        return <InventoryView />;
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
