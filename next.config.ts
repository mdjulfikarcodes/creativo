import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co", // ImgBB
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      // 👇 ১. shorturl.at যুক্ত করা হলো (আপনার এররের জন্য)
      {
        protocol: "https",
        hostname: "shorturl.at",
        port: "",
        pathname: "/**",
      },
      // 👇 ২. বিকল্প হিসেবে যেকোনো হোস্ট থেকে ইমেজ লোড করার অনুমতি (ভবিষ্যতের জন্য)
      {
        protocol: "https",
        hostname: "**", // যেকোনো ওয়েবসাইট থেকে ইমেজ লোড করবে
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;