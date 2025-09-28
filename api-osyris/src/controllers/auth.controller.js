const jwt = require('jsonwebtoken');
const Joi = require('joi');
// 🚀 MIGRACIÓN A SUPABASE: Cambiar modelo
const Usuario = require('../models/usuario.model.supabase');

// Esquema de validación para el login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Esquema de validación para el registro
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nombre: Joi.string().required(),
  apellidos: Joi.string().required(),
  fecha_nacimiento: Joi.date(),
  telefono: Joi.string(),
  direccion: Joi.string(),
  foto_perfil: Joi.string(),
  rol: Joi.string().valid('scouter').required()
});

// Iniciar sesión
const login = async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de inicio de sesión inválidos',
        error: error.details[0].message
      });
    }
    
    // Buscar usuario por email
    const usuario = await Usuario.findByEmail(value.email);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar contraseña
    const validPassword = await Usuario.verifyPassword(value.password, usuario.password);
    
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'El usuario está desactivado'
      });
    }
    
    // Actualizar la fecha de último acceso
    await Usuario.updateLastAccess(usuario.id);
    
    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'osyrisScoutGroup2024SecretKey',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          rol: usuario.rol,
          foto_perfil: usuario.foto_perfil
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// Registrar un nuevo usuario
const register = async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = registerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de registro inválidos',
        error: error.details[0].message
      });
    }
    
    // Verificar si el email ya existe
    const existingUser = await Usuario.findByEmail(value.email);
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Restringir la creación de usuarios admin
    if (value.rol === 'admin' && (!req.usuario || req.usuario.rol !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para crear usuarios administradores'
      });
    }
    
    // Crear usuario
    value.activo = true;
    const newUser = await Usuario.create(value);
    
    // Generar token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, rol: newUser.rol },
      process.env.JWT_SECRET || 'osyrisScoutGroup2024SecretKey',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        token,
        usuario: {
          id: newUser.id,
          email: newUser.email,
          nombre: newUser.nombre,
          apellidos: newUser.apellidos,
          rol: newUser.rol
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// Obtener el perfil del usuario actual
const profile = async (req, res) => {
  try {
    const usuario = req.usuario;
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        fecha_nacimiento: usuario.fecha_nacimiento,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        foto_perfil: usuario.foto_perfil,
        rol: usuario.rol,
        fecha_registro: usuario.fecha_registro,
        ultimo_acceso: usuario.ultimo_acceso
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil',
      error: error.message
    });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren la contraseña actual y la nueva'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }
    
    const usuario = await Usuario.findById(req.usuario.id);
    
    // Verificar la contraseña actual
    const validPassword = await Usuario.verifyPassword(currentPassword, usuario.password);
    
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }
    
    // Actualizar la contraseña
    await Usuario.update(usuario.id, { password: newPassword });
    
    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar la contraseña',
      error: error.message
    });
  }
};

// Verificar autenticación (endpoint simple para verificar tokens)
const verifyAuth = async (req, res) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario no encontrado'
      });
    }

    // Obtener información del token
    const tokenPayload = req.tokenPayload;
    const issuedAt = new Date(tokenPayload.iat * 1000);
    const expiresAt = new Date(tokenPayload.exp * 1000);

    res.status(200).json({
      success: true,
      message: 'Token válido',
      data: {
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          rol: usuario.rol,
          activo: usuario.activo
        },
        tokenInfo: {
          issuedAt: issuedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          timeToExpire: Math.max(0, Math.floor((expiresAt - new Date()) / 1000))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar la autenticación',
      error: error.message
    });
  }
};


module.exports = {
  login,
  register,
  profile,
  changePassword,
  verifyAuth
}; 