/**
 * Supabase Campaigns Table Utilities
 * Manage marketing campaigns and track performance
 */

import { supabase, Campaign } from '@/lib/supabase';

/**
 * Get all active campaigns
 */
export async function getActiveCampaigns(): Promise<{
  data: Campaign[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get all campaigns (including inactive)
 */
export async function getAllCampaigns(): Promise<{
  data: Campaign[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get campaign by UTM campaign code
 */
export async function getCampaignByUtm(utmCampaign: string): Promise<{
  data: Campaign | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('utm_campaign', utmCampaign)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get campaign performance (requires view access)
 */
export async function getCampaignPerformance(): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('campaign_performance')
      .select('*')
      .order('revenue', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Check if current session has UTM campaign and return campaign info
 */
export async function getCurrentCampaign(): Promise<Campaign | null> {
  // Extract UTM parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmCampaign = urlParams.get('utm_campaign');

  if (!utmCampaign) {
    return null;
  }

  const result = await getCampaignByUtm(utmCampaign);
  return result.data || null;
}

