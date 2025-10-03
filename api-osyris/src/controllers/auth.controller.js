const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

// 🏠 CONFIGURACIÓN CON DATABASE MANAGER MEJORADO
const db = require('../config/db.config');

// Importar modelo SQLite para verificación de contraseñas
const Usuario = require('../models/usuario.model');

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
  rol: Joi.string().valid('scouter', 'admin').required()
});

// Iniciar sesión
const login = async (req, res) => {
  try {
    console.log('🔐 Intento de login:', req.body.email);

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
    const usuario = await db.getUserByEmail(value.email);

    if (!usuario) {
      console.log('❌ Usuario no encontrado:', value.email);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña
    const validPassword = await Usuario.verifyPassword(value.password, usuario.password || usuario.contraseña);

    if (!validPassword) {
      console.log('❌ Contraseña incorrecta para:', value.email);
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    // Verificar si el usuario está activo
    if (usuario.activo === false || usuario.activo === 0) {
      return res.status(403).json({
        success: false,
        message: 'El usuario está desactivado'
      });
    }

    // Actualizar la fecha de último acceso
    try {
      await db.updateUser(usuario.id, {
        ultimo_acceso: new Date().toISOString()
      });
    } catch (updateError) {
      console.warn('⚠️ No se pudo actualizar último acceso:', updateError.message);
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || 'osyrisScoutGroup2024SecretKey',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('✅ Login exitoso:', value.email);

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
    console.error('❌ Error en login:', error);
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
    console.log('📝 Intento de registro:', req.body.email);

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
    const existingUser = await db.getUserByEmail(value.email);

    if (existingUser) {
      console.log('❌ Email ya registrado:', value.email);
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

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(value.password, 10);

    // Preparar datos del usuario
    const userData = {
      nombre: value.nombre,
      apellidos: value.apellidos,
      email: value.email,
      contraseña: hashedPassword,
      rol: value.rol,
      telefono: value.telefono,
      direccion: value.direccion,
      fecha_nacimiento: value.fecha_nacimiento,
      foto_perfil: value.foto_perfil,
      activo: true,
      fecha_registro: new Date().toISOString()
    };

    // Crear usuario
    const newUser = await db.createUser(userData);

    // Generar token JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        rol: newUser.rol
      },
      process.env.JWT_SECRET || 'osyrisScoutGroup2024SecretKey',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('✅ Registro exitoso:', value.email);

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
    console.error('❌ Error en registro:', error);
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
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Obtener datos actualizados del usuario
    const usuario = await db.getUserById(usuarioId);

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
    console.error('❌ Error al obtener perfil:', error);
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
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

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

    // Obtener usuario
    const usuario = await db.getUserById(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar la contraseña actual
    const validPassword = await Usuario.verifyPassword(
      currentPassword,
      usuario.password || usuario.contraseña
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    await db.updateUser(usuarioId, {
      contraseña: hashedPassword
    });

    console.log('✅ Contraseña actualizada para usuario:', usuarioId);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
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
    const issuedAt = new Date((tokenPayload?.iat || 0) * 1000);
    const expiresAt = new Date((tokenPayload?.exp || 0) * 1000);

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
    console.error('❌ Error al verificar autenticación:', error);
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