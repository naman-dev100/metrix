import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // Never cache API routes — always fetch fresh from network
    {
      urlPattern: /^https?:\/\/.*\/api\/(?!auth\/).*/i,
      handler: "NetworkOnly",
      method: "GET",
    },
    // Auth routes should also never be cached
    {
      urlPattern: /^https?:\/\/.*\/api\/auth\/.*/i,
      handler: "NetworkOnly",
      method: "GET",
    },
    // Google Fonts webfonts
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    // Google Fonts stylesheets
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts-stylesheets",
        expiration: { maxEntries: 4, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    // Static assets (JS, CSS, images)
    {
      urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|webp|ico|woff|woff2)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    // All other same-origin routes (pages)
    {
      urlPattern: ({ url }: { url: URL }) => self.origin === url.origin && !url.pathname.startsWith("/api/"),
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.34"],
};

export default withPWA(nextConfig);
