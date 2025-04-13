const CACHE_NAME = "pwa-cache-v0.6";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/style.css",
                "/script.js",
                "/icon-192.png",
                "/icon-512.png",
            ]);
        })
    );
    self.skipWaiting(); // Forces immediate activation
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request); // Serve from cache if fetch fails (offline mode)
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim(); // Ensures the new service worker is used immediately
    self.skipWaiting(); // Force the update to be immediately active
});
