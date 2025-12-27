/**
 * VisitsTable Component
 * Displays visitor information including device, location, and UTM parameters
 * Shopify Polaris style
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, Monitor, Smartphone, Tablet, ExternalLink } from 'lucide-react';
import type { VisitRow } from '@/services/dashboardTablesService';

interface VisitsTableProps {
  visits: VisitRow[];
  loading?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDeviceIcon(visit: VisitRow) {
  if (visit.is_mobile) return Smartphone;
  if (visit.is_tablet) return Tablet;
  return Monitor;
}

function getDeviceLabel(visit: VisitRow): string {
  if (visit.is_mobile) return 'Mobile';
  if (visit.is_tablet) return 'Tablet';
  return 'Desktop';
}

export const VisitsTable: React.FC<VisitsTableProps> = ({ visits, loading }) => {
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

  if (visits.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-center py-8">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No visits found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Visitor Information
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
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Browser / OS
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Landing Page
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Screen
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visit Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {visits.map((visit, index) => {
              const DeviceIcon = getDeviceIcon(visit);
              const deviceLabel = getDeviceLabel(visit);

              return (
                <motion.tr
                  key={visit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Location */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        {visit.city && visit.country ? (
                          <>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {visit.city}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {visit.region && `${visit.region}, `}{visit.country}
                            </p>
                          </>
                        ) : visit.country ? (
                          <p className="text-sm text-gray-900">{visit.country}</p>
                        ) : (
                          <p className="text-sm text-gray-400">Unknown</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Device */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DeviceIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {deviceLabel}
                        </p>
                        {visit.device && (
                          <p className="text-xs text-gray-500 truncate">
                            {visit.device}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Browser / OS */}
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      {visit.browser && (
                        <p className="text-sm text-gray-900 truncate">
                          {visit.browser}
                        </p>
                      )}
                      {visit.os && (
                        <p className="text-xs text-gray-500 truncate">
                          {visit.os}
                        </p>
                      )}
                      {!visit.browser && !visit.os && (
                        <p className="text-sm text-gray-400">—</p>
                      )}
                    </div>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      {visit.utm_source || visit.referrer ? (
                        <>
                          {visit.utm_source && (
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {visit.utm_source}
                            </p>
                          )}
                          {visit.utm_campaign && (
                            <p className="text-xs text-gray-500 truncate">
                              {visit.utm_campaign}
                            </p>
                          )}
                          {visit.referrer && !visit.utm_source && (
                            <div className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-500 truncate" title={visit.referrer}>
                                {visit.referrer.length > 30 
                                  ? visit.referrer.substring(0, 30) + '...' 
                                  : visit.referrer}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-400">Direct</p>
                      )}
                    </div>
                  </td>

                  {/* Landing Page */}
                  <td className="px-4 py-3">
                    {visit.landing_page ? (
                      <p className="text-sm text-gray-900 truncate" title={visit.landing_page}>
                        {visit.landing_page.length > 30 
                          ? visit.landing_page.substring(0, 30) + '...' 
                          : visit.landing_page}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">—</p>
                    )}
                  </td>

                  {/* Screen */}
                  <td className="px-4 py-3">
                    {visit.screen_width && visit.screen_height ? (
                      <p className="text-sm text-gray-900">
                        {visit.screen_width} × {visit.screen_height}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">—</p>
                    )}
                  </td>

                  {/* Visit Date */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">
                      {formatDate(visit.created_at)}
                    </p>
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
            Showing {visits.length} recent visits
          </span>
          <button className="text-[#008060] hover:text-[#006d52] font-medium transition-colors">
            View detailed report →
          </button>
        </div>
      </div>
    </motion.div>
  );
};


