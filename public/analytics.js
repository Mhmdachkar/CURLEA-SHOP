/**
 * CURLEA LUXE Analytics SDK
 * Lightweight JavaScript tracking library for Shopify-style analytics
 * Version: 1.0.0
 * License: MIT
 */

(function (window) {
    'use strict';
  
    // Configuration
    const CONFIG = {
      apiEndpoint: null, // Will be set during init
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxRetries: 3,
      retryDelay: 1000,
      batchSize: 10,
      batchInterval: 5000, // 5 seconds
      enableDebug: false,
    };
  
    // State
    let sessionId = null;
    let visitId = null;
    let pageStartTime = Date.now();
    let maxScrollDepth = 0;
    let eventQueue = [];
    let batchTimer = null;
    let isInitialized = false;
  
    /**
     * Utility Functions
     */
    const utils = {
      // Generate UUID v4
      uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      },
  
      // Get or create session ID
      getSessionId() {
        if (sessionId) return sessionId;
  
        const stored = this.getStorage('curlea_session_id');
        const timestamp = this.getStorage('curlea_session_timestamp');
        const now = Date.now();
  
        // Check if session is still valid
        if (stored && timestamp && now - parseInt(timestamp) < CONFIG.sessionTimeout) {
          sessionId = stored;
          this.setStorage('curlea_session_timestamp', now.toString());
        } else {
          sessionId = this.uuid();
          this.setStorage('curlea_session_id', sessionId);
          this.setStorage('curlea_session_timestamp', now.toString());
        }
  
        return sessionId;
      },
  
      // Local storage helpers
      getStorage(key) {
        try {
          return window.localStorage.getItem(key);
        } catch (e) {
          console.warn('LocalStorage not available:', e);
          return null;
        }
      },
  
      setStorage(key, value) {
        try {
          window.localStorage.setItem(key, value);
        } catch (e) {
          console.warn('LocalStorage not available:', e);
        }
      },
  
      // Get device type
      getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
          return { type: 'Tablet', isMobile: false, isTablet: true, isDesktop: false };
        }
        if (
          /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
            ua
          )
        ) {
          return { type: 'Mobile', isMobile: true, isTablet: false, isDesktop: false };
        }
        return { type: 'Desktop', isMobile: false, isTablet: false, isDesktop: true };
      },
  
      // Get browser name
      getBrowser() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
  
        if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (ua.indexOf('SamsungBrowser') > -1) browser = 'Samsung Internet';
        else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
        else if (ua.indexOf('Trident') > -1) browser = 'IE';
        else if (ua.indexOf('Edge') > -1) browser = 'Edge';
        else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  
        return browser;
      },
  
      // Get OS
      getOS() {
        const ua = navigator.userAgent;
        if (ua.indexOf('Win') > -1) return 'Windows';
        if (ua.indexOf('Mac') > -1) return 'MacOS';
        if (ua.indexOf('Linux') > -1) return 'Linux';
        if (ua.indexOf('Android') > -1) return 'Android';
        if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1)
          return 'iOS';
        return 'Unknown';
      },
  
      // Parse UTM parameters from URL
      getUtmParams() {
        const params = new URLSearchParams(window.location.search);
        return {
          utm_source: params.get('utm_source') || null,
          utm_medium: params.get('utm_medium') || null,
          utm_campaign: params.get('utm_campaign') || null,
          utm_term: params.get('utm_term') || null,
          utm_content: params.get('utm_content') || null,
        };
      },
  
      // Get scroll depth percentage
      getScrollDepth() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = Math.min(
          100,
          Math.round((scrollTop / (documentHeight - windowHeight)) * 100)
        );
        return isNaN(scrollPercent) ? 0 : scrollPercent;
      },
  
      // Debug logger
      log(...args) {
        if (CONFIG.enableDebug) {
          console.log('[Curlea Analytics]', ...args);
        }
      },
  
      // Error logger
      error(...args) {
        console.error('[Curlea Analytics]', ...args);
      },
    };
  
    /**
     * Network Functions
     */
    const network = {
      // Queue event for batch sending
      queueEvent(data) {
        eventQueue.push(data);
        utils.log('Event queued:', data);
  
        // Send immediately if batch size reached
        if (eventQueue.length >= CONFIG.batchSize) {
          this.flushQueue();
        } else if (!batchTimer) {
          // Schedule batch send
          batchTimer = setTimeout(() => {
            this.flushQueue();
          }, CONFIG.batchInterval);
        }
      },
  
      // Send queued events
      async flushQueue() {
        if (eventQueue.length === 0) return;
  
        const eventsToSend = [...eventQueue];
        eventQueue = [];
  
        if (batchTimer) {
          clearTimeout(batchTimer);
          batchTimer = null;
        }
  
        utils.log('Flushing queue:', eventsToSend.length, 'events');
  
        for (const event of eventsToSend) {
          await this.sendEvent(event);
        }
      },
  
      // Send single event with retry logic
      async sendEvent(data, retryCount = 0) {
        if (!CONFIG.apiEndpoint) {
          utils.error('API endpoint not configured');
          return;
        }
  
        try {
          const response = await fetch(CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            keepalive: true, // Important for events sent during page unload
          });
  
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
  
          const result = await response.json();
          utils.log('Event sent successfully:', data.type, result);
          return result;
        } catch (error) {
          utils.error('Failed to send event:', error);
  
          // Retry logic
          if (retryCount < CONFIG.maxRetries) {
            utils.log(`Retrying... (${retryCount + 1}/${CONFIG.maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, CONFIG.retryDelay * (retryCount + 1)));
            return this.sendEvent(data, retryCount + 1);
          } else {
            utils.error('Max retries reached. Event lost:', data);
          }
        }
      },
  
      // Get user's IP and location using ipapi.co (free, no key required)
      async getLocationData() {
        try {
          const response = await fetch('https://ipapi.co/json/', {
            timeout: 3000,
          });
          if (response.ok) {
            const data = await response.json();
            return {
              ip: data.ip,
              country: data.country_name,
              city: data.city,
              region: data.region,
              timezone: data.timezone,
            };
          }
        } catch (error) {
          utils.log('Failed to get location data:', error);
        }
        return {};
      },
    };
  
    /**
     * Tracking Functions
     */
    const tracker = {
      // Track visit (first page load in session)
      async trackVisit() {
        const device = utils.getDeviceType();
        const utm = utils.getUtmParams();
        const locationData = await network.getLocationData();
  
        const data = {
          type: 'visit',
          data: {
            session_id: utils.getSessionId(),
            ip_address: locationData.ip || null,
            device: device.type,
            browser: utils.getBrowser(),
            os: utils.getOS(),
            country: locationData.country || null,
            city: locationData.city || null,
            region: locationData.region || null,
            referrer: document.referrer || null,
            landing_page: window.location.href,
            ...utm,
            is_mobile: device.isMobile,
            is_tablet: device.isTablet,
            is_desktop: device.isDesktop,
            screen_width: window.screen.width,
            screen_height: window.screen.height,
            language: navigator.language,
            timezone: locationData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };
  
        const result = await network.sendEvent(data);
        if (result && result.visit_id) {
          visitId = result.visit_id;
          utils.setStorage('curlea_visit_id', visitId);
        }
  
        utils.log('Visit tracked:', data);
      },
  
      // Track page view
      trackPageView(scroll_depth = 0, time_on_page = 0) {
        const data = {
          type: 'page_view',
          data: {
            session_id: utils.getSessionId(),
            visit_id: visitId || utils.getStorage('curlea_visit_id'),
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer || null,
            scroll_depth: scroll_depth,
            time_on_page: time_on_page,
          },
        };
  
        network.queueEvent(data);
        utils.log('Page view tracked:', data);
      },
  
      // Track custom event
      trackEvent(eventName, eventData = {}) {
        const data = {
          type: 'event',
          data: {
            session_id: utils.getSessionId(),
            visit_id: visitId || utils.getStorage('curlea_visit_id'),
            event_name: eventName,
            event_category: eventData.category || null,
            event_label: eventData.label || null,
            event_value: eventData.value || null,
            payload: eventData,
          },
        };
  
        network.queueEvent(data);
        utils.log('Custom event tracked:', eventName, eventData);
      },
  
      // Track cart event
      trackCartEvent(eventType, productData) {
        const data = {
          type: 'cart_event',
          data: {
            session_id: utils.getSessionId(),
            visit_id: visitId || utils.getStorage('curlea_visit_id'),
            event_type: eventType, // 'add', 'remove', 'update', 'checkout_start', 'checkout_complete'
            external_product_id: productData.product_id,
            product_title: productData.title,
            variant_id: productData.variant_id || null,
            variant_title: productData.variant_title || null,
            quantity: productData.quantity || 1,
            price: productData.price,
            total_value: productData.total_value || productData.price * (productData.quantity || 1),
            cart_total: productData.cart_total || null,
            discount_code: productData.discount_code || null,
            discount_amount: productData.discount_amount || null,
          },
        };
  
        network.queueEvent(data);
        utils.log('Cart event tracked:', eventType, productData);
      },
  
      // Track order/purchase
      trackOrder(orderData) {
        const utm = utils.getUtmParams();
  
        const data = {
          type: 'order',
          data: {
            order_id: orderData.order_id,
            session_id: utils.getSessionId(),
            visit_id: visitId || utils.getStorage('curlea_visit_id'),
            customer_email: orderData.customer_email || null,
            customer_id: orderData.customer_id || null,
            subtotal: orderData.subtotal,
            discount_total: orderData.discount_total || 0,
            shipping_total: orderData.shipping_total || 0,
            tax_total: orderData.tax_total || 0,
            total_value: orderData.total_value,
            total_cost: orderData.total_cost || null,
            currency: orderData.currency || 'USD',
            payment_method: orderData.payment_method || null,
            shipping_method: orderData.shipping_method || null,
            source: orderData.source || this.determineSource(),
            ...utm,
            discount_codes: orderData.discount_codes || null,
            items: orderData.items || null,
            status: orderData.status || 'completed',
          },
        };
  
        // Send immediately (don't queue)
        network.sendEvent(data);
        utils.log('Order tracked:', orderData);
      },
  
      // Determine traffic source
      determineSource() {
        const utm = utils.getUtmParams();
        if (utm.utm_source) return utm.utm_source;
        
        const referrer = document.referrer;
        if (!referrer) return 'direct';
        
        if (referrer.includes('google.com')) return 'google';
        if (referrer.includes('facebook.com')) return 'facebook';
        if (referrer.includes('instagram.com')) return 'instagram';
        if (referrer.includes('twitter.com') || referrer.includes('t.co')) return 'twitter';
        if (referrer.includes('pinterest.com')) return 'pinterest';
        if (referrer.includes('tiktok.com')) return 'tiktok';
        
        return 'referral';
      },
    };
  
    /**
     * Event Listeners
     */
    const listeners = {
      // Setup all listeners
      init() {
        // Track scroll depth
        let scrollTimeout;
        window.addEventListener(
          'scroll',
          () => {
            const currentDepth = utils.getScrollDepth();
            if (currentDepth > maxScrollDepth) {
              maxScrollDepth = currentDepth;
            }
  
            // Debounce scroll tracking
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
              utils.log('Max scroll depth:', maxScrollDepth);
            }, 500);
          },
          { passive: true }
        );
  
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
            tracker.trackPageView(maxScrollDepth, timeOnPage);
            network.flushQueue();
          }
        });
  
        // Track page before unload
        window.addEventListener('beforeunload', () => {
          const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
          tracker.trackPageView(maxScrollDepth, timeOnPage);
          network.flushQueue();
        });
  
        // Track clicks on links (for page transitions)
        document.addEventListener('click', (e) => {
          const link = e.target.closest('a');
          if (link && link.href) {
            const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
            tracker.trackPageView(maxScrollDepth, timeOnPage);
          }
        });
  
        utils.log('Event listeners initialized');
      },
    };
  
    /**
     * Public API
     */
    const Analytics = {
      /**
       * Initialize the analytics SDK
       * @param {Object} config Configuration options
       * @param {string} config.endpoint - API endpoint URL
       * @param {boolean} config.debug - Enable debug logging
       */
      init(config = {}) {
        if (isInitialized) {
          utils.error('Analytics already initialized');
          return;
        }
  
        // Set configuration
        CONFIG.apiEndpoint = config.endpoint || CONFIG.apiEndpoint;
        CONFIG.enableDebug = config.debug || false;
  
        if (!CONFIG.apiEndpoint) {
          utils.error('API endpoint is required. Call analytics.init({ endpoint: "YOUR_ENDPOINT" })');
          return;
        }
  
        utils.log('Initializing analytics SDK...');
        utils.log('Endpoint:', CONFIG.apiEndpoint);
        utils.log('Session ID:', utils.getSessionId());
  
        // Track initial visit
        const isNewVisit = !utils.getStorage('curlea_visit_id');
        if (isNewVisit) {
          tracker.trackVisit();
        } else {
          visitId = utils.getStorage('curlea_visit_id');
        }
  
        // Track initial page view
        tracker.trackPageView();
  
        // Setup event listeners
        listeners.init();
  
        isInitialized = true;
        utils.log('Analytics SDK initialized successfully');
      },
  
      /**
       * Track a custom event
       * @param {string} eventName - Name of the event
       * @param {Object} eventData - Additional event data
       */
      track(eventName, eventData = {}) {
        if (!isInitialized) {
          utils.error('Analytics not initialized. Call analytics.init() first.');
          return;
        }
        tracker.trackEvent(eventName, eventData);
      },
  
      /**
       * Track a cart event
       * @param {string} eventType - 'add', 'remove', 'update', 'checkout_start', 'checkout_complete'
       * @param {Object} productData - Product information
       */
      trackCart(eventType, productData) {
        if (!isInitialized) {
          utils.error('Analytics not initialized. Call analytics.init() first.');
          return;
        }
        tracker.trackCartEvent(eventType, productData);
      },
  
      /**
       * Track a purchase/order
       * @param {Object} orderData - Order information
       */
      trackPurchase(orderData) {
        if (!isInitialized) {
          utils.error('Analytics not initialized. Call analytics.init() first.');
          return;
        }
        tracker.trackOrder(orderData);
      },
  
      /**
       * Get current session ID
       * @returns {string} Current session ID
       */
      getSessionId() {
        return utils.getSessionId();
      },
  
      /**
       * Manually flush event queue
       */
      flush() {
        network.flushQueue();
      },
  
      /**
       * Reset session (useful for testing)
       */
      reset() {
        sessionId = null;
        visitId = null;
        utils.setStorage('curlea_session_id', '');
        utils.setStorage('curlea_visit_id', '');
        utils.setStorage('curlea_session_timestamp', '');
        utils.log('Session reset');
      },
  
      /**
       * Get SDK version
       */
      version: '1.0.0',
    };
  
    // Expose to window
    window.analytics = Analytics;
  
    utils.log('Curlea Analytics SDK loaded');
  })(window);
  
  