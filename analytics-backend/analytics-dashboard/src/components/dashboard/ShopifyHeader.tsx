import { ReactNode } from 'react';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import { ShopifyButton } from './ShopifyButton';

interface ShopifyHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showDateRange?: boolean;
  dateRange?: number;
  onDateRangeChange?: (days: number) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export function ShopifyHeader({
  title,
  subtitle,
  actions,
  showDateRange = false,
  dateRange = 30,
  onDateRangeChange,
  onRefresh,
  loading = false,
}: ShopifyHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">{title}</h1>
            {subtitle && <p className="mt-1 text-xs sm:text-sm text-gray-500">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {showDateRange && onDateRangeChange && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 hidden sm:block" />
                <select
                  value={dateRange}
                  onChange={(e) => onDateRangeChange(Number(e.target.value))}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
              </div>
            )}

            {onRefresh && (
              <ShopifyButton
                variant="secondary"
                size="medium"
                onClick={onRefresh}
                loading={loading}
                className="text-xs sm:text-sm"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </ShopifyButton>
            )}

            <ShopifyButton variant="secondary" size="medium" className="text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </ShopifyButton>

            {actions && <div className="w-full sm:w-auto">{actions}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

