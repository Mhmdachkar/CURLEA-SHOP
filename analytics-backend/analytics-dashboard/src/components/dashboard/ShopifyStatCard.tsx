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
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm font-medium text-gray-600 truncate flex-1">{title}</span>
          {icon && <div className="text-gray-400 flex-shrink-0 ml-2">{icon}</div>}
        </div>
        
        <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
          <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 break-words">{value}</div>
          
          {trend && (
            <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="mt-2 text-xs sm:text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

