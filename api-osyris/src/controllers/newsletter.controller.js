const { query } = require('../config/db.config');
const NotificacionFamilia = require('../models/notificaciones_familia.model');
const Joi = require('joi');

// Esquema de validación para envío de newsletter
const newsletterSchema = Joi.object({
  titulo: Joi.string().min(1).max(255).required(),
  contenido: Joi.string().min(1).required(),
  filtro_seccion_id: Joi.number().integer().allow(null).optional(),
  filtro_estado: Joi.string().allow(null, '').optional()
});

/**
 * Obtener familias según filtros
 */
const getFamiliasDestinatarias = async (filtro_seccion_id, filtro_estado) => {
  let query_str = `
    SELECT DISTINCT u.id, u.nombre, u.apellidos, u.email
    FROM usuarios u
    WHERE u.rol = 'familia' AND u.activo = true
  `;
  const params = [];
  let paramCounter = 1;

  if (filtro_estado) {
    // filtro_estado maps to activo field logic
    if (filtro_estado === 'ACTIVO') {
      query_str += ' AND u.activo = true';
    } else if (filtro_estado === 'INACTIVO') {
      query_str += ' AND u.activo = false';
    }
  }

  if (filtro_seccion_id) {
    query_str += `
      AND u.id IN (
        SELECT DISTINCT fe.familiar_id
        FROM familiares_educandos fe
        JOIN educandos e ON fe.educando_id = e.id
        WHERE e.seccion_id = $${paramCounter} AND e.activo = true
      )
    `;
    params.push(filtro_seccion_id);
    paramCounter++;
  }

  return await query(query_str, params);
};

/**
 * POST /api/newsletter/enviar
 * Enviar newsletter segmentada
 */
const enviarNewsletter = async (req, res) => {
  try {
    const { error, value } = newsletterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { titulo, contenido, filtro_seccion_id, filtro_estado } = value;
    const enviadoPor = req.usuario.id;

    // Obtener familias destinatarias
    const familias = await getFamiliasDestinatarias(filtro_seccion_id, filtro_estado);

    if (familias.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay familias que coincidan con los filtros seleccionados'
      });
    }

    // Para cada familia: crear notificación in-app
    // Necesitamos un educando_id para la notificación. Obtener el primer educando vinculado a cada familia.
    let notificacionesCreadas = 0;
    for (const familia of familias) {
      try {
        // Obtener un educando vinculado a esta familia
        const educandos = await query(
          `SELECT educando_id FROM familiares_educandos WHERE familiar_id = $1 LIMIT 1`,
          [familia.id]
        );

        const educandoId = educandos.length > 0 ? educandos[0].educando_id : null;

        if (educandoId) {
          await NotificacionFamilia.create({
            familiar_id: familia.id,
            educando_id: educandoId,
            titulo: titulo,
            mensaje: contenido,
            tipo: 'informativo',
            prioridad: 'normal',
            categoria: 'newsletter',
            enlace_accion: '/familia/dashboard',
            metadata: {
              tipo: 'newsletter',
              enviado_por: enviadoPor,
              filtro_seccion_id: filtro_seccion_id || null,
              filtro_estado: filtro_estado || null
            }
          });
          notificacionesCreadas++;
        }
      } catch (notifError) {
        console.error(`Error creando notificación para familia ${familia.id}:`, notifError);
      }
    }

    // Email: preparar pero solo enviar si SMTP_ENABLED
    if (process.env.SMTP_ENABLED === 'true') {
      try {
        const { sendEmail } = require('../utils/email');
        for (const familia of familias) {
          try {
            await sendEmail({
              to: familia.email,
              subject: `[Grupo Scout Osyris] ${titulo}`,
              html: `
                <div class="greeting">Hola ${familia.nombre}</div>
                <p class="text">${contenido.replace(/\n/g, '<br>')}</p>
              `,
              text: `Hola ${familia.nombre},\n\n${contenido}\n\n---\nGrupo Scout Osyris`
            });
          } catch (emailErr) {
            console.error(`Error enviando email a ${familia.email}:`, emailErr);
          }
        }
      } catch (emailModuleErr) {
        console.error('Error cargando módulo de email:', emailModuleErr);
      }
    }

    // Guardar en mensajes_newsletter
    await query(
      `INSERT INTO mensajes_newsletter (titulo, contenido, filtro_seccion_id, filtro_estado, enviado_por, destinatarios_count)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [titulo, contenido, filtro_seccion_id || null, filtro_estado || null, enviadoPor, notificacionesCreadas]
    );

    res.status(200).json({
      success: true,
      message: `Newsletter enviada a ${notificacionesCreadas} familias`,
      data: {
        destinatarios_count: notificacionesCreadas,
        total_familias: familias.length
      }
    });
  } catch (error) {
    console.error('Error enviando newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar la newsletter',
      error: error.message
    });
  }
};

/**
 * GET /api/newsletter/preview
 * Preview de destinatarios según filtros
 */
const previewDestinatarios = async (req, res) => {
  try {
    const filtro_seccion_id = req.query.filtro_seccion_id ? parseInt(req.query.filtro_seccion_id) : null;
    const filtro_estado = req.query.filtro_estado || null;

    const familias = await getFamiliasDestinatarias(filtro_seccion_id, filtro_estado);

    res.status(200).json({
      success: true,
      data: {
        count: familias.length
      }
    });
  } catch (error) {
    console.error('Error preview newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener preview',
      error: error.message
    });
  }
};

/**
 * GET /api/newsletter/historial
 * Historial de newsletters enviadas
 */
const getHistorial = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [newsletters, countResult] = await Promise.all([
      query(
        `SELECT mn.*, u.nombre as enviado_por_nombre, u.apellidos as enviado_por_apellidos,
                s.nombre as seccion_nombre
         FROM mensajes_newsletter mn
         JOIN usuarios u ON mn.enviado_por = u.id
         LEFT JOIN secciones s ON mn.filtro_seccion_id = s.id
         ORDER BY mn.enviado_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      query('SELECT COUNT(*) as total FROM mensajes_newsletter')
    ]);

    const total = parseInt(countResult[0]?.total) || 0;

    res.status(200).json({
      success: true,
      data: newsletters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
};

module.exports = {
  enviarNewsletter,
  previewDestinatarios,
  getHistorial
};
