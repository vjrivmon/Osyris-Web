import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Habilitar optimizacion de imagenes de Next.js
    unoptimized: false,
    // Formatos modernos para mejor compresion
    formats: ['image/avif', 'image/webp'],
    // Configuracion de calidad y tamanos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Dominios permitidos para imagenes externas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '116.203.98.142',
      },
      {
        protocol: 'http',
        hostname: '116.203.98.142',
      },
      {
        protocol: 'https',
        hostname: '*.grupoosyris.es',
      },
    ],
    // Tiempo de cache para imagenes optimizadas (1 hora)
    minimumCacheTTL: 3600,
  },
  output: 'standalone', // Para Docker
  async redirects() {
    return [
      {
        source: '/faq',
        destination: '/preguntas-frecuentes',
        permanent: true,
      },
    ]
  },
  // Reescribir rutas de uploads al backend
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5000/uploads/:path*',
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Add path aliases with absolute path
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    }

    // Ensure alias is properly set for both server and client
    if (!config.resolve.alias['@']) {
      config.resolve.alias['@'] = __dirname
    }

    return config
  },
}

export default nextConfig
