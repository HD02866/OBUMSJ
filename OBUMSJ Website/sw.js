// OBUMSJ Service Worker - Safe Static Asset Caching & Offline App Shell
const CACHE_NAME = 'obumsj-static-v1';

// Public static assets to cache for offline availability
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './donate.html',
  './About-Us.html',
  './style.css',
  './css/design-system.css',
  './Script.js',
  './js/theme-engine.js',
  './js/language-system.js',
  './js/en.json',
  './js/am.json',
  './js/om.json',
  './js/ar.json',
  './manifest.webmanifest',
  './IMAGE/OBUMSJ Logo.jpg',
  './IMAGE/icon-192.png',
  './IMAGE/icon-512.png',
  './IMAGE/decorative/lantern.svg',
  './IMAGE/Commercial Bank of Ethiopia.png',
  './IMAGE/Cooperative Bank of Oromia.png',
  './IMAGE/E-birr.png'
];

// Patterns that MUST NEVER be cached for security & privacy
const EXCLUDE_URL_PATTERNS = [
  /\/admin/i,
  /\/dashboard/i,
  /\/member/i,
  /\/female/i,
  /firestore\.googleapis\.com/i,
  /identitytoolkit\.googleapis\.com/i,
  /firebase/i,
  /auth/i,
  /token/i
];

// Install Event - Pre-cache essential static app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[OBUMSJ ServiceWorker] Pre-caching static app shell');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[OBUMSJ ServiceWorker] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up obsolete caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[OBUMSJ ServiceWorker] Removing obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Safe caching strategy
self.addEventListener('fetch', event => {
  const req = event.request;

  // STRICT RULE: Only intercept safe GET requests
  if (req.method !== 'GET') {
    return;
  }

  const url = new URL(req.url);

  // STRICT RULE: Never cache private, administrative, auth, or Firebase endpoints
  for (const pattern of EXCLUDE_URL_PATTERNS) {
    if (pattern.test(url.pathname) || pattern.test(url.hostname)) {
      return;
    }
  }

  // Handle HTML document navigation with Network-first strategy + Offline Fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(req).then(cached => {
            return cached || caches.match('./offline.html');
          });
        })
    );
    return;
  }

  // Handle static assets (CSS, JS, Images, Fonts) with Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then(cachedResponse => {
      const fetchPromise = fetch(req).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      }).catch(err => {
        // Network failed, return cached response if present
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
