const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletter.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * Rate limiter in-memory para el endpoint de envío de newsletter.
 * Máximo 5 envíos por usuario por hora.
 * Evita spam masivo si una cuenta kraal queda comprometida.
 */
const newsletterRateLimit = (() => {
  const windowMs = 60 * 60 * 1000; // 1 hora
  const maxRequests = 5;
  const store = new Map(); // userId -> [timestamps]

  return (req, res, next) => {
    const userId = req.usuario?.id;
    if (!userId) return next();

    const now = Date.now();
    const timestamps = (store.get(userId) || []).filter(t => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      const resetIn = Math.ceil((timestamps[0] + windowMs - now) / 60000);
      return res.status(429).json({
        success: false,
        message: `Límite de envíos alcanzado. Puedes volver a enviar en ${resetIn} minutos.`,
        reset_in_minutes: resetIn
      });
    }

    timestamps.push(now);
    store.set(userId, timestamps);
    next();
  };
})();

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
router.post('/enviar', verifyToken, checkRole(['admin', 'scouter', 'kraal']), newsletterRateLimit, newsletterController.enviarNewsletter);

module.exports = router;
