const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard-scouter.controller');

/**
 * @swagger
 * tags:
 *   name: Dashboard Scouter
 *   description: Endpoints para el panel de control del Kraal
 */

/**
 * @swagger
 * /api/dashboard-scouter/summary:
 *   get:
 *     summary: Obtener resumen completo del dashboard
 *     tags: [Dashboard Scouter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: expandSabado
 *         schema:
 *           type: boolean
 *         description: Incluir lista de confirmaciones del proximo sabado
 *       - in: query
 *         name: expandCampamento
 *         schema:
 *           type: boolean
 *         description: Incluir lista de inscripciones del proximo campamento
 *     responses:
 *       200:
 *         description: Datos del dashboard
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/summary', verifyToken, checkRole(['admin', 'scouter']), dashboardController.getDashboardSummary);

/**
 * @swagger
 * /api/dashboard-scouter/sabado/{actividadId}/detalle:
 *   get:
 *     summary: Obtener detalle de asistencias de una reunion
 *     tags: [Dashboard Scouter]
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
 *         description: Detalle de asistencias
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Actividad no encontrada
 */
router.get('/sabado/:actividadId/detalle', verifyToken, checkRole(['admin', 'scouter']), dashboardController.getSabadoDetalle);

/**
 * @swagger
 * /api/dashboard-scouter/campamento/{actividadId}/detalle:
 *   get:
 *     summary: Obtener detalle de inscripciones de un campamento
 *     tags: [Dashboard Scouter]
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
 *         description: Detalle de inscripciones
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Actividad no encontrada
 */
router.get('/campamento/:actividadId/detalle', verifyToken, checkRole(['admin', 'scouter']), dashboardController.getCampamentoDetalle);

/**
 * @swagger
 * /api/dashboard-scouter/notificaciones:
 *   delete:
 *     summary: Limpiar todas las notificaciones del scouter
 *     tags: [Dashboard Scouter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones eliminadas
 *       401:
 *         description: No autorizado
 */
router.delete('/notificaciones', verifyToken, checkRole(['admin', 'scouter']), dashboardController.limpiarNotificaciones);

module.exports = router;
