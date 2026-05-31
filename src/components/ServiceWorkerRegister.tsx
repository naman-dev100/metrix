"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") {
        // In development, unregister any active service worker to prevent stale caching
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          if (registrations.length > 0) {
            console.log("[PWA] Found active service workers in development mode. Unregistering...");
            Promise.all(registrations.map(r => r.unregister())).then(() => {
              console.log("[PWA] All service workers unregistered. Reloading page to clear cache...");
              window.location.reload();
            });
          }
        });
      } else {
        // In production, register the service worker
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .catch(() => {});
        });

        // Clear any stale API caches from previous service worker versions
        // This ensures fresh data is always fetched from the network
        if ("caches" in window) {
          caches.delete("apis").then((deleted) => {
            if (deleted) {
              console.log("[PWA] Cleared stale API cache");
            }
          });
        }
      }
    }
  }, []);

  return null;
}

