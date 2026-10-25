// OBUMSJ Service Worker - Offline-First App Shell & Safe Updates
// Compliant with Multi-Tier Caching, Clean URLs, and Privacy Preservation

const CACHE_VERSION = 'v1.2.1';
const PRECACHE_NAME = `obumsj-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `obumsj-runtime-${CACHE_VERSION}`;
const CACHE_PREFIX = 'obumsj-';

// Complete static application shell to precache for offline availability across all 20 public pages
const PRECACHE_ASSETS = [
  // Root & Homepage
  './',
  './index.html',
  // All Public Pages
  './About-Us.html',
  './donate.html',
  './contact.html',
  './Blog.html',
  './sector.html',
  './offline.html',
  // 10 Sector Pages
  './Qirat.html',
  './Dawah.html',
  './Social Affairs.html',
  './Social%20Affairs.html',
  './Academy.html',
  './Finance.html',
  './Ziyara.html',
  './Ruqiya.html',
  './Charity.html',
  './Dawrul-hasen.html',
  './Information.html',
  // 3 Academy Subpages
  './Academy-Tutorials.html',
  './Academy-Library.html',
  './Academy-Exams.html',
  // Core Stylesheets & Scripts
  './style.css',
  './css/design-system.css',
  './Script.js',
  './js/theme-engine.js',
  './js/language-system.js',
  './js/firebase.js',
  // 4-Language Translation Dictionaries
  './js/en.json',
  './js/am.json',
  './js/om.json',
  './js/ar.json',
  // Manifest & Favicon
  './manifest.webmanifest',
  './favicon.ico',
  // Branding, Icons & Textures
  './IMAGE/OBUMSJ Logo.jpg',
  './IMAGE/icon-192.png',
  './IMAGE/icon-512.png',
  './IMAGE/decorative/lantern.svg',
  './IMAGE/decorative/islamic-day-texture-seamless.jpg',
  './IMAGE/decorative/islamic-night-texture-seamless.jpg',
  './IMAGE/Commercial Bank of Ethiopia.png',
  './IMAGE/Cooperative Bank of Oromia.png',
  './IMAGE/E-birr.png',
  // Photography & Gallery Assets
  './IMAGE/Best 1.jpg',
  './IMAGE/Best 2.jpg',
  './IMAGE/Best 3.jpg',
  './IMAGE/Best 4.jpg',
  './IMAGE/Best 5.jpg',
  './IMAGE/Best 6.jpg',
  './IMAGE/Best 7.jpg',
  './IMAGE/Best 8.jpg',
  './IMAGE/Best 9.jpg',
  './IMAGE/Best 10.jpg',
  './IMAGE/We are visted.jpg',
  './IMAGE/Abdulmenan.jpg',
  './IMAGE/trial.jpg',
  './IMAGE/Baba kenya 1.jpg'
];

// Canonical mapping of public page routes for accurate clean URL resolution
const PUBLIC_PAGES_CANONICAL = [
  'index.html',
  'About-Us.html',
  'donate.html',
  'contact.html',
  'Blog.html',
  'sector.html',
  'Qirat.html',
  'Dawah.html',
  'Social Affairs.html',
  'Academy.html',
  'Finance.html',
  'Ziyara.html',
  'Ruqiya.html',
  'Charity.html',
  'Dawrul-hasen.html',
  'Information.html',
  'Academy-Tutorials.html',
  'Academy-Library.html',
  'Academy-Exams.html',
  'offline.html'
];

// Patterns that MUST NEVER be cached in shared storage (Security, Auth & Live APIs)
// Note: Local static files like ./js/firebase.js are NOT excluded; remote Google endpoints are.
const EXCLUDE_URL_PATTERNS = [
  /\/admin-recovery(\.html)?/i,
  /\/admin\b/i,
  /\/dashboard(\.html)?/i,
  /\/member(\.html)?/i,
  /\/female\b/i,
  /\/login(\.html)?/i,
  /\/signup(\.html)?/i,
  /firestore\.googleapis\.com/i,
  /identitytoolkit\.googleapis\.com/i,
  /securetoken\.googleapis\.com/i,
  /firebasestorage\.googleapis\.com/i,
  /\/v1\/accounts/i,
  /\/v1\/projects\/.*:runQuery/i,
  /\/token/i
];

// Helper: check if a URL matches sensitive / private exclusions
function isExcludedRequest(url) {
  // If it is the local static firebase module script, allow caching
  if (url.origin === self.location.origin && url.pathname.endsWith('/js/firebase.js')) {
    return false;
  }
  return EXCLUDE_URL_PATTERNS.some(pattern => pattern.test(url.pathname) || pattern.test(url.hostname));
}

// Helper: match request in caches with clean URL normalization, trailing slash support, and casing tolerance
async function matchInAnyCache(request) {
  // 1. Direct match
  const directMatch = await caches.match(request);
  if (directMatch) {
    return directMatch;
  }

  // 2. Direct match ignoring query strings
  const directIgnoreSearch = await caches.match(request, { ignoreSearch: true });
  if (directIgnoreSearch) {
    return directIgnoreSearch;
  }

  try {
    const url = new URL(request.url);
    let cleanPath = url.pathname;

    // Decode URI components (handles /Social%20Affairs.html -> /Social Affairs.html)
    try {
      cleanPath = decodeURIComponent(cleanPath);
    } catch (e) {
      // fallback to raw pathname
    }

    // 1. Normalize trailing slashes FIRST (e.g., /donate/ -> /donate, /social-affairs/ -> /social-affairs)
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }

    // 2. Homepage equivalence: / <==> /index.html <==> /index (with launcher query parameter tolerance)
    if (cleanPath === '/' || cleanPath === '' || cleanPath.endsWith('/index.html') || cleanPath.endsWith('/index')) {
      const rootMatch = await caches.match('./', { ignoreSearch: true }) ||
                         await caches.match('/', { ignoreSearch: true }) ||
                         await caches.match('./index.html', { ignoreSearch: true }) ||
                         await caches.match('/index.html', { ignoreSearch: true });
      if (rootMatch) return rootMatch;
    }

    // 3. Extract the page filename / segment
    const segment = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);
    const baseDir = cleanPath.substring(0, cleanPath.lastIndexOf('/') + 1);

    if (segment) {
      // Check if segment matches any known public page (exact or clean URL)
      for (const canonical of PUBLIC_PAGES_CANONICAL) {
        const canonicalBase = canonical.replace(/\.html$/i, '');
        const isMatch = (
          segment === canonical ||
          segment.toLowerCase() === canonical.toLowerCase() ||
          segment === canonicalBase ||
          segment.toLowerCase() === canonicalBase.toLowerCase() ||
          segment.toLowerCase().replace(/-/g, ' ') === canonicalBase.toLowerCase() ||
          segment.toLowerCase().replace(/ /g, '-') === canonicalBase.toLowerCase()
        );

        if (isMatch) {
          // Attempt match with canonical .html filename, covering both raw and percent-encoded forms
          const encodedCanonical = encodeURI(canonical);
          const candidates = [
            new URL(baseDir + canonical, url.origin).href,
            new URL(baseDir + encodedCanonical, url.origin).href,
            './' + canonical,
            './' + encodedCanonical,
            '/' + canonical,
            '/' + encodedCanonical,
            canonical,
            encodedCanonical
          ];

          for (const cand of candidates) {
            const canonicalCached = await caches.match(cand, { ignoreSearch: true });
            if (canonicalCached) {
              return canonicalCached;
            }
          }
        }
      }
    }

    // Generic clean URL normalization (/path -> /path.html)
    if (!cleanPath.includes('.') && cleanPath !== '/' && cleanPath !== '') {
      const htmlUrl = new URL(cleanPath + '.html', url.origin).href;
      const htmlCached = await caches.match(htmlUrl, { ignoreSearch: true });
      if (htmlCached) {
        return htmlCached;
      }
    }

    // Static asset query parameter tolerance (e.g. style.css?v=1 or favicon.ico?v=2)
    if (url.search && (cleanPath.includes('.') || request.mode === 'navigate')) {
      const pathOnlyUrl = new URL(cleanPath, url.origin).href;
      const pathOnlyCached = await caches.match(pathOnlyUrl, { ignoreSearch: true });
      if (pathOnlyCached) {
        return pathOnlyCached;
      }
    }
  } catch (e) {
    // URL parsing fallback
  }

  return null;
}

// Helper: get offline fallback response
async function getOfflineFallback() {
  const fallback = await caches.match('./offline.html', { ignoreSearch: true }) ||
                   await caches.match('/offline.html', { ignoreSearch: true }) ||
                   await caches.match(new URL('./offline.html', self.location.href).href, { ignoreSearch: true }) ||
                   await caches.match('offline.html', { ignoreSearch: true });
  return fallback;
}

// Install Event - Pre-cache complete static app shell
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
  // Auto-activate on initial installation if no active controller exists yet
  if (!self.registration || !self.registration.active) {
    self.skipWaiting();
  }
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
  const isExcluded = isExcludedRequest(url);

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
        .then(async response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE_NAME).then(cache => cache.put(req, responseClone));
            return response;
          }
          // If server returns 404 or 5xx (e.g. clean URLs without server-side rewrite rules), fall back to cache
          if (response && (response.status === 404 || response.status >= 500)) {
            const cached = await matchInAnyCache(req);
            if (cached) {
              return cached;
            }
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
