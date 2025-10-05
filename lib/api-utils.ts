/**
 * Utilidad para obtener la URL del API dinámicamente
 * Detecta automáticamente si estamos en producción o desarrollo
 */
export function getApiUrl(): string {
  // En servidor, usar localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const { hostname, protocol } = window.location;

  // Si estamos en producción (gruposcoutsosyris.es)
  if (hostname.includes('gruposcoutsosyris.es')) {
    return `${protocol}//${hostname}`;
  }

  // Si estamos en desarrollo local
  return 'http://localhost:5000';
}

/**
 * Construye una URL completa para un endpoint del API
 */
export function apiEndpoint(path: string): string {
  const apiUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiUrl}${cleanPath}`;
}
