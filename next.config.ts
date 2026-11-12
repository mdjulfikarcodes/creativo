import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    instantInsights: {
      validationLevel: 'manual-warning',
    },
  },
  cacheComponents: true,
  partialPrefetching: true,

  redirects: async () => [
    {
      source: "/my-listings",
      destination: "/dashboard/my-studio",
      permanent: false,
    },
    {
      source: "/add-studio",
      destination: "/dashboard/add-studio",
      permanent: false,
    },
    {
      source: "/my-bookings",
      destination: "/dashboard/my-bookings",
      permanent: false,
    },
  ],

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  images: {
    unoptimized: true, 
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", port: "", pathname: "/**" },
      { protocol: "https", hostname: "ui-avatars.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "i.ibb.co", port: "", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", port: "", pathname: "/**" },
    ],
  },
};

export default nextConfig;