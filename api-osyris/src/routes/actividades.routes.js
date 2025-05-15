const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Actividades
 *   description: Gestión de actividades
 */

/**
 * @swagger
 * /api/actividades:
 *   get:
 *     summary: Obtener todas las actividades
 *     tags: [Actividades]
 *     responses:
 *       200:
 *         description: Lista de actividades
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
 *       500:
 *         description: Error del servidor
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Endpoint para obtener actividades - En desarrollo',
    data: []
  });
});

/**
 * @swagger
 * /api/actividades/{id}:
 *   get:
 *     summary: Obtener una actividad por ID
 *     tags: [Actividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Actividad encontrada
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
 *       404:
 *         description: Actividad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: `Endpoint para obtener la actividad ${req.params.id} - En desarrollo`,
    data: {}
  });
});

module.exports = router; 