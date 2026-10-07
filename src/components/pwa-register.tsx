"use client";

// PWA teardown — mounts once in the root layout. The service worker is
// retired (see public/sw.js): registering it again would resurrect the
// stale-cache bug where returning visitors were pinned to their first
// visit's JS. Instead, every mount unregisters any leftover registration
// and purges CacheStorage, so previously-poisoned browsers self-heal.

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const teardown = async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => {})));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k).catch(() => {})));
      }
    };
    teardown().catch(() => {});
  }, []);

  return null;
}
