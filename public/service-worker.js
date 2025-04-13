/**
 * Best effort to install the dependencies needed. Won't include the deps inside
 * google fonts and icons.
 *
 * Caching is network first, cache everything, so we should catch all files.
 */

const CACHE_NAME = "pwa-cache-v0.7";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/style.css",
                "/script.js",
                "/manifest.json",
                "/favicon.ico",
                "/favicon.png",
                "/icon-192.png",
                "/icon-512.png",

                // Thumbnails
                "/thumbnails/oak.png",
                "/thumbnails/whitepine.png",
                "/thumbnails/glacier.png",
                "/thumbnails/loon.png",
                "/thumbnails/balsam.png",
                "/thumbnails/maple.png",
                "/thumbnails/hemlock.png",
                "/thumbnails/birch.png",

                // Base SVG images
                "/images/fill.svg",
                "/images/mask.svg",
                "/images/outlines.svg",

                // Map SVG images
                "/images/hemlock.svg",
                "/images/birch.svg",
                "/images/balsam.svg",
                "/images/maple.svg",
                "/images/loon.svg",
                "/images/glacier.svg",

                // Animation frames - Oak
                "/images/oak01.svg",
                "/images/oak02.svg",
                "/images/oak03.svg",
                "/images/oak04.svg",
                "/images/oak05.svg",
                "/images/oak06.svg",
                "/images/oak07.svg",
                "/images/oak08.svg",
                "/images/oak09.svg",
                "/images/oak10.svg",

                // Animation frames - White Pine
                "/images/whitePine01.svg",
                "/images/whitePine02.svg",
                "/images/whitePine03.svg",
                "/images/whitePine04.svg",
                "/images/whitePine05.svg",
                "/images/whitePine06.svg",
                "/images/whitePine07.svg",
                "/images/whitePine08.svg",
                "/images/whitePine09.svg",
                "/images/whitePine10.svg",

                // Screenshots referenced in manifest
                "/screenshots/mobile.png",
                "/screenshots/desktop.png",

                // Google Fonts and Material Symbols
                "https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Kumbh+Sans:wght@100..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
                "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
            ]);
        })
    );
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
