/**
 * Rutas de Mensajes Scouter-Familia
 * MED-005: Sistema de comunicacion entre scouters y familias
 */

const express = require('express');
const router = express.Router();
const mensajesScouterController = require('../controllers/mensajes-scouter.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Mensajes Scouter
 *   description: Sistema de mensajeria de scouters a familias
 */

/**
 * @swagger
 * /api/mensajes-scouter/seccion:
 *   post:
 *     summary: Enviar mensaje a todas las familias de la seccion
 *     tags: [Mensajes Scouter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asunto
 *               - mensaje
 *             properties:
 *               asunto:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 description: Asunto del mensaje
 *               mensaje:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *                 description: Contenido del mensaje
 *               prioridad:
 *                 type: string
 *                 enum: [alta, normal, baja]
 *                 default: normal
 *                 description: Prioridad del mensaje
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente
 *       400:
 *         description: Datos invalidos
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/seccion', verifyToken, checkRole(['admin', 'scouter']), mensajesScouterController.enviarMensajeASeccion);

/**
 * @swagger
 * /api/mensajes-scouter/educando:
 *   post:
 *     summary: Enviar mensaje a las familias de un educando especifico
 *     tags: [Mensajes Scouter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - educando_id
 *               - asunto
 *               - mensaje
 *             properties:
 *               educando_id:
 *                 type: integer
 *                 description: ID del educando
 *               asunto:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 description: Asunto del mensaje
 *               mensaje:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *                 description: Contenido del mensaje
 *               prioridad:
 *                 type: string
 *                 enum: [alta, normal, baja]
 *                 default: normal
 *                 description: Prioridad del mensaje
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente
 *       400:
 *         description: Datos invalidos
 *       403:
 *         description: No autorizado o educando no pertenece a la seccion
 *       500:
 *         description: Error del servidor
 */
router.post('/educando', verifyToken, checkRole(['admin', 'scouter']), mensajesScouterController.enviarMensajeAEducando);

/**
 * @swagger
 * /api/mensajes-scouter/educandos:
 *   post:
 *     summary: Enviar mensaje a familias de varios educandos seleccionados
 *     tags: [Mensajes Scouter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - educando_ids
 *               - asunto
 *               - mensaje
 *             properties:
 *               educando_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 description: Lista de IDs de educandos
 *               asunto:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 description: Asunto del mensaje
 *               mensaje:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *                 description: Contenido del mensaje
 *               prioridad:
 *                 type: string
 *                 enum: [alta, normal, baja]
 *                 default: normal
 *                 description: Prioridad del mensaje
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente
 *       400:
 *         description: Datos invalidos
 *       403:
 *         description: No autorizado o educandos no pertenecen a la seccion
 *       500:
 *         description: Error del servidor
 */
router.post('/educandos', verifyToken, checkRole(['admin', 'scouter']), mensajesScouterController.enviarMensajeAEducandosSeleccionados);

/**
 * @swagger
 * /api/mensajes-scouter/historial:
 *   get:
 *     summary: Obtener historial de mensajes enviados
 *     tags: [Mensajes Scouter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Limite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginacion
 *     responses:
 *       200:
 *         description: Historial de mensajes
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/historial', verifyToken, checkRole(['admin', 'scouter']), mensajesScouterController.obtenerHistorialMensajes);

module.exports = router;
