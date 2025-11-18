import { ReactNode } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ShopifyStatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function ShopifyStatCard({ title, value, icon, trend, subtitle }: ShopifyStatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        
        <div className="flex items-baseline gap-3">
          <div className="text-3xl font-semibold text-gray-900">{value}</div>
          
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

