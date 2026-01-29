/**
 * PageViewsTable Component
 * Displays detailed page view information with viewer details
 * Shows session_id, URL, time on page, scroll depth, and engagement metrics
 */

import React, { useState } from 'react';
import { Eye, Clock, MousePointer, ChevronDown } from 'lucide-react';

export interface PageViewRow {
  id: string;
  session_id: string;
  url: string;
  path: string | null;
  title: string | null;
  referrer: string | null;
  scroll_depth: number;
  time_on_page: number;
  engaged: boolean;
  bounce: boolean;
  exit: boolean;
  created_at: string;
}

interface PageViewsTableProps {
  pageViews: PageViewRow[];
  loading?: boolean;
}

export const PageViewsTable: React.FC<PageViewsTableProps> = ({ pageViews, loading }) => {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_ROWS = 10;
  const displayedPageViews = showAll ? pageViews : pageViews.slice(0, INITIAL_ROWS);
  const hasMore = pageViews.length > INITIAL_ROWS;

  const formatTimeOnPage = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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
          <Eye className="w-5 h-5 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">Page Views</h3>
        </div>
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" />
          <p className="text-gray-600 mt-2">Loading page views...</p>
        </div>
      </div>
    );
  }

  if (pageViews.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">Page Views</h3>
        </div>
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No page views found</p>
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
            <Eye className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">Page Views</h3>
          </div>
          <span className="text-sm text-gray-500">{pageViews.length} views</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Session ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time on Page
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scroll Depth
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedPageViews.map((view) => (
              <tr key={view.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-900">
                    {view.session_id.substring(0, 8)}...
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {view.title || view.path || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{view.path}</p>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {formatTimeOnPage(view.time_on_page)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <MousePointer className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{view.scroll_depth}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-1">
                    {view.engaged && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Engaged
                      </span>
                    )}
                    {view.bounce && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Bounce
                      </span>
                    )}
                    {view.exit && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Exit
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(view.created_at)}
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
                Show More ({pageViews.length - INITIAL_ROWS} more views)
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
