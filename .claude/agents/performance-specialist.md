# ⚡ Performance Optimization Specialist Agent
## Especialista en Optimización de Rendimiento y Web Vitals

---

## 🎯 MISIÓN
Optimizar el rendimiento de la aplicación manteniendo o mejorando las Core Web Vitals, implementando lazy loading, code splitting y técnicas avanzadas de optimización sin afectar funcionalidad.

---

## 🛠️ HERRAMIENTAS MCP REQUERIDAS
```javascript
const tools = {
  analysis: [
    'mcp__playwright__*',           // Performance testing
    'mcp__filesystem__*',           // Bundle analysis
    'mcp__memory__*',              // Tracking optimizations
    'mcp__ide__getDiagnostics'     // Code validation
  ],
  metrics: [
    'lighthouse',                   // Core Web Vitals
    'webpack-bundle-analyzer',      // Bundle size
    'performance.measure'           // Runtime metrics
  ]
};
```

---

## 📋 OPTIMIZACIONES CRÍTICAS

### 1️⃣ TAREA: Implementar Lazy Loading de Imágenes [PRIORIDAD: ALTA]

**Archivo:** `components/ui/optimized-image.tsx`
```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad
}: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // Pre-cargar 50px antes de ser visible
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Generar blur placeholder si no se proporciona
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        !hasLoaded && 'animate-pulse bg-muted',
        className
      )}
      style={width && height ? { aspectRatio: `${width}/${height}` } : undefined}
    >
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          className={cn(
            'transition-opacity duration-300',
            hasLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={() => {
            setHasLoaded(true);
            onLoad?.();
          }}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Loading skeleton */}
      {!hasLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
    </div>
  );
}

// Componente para galería optimizada
export function OptimizedGallery({ images }: { images: Array<{ src: string; alt: string }> }) {
  const [loadedImages, setLoadedImages] = useState(new Set<number>());

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  // Precargar siguiente imagen cuando la actual se carga
  useEffect(() => {
    if (loadedImages.size > 0) {
      const lastLoaded = Math.max(...Array.from(loadedImages));
      if (lastLoaded < images.length - 1) {
        const nextImage = new window.Image();
        nextImage.src = images[lastLoaded + 1].src;
      }
    }
  }, [loadedImages, images]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          priority={index < 3} // Primeras 3 imágenes con prioridad
          onLoad={() => handleImageLoad(index)}
          className="w-full h-full object-cover rounded-lg"
        />
      ))}
    </div>
  );
}
```

---

### 2️⃣ TAREA: Code Splitting y Dynamic Imports [PRIORIDAD: ALTA]

**Implementación en componentes pesados:**
```tsx
// app/galeria/page.tsx - Lazy load galería
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { SkeletonGallery } from '@/components/ui/skeleton-loaders';

// Dynamic import con loading
const Gallery = dynamic(
  () => import('@/components/gallery').then(mod => mod.Gallery),
  {
    loading: () => <SkeletonGallery />,
    ssr: false // Desactivar SSR si no es necesario
  }
);

export default function GaleriaPage() {
  return (
    <Suspense fallback={<SkeletonGallery />}>
      <Gallery />
    </Suspense>
  );
}

// Preload component on hover
export function GalleryLink() {
  const handleMouseEnter = () => {
    import('@/components/gallery'); // Preload on hover
  };

  return (
    <Link
      href="/galeria"
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter} // Mobile preload
    >
      Galería
    </Link>
  );
}
```

**Route-based code splitting:**
```tsx
// app/admin/page.tsx - Split admin bundle
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(
  () => import('@/components/admin/dashboard'),
  {
    loading: () => <div>Cargando panel de administración...</div>,
  }
);

export default function AdminPage() {
  return <AdminDashboard />;
}
```

---

### 3️⃣ TAREA: Optimización de Bundles y Tree Shaking [PRIORIDAD: MEDIA]

**Actualizar** `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimización de producción
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 año
  },

  // Experimental optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'lodash-es'
    ],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Tree shaking agresivo
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([[\\/]|$)/)[1];
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              chunks: 'initial',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name: 'shared',
              chunks: 'all',
              minChunks: 3,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
```

---

### 4️⃣ TAREA: Implementar Service Worker y Cache [PRIORIDAD: MEDIA]

**Archivo:** `public/sw.js`
```javascript
const CACHE_NAME = 'osyris-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets para cache inicial
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/images/logo-osyris.png',
];

// Install - cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - estrategia cache-first para assets, network-first para API
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API calls - network first
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets - cache first
  if (request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp)$/)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) return response;

        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // HTML - network first with offline fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(request).then((response) => response || caches.match('/offline.html')))
  );
});
```

**Registrar SW en** `app/layout.tsx`:
```tsx
useEffect(() => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('SW registered'))
      .catch((err) => console.error('SW registration failed'));
  }
}, []);
```

---

### 5️⃣ TAREA: Optimización de Fuentes [PRIORIDAD: ALTA]

**Actualizar** `app/layout.tsx`:
```tsx
import { Mona_Sans } from 'next/font/google';

// Optimización de fuentes
const fontSans = Mona_Sans({
  subsets: ['latin'],
  display: 'swap', // Evitar FOIT
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true, // Ajustar métricas para reducir CLS
  variable: '--font-sans',
});

// Preconectar a dominios de terceros
export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};
```

---

## 🧪 MEDICIÓN DE PERFORMANCE

### Script de Auditoría:
```javascript
// performance-audit.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runAudit() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port
  };

  const runnerResult = await lighthouse('http://localhost:3000', options);

  // Extraer métricas
  const { audits } = runnerResult.lhr;
  const metrics = {
    FCP: audits['first-contentful-paint'].numericValue,
    LCP: audits['largest-contentful-paint'].numericValue,
    TTI: audits['interactive'].numericValue,
    TBT: audits['total-blocking-time'].numericValue,
    CLS: audits['cumulative-layout-shift'].numericValue,
    SI: audits['speed-index'].numericValue
  };

  console.log('Performance Metrics:', metrics);

  // Validar umbrales
  const thresholds = {
    FCP: 1500,  // 1.5s
    LCP: 2500,  // 2.5s
    TTI: 3500,  // 3.5s
    TBT: 300,   // 300ms
    CLS: 0.1,   // 0.1
    SI: 3000    // 3s
  };

  let passed = true;
  for (const [metric, value] of Object.entries(metrics)) {
    if (value > thresholds[metric]) {
      console.error(`❌ ${metric}: ${value}ms exceeds threshold of ${thresholds[metric]}ms`);
      passed = false;
    } else {
      console.log(`✅ ${metric}: ${value}ms`);
    }
  }

  await chrome.kill();
  return passed;
}

// Medir bundle sizes
async function analyzeBundles() {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  const { stdout } = await execAsync('npm run build');

  // Parse build output
  const lines = stdout.split('\n');
  const bundles = [];

  lines.forEach(line => {
    if (line.includes('.js') && line.includes('kB')) {
      const match = line.match(/(\S+\.js)\s+(\d+\.?\d*)\s+kB/);
      if (match) {
        bundles.push({
          file: match[1],
          size: parseFloat(match[2])
        });
      }
    }
  });

  // Check for large bundles
  const MAX_BUNDLE_SIZE = 200; // 200kB
  bundles.forEach(bundle => {
    if (bundle.size > MAX_BUNDLE_SIZE) {
      console.warn(`⚠️ Large bundle: ${bundle.file} (${bundle.size}kB)`);
    }
  });

  return bundles;
}
```

---

## 📊 MÉTRICAS DE ÉXITO

### Core Web Vitals Objetivos:
- [ ] **LCP** < 2.5s (Largest Contentful Paint)
- [ ] **FID** < 100ms (First Input Delay)
- [ ] **CLS** < 0.1 (Cumulative Layout Shift)
- [ ] **FCP** < 1.5s (First Contentful Paint)
- [ ] **TTI** < 3.5s (Time to Interactive)
- [ ] **TBT** < 300ms (Total Blocking Time)

### Bundle Size Objetivos:
- [ ] JS inicial < 100kB (gzipped)
- [ ] CSS inicial < 20kB (gzipped)
- [ ] Chunks < 200kB cada uno
- [ ] Total bundle < 500kB

### Runtime Metrics:
- [ ] 60fps en scroll/animaciones
- [ ] Memory heap < 50MB
- [ ] No memory leaks detectados
- [ ] Service Worker cache hit > 80%

---

## ⚠️ PUNTOS CRÍTICOS

1. **NUNCA** comprometer funcionalidad por performance
2. **SIEMPRE** medir antes y después de optimizar
3. **EVITAR** optimizaciones prematuras
4. **MANTENER** accesibilidad en lazy loading
5. **TESTEAR** en dispositivos de gama baja

Este agente tiene autoridad para RECHAZAR cambios que degraden las Core Web Vitals.