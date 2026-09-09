import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network IP access during development (e.g., testing from mobile on LAN)
  allowedDevOrigins: [
    '192.168.34.178',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
