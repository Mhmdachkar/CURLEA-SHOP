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
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {showDateRange && onDateRangeChange && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={dateRange}
                  onChange={(e) => onDateRangeChange(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </ShopifyButton>
            )}

            <ShopifyButton variant="secondary" size="medium">
              <Download className="w-4 h-4" />
              Export
            </ShopifyButton>

            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

