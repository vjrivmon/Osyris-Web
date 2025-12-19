const { query } = require('../config/db.config');
const ActividadModel = require('../models/actividad.model');
const ConfirmacionModel = require('../models/confirmaciones.model');
const NotificacionScouterModel = require('../models/notificaciones_scouter.model');
const SolicitudesDesbloqueoModel = require('../models/solicitudes_desbloqueo.model');

/**
 * Controlador para el Dashboard del Scouter
 * Agrega todos los datos necesarios en una sola llamada
 */

/**
 * Obtener la seccion del usuario scouter
 */
const getSeccionByUserId = async (userId) => {
  const result = await query(`
    SELECT u.seccion_id, u.rol, s.nombre as seccion_nombre
    FROM usuarios u
    LEFT JOIN secciones s ON u.seccion_id = s.id
    WHERE u.id = $1
  `, [userId]);

  if (result.length === 0) return null;
  return result[0];
};

/**
 * Obtener educandos sin confirmar para una actividad (sábados)
 */
const getEducandosSinConfirmar = async (actividadId, seccionId) => {
  const result = await query(`
    SELECT e.id, e.nombre, e.apellidos
    FROM educandos e
    WHERE e.activo = true
    AND e.seccion_id = $1
    AND NOT EXISTS (
      SELECT 1 FROM confirmaciones_asistencia ca
      WHERE ca.educando_id = e.id AND ca.actividad_id = $2
    )
    ORDER BY e.apellidos, e.nombre
  `, [seccionId, actividadId]);

  return result;
};

/**
 * Obtener educandos sin inscribir para un campamento
 */
const getEducandosSinInscribir = async (actividadId, seccionId) => {
  const result = await query(`
    SELECT e.id, e.nombre, e.apellidos
    FROM educandos e
    WHERE e.activo = true
    AND e.seccion_id = $1
    AND NOT EXISTS (
      SELECT 1 FROM inscripciones_campamento ic
      WHERE ic.educando_id = e.id AND ic.actividad_id = $2
    )
    ORDER BY e.apellidos, e.nombre
  `, [seccionId, actividadId]);

  return result;
};

/**
 * Obtener proxima reunion de sabado - FILTRADA POR SECCION
 */
const getProximoSabado = async (seccionId) => {
  // Construir query con filtrado opcional por sección
  let queryText = `
    SELECT a.id, a.titulo, a.fecha_inicio, a.hora_inicio, a.hora_fin, a.lugar,
           a.tipo, a.seccion_id, s.nombre as seccion_nombre
    FROM actividades a
    LEFT JOIN secciones s ON a.seccion_id = s.id
    WHERE a.tipo = 'reunion_sabado'
    AND a.fecha_inicio >= CURRENT_DATE
    AND (a.cancelado = false OR a.cancelado IS NULL)
    AND a.visibilidad IN ('todos', 'familias')
  `;

  const params = [];

  // Si tiene sección asignada, filtrar por ella (o actividades sin sección específica)
  if (seccionId) {
    queryText += ` AND (a.seccion_id = $1 OR a.seccion_id IS NULL)`;
    params.push(seccionId);
  }

  queryText += ` ORDER BY a.fecha_inicio ASC LIMIT 1`;

  const result = await query(queryText, params);
  return result.length > 0 ? result[0] : null;
};

/**
 * Obtener proximo campamento - FILTRADO POR SECCION
 */
const getProximoCampamento = async (seccionId) => {
  let queryText = `
    SELECT a.id, a.titulo, a.fecha_inicio, a.fecha_fin, a.hora_inicio, a.hora_fin,
           a.lugar, a.precio, a.tipo, a.seccion_id, s.nombre as seccion_nombre,
           a.circular_drive_id, a.circular_drive_url
    FROM actividades a
    LEFT JOIN secciones s ON a.seccion_id = s.id
    WHERE a.tipo = 'campamento'
    AND a.fecha_inicio >= CURRENT_DATE
    AND (a.cancelado = false OR a.cancelado IS NULL)
    AND a.visibilidad IN ('todos', 'familias')
  `;

  const params = [];

  // Si tiene sección asignada, filtrar por ella (o actividades sin sección específica)
  if (seccionId) {
    queryText += ` AND (a.seccion_id = $1 OR a.seccion_id IS NULL)`;
    params.push(seccionId);
  }

  queryText += ` ORDER BY a.fecha_inicio ASC LIMIT 1`;

  const result = await query(queryText, params);
  return result.length > 0 ? result[0] : null;
};

/**
 * Obtener estadisticas de asistencia para una reunion
 */
const getEstadisticasSabado = async (actividadId, seccionId) => {
  // Total de educandos activos en la seccion
  const totalResult = await query(`
    SELECT COUNT(*) as total FROM educandos
    WHERE activo = true AND seccion_id = $1
  `, [seccionId]);
  const totalEducandos = parseInt(totalResult[0]?.total || 0);

  // Conteo de confirmaciones
  const confirmacionesResult = await query(`
    SELECT
      COUNT(*) FILTER (WHERE ca.asistira = true) as confirmados,
      COUNT(*) FILTER (WHERE ca.asistira = false) as no_asisten
    FROM confirmaciones_asistencia ca
    JOIN educandos e ON ca.educando_id = e.id
    WHERE ca.actividad_id = $1 AND e.seccion_id = $2
  `, [actividadId, seccionId]);

  const confirmados = parseInt(confirmacionesResult[0]?.confirmados || 0);
  const noAsisten = parseInt(confirmacionesResult[0]?.no_asisten || 0);
  const pendientes = totalEducandos - confirmados - noAsisten;

  return {
    confirmados,
    noAsisten,
    pendientes,
    total: totalEducandos
  };
};

/**
 * Obtener lista de confirmaciones para una reunion
 */
const getListaConfirmaciones = async (actividadId, seccionId) => {
  const result = await query(`
    SELECT ca.id, ca.asistira, ca.comentarios, ca.confirmado_en,
           e.id as educando_id, e.nombre as educando_nombre, e.apellidos as educando_apellidos,
           uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos
    FROM confirmaciones_asistencia ca
    JOIN educandos e ON ca.educando_id = e.id
    LEFT JOIN usuarios uf ON ca.familiar_id = uf.id
    WHERE ca.actividad_id = $1 AND e.seccion_id = $2
    ORDER BY e.apellidos, e.nombre
  `, [actividadId, seccionId]);

  return result;
};

/**
 * Obtener estadisticas de inscripciones para un campamento
 */
const getEstadisticasCampamento = async (actividadId, seccionId) => {
  // Total de educandos activos en la sección (para calcular pendientes)
  const totalResult = await query(`
    SELECT COUNT(*) as total FROM educandos
    WHERE activo = true AND seccion_id = $1
  `, [seccionId]);
  const totalEducandos = parseInt(totalResult[0]?.total || 0);

  // Conteo de inscripciones
  // estado puede ser: 'pendiente', 'inscrito', 'no_asiste', 'lista_espera', 'cancelado'
  const inscripcionesResult = await query(`
    SELECT
      COUNT(*) FILTER (WHERE ic.estado IN ('inscrito', 'pendiente')) as inscritos,
      COUNT(*) FILTER (WHERE ic.estado = 'pendiente') as pendientes_confirmacion,
      COUNT(*) FILTER (WHERE ic.estado = 'no_asiste') as no_asisten,
      COUNT(*) FILTER (WHERE ic.pagado = true AND ic.estado IN ('inscrito', 'pendiente')) as pagados,
      COUNT(*) FILTER (WHERE (ic.pagado = false OR ic.pagado IS NULL) AND ic.estado IN ('inscrito', 'pendiente')) as sin_pagar,
      COUNT(*) FILTER (WHERE ic.circular_firmada_drive_id IS NOT NULL) as circulares_subidas,
      COUNT(*) FILTER (WHERE ic.justificante_pago_drive_id IS NOT NULL) as justificantes_subidos,
      COUNT(*) as total_respuestas
    FROM inscripciones_campamento ic
    JOIN educandos e ON ic.educando_id = e.id
    WHERE ic.actividad_id = $1 AND e.seccion_id = $2
  `, [actividadId, seccionId]);

  const totalRespuestas = parseInt(inscripcionesResult[0]?.total_respuestas || 0);
  const sinResponder = totalEducandos - totalRespuestas;

  return {
    inscritos: parseInt(inscripcionesResult[0]?.inscritos || 0),
    pendientes: parseInt(inscripcionesResult[0]?.pendientes_confirmacion || 0),
    noAsisten: parseInt(inscripcionesResult[0]?.no_asisten || 0),
    pagados: parseInt(inscripcionesResult[0]?.pagados || 0),
    sinPagar: parseInt(inscripcionesResult[0]?.sin_pagar || 0),
    circularesSubidas: parseInt(inscripcionesResult[0]?.circulares_subidas || 0),
    justificantesSubidos: parseInt(inscripcionesResult[0]?.justificantes_subidos || 0),
    sinResponder,
    total: totalEducandos
  };
};

/**
 * Obtener lista de inscripciones para un campamento
 */
const getListaInscripciones = async (actividadId, seccionId) => {
  const result = await query(`
    SELECT ic.id, ic.estado, ic.pagado,
           (ic.estado != 'no_asiste') as asistira,
           ic.circular_firmada_drive_id, ic.justificante_pago_drive_id,
           ic.fecha_inscripcion as created_at,
           e.id as educando_id, e.nombre as educando_nombre, e.apellidos as educando_apellidos,
           uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos
    FROM inscripciones_campamento ic
    JOIN educandos e ON ic.educando_id = e.id
    LEFT JOIN usuarios uf ON ic.familiar_id = uf.id
    WHERE ic.actividad_id = $1 AND e.seccion_id = $2
    ORDER BY e.apellidos, e.nombre
  `, [actividadId, seccionId]);

  return result;
};

/**
 * Obtener solicitudes de desbloqueo pendientes para la sección
 */
const getSolicitudesDesbloqueo = async (seccionId) => {
  const result = await query(`
    SELECT
      sd.id, sd.documento_id, sd.educando_id, sd.familiar_id,
      sd.seccion_id, sd.tipo_documento, sd.titulo_documento,
      sd.motivo, sd.estado, sd.fecha_solicitud,
      e.nombre as educando_nombre, e.apellidos as educando_apellidos,
      u.nombre as familiar_nombre, u.apellidos as familiar_apellidos,
      s.nombre as seccion_nombre, s.color_principal as seccion_color
    FROM solicitudes_desbloqueo sd
    LEFT JOIN educandos e ON sd.educando_id = e.id
    LEFT JOIN usuarios u ON sd.familiar_id = u.id
    LEFT JOIN secciones s ON sd.seccion_id = s.id
    WHERE sd.seccion_id = $1 AND sd.estado = 'pendiente'
    ORDER BY sd.fecha_solicitud DESC
    LIMIT 10
  `, [seccionId]);

  return result;
};

/**
 * Obtener documentos pendientes de revision
 */
const getDocumentosPendientes = async (seccionId) => {
  const result = await query(`
    SELECT df.id, df.tipo_documento, df.titulo, df.archivo_nombre,
           df.archivo_ruta, df.fecha_subida, df.estado, df.estado_revision,
           e.id as educando_id, e.nombre as educando_nombre, e.apellidos as educando_apellidos,
           s.nombre as seccion_nombre, s.color_principal as seccion_color
    FROM documentos_familia df
    JOIN educandos e ON df.educando_id = e.id
    LEFT JOIN secciones s ON e.seccion_id = s.id
    WHERE e.seccion_id = $1
    AND (df.estado = 'pendiente_revision' OR df.estado_revision = 'pendiente')
    ORDER BY df.fecha_subida DESC
    LIMIT 10
  `, [seccionId]);

  return result;
};

/**
 * GET /api/dashboard-scouter/summary
 * Obtener resumen completo del dashboard
 */
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { expandSabado, expandCampamento } = req.query;

    // 1. Obtener datos del usuario incluyendo nombre de sección
    const userData = await getSeccionByUserId(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const { seccion_id: seccionId, rol, seccion_nombre: seccionNombre } = userData;

    // Para admins sin seccion, mostrar todo (null)
    // Para scouters sin sección, denegar acceso
    const effectiveSeccionId = seccionId || (rol === 'admin' ? null : null);

    // 2. Obtener proximo sabado - FILTRADO POR SECCION
    let proximoSabado = null;
    const sabado = await getProximoSabado(effectiveSeccionId);
    if (sabado) {
      // Usar la sección del scouter para estadísticas, no la de la actividad
      const seccionParaStats = effectiveSeccionId || sabado.seccion_id || 2;
      const estadisticas = await getEstadisticasSabado(sabado.id, seccionParaStats);

      proximoSabado = {
        actividad: {
          ...sabado,
          // Forzar el nombre de sección del scouter si tiene sección asignada
          seccion_nombre: effectiveSeccionId ? seccionNombre : sabado.seccion_nombre
        },
        estadisticas
      };

      // Si se pide expandir, incluir listas
      if (expandSabado === 'true') {
        proximoSabado.confirmaciones = await getListaConfirmaciones(sabado.id, seccionParaStats);
        proximoSabado.scouts_sin_confirmar = await getEducandosSinConfirmar(sabado.id, seccionParaStats);
      }
    }

    // 3. Obtener proximo campamento - FILTRADO POR SECCION
    let proximoCampamento = null;
    const campamento = await getProximoCampamento(effectiveSeccionId);
    if (campamento) {
      const seccionParaStats = effectiveSeccionId || campamento.seccion_id || 2;
      const estadisticas = await getEstadisticasCampamento(campamento.id, seccionParaStats);

      proximoCampamento = {
        actividad: {
          ...campamento,
          // Forzar el nombre de sección del scouter si tiene sección asignada
          seccion_nombre: effectiveSeccionId ? seccionNombre : campamento.seccion_nombre
        },
        estadisticas,
        // NUEVO: Incluir educandos sin inscribir
        educandos_sin_inscribir: await getEducandosSinInscribir(campamento.id, seccionParaStats)
      };

      // Si se pide expandir, incluir lista de inscripciones
      if (expandCampamento === 'true') {
        proximoCampamento.inscripciones = await getListaInscripciones(campamento.id, seccionParaStats);
      }
    }

    // 4. Obtener actividad reciente (notificaciones + solicitudes desbloqueo)
    let actividadReciente = [];
    if (effectiveSeccionId) {
      // Obtener notificaciones normales
      const notificaciones = await NotificacionScouterModel.findBySeccionId(effectiveSeccionId, {
        limit: 15
      });

      // Obtener solicitudes de desbloqueo pendientes
      const solicitudesDesbloqueo = await getSolicitudesDesbloqueo(effectiveSeccionId);

      // Convertir solicitudes al formato de notificación
      const solicitudesComoNotificaciones = solicitudesDesbloqueo.map(sol => ({
        id: `solicitud_${sol.id}`,
        educando_id: sol.educando_id,
        educando_nombre: `${sol.educando_nombre} ${sol.educando_apellidos || ''}`.trim(),
        seccion_id: sol.seccion_id,
        seccion_nombre: sol.seccion_nombre,
        seccion_color: sol.seccion_color,
        tipo: 'solicitud_desbloqueo',
        titulo: 'Solicitud de desbloqueo',
        mensaje: `${sol.familiar_nombre || 'Un familiar'} solicita desbloquear "${sol.titulo_documento}"${sol.motivo ? `: ${sol.motivo}` : ''}`,
        enlace_accion: '/aula-virtual/solicitudes-desbloqueo',
        metadata: {
          solicitud_id: sol.id,
          documento_id: sol.documento_id,
          tipo_documento: sol.tipo_documento
        },
        prioridad: 'alta',
        leida: false,
        fecha_creacion: sol.fecha_solicitud
      }));

      // Combinar y ordenar por fecha
      actividadReciente = [...notificaciones, ...solicitudesComoNotificaciones]
        .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
        .slice(0, 15);

    } else if (rol === 'admin') {
      actividadReciente = await NotificacionScouterModel.findAll({
        limit: 15
      });
    }

    // 5. Obtener documentos pendientes
    let documentosPendientes = [];
    if (effectiveSeccionId) {
      documentosPendientes = await getDocumentosPendientes(effectiveSeccionId);
    }

    res.json({
      success: true,
      data: {
        proximoSabado,
        proximoCampamento,
        actividadReciente,
        documentosPendientes,
        seccionId: effectiveSeccionId,
        seccionNombre: effectiveSeccionId ? seccionNombre : null
      }
    });

  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo datos del dashboard',
      error: error.message
    });
  }
};

/**
 * GET /api/dashboard-scouter/sabado/:actividadId/detalle
 * Obtener detalle completo de asistencias de un sabado
 */
const getSabadoDetalle = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { actividadId } = req.params;

    const userData = await getSeccionByUserId(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const seccionId = userData.seccion_id;
    if (!seccionId && userData.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'No tienes seccion asignada' });
    }

    const actividad = await ActividadModel.findById(actividadId);
    if (!actividad) {
      return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
    }

    const effectiveSeccionId = seccionId || actividad.seccion_id || 2;
    const estadisticas = await getEstadisticasSabado(actividadId, effectiveSeccionId);
    const confirmaciones = await getListaConfirmaciones(actividadId, effectiveSeccionId);
    const scoutsSinConfirmar = await getEducandosSinConfirmar(actividadId, effectiveSeccionId);

    res.json({
      success: true,
      data: {
        actividad,
        estadisticas,
        confirmaciones,
        scouts_sin_confirmar: scoutsSinConfirmar
      }
    });

  } catch (error) {
    console.error('Error obteniendo detalle sabado:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo detalle',
      error: error.message
    });
  }
};

/**
 * GET /api/dashboard-scouter/campamento/:actividadId/detalle
 * Obtener detalle completo de inscripciones de un campamento
 */
const getCampamentoDetalle = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { actividadId } = req.params;

    const userData = await getSeccionByUserId(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const seccionId = userData.seccion_id;
    if (!seccionId && userData.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'No tienes seccion asignada' });
    }

    const actividad = await ActividadModel.findById(actividadId);
    if (!actividad) {
      return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
    }

    const effectiveSeccionId = seccionId || actividad.seccion_id || 2;
    const estadisticas = await getEstadisticasCampamento(actividadId, effectiveSeccionId);
    const inscripciones = await getListaInscripciones(actividadId, effectiveSeccionId);
    const educandosSinInscribir = await getEducandosSinInscribir(actividadId, effectiveSeccionId);

    res.json({
      success: true,
      data: {
        actividad,
        estadisticas,
        inscripciones,
        educandos_sin_inscribir: educandosSinInscribir
      }
    });

  } catch (error) {
    console.error('Error obteniendo detalle campamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo detalle',
      error: error.message
    });
  }
};

/**
 * DELETE /api/dashboard-scouter/notificaciones
 * Limpiar todas las notificaciones del scouter
 */
const limpiarNotificaciones = async (req, res) => {
  try {
    const userId = req.usuario.id;

    const userData = await getSeccionByUserId(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { seccion_id: seccionId, rol } = userData;
    let eliminadas = 0;

    if (rol === 'admin' && !seccionId) {
      // Admin sin sección: eliminar todas
      eliminadas = await NotificacionScouterModel.removeAll();
    } else if (seccionId) {
      // Scouter con sección: eliminar solo las de su sección
      eliminadas = await NotificacionScouterModel.removeAllBySeccionId(seccionId);
    }

    res.json({
      success: true,
      message: `Se han eliminado ${eliminadas} notificaciones`,
      eliminadas
    });

  } catch (error) {
    console.error('Error limpiando notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar notificaciones',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardSummary,
  getSabadoDetalle,
  getCampamentoDetalle,
  limpiarNotificaciones
};
