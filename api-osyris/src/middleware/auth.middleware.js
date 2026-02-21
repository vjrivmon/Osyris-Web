const jwt = require('jsonwebtoken');
// 🌐 DUAL SYSTEM: Usar database manager para ambos sistemas
const db = require('../config/db.config');

// Middleware para verificar el token
const verifyToken = async (req, res, next) => {
  try {
    // Obtener el token del encabezado authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'osyrisScoutGroup2024SecretKey');
    
    // Verificar si el usuario existe usando database manager
    const usuario = await db.getUserById(decoded.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'El usuario está desactivado'
      });
    }
    
    // Añadir el usuario y el payload del token a la solicitud
    req.usuario = usuario;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al verificar el token',
      error: error.message
    });
  }
};

// Middleware para verificar roles (soporta multi-rol via JWT)
// superadmin tiene acceso total siempre
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(500).json({
        success: false,
        message: 'Error en la autenticación'
      });
    }

    // Verificar contra array de roles del JWT, con fallback al rol único
    const userRoles = req.tokenPayload?.roles || [req.usuario.rol];

    // superadmin tiene acceso total siempre
    if (userRoles.includes('superadmin')) {
      return next();
    }

    const hasRole = roles.some(r => userRoles.includes(r));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a este recurso'
      });
    }

    next();
  };
};

// Middleware para verificar permisos granulares (sistema IAM)
const checkPermiso = (permiso) => {
  return async (req, res, next) => {
    if (!req.usuario) {
      return res.status(500).json({
        success: false,
        message: 'Error en la autenticación'
      });
    }

    // superadmin tiene acceso total siempre
    const userRoles = req.tokenPayload?.roles || [req.usuario.rol];
    if (userRoles.includes('superadmin')) {
      return next();
    }

    try {
      const permisos = await db.getUserPermisos(req.usuario.id);
      const tienePermiso = permisos.some(p => p.permiso === permiso);

      if (!tienePermiso) {
        return res.status(403).json({
          success: false,
          message: `No tienes el permiso '${permiso}' para realizar esta acción`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message
      });
    }
  };
};

// Middleware para requerir rol específico (más conveniente)
const requireRole = (roles) => {
  return [verifyToken, checkRole(roles)];
};

// Middleware específico para super admin
const requireSuperAdmin = [verifyToken, checkRole(['superadmin'])];

// Middleware para verificar si es super admin (sin bloquear)
const isSuperAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'superadmin') {
    req.isSuperAdmin = true;
  } else {
    req.isSuperAdmin = false;
  }
  next();
};

module.exports = {
  verifyToken,
  checkRole,
  checkPermiso,
  requireRole,
  requireSuperAdmin,
  isSuperAdmin,
  // Alias para compatibilidad
  authenticateToken: verifyToken
};
