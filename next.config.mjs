/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable optimizations for faster navigation
    optimizePackageImports: ['@supabase/auth-helpers-nextjs'],
  },
  // Enable gzip compression
  compress: true,
  // Optimize images
  images: {
    remotePatterns: [],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
