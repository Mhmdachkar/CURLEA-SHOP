/**
 * Shopify Home Dashboard Overview Widget
 * 
 * Pixel-perfect clone of Shopify's Home Dashboard Overview card
 * Single interactive card with tabbed metric selector
 */

import React, { useState, useMemo } from 'react';
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
import { PageViewsTable } from './PageViewsTable';
import { VisitsTable } from './VisitsTable';
import { CartEventsTable } from './CartEventsTable';

type MetricKey = 'sessions' | 'total_sales' | 'total_orders' | 'conversion_rate';

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
      className={`relative flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-[#F1F1F1] border border-gray-200'
          : 'bg-transparent hover:bg-gray-50'
      }`}
    >
      {/* Edit Icon - Only on active tab */}
      {isActive && (
        <div className="absolute top-2 right-2">
          <Pencil className="w-3 h-3 text-gray-500" />
        </div>
      )}

      <div className="text-left">
        {/* Label with dotted underline */}
        <div className="mb-1">
          <span className="text-xs font-semibold text-[#303030] underline decoration-dotted">
            {label}
          </span>
        </div>

        {/* Value */}
        <div className="text-lg font-bold text-[#303030] mb-1">
          {value}
        </div>

        {/* Trend */}
        <div className={`text-xs font-medium ${trendColor} flex items-center gap-1`}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
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
  const [dateRange, setDateRange] = useState(30);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const { data, loading, error } = useShopifyHomeDashboard(dateRange);
  const { orders, customers, visitedLinks, inventory, pageViews, visits, cartEvents, loading: tablesLoading } = useDashboardTables(dateRange);

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

  const dateRangeOptions = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' },
    { value: 180, label: 'Last 6 months' },
    { value: 365, label: 'Last year' },
  ];

  const channelOptions = [
    { value: 'all', label: 'All channels' },
    { value: 'online', label: 'Online Store' },
    { value: 'social', label: 'Social Media' },
    { value: 'direct', label: 'Direct' },
  ];

  const currentDateLabel = dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'Last 30 days';
  const currentChannelLabel = channelOptions.find(opt => opt.value === selectedChannel)?.label || 'All channels';

  return (
    <div className="min-h-screen bg-[#F1F1F1] p-6">
      {/* Header Controls */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Side: Date & Channel Pickers */}
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs text-sm font-medium text-[#303030] hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>{currentDateLabel}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showDateDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {dateRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDateRange(option.value);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        dateRange === option.value ? 'bg-gray-50 font-medium text-[#008060]' : 'text-[#303030]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Channel Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs text-sm font-medium text-[#303030] hover:bg-gray-50 transition-colors"
              >
                <span>{currentChannelLabel}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showChannelDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {channelOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedChannel(option.value);
                        setShowChannelDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedChannel === option.value ? 'bg-gray-50 font-medium text-[#008060]' : 'text-[#303030]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Live Badge & Payout */}
          <div className="flex items-center gap-4">
            {/* Live Visitor Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-[#303030]">
                {data?.live_visitors || 0} live visitor{(data?.live_visitors || 0) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Payout Display */}
            <div className="text-sm text-[#616161]">
              Next payout: {formatCurrency(data?.next_payout || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-2 mb-6">
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
            <div className="mt-6">
              <div className="h-[300px]">
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
                <div className="flex items-center justify-center gap-6 mt-4">
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
      <div className="max-w-7xl mx-auto mt-6 space-y-6">
        {/* Orders and Customers Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrdersTable orders={orders} loading={tablesLoading} />
          <CustomersTable customers={customers} loading={tablesLoading} />
        </div>

        {/* Visited Links and Inventory Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VisitedLinksTable links={visitedLinks} loading={tablesLoading} />
          <InventoryTable inventory={inventory} loading={tablesLoading} />
        </div>

        {/* Page Views and Visitor Sessions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PageViewsTable pageViews={pageViews} loading={tablesLoading} />
          <VisitsTable visits={visits} loading={tablesLoading} />
        </div>

        {/* Cart Events - Full Width */}
        <div className="grid grid-cols-1 gap-6">
          <CartEventsTable cartEvents={cartEvents} loading={tablesLoading} />
        </div>
      </div>
    </div>
  );
};

