/**
 * Controlador de Mensajes Scouter-Familia
 * MED-005: Sistema de comunicacion entre scouters y familias
 */

const NotificacionFamilia = require('../models/notificaciones_familia.model');
const Joi = require('joi');
const { query } = require('../config/db.config');

// Esquema de validacion para enviar mensaje a seccion
const mensajeSeccionSchema = Joi.object({
  asunto: Joi.string().min(3).max(255).required(),
  mensaje: Joi.string().min(10).max(5000).required(),
  prioridad: Joi.string().valid('alta', 'normal', 'baja').default('normal')
});

// Esquema de validacion para enviar mensaje a educando especifico
const mensajeEducandoSchema = Joi.object({
  educando_id: Joi.number().integer().required(),
  asunto: Joi.string().min(3).max(255).required(),
  mensaje: Joi.string().min(10).max(5000).required(),
  prioridad: Joi.string().valid('alta', 'normal', 'baja').default('normal')
});

// Esquema de validacion para enviar mensaje a educandos seleccionados
const mensajeEducandosSchema = Joi.object({
  educando_ids: Joi.array().items(Joi.number().integer()).min(1).required(),
  asunto: Joi.string().min(3).max(255).required(),
  mensaje: Joi.string().min(10).max(5000).required(),
  prioridad: Joi.string().valid('alta', 'normal', 'baja').default('normal')
});

/**
 * Enviar mensaje a todas las familias de la seccion del scouter
 * POST /api/mensajes-scouter/seccion
 */
const enviarMensajeASeccion = async (req, res) => {
  try {
    // Verificar que el usuario es scouter o admin
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para enviar mensajes a familias'
      });
    }

    // Validar datos de entrada
    const { error, value } = mensajeSeccionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos invalidos',
        error: error.details[0].message
      });
    }

    // Obtener la seccion del scouter
    const seccionId = req.usuario.seccion_id;
    if (!seccionId && req.usuario.rol !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'No tienes una seccion asignada'
      });
    }

    // Construir nombre del remitente
    const scouterNombre = `${req.usuario.nombre} ${req.usuario.apellidos || ''}`.trim();

    // Enviar mensaje
    const resultado = await NotificacionFamilia.enviarMensajeASeccion({
      scouterId: req.usuario.id,
      scouterNombre,
      seccionId,
      asunto: value.asunto,
      mensaje: value.mensaje,
      prioridad: value.prioridad
    });

    res.status(201).json({
      success: true,
      message: resultado.mensaje,
      data: {
        enviados: resultado.enviados
      }
    });

  } catch (error) {
    console.error('Error enviando mensaje a seccion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje',
      error: error.message
    });
  }
};

/**
 * Enviar mensaje a las familias de un educando especifico
 * POST /api/mensajes-scouter/educando
 */
const enviarMensajeAEducando = async (req, res) => {
  try {
    // Verificar que el usuario es scouter o admin
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para enviar mensajes a familias'
      });
    }

    // Validar datos de entrada
    const { error, value } = mensajeEducandoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos invalidos',
        error: error.details[0].message
      });
    }

    // Verificar que el educando pertenece a la seccion del scouter (si no es admin)
    if (req.usuario.rol === 'scouter' && req.usuario.seccion_id) {
      const educandoCheck = await query(`
        SELECT id FROM educandos WHERE id = $1 AND seccion_id = $2 AND activo = true
      `, [value.educando_id, req.usuario.seccion_id]);

      if (educandoCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Este educando no pertenece a tu seccion'
        });
      }
    }

    // Construir nombre del remitente
    const scouterNombre = `${req.usuario.nombre} ${req.usuario.apellidos || ''}`.trim();

    // Enviar mensaje
    const resultado = await NotificacionFamilia.enviarMensajeAFamiliasEducando({
      scouterId: req.usuario.id,
      scouterNombre,
      educandoId: value.educando_id,
      asunto: value.asunto,
      mensaje: value.mensaje,
      prioridad: value.prioridad
    });

    res.status(201).json({
      success: true,
      message: resultado.mensaje,
      data: {
        enviados: resultado.enviados
      }
    });

  } catch (error) {
    console.error('Error enviando mensaje a educando:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje',
      error: error.message
    });
  }
};

/**
 * Enviar mensaje a familias de educandos seleccionados
 * POST /api/mensajes-scouter/educandos
 */
const enviarMensajeAEducandosSeleccionados = async (req, res) => {
  try {
    // Verificar que el usuario es scouter o admin
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para enviar mensajes a familias'
      });
    }

    // Validar datos de entrada
    const { error, value } = mensajeEducandosSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos invalidos',
        error: error.details[0].message
      });
    }

    // Verificar que los educandos pertenecen a la seccion del scouter (si no es admin)
    if (req.usuario.rol === 'scouter' && req.usuario.seccion_id) {
      const educandosCheck = await query(`
        SELECT id FROM educandos
        WHERE id = ANY($1) AND seccion_id = $2 AND activo = true
      `, [value.educando_ids, req.usuario.seccion_id]);

      if (educandosCheck.length !== value.educando_ids.length) {
        return res.status(403).json({
          success: false,
          message: 'Algunos educandos no pertenecen a tu seccion'
        });
      }
    }

    // Construir nombre del remitente
    const scouterNombre = `${req.usuario.nombre} ${req.usuario.apellidos || ''}`.trim();

    // Enviar mensaje
    const resultado = await NotificacionFamilia.enviarMensajeAEducandosSeleccionados({
      scouterId: req.usuario.id,
      scouterNombre,
      educandoIds: value.educando_ids,
      asunto: value.asunto,
      mensaje: value.mensaje,
      prioridad: value.prioridad
    });

    res.status(201).json({
      success: true,
      message: resultado.mensaje,
      data: {
        enviados: resultado.enviados
      }
    });

  } catch (error) {
    console.error('Error enviando mensaje a educandos seleccionados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje',
      error: error.message
    });
  }
};

/**
 * Obtener historial de mensajes enviados por el scouter
 * GET /api/mensajes-scouter/historial
 */
const obtenerHistorialMensajes = async (req, res) => {
  try {
    // Verificar que el usuario es scouter o admin
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver el historial de mensajes'
      });
    }

    const { limit = 50, offset = 0 } = req.query;

    // Obtener mensajes enviados por este scouter
    const mensajes = await query(`
      SELECT
        nf.id,
        nf.titulo as asunto,
        nf.mensaje,
        nf.tipo,
        nf.prioridad,
        nf.fecha_creacion,
        nf.metadata,
        e.nombre as educando_nombre,
        e.apellidos as educando_apellidos,
        s.nombre as seccion_nombre,
        COUNT(*) OVER() as total_count
      FROM notificaciones_familia nf
      LEFT JOIN educandos e ON nf.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE nf.tipo = 'mensaje_scouter'
        AND nf.metadata->>'remitente_id' = $1
      ORDER BY nf.fecha_creacion DESC
      LIMIT $2 OFFSET $3
    `, [req.usuario.id.toString(), parseInt(limit), parseInt(offset)]);

    const total = mensajes.length > 0 ? parseInt(mensajes[0].total_count) : 0;

    res.status(200).json({
      success: true,
      data: {
        mensajes: mensajes.map(m => ({
          id: m.id,
          asunto: m.asunto,
          mensaje: m.mensaje,
          prioridad: m.prioridad,
          fecha_creacion: m.fecha_creacion,
          educando: m.educando_nombre ? `${m.educando_nombre} ${m.educando_apellidos}` : null,
          seccion: m.seccion_nombre
        })),
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + mensajes.length < total
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo historial de mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de mensajes',
      error: error.message
    });
  }
};

module.exports = {
  enviarMensajeASeccion,
  enviarMensajeAEducando,
  enviarMensajeAEducandosSeleccionados,
  obtenerHistorialMensajes
};
