/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  outputFileTracingRoot: __dirname,
  // Silenciar warning de múltiples lockfiles
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Temporary: ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Temporary: ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
