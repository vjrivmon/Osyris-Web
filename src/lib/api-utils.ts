/**
 * Utilidad para obtener la URL del API dinámicamente
 * Prioriza NEXT_PUBLIC_API_URL, luego detecta automáticamente el entorno
 */
export function getApiUrl(): string {
  // 1. PRIORIDAD: variables de entorno (servidor y cliente)
  const serverEnvApiUrl =
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (serverEnvApiUrl) {
    return serverEnvApiUrl.replace(/\/$/, '');
  }

  // 2. En servidor (SSR/SSG), usar localhost
  if (typeof window === 'undefined') {
    const fallbackServerUrl = process.env.SERVER_API_FALLBACK || 'http://localhost:5000';
    return fallbackServerUrl.replace(/\/$/, '');
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

  // Hosts específicos de staging (IP o subdominios conocidos)
  if (
    hostname === '116.203.98.142' ||
    hostname.includes('osyris-staging')
  ) {
    return `${protocol}://${hostname}:5001`;
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
