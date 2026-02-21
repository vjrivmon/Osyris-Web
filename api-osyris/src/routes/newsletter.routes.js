const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletter.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Newsletter
 *   description: Sistema de newsletter segmentada para familias
 */

/**
 * @swagger
 * /api/newsletter/preview:
 *   get:
 *     summary: Preview de destinatarios según filtros
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filtro_seccion_id
 *         schema:
 *           type: integer
 *         description: Filtrar por sección
 *       - in: query
 *         name: filtro_estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado (ACTIVO, INACTIVO)
 *     responses:
 *       200:
 *         description: Cantidad de destinatarios
 */
router.get('/preview', verifyToken, checkRole(['admin', 'scouter']), newsletterController.previewDestinatarios);

/**
 * @swagger
 * /api/newsletter/historial:
 *   get:
 *     summary: Historial de newsletters enviadas
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Historial paginado
 */
router.get('/historial', verifyToken, checkRole(['admin', 'scouter']), newsletterController.getHistorial);

/**
 * @swagger
 * /api/newsletter/enviar:
 *   post:
 *     summary: Enviar newsletter segmentada a familias
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - contenido
 *             properties:
 *               titulo:
 *                 type: string
 *               contenido:
 *                 type: string
 *               filtro_seccion_id:
 *                 type: integer
 *               filtro_estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Newsletter enviada
 *       400:
 *         description: Datos inválidos o sin destinatarios
 */
router.post('/enviar', verifyToken, checkRole(['admin', 'scouter']), newsletterController.enviarNewsletter);

module.exports = router;
