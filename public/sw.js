/**
 * Service Worker for Curlea Luxe Animation
 * Provides offline support and performance optimization
 */

// IMPORTANT: Increment version on every deployment to force cache refresh
const CACHE_VERSION = Date.now(); // Always use timestamp for fresh cache
const CACHE_NAME = `curlea-luxe-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `curlea-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `curlea-dynamic-v${CACHE_VERSION}`;

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/shop',
  '/collection',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add critical images
  '/src/assets/hero-luxury-1.jpg',
  '/src/assets/hero-luxury-2.jpg',
  '/src/assets/hero-luxury-3.jpg',
  // Add critical product images
  '/src/assets/dreamcurl-original.webp',
  '/src/assets/dreamcurl-midi.webp',
  '/src/assets/dreamcurl-short.webp'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete ALL old caches to force fresh content
            if (cacheName.startsWith('curlea-') && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete - all old caches cleared');
        // Force all tabs to reload with new content
        return self.clients.claim().then(() => {
          return self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'CACHE_UPDATED',
                message: 'New version available! Reloading...'
              });
            });
          });
        });
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

// Handle different types of requests
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 0: Network Only for video files (support partial responses/streaming)
    if (isVideoRequest(request)) {
      console.log('🎥 Service Worker: Video request - using network only', request.url);
      return await fetch(request);
    }
    
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(request)) {
      return await cacheFirstStrategy(request);
    }
    
    // Strategy 2: Network First for API calls
    if (isApiRequest(request)) {
      return await networkFirstStrategy(request);
    }
    
    // Strategy 3: Stale While Revalidate for HTML pages
    if (isHtmlRequest(request)) {
      return await staleWhileRevalidateStrategy(request);
    }
    
    // Strategy 4: Cache First for images
    if (isImageRequest(request)) {
      return await cacheFirstStrategy(request);
    }
    
    // Default: Network First
    return await networkFirstStrategy(request);
    
  } catch (error) {
    console.error('❌ Service Worker: Request failed', error);
    
    // Return offline fallback
    if (isHtmlRequest(request)) {
      return await getOfflinePage();
    }
    
    throw error;
  }
}

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('📦 Service Worker: Serving from cache', request.url);
    return cachedResponse;
  }
  
  console.log('🌐 Service Worker: Fetching from network', request.url);
  const networkResponse = await fetch(request);
  
  // Only cache full responses (status 200), not partial responses (status 206)
  // Partial responses are used for video streaming and shouldn't be cached
  if (networkResponse.ok && networkResponse.status === 200) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    try {
      cache.put(request, networkResponse.clone());
    } catch (error) {
      console.warn('⚠️ Service Worker: Failed to cache response', request.url, error);
    }
  }
  
  return networkResponse;
}

// Network First Strategy - for API calls
async function networkFirstStrategy(request) {
  try {
    console.log('🌐 Service Worker: Network first', request.url);
    const networkResponse = await fetch(request);
    
    // Only cache full responses (status 200), not partial responses (status 206)
    if (networkResponse.ok && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      try {
        cache.put(request, networkResponse.clone());
      } catch (error) {
        console.warn('⚠️ Service Worker: Failed to cache response', request.url, error);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📦 Service Worker: Network failed, trying cache', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Network First Strategy for HTML pages - ALWAYS get fresh content
async function staleWhileRevalidateStrategy(request) {
  try {
    // ALWAYS try network first for HTML to get latest version
    console.log('🌐 Service Worker: Fetching fresh HTML from network', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the fresh response
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Only fall back to cache if network fails
    console.log('📦 Service Worker: Network failed, using cached HTML', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Helper functions to identify request types
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/static/') || 
         url.pathname.includes('/assets/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css');
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         url.pathname.startsWith('/graphql');
}

function isHtmlRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

function isVideoRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) ||
         request.headers.get('accept')?.includes('video/') ||
         request.headers.get('range'); // Range requests indicate video streaming
}

// Get offline fallback page
async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const offlinePage = await cache.match('/offline.html');
  
  if (offlinePage) {
    return offlinePage;
  }
  
  // Return a simple offline response
  return new Response(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - Curlea Luxe</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: #f5f5f5;
        }
        .offline-container {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
        .retry-btn {
          background: #000;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 20px;
        }
        .retry-btn:hover { background: #333; }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <h1>🔌 You're Offline</h1>
        <p>Don't worry! You can still browse our cached products and add items to your cart.</p>
        <p>When you're back online, your cart will sync automatically.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}

// Background sync for cart updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'cart-sync') {
    console.log('🔄 Service Worker: Syncing cart data');
    event.waitUntil(syncCartData());
  }
});

// Sync cart data when back online
async function syncCartData() {
  try {
    const cartData = await getStoredCartData();
    if (cartData && cartData.length > 0) {
      // Send cart data to server
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartData),
      });
      
      console.log('✅ Service Worker: Cart synced successfully');
    }
  } catch (error) {
    console.error('❌ Service Worker: Cart sync failed', error);
  }
}

// Get stored cart data
async function getStoredCartData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = await cache.match('/cart-data');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('❌ Service Worker: Failed to get cart data', error);
  }
  return null;
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View Product',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-192x192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/shop')
    );
  }
});

console.log('🚀 Service Worker: Loaded successfully');
