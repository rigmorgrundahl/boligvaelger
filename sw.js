// The Clean Machine — minimal service worker
// Cache-first for the shell + React UMD bundles + Google Fonts CSS.
// Network for everything else, with a cached fallback for navigations.

const CACHE = "clean-machine-v4";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Karla:wght@400;500;600;700&display=swap"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // Don't fail install if a single asset can't be fetched
      Promise.all(SHELL.map((u) => cache.add(u).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // For navigations, try network then fall back to cached index.html
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // For other GETs, cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Opportunistically cache successful same-origin or font responses
        if (res && res.status === 200 && (req.url.startsWith(self.location.origin) || req.url.includes("fonts.g"))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
