/**
 * Analytics Initialization Script
 * This file initializes the analytics SDK with environment variables
 */

// Wait for analytics SDK to be loaded
(function initAnalytics() {
  if (typeof analytics === 'undefined') {
    console.warn('[Analytics Init] SDK not loaded yet, retrying...');
    setTimeout(initAnalytics, 100);
    return;
  }

  // Get endpoint from window config or use default
  const endpoint = window.__ANALYTICS_CONFIG__?.endpoint || '/.netlify/functions/track';
  const debug = window.__ANALYTICS_CONFIG__?.debug === true;

  analytics.init({
    endpoint: endpoint,
    debug: debug
  });
})();

