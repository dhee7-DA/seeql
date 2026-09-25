/*
 * SeeQL service worker — a conservative shell cache.
 *
 * Strategy:
 *   navigations  → network-first, cached copy as fallback, then /offline.html
 *   static assets→ cache-first (immutable _next/static chunks, fonts, icons)
 *   /api/*       → network-only, never cached (every graded query must hit
 *                  the real engine; a cached result would be a lie)
 *
 * The app is fully client-side (progress in localStorage), so once the shell
 * is cached, the learn UI opens offline — quizzes and graded queries resume
 * the moment connectivity returns.
 */

const VERSION = "seeql-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/logo.svg",
  "/icons/pwa-192.png",
  "/icons/pwa-512.png",
  "/icons/pwa-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // The engine, parser, mentor, sandbox — always live, never cached.
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: network first; fall back to the cached page, then offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGE_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((hit) => hit || caches.match(OFFLINE_URL))
            .then((hit) => hit || Response.error()),
        ),
    );
    return;
  }

  // Static assets: cache-first — _next/static is content-hashed and the
  // icons/fonts never change under a given name.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/icons3d/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname === "/logo.svg";

  if (isStatic) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
  }
});
