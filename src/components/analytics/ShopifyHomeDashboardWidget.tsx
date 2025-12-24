/**
 * Shopify Home Dashboard Overview Widget
 * 
 * Pixel-perfect clone of Shopify's Home Dashboard Overview card
 * Single interactive card with tabbed metric selector
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Pencil, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  formatCurrency, 
  formatPercentage, 
  formatNumber, 
  formatChartDate,
  formatDateRange,
  type DashboardData,
} from '@/data/shopifyHomeDashboardData';
import { useShopifyHomeDashboard } from '@/hooks/useShopifyHomeDashboard';
import { useDashboardTables } from '@/hooks/useDashboardTables';
import { OrdersTable } from './OrdersTable';
import { CustomersTable } from './CustomersTable';
import { VisitedLinksTable } from './VisitedLinksTable';
import { InventoryTable } from './InventoryTable';

type MetricKey = 'sessions' | 'total_sales' | 'total_orders' | 'conversion_rate';

// Date range options
interface DateRangeOption {
  label: string;
  value: string; // Unique identifier
  days: number; // Days for calculation
}

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { label: 'Today', value: 'today', days: 1 },
  { label: 'Yesterday', value: 'yesterday', days: 1 },
  { label: 'Last 7 days', value: 'last_7_days', days: 7 },
  { label: 'Last 30 days', value: 'last_30_days', days: 30 },
  { label: 'Last 90 days', value: 'last_90_days', days: 90 },
  { label: 'Last 365 days', value: 'last_365_days', days: 365 },
];

// Channel options
const CHANNEL_OPTIONS = [
  { label: 'All channels', value: 'all' },
  { label: 'Online Store', value: 'online_store' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Direct', value: 'direct' },
];

interface MetricTabProps {
  id: MetricKey;
  label: string;
  value: string;
  trend: number;
  isActive: boolean;
  onClick: () => void;
}

const MetricTab: React.FC<MetricTabProps> = ({ id, label, value, trend, isActive, onClick }) => {
  const isPositive = trend >= 0;
  const trendColor = isPositive ? 'text-emerald-700' : 'text-stone-600';

  return (
    <button
      onClick={onClick}
      className={`relative flex-1 min-w-[120px] sm:min-w-0 px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-[#F1F1F1] border border-gray-200'
          : 'bg-transparent hover:bg-gray-50'
      }`}
    >
      {/* Edit Icon - Only on active tab */}
      {isActive && (
        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
          <Pencil className="w-3 h-3 text-gray-500" />
        </div>
      )}

      <div className="text-left">
        {/* Label with dotted underline */}
        <div className="mb-0.5 sm:mb-1">
          <span className="text-[10px] sm:text-xs font-semibold text-[#303030] underline decoration-dotted">
            {label}
          </span>
        </div>

        {/* Value */}
        <div className="text-sm sm:text-base md:text-lg font-bold text-[#303030] mb-0.5 sm:mb-1 truncate">
          {value}
        </div>

        {/* Trend */}
        <div className={`text-[10px] sm:text-xs font-medium ${trendColor} flex items-center gap-1`}>
          {isPositive ? (
            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          ) : (
            <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          )}
          <span>{formatPercentage(trend)}</span>
        </div>
      </div>
    </button>
  );
};

export const ShopifyHomeDashboardWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MetricKey>('total_sales');
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('last_30_days');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const channelDropdownRef = useRef<HTMLDivElement>(null);

  // Convert date range selection to days for the hook
  const getDaysFromRange = (range: string): number => {
    switch (range) {
      case 'today':
      case 'yesterday':
        return 1;
      case 'last_7_days':
        return 7;
      case 'last_30_days':
        return 30;
      case 'last_90_days':
        return 90;
      case 'last_365_days':
        return 365;
      default:
        return 30;
    }
  };

  const selectedDays = getDaysFromRange(selectedDateRange);
  const { data, loading, error } = useShopifyHomeDashboard(selectedDays);
  const { orders, customers, visitedLinks, inventory, loading: tablesLoading } = useDashboardTables(selectedDays);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
      if (channelDropdownRef.current && !channelDropdownRef.current.contains(event.target as Node)) {
        setIsChannelDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get current date range label
  const getDateRangeLabel = () => {
    const option = DATE_RANGE_OPTIONS.find(opt => opt.value === selectedDateRange);
    return option ? option.label : 'Last 30 days';
  };

  // Handle date range selection
  const handleDateRangeSelect = (option: DateRangeOption) => {
    setSelectedDateRange(option.value);
    setIsDateDropdownOpen(false);
  };

  /**
   * Get current metric data based on active tab
   * Must be called before any conditional returns (Rules of Hooks)
   */
  const currentMetric = useMemo(() => {
    if (!data) return null;
    return data.metrics[activeTab];
  }, [activeTab, data]);

  /**
   * Get display value for current metric
   * Regular function (not a hook) - can be called conditionally
   */
  const getMetricValue = (key: MetricKey): string => {
    if (!data) return '0';
    const metric = data.metrics[key];
    if (!metric) return '0';
    switch (key) {
      case 'sessions':
        return formatNumber((metric as any).total_count || 0);
      case 'total_sales':
        return formatCurrency((metric as any).gross_amount || 0, (metric as any).currency || 'USD');
      case 'total_orders':
        return formatNumber((metric as any).order_count || 0);
      case 'conversion_rate':
        return `${((metric as any).percentage || 0).toFixed(1)}%`;
      default:
        return '0';
    }
  };

  /**
   * Prepare chart data
   * Must be called before any conditional returns (Rules of Hooks)
   */
  const chartData = useMemo(() => {
    if (!currentMetric || !currentMetric.daily_data) return [];
    return currentMetric.daily_data.map((point) => ({
      date: formatChartDate(point.date),
      fullDate: point.date,
      current: point.current,
      previous: point.previous,
    }));
  }, [currentMetric]);

  /**
   * Custom Tooltip
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-xs text-gray-600 mb-2">{data.fullDate}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#005BD3]" />
              <span className="text-sm font-medium text-[#303030]">
                Current: {formatNumber(data.current)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#A4C6FF] border border-dashed" />
              <span className="text-sm font-medium text-gray-600">
                Previous: {formatNumber(data.previous)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Conditional returns AFTER all hooks
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#F1F1F1] p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <span className="text-[#616161]">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F1F1F1] p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <span className="text-red-500">Error loading dashboard: {error.message}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F1F1F1] p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <span className="text-[#616161]">No data available for the selected period.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F1F1] p-3 sm:p-4 md:p-6">
      {/* Header Controls */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Left Side: Date & Channel Pickers */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Date Range Dropdown */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                onClick={() => {
                  setIsDateDropdownOpen(!isDateDropdownOpen);
                  setIsChannelDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs text-sm font-medium text-[#303030] hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{getDateRangeLabel()}</span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDateDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {DATE_RANGE_OPTIONS.map((option) => {
                      const isSelected = selectedDateRange === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleDateRangeSelect(option)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            isSelected
                              ? 'bg-gray-50 text-[#005BD3] font-medium'
                              : 'text-[#303030]'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Channel Dropdown */}
            <div className="relative" ref={channelDropdownRef}>
              <button
                onClick={() => {
                  setIsChannelDropdownOpen(!isChannelDropdownOpen);
                  setIsDateDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs text-sm font-medium text-[#303030] hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                <span className="truncate">
                  {CHANNEL_OPTIONS.find(opt => opt.value === selectedChannel)?.label || 'All channels'}
                </span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isChannelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isChannelDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {CHANNEL_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedChannel(option.value);
                          setIsChannelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          selectedChannel === option.value
                            ? 'bg-gray-50 text-[#005BD3] font-medium'
                            : 'text-[#303030]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Live Badge & Payout */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Live Visitor Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-xs font-medium text-[#303030] whitespace-nowrap">
                {data?.live_visitors || 0} live visitor{(data?.live_visitors || 0) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Payout Display */}
            <div className="text-xs sm:text-sm text-[#616161] whitespace-nowrap">
              Next payout: {formatCurrency(data?.next_payout || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6 overflow-x-auto">
            <MetricTab
              id="sessions"
              label="Sessions"
              value={getMetricValue('sessions')}
              trend={data.metrics.sessions.growth_rate}
              isActive={activeTab === 'sessions'}
              onClick={() => setActiveTab('sessions')}
            />
            <MetricTab
              id="total_sales"
              label="Total sales"
              value={getMetricValue('total_sales')}
              trend={data.metrics.total_sales.growth_rate}
              isActive={activeTab === 'total_sales'}
              onClick={() => setActiveTab('total_sales')}
            />
            <MetricTab
              id="total_orders"
              label="Orders"
              value={getMetricValue('total_orders')}
              trend={data.metrics.total_orders.growth_rate}
              isActive={activeTab === 'total_orders'}
              onClick={() => setActiveTab('total_orders')}
            />
            <MetricTab
              id="conversion_rate"
              label="Conversion rate"
              value={getMetricValue('conversion_rate')}
              trend={data.metrics.conversion_rate.growth_rate}
              isActive={activeTab === 'conversion_rate'}
              onClick={() => setActiveTab('conversion_rate')}
            />

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-[#303030] transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform ${isExpanded ? '' : 'rotate-180'}`}
              />
            </button>
          </div>

          {/* Chart Section */}
          {isExpanded && currentMetric && chartData.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#005BD3" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#005BD3" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#616161' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#616161' }}
                      width={60}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Previous Period - Dashed Line */}
                    <Area
                      type="monotone"
                      dataKey="previous"
                      stroke="#A4C6FF"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fill="none"
                      dot={false}
                      activeDot={false}
                    />

                    {/* Current Period - Solid Line with Fill */}
                    <Area
                      type="monotone"
                      dataKey="current"
                      stroke="#005BD3"
                      strokeWidth={2}
                      fill="url(#currentGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#005BD3', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              {data && (
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-3 sm:mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#005BD3]" />
                    <span className="text-xs text-[#616161]">
                      {formatDateRange(
                        data.selected_date_range.start,
                        data.selected_date_range.end
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#A4C6FF] border border-dashed border-[#A4C6FF]" />
                    <span className="text-xs text-[#616161]">
                      {formatDateRange(
                        data.compare_date_range.start,
                        data.compare_date_range.end
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Tables Section */}
      <div className="max-w-7xl mx-auto mt-4 sm:mt-6 space-y-4 sm:space-y-6">
        {/* Orders and Customers Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <OrdersTable orders={orders} loading={tablesLoading} />
          <CustomersTable customers={customers} loading={tablesLoading} />
        </div>

        {/* Visited Links and Inventory Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <VisitedLinksTable links={visitedLinks} loading={tablesLoading} />
          <InventoryTable inventory={inventory} loading={tablesLoading} />
        </div>
      </div>
    </div>
  );
};

