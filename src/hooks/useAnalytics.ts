/**
 * useAnalytics Hook
 * 
 * Custom hook for managing analytics data fetching, date range, and auto-refresh
 * 
 * USAGE:
 * const { data, loading, error, refetch, setDateRange, setCompareEnabled } = useAnalytics({
 *   dateRange: 'last_30_days',
 *   compareEnabled: true,
 *   autoRefresh: true,
 *   refreshInterval: 60000, // 60 seconds
 * });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnalyticsData, UseAnalyticsOptions, UseAnalyticsReturn } from '@/types/analytics';
import { mockAnalyticsData } from '@/data/mockData';

/**
 * Fetch analytics data from backend
 * 
 * REPLACE THIS FUNCTION with your actual API endpoint:
 * 
 * Example:
 * const response = await fetch('/api/analytics', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ dateRange, compareEnabled }),
 * });
 * return await response.json();
 */
async function fetchAnalyticsData(
  dateRange: string,
  compareEnabled: boolean
): Promise<AnalyticsData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${process.env.VITE_API_URL}/analytics`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${getAuthToken()}`,
  //   },
  //   body: JSON.stringify({
  //     date_range: dateRange,
  //     compare_enabled: compareEnabled,
  //   }),
  // });
  // 
  // if (!response.ok) {
  //   throw new Error(`Analytics API error: ${response.status}`);
  // }
  // 
  // return await response.json();
  
  // Return mock data for now
  return {
    ...mockAnalyticsData,
    date_range: {
      ...mockAnalyticsData.date_range,
      label: dateRange.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    },
  } as AnalyticsData;
}

export function useAnalytics(options: UseAnalyticsOptions): UseAnalyticsReturn {
  const {
    dateRange: initialDateRange = 'last_30_days',
    compareEnabled: initialCompareEnabled = true,
    autoRefresh = false,
    refreshInterval = 60000, // 60 seconds default
  } = options;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [dateRange, setDateRange] = useState<string>(initialDateRange);
  const [compareEnabled, setCompareEnabled] = useState<boolean>(initialCompareEnabled);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch data from API
   */
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const analyticsData = await fetchAnalyticsData(dateRange, compareEnabled);
      setData(analyticsData);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [dateRange, compareEnabled]);

  /**
   * Initial fetch and refetch on dependency changes
   */
  useEffect(() => {
    refetch();
  }, [refetch]);

  /**
   * Auto-refresh logic
   */
  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval
    refreshIntervalRef.current = setInterval(() => {
      console.log('[useAnalytics] Auto-refreshing analytics data...');
      refetch();
    }, refreshInterval);

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    setDateRange,
    setCompareEnabled,
  };
}

/**
 * Helper hook for manual refresh trigger
 * Useful for the refresh button in the UI
 */
export function useManualRefresh(refetch: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      // Keep spinner visible for at least 500ms for visual feedback
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refetch, isRefreshing]);

  return { isRefreshing, handleRefresh };
}


