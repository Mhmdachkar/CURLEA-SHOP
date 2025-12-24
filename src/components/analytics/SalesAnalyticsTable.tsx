/**
 * Sales Analytics Table Component
 * Displays comprehensive sales data with revenue, costs, and profit calculations
 */

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart } from 'lucide-react';
import type { SalesMetrics, TopProduct } from '../../types/salesAnalytics';
import { formatCurrency, formatPercentage } from '../../services/salesAnalyticsService';

interface SalesAnalyticsTableProps {
  metrics: SalesMetrics | null;
  topProducts: TopProduct[];
  loading: boolean;
}

export function SalesAnalyticsTable({ metrics, topProducts, loading }: SalesAnalyticsTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#303030]">Sales Analytics</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-[#616161]">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No sales data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#005BD3]" />
          <h3 className="text-base font-semibold text-[#303030]">Sales Analytics</h3>
        </div>
        <span className="text-xs text-[#616161]">Comprehensive Overview</span>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="p-4 bg-[#F1F1F1] rounded-lg">
          <div className="text-xs text-[#616161] mb-1">Total Revenue</div>
          <div className="text-xl font-bold text-[#303030]">{formatCurrency(metrics.total_revenue)}</div>
          <div className={`text-xs mt-1 flex items-center gap-1 ${metrics.revenue_growth >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {metrics.revenue_growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatPercentage(metrics.revenue_growth)}
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-4 bg-[#F1F1F1] rounded-lg">
          <div className="text-xs text-[#616161] mb-1">Net Profit</div>
          <div className="text-xl font-bold text-[#303030]">{formatCurrency(metrics.net_profit)}</div>
          <div className={`text-xs mt-1 flex items-center gap-1 ${metrics.profit_growth >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {metrics.profit_growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatPercentage(metrics.profit_growth)}
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-4 bg-[#F1F1F1] rounded-lg">
          <div className="text-xs text-[#616161] mb-1">Total Orders</div>
          <div className="text-xl font-bold text-[#303030]">{metrics.total_orders.toLocaleString()}</div>
          <div className={`text-xs mt-1 flex items-center gap-1 ${metrics.order_growth >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {metrics.order_growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatPercentage(metrics.order_growth)}
          </div>
        </div>

        {/* Profit Margin */}
        <div className="p-4 bg-[#F1F1F1] rounded-lg">
          <div className="text-xs text-[#616161] mb-1">Avg Profit Margin</div>
          <div className="text-xl font-bold text-[#303030]">{metrics.avg_profit_margin.toFixed(1)}%</div>
          <div className="text-xs mt-1 text-[#616161]">
            AOV: {formatCurrency(metrics.avg_order_value)}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Breakdown */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-[#303030] mb-3">Revenue Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#616161]">Product Sales</span>
              <span className="font-medium text-[#303030]">{formatCurrency(metrics.total_revenue_excl_delivery)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#616161]">Delivery Fees</span>
              <span className="font-medium text-[#303030]">{formatCurrency(metrics.total_delivery_fees)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-semibold text-[#303030]">Total Revenue</span>
              <span className="font-semibold text-[#303030]">{formatCurrency(metrics.total_revenue)}</span>
            </div>
          </div>
        </div>

        {/* Profit Breakdown */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-[#303030] mb-3">Profit Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#616161]">Gross Profit</span>
              <span className="font-medium text-[#303030]">{formatCurrency(metrics.gross_profit)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#616161]">Cost of Goods</span>
              <span className="font-medium text-rose-700">-{formatCurrency(metrics.total_cogs)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-semibold text-[#303030]">Net Profit</span>
              <span className="font-semibold text-emerald-700">{formatCurrency(metrics.net_profit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      {topProducts.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#303030] mb-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Top Performing Products
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-xs font-medium text-[#616161]">Product</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-[#616161]">Units</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-[#616161]">Revenue</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-[#616161]">Profit</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-[#616161]">Margin</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="text-sm font-medium text-[#303030] truncate max-w-[200px]">
                        {product.product_display_name}
                      </div>
                      {product.product_category && (
                        <div className="text-xs text-[#616161]">{product.product_category}</div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-sm text-[#303030]">
                      {product.total_units.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right text-sm font-medium text-[#303030]">
                      {formatCurrency(product.total_revenue)}
                    </td>
                    <td className="py-3 px-2 text-right text-sm font-medium text-emerald-700">
                      {formatCurrency(product.total_profit)}
                    </td>
                    <td className="py-3 px-2 text-right text-sm text-[#303030]">
                      {product.profit_margin.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-xs text-[#616161]">Units Sold</div>
          <div className="text-lg font-semibold text-[#303030]">{metrics.total_units_sold.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-[#616161]">Avg Units/Order</div>
          <div className="text-lg font-semibold text-[#303030]">{metrics.avg_units_per_order.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-xs text-[#616161]">Avg Order Value</div>
          <div className="text-lg font-semibold text-[#303030]">{formatCurrency(metrics.avg_order_value)}</div>
        </div>
        <div>
          <div className="text-xs text-[#616161]">Total COGS</div>
          <div className="text-lg font-semibold text-rose-700">{formatCurrency(metrics.total_cogs)}</div>
        </div>
      </div>
    </div>
  );
}

