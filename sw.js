const CACHE = "read-anyone-v12";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./favicon.ico",
  "./favicon-32.png",
  "./favicon-48.png",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png",
  "./og.png",
  "./phrases.json",
  "./words.json",
  "./ask/ui.js",
  "./ask/engine.js",
  "./ask/kb.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
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
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Network first so a new deploy replaces the old cached app,
  // but fall back to the saved copy after 3 seconds (weak signal) or when offline.
  const fromCache = () =>
    caches.match(req, { ignoreSearch: true }).then((c) => c || caches.match("./"));
  const network = fetch(req).then((res) => {
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((cache) => cache.put(req, copy));
    }
    return res;
  });
  const timeout = new Promise((resolve) =>
    setTimeout(() => fromCache().then((c) => c && resolve(c)), 3000)
  );
  event.respondWith(
    Promise.race([network, timeout]).catch(() => fromCache())
  );
});
