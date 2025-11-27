/**
 * Campaign Tracking Utilities
 * Automatically tracks and associates campaigns with all user actions
 */

export interface CampaignData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

/**
 * Extract UTM parameters from current URL
 */
export function extractCampaignParams(): CampaignData {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
  };
}

/**
 * Store campaign data in session storage for persistence
 */
export function storeCampaignData(campaignData: CampaignData): void {
  if (typeof window === 'undefined') return;

  // Only store if we have at least a campaign name
  if (campaignData.utm_campaign) {
    Object.entries(campaignData).forEach(([key, value]) => {
      if (value) {
        sessionStorage.setItem(key, value);
      }
    });
  }
}

/**
 * Retrieve stored campaign data from session storage
 */
export function getStoredCampaignData(): CampaignData {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
    };
  }

  return {
    utm_source: sessionStorage.getItem('utm_source'),
    utm_medium: sessionStorage.getItem('utm_medium'),
    utm_campaign: sessionStorage.getItem('utm_campaign'),
    utm_term: sessionStorage.getItem('utm_term'),
    utm_content: sessionStorage.getItem('utm_content'),
  };
}

/**
 * Get current campaign data (from URL or session storage)
 */
export function getCurrentCampaignData(): CampaignData {
  // First try to get from URL
  const urlParams = extractCampaignParams();
  
  // If campaign in URL, store it
  if (urlParams.utm_campaign) {
    storeCampaignData(urlParams);
    return urlParams;
  }
  
  // Otherwise get from storage
  return getStoredCampaignData();
}

/**
 * Auto-create or update campaign in database when detected
 */
export async function autoRegisterCampaign(campaignData: CampaignData): Promise<void> {
  if (!campaignData.utm_campaign) return;

  try {
    // Lazy import to avoid circular dependency
    const { supabase } = await import('@/lib/supabase');
    
    const { error } = await supabase
      .from('campaigns')
      .upsert(
        {
          name: campaignData.utm_campaign,
          utm_source: campaignData.utm_source,
          utm_medium: campaignData.utm_medium,
          utm_campaign: campaignData.utm_campaign,
          utm_term: campaignData.utm_term,
          utm_content: campaignData.utm_content,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'utm_campaign',
          ignoreDuplicates: false,
        }
      );

    if (error) {
      console.warn('[Campaign Tracking] Failed to register campaign:', error);
    } else {
      console.log('[Campaign Tracking] Campaign registered:', campaignData.utm_campaign);
    }
  } catch (err) {
    console.error('[Campaign Tracking] Error registering campaign:', err);
  }
}

/**
 * Track campaign-specific event
 */
export function trackCampaignEvent(
  eventName: string,
  eventData: Record<string, any> = {}
): void {
  const campaignData = getCurrentCampaignData();
  
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track(eventName, {
      ...eventData,
      ...campaignData,
    });
  }
}

/**
 * Initialize campaign tracking on page load
 */
export function initializeCampaignTracking(): void {
  if (typeof window === 'undefined') return;

  // Extract and store campaign data
  const campaignData = extractCampaignParams();
  
  if (campaignData.utm_campaign) {
    storeCampaignData(campaignData);
    autoRegisterCampaign(campaignData);
    
    // Track campaign landing
    trackCampaignEvent('CampaignLanding', {
      landing_page: window.location.href,
      referrer: document.referrer,
    });

    console.log('[Campaign Tracking] Campaign detected and tracked:', campaignData);
  }
}

/**
 * Get campaign attribution for order
 */
export function getCampaignAttribution(): CampaignData & { source: string } {
  const campaignData = getCurrentCampaignData();
  
  // Determine source
  let source = 'direct';
  if (campaignData.utm_source) {
    source = campaignData.utm_source;
  } else if (typeof document !== 'undefined' && document.referrer) {
    const referrer = document.referrer;
    if (referrer.includes('google')) source = 'google';
    else if (referrer.includes('facebook')) source = 'facebook';
    else if (referrer.includes('instagram')) source = 'instagram';
    else if (referrer.includes('tiktok')) source = 'tiktok';
    else source = 'referral';
  }

  return {
    ...campaignData,
    source,
  };
}

