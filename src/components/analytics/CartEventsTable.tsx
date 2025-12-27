/**
 * CartEventsTable Component
 * Displays cart events data showing products with most views and clicks
 * Shopify Polaris style
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Plus, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/data/shopifyHomeDashboardData';
import type { CartEventRow } from '@/services/dashboardTablesService';

interface CartEventsTableProps {
  cartEvents: CartEventRow[];
  loading?: boolean;
}

export const CartEventsTable: React.FC<CartEventsTableProps> = ({ cartEvents, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cartEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No cart events found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Product Engagement
            </h3>
          </div>
          <button className="text-sm text-[#008060] hover:text-[#006d52] font-medium transition-colors">
            View all
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product / Variant
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variant Details
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Add to Cart
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unique Sessions
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cartEvents.map((event, index) => {
              // Build variant display
              const variantParts = [];
              if (event.variant_size) variantParts.push(event.variant_size);
              if (event.variant_color) variantParts.push(event.variant_color);
              const variantDisplay = variantParts.length > 0 ? ` (${variantParts.join(', ')})` : '';

              return (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Product / Variant Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.product_title || event.external_product_id || 'Unknown Product'}
                        </p>
                        {event.variant_title && (
                          <p className="text-xs text-gray-500 truncate">
                            {event.variant_title}{variantDisplay}
                          </p>
                        )}
                        {event.variant_sku && (
                          <p className="text-xs text-gray-400">
                            SKU: {event.variant_sku}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Variant Details */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {event.variant_size && (
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs mr-1">
                          {event.variant_size}
                        </span>
                      )}
                      {event.variant_color && (
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                          {event.variant_color}
                        </span>
                      )}
                      {!event.variant_size && !event.variant_color && (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {event.view_count.toLocaleString()}
                      </span>
                    </div>
                  </td>

                  {/* Add to Cart */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Plus className="w-3 h-3 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">
                        {event.add_to_cart_count.toLocaleString()}
                      </span>
                    </div>
                  </td>

                  {/* Unique Sessions */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-900">
                      {event.unique_sessions.toLocaleString()}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {event.variant_price || event.price ? formatCurrency(event.variant_price || event.price || 0) : '—'}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3 text-right">
                    {event.variant_available_quantity !== null ? (
                      <span className={`text-sm font-semibold ${
                        event.variant_available_quantity === 0
                          ? 'text-red-600'
                          : event.variant_available_quantity < 10
                          ? 'text-yellow-600'
                          : 'text-gray-900'
                      }`}>
                        {event.variant_available_quantity}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Showing top {cartEvents.length} products by engagement
          </span>
          <button className="text-[#008060] hover:text-[#006d52] font-medium transition-colors">
            View detailed report →
          </button>
        </div>
      </div>
    </motion.div>
  );
};


