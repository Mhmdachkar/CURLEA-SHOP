/**
 * Service Worker Registration
 * Registers the service worker for offline support
 */

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      console.log('🔧 Registering Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification();
            }
          });
        }
      });
      
      // Handle service worker messages - force reload on cache update
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('📦 Cache updated:', event.data.message);
          // Force hard reload to get latest version
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      });
      
      // Check for updates every 60 seconds
      setInterval(() => {
        registration.update();
      }, 60000);
      
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('⚠️ Service Worker not supported in this browser');
    return null;
  }
};

// Auto-reload when a new version is installed to avoid stale pages
const showUpdateNotification = () => {
  try {
    console.log('🔄 New version detected! Reloading page...');
    // Force hard reload bypassing all caches
    if ('caches' in window) {
      // Clear all caches before reload
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.startsWith('curlea-')) {
            caches.delete(name);
          }
        });
      }).finally(() => {
        // Hard reload
        window.location.reload();
      });
    } else {
      // Fallback: simple reload
      window.location.reload();
    }
  } catch (_) {
    // Fallback navigation
    window.location.href = window.location.href;
  }
};

// Unregister service worker (for development)
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      console.log('🗑️ Service Worker unregistered');
    } catch (error) {
      console.error('❌ Failed to unregister Service Worker:', error);
    }
  }
};

// Check if service worker is supported
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

// Get service worker status
export const getServiceWorkerStatus = async () => {
  if (!isServiceWorkerSupported()) {
    return { supported: false, status: 'not-supported' };
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return { supported: true, status: 'not-registered' };
    }
    
    if (registration.active) {
      return { supported: true, status: 'active', registration };
    }
    
    if (registration.installing) {
      return { supported: true, status: 'installing', registration };
    }
    
    if (registration.waiting) {
      return { supported: true, status: 'waiting', registration };
    }
    
    return { supported: true, status: 'unknown', registration };
  } catch (error) {
    console.error('❌ Failed to get Service Worker status:', error);
    return { supported: true, status: 'error', error };
  }
};
