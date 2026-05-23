import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/history",
        destination: "/",
        permanent: true,
      },
      {
        source: "/history/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default withPWA(nextConfig);
