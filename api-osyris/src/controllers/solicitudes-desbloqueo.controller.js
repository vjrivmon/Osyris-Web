/**
 * Controlador: Solicitudes de Desbloqueo
 *
 * Gestiona las solicitudes de familias para desbloquear
 * el límite de subida de 24h por documento.
 */

const solicitudesModel = require('../models/solicitudes_desbloqueo.model');
const documentosFamiliaModel = require('../models/documentos_familia.model');
const educandoModel = require('../models/educando.model');
const familiarEducandoModel = require('../models/familiar_educando.model');
const notificacionScouterModel = require('../models/notificaciones_scouter.model');
const notificacionFamiliaModel = require('../models/notificaciones_familia.model');

/**
 * Crea una nueva solicitud de desbloqueo
 * POST /api/solicitudes-desbloqueo
 */
const crearSolicitud = async (req, res) => {
  try {
    const { documentoId, motivo } = req.body;
    const familiarId = req.usuario?.id;

    if (!documentoId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del documento es requerido'
      });
    }

    // Obtener documento
    const documento = await documentosFamiliaModel.findById(documentoId);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar acceso del familiar
    const tieneAcceso = await familiarEducandoModel.verificarAcceso(
      familiarId,
      documento.educando_id
    );
    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este documento'
      });
    }

    // Verificar si ya hay una solicitud pendiente
    const solicitudPendiente = await solicitudesModel.findPendienteByDocumento(
      documentoId,
      familiarId
    );
    if (solicitudPendiente) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes una solicitud pendiente para este documento',
        data: { solicitudId: solicitudPendiente.id }
      });
    }

    // Obtener datos del educando para la notificación
    const educando = await educandoModel.findById(documento.educando_id);

    // Crear solicitud
    const solicitud = await solicitudesModel.crear({
      documento_id: documentoId,
      educando_id: documento.educando_id,
      familiar_id: familiarId,
      seccion_id: educando.seccion_id,
      tipo_documento: documento.tipo_documento,
      titulo_documento: documento.titulo,
      motivo: motivo || null
    });

    // Notificar a scouters de la sección
    const nombreCompleto = `${educando.nombre} ${educando.apellidos}`;
    await notificacionScouterModel.crearParaSeccion({
      educando_id: documento.educando_id,
      educando_nombre: nombreCompleto,
      seccion_id: educando.seccion_id,
      tipo: 'solicitud_desbloqueo',
      titulo: 'Solicitud de desbloqueo',
      mensaje: `${req.usuario.nombre || 'Un familiar'} solicita desbloquear "${documento.titulo}" de ${nombreCompleto}`,
      enlace_accion: '/aula-virtual/solicitudes-desbloqueo',
      metadata: {
        solicitud_id: solicitud.id,
        documento_id: documentoId,
        tipo_documento: documento.tipo_documento,
        familiar_id: familiarId,
        motivo: motivo
      },
      prioridad: 'alta'
    });

    return res.status(201).json({
      success: true,
      message: 'Solicitud creada correctamente. El scouter de sección será notificado.',
      data: solicitud
    });
  } catch (error) {
    console.error('Error creando solicitud de desbloqueo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear solicitud',
      error: error.message
    });
  }
};

/**
 * Obtiene solicitudes por sección (para scouters)
 * GET /api/solicitudes-desbloqueo/seccion/:seccionId
 */
const listarPorSeccion = async (req, res) => {
  try {
    const { seccionId } = req.params;
    const { estado } = req.query;

    // Verificar que el scouter tiene acceso a esta sección
    if (req.usuario.rol === 'scouter' && req.usuario.seccion_id !== parseInt(seccionId)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta sección'
      });
    }

    const solicitudes = await solicitudesModel.findBySeccionId(seccionId, estado || null);
    const pendientes = await solicitudesModel.contarPendientesPorSeccion(seccionId);

    return res.json({
      success: true,
      data: {
        solicitudes,
        pendientes,
        total: solicitudes.length
      }
    });
  } catch (error) {
    console.error('Error listando solicitudes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al listar solicitudes',
      error: error.message
    });
  }
};

/**
 * Obtiene todas las solicitudes pendientes (para admin)
 * GET /api/solicitudes-desbloqueo/pendientes
 */
const listarTodasPendientes = async (req, res) => {
  try {
    // Solo admin puede ver todas
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores pueden ver todas las solicitudes'
      });
    }

    const solicitudes = await solicitudesModel.findAllPendientes();
    const total = await solicitudesModel.contarTodasPendientes();

    return res.json({
      success: true,
      data: {
        solicitudes,
        pendientes: total,
        total: solicitudes.length
      }
    });
  } catch (error) {
    console.error('Error listando todas las solicitudes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al listar solicitudes',
      error: error.message
    });
  }
};

/**
 * Obtiene solicitudes del familiar autenticado
 * GET /api/solicitudes-desbloqueo/mis-solicitudes
 */
const misSolicitudes = async (req, res) => {
  try {
    const familiarId = req.usuario?.id;

    const solicitudes = await solicitudesModel.findByFamiliarId(familiarId);

    return res.json({
      success: true,
      data: solicitudes
    });
  } catch (error) {
    console.error('Error obteniendo mis solicitudes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: error.message
    });
  }
};

/**
 * Aprueba una solicitud de desbloqueo
 * PUT /api/solicitudes-desbloqueo/:id/aprobar
 */
const aprobarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;
    const scouterId = req.usuario?.id;

    // Verificar que la solicitud existe
    const solicitud = await solicitudesModel.findById(id);
    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar estado
    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitud ya ha sido procesada'
      });
    }

    // Verificar acceso del scouter a la sección
    if (req.usuario.rol === 'scouter' && req.usuario.seccion_id !== solicitud.seccion_id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta sección'
      });
    }

    // Aprobar solicitud (esto también resetea el contador de subidas)
    const solicitudAprobada = await solicitudesModel.aprobar(id, scouterId, respuesta);

    // Notificar al familiar
    try {
      await notificacionFamiliaModel.crearNotificacion({
        usuario_id: solicitud.familiar_id,
        tipo: 'desbloqueo_aprobado',
        titulo: 'Desbloqueo aprobado',
        mensaje: `Tu solicitud para desbloquear "${solicitud.titulo_documento}" ha sido aprobada. Ya puedes subir una nueva versión.`,
        enlace_accion: '/familia/documentos',
        metadata: {
          documento_id: solicitud.documento_id,
          solicitud_id: id
        }
      });
    } catch (notifError) {
      console.error('Error enviando notificación:', notifError);
      // No fallar si la notificación falla
    }

    return res.json({
      success: true,
      message: 'Solicitud aprobada. El familiar puede subir una nueva versión.',
      data: solicitudAprobada
    });
  } catch (error) {
    console.error('Error aprobando solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al aprobar solicitud',
      error: error.message
    });
  }
};

/**
 * Rechaza una solicitud de desbloqueo
 * PUT /api/solicitudes-desbloqueo/:id/rechazar
 */
const rechazarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;
    const scouterId = req.usuario?.id;

    if (!respuesta || respuesta.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El motivo del rechazo es obligatorio'
      });
    }

    // Verificar que la solicitud existe
    const solicitud = await solicitudesModel.findById(id);
    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar estado
    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitud ya ha sido procesada'
      });
    }

    // Verificar acceso del scouter a la sección
    if (req.usuario.rol === 'scouter' && req.usuario.seccion_id !== solicitud.seccion_id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta sección'
      });
    }

    // Rechazar solicitud
    const solicitudRechazada = await solicitudesModel.rechazar(id, scouterId, respuesta);

    // Notificar al familiar
    try {
      await notificacionFamiliaModel.crearNotificacion({
        usuario_id: solicitud.familiar_id,
        tipo: 'desbloqueo_rechazado',
        titulo: 'Solicitud rechazada',
        mensaje: `Tu solicitud de desbloqueo para "${solicitud.titulo_documento}" ha sido rechazada. Motivo: ${respuesta}`,
        enlace_accion: '/familia/documentos',
        metadata: {
          documento_id: solicitud.documento_id,
          solicitud_id: id,
          motivo_rechazo: respuesta
        }
      });
    } catch (notifError) {
      console.error('Error enviando notificación:', notifError);
    }

    return res.json({
      success: true,
      message: 'Solicitud rechazada',
      data: solicitudRechazada
    });
  } catch (error) {
    console.error('Error rechazando solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar solicitud',
      error: error.message
    });
  }
};

/**
 * Obtiene el contador de solicitudes pendientes
 * GET /api/solicitudes-desbloqueo/contador
 */
const obtenerContador = async (req, res) => {
  try {
    let pendientes;

    // Verificar que el usuario esté autenticado
    if (!req.usuario) {
      return res.json({
        success: true,
        data: { pendientes: 0 }
      });
    }

    if (req.usuario.rol === 'admin') {
      pendientes = await solicitudesModel.contarTodasPendientes();
    } else if (req.usuario.rol === 'scouter' && req.usuario.seccion_id) {
      pendientes = await solicitudesModel.contarPendientesPorSeccion(req.usuario.seccion_id);
    } else {
      pendientes = 0;
    }

    return res.json({
      success: true,
      data: { pendientes }
    });
  } catch (error) {
    console.error('Error obteniendo contador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener contador',
      error: error.message
    });
  }
};

module.exports = {
  crearSolicitud,
  listarPorSeccion,
  listarTodasPendientes,
  misSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
  obtenerContador
};
