const CACHE_NAME = "ff-v1";

const SHELL_URLS = [
  "/",
  "/today",
  "/break",
  "/close",
  "/close/done",
  "/garden",
  "/rhythm",
  "/onboarding",
];

const AUDIO_URLS = [
  "/audio/rain.ogg",
  "/audio/lofi.ogg",
  "/audio/brown-noise.ogg",
  "/audio/cafe.ogg",
  "/audio/forest.ogg",
];

// Install: pre-cache shell. Audio is cached lazily on first fetch.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Audio files: cache-first (large, never change)
// - JS/CSS/_next static: cache-first
// - Navigation (HTML): network-first with cache fallback
// - Everything else: network-first
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  const isAudio = AUDIO_URLS.some((a) => url.pathname === a);
  const isStatic = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
  const isNavigation = request.mode === "navigate";

  if (isAudio || isStatic) {
    // Cache-first
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetchAndCache(request)
      )
    );
    return;
  }

  if (isNavigation) {
    // Network-first, fall back to cached shell
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached ?? caches.match("/")))
    );
    return;
  }

  // Default: network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

async function fetchAndCache(request) {
  const cache = await caches.open(CACHE_NAME);
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}
