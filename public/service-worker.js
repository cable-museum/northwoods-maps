self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("app-cache-v2").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./script.js",
        "./icon-192.png",
        "./icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// DELETE OLD CACHES ON ACTIVATE
//TODO: Geoffry is this ok?
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== "app-cache-v2") // Keep only the latest version
          .map((key) => caches.delete(key))
      );
    })
  );
});
