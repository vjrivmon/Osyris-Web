/**
 * Configuración OAuth2 para Google Drive
 *
 * Esta configuración permite subir archivos usando la cuenta de un usuario real
 * en lugar de Service Account (que no tiene cuota de almacenamiento).
 *
 * SETUP INICIAL (una sola vez):
 * 1. Ir a Google Cloud Console > APIs & Services > Credentials
 * 2. Crear OAuth 2.0 Client ID (tipo: Web Application)
 * 3. Añadir redirect URI: http://localhost:5000/api/drive/oauth/callback
 * 4. Copiar Client ID y Client Secret al .env
 * 5. Visitar /api/drive/oauth/authorize como admin para autorizar
 * 6. El refresh token se guardará automáticamente
 */

const path = require('path');
const fs = require('fs');

/**
 * Obtiene la URI de redirección según el entorno
 * Solo soporta desarrollo (localhost) y producción (HTTPS)
 * Google no permite HTTP para IPs públicas (staging)
 */
function getRedirectUri() {
  // Prioridad: Variable de entorno explícita
  if (process.env.GOOGLE_OAUTH_REDIRECT_URI) {
    return process.env.GOOGLE_OAUTH_REDIRECT_URI;
  }

  // Fallback según NODE_ENV
  const env = process.env.NODE_ENV || 'development';
  const redirectUris = {
    development: 'http://localhost:5000/api/drive/oauth/callback',
    production: 'https://gruposcoutosyris.es/api/drive/oauth/callback'
  };

  // Staging usa la misma que producción (aunque no funcionará OAuth)
  return redirectUris[env] || redirectUris.development;
}

/**
 * Obtiene la ruta del archivo de tokens según el entorno
 */
function getTokenPath() {
  if (process.env.GOOGLE_OAUTH_TOKEN_PATH) {
    return process.env.GOOGLE_OAUTH_TOKEN_PATH;
  }

  const env = process.env.NODE_ENV || 'development';
  const suffix = env === 'production' ? 'production' : 'development';

  return path.join(__dirname, `../../credentials/oauth-tokens.${suffix}.json`);
}

const OAUTH_CONFIG = {
  // Credenciales OAuth2 (del archivo .env)
  clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',

  // URL de redirección después de autorizar (dinámica por entorno)
  redirectUri: getRedirectUri(),

  // Scopes necesarios
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive'
  ],

  // Archivo donde se guarda el refresh token (separado por entorno)
  tokenPath: getTokenPath(),

  // URLs de Google OAuth
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token'
};

/**
 * Guarda los tokens en archivo
 */
const saveTokens = (tokens) => {
  const dir = path.dirname(OAUTH_CONFIG.tokenPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Leer tokens existentes si hay
  let existingTokens = {};
  if (fs.existsSync(OAUTH_CONFIG.tokenPath)) {
    existingTokens = JSON.parse(fs.readFileSync(OAUTH_CONFIG.tokenPath, 'utf8'));
  }

  // Merge con nuevos tokens (preservar refresh_token si no viene uno nuevo)
  const mergedTokens = {
    ...existingTokens,
    ...tokens,
    updated_at: new Date().toISOString()
  };

  // Si no hay refresh_token nuevo, mantener el existente
  if (!tokens.refresh_token && existingTokens.refresh_token) {
    mergedTokens.refresh_token = existingTokens.refresh_token;
  }

  fs.writeFileSync(OAUTH_CONFIG.tokenPath, JSON.stringify(mergedTokens, null, 2));
  console.log('✅ Tokens OAuth guardados');
  return mergedTokens;
};

/**
 * Lee los tokens guardados
 */
const loadTokens = () => {
  if (!fs.existsSync(OAUTH_CONFIG.tokenPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(OAUTH_CONFIG.tokenPath, 'utf8'));
  } catch (error) {
    console.error('Error leyendo tokens:', error);
    return null;
  }
};

/**
 * Genera la URL de autorización
 */
const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: OAUTH_CONFIG.scopes.join(' '),
    access_type: 'offline',  // Necesario para obtener refresh_token
    prompt: 'consent'        // Forzar consentimiento para obtener refresh_token
  });

  return `${OAUTH_CONFIG.authUrl}?${params.toString()}`;
};

/**
 * Intercambia el código de autorización por tokens
 */
const exchangeCodeForTokens = async (code) => {
  const response = await fetch(OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: OAUTH_CONFIG.redirectUri
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Error OAuth: ${data.error_description || data.error}`);
  }

  return saveTokens(data);
};

/**
 * Renueva el access token usando el refresh token
 */
const refreshAccessToken = async () => {
  const tokens = loadTokens();

  if (!tokens?.refresh_token) {
    throw new Error('No hay refresh token. Necesitas autorizar la aplicación primero.');
  }

  const response = await fetch(OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token'
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Error renovando token: ${data.error_description || data.error}`);
  }

  return saveTokens(data);
};

/**
 * Obtiene un access token válido (renovando si es necesario)
 */
const getValidAccessToken = async () => {
  let tokens = loadTokens();

  if (!tokens) {
    throw new Error('No hay tokens OAuth configurados. Visita /api/drive/oauth/authorize para autorizar.');
  }

  // Verificar si el token ha expirado (con margen de 5 minutos)
  const expiresAt = tokens.expires_at || 0;
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (now >= expiresAt - fiveMinutes) {
    console.log('🔄 Renovando access token...');
    tokens = await refreshAccessToken();

    // Calcular expires_at
    tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
    saveTokens(tokens);
  }

  return tokens.access_token;
};

/**
 * Verifica si OAuth está configurado
 */
const isOAuthConfigured = () => {
  return !!(OAUTH_CONFIG.clientId && OAUTH_CONFIG.clientSecret);
};

/**
 * Verifica si hay tokens válidos
 */
const hasValidTokens = () => {
  const tokens = loadTokens();
  return !!(tokens?.refresh_token);
};

module.exports = {
  OAUTH_CONFIG,
  saveTokens,
  loadTokens,
  getAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getValidAccessToken,
  isOAuthConfigured,
  hasValidTokens
};
