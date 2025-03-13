const CACHE_NAME = "pwa-cache-v1";
const ASSETS_TO_CACHE = [
  "./", 
  "./index.html",
  "./manifest.json",
  "./style.css",
  "./script.js",
  "./icon-192.png",
  "./icon-512.png"
];

// Install Service Worker and cache assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Service Worker and remove old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated!");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Intercept network requests and serve cached assets when offline
self.addEventListener("fetch", (event) => {
  console.log("Fetching:", event.request.url);
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});