const CACHE_NAME = 'yen-dev-v2.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/about_me.html',
  '/portfolios.html',
  '/contact.html',
  '/ai_builder.html',
  '/aws_architecture.html',
  '/css/finlab.css',
  '/css/finlab-theme.css',
  '/css/site-nav.css',
  '/css/site-footer.css',
  '/js/site-nav.js',
  '/img/icon.svg',
  '/manifest.json',
  // External resources (cached for offline use)
  'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
  'https://code.jquery.com/jquery-3.5.1.slim.min.js',
  'https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.1/dist/umd/popper.min.js',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => {
          return new Request(url, { mode: 'no-cors' });
        }));
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Fetch Strategy: Cache First for assets, Network First for pages
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip Analytics requests
  if (url.hostname.includes('google-analytics') || url.hostname.includes('googletagmanager')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response as it's a stream and can only be consumed once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });

          return response;
        }).catch(() => {
          // If network fails, try to serve a custom offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // For other requests, return a basic offline response
          return new Response(
            JSON.stringify({ 
              error: 'Offline', 
              message: 'This content is not available offline' 
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
              statusText: 'Service Unavailable'
            }
          );
        });
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle message events from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});