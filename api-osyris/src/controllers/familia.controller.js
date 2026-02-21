const FamiliarEducando = require('../models/familiar_educando.model');
const Educando = require('../models/educando.model');
const Actividad = require('../models/actividad.model');
const Joi = require('joi');
const { query } = require('../config/db.config');
const NotificacionFamilia = require('../models/notificaciones_familia.model');

// Esquema de validación para vincular educando
const vincularEducandoSchema = Joi.object({
  familiar_id: Joi.number().integer().required(),
  educando_id: Joi.number().integer().required(),
  relacion: Joi.string().valid('padre', 'madre', 'tutor_legal', 'abuelo', 'otro').required(),
  es_contacto_principal: Joi.boolean().default(false)
});

/**
 * @swagger
 * /api/familia/hijos:
 *   get:
 *     summary: Obtener todos los educandos vinculados al familiar autenticado
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de educandos vinculados
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
const getEducandosVinculados = async (req, res) => {
  try {
    const familiarId = req.usuario.id;

    console.log('🔍 [getEducandosVinculados] Usuario:', {
      id: req.usuario.id,
      email: req.usuario.email,
      rol: req.usuario.rol
    });

    const educandos = await FamiliarEducando.findEducandosByFamiliar(familiarId);

    console.log('📋 [getEducandosVinculados] Educandos encontrados:', educandos?.length || 0);

    res.status(200).json({
      success: true,
      data: educandos
    });
  } catch (error) {
    console.error('❌ [getEducandosVinculados] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los educandos vinculados',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/familia/educando/{educandoId}:
 *   get:
 *     summary: Obtener detalles de un educando vinculado
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: educandoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Detalles del educando
 *       403:
 *         description: No tienes acceso a este educando
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
const getEducandoById = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const educandoId = parseInt(req.params.educandoId);

    if (isNaN(educandoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de educando inválido'
      });
    }

    // Verificar acceso
    const tieneAcceso = await FamiliarEducando.verificarAcceso(familiarId, educandoId);
    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este educando'
      });
    }

    const educando = await Educando.findById(educandoId);

    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: educando
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los detalles del educando',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/familia/dashboard:
 *   get:
 *     summary: Obtener datos del dashboard para el familiar autenticado
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del dashboard
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
const getDashboardData = async (req, res) => {
  try {
    const familiarId = req.usuario.id;

    // Obtener educandos vinculados
    const educandos = await FamiliarEducando.findEducandosByFamiliar(familiarId);

    // Calcular estadísticas
    const totalEducandos = educandos.length;
    const educandosActivos = educandos.filter(e => e.activo).length;

    // Agrupar por sección
    const porSeccion = educandos.reduce((acc, educando) => {
      const seccion = educando.seccion_nombre || 'Sin sección';
      if (!acc[seccion]) {
        acc[seccion] = {
          nombre: seccion,
          color: educando.seccion_color,
          cantidad: 0,
          educandos: []
        };
      }
      acc[seccion].cantidad++;
      acc[seccion].educandos.push({
        id: educando.educando_id,
        nombre: educando.nombre,
        apellidos: educando.apellidos,
        edad: educando.edad
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        familiar: {
          id: req.usuario.id,
          nombre: req.usuario.nombre,
          apellidos: req.usuario.apellidos,
          email: req.usuario.email
        },
        estadisticas: {
          total_educandos: totalEducandos,
          educandos_activos: educandosActivos,
          por_seccion: Object.values(porSeccion)
        },
        educandos: educandos
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/familia/vincular:
 *   post:
 *     summary: Vincular un educando a un familiar (solo admin)
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FamiliarEducando'
 *     responses:
 *       201:
 *         description: Vinculación creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo admin)
 *       409:
 *         description: Relación ya existe
 *       500:
 *         description: Error del servidor
 */
const vincularEducando = async (req, res) => {
  try {
    // Solo administradores pueden vincular
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para vincular educandos'
      });
    }

    // Validar datos
    const { error, value } = vincularEducandoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const nuevaVinculacion = await FamiliarEducando.create(value);

    res.status(201).json({
      success: true,
      message: 'Educando vinculado exitosamente',
      data: nuevaVinculacion
    });
  } catch (error) {
    if (error.message.includes('Ya existe')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al vincular educando',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/familia/desvincular/{relacionId}:
 *   delete:
 *     summary: Desvincular un educando de un familiar (solo admin)
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: relacionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la relación
 *     responses:
 *       200:
 *         description: Desvinculación exitosa
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo admin)
 *       404:
 *         description: Relación no encontrada
 *       500:
 *         description: Error del servidor
 */
const desvincularEducando = async (req, res) => {
  try {
    // Solo administradores pueden desvincular
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para desvincular educandos'
      });
    }

    const relacionId = parseInt(req.params.relacionId);

    if (isNaN(relacionId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de relación inválido'
      });
    }

    // Verificar que existe
    const relacion = await FamiliarEducando.findById(relacionId);
    if (!relacion) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    await FamiliarEducando.remove(relacionId);

    res.status(200).json({
      success: true,
      message: 'Educando desvinculado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al desvincular educando',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/familia/verificar-acceso/{educandoId}:
 *   get:
 *     summary: Verificar si el familiar tiene acceso a un educando
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: educandoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Estado de acceso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
const verificarAcceso = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const educandoId = parseInt(req.params.educandoId);

    if (isNaN(educandoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de educando inválido'
      });
    }

    const tieneAcceso = await FamiliarEducando.verificarAcceso(familiarId, educandoId);

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

/**
 * @swagger
 * /api/familia/educando/{educandoId}/familiares:
 *   get:
 *     summary: Obtener todos los familiares de un educando (solo admin)
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: educandoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Lista de familiares
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const getFamiliaresByEducando = async (req, res) => {
  try {
    // Solo admin y scouter pueden ver todos los familiares
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta información'
      });
    }

    const educandoId = parseInt(req.params.educandoId);

    if (isNaN(educandoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de educando inválido'
      });
    }

    const familiares = await FamiliarEducando.findFamiliaresByEducando(educandoId);

    res.status(200).json({
      success: true,
      data: familiares
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener familiares del educando',
      error: error.message
    });
  }
};

/**
 * Obtener actividades para los hijos del familiar
 * Por ahora devuelve un array vacío - se implementará con datos reales más adelante
 */
const getActividadesFamilia = async (req, res) => {
  try {
    const { familiaId } = req.params;

    // TODO: Implementar lógica para obtener actividades de los educandos vinculados
    // Por ahora devuelve array vacío
    const actividades = [];

    res.status(200).json(actividades);
  } catch (error) {
    console.error('Error al obtener actividades de familia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/familia/actividades/proximas:
 *   get:
 *     summary: Obtener próximas actividades para el familiar autenticado (desde HOY)
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Número máximo de actividades a devolver
 *     responses:
 *       200:
 *         description: Lista de próximas actividades
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
const getProximasActividades = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const limit = parseInt(req.query.limit) || 5;

    // Obtener educandos vinculados al familiar
    const educandos = await FamiliarEducando.findEducandosByFamiliar(familiarId);

    if (!educandos || educandos.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Obtener secciones de los educandos (únicas)
    const seccionesIds = [...new Set(educandos.map(e => e.seccion_id).filter(Boolean))];

    // Obtener próximas actividades desde HOY
    const actividades = await Actividad.findProximas({
      dias: 365, // Próximo año
      limit: limit,
      visibilidad: 'familias'
    });

    // Filtrar actividades relevantes para las secciones del familiar
    // Las reuniones de sábado son para todos, otras se filtran por sección
    const actividadesFiltradas = actividades.filter(a => {
      // Reuniones de sábado son para todos
      if (a.tipo === 'reunion_sabado') return true;
      // Sin sección específica = para todos
      if (!a.seccion_id) return true;
      // Actividad de una de las secciones del familiar
      return seccionesIds.includes(a.seccion_id);
    });

    res.status(200).json({
      success: true,
      data: actividadesFiltradas.slice(0, limit)
    });
  } catch (error) {
    console.error('Error al obtener próximas actividades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener próximas actividades',
      error: error.message
    });
  }
};

// ==========================================
// IBAN - Datos bancarios
// ==========================================

// Validación IBAN español: ES + 22 dígitos
const ibanSchema = Joi.object({
  iban: Joi.string().pattern(/^ES\d{22}$/).required().messages({
    'string.pattern.base': 'El IBAN debe tener formato ES seguido de 22 dígitos',
    'any.required': 'El IBAN es obligatorio'
  })
});

/**
 * PUT /api/familia/iban
 * Guardar/actualizar IBAN del familiar autenticado
 */
const updateIban = async (req, res) => {
  try {
    const familiarId = req.usuario.id;

    const { error, value } = ibanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { iban } = value;

    // Obtener IBAN anterior
    const usuarios = await query('SELECT iban FROM usuarios WHERE id = $1', [familiarId]);
    const ibanAnterior = usuarios.length > 0 ? usuarios[0].iban : null;

    // Si es el mismo, no hacer nada
    if (ibanAnterior === iban) {
      return res.status(200).json({
        success: true,
        message: 'El IBAN no ha cambiado',
        data: { iban }
      });
    }

    // Actualizar IBAN en usuarios
    await query('UPDATE usuarios SET iban = $1 WHERE id = $2', [iban, familiarId]);

    // Guardar en historial
    await query(
      `INSERT INTO historial_iban (familia_id, iban_anterior, iban_nuevo, cambiado_por_usuario_id)
       VALUES ($1, $2, $3, $4)`,
      [familiarId, ibanAnterior, iban, familiarId]
    );

    // Notificar al kraal (admin/scouter) via notificaciones in-app
    // Obtener educandos vinculados para saber a qué scouters notificar
    const educandos = await FamiliarEducando.findEducandosByFamiliar(familiarId);
    if (educandos.length > 0) {
      // Obtener scouters/admins
      const scouters = await query(
        `SELECT DISTINCT u.id FROM usuarios u
         WHERE u.rol IN ('admin', 'scouter') AND u.activo = true`
      );

      // Crear notificación para cada admin/scouter con el primer educando como referencia
      const primerEducando = educandos[0];
      for (const scouter of scouters) {
        try {
          await NotificacionFamilia.create({
            familiar_id: scouter.id,
            educando_id: primerEducando.educando_id || primerEducando.id,
            titulo: 'IBAN actualizado',
            mensaje: `${req.usuario.nombre} ${req.usuario.apellidos} ha actualizado su IBAN.`,
            tipo: 'informativo',
            prioridad: 'normal',
            categoria: 'iban_actualizado',
            enlace_accion: '/admin/familiares',
            metadata: {
              tipo: 'iban_actualizado',
              familia_id: familiarId,
              familia_nombre: `${req.usuario.nombre} ${req.usuario.apellidos}`
            }
          });
        } catch (notifError) {
          console.error('Error creando notificación IBAN para scouter:', notifError);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'IBAN actualizado correctamente',
      data: { iban }
    });
  } catch (error) {
    console.error('Error actualizando IBAN:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el IBAN',
      error: error.message
    });
  }
};

/**
 * GET /api/familia/iban
 * Obtener IBAN del familiar autenticado
 */
const getIban = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const usuarios = await query('SELECT iban FROM usuarios WHERE id = $1', [familiarId]);

    res.status(200).json({
      success: true,
      data: { iban: usuarios.length > 0 ? usuarios[0].iban : null }
    });
  } catch (error) {
    console.error('Error obteniendo IBAN:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el IBAN',
      error: error.message
    });
  }
};

/**
 * GET /api/familia/:id/historial-iban
 * Obtener historial de cambios de IBAN (solo kraal/superadmin)
 */
const getHistorialIban = async (req, res) => {
  try {
    const familiaId = parseInt(req.params.id);

    if (isNaN(familiaId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de familia inválido'
      });
    }

    const historial = await query(
      `SELECT h.*, u.nombre as cambiado_por_nombre, u.apellidos as cambiado_por_apellidos
       FROM historial_iban h
       LEFT JOIN usuarios u ON h.cambiado_por_usuario_id = u.id
       WHERE h.familia_id = $1
       ORDER BY h.created_at DESC`,
      [familiaId]
    );

    res.status(200).json({
      success: true,
      data: historial
    });
  } catch (error) {
    console.error('Error obteniendo historial IBAN:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de IBAN',
      error: error.message
    });
  }
};

module.exports = {
  getEducandosVinculados,
  getEducandoById,
  getDashboardData,
  vincularEducando,
  desvincularEducando,
  verificarAcceso,
  getFamiliaresByEducando,
  getActividadesFamilia,
  getProximasActividades,
  updateIban,
  getIban,
  getHistorialIban
};
