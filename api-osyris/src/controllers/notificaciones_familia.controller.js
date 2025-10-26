const NotificacionFamilia = require('../models/notificaciones_familia.model');
const Familiar = require('../models/familiar.model');
const Joi = require('joi');

// Esquema de validación para la creación de notificaciones
const notificacionSchema = Joi.object({
  scout_id: Joi.number().integer().required(),
  titulo: Joi.string().required(),
  mensaje: Joi.string().required(),
  tipo: Joi.string().valid('urgente', 'importante', 'informativo', 'recordatorio').required(),
  prioridad: Joi.string().valid('alta', 'normal', 'baja').default('normal'),
  categoria: Joi.string().optional(),
  enlace_accion: Joi.string().optional(),
  metadata: Joi.object().optional(),
  fecha_expiracion: Joi.date().optional()
});

// Esquema de validación para la creación masiva de notificaciones
const notificacionMasivaSchema = Joi.object({
  scout_ids: Joi.array().items(Joi.number().integer()).required(),
  titulo: Joi.string().required(),
  mensaje: Joi.string().required(),
  tipo: Joi.string().valid('urgente', 'importante', 'informativo', 'recordatorio').required(),
  prioridad: Joi.string().valid('alta', 'normal', 'baja').default('normal'),
  categoria: Joi.string().optional(),
  enlace_accion: Joi.string().optional(),
  metadata: Joi.object().optional(),
  fecha_expiracion: Joi.date().optional()
});

// Obtener todas las notificaciones de un familiar
const getNotificacionesByFamiliar = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const {
      solo_no_leidas,
      tipo,
      categoria,
      prioridad,
      limit = 50,
      scout_id
    } = req.query;

    const options = {
      soloNoLeidas: solo_no_leidas === 'true',
      tipo,
      categoria,
      prioridad,
      limit: parseInt(limit)
    };

    let notificaciones;

    if (scout_id) {
      // Verificar que el familiar tiene acceso al scout
      const tieneAcceso = await Familiar.verificarAcceso(familiarId, parseInt(scout_id));
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este scout'
        });
      }
      notificaciones = await NotificacionFamilia.findByFamiliarId(familiarId, options);
      // Filtrar por scout_id si se proporciona
      notificaciones = notificaciones.filter(n => n.scout_id === parseInt(scout_id));
    } else {
      notificaciones = await NotificacionFamilia.findByFamiliarId(familiarId, options);
    }

    res.status(200).json({
      success: true,
      data: notificaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las notificaciones',
      error: error.message
    });
  }
};

// Obtener notificaciones de un scout específico
const getNotificacionesByScout = async (req, res) => {
  try {
    const scoutId = parseInt(req.params.scoutId);
    const familiarId = req.usuario.id;
    const { solo_no_leidas, tipo, limit = 50 } = req.query;

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
      soloNoLeidas: solo_no_leidas === 'true',
      tipo,
      limit: parseInt(limit)
    };

    const notificaciones = await NotificacionFamilia.findByScoutId(scoutId, options);

    res.status(200).json({
      success: true,
      data: notificaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las notificaciones del scout',
      error: error.message
    });
  }
};

// Obtener una notificación por ID
const getNotificacionById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de notificación inválido'
      });
    }

    const notificacion = await NotificacionFamilia.findById(id, familiarId);

    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Verificar que la notificación pertenece al familiar
    if (notificacion.familiar_id !== familiarId && !['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta notificación'
      });
    }

    res.status(200).json({
      success: true,
      data: notificacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la notificación',
      error: error.message
    });
  }
};

// Crear una nueva notificación
const createNotificacion = async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = notificacionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de notificación inválidos',
        error: error.details[0].message
      });
    }

    let familiarId;

    if (req.usuario.rol === 'familia') {
      // Los familiares solo pueden crear notificaciones para sus propios scouts
      const tieneAcceso = await Familiar.verificarAcceso(req.usuario.id, value.scout_id);
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este scout'
        });
      }
      familiarId = req.usuario.id;
    } else {
      // Admins y scouters pueden crear notificaciones para cualquier scout
      // Obtener todos los familiares del scout
      const familiares = await Familiar.findByScoutId(value.scout_id);
      if (!familiares || familiares.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron familiares para este scout'
        });
      }
      familiarId = familiares[0].familiar_id; // Tomar el primer familiar encontrado
    }

    const notificacionData = {
      ...value,
      familiar_id: familiarId
    };

    const newNotificacion = await NotificacionFamilia.create(notificacionData);

    res.status(201).json({
      success: true,
      message: 'Notificación creada correctamente',
      data: newNotificacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la notificación',
      error: error.message
    });
  }
};

// Crear notificaciones masivas (solo admins y scouters)
const createNotificacionesMasivas = async (req, res) => {
  try {
    // Solo admins y scouters pueden crear notificaciones masivas
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear notificaciones masivas'
      });
    }

    // Validar datos de entrada
    const { error, value } = notificacionMasivaSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de notificación inválidos',
        error: error.details[0].message
      });
    }

    const notificaciones = [];

    for (const scoutId of value.scout_ids) {
      // Obtener todos los familiares del scout
      const familiares = await Familiar.findByScoutId(scoutId);

      for (const familiar of familiares) {
        const notificacionData = {
          familiar_id: familiar.familiar_id,
          scout_id: scoutId,
          titulo: value.titulo,
          mensaje: value.mensaje,
          tipo: value.tipo,
          prioridad: value.prioridad,
          categoria: value.categoria,
          enlace_accion: value.enlace_accion,
          metadata: value.metadata,
          fecha_expiracion: value.fecha_expiracion
        };
        notificaciones.push(notificacionData);
      }
    }

    const newNotificaciones = await NotificacionFamilia.createBulk(notificaciones);

    res.status(201).json({
      success: true,
      message: `${newNotificaciones.length} notificaciones creadas correctamente`,
      data: newNotificaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear las notificaciones masivas',
      error: error.message
    });
  }
};

// Marcar notificación como leída
const marcarComoLeida = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de notificación inválido'
      });
    }

    // Verificar que la notificación existe y pertenece al familiar
    const notificacion = await NotificacionFamilia.findById(id, familiarId);
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    if (notificacion.familiar_id !== familiarId && !['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta notificación'
      });
    }

    const updatedNotificacion = await NotificacionFamilia.marcarComoLeida(id, familiarId);

    res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída',
      data: updatedNotificacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al marcar la notificación como leída',
      error: error.message
    });
  }
};

// Marcar todas las notificaciones como leídas
const marcarTodasComoLeidas = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const { scout_id } = req.query;

    const afectadas = await NotificacionFamilia.marcarTodasComoLeidas(
      familiarId,
      scout_id ? parseInt(scout_id) : null
    );

    res.status(200).json({
      success: true,
      message: `${afectadas} notificaciones marcadas como leídas`,
      afectadas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al marcar las notificaciones como leídas',
      error: error.message
    });
  }
};

// Eliminar una notificación
const deleteNotificacion = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de notificación inválido'
      });
    }

    // Verificar que la notificación existe y pertenece al familiar
    const notificacion = await NotificacionFamilia.findById(id, familiarId);
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    if (notificacion.familiar_id !== familiarId && !['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta notificación'
      });
    }

    const deleted = await NotificacionFamilia.remove(id, familiarId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo eliminar la notificación'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notificación eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la notificación',
      error: error.message
    });
  }
};

// Obtener contador de notificaciones no leídas
const getContadorNoLeidas = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const { scout_id } = req.query;

    const noLeidas = await NotificacionFamilia.getContadorNoLeidas(
      familiarId,
      scout_id ? parseInt(scout_id) : null
    );

    res.status(200).json({
      success: true,
      data: {
        no_leidas: noLeidas
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el contador de notificaciones no leídas',
      error: error.message
    });
  }
};

// Enviar notificación a todos los familiares de una sección (solo admins y scouters)
const enviarAFamiliaresSeccion = async (req, res) => {
  try {
    // Solo admins y scouters pueden enviar notificaciones a secciones
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para enviar notificaciones a secciones'
      });
    }

    const { seccion_id } = req.params;
    const { error, value } = notificacionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de notificación inválidos',
        error: error.details[0].message
      });
    }

    const notificaciones = await NotificacionFamilia.enviarAFamiliaresSeccion(
      parseInt(seccion_id),
      value
    );

    res.status(201).json({
      success: true,
      message: `${notificaciones.length} notificaciones enviadas a la sección`,
      data: notificaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificaciones a la sección',
      error: error.message
    });
  }
};

module.exports = {
  getNotificacionesByFamiliar,
  getNotificacionesByScout,
  getNotificacionById,
  createNotificacion,
  createNotificacionesMasivas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  deleteNotificacion,
  getContadorNoLeidas,
  enviarAFamiliaresSeccion
};