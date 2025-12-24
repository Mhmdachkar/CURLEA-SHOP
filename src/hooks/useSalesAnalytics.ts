/**
 * Custom Hook for Sales Analytics
 * Manages fetching and state for sales analytics data
 */

import { useState, useEffect } from 'react';
import {
  calculateSalesMetrics,
  fetchTopProducts,
  fetchProductPerformance,
  fetchCustomerAnalytics,
} from '../services/salesAnalyticsService';
import type {
  SalesMetrics,
  TopProduct,
  ProductPerformance,
  CustomerPurchaseAnalytics,
} from '../types/salesAnalytics';

interface UseSalesAnalyticsReturn {
  metrics: SalesMetrics | null;
  topProducts: TopProduct[];
  productPerformance: ProductPerformance[];
  customerAnalytics: CustomerPurchaseAnalytics[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSalesAnalytics(days: number = 30): UseSalesAnalyticsReturn {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerPurchaseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [metricsData, topProductsData, performanceData, customersData] = await Promise.all([
        calculateSalesMetrics(days),
        fetchTopProducts(days, 10, 'revenue'),
        fetchProductPerformance(20),
        fetchCustomerAnalytics(50),
      ]);

      setMetrics(metricsData);
      setTopProducts(topProductsData);
      setProductPerformance(performanceData);
      setCustomerAnalytics(customersData);
    } catch (err) {
      console.error('Error fetching sales analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sales analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  return {
    metrics,
    topProducts,
    productPerformance,
    customerAnalytics,
    loading,
    error,
    refetch: fetchData,
  };
}

