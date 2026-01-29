/**
 * CartEventsTable Component
 * Displays shopping cart events to track user shopping behavior
 * Shows add to cart, remove, checkout events, and abandoned carts
 */

import React, { useState } from 'react';
import { ShoppingCart, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

export interface CartEventRow {
  id: string;
  session_id: string;
  event_type: string;
  product_title: string | null;
  quantity: number;
  price: number | null;
  cart_total: number | null;
  discount_code: string | null;
  created_at: string;
}

interface CartEventsTableProps {
  cartEvents: CartEventRow[];
  loading?: boolean;
}

export const CartEventsTable: React.FC<CartEventsTableProps> = ({ cartEvents, loading }) => {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_ROWS = 10;
  const displayedCartEvents = showAll ? cartEvents : cartEvents.slice(0, INITIAL_ROWS);
  const hasMore = cartEvents.length > INITIAL_ROWS;

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  const getEventBadge = (eventType: string) => {
    const badges: Record<string, { color: string; label: string; icon: JSX.Element }> = {
      add: {
        color: 'bg-green-100 text-green-800',
        label: 'Added',
        icon: <TrendingUp className="w-3 h-3" />,
      },
      remove: {
        color: 'bg-red-100 text-red-800',
        label: 'Removed',
        icon: <TrendingDown className="w-3 h-3" />,
      },
      checkout_start: {
        color: 'bg-blue-100 text-blue-800',
        label: 'Checkout Started',
        icon: <ShoppingCart className="w-3 h-3" />,
      },
      checkout_complete: {
        color: 'bg-purple-100 text-purple-800',
        label: 'Completed',
        icon: <ShoppingCart className="w-3 h-3" />,
      },
      abandoned: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Abandoned',
        icon: <TrendingDown className="w-3 h-3" />,
      },
      view: {
        color: 'bg-gray-100 text-gray-800',
        label: 'Viewed',
        icon: <ShoppingCart className="w-3 h-3" />,
      },
    };

    const badge = badges[eventType] || badges.view;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">Shopping Cart Events</h3>
        </div>
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" />
          <p className="text-gray-600 mt-2">Loading cart events...</p>
        </div>
      </div>
    );
  }

  if (cartEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">Shopping Cart Events</h3>
        </div>
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No cart events found</p>
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
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">Shopping Cart Events</h3>
          </div>
          <span className="text-sm text-gray-500">{cartEvents.length} events</span>
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
                Event
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cart Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedCartEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-900">
                    {event.session_id.substring(0, 8)}...
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getEventBadge(event.event_type)}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {event.product_title || 'Unknown Product'}
                  </p>
                  {event.discount_code && (
                    <p className="text-xs text-green-600">Code: {event.discount_code}</p>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {event.quantity}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(event.price)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatCurrency(event.cart_total)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(event.created_at)}
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
                Show More ({cartEvents.length - INITIAL_ROWS} more events)
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
