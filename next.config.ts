/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath: "/admin",
  assetPrefix: "/admin",
  trailingSlash: true,
  distDir: ".next_admin",   // ✅ unique build folder
  experimental: {
    serverActions: {}, // ✅ FIXED
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ["res.cloudinary.com"],
  },
};

module.exports = nextConfig;
