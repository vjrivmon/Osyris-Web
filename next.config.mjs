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
    unoptimized: true,
  },
  output: 'standalone', // Para Docker
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
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
