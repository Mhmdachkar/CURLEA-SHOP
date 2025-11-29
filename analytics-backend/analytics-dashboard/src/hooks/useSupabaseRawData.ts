/**
 * React Hooks for Raw Supabase Table Data
 * Direct access to all tables without aggregation
 */

import { useState, useEffect } from 'react';
import {
  getRecentVisits,
  getPageViews,
  getEventsByCategory,
  getAllEvents,
  getCartEventsBySession,
  getAbandonedCarts,
  getOrders,
} from '@/utils/supabase/analytics';
import { getStripeOrders, getOrderItems } from '@/utils/supabase/orders';
import { getSupabaseProducts } from '@/utils/supabase/products';

export function useRecentVisits(days: number = 7) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getRecentVisits(days);
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

export function useRecentPageViews(days: number = 7) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      const result = await getPageViews(startDate, endDate);
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

export function useRecentEvents(category?: string, days: number = 7) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [category, days]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Use getAllEvents if no category specified, otherwise use getEventsByCategory
      const result = category && category !== 'all'
        ? await getEventsByCategory(category, 100)
        : await getAllEvents(days, 100);

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

export function useAllCartEvents(days: number = 7) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { getAllCartEvents } = await import('@/utils/supabase/analytics');
      const result = await getAllCartEvents(days, 100);
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

export function useStripeOrders(limit: number = 50) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getStripeOrders(limit);
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

export function useAnalyticsOrders(days: number = 30) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      const result = await getOrders(startDate, endDate);
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

export function useOrderItems(orderId: string | null) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadData();
    } else {
      setData(null);
      setLoading(false);
    }
  }, [orderId]);

  const loadData = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const result = await getOrderItems(orderId);
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

export function useSupabaseProducts() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getSupabaseProducts();
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
