/**
 * Utilidad para obtener la URL del API dinámicamente
 * Prioriza NEXT_PUBLIC_API_URL, luego detecta automáticamente el entorno
 */
export function getApiUrl(): string {
  // 1. PRIORIDAD: Variable de entorno NEXT_PUBLIC_API_URL
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envApiUrl) {
    // Eliminar barra final si existe
    return envApiUrl.replace(/\/$/, '');
  }

  // 2. En servidor (SSR/SSG), usar localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  // 3. Fallback: detección automática por hostname
  const { hostname, protocol } = window.location;

  // Si estamos en localhost, usar puerto 5000 del backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // 4. DETECCIÓN INTELIGENTE PARA PRODUCCIÓN
  // Para el dominio gruposcoutosyris.es, usar el API del mismo dominio
  if (hostname.includes('gruposcoutosyris.es')) {
    return `${protocol}//gruposcoutosyris.es`;
  }

  // Para otros dominios, intentar usar API en el mismo dominio
  if (hostname.includes('osyris')) {
    return `${protocol}//api.${hostname}`;
  }

  // 5. ÚLTIMO RECURSO: Intentar construir API URL desde el hostname actual
  return `${protocol}//${hostname}:5000`;
}

/**
 * Construye una URL completa para un endpoint del API
 */
export function apiEndpoint(path: string): string {
  const apiUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiUrl}${cleanPath}`;
}
