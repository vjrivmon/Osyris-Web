const express = require('express');
const router = express.Router();
const familiarController = require('../controllers/familiar.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Familiares
 *   description: Gestión de relaciones familiares y scouts vinculados
 */

/**
 * @swagger
 * /api/familiares/scouts:
 *   get:
 *     summary: Obtener todos los scouts de un familiar autenticado
 *     tags: [Familiares]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de scouts del familiar
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
 *                     $ref: '#/components/schemas/FamiliarScout'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/scouts', verifyToken, checkRole(['familia', 'admin', 'scouter']), familiarController.getScoutsByFamiliar);

/**
 * @swagger
 * /api/familiares/scouts/{scoutId}:
 *   get:
 *     summary: Obtener familiares de un scout específico
 *     tags: [Familiares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scoutId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del scout
 *     responses:
 *       200:
 *         description: Lista de familiares del scout
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
 *                     $ref: '#/components/schemas/FamiliarScout'
 *       400:
 *         description: ID de scout inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/scouts/:scoutId', verifyToken, checkRole(['admin', 'scouter']), familiarController.getFamiliaresByScout);

/**
 * @swagger
 * /api/familiares/relaciones/{id}:
 *   get:
 *     summary: Obtener una relación específica
 *     tags: [Familiares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la relación
 *     responses:
 *       200:
 *         description: Relación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FamiliarScout'
 *       400:
 *         description: ID de relación inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Relación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/relaciones/:id', verifyToken, familiarController.getRelacionById);

/**
 * @swagger
 * /api/familiares/relaciones:
 *   post:
 *     summary: Crear una nueva relación familiar
 *     tags: [Familiares]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FamiliarScout'
 *     responses:
 *       201:
 *         description: Relación creada
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
 *                   example: Relación familiar creada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/FamiliarScout'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       409:
 *         description: La relación ya existe
 *       500:
 *         description: Error del servidor
 */
router.post('/relaciones', verifyToken, checkRole(['admin', 'scouter']), familiarController.createRelacion);

/**
 * @swagger
 * /api/familiares/relaciones/{id}:
 *   put:
 *     summary: Actualizar una relación existente
 *     tags: [Familiares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la relación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               relacion:
 *                 type: string
 *                 enum: [padre, madre, tutor_legal, abuelo, otro]
 *               es_contacto_principal:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Relación actualizada
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
 *                   example: Relación actualizada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/FamiliarScout'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Relación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/relaciones/:id', verifyToken, familiarController.updateRelacion);

/**
 * @swagger
 * /api/familiares/relaciones/{id}:
 *   delete:
 *     summary: Eliminar una relación
 *     tags: [Familiares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la relación
 *     responses:
 *       200:
 *         description: Relación eliminada
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
 *                   example: Relación eliminada correctamente
 *       400:
 *         description: ID de relación inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Relación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/relaciones/:id', verifyToken, checkRole(['admin', 'scouter']), familiarController.deleteRelacion);

/**
 * @swagger
 * /api/familiares/contacto-principal:
 *   put:
 *     summary: Establecer contacto principal
 *     tags: [Familiares]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - familiar_id
 *               - scout_id
 *               - es_contacto_principal
 *             properties:
 *               familiar_id:
 *                 type: integer
 *                 description: ID del familiar
 *               scout_id:
 *                 type: integer
 *                 description: ID del scout
 *               es_contacto_principal:
 *                 type: boolean
 *                 description: Si es contacto principal
 *     responses:
 *       200:
 *         description: Contacto principal actualizado
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
 *                   example: Contacto principal actualizado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/FamiliarScout'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/contacto-principal', verifyToken, familiarController.setContactoPrincipal);

/**
 * @swagger
 * /api/familiares/scouts/{scoutId}/contactos-principales:
 *   get:
 *     summary: Obtener contactos principales de un scout
 *     tags: [Familiares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scoutId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del scout
 *     responses:
 *       200:
 *         description: Lista de contactos principales
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
 *                       nombre:
 *                         type: string
 *                       apellidos:
 *                         type: string
 *                       email:
 *                         type: string
 *                       telefono:
 *                         type: string
 *       400:
 *         description: ID de scout inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/scouts/:scoutId/contactos-principales', verifyToken, familiarController.getContactosPrincipales);

/**
 * @swagger
 * /api/familiares/acceso/{familiar_id}/{scout_id}:
 *   get:
 *     summary: Verificar acceso de un familiar a un scout
 *     tags: [Familiares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familiar_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del familiar
 *       - in: path
 *         name: scout_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del scout
 *     responses:
 *       200:
 *         description: Estado de acceso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tieneAcceso:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: IDs inválidos
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/acceso/:familiar_id/:scout_id', verifyToken, familiarController.verificarAcceso);

module.exports = router;