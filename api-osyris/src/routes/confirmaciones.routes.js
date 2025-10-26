const express = require('express');
const router = express.Router();
const confirmacionesController = require('../controllers/confirmaciones.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Confirmaciones Asistencia
 *   description: Gestión de confirmaciones de asistencia a actividades
 */

/**
 * @swagger
 * /api/confirmaciones:
 *   get:
 *     summary: Obtener todas las confirmaciones de un familiar
 *     tags: [Confirmaciones Asistencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scout_id
 *         schema:
 *           type: integer
 *         description: ID del scout para filtrar
 *       - in: query
 *         name: asistira
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de asistencia
 *       - in: query
 *         name: estado_actividad
 *         schema:
 *           type: string
 *         description: Estado de la actividad
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de confirmaciones
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
 *                     $ref: '#/components/schemas/ConfirmacionAsistencia'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', verifyToken, checkRole(['familia', 'admin', 'scouter']), confirmacionesController.getConfirmacionesByFamiliar);

/**
 * @swagger
 * /api/confirmaciones/actividades/{actividadId}:
 *   get:
 *     summary: Obtener confirmaciones de una actividad
 *     tags: [Confirmaciones Asistencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actividadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la actividad
 *       - in: query
 *         name: solo_asistiran
 *         schema:
 *           type: boolean
 *         description: Filtrar solo los que asistirán
 *       - in: query
 *         name: solo_no_asistiran
 *         schema:
 *           type: boolean
 *         description: Filtrar solo los que no asistirán
 *       - in: query
 *         name: seccion_id
 *         schema:
 *           type: integer
 *         description: Filtrar por sección
 *     responses:
 *       200:
 *         description: Lista de confirmaciones de la actividad
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
 *                     $ref: '#/components/schemas/ConfirmacionAsistencia'
 *       400:
 *         description: ID de actividad inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/actividades/:actividadId', verifyToken, checkRole(['admin', 'scouter']), confirmacionesController.getConfirmacionesByActividad);

/**
 * @swagger
 * /api/confirmaciones/scouts/{scoutId}:
 *   get:
 *     summary: Obtener confirmaciones de un scout específico
 *     tags: [Confirmaciones Asistencia]
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
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de confirmaciones del scout
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
 *                     $ref: '#/components/schemas/ConfirmacionAsistencia'
 *       400:
 *         description: ID de scout inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/scouts/:scoutId', verifyToken, checkRole(['familia', 'admin', 'scouter']), confirmacionesController.getConfirmacionesByScout);

/**
 * @swagger
 * /api/confirmaciones/{id}:
 *   get:
 *     summary: Obtener una confirmación específica
 *     tags: [Confirmaciones Asistencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la confirmación
 *     responses:
 *       200:
 *         description: Confirmación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ConfirmacionAsistencia'
 *       400:
 *         description: ID de confirmación inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Confirmación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verifyToken, checkRole(['familia', 'admin', 'scouter']), confirmacionesController.getConfirmacionById);

/**
 * @swagger
 * /api/confirmaciones:
 *   post:
 *     summary: Crear o actualizar una confirmación
 *     tags: [Confirmaciones Asistencia]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - actividad_id
 *               - scout_id
 *               - asistira
 *             properties:
 *               actividad_id:
 *                 type: integer
 *                 description: ID de la actividad
 *               scout_id:
 *                 type: integer
 *                 description: ID del scout
 *               asistira:
 *                 type: boolean
 *                 description: Si el scout asistirá a la actividad
 *               comentarios:
 *                 type: string
 *                 description: Comentarios adicionales
 *     responses:
 *       201:
 *         description: Confirmación guardada
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
 *                   example: Confirmación guardada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/ConfirmacionAsistencia'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', verifyToken, checkRole(['familia', 'admin', 'scouter']), confirmacionesController.createOrUpdateConfirmacion);

/**
 * @swagger
 * /api/confirmaciones/{id}:
 *   put:
 *     summary: Actualizar una confirmación existente
 *     tags: [Confirmaciones Asistencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la confirmación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asistira:
 *                 type: boolean
 *                 description: Si el scout asistirá a la actividad
 *               comentarios:
 *                 type: string
 *                 description: Comentarios adicionales
 *     responses:
 *       200:
 *         description: Confirmación actualizada
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
 *                   example: Confirmación actualizada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/ConfirmacionAsistencia'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Confirmación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verifyToken, checkRole(['familia', 'admin', 'scouter']), confirmacionesController.updateConfirmacion);

/**
 * @swagger
 * /api/confirmaciones/{id}:
 *   delete:
 *     summary: Eliminar una confirmación
 *     tags: [Confirmaciones Asistencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la confirmación
 *     responses:
 *       200:
 *         description: Confirmación eliminada
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
 *                   example: Confirmación eliminada correctamente
 *       400:
 *         description: ID de confirmación inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Confirmación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verifyToken, checkRole(['familia', 'admin', 'scouter']), confirmacionesController.deleteConfirmacion);

/**
 * @swagger
 * /api/confirmaciones/actividades/{actividadId}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de asistencia de una actividad
 *     tags: [Confirmaciones Asistencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actividadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Estadísticas de la actividad
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
 *                     total_confirmaciones:
 *                       type: integer
 *                     asistiran:
 *                       type: integer
 *                     no_asistiran:
 *                       type: integer
 *                     sin_confirmar:
 *                       type: integer
 *                     scouts_unicos:
 *                       type: integer
 *                     scouts_sin_confirmar:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                           apellidos:
 *                             type: string
 *                           seccion_nombre:
 *                             type: string
 *       400:
 *         description: ID de actividad inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/actividades/:actividadId/estadisticas', verifyToken, checkRole(['admin', 'scouter']), confirmacionesController.getEstadisticasActividad);

/**
 * @swagger
 * /api/confirmaciones/pendientes:
 *   get:
 *     summary: Obtener actividades próximas que requieren confirmación
 *     tags: [Confirmaciones Asistencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Días futuros para buscar actividades
 *     responses:
 *       200:
 *         description: Lista de actividades pendientes
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       titulo:
 *                         type: string
 *                       fecha_inicio:
 *                         type: string
 *                         format: date-time
 *                       fecha_fin:
 *                         type: string
 *                         format: date-time
 *                       lugar:
 *                         type: string
 *                       inscripcion_abierta:
 *                         type: boolean
 *                       cupo_maximo:
 *                         type: integer
 *                       confirmados_asistencia:
 *                         type: integer
 *                       sin_confirmar:
 *                         type: integer
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/pendientes', verifyToken, checkRole(['familia', 'admin', 'scouter']), confirmacionesController.getActividadesPendientes);

/**
 * @swagger
 * /api/confirmaciones/rango-fechas:
 *   get:
 *     summary: Obtener confirmaciones por rango de fechas
 *     tags: [Confirmaciones Asistencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *     responses:
 *       200:
 *         description: Lista de confirmaciones en el rango de fechas
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
 *                     $ref: '#/components/schemas/ConfirmacionAsistencia'
 *       400:
 *         description: Fechas inválidas o faltantes
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/rango-fechas', verifyToken, checkRole(['familia', 'admin', 'scouter']), confirmacionesController.getConfirmacionesByRangoFechas);

module.exports = router;