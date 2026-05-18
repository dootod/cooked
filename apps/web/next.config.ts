import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(isProd
            ? [
                { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
                {
                  key: "Content-Security-Policy",
                  value: [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline'",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com",
                    `img-src 'self' data: blob: ${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"} https://*.r2.cloudflarestorage.com https://images.unsplash.com`,
                    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}`,
                    "frame-src https://www.youtube.com https://player.vimeo.com",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                  ].join("; "),
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
