import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "sancabrechobucket.s3.amazonaws.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "sancabrechobucket.s3.us-east-2.amazonaws.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "sancabrechobucket-prod.s3.amazonaws.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "sancabrechobucket.s3-prod.us-east-2.amazonaws.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      }
    ]
  },
};

export default nextConfig;