const Seccion = require('../models/seccion.model');
const Joi = require('joi');

// Esquema de validación para la creación de secciones
const seccionSchema = Joi.object({
  nombre: Joi.string().required(),
  rango_edad: Joi.string(),
  color: Joi.string(),
  descripcion: Joi.string(),
  icono: Joi.string()
});

// Esquema de validación para la actualización de secciones
const seccionUpdateSchema = Joi.object({
  nombre: Joi.string(),
  rango_edad: Joi.string(),
  color: Joi.string(),
  descripcion: Joi.string(),
  icono: Joi.string()
}).min(1); // Al menos un campo debe ser proporcionado

// Obtener todas las secciones
const getAll = async (req, res) => {
  try {
    const secciones = await Seccion.findAll();
    res.status(200).json({
      success: true,
      data: secciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las secciones',
      error: error.message
    });
  }
};

// Obtener una sección por ID
const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de sección inválido'
      });
    }
    
    const seccion = await Seccion.findById(id);
    
    if (!seccion) {
      return res.status(404).json({
        success: false,
        message: `Sección con ID ${id} no encontrada`
      });
    }
    
    res.status(200).json({
      success: true,
      data: seccion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la sección',
      error: error.message
    });
  }
};

// Crear una nueva sección
const create = async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = seccionSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de sección inválidos',
        error: error.details[0].message
      });
    }
    
    const newSeccion = await Seccion.create(value);
    
    res.status(201).json({
      success: true,
      message: 'Sección creada correctamente',
      data: newSeccion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la sección',
      error: error.message
    });
  }
};

// Actualizar una sección existente
const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de sección inválido'
      });
    }
    
    // Verificar que la sección existe
    const seccion = await Seccion.findById(id);
    
    if (!seccion) {
      return res.status(404).json({
        success: false,
        message: `Sección con ID ${id} no encontrada`
      });
    }
    
    // Validar datos de entrada
    const { error, value } = seccionUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de sección inválidos',
        error: error.details[0].message
      });
    }
    
    const updatedSeccion = await Seccion.update(id, value);
    
    res.status(200).json({
      success: true,
      message: 'Sección actualizada correctamente',
      data: updatedSeccion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la sección',
      error: error.message
    });
  }
};

// Eliminar una sección
const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de sección inválido'
      });
    }
    
    // Verificar que la sección existe
    const seccion = await Seccion.findById(id);
    
    if (!seccion) {
      return res.status(404).json({
        success: false,
        message: `Sección con ID ${id} no encontrada`
      });
    }
    
    const deleted = await Seccion.remove(id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo eliminar la sección'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Sección eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la sección',
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