const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');

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
    
    // Verificar si el usuario existe
    const usuario = await Usuario.findById(decoded.id);
    
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

// Middleware para verificar roles
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(500).json({
        success: false,
        message: 'Error en la autenticación'
      });
    }
    
    const hasRole = roles.includes(req.usuario.rol);
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a este recurso'
      });
    }
    
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole
}; 