const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const dashboardComiteController = require('../controllers/dashboard-comite.controller');

/**
 * @swagger
 * tags:
 *   name: Dashboard Comite
 *   description: Endpoints read-only para el panel de comite y cocina
 */

/**
 * @swagger
 * /api/dashboard-comite/campamentos:
 *   get:
 *     summary: Listar campamentos disponibles
 *     tags: [Dashboard Comite]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de campamentos
 */
router.get('/campamentos', verifyToken, checkRole(['admin', 'comite']), dashboardComiteController.getCampamentos);

/**
 * @swagger
 * /api/dashboard-comite/campamento/{id}:
 *   get:
 *     summary: Detalle completo de un campamento
 *     tags: [Dashboard Comite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/campamento/:id', verifyToken, checkRole(['admin', 'comite']), dashboardComiteController.getCampamentoDetalle);

/**
 * @swagger
 * /api/dashboard-comite/campamento/{id}/export:
 *   get:
 *     summary: Exportar CSV de asistencia
 *     tags: [Dashboard Comite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/campamento/:id/export', verifyToken, checkRole(['admin', 'comite']), dashboardComiteController.exportCSV);

module.exports = router;
