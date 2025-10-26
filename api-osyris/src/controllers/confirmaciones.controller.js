const Confirmacion = require('../models/confirmaciones.model');
const Familiar = require('../models/familiar.model');
const Joi = require('joi');

// Esquema de validación para la creación/actualización de confirmaciones
const confirmacionSchema = Joi.object({
  actividad_id: Joi.number().integer().required(),
  scout_id: Joi.number().integer().required(),
  asistira: Joi.boolean().required(),
  comentarios: Joi.string().optional()
});

// Esquema de validación para actualización de confirmaciones
const confirmacionUpdateSchema = Joi.object({
  asistira: Joi.boolean().optional(),
  comentarios: Joi.string().optional()
}).min(1);

// Obtener todas las confirmaciones de un familiar
const getConfirmacionesByFamiliar = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const {
      scout_id,
      asistira,
      estado_actividad,
      fecha_desde,
      fecha_hasta,
      limit = 50
    } = req.query;

    const options = {
      scout_id: scout_id ? parseInt(scout_id) : null,
      asistira: asistira !== undefined ? asistira === 'true' : undefined,
      estado_actividad,
      fecha_desde,
      fecha_hasta,
      limit: parseInt(limit)
    };

    const confirmaciones = await Confirmacion.findByFamiliarId(familiarId, options);

    res.status(200).json({
      success: true,
      data: confirmaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las confirmaciones',
      error: error.message
    });
  }
};

// Obtener confirmaciones de una actividad
const getConfirmacionesByActividad = async (req, res) => {
  try {
    const actividadId = parseInt(req.params.actividadId);
    const { solo_asistiran, solo_no_asistiran, seccion_id } = req.query;

    if (isNaN(actividadId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de actividad inválido'
      });
    }

    // Solo admins y scouters pueden ver todas las confirmaciones de una actividad
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta información'
      });
    }

    const options = {
      solo_asistiran: solo_asistiran === 'true',
      solo_no_asistiran: solo_no_asistiran === 'true',
      seccion_id: seccion_id ? parseInt(seccion_id) : null
    };

    const confirmaciones = await Confirmacion.findByActividadId(actividadId, options);

    res.status(200).json({
      success: true,
      data: confirmaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las confirmaciones de la actividad',
      error: error.message
    });
  }
};

// Obtener confirmaciones de un scout específico
const getConfirmacionesByScout = async (req, res) => {
  try {
    const scoutId = parseInt(req.params.scoutId);
    const familiarId = req.usuario.id;
    const { fecha_desde, fecha_hasta, limit = 50 } = req.query;

    if (isNaN(scoutId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de scout inválido'
      });
    }

    // Verificar que el familiar tiene acceso al scout
    const tieneAcceso = await Familiar.verificarAcceso(familiarId, scoutId);
    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este scout'
      });
    }

    const options = {
      fecha_desde,
      fecha_hasta,
      limit: parseInt(limit)
    };

    const confirmaciones = await Confirmacion.findByScoutId(scoutId, options);

    res.status(200).json({
      success: true,
      data: confirmaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las confirmaciones del scout',
      error: error.message
    });
  }
};

// Obtener una confirmación específica
const getConfirmacionById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de confirmación inválido'
      });
    }

    const confirmacion = await Confirmacion.findById(id, familiarId);

    if (!confirmacion) {
      return res.status(404).json({
        success: false,
        message: 'Confirmación no encontrada'
      });
    }

    // Verificar que la confirmación pertenece al familiar
    if (confirmacion.familiar_id !== familiarId && !['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta confirmación'
      });
    }

    res.status(200).json({
      success: true,
      data: confirmacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la confirmación',
      error: error.message
    });
  }
};

// Crear o actualizar una confirmación
const createOrUpdateConfirmacion = async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = confirmacionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de confirmación inválidos',
        error: error.details[0].message
      });
    }

    const familiarId = req.usuario.id;

    // Verificar que el familiar tiene acceso al scout
    const tieneAcceso = await Familiar.verificarAcceso(familiarId, value.scout_id);
    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este scout'
      });
    }

    // Agregar el familiar_id y el usuario que confirma
    const confirmacionData = {
      ...value,
      familiar_id: familiarId,
      confirmado_por: familiarId
    };

    const confirmacion = await Confirmacion.createOrUpdate(confirmacionData);

    res.status(201).json({
      success: true,
      message: 'Confirmación guardada correctamente',
      data: confirmacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al guardar la confirmación',
      error: error.message
    });
  }
};

// Actualizar una confirmación existente
const updateConfirmacion = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de confirmación inválido'
      });
    }

    // Verificar que la confirmación existe y pertenece al familiar
    const confirmacion = await Confirmacion.findById(id, familiarId);
    if (!confirmacion) {
      return res.status(404).json({
        success: false,
        message: 'Confirmación no encontrada'
      });
    }

    if (confirmacion.familiar_id !== familiarId && !['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar esta confirmación'
      });
    }

    // Validar datos de entrada
    const { error, value } = confirmacionUpdateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de confirmación inválidos',
        error: error.details[0].message
      });
    }

    // Preparar datos para actualización
    const updateData = {
      actividad_id: confirmacion.actividad_id,
      scout_id: confirmacion.scout_id,
      familiar_id: confirmacion.familiar_id,
      confirmado_por: req.usuario.id,
      ...value
    };

    const updatedConfirmacion = await Confirmacion.createOrUpdate(updateData);

    res.status(200).json({
      success: true,
      message: 'Confirmación actualizada correctamente',
      data: updatedConfirmacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la confirmación',
      error: error.message
    });
  }
};

// Eliminar una confirmación
const deleteConfirmacion = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de confirmación inválido'
      });
    }

    // Verificar que la confirmación existe
    const confirmacion = await Confirmacion.findById(id, familiarId);
    if (!confirmacion) {
      return res.status(404).json({
        success: false,
        message: 'Confirmación no encontrada'
      });
    }

    // Solo el familiar que creó la confirmación o un admin puede eliminarla
    if (confirmacion.familiar_id !== familiarId && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta confirmación'
      });
    }

    const deleted = await Confirmacion.remove(id, familiarId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo eliminar la confirmación'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Confirmación eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la confirmación',
      error: error.message
    });
  }
};

// Obtener estadísticas de asistencia de una actividad
const getEstadisticasActividad = async (req, res) => {
  try {
    const actividadId = parseInt(req.params.actividadId);

    if (isNaN(actividadId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de actividad inválido'
      });
    }

    // Solo admins y scouters pueden ver estadísticas
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver estadísticas'
      });
    }

    const estadisticas = await Confirmacion.getEstadisticasActividad(actividadId);

    res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las estadísticas',
      error: error.message
    });
  }
};

// Obtener actividades próximas que requieren confirmación
const getActividadesPendientes = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const { dias = 30 } = req.query;

    const actividades = await Confirmacion.getActividadesPendientesConfirmacion(
      familiarId,
      parseInt(dias)
    );

    res.status(200).json({
      success: true,
      data: actividades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las actividades pendientes',
      error: error.message
    });
  }
};

// Obtener confirmaciones por rango de fechas
const getConfirmacionesByRangoFechas = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren las fechas de inicio y fin'
      });
    }

    const confirmaciones = await Confirmacion.findByRangoFechas(
      familiarId,
      fecha_inicio,
      fecha_fin
    );

    res.status(200).json({
      success: true,
      data: confirmaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las confirmaciones por rango de fechas',
      error: error.message
    });
  }
};

module.exports = {
  getConfirmacionesByFamiliar,
  getConfirmacionesByActividad,
  getConfirmacionesByScout,
  getConfirmacionById,
  createOrUpdateConfirmacion,
  updateConfirmacion,
  deleteConfirmacion,
  getEstadisticasActividad,
  getActividadesPendientes,
  getConfirmacionesByRangoFechas
};