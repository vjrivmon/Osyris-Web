/**
 * Utilidad para obtener la URL del API dinámicamente
 * Detecta automáticamente el entorno basándose en el hostname del navegador
 */
export function getApiUrl(): string {
  // 1. PRIORIDAD: variables de entorno explícitas (solo si están definidas)
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envApiUrl && envApiUrl.trim() !== '') {
    return envApiUrl.replace(/\/$/, '');
  }

  // 2. En servidor (SSR/SSG), usar localhost para llamadas internas
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  // 3. DETECCIÓN AUTOMÁTICA POR HOSTNAME DEL NAVEGADOR
  const { hostname, protocol } = window.location;

  // Para el dominio de producción gruposcoutosyris.es
  if (hostname.includes('gruposcoutosyris.es')) {
    return `${protocol}//gruposcoutosyris.es`;
  }

  // Para staging (IP del servidor o subdominios)
  if (hostname === '116.203.98.142' || hostname.includes('osyris-staging')) {
    return `${protocol}//${hostname}:5001`;
  }

  // Para desarrollo local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // Para otros dominios con 'osyris'
  if (hostname.includes('osyris')) {
    return `${protocol}//api.${hostname}`;
  }

  // Fallback: mismo protocolo y hostname, puerto 5000
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
