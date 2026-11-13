// OBUMSJ Service Worker - Offline-First App Shell & Safe Updates
// Compliant with Multi-Tier Caching, Clean URLs, and Privacy Preservation

const CACHE_VERSION = 'v1.1.0';
const PRECACHE_NAME = `obumsj-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `obumsj-runtime-${CACHE_VERSION}`;
const CACHE_PREFIX = 'obumsj-';

// Essential static application shell to precache for offline availability
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './About-Us.html',
  './donate.html',
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
  './favicon.ico',
  './IMAGE/OBUMSJ Logo.jpg',
  './IMAGE/icon-192.png',
  './IMAGE/icon-512.png',
  './IMAGE/decorative/lantern.svg',
  './IMAGE/decorative/islamic-day-texture-seamless.jpg',
  './IMAGE/decorative/islamic-night-texture-seamless.jpg',
  './IMAGE/Commercial Bank of Ethiopia.png',
  './IMAGE/Cooperative Bank of Oromia.png',
  './IMAGE/E-birr.png',
  './IMAGE/Best 1.jpg',
  './IMAGE/We are visted.jpg',
  './IMAGE/Abdulmenan.jpg',
  './IMAGE/trial.jpg',
  './IMAGE/Baba kenya 1.jpg'
];

// Patterns that MUST NEVER be cached in shared storage (Security & Auth)
const EXCLUDE_URL_PATTERNS = [
  /\/admin/i,
  /\/dashboard/i,
  /\/member/i,
  /\/female/i,
  /\/login/i,
  /\/signup/i,
  /firestore\.googleapis\.com/i,
  /identitytoolkit\.googleapis\.com/i,
  /securetoken\.googleapis\.com/i,
  /firebasestorage\.googleapis\.com/i,
  /firebase/i,
  /auth/i,
  /token/i
];

// Helper: match request in caches, with clean URL normalization (/About-Us -> /About-Us.html)
async function matchInAnyCache(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const url = new URL(request.url);
    if (!url.pathname.includes('.') && url.pathname !== '/' && url.pathname !== '') {
      const htmlUrl = new URL(url.pathname + '.html', url.origin).href;
      const htmlCached = await caches.match(htmlUrl);
      if (htmlCached) {
        return htmlCached;
      }
    }
  } catch (e) {
    // URL parsing fallback
  }

  return null;
}

// Helper: get offline fallback response
async function getOfflineFallback() {
  const fallback = await caches.match('./offline.html');
  if (fallback) return fallback;
  const rootFallback = await caches.match('/offline.html');
  if (rootFallback) return rootFallback;
  return caches.match('offline.html');
}

// Install Event - Pre-cache essential static app shell (NO automatic skipWaiting)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE_NAME).then(async cache => {
      console.log(`[OBUMSJ ServiceWorker] Pre-caching static app shell (${PRECACHE_NAME})`);
      // Add assets safely; log any specific asset error without aborting others
      await Promise.all(
        PRECACHE_ASSETS.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`[OBUMSJ ServiceWorker] Partial precache warning for ${asset}:`, err);
          });
        })
      );
    })
  );
  // NOTE: skipWaiting() is intentionally NOT called here.
  // The service worker waits for user consent or cold launch.
});

// Message Event - Safe user-triggered update activation
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    console.log('[OBUMSJ ServiceWorker] skipWaiting message received. Activating new worker...');
    self.skipWaiting();
  }
});

// Activate Event - Clean up obsolete caches belonging to OBUMSJ only
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache.startsWith(CACHE_PREFIX) && cache !== PRECACHE_NAME && cache !== RUNTIME_CACHE_NAME) {
            console.log('[OBUMSJ ServiceWorker] Removing obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[OBUMSJ ServiceWorker] Claiming clients for updated version');
      return self.clients.claim();
    })
  );
});

// Fetch Event - Multi-tier safe caching strategy
self.addEventListener('fetch', event => {
  const req = event.request;

  // STRICT RULE: Only intercept safe GET requests
  if (req.method !== 'GET') {
    return;
  }

  const url = new URL(req.url);

  // Check if URL matches sensitive/auth exclusion patterns
  const isExcluded = EXCLUDE_URL_PATTERNS.some(pattern => pattern.test(url.pathname) || pattern.test(url.hostname));

  // TIER 3: Sensitive / Private / Auth operations
  if (isExcluded) {
    if (req.mode === 'navigate') {
      // For excluded page navigations: network-only, but fall back to offline.html if network drops
      event.respondWith(
        fetch(req).catch(async () => {
          const fallback = await getOfflineFallback();
          return fallback || new Response('Offline: network unavailable', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
      );
    }
    // Non-navigation excluded requests (auth tokens, firestore writes) pass through naturally to network
    return;
  }

  // TIER 2A: HTML Document Navigation (Network-First with Cache & Clean URL Fallback)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE_NAME).then(cache => cache.put(req, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await matchInAnyCache(req);
          if (cached) {
            return cached;
          }
          const fallback = await getOfflineFallback();
          return fallback || new Response('Offline: page unavailable', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // TIER 2B: Same-Origin Static Assets & Safe CDNs (Stale-While-Revalidate)
  const isSameOrigin = url.origin === self.location.origin;
  const isAllowedCdn = url.hostname === 'cdnjs.cloudflare.com' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (isSameOrigin || isAllowedCdn) {
    event.respondWith(
      matchInAnyCache(req).then(cachedResponse => {
        const fetchPromise = fetch(req).then(networkResponse => {
          // Accept 200 OK or opaque responses (status 0) from allowed CDNs
          if (networkResponse && (networkResponse.status === 200 || (networkResponse.type === 'opaque' && isAllowedCdn))) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then(cache => {
              cache.put(req, responseToCache);
            }).catch(err => {
              console.warn('[OBUMSJ ServiceWorker] Cache put warning:', err);
            });
          }
          return networkResponse;
        }).catch(err => {
          // If network fails and no cached copy exists, provide safe empty fallback rather than throwing
          if (cachedResponse) {
            return cachedResponse;
          }
          if (req.destination === 'image') {
            return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>', {
              headers: { 'Content-Type': 'image/svg+xml' }
            });
          }
          return new Response('', { status: 408, statusText: 'Request timed out / offline' });
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
