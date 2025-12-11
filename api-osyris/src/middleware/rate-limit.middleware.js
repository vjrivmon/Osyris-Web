/**
 * Middleware de Rate Limiting para endpoints públicos
 * Osyris Scout Management System
 *
 * Protección anti-spam simple usando Map en memoria
 * Sin dependencias externas (Redis, etc.)
 */

// Almacén en memoria para tracking de IPs
const ipRequestMap = new Map();

// Configuración
const RATE_LIMIT_CONFIG = {
  // Número máximo de requests por ventana de tiempo
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 3,

  // Ventana de tiempo en milisegundos (10 minutos)
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,

  // Intervalo de limpieza de entradas antiguas (1 hora)
  CLEANUP_INTERVAL_MS: 60 * 60 * 1000
};

/**
 * Obtiene la IP real del cliente (considerando proxies)
 * @param {Object} req - Express request
 * @returns {string} IP del cliente
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown';
}

/**
 * Limpia entradas antiguas del mapa
 */
function cleanupOldEntries() {
  const now = Date.now();

  for (const [ip, data] of ipRequestMap.entries()) {
    if (now - data.windowStart > RATE_LIMIT_CONFIG.WINDOW_MS) {
      ipRequestMap.delete(ip);
    }
  }
}

// Programar limpieza periódica
setInterval(cleanupOldEntries, RATE_LIMIT_CONFIG.CLEANUP_INTERVAL_MS);

/**
 * Middleware de rate limiting para formulario de contacto
 * Limita a MAX_REQUESTS por IP cada WINDOW_MS
 */
function contactRateLimit(req, res, next) {
  const ip = getClientIP(req);
  const now = Date.now();

  // Obtener o crear registro para esta IP
  let ipData = ipRequestMap.get(ip);

  if (!ipData) {
    // Primera petición de esta IP
    ipData = {
      count: 1,
      windowStart: now
    };
    ipRequestMap.set(ip, ipData);
    return next();
  }

  // Verificar si la ventana de tiempo ha expirado
  if (now - ipData.windowStart > RATE_LIMIT_CONFIG.WINDOW_MS) {
    // Reiniciar contador
    ipData.count = 1;
    ipData.windowStart = now;
    ipRequestMap.set(ip, ipData);
    return next();
  }

  // Incrementar contador
  ipData.count++;
  ipRequestMap.set(ip, ipData);

  // Verificar si se excedió el límite
  if (ipData.count > RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil(
      (RATE_LIMIT_CONFIG.WINDOW_MS - (now - ipData.windowStart)) / 1000
    );

    console.warn(`⚠️ Rate limit excedido para IP: ${ip}`);

    return res.status(429).json({
      success: false,
      error: 'rate_limit_exceeded',
      message: 'Has enviado demasiados mensajes. Por favor, espera unos minutos antes de intentarlo de nuevo.',
      retryAfter: retryAfterSeconds,
      limit: RATE_LIMIT_CONFIG.MAX_REQUESTS,
      windowMinutes: RATE_LIMIT_CONFIG.WINDOW_MS / 60000
    });
  }

  next();
}

/**
 * Obtiene el número de requests restantes para una IP
 * @param {string} ip - IP del cliente
 * @returns {number} Requests restantes
 */
function getRemainingRequests(ip) {
  const ipData = ipRequestMap.get(ip);

  if (!ipData) {
    return RATE_LIMIT_CONFIG.MAX_REQUESTS;
  }

  const now = Date.now();

  if (now - ipData.windowStart > RATE_LIMIT_CONFIG.WINDOW_MS) {
    return RATE_LIMIT_CONFIG.MAX_REQUESTS;
  }

  return Math.max(0, RATE_LIMIT_CONFIG.MAX_REQUESTS - ipData.count);
}

/**
 * Middleware para añadir headers de rate limit
 */
function rateLimitHeaders(req, res, next) {
  const ip = getClientIP(req);
  const remaining = getRemainingRequests(ip);

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_CONFIG.MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Window-Minutes', RATE_LIMIT_CONFIG.WINDOW_MS / 60000);

  next();
}

module.exports = {
  contactRateLimit,
  rateLimitHeaders,
  getClientIP,
  getRemainingRequests,
  RATE_LIMIT_CONFIG
};
