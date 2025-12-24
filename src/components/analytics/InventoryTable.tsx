/**
 * InventoryTable Component
 * Displays product inventory information in a table
 * Shopify Polaris style
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/data/shopifyHomeDashboardData';
import type { InventoryRow } from '@/services/dashboardTablesService';

interface InventoryTableProps {
  inventory: InventoryRow[];
  loading?: boolean;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ inventory, loading }) => {
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

  if (inventory.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Product Inventory
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
                SKU
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales (30d)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map((item, index) => {
              // Determine stock status based on available_quantity and stock_status
              const getStockStatus = () => {
                if (item.stock_status === 'out_of_stock' || item.available_quantity === 0) {
                  return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Out of Stock' };
                }
                if (item.stock_status === 'low_stock' || item.available_quantity < 10) {
                  return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Low Stock' };
                }
                if (item.stock_status === 'moderate') {
                  return { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Moderate' };
                }
                return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'In Stock' };
              };
              
              const stockStatus = getStockStatus();
              const StatusIcon = stockStatus.icon;

              // Build variant display name
              const variantParts = [];
              if (item.size && item.size !== 'Standard') variantParts.push(item.size);
              if (item.color) variantParts.push(item.color);
              const variantDisplay = variantParts.length > 0 ? ` (${variantParts.join(', ')})` : '';

              return (
                <motion.tr
                  key={item.id || `${item.product_id}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Product / Variant Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product_name || 'Untitled Product'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.variant_name || 'Standard'}{variantDisplay}
                        </p>
                        {item.product_id && (
                          <p className="text-xs text-gray-400">
                            ID: {item.product_id.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {item.sku || '—'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {item.price !== null ? formatCurrency(item.price) : '—'}
                    </span>
                  </td>

                  {/* Stock Quantity */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-semibold ${
                        item.stock_quantity === 0 
                          ? 'text-red-600' 
                          : item.stock_quantity < 10 
                          ? 'text-yellow-600' 
                          : 'text-gray-900'
                      }`}>
                        {item.stock_quantity}
                      </span>
                      {item.reserved_quantity > 0 && (
                        <span className="text-xs text-gray-500">
                          ({item.reserved_quantity} reserved)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Available Quantity */}
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-semibold ${
                      item.available_quantity === 0 
                        ? 'text-red-600' 
                        : item.available_quantity < 10 
                        ? 'text-yellow-600' 
                        : 'text-gray-900'
                    }`}>
                      {item.available_quantity}
                    </span>
                  </td>

                  {/* Sales Last 30 Days */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-900">
                      {item.sales_last_30_days || 0}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color} ${stockStatus.bg}`}>
                        <StatusIcon className="w-3 h-3" />
                        {stockStatus.label}
                      </span>
                      {!item.is_active && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                          Inactive
                        </span>
                      )}
                    </div>
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
            Showing {inventory.length} variants
            {inventory.filter(p => p.stock_status === 'low_stock' || (p.available_quantity > 0 && p.available_quantity < 10)).length > 0 && (
              <span className="ml-2 text-yellow-600">
                • {inventory.filter(p => p.stock_status === 'low_stock' || (p.available_quantity > 0 && p.available_quantity < 10)).length} low stock
              </span>
            )}
            {inventory.filter(p => p.stock_status === 'out_of_stock' || p.available_quantity === 0).length > 0 && (
              <span className="ml-2 text-red-600">
                • {inventory.filter(p => p.stock_status === 'out_of_stock' || p.available_quantity === 0).length} out of stock
              </span>
            )}
          </span>
          <button className="text-[#008060] hover:text-[#006d52] font-medium transition-colors">
            View detailed report →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

