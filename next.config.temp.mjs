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
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  // Deshabilitar completamente el prerendering para evitar errores
  experimental: {
    serverActions: false,
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
}

export default nextConfig