/**
 * VisitedLinksTable Component
 * Displays most visited pages/links in a table
 * Shopify Polaris style
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link2, ExternalLink, Clock } from 'lucide-react';
import type { VisitedLinkRow } from '@/services/dashboardTablesService';

interface VisitedLinksTableProps {
  links: VisitedLinkRow[];
  loading?: boolean;
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}m ${secs}s`;
}

export const VisitedLinksTable: React.FC<VisitedLinksTableProps> = ({ links, loading }) => {
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

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-center py-8">
          <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No page views found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Most Visited Pages
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
                Page
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referrer
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visits
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unique Visitors
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Visited
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {links.map((link, index) => {
              const lastVisited = new Date(link.last_visited);
              const formattedDate = lastVisited.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = lastVisited.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              // Clean up URL for display
              const displayUrl = link.url.length > 50 
                ? link.url.substring(0, 50) + '...' 
                : link.url;

              return (
                <motion.tr
                  key={link.url}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Page URL */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate" title={link.url}>
                          {link.page_title || displayUrl}
                        </p>
                        <p className="text-xs text-gray-500 truncate" title={link.url}>
                          {displayUrl}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Referrer (Where they came from) */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {link.referrer ? (
                        <>
                          <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate" title={link.referrer}>
                            {link.referrer.length > 40 
                              ? link.referrer.substring(0, 40) + '...' 
                              : link.referrer}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Direct</span>
                      )}
                    </div>
                  </td>

                  {/* Visit Count */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {link.visit_count.toLocaleString()}
                    </span>
                  </td>

                  {/* Unique Visitors */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-900">
                      {link.unique_visitors.toLocaleString()}
                    </span>
                  </td>

                  {/* Average Time */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {formatTime(link.avg_time_on_page)}
                      </span>
                    </div>
                  </td>

                  {/* Last Visited */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">{formattedDate}</span>
                      <span className="text-xs text-gray-500">{formattedTime}</span>
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
            Showing top {links.length} pages
          </span>
          <button className="text-[#008060] hover:text-[#006d52] font-medium transition-colors">
            View detailed report →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

