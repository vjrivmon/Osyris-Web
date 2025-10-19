// 🏠 CONFIGURACIÓN DUAL: SQLite / Supabase
const db = process.env.DATABASE_TYPE === 'supabase'
  ? require('../config/supabase.config')
  : require('../config/db.config');

// Importar modelo SQLite como fallback
const Usuario = require('../models/usuario.model');
const Joi = require('joi');

// Esquema de validación para la creación de usuarios
const usuarioSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nombre: Joi.string().required(),
  apellidos: Joi.string().required(),
  fecha_nacimiento: Joi.date(),
  telefono: Joi.string(),
  direccion: Joi.string(),
  foto_perfil: Joi.string(),
  rol: Joi.string().valid('scouter', 'admin').required(),
  activo: Joi.boolean()
});

// Esquema de validación para la actualización de usuarios
const usuarioUpdateSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(6),
  nombre: Joi.string(),
  apellidos: Joi.string(),
  fecha_nacimiento: Joi.date(),
  telefono: Joi.string(),
  direccion: Joi.string(),
  foto_perfil: Joi.string(),
  rol: Joi.string().valid('scouter', 'admin'),
  activo: Joi.boolean()
}).min(1); // Al menos un campo debe ser proporcionado

// Obtener todos los usuarios
const getAll = async (req, res) => {
  try {
    let usuarios;

    if (process.env.DATABASE_TYPE === 'supabase') {
      usuarios = await db.usuarios.getAll();
    } else {
      usuarios = await Usuario.findAll();
    }

    res.status(200).json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los usuarios',
      error: error.message
    });
  }
};

// Obtener un usuario por ID
const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`🔍 getById - Obteniendo usuario con ID: ${id}`);

    if (isNaN(id)) {
      console.log('❌ getById - ID inválido');
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }

    // Verificar que el usuario solo pueda ver su propia información (a menos que sea admin)
    console.log(`🔐 getById - Usuario autenticado: ${req.usuario.id} (${req.usuario.rol}), solicitando: ${id}`);
    if (req.usuario.rol !== 'admin' && req.usuario.id !== id) {
      console.log('❌ getById - Sin permisos');
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este usuario'
      });
    }

    let usuario;

    if (process.env.DATABASE_TYPE === 'supabase') {
      console.log('🔄 getById - Usando Supabase');
      try {
        usuario = await db.usuarios.getById(id);
      } catch (error) {
        if (error.message.includes('not found') || error.message.includes('PGRST116')) {
          usuario = null;
        } else {
          throw error;
        }
      }
    } else {
      // PostgreSQL o SQLite
      console.log('🔄 getById - Usando PostgreSQL/SQLite');
      console.log('🔄 getById - Llamando a db.getUserById...');
      usuario = await db.getUserById(id);
      console.log(`✅ getById - Usuario obtenido:`, usuario ? 'Encontrado' : 'No encontrado');
    }

    if (!usuario) {
      console.log('❌ getById - Usuario no encontrado en BD');
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }

    console.log('✅ getById - Enviando respuesta exitosa');
    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('❌ getById - Error capturado:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario',
      error: error.message
    });
  }
};

// Crear un nuevo usuario
const create = async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = usuarioSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de usuario inválidos',
        error: error.details[0].message
      });
    }
    
    // Verificar si el email ya existe usando configuración dual
    let existingUser;

    if (process.env.DATABASE_TYPE === 'supabase') {
      try {
        existingUser = await db.usuarios.getByEmail(value.email);
      } catch (error) {
        if (error.message.includes('not found') || error.message.includes('PGRST116')) {
          existingUser = null;
        } else {
          throw error;
        }
      }
    } else {
      existingUser = await Usuario.findByEmail(value.email);
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario usando configuración dual
    let newUser;

    if (process.env.DATABASE_TYPE === 'supabase') {
      // Para Supabase, necesitamos hashear la contraseña primero
      const bcrypt = require('bcryptjs');
      value.password = await bcrypt.hash(value.password, 10);
      newUser = await db.usuarios.create(value);
    } else {
      newUser = await Usuario.create(value);
    }
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el usuario',
      error: error.message
    });
  }
};

// Actualizar un usuario existente
const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }

    // Verificar que el usuario solo pueda actualizar su propia información (a menos que sea admin)
    if (req.usuario.rol !== 'admin' && req.usuario.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar este usuario'
      });
    }

    // Verificar que el usuario existe usando configuración dual
    let usuario;

    if (process.env.DATABASE_TYPE === 'supabase') {
      try {
        usuario = await db.usuarios.getById(id);
      } catch (error) {
        if (error.message.includes('not found') || error.message.includes('PGRST116')) {
          usuario = null;
        } else {
          throw error;
        }
      }
    } else {
      // PostgreSQL o SQLite
      usuario = await db.getUserById(id);
    }

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }

    // Validar datos de entrada
    const { error, value } = usuarioUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de usuario inválidos',
        error: error.details[0].message
      });
    }
    
    // Si se intenta actualizar el email, verificar que no esté en uso
    if (value.email && value.email !== usuario.email) {
      let existingUser;

      if (process.env.DATABASE_TYPE === 'supabase') {
        try {
          existingUser = await db.usuarios.getByEmail(value.email);
        } catch (error) {
          if (error.message.includes('not found') || error.message.includes('PGRST116')) {
            existingUser = null;
          } else {
            throw error;
          }
        }
      } else {
        existingUser = await Usuario.findByEmail(value.email);
      }

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Actualizar usuario usando configuración dual
    let updatedUser;

    if (process.env.DATABASE_TYPE === 'supabase') {
      // Si se está actualizando la contraseña, necesitamos hashearla
      if (value.password) {
        const bcrypt = require('bcryptjs');
        value.password = await bcrypt.hash(value.password, 10);
      }
      updatedUser = await db.usuarios.update(id, value);
    } else {
      // PostgreSQL o SQLite
      // Si se está actualizando la contraseña, necesitamos hashearla
      if (value.password) {
        const bcrypt = require('bcryptjs');
        value.password = await bcrypt.hash(value.password, 10);
      }
      updatedUser = await db.updateUser(id, value);
    }
    
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario',
      error: error.message
    });
  }
};

// Eliminar un usuario
const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    
    // Verificar que el usuario existe usando configuración dual
    let usuario;

    if (process.env.DATABASE_TYPE === 'supabase') {
      try {
        usuario = await db.usuarios.getById(id);
      } catch (error) {
        if (error.message.includes('not found') || error.message.includes('PGRST116')) {
          usuario = null;
        } else {
          throw error;
        }
      }
    } else {
      usuario = await Usuario.findById(id);
    }

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }

    // Eliminar usuario usando configuración dual
    let deleted;

    if (process.env.DATABASE_TYPE === 'supabase') {
      await db.usuarios.delete(id);
      deleted = true; // Supabase no devuelve el número de filas afectadas de la misma manera
    } else {
      deleted = await Usuario.remove(id);
    }

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo eliminar el usuario'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario',
      error: error.message
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
}; 