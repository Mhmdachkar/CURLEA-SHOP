/**
 * Visitor Statistics Utilities
 * Direct queries to visits table for accurate visitor counts
 */

import { supabase } from '@/lib/supabase';

/**
 * Get total unique visitors for a date range
 * Directly from visits table
 */
export async function getTotalUniqueVisitors(days: number = 30): Promise<{
  data: number | null;
  error: string | null;
}> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    // Direct count from visits table
    const { count, error } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate);

    if (error) {
      return { data: null, error: error.message };
    }

    // Get distinct count
    const { data: distinctData, error: distinctError } = await supabase
      .from('visits')
      .select('session_id')
      .gte('created_at', startDate);

    if (distinctError) {
      return { data: null, error: distinctError.message };
    }

    // Count unique session_ids
    const uniqueSessions = new Set(distinctData?.map((v) => v.session_id) || []);
    const uniqueCount = uniqueSessions.size;

    return { data: uniqueCount, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get total visits (all records) for a date range
 * Directly from visits table
 */
export async function getTotalVisits(days: number = 30): Promise<{
  data: number | null;
  error: string | null;
}> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { count, error } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: count || 0, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get visitor stats aggregated from visits table
 */
export async function getVisitorStats(days: number = 30): Promise<{
  data: {
    unique_visitors: number;
    total_visits: number;
    mobile_visitors: number;
    desktop_visitors: number;
    tablet_visitors: number;
  } | null;
  error: string | null;
}> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    // Get all visits in date range
    const { data: visits, error } = await supabase
      .from('visits')
      .select('session_id, is_mobile, is_desktop, is_tablet')
      .gte('created_at', startDate);

    if (error) {
      return { data: null, error: error.message };
    }

    if (!visits || visits.length === 0) {
      return {
        data: {
          unique_visitors: 0,
          total_visits: 0,
          mobile_visitors: 0,
          desktop_visitors: 0,
          tablet_visitors: 0,
        },
        error: null,
      };
    }

    // Calculate statistics
    const uniqueSessions = new Set(visits.map((v) => v.session_id));
    const uniqueVisitors = uniqueSessions.size;
    const totalVisits = visits.length;

    // Count device types
    const mobileSessions = new Set(
      visits.filter((v) => v.is_mobile).map((v) => v.session_id)
    );
    const desktopSessions = new Set(
      visits.filter((v) => v.is_desktop).map((v) => v.session_id)
    );
    const tabletSessions = new Set(
      visits.filter((v) => v.is_tablet).map((v) => v.session_id)
    );

    return {
      data: {
        unique_visitors: uniqueVisitors,
        total_visits: totalVisits,
        mobile_visitors: mobileSessions.size,
        desktop_visitors: desktopSessions.size,
        tablet_visitors: tabletSessions.size,
      },
      error: null,
    };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

