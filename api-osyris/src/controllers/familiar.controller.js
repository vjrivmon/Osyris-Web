const Familiar = require('../models/familiar.model');
const Joi = require('joi');

// Esquema de validación para la creación de relaciones familiares
const familiarScoutSchema = Joi.object({
  familiar_id: Joi.number().integer().required(),
  scout_id: Joi.number().integer().required(),
  relacion: Joi.string().valid('padre', 'madre', 'tutor_legal', 'abuelo', 'otro').required(),
  es_contacto_principal: Joi.boolean().default(false)
});

// Esquema de validación para la actualización de relaciones familiares
const familiarScoutUpdateSchema = Joi.object({
  relacion: Joi.string().valid('padre', 'madre', 'tutor_legal', 'abuelo', 'otro'),
  es_contacto_principal: Joi.boolean()
}).min(1);

// Obtener todos los scouts de un familiar autenticado
const getScoutsByFamiliar = async (req, res) => {
  try {
    const familiarId = req.usuario.id;

    const scouts = await Familiar.findByFamiliarId(familiarId);

    res.status(200).json({
      success: true,
      data: scouts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los scouts del familiar',
      error: error.message
    });
  }
};

// Obtener familiares de un scout (para administradores y scouters)
const getFamiliaresByScout = async (req, res) => {
  try {
    const scoutId = parseInt(req.params.scoutId);

    if (isNaN(scoutId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de scout inválido'
      });
    }

    // Solo admins y scouters pueden ver todos los familiares de un scout
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta información'
      });
    }

    const familiares = await Familiar.findByScoutId(scoutId);

    res.status(200).json({
      success: true,
      data: familiares
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los familiares del scout',
      error: error.message
    });
  }
};

// Obtener una relación específica
const getRelacionById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de relación inválido'
      });
    }

    let relacion = await Familiar.findById(id);

    if (!relacion) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    // Verificar permisos: el familiar solo puede ver sus propias relaciones
    if (req.usuario.rol === 'familia' && relacion.familiar_id !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta relación'
      });
    }

    res.status(200).json({
      success: true,
      data: relacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la relación',
      error: error.message
    });
  }
};

// Crear una nueva relación familiar (solo admins y scouters)
const createRelacion = async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = familiarScoutSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de relación inválidos',
        error: error.details[0].message
      });
    }

    // Solo admins y scouters pueden crear relaciones
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear relaciones familiares'
      });
    }

    // Verificar si ya existe la relación
    const existente = await Familiar.findByFamiliarAndScout(value.familiar_id, value.scout_id);
    if (existente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una relación entre este familiar y scout'
      });
    }

    const newRelacion = await Familiar.create(value);

    res.status(201).json({
      success: true,
      message: 'Relación familiar creada correctamente',
      data: newRelacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la relación familiar',
      error: error.message
    });
  }
};

// Actualizar una relación existente
const updateRelacion = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de relación inválido'
      });
    }

    // Verificar que la relación existe
    const relacion = await Familiar.findById(id);
    if (!relacion) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    // Validar datos de entrada
    const { error, value } = familiarScoutUpdateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de relación inválidos',
        error: error.details[0].message
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'familia' && relacion.familiar_id !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar esta relación'
      });
    }

    // Solo admins y scouters pueden cambiar la relación (padre/madre/etc)
    if (req.usuario.rol === 'familia' && value.relacion) {
      delete value.relacion;
    }

    const updatedRelacion = await Familiar.update(id, value);

    res.status(200).json({
      success: true,
      message: 'Relación actualizada correctamente',
      data: updatedRelacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la relación',
      error: error.message
    });
  }
};

// Eliminar una relación (solo admins y scouters)
const deleteRelacion = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de relación inválido'
      });
    }

    // Solo admins y scouters pueden eliminar relaciones
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar relaciones familiares'
      });
    }

    // Verificar que la relación existe
    const relacion = await Familiar.findById(id);
    if (!relacion) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    const deleted = await Familiar.remove(id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo eliminar la relación'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Relación eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la relación',
      error: error.message
    });
  }
};

// Establecer contacto principal
const setContactoPrincipal = async (req, res) => {
  try {
    const { familiar_id, scout_id, es_contacto_principal } = req.body;

    // Validar datos de entrada
    const schema = Joi.object({
      familiar_id: Joi.number().integer().required(),
      scout_id: Joi.number().integer().required(),
      es_contacto_principal: Joi.boolean().required()
    });

    const { error, value } = schema.validate({ familiar_id, scout_id, es_contacto_principal });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        error: error.details[0].message
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'familia' && familiar_id !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta información'
      });
    }

    // Solo admins y scouters pueden cambiar relaciones de otros familiares
    if (req.usuario.rol === 'familia') {
      // Verificar que el familiar tiene acceso al scout
      const tieneAcceso = await Familiar.verificarAcceso(familiar_id, scout_id);
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este scout'
        });
      }
    }

    const updatedRelacion = await Familiar.setContactoPrincipal(familiar_id, scout_id, es_contacto_principal);

    res.status(200).json({
      success: true,
      message: 'Contacto principal actualizado correctamente',
      data: updatedRelacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contacto principal',
      error: error.message
    });
  }
};

// Obtener contactos principales de un scout
const getContactosPrincipales = async (req, res) => {
  try {
    const scoutId = parseInt(req.params.scoutId);

    if (isNaN(scoutId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de scout inválido'
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'familia') {
      // Verificar que el familiar tiene acceso al scout
      const tieneAcceso = await Familiar.verificarAcceso(req.usuario.id, scoutId);
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este scout'
        });
      }
    }

    const contactos = await Familiar.getContactosPrincipales(scoutId);

    res.status(200).json({
      success: true,
      data: contactos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener contactos principales',
      error: error.message
    });
  }
};

// Verificar acceso de un familiar a un scout (endpoint interno)
const verificarAcceso = async (req, res) => {
  try {
    const { familiar_id, scout_id } = req.params;

    const tieneAcceso = await Familiar.verificarAcceso(
      parseInt(familiar_id),
      parseInt(scout_id)
    );

    res.status(200).json({
      success: true,
      tieneAcceso
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar acceso',
      error: error.message
    });
  }
};

module.exports = {
  getScoutsByFamiliar,
  getFamiliaresByScout,
  getRelacionById,
  createRelacion,
  updateRelacion,
  deleteRelacion,
  setContactoPrincipal,
  getContactosPrincipales,
  verificarAcceso
};