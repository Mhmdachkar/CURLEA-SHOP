/**
 * useShopifyHomeDashboard Hook
 * 
 * Custom hook for fetching and managing Shopify Home Dashboard data
 */

import { useState, useEffect } from 'react';
import { fetchShopifyHomeDashboardData } from '@/services/shopifyHomeDashboardService';
import type { DashboardData } from '@/data/shopifyHomeDashboardData';

export function useShopifyHomeDashboard(days: number = 30) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const dashboardData = await fetchShopifyHomeDashboardData(days);
        
        if (isMounted) {
          setData(dashboardData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load dashboard data'));
          console.error('Error loading dashboard data:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    // Auto-refresh every 30 seconds for live data updates
    // Live visitors need more frequent updates
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [days]);

  return { data, loading, error };
}

