"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Wait for the window to load
      window.addEventListener("load", () => {
        // Register the service worker
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration);
            console.log("SW scope: ", registration.scope);
          })
          .catch((registrationError) => {
            console.error("SW registration failed: ", registrationError);
            console.error("SW error details: ", registrationError.message);
          });
      });
    }
  }, []);

  return null;
}
