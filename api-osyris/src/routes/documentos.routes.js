const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Documentos
 *   description: Gestión de documentos
 */

/**
 * @swagger
 * /api/documentos:
 *   get:
 *     summary: Obtener todos los documentos
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de documentos
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
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Endpoint para obtener documentos - En desarrollo',
    data: []
  });
});

/**
 * @swagger
 * /api/documentos/{id}:
 *   get:
 *     summary: Obtener un documento por ID
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     responses:
 *       200:
 *         description: Documento encontrado
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
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Endpoint para obtener el documento ${req.params.id} - En desarrollo`,
    data: {}
  });
});

module.exports = router; 