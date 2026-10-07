/*
 * SeeQL service worker — RETIRED.
 *
 * Why: the old shell cache intercepted `_next/static/` with a cache-first
 * strategy. Safe for content-hashed production chunks, but this deployment
 * serves the app from a dev server whose chunk URLs are stable across code
 * changes — so returning visitors were pinned to the JS of their first
 * visit forever, even after hard refresh. Updates silently never arrived.
 *
 * The fix is retirement: no fetch handler, so the SW never intercepts
 * anything; activation purges every cache it owns and claims all clients.
 * `pwa-register.tsx` additionally unregisters any leftover registration and
 * clears CacheStorage on every mount, so even browsers that already hold
 * the old cache-first SW are rescued on their next visit. Offline-shell
 * ambitions are shelved until the app is built with content-hashed chunks.
 */

const RETIRED = "seeql-retired";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// NO fetch handler — never intercepts requests.
