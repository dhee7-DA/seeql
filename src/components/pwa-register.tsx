"use client";

// PWA registration — mounts once in the root layout. Registration failures
// are swallowed: the app must work identically where service workers are
// unavailable (older Safari, in-app webviews, file://).

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline shell is a progressive enhancement */
      });
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
