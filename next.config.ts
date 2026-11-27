import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // camera=(self): Magic Dress-Up only; app still requires parent toggle + Start Mirror.
  // microphone stays fully denied.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const mediapipeCacheHeaders = [
  ...securityHeaders,
  // Model/WASM change rarely; day-long cache cuts repeat Start Mirror cost on mobile.
  { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
];

const nextConfig: NextConfig = {
  transpilePackages: ["@mediapipe/tasks-vision"],
  async headers() {
    return [
      { source: "/mediapipe/:path*", headers: mediapipeCacheHeaders },
      { source: "/dress-up/:path*", headers: mediapipeCacheHeaders },
      { source: "/lesson-mirror/:path*", headers: mediapipeCacheHeaders },
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
