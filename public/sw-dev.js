// Development service worker - minimal functionality
self.addEventListener('install', function(event) {
  console.log('Development service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Development service worker activated');
  event.waitUntil(self.clients.claim());
});

// Fallback to network for all requests in development
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
