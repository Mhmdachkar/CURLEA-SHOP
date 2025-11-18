/**
 * React Hook for Conversion Funnel Historical Data
 * Access to conversion_funnel table for historical analysis
 */

import { useState, useEffect } from 'react';
import { getConversionFunnel } from '@/utils/supabase/analytics';

export function useConversionFunnelHistory(days: number = 30) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      const result = await getConversionFunnel(startDate, endDate);
      
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

