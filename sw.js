// sw.js

const CACHE_NAME = 'offline-form-app-cache-v1';
const OFFLINE_URL = 'index.html';

const FILES_TO_CACHE = [
  '/',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'icons/icon-16x16.png',
  'icons/icon-32x32.png',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
  // Add any other assets you want to cache
];

// Install Event: Cache Files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
});

// Fetch Event: Serve Cached Files When Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Activate Event: Clean Up Old Caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
