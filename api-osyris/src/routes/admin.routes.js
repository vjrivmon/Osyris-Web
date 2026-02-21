const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints administrativos específicos para CRM
 */

// Middleware global: superadmin, kraal y jefe_seccion acceden al panel admin
router.use(verifyToken, checkRole(['superadmin', 'kraal', 'jefe_seccion']));

/**
 * @swagger
 * /api/admin/metrics/summary:
 *   get:
 *     summary: Obtener métricas resumidas del dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del dashboard
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/metrics/summary', checkRole(['superadmin']), adminController.getMetricsSummary);

/**
 * @swagger
 * /api/admin/metrics/activity:
 *   get:
 *     summary: Obtener datos de actividad de los últimos 7 días
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de actividad semanal
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/metrics/activity', checkRole(['superadmin']), adminController.getActivityMetrics);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Obtener lista de usuarios con filtros y paginación
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios paginada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/users', adminController.getUsersWithFilters);

/**
 * @swagger
 * /api/admin/invitations:
 *   post:
 *     summary: Crear invitación para nuevo usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Invitación creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       409:
 *         description: Email ya está registrado
 */
router.post('/invitations', adminController.createInvitation);

/**
 * @swagger
 * /api/admin/invitations/bulk:
 *   post:
 *     summary: Crear múltiples invitaciones simultáneamente
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Invitaciones procesadas exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.post('/invitations/bulk', adminController.createBulkInvitations);

/**
 * @swagger
 * /api/admin/users/pending:
 *   get:
 *     summary: Obtener usuarios pendientes de completar registro
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios pendientes
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/users/pending', adminController.getPendingUsers);

/**
 * @swagger
 * /api/admin/invitations/{id}/resend:
 *   post:
 *     summary: Reenviar invitación a usuario pendiente
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invitación reenviada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado o ya está activo
 */
router.post('/invitations/:id/resend', adminController.resendInvitation);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Actualizar usuario (endpoint específico para admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/users/:id', adminController.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Eliminar usuario (endpoint específico para admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * @swagger
 * /api/admin/pages/popular:
 *   get:
 *     summary: Obtener páginas más visitadas
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de páginas más visitadas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/pages/popular', adminController.getPopularPages);

/**
 * @swagger
 * /api/admin/alerts:
 *   get:
 *     summary: Obtener alertas del sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas activas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/alerts', adminController.getAlerts);

// ========== GESTIÓN DE VINCULACIÓN FAMILIA-EDUCANDO ==========
const familiarController = require('../controllers/familiar.controller');
const educandoController = require('../controllers/educando.controller');

router.get('/familiares/activas', async (req, res) => {
  try {
    const { query } = require('../config/db.config');

    const familiares = await query(`
      SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, u.activo as estado,
             u.fecha_registro as "fechaCreacion", u.ultimo_acceso as "ultimoAcceso",
             COUNT(DISTINCT fe.educando_id) as "educandosVinculados"
      FROM usuarios u
      LEFT JOIN familiares_educandos fe ON u.id = fe.familiar_id
      WHERE u.rol = 'familia' AND u.activo = true
      GROUP BY u.id
      ORDER BY u.nombre, u.apellidos
    `);

    for (const familiar of familiares) {
      const educandos = await query(`
        SELECT e.id, e.nombre, e.apellidos, s.nombre as seccion,
               fe.relacion, fe.es_contacto_principal as "esContactoPrincipal",
               fe.fecha_creacion as "fechaVinculacion"
        FROM familiares_educandos fe
        JOIN educandos e ON fe.educando_id = e.id
        LEFT JOIN secciones s ON e.seccion_id = s.id
        WHERE fe.familiar_id = $1
      `, [familiar.id]);

      familiar.educandosVinculados = educandos;
      familiar.emailVerificado = true;
      familiar.documentosPendientes = 0;
    }

    res.json({
      success: true,
      familiares
    });
  } catch (error) {
    console.error('Error obteniendo familiares activas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener familiares activas',
      error: error.message
    });
  }
});

router.get('/educandos/disponibles', async (req, res) => {
  try {
    const { query } = require('../config/db.config');

    const educandos = await query(`
      SELECT e.id, e.nombre, e.apellidos, e.email, e.telefono_movil as telefono,
             s.nombre as seccion, e.seccion_id
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE e.activo = true
      ORDER BY e.apellidos, e.nombre
    `);

    res.json({
      success: true,
      educandos
    });
  } catch (error) {
    console.error('Error obteniendo educandos disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener educandos disponibles',
      error: error.message
    });
  }
});

router.post('/familiares/vincular-scout', async (req, res) => {
  try {
    const { query } = require('../config/db.config');
    const { sendVinculacionEmail } = require('../utils/email');
    const { familiarId, educandoId, relationType, relationDescription, esContactoPrincipal } = req.body;

    const relationMap = {
      'PADRE': 'padre',
      'MADRE': 'madre',
      'TUTOR_LEGAL': 'tutor_legal',
      'ABUELO': 'abuelo',
      'OTRO': 'otro'
    };

    const relacion = relationMap[relationType] || 'otro';

    const existente = await query(`
      SELECT id FROM familiares_educandos
      WHERE familiar_id = $1 AND educando_id = $2
    `, [familiarId, educandoId]);

    if (existente.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una vinculación entre este familiar y educando'
      });
    }

    const [familiar] = await query(`
      SELECT nombre, apellidos, email
      FROM usuarios
      WHERE id = $1 AND rol = 'familia'
    `, [familiarId]);

    const [educando] = await query(`
      SELECT e.nombre, e.apellidos, s.nombre as seccion
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE e.id = $1
    `, [educandoId]);

    if (!familiar || !educando) {
      return res.status(404).json({
        success: false,
        message: 'Familiar o educando no encontrado'
      });
    }

    await query(`
      INSERT INTO familiares_educandos (familiar_id, educando_id, relacion, es_contacto_principal)
      VALUES ($1, $2, $3, $4)
    `, [familiarId, educandoId, relacion, esContactoPrincipal || false]);

    const nombreFamiliar = `${familiar.nombre} ${familiar.apellidos}`;
    const nombreEducando = `${educando.nombre} ${educando.apellidos}`;
    const seccion = educando.seccion || 'Sin sección';

    sendVinculacionEmail(familiar.email, nombreFamiliar, nombreEducando, seccion, relacion)
      .then(() => {
        console.log(`✅ Email de vinculación enviado a ${familiar.email}`);
      })
      .catch(err => {
        console.error(`⚠️ No se pudo enviar email de vinculación a ${familiar.email}:`, err.message);
      });

    res.status(201).json({
      success: true,
      message: 'Vinculación creada correctamente'
    });
  } catch (error) {
    console.error('Error vinculando scout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al vincular scout',
      error: error.message
    });
  }
});

router.delete('/familiares/desvincular-scout', async (req, res) => {
  try {
    const { query } = require('../config/db.config');
    const { sendDesvinculacionEmail } = require('../utils/email');
    const { familiarId, educandoId } = req.body;

    const [familiar] = await query(`
      SELECT nombre, apellidos, email
      FROM usuarios
      WHERE id = $1 AND rol = 'familia'
    `, [familiarId]);

    const [educando] = await query(`
      SELECT e.nombre, e.apellidos, s.nombre as seccion
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE e.id = $1
    `, [educandoId]);

    const result = await query(`
      DELETE FROM familiares_educandos
      WHERE familiar_id = $1 AND educando_id = $2
    `, [familiarId, educandoId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vinculación no encontrada'
      });
    }

    if (familiar && educando) {
      const nombreFamiliar = `${familiar.nombre} ${familiar.apellidos}`;
      const nombreEducando = `${educando.nombre} ${educando.apellidos}`;
      const seccion = educando.seccion || 'Sin sección';

      sendDesvinculacionEmail(familiar.email, nombreFamiliar, nombreEducando, seccion)
        .then(() => {
          console.log(`✅ Email de desvinculación enviado a ${familiar.email}`);
        })
        .catch(err => {
          console.error(`⚠️ No se pudo enviar email de desvinculación a ${familiar.email}:`, err.message);
        });
    }

    res.json({
      success: true,
      message: 'Vinculación eliminada correctamente'
    });
  } catch (error) {
    console.error('Error desvinculando scout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desvincular scout',
      error: error.message
    });
  }
});

router.get('/familiares/relaciones', async (req, res) => {
  try {
    const { query } = require('../config/db.config');

    const relaciones = await query(`
      SELECT fe.id, fe.relacion, fe.es_contacto_principal as "esContactoPrincipal",
             fe.fecha_creacion as "fechaCreacion",
             u.id as "familiarId", u.nombre as "familiarNombre",
             u.apellidos as "familiarApellidos", u.email as "familiarEmail",
             e.id as "educandoId", e.nombre as "educandoNombre",
             e.apellidos as "educandoApellidos",
             s.nombre as "educandoSeccion"
      FROM familiares_educandos fe
      JOIN usuarios u ON fe.familiar_id = u.id
      JOIN educandos e ON fe.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE u.activo = true AND e.activo = true
      ORDER BY fe.fecha_creacion DESC
    `);

    res.json({
      success: true,
      relaciones,
      total: relaciones.length
    });
  } catch (error) {
    console.error('Error obteniendo relaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener relaciones',
      error: error.message
    });
  }
});

router.get('/familiares/listar', async (req, res) => {
  try {
    const { query } = require('../config/db.config');
    const { page = 1, limit = 10, estado = '', busqueda = '' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = ["u.rol = 'familia'"];
    const params = [];
    let paramIndex = 1;

    if (estado) {
      whereConditions.push(`u.activo = $${paramIndex}`);
      params.push(estado === 'ACTIVO');
      paramIndex++;
    }

    if (busqueda) {
      whereConditions.push(`(u.nombre ILIKE $${paramIndex} OR u.apellidos ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${busqueda}%`);
      paramIndex++;
    }

    const countQuery = `SELECT COUNT(*) as total FROM usuarios u WHERE ${whereConditions.join(' AND ')}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult[0].total);

    params.push(parseInt(limit));
    params.push(offset);

    const familiares = await query(`
      SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono,
             CASE WHEN u.activo THEN 'ACTIVO' ELSE 'INACTIVO' END as estado,
             u.fecha_registro as "fechaCreacion", u.ultimo_acceso as "ultimoAcceso",
             COUNT(DISTINCT fe.educando_id) as "educandosCount"
      FROM usuarios u
      LEFT JOIN familiares_educandos fe ON u.id = fe.familiar_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY u.id
      ORDER BY u.fecha_registro DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    for (const familiar of familiares) {
      const educandos = await query(`
        SELECT e.id, e.nombre, e.apellidos, s.nombre as seccion, s.id as seccion_id,
               fe.relacion, fe.es_contacto_principal as "esContactoPrincipal",
               fe.fecha_creacion as "fechaVinculacion"
        FROM familiares_educandos fe
        JOIN educandos e ON fe.educando_id = e.id
        LEFT JOIN secciones s ON e.seccion_id = s.id
        WHERE fe.familiar_id = $1
      `, [familiar.id]);

      familiar.educandosVinculados = educandos;
      familiar.emailVerificado = true;
      familiar.documentosPendientes = 0;
    }

    res.json({
      success: true,
      familiares,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Error listando familiares:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar familiares',
      error: error.message
    });
  }
});

router.get('/familiares/estadisticas', async (req, res) => {
  try {
    const { query } = require('../config/db.config');

    const totalResult = await query(`SELECT COUNT(*) as total FROM usuarios WHERE rol = 'familia'`);
    const totalFamilias = parseInt(totalResult[0].total);

    const activasResult = await query(`SELECT COUNT(*) as total FROM usuarios WHERE rol = 'familia' AND activo = true`);
    const familiasActivas = parseInt(activasResult[0].total);

    const familiasPendientes = totalFamilias - familiasActivas;

    const educandosResult = await query(`
      SELECT COUNT(DISTINCT e.id) as total
      FROM educandos e
      JOIN familiares_educandos fe ON e.id = fe.educando_id
      WHERE e.activo = true
    `);
    const educandosConFamilia = parseInt(educandosResult[0].total);

    res.json({
      success: true,
      estadisticas: {
        totalFamilias,
        familiasActivas,
        familiasPendientes,
        educandosConFamilia,
        documentosPendientes: 0,
        documentosAprobados: 0,
        usoUltimos30Dias: 0,
        familiasSinAcceso60Dias: 0,
        estadisticasPorSeccion: []
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

router.get('/familiares/documentos-pendientes', async (req, res) => {
  try {
    res.json({
      success: true,
      documentos: []
    });
  } catch (error) {
    console.error('Error obteniendo documentos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentos pendientes',
      error: error.message
    });
  }
});

router.post('/familiares/invitar', async (req, res) => {
  try {
    const { query, addUserRole } = require('../config/db.config');
    const crypto = require('crypto');
    const { sendInvitationEmail } = require('../utils/email');
    const { email, nombre, apellidos, telefono, educandosIds, relationType, mensajePersonalizado } = req.body;

    const relationMap = {
      'PADRE': 'padre',
      'MADRE': 'madre',
      'TUTOR_LEGAL': 'tutor_legal',
      'ABUELO': 'abuelo',
      'OTRO': 'otro'
    };
    const relacion = relationMap[relationType] || 'otro';

    const existente = await query(`SELECT id, nombre, apellidos, rol, activo FROM usuarios WHERE email = $1`, [email]);

    let userId;
    let yaExistia = false;

    if (existente.length > 0) {
      userId = existente[0].id;
      yaExistia = true;

      await addUserRole(userId, 'familia');
      console.log(`✅ Rol 'familia' añadido al usuario existente ${email} (id: ${userId})`);
    } else {
      const invitationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const userResult = await query(`
        INSERT INTO usuarios (email, nombre, apellidos, telefono, rol, activo, invitation_token, invitation_expires_at, fecha_registro)
        VALUES ($1, $2, $3, $4, 'familia', false, $5, $6, NOW())
        RETURNING id
      `, [email, nombre, apellidos, telefono || null, invitationToken, expiresAt]);

      userId = userResult[0].id;

      await addUserRole(userId, 'familia', true);

      try {
        await sendInvitationEmail(email, nombre, invitationToken, 'familia');
        console.log(`✅ Email de invitacion enviado a ${email}`);
      } catch (emailError) {
        console.error(`⚠️ Error enviando email a ${email}:`, emailError.message);
        console.log(`🔗 Enlace de registro: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/registro?token=${invitationToken}`);
      }
    }

    if (educandosIds && educandosIds.length > 0) {
      for (const educandoId of educandosIds) {
        await query(`
          INSERT INTO familiares_educandos (familiar_id, educando_id, relacion, es_contacto_principal)
          VALUES ($1, $2, $3, false)
          ON CONFLICT (familiar_id, educando_id) DO NOTHING
        `, [userId, educandoId, relacion]);
      }
    }

    const mensaje = yaExistia
      ? `El usuario ${email} ya existía. Se le ha añadido el rol de familia y vinculado los educandos seleccionados.`
      : `Invitación enviada correctamente a ${email}`;

    res.status(201).json({
      success: true,
      message: mensaje,
      data: {
        id: userId,
        email,
        nombre: yaExistia ? existente[0].nombre : nombre,
        apellidos: yaExistia ? existente[0].apellidos : apellidos,
        yaExistia
      }
    });
  } catch (error) {
    console.error('Error invitando familiar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al invitar familiar',
      error: error.message
    });
  }
});

module.exports = router;
