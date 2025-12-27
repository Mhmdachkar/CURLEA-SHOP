/**
 * CustomersTable Component
 * Displays customer information in a table
 * Shopify Polaris style
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Mail } from 'lucide-react';
import { formatCurrency } from '@/data/shopifyHomeDashboardData';
import type { CustomerRow } from '@/services/dashboardTablesService';

interface CustomersTableProps {
  customers: CustomerRow[];
  loading?: boolean;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({ customers, loading }) => {
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

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No customers found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Top Customers
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
                Customer
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Order Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Order
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer, index) => {
              const lastOrderDate = new Date(customer.last_order_date);
              const formattedDate = lastOrderDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <motion.tr
                  key={customer.customer_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Customer Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#008060] rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {customer.customer_email !== 'guest' ? customer.customer_email : 'Guest Customer'}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {customer.customer_id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Orders Count */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {customer.total_orders}
                    </span>
                  </td>

                  {/* Total Spent */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(customer.total_spent)}
                    </span>
                  </td>

                  {/* Average Order Value */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-900">
                      {formatCurrency(customer.average_order_value)}
                    </span>
                  </td>

                  {/* Last Order Date */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {formattedDate}
                    </span>
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
            Showing top {customers.length} customers
          </span>
          <button className="text-[#008060] hover:text-[#006d52] font-medium transition-colors">
            View detailed report →
          </button>
        </div>
      </div>
    </motion.div>
  );
};


