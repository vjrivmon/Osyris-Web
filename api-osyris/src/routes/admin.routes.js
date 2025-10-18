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

// Middleware para verificar que sea admin
router.use(verifyToken, checkRole(['admin']));

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsuarios:
 *                       type: integer
 *                     usuariosActivosHoy:
 *                       type: integer
 *                     totalActividades:
 *                       type: integer
 *                     totalMensajes:
 *                       type: integer
 *                     engagementRate:
 *                       type: number
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/metrics/summary', adminController.getMetricsSummary);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       usuarios:
 *                         type: integer
 *                       actividades:
 *                         type: integer
 *                       mensajes:
 *                         type: integer
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/metrics/activity', adminController.getActivityMetrics);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Obtener lista de usuarios con filtros y paginación
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Límite de resultados por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda full-text
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [admin, scouter, usuario]
 *         description: Filtro por rol
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo, suspendido]
 *         description: Filtro por estado
 *       - in: query
 *         name: seccion
 *         schema:
 *           type: string
 *           enum: [castores, manada, tropa, pioneros, rutas]
 *         description: Filtro por sección
 *     responses:
 *       200:
 *         description: Lista de usuarios paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Usuario'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - nombre
 *               - rol
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [admin, scouter, usuario]
 *               seccion_id:
 *                 type: integer
 *                 description: ID de la sección scout
 *     responses:
 *       201:
 *         description: Invitación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     invitationToken:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
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
 * /api/admin/users/pending:
 *   get:
 *     summary: Obtener usuarios pendientes de completar registro
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       email:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       apellidos:
 *                         type: string
 *                       rol:
 *                         type: string
 *                       invitation_expires_at:
 *                         type: string
 *                         format: date-time
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Invitación reenviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [admin, scouter, usuario]
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo, suspendido]
 *               seccion:
 *                 type: string
 *                 enum: [castores, manada, tropa, pioneros, rutas]
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       page:
 *                         type: string
 *                       title:
 *                         type: string
 *                       visits:
 *                         type: integer
 *                       uniqueVisitors:
 *                         type: integer
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [error, warning, info, success]
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       read:
 *                         type: boolean
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/alerts', adminController.getAlerts);

module.exports = router;