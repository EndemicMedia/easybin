const CACHE_NAME = 'easybin-v1.1.0';
const STATIC_CACHE = 'easybin-static-v1.1';
const DYNAMIC_CACHE = 'easybin-dynamic-v1.1';
const IMAGE_CACHE = 'easybin-images-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/magicui-components.css',
  '/app.js',
  '/translations.js',
  '/binStyles.js',
  '/analytics.js',
  '/error-monitor.js',
  '/security.js',
  '/modern-features.js',
  '/magicui-components.js',
  '/bento-integration.js',
  '/update-app-for-bento.js',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => console.log('Cache install failed:', err))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and browser-specific requests
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.startsWith('moz-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          // For static assets, return cache first
          if (STATIC_ASSETS.some(asset => event.request.url.includes(asset))) {
            return response;
          }
          
          // For dynamic content, update cache in background
          fetch(event.request)
            .then(fetchResponse => {
              if (fetchResponse && fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then(cache => cache.put(event.request, responseClone));
              }
            })
            .catch(() => {}); // Ignore network errors for background updates
          
          return response;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then(fetchResponse => {
            // Don't cache failed requests
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Cache successful responses
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(event.request, responseClone));

            return fetchResponse;
          })
          .catch(err => {
            console.log('Fetch failed for:', event.request.url, err);
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // Return a basic error response for other requests
            return new Response('Offline - content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for failed AI requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-ai-request') {
    event.waitUntil(
      // Retry failed AI requests when connection is restored
      handleBackgroundSync()
    );
  }
});

// Handle background sync
async function handleBackgroundSync() {
  try {
    // Get pending requests from IndexedDB or localStorage
    const pendingRequests = await getPendingRequests();
    
    for (const request of pendingRequests) {
      try {
        // Retry the AI request
        const response = await fetch(request.url, request.options);
        if (response.ok) {
          // Remove from pending requests
          await removePendingRequest(request.id);
        }
      } catch (error) {
        console.log('Background sync retry failed:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Push notification support
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/icon-192.png'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Placeholder functions for IndexedDB operations
async function getPendingRequests() {
  // Implementation would use IndexedDB to store/retrieve pending requests
  return [];
}

async function removePendingRequest(id) {
  // Implementation would remove request from IndexedDB
  return true;
}

async function handleBackgroundSync() {
  // Implementation for retrying failed AI requests
  console.log('Background sync triggered - retrying failed requests');
}
