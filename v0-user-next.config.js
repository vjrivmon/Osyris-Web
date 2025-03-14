const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ajustes específicos de la aplicación
  images: {
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com'],
  },
  // Mejoras de rendimiento adicionales
  swcMinify: true,
  transpilePackages: [],
  // Ajustes adicionales de optimización
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
}

module.exports = withBundleAnalyzer(nextConfig) 