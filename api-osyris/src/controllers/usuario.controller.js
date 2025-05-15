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
  tipo_usuario: Joi.string().valid('educando', 'familiar', 'monitor', 'admin').required(),
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
  tipo_usuario: Joi.string().valid('educando', 'familiar', 'monitor', 'admin'),
  activo: Joi.boolean()
}).min(1); // Al menos un campo debe ser proporcionado

// Obtener todos los usuarios
const getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
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
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    
    const usuario = await Usuario.findById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }
    
    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
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
    
    // Verificar si el email ya existe
    const existingUser = await Usuario.findByEmail(value.email);
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    const newUser = await Usuario.create(value);
    
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
    
    // Verificar que el usuario existe
    const usuario = await Usuario.findById(id);
    
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
      const existingUser = await Usuario.findByEmail(value.email);
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }
    
    const updatedUser = await Usuario.update(id, value);
    
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
    
    // Verificar que el usuario existe
    const usuario = await Usuario.findById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }
    
    const deleted = await Usuario.remove(id);
    
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