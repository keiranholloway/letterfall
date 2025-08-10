// Service Worker for LetterFall PWA
const CACHE_NAME = 'letterfall-v1';
const STATIC_CACHE_NAME = 'letterfall-static-v1';

const STATIC_ASSETS = [
  '/letterfall/',
  '/letterfall/index.html',
  '/letterfall/src/assets/words.txt',
  '/letterfall/icons/icon-192x192.svg',
  '/letterfall/icons/icon-512x512.svg',
  '/letterfall/manifest.webmanifest'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS.filter(url => {
        // Only cache files that exist
        return fetch(url, { method: 'HEAD' })
          .then(() => true)
          .catch(() => false);
      }));
    }).catch(() => {
      // If caching fails, still install
      console.warn('Some assets failed to cache during install');
    })
  );
  // Take control immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }
      
      // Clone the request
      const fetchRequest = request.clone();
      
      return fetch(fetchRequest).then(response => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache the response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    }).catch(() => {
      // Return offline fallback for HTML requests
      if (request.destination === 'document') {
        return caches.match('/letterfall/index.html');
      }
    })
  );
});

// Background sync for future features
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Placeholder for background sync functionality
  return Promise.resolve();
}

// Push notifications (optional future feature)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New LetterFall challenge available!',
    icon: '/letterfall/icons/icon-192x192.svg',
    badge: '/letterfall/icons/icon-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('LetterFall', options)
  );
});