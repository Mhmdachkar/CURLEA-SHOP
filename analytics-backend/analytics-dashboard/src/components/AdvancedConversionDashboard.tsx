/**
 * Advanced Conversion Analytics Dashboard
 * Deep dive into conversion patterns and customer behavior
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShopifyCard } from '@/components/dashboard/ShopifyCard';
import { ShopifyTable } from '@/components/dashboard/ShopifyTable';
import { ShopifyStatCard } from '@/components/dashboard/ShopifyStatCard';
import { TrendingUp, Clock, Target, Users, DollarSign } from 'lucide-react';

interface ConversionMetrics {
  visit_to_view_rate: number;
  view_to_cart_rate: number;
  cart_to_checkout_rate: number;
  checkout_to_purchase_rate: number;
  overall_conversion_rate: number;
  avg_time_to_conversion: number;
  avg_touches_to_conversion: number;
}

interface TimeToConversion {
  time_bucket: string;
  conversions: number;
  percentage: number;
}

interface DeviceConversion {
  device: string;
  visits: number;
  conversions: number;
  conversion_rate: number;
  avg_order_value: number;
  total_revenue: number;
}

export default function AdvancedConversionDashboard() {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [timeToConversion, setTimeToConversion] = useState<TimeToConversion[] | null>(null);
  const [deviceConversion, setDeviceConversion] = useState<DeviceConversion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadConversionAnalytics();
  }, [days]);

  const loadConversionAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      // Get funnel data from conversion_funnel table
      const { data: funnelData, error: funnelError } = await supabase
        .from('conversion_funnel')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (funnelError) throw funnelError;

      // Aggregate funnel data
      const totals = funnelData?.reduce((acc, row) => ({
        visits: acc.visits + (row.total_visits || 0),
        product_views: acc.product_views + (row.product_views || 0),
        add_to_cart: acc.add_to_cart + (row.add_to_cart || 0),
        checkout_start: acc.checkout_start + (row.checkout_start || 0),
        checkout_complete: acc.checkout_complete + (row.checkout_complete || 0),
      }), { visits: 0, product_views: 0, add_to_cart: 0, checkout_start: 0, checkout_complete: 0 });

      // Calculate conversion rates
      const conversionMetrics: ConversionMetrics = {
        visit_to_view_rate: totals.visits > 0 ? (totals.product_views / totals.visits) * 100 : 0,
        view_to_cart_rate: totals.product_views > 0 ? (totals.add_to_cart / totals.product_views) * 100 : 0,
        cart_to_checkout_rate: totals.add_to_cart > 0 ? (totals.checkout_start / totals.add_to_cart) * 100 : 0,
        checkout_to_purchase_rate: totals.checkout_start > 0 ? (totals.checkout_complete / totals.checkout_start) * 100 : 0,
        overall_conversion_rate: totals.visits > 0 ? (totals.checkout_complete / totals.visits) * 100 : 0,
        avg_time_to_conversion: 0, // Would need session timestamps
        avg_touches_to_conversion: 0, // Would need event sequence data
      };

      setMetrics(conversionMetrics);

      // Get device-based conversion data
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('device, session_id')
        .gte('created_at', startDateStr);

      if (visitsError) throw visitsError;

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('session_id, total_value')
        .gte('created_at', startDateStr);

      if (ordersError) throw ordersError;

      // Create session to device map
      const sessionDeviceMap = new Map<string, string>();
      visits?.forEach((visit: any) => {
        sessionDeviceMap.set(visit.session_id, visit.device);
      });

      // Calculate device conversion metrics
      const deviceMap = new Map<string, any>();
      
      visits?.forEach((visit: any) => {
        if (!deviceMap.has(visit.device)) {
          deviceMap.set(visit.device, {
            device: visit.device,
            visits: 0,
            conversions: 0,
            revenue: 0,
          });
        }
        deviceMap.get(visit.device).visits++;
      });

      orders?.forEach((order: any) => {
        const device = sessionDeviceMap.get(order.session_id) || 'Unknown';
        if (!deviceMap.has(device)) {
          deviceMap.set(device, {
            device,
            visits: 0,
            conversions: 0,
            revenue: 0,
          });
        }
        const deviceData = deviceMap.get(device);
        deviceData.conversions++;
        deviceData.revenue += parseFloat(order.total_value) || 0;
      });

      const deviceConversionData: DeviceConversion[] = Array.from(deviceMap.values()).map((d) => ({
        device: d.device,
        visits: d.visits,
        conversions: d.conversions,
        conversion_rate: d.visits > 0 ? (d.conversions / d.visits) * 100 : 0,
        avg_order_value: d.conversions > 0 ? d.revenue / d.conversions : 0,
        total_revenue: d.revenue,
      })).sort((a, b) => b.visits - a.visits);

      setDeviceConversion(deviceConversionData);

      // Simulate time to conversion data (would need actual session timestamps)
      const timeToConversionData: TimeToConversion[] = [
        { time_bucket: '< 5 minutes', conversions: 0, percentage: 0 },
        { time_bucket: '5-15 minutes', conversions: 0, percentage: 0 },
        { time_bucket: '15-30 minutes', conversions: 0, percentage: 0 },
        { time_bucket: '30-60 minutes', conversions: 0, percentage: 0 },
        { time_bucket: '1-24 hours', conversions: 0, percentage: 0 },
        { time_bucket: '> 24 hours', conversions: 0, percentage: 0 },
      ];
      setTimeToConversion(timeToConversionData);

    } catch (err: any) {
      setError(err.message);
      console.error('[Conversion Analytics] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatPercentage = (num: number) => {
    return `${(num || 0).toFixed(2)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Conversion Analytics</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Key Conversion Metrics */}
      {metrics && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <ShopifyStatCard
            title="Visit → View"
            value={formatPercentage(metrics.visit_to_view_rate)}
            icon={<Users className="w-5 h-5" />}
            subtitle="Product engagement"
          />
          <ShopifyStatCard
            title="View → Cart"
            value={formatPercentage(metrics.view_to_cart_rate)}
            icon={<Target className="w-5 h-5" />}
            subtitle="Add to cart rate"
          />
          <ShopifyStatCard
            title="Cart → Checkout"
            value={formatPercentage(metrics.cart_to_checkout_rate)}
            icon={<TrendingUp className="w-5 h-5" />}
            subtitle="Checkout initiation"
          />
          <ShopifyStatCard
            title="Checkout → Purchase"
            value={formatPercentage(metrics.checkout_to_purchase_rate)}
            icon={<DollarSign className="w-5 h-5 text-green-600" />}
            subtitle="Purchase completion"
          />
          <ShopifyStatCard
            title="Overall Conversion"
            value={formatPercentage(metrics.overall_conversion_rate)}
            icon={<Target className="w-5 h-5 text-green-600" />}
            subtitle="Visit to purchase"
          />
        </div>
      )}

      {/* Conversion Funnel Visualization */}
      {metrics && (
        <ShopifyCard
          title="Detailed Conversion Funnel"
          subtitle="Step-by-step conversion rates"
        >
          <div className="space-y-4">
            {/* Visit to Product View */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Visits → Product Views</span>
                <span className="text-sm font-semibold text-gray-900">{formatPercentage(metrics.visit_to_view_rate)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.visit_to_view_rate, 100)}%` }}
                />
              </div>
            </div>

            {/* Product View to Add to Cart */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Product Views → Add to Cart</span>
                <span className="text-sm font-semibold text-gray-900">{formatPercentage(metrics.view_to_cart_rate)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.view_to_cart_rate, 100)}%` }}
                />
              </div>
            </div>

            {/* Add to Cart to Checkout */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Add to Cart → Checkout</span>
                <span className="text-sm font-semibold text-gray-900">{formatPercentage(metrics.cart_to_checkout_rate)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.cart_to_checkout_rate, 100)}%` }}
                />
              </div>
            </div>

            {/* Checkout to Purchase */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Checkout → Purchase</span>
                <span className="text-sm font-semibold text-gray-900">{formatPercentage(metrics.checkout_to_purchase_rate)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.checkout_to_purchase_rate, 100)}%` }}
                />
              </div>
            </div>

            {/* Overall Conversion */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-semibold text-gray-900">Overall Conversion Rate</span>
                <span className="text-base font-bold text-green-600">{formatPercentage(metrics.overall_conversion_rate)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-green-600 h-6 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.overall_conversion_rate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </ShopifyCard>
      )}

      {/* Device Conversion Performance */}
      <ShopifyCard
        title="Device Conversion Analysis"
        subtitle="Conversion performance by device type"
        noPadding
      >
        <ShopifyTable
          columns={[
            {
              key: 'device',
              header: 'Device',
              render: (val) => <span className="font-medium">{val || 'Unknown'}</span>,
            },
            {
              key: 'visits',
              header: 'Visits',
              align: 'right',
              render: (val) => <span className="font-medium">{formatNumber(val)}</span>,
            },
            {
              key: 'conversions',
              header: 'Conversions',
              align: 'right',
              render: (val) => formatNumber(val),
            },
            {
              key: 'conversion_rate',
              header: 'Conv. Rate',
              align: 'right',
              render: (val) => <span className="font-semibold">{formatPercentage(val)}</span>,
            },
            {
              key: 'avg_order_value',
              header: 'Avg Order Value',
              align: 'right',
              render: (val) => formatCurrency(val),
            },
            {
              key: 'total_revenue',
              header: 'Total Revenue',
              align: 'right',
              render: (val) => <span className="font-semibold text-green-600">{formatCurrency(val)}</span>,
            },
            {
              key: 'conversion_rate',
              header: 'Performance',
              render: (val, row, index, data) => {
                const avgRate = data.reduce((sum: number, d: any) => sum + d.conversion_rate, 0) / data.length;
                const isAboveAvg = val > avgRate;
                return (
                  <span className={`text-sm font-medium ${isAboveAvg ? 'text-green-600' : 'text-gray-500'}`}>
                    {isAboveAvg ? '↑ Above Avg' : '↓ Below Avg'}
                  </span>
                );
              },
            },
          ]}
          data={deviceConversion || []}
          loading={loading}
          emptyMessage="No device data available"
        />
      </ShopifyCard>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
          <p className="font-semibold">Error loading conversion analytics:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}

