/**
 * VisitsTable Component
 * Displays visitor session information with device, location, and source details
 */

import React, { useState } from 'react';
import { Users, Globe, Monitor, Smartphone, Tablet, ChevronDown } from 'lucide-react';

export interface VisitRow {
  id: string;
  session_id: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  landing_page: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  is_mobile: boolean;
  is_tablet: boolean;
  is_desktop: boolean;
  created_at: string;
}

interface VisitsTableProps {
  visits: VisitRow[];
  loading?: boolean;
}

export const VisitsTable: React.FC<VisitsTableProps> = ({ visits, loading }) => {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_ROWS = 10;
  const displayedVisits = showAll ? visits : visits.slice(0, INITIAL_ROWS);
  const hasMore = visits.length > INITIAL_ROWS;

  const getDeviceIcon = (visit: VisitRow) => {
    if (visit.is_mobile) return <Smartphone className="w-4 h-4" />;
    if (visit.is_tablet) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">Visitor Sessions</h3>
        </div>
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" />
          <p className="text-gray-600 mt-2">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">Visitor Sessions</h3>
        </div>
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No visitor sessions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">Visitor Sessions</h3>
          </div>
          <span className="text-sm text-gray-500">{visits.length} sessions</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Session
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Landing Page
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedVisits.map((visit) => (
              <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-900">
                    {visit.session_id.substring(0, 8)}...
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(visit)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {visit.device || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {visit.browser} · {visit.os}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">{visit.city || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{visit.country}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {visit.utm_source || visit.utm_campaign ? (
                    <div>
                      <p className="text-sm text-gray-900">{visit.utm_source || 'Direct'}</p>
                      {visit.utm_campaign && (
                        <p className="text-xs text-gray-500">{visit.utm_campaign}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Direct</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-900 truncate max-w-xs">
                    {visit.landing_page || '/'}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(visit.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More Button */}
      {hasMore && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {showAll ? (
              <>
                Show Less
                <ChevronDown className="w-4 h-4 rotate-180" />
              </>
            ) : (
              <>
                Show More ({visits.length - INITIAL_ROWS} more sessions)
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
