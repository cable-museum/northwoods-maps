/**
 * Best effort to install the dependencies needed. Won't include the deps inside
 * google fonts and icons.
 *
 * Caching is network first, cache everything, so we should catch all files.
 */

const CACHE_NAME = "pwa-cache-v0.7";

self.addEventListener("install", (event) => {
    // Everything loads on page load, warm cache then
    self.skipWaiting(); // Forces immediate activation
});

self.addEventListener("fetch", (event) => {
    // Only cache GET requests
    if (event.request.method !== "GET") {
        return event.respondWith(fetch(event.request));
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response because it can only be consumed once
                const responseClone = response.clone();

                // Open the cache and store the new response
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;
            })
            .catch(() => {
                // Network failed, try the cache
                return caches.match(event.request).then((cachedResponse) => {
                    // If we found a match in the cache, return it
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // If we didn't find a match in cache, return a fallback
                    // or a default response for offline experience
                    return new Response(
                        "Network request failed and no cache available",
                        {
                            status: 503,
                            statusText: "Service Unavailable",
                        }
                    );
                });
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
