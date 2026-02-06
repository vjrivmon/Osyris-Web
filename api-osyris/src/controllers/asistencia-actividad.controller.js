/**
 * Controller: Control de Asistencia In-Situ
 * Issue #6
 * 
 * Endpoints para pasar lista en campamentos y salidas
 */

const asistenciaModel = require('../models/asistencia-actividad.model');
const actividadModel = require('../models/actividad.model');

/**
 * GET /api/asistencia/:actividadId
 * Obtener lista de asistencia para una actividad
 */
const getAsistencia = async (req, res) => {
  try {
    const { actividadId } = req.params;
    const { seccion_id } = req.query;

    // Verificar que la actividad existe
    const actividad = await actividadModel.findById(actividadId);
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    const asistencia = await asistenciaModel.getAsistenciaByActividad(
      actividadId,
      seccion_id || null
    );

    res.json({
      success: true,
      data: asistencia,
      actividad: {
        id: actividad.id,
        titulo: actividad.titulo,
        fecha: actividad.fecha_inicio,
        tipo: actividad.tipo
      }
    });
  } catch (error) {
    console.error('Error en getAsistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lista de asistencia',
      error: error.message
    });
  }
};

/**
 * GET /api/asistencia/:actividadId/estadisticas
 * Obtener estadísticas de asistencia
 */
const getEstadisticas = async (req, res) => {
  try {
    const { actividadId } = req.params;
    const { seccion_id } = req.query;

    const stats = await asistenciaModel.getEstadisticasAsistencia(
      actividadId,
      seccion_id || null
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error en getEstadisticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * PATCH /api/asistencia/:actividadId/educando/:educandoId/llegada
 * Marcar llegada de un educando
 */
const marcarLlegada = async (req, res) => {
  try {
    const { actividadId, educandoId } = req.params;
    const { llegado } = req.body;
    const scouterId = req.usuario?.id || req.user?.id;

    if (!scouterId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const resultado = await asistenciaModel.marcarLlegada(
      actividadId,
      educandoId,
      scouterId,
      llegado !== false // Por defecto true si no se especifica
    );

    res.json({
      success: true,
      message: llegado !== false ? 'Llegada registrada' : 'Llegada desmarcada',
      data: resultado
    });
  } catch (error) {
    console.error('Error en marcarLlegada:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar llegada',
      error: error.message
    });
  }
};

/**
 * PATCH /api/asistencia/:actividadId/educando/:educandoId/sip
 * Marcar entrega de SIP
 */
const marcarSIP = async (req, res) => {
  try {
    const { actividadId, educandoId } = req.params;
    const { entregado } = req.body;
    const scouterId = req.usuario?.id || req.user?.id;

    if (!scouterId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const resultado = await asistenciaModel.marcarSIP(
      actividadId,
      educandoId,
      scouterId,
      entregado !== false
    );

    res.json({
      success: true,
      message: entregado !== false ? 'SIP registrado' : 'SIP desmarcado',
      data: resultado
    });
  } catch (error) {
    console.error('Error en marcarSIP:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar SIP',
      error: error.message
    });
  }
};

/**
 * PATCH /api/asistencia/:actividadId/educando/:educandoId/observaciones
 * Actualizar observaciones
 */
const actualizarObservaciones = async (req, res) => {
  try {
    const { actividadId, educandoId } = req.params;
    const { observaciones } = req.body;

    const resultado = await asistenciaModel.actualizarObservaciones(
      actividadId,
      educandoId,
      observaciones
    );

    res.json({
      success: true,
      message: 'Observaciones actualizadas',
      data: resultado
    });
  } catch (error) {
    console.error('Error en actualizarObservaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar observaciones',
      error: error.message
    });
  }
};

/**
 * PATCH /api/asistencia/:actividadId/educando/:educandoId/no-asiste
 * Marcar que un inscrito no asistió
 */
const marcarNoAsiste = async (req, res) => {
  try {
    const { actividadId, educandoId } = req.params;
    const { observaciones } = req.body;
    const scouterId = req.usuario?.id || req.user?.id;

    if (!scouterId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const resultado = await asistenciaModel.marcarNoAsiste(
      actividadId,
      educandoId,
      scouterId,
      observaciones
    );

    res.json({
      success: true,
      message: 'Marcado como no asiste',
      data: resultado
    });
  } catch (error) {
    console.error('Error en marcarNoAsiste:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar no asiste',
      error: error.message
    });
  }
};

module.exports = {
  getAsistencia,
  getEstadisticas,
  marcarLlegada,
  marcarSIP,
  actualizarObservaciones,
  marcarNoAsiste
};
