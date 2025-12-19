const Confirmacion = require('../models/confirmaciones.model');
const Familiar = require('../models/familiar.model');
const Joi = require('joi');
const AsistenciaService = require('../services/asistencia-sheets.service');
const NotificacionScouterModel = require('../models/notificaciones_scouter.model');
const { query } = require('../config/db.config');

// Esquema de validación para la creación/actualización de confirmaciones
const confirmacionSchema = Joi.object({
  actividad_id: Joi.number().integer().required(),
  scout_id: Joi.number().integer().required(),
  asistira: Joi.boolean().required(),
  comentarios: Joi.string().allow('').optional() // Permitir string vacío
});

// Esquema de validación para actualización de confirmaciones
const confirmacionUpdateSchema = Joi.object({
  asistira: Joi.boolean().optional(),
  comentarios: Joi.string().allow('').optional() // Permitir string vacío
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

    // Determinar sección a filtrar:
    // - Si es scouter, usar su sección automáticamente
    // - Si es admin, puede ver todas o filtrar por seccion_id específica
    let seccionFiltro = seccion_id ? parseInt(seccion_id) : null;
    if (req.usuario.rol === 'scouter' && req.usuario.seccion_id) {
      seccionFiltro = req.usuario.seccion_id;
    }

    const options = {
      solo_asistiran: solo_asistiran === 'true',
      solo_no_asistiran: solo_no_asistiran === 'true',
      seccion_id: seccionFiltro
    };

    // Obtener confirmaciones existentes
    const confirmaciones = await Confirmacion.findByActividadId(actividadId, options);

    // Obtener educandos que aún no han confirmado (pendientes)
    const scoutsSinConfirmar = await Confirmacion.getEducandosSinConfirmar(actividadId, seccionFiltro);

    // Calcular estadísticas
    const asisten = confirmaciones.filter(c => c.estado === 'confirmado').length;
    const noAsisten = confirmaciones.filter(c => c.estado === 'no_asiste').length;
    const pendientes = scoutsSinConfirmar.length;

    res.status(200).json({
      success: true,
      data: {
        confirmaciones: confirmaciones,
        scouts_sin_confirmar: scoutsSinConfirmar,
        estadisticas: {
          asisten,
          noAsisten,
          pendientes,
          total: asisten + noAsisten + pendientes
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener confirmaciones de actividad:', error);
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
    // IMPORTANTE: El frontend envía 'scout_id' pero la BD usa 'educando_id'
    const confirmacionData = {
      actividad_id: value.actividad_id,
      educando_id: value.scout_id,  // Mapear scout_id a educando_id
      asistira: value.asistira,
      comentarios: value.comentarios,
      familiar_id: familiarId,
      confirmado_por: familiarId
    };

    const confirmacion = await Confirmacion.createOrUpdate(confirmacionData);

    // Actualizar spreadsheet de asistencia en Google Drive
    try {
      await AsistenciaService.updateAsistenciaEducando(
        value.actividad_id,
        value.scout_id,
        value.asistira ? 'confirmado' : 'no_asiste',
        value.comentarios || ''
      );
      console.log(`📊 Asistencia actualizada en Google Sheets para educando ${value.scout_id}`);
    } catch (sheetsError) {
      // Log pero no fallar la operación principal
      console.error('⚠️ Error actualizando Google Sheets (no bloquea):', sheetsError.message);
    }

    // Crear notificacion para scouters de la seccion
    try {
      const educandoResult = await query(`
        SELECT e.nombre, e.apellidos, e.seccion_id, s.nombre as seccion_nombre,
               a.titulo as actividad_titulo, a.tipo as actividad_tipo
        FROM educandos e
        LEFT JOIN secciones s ON e.seccion_id = s.id
        LEFT JOIN actividades a ON a.id = $2
        WHERE e.id = $1
      `, [value.scout_id, value.actividad_id]);

      if (educandoResult.length > 0) {
        const { nombre, apellidos, seccion_id, seccion_nombre, actividad_titulo, actividad_tipo } = educandoResult[0];
        const accion = value.asistira ? 'ha confirmado asistencia' : 'ha indicado que no asistira';
        const tipoNotif = value.asistira ? 'confirmacion_sabado' : 'cancelacion_sabado';

        await NotificacionScouterModel.crearParaSeccion({
          educando_id: value.scout_id,
          educando_nombre: `${nombre} ${apellidos}`,
          seccion_id: seccion_id,
          tipo: tipoNotif,
          titulo: `${nombre} ${apellidos} ${accion}`,
          mensaje: `La familia ${accion} a "${actividad_titulo || 'la reunion'}".${value.comentarios ? ` Comentario: ${value.comentarios}` : ''}`,
          enlace_accion: '/aula-virtual',
          prioridad: 'normal',
          metadata: {
            actividad_id: value.actividad_id,
            asistira: value.asistira,
            actividad_tipo: actividad_tipo
          }
        });
        console.log(`🔔 Notificacion creada para scouters de seccion ${seccion_nombre}`);
      }
    } catch (notifError) {
      console.error('⚠️ Error creando notificacion (no bloquea):', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Confirmacion guardada correctamente',
      data: confirmacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al guardar la confirmacion',
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
    // IMPORTANTE: La BD usa 'educando_id', no 'scout_id'
    const updateData = {
      actividad_id: confirmacion.actividad_id,
      educando_id: confirmacion.educando_id,  // Usar educando_id del modelo
      familiar_id: confirmacion.familiar_id,
      confirmado_por: req.usuario.id,
      ...value
    };

    const updatedConfirmacion = await Confirmacion.createOrUpdate(updateData);

    // Actualizar spreadsheet de asistencia en Google Drive
    try {
      const estadoSheets = value.asistira !== undefined
        ? (value.asistira ? 'confirmado' : 'no_asiste')
        : (confirmacion.asistira ? 'confirmado' : 'no_asiste');

      await AsistenciaService.updateAsistenciaEducando(
        confirmacion.actividad_id,
        confirmacion.educando_id,
        estadoSheets,
        value.comentarios || confirmacion.comentarios || ''
      );
      console.log(`📊 Asistencia modificada en Google Sheets para educando ${confirmacion.educando_id}`);
    } catch (sheetsError) {
      console.error('⚠️ Error actualizando Google Sheets (no bloquea):', sheetsError.message);
    }

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

    // Guardar datos antes de eliminar para actualizar el spreadsheet
    const actividadId = confirmacion.actividad_id;
    const educandoId = confirmacion.educando_id;

    const deleted = await Confirmacion.remove(id, familiarId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo eliminar la confirmación'
      });
    }

    // Actualizar spreadsheet: volver a estado "Pendiente"
    try {
      await AsistenciaService.updateAsistenciaEducando(
        actividadId,
        educandoId,
        'pendiente', // Volver a pendiente
        '' // Limpiar comentario
      );
      console.log(`📊 Asistencia revertida a Pendiente en Google Sheets para educando ${educandoId}`);
    } catch (sheetsError) {
      console.error('⚠️ Error actualizando Google Sheets (no bloquea):', sheetsError.message);
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