const express = require('express');
const router = express.Router();
const notificacionesFamiliaController = require('../controllers/notificaciones_familia.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Notificaciones Familia
 *   description: Sistema de notificaciones para familiares
 */

/**
 * @swagger
 * /api/notificaciones-familia:
 *   get:
 *     summary: Obtener todas las notificaciones de un familiar
 *     tags: [Notificaciones Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: solo_no_leidas
 *         schema:
 *           type: boolean
 *         description: Filtrar solo notificaciones no leídas
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [urgente, importante, informativo, recordatorio]
 *         description: Tipo de notificación
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Categoría de la notificación
 *       - in: query
 *         name: prioridad
 *         schema:
 *           type: string
 *           enum: [alta, normal, baja]
 *         description: Prioridad de la notificación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *       - in: query
 *         name: scout_id
 *         schema:
 *           type: integer
 *         description: ID del scout para filtrar
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificacionFamilia'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', verifyToken, checkRole(['familia', 'admin', 'scouter']), notificacionesFamiliaController.getNotificacionesByFamiliar);

/**
 * @swagger
 * /api/notificaciones-familia/scouts/{scoutId}:
 *   get:
 *     summary: Obtener notificaciones de un scout específico
 *     tags: [Notificaciones Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scoutId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del scout
 *       - in: query
 *         name: solo_no_leidas
 *         schema:
 *           type: boolean
 *         description: Filtrar solo notificaciones no leídas
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [urgente, importante, informativo, recordatorio]
 *         description: Tipo de notificación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de notificaciones del scout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificacionFamilia'
 *       400:
 *         description: ID de scout inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/scouts/:scoutId', verifyToken, checkRole(['familia', 'admin', 'scouter']), notificacionesFamiliaController.getNotificacionesByScout);

/**
 * @swagger
 * /api/notificaciones-familia/{id}:
 *   get:
 *     summary: Obtener una notificación por ID
 *     tags: [Notificaciones Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificacionFamilia'
 *       400:
 *         description: ID de notificación inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verifyToken, checkRole(['familia', 'admin', 'scouter']), notificacionesFamiliaController.getNotificacionById);

/**
 * @swagger
 * /api/notificaciones-familia:
 *   post:
 *     summary: Crear una nueva notificación
 *     tags: [Notificaciones Familia]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scout_id
 *               - titulo
 *               - mensaje
 *               - tipo
 *             properties:
 *               scout_id:
 *                 type: integer
 *                 description: ID del scout
 *               titulo:
 *                 type: string
 *                 description: Título de la notificación
 *               mensaje:
 *                 type: string
 *                 description: Mensaje de la notificación
 *               tipo:
 *                 type: string
 *                 enum: [urgente, importante, informativo, recordatorio]
 *                 description: Tipo de notificación
 *               prioridad:
 *                 type: string
 *                 enum: [alta, normal, baja]
 *                 default: normal
 *                 description: Prioridad de la notificación
 *               categoria:
 *                 type: string
 *                 description: Categoría de la notificación
 *               enlace_accion:
 *                 type: string
 *                 description: URL para acción relacionada
 *               metadata:
 *                 type: object
 *                 description: Datos adicionales
 *               fecha_expiracion:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de expiración
 *     responses:
 *       201:
 *         description: Notificación creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notificación creada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/NotificacionFamilia'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', verifyToken, checkRole(['familia', 'admin', 'scouter']), notificacionesFamiliaController.createNotificacion);

/**
 * @swagger
 * /api/notificaciones-familia/masivas:
 *   post:
 *     summary: Crear notificaciones masivas
 *     tags: [Notificaciones Familia]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scout_ids
 *               - titulo
 *               - mensaje
 *               - tipo
 *             properties:
 *               scout_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Lista de IDs de scouts
 *               titulo:
 *                 type: string
 *                 description: Título de la notificación
 *               mensaje:
 *                 type: string
 *                 description: Mensaje de la notificación
 *               tipo:
 *                 type: string
 *                 enum: [urgente, importante, informativo, recordatorio]
 *                 description: Tipo de notificación
 *               prioridad:
 *                 type: string
 *                 enum: [alta, normal, baja]
 *                 default: normal
 *                 description: Prioridad de la notificación
 *               categoria:
 *                 type: string
 *                 description: Categoría de la notificación
 *               enlace_accion:
 *                 type: string
 *                 description: URL para acción relacionada
 *               metadata:
 *                 type: object
 *                 description: Datos adicionales
 *               fecha_expiracion:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de expiración
 *     responses:
 *       201:
 *         description: Notificaciones creadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: X notificaciones creadas correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificacionFamilia'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/masivas', verifyToken, checkRole(['admin', 'scouter']), notificacionesFamiliaController.createNotificacionesMasivas);

/**
 * @swagger
 * /api/notificaciones-familia/{id}/leida:
 *   put:
 *     summary: Marcar notificación como leída
 *     tags: [Notificaciones Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notificación marcada como leída
 *                 data:
 *                   $ref: '#/components/schemas/NotificacionFamilia'
 *       400:
 *         description: ID de notificación inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/leida', verifyToken, checkRole(['familia', 'admin', 'scouter']), notificacionesFamiliaController.marcarComoLeida);

/**
 * @swagger
 * /api/notificaciones-familia/marcar-todas-leidas:
 *   put:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notificaciones Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scout_id
 *         schema:
 *           type: integer
 *         description: ID del scout para filtrar (opcional)
 *     responses:
 *       200:
 *         description: Notificaciones marcadas como leídas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: X notificaciones marcadas como leídas
 *                 afectadas:
 *                   type: integer
 *                   description: Número de notificaciones afectadas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/marcar-todas-leidas', verifyToken, checkRole(['familia', 'admin', 'scouter']), notificacionesFamiliaController.marcarTodasComoLeidas);

/**
 * @swagger
 * /api/notificaciones-familia/{id}:
 *   delete:
 *     summary: Eliminar una notificación
 *     tags: [Notificaciones Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notificación eliminada correctamente
 *       400:
 *         description: ID de notificación inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verifyToken, checkRole(['familia', 'admin', 'scouter']), notificacionesFamiliaController.deleteNotificacion);

/**
 * @swagger
 * /api/notificaciones-familia/no-leidas:
 *   get:
 *     summary: Obtener contador de notificaciones no leídas
 *     tags: [Notificaciones Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scout_id
 *         schema:
 *           type: integer
 *         description: ID del scout para filtrar (opcional)
 *     responses:
 *       200:
 *         description: Contador de notificaciones no leídas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     no_leidas:
 *                       type: integer
 *                       description: Número de notificaciones no leídas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/no-leidas', verifyToken, checkRole(['familia', 'admin', 'scouter']), notificacionesFamiliaController.getContadorNoLeidas);

/**
 * @swagger
 * /api/notificaciones-familia/secciones/{seccionId}:
 *   post:
 *     summary: Enviar notificación a todos los familiares de una sección
 *     tags: [Notificaciones Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seccionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sección
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scout_id
 *               - titulo
 *               - mensaje
 *               - tipo
 *             properties:
 *               scout_id:
 *                 type: integer
 *                 description: ID del scout (debe pertenecer a la sección)
 *               titulo:
 *                 type: string
 *                 description: Título de la notificación
 *               mensaje:
 *                 type: string
 *                 description: Mensaje de la notificación
 *               tipo:
 *                 type: string
 *                 enum: [urgente, importante, informativo, recordatorio]
 *                 description: Tipo de notificación
 *               prioridad:
 *                 type: string
 *                 enum: [alta, normal, baja]
 *                 default: normal
 *                 description: Prioridad de la notificación
 *               categoria:
 *                 type: string
 *                 description: Categoría de la notificación
 *               enlace_accion:
 *                 type: string
 *                 description: URL para acción relacionada
 *               metadata:
 *                 type: object
 *                 description: Datos adicionales
 *               fecha_expiracion:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de expiración
 *     responses:
 *       201:
 *         description: Notificaciones enviadas a la sección
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: X notificaciones enviadas a la sección
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificacionFamilia'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/secciones/:seccionId', verifyToken, checkRole(['admin', 'scouter']), notificacionesFamiliaController.enviarAFamiliaresSeccion);

module.exports = router;