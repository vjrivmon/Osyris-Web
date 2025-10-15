// Script para depurar URL del API
console.log('🔍 Debug - Verificando URL del API');
console.log('Hostname:', window.location.hostname);
console.log('Protocol:', window.location.protocol);

// Simular getApiUrl del frontend
const getApiUrl = () => {
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envApiUrl) {
    return envApiUrl.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const { hostname, protocol } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  if (hostname.includes('gruposcoutosyris.es')) {
    return `${protocol}//gruposcoutosyris.es`;
  }

  if (hostname.includes('osyris')) {
    return `${protocol}//api.${hostname}`;
  }

  return `${protocol}//${hostname}:5000`;
};

console.log('📡 URL del API detectada:', getApiUrl());