"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function PWADebug() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasServiceWorker, setHasServiceWorker] = useState(false);
  const [hasManifest, setHasManifest] = useState(false);
  const [isHTTPS, setIsHTTPS] = useState(false);
  const [swDetails, setSwDetails] = useState<string>("");

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Check if manifest is loaded
    const manifest = document.querySelector('link[rel="manifest"]');
    setHasManifest(!!manifest);

    // Check if HTTPS
    setIsHTTPS(location.protocol === "https:" || location.hostname === "localhost");

    // Check for service worker with retry
    const checkServiceWorker = () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          setHasServiceWorker(registrations.length > 0);
          if (registrations.length > 0) {
            setSwDetails(registrations.map(r => r.scope).join(", "));
          }
        });
      }
    };

    checkServiceWorker();
    // Retry after 2 seconds in case registration is slow
    const timer = setTimeout(checkServiceWorker, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 bg-[#1a1a24] border-[#2a2a3a] text-white shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">PWA Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          {isStandalone ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span>Standalone Mode: {isStandalone ? "Yes" : "No"}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasServiceWorker ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span>Service Worker: {hasServiceWorker ? `Registered (${swDetails})` : "Not Found"}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasManifest ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span>Manifest: {hasManifest ? "Found" : "Missing"}</span>
        </div>
        <div className="flex items-center gap-2">
          {isHTTPS ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
          <span>HTTPS: {isHTTPS ? "Yes" : "No (Required for PWA)"}</span>
        </div>
        {!isHTTPS && (
          <p className="text-yellow-500 text-xs mt-2">
            ⚠️ PWAs require HTTPS. Use localhost or deploy to HTTPS server.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
