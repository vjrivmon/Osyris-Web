const express = require('express');
const router = express.Router();
const familiaController = require('../controllers/familia.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Familia
 *   description: Portal de familias - acceso a información de educandos vinculados
 */

/**
 * @swagger
 * /api/familia/dashboard:
 *   get:
 *     summary: Obtener datos del dashboard para el familiar autenticado
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del dashboard obtenidos exitosamente
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/dashboard', verifyToken, checkRole(['familia', 'admin']), familiaController.getDashboardData);

/**
 * @swagger
 * /api/familia/hijos:
 *   get:
 *     summary: Obtener todos los educandos vinculados al familiar autenticado
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de educandos vinculados
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/hijos', verifyToken, checkRole(['familia', 'admin']), familiaController.getEducandosVinculados);

/**
 * @swagger
 * /api/familia/educando/{educandoId}:
 *   get:
 *     summary: Obtener detalles de un educando vinculado
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: educandoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Detalles del educando
 *       400:
 *         description: ID inválido
 *       403:
 *         description: No tienes acceso a este educando
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/educando/:educandoId', verifyToken, checkRole(['familia', 'admin']), familiaController.getEducandoById);

/**
 * @swagger
 * /api/familia/educando/{educandoId}/familiares:
 *   get:
 *     summary: Obtener todos los familiares de un educando (solo admin/scouter)
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: educandoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Lista de familiares
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/educando/:educandoId/familiares', verifyToken, checkRole(['admin', 'scouter']), familiaController.getFamiliaresByEducando);

/**
 * @swagger
 * /api/familia/verificar-acceso/{educandoId}:
 *   get:
 *     summary: Verificar si el familiar tiene acceso a un educando
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: educandoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Estado de acceso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/verificar-acceso/:educandoId', verifyToken, checkRole(['familia', 'admin']), familiaController.verificarAcceso);

/**
 * @swagger
 * /api/familia/vincular:
 *   post:
 *     summary: Vincular un educando a un familiar (solo admin)
 *     tags: [Familia]
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
 *               - educando_id
 *               - relacion
 *             properties:
 *               familiar_id:
 *                 type: integer
 *                 description: ID del familiar
 *               educando_id:
 *                 type: integer
 *                 description: ID del educando
 *               relacion:
 *                 type: string
 *                 enum: [padre, madre, tutor_legal, abuelo, otro]
 *                 description: Tipo de relación
 *               es_contacto_principal:
 *                 type: boolean
 *                 description: Si es contacto principal
 *     responses:
 *       201:
 *         description: Vinculación creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo admin)
 *       409:
 *         description: Relación ya existe
 *       500:
 *         description: Error del servidor
 */
router.post('/vincular', verifyToken, checkRole(['admin']), familiaController.vincularEducando);

/**
 * @swagger
 * /api/familia/desvincular/{relacionId}:
 *   delete:
 *     summary: Desvincular un educando de un familiar (solo admin)
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: relacionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la relación
 *     responses:
 *       200:
 *         description: Desvinculación exitosa
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo admin)
 *       404:
 *         description: Relación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/desvincular/:relacionId', verifyToken, checkRole(['admin']), familiaController.desvincularEducando);

/**
 * @swagger
 * /api/familia/actividades/proximas:
 *   get:
 *     summary: Obtener próximas actividades para el familiar autenticado (desde HOY)
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Número máximo de actividades a devolver
 *     responses:
 *       200:
 *         description: Lista de próximas actividades
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/actividades/proximas', verifyToken, checkRole(['familia', 'admin']), familiaController.getProximasActividades);

/**
 * @swagger
 * /api/familia/actividades/{familiaId}:
 *   get:
 *     summary: Obtener actividades para los hijos del familiar
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familiaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del familiar
 *     responses:
 *       200:
 *         description: Lista de actividades
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/actividades/:familiaId', verifyToken, checkRole(['familia', 'admin']), familiaController.getActividadesFamilia);

// ==========================================
// IBAN - Datos bancarios
// ==========================================

/**
 * @swagger
 * /api/familia/iban:
 *   get:
 *     summary: Obtener IBAN del familiar autenticado
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: IBAN obtenido
 *       401:
 *         description: No autenticado
 */
router.get('/iban', verifyToken, checkRole(['familia', 'admin']), familiaController.getIban);

/**
 * @swagger
 * /api/familia/iban:
 *   put:
 *     summary: Actualizar IBAN del familiar autenticado
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - iban
 *             properties:
 *               iban:
 *                 type: string
 *                 description: IBAN español (ES + 22 dígitos)
 *     responses:
 *       200:
 *         description: IBAN actualizado
 *       400:
 *         description: IBAN inválido
 *       401:
 *         description: No autenticado
 */
router.put('/iban', verifyToken, checkRole(['familia', 'admin']), familiaController.updateIban);

/**
 * @swagger
 * /api/familia/{id}/historial-iban:
 *   get:
 *     summary: Obtener historial de cambios de IBAN de una familia (solo kraal/admin)
 *     tags: [Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del familiar
 *     responses:
 *       200:
 *         description: Historial de IBAN
 *       403:
 *         description: Sin permisos
 */
router.get('/:id/historial-iban', verifyToken, checkRole(['admin', 'scouter']), familiaController.getHistorialIban);

module.exports = router;
