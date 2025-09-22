const express = require('express');
const router = express.Router();
const seccionController = require('../controllers/seccion.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Secciones
 *   description: Gestión de secciones
 */

/**
 * @swagger
 * /api/secciones:
 *   get:
 *     summary: Obtener todas las secciones
 *     tags: [Secciones]
 *     responses:
 *       200:
 *         description: Lista de secciones
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
 *                     $ref: '#/components/schemas/Seccion'
 *       500:
 *         description: Error del servidor
 */
router.get('/', seccionController.getAll);

/**
 * @swagger
 * /api/secciones/{id}:
 *   get:
 *     summary: Obtener una sección por ID
 *     tags: [Secciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sección
 *     responses:
 *       200:
 *         description: Sección encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Seccion'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Sección no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', seccionController.getById);

/**
 * @swagger
 * /api/secciones:
 *   post:
 *     summary: Crear una nueva sección
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Seccion'
 *     responses:
 *       201:
 *         description: Sección creada
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
 *                   example: Sección creada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Seccion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', verifyToken, checkRole(['admin']), seccionController.create);

/**
 * @swagger
 * /api/secciones/{id}:
 *   put:
 *     summary: Actualizar una sección existente
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               nombre:
 *                 type: string
 *               rango_edad:
 *                 type: string
 *               color:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               icono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sección actualizada
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
 *                   example: Sección actualizada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Seccion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Sección no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verifyToken, checkRole(['admin']), seccionController.update);

/**
 * @swagger
 * /api/secciones/{id}:
 *   delete:
 *     summary: Eliminar una sección
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sección
 *     responses:
 *       200:
 *         description: Sección eliminada
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
 *                   example: Sección eliminada correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Sección no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verifyToken, checkRole(['admin']), seccionController.remove);

module.exports = router; 