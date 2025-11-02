/**
 * React Hook for Supabase Analytics
 * Easy access to analytics data
 */

import { useState, useEffect } from 'react';
import {
  getDailyOverview,
  getSalesOverview,
  getTopProductsByRevenue,
  getTrafficSources,
  getConversionFunnelRealtime,
  getAbandonedCarts,
} from '@/utils/supabase';

export function useDailyOverview(days: number = 30) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getDailyOverview(days);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}

export function useSalesOverview(days: number = 30) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getSalesOverview(days);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}

export function useTopProducts(limit: number = 10) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getTopProductsByRevenue(limit);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}

export function useTrafficSources() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getTrafficSources();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}

export function useConversionFunnel() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getConversionFunnelRealtime();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}

export function useAbandonedCarts(days: number = 7) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getAbandonedCarts(days);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}

