const express = require('express');
const router = express.Router();
const documentosFamiliaController = require('../controllers/documentos_familia.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Documentos Familia
 *   description: Gestión de documentos familiares (autorizaciones, informes, etc.)
 */

/**
 * @swagger
 * /api/documentos-familia:
 *   get:
 *     summary: Obtener todos los documentos de los scouts de un familiar
 *     tags: [Documentos Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scout_id
 *         schema:
 *           type: integer
 *         description: ID del scout para filtrar
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [vigente, por_vencer, vencido, pendiente]
 *         description: Estado del documento
 *       - in: query
 *         name: tipo_documento
 *         schema:
 *           type: string
 *         description: Tipo de documento
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
 *                   items:
 *                     $ref: '#/components/schemas/DocumentoFamilia'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', verifyToken, checkRole(['familia', 'admin', 'scouter']), documentosFamiliaController.getDocumentosByFamiliar);

/**
 * @swagger
 * /api/documentos-familia/scouts/{scoutId}:
 *   get:
 *     summary: Obtener documentos de un scout específico
 *     tags: [Documentos Familia]
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
 *         description: Lista de documentos del scout
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
 *                     $ref: '#/components/schemas/DocumentoFamilia'
 *       400:
 *         description: ID de scout inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/scouts/:scoutId', verifyToken, checkRole(['familia', 'admin', 'scouter']), documentosFamiliaController.getDocumentosByScout);

/**
 * @swagger
 * /api/documentos-familia/{id}:
 *   get:
 *     summary: Obtener un documento por ID
 *     tags: [Documentos Familia]
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
 *                   $ref: '#/components/schemas/DocumentoFamilia'
 *       400:
 *         description: ID de documento inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verifyToken, checkRole(['familia', 'admin', 'scouter']), documentosFamiliaController.getDocumentoById);

/**
 * @swagger
 * /api/documentos-familia:
 *   post:
 *     summary: Crear un nuevo documento
 *     tags: [Documentos Familia]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scout_id
 *               - tipo_documento
 *               - titulo
 *             properties:
 *               scout_id:
 *                 type: integer
 *                 description: ID del scout
 *               tipo_documento:
 *                 type: string
 *                 description: Tipo de documento
 *               titulo:
 *                 type: string
 *                 description: Título del documento
 *               descripcion:
 *                 type: string
 *                 description: Descripción del documento
 *               archivo_nombre:
 *                 type: string
 *                 description: Nombre del archivo
 *               archivo_ruta:
 *                 type: string
 *                 description: Ruta del archivo
 *               tipo_archivo:
 *                 type: string
 *                 description: MIME type del archivo
 *               tamaño_archivo:
 *                 type: integer
 *                 description: Tamaño del archivo en bytes
 *               fecha_vencimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento
 *               estado:
 *                 type: string
 *                 enum: [vigente, por_vencer, vencido, pendiente]
 *                 description: Estado del documento
 *     responses:
 *       201:
 *         description: Documento creado
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
 *                   example: Documento creado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/DocumentoFamilia'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', verifyToken, checkRole(['familia', 'admin', 'scouter']), documentosFamiliaController.createDocumento);

/**
 * @swagger
 * /api/documentos-familia/{id}:
 *   put:
 *     summary: Actualizar un documento
 *     tags: [Documentos Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               tipo_documento:
 *                 type: string
 *               fecha_vencimiento:
 *                 type: string
 *                 format: date
 *               estado:
 *                 type: string
 *                 enum: [vigente, por_vencer, vencido, pendiente]
 *               aprobado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Documento actualizado
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
 *                   example: Documento actualizado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/DocumentoFamilia'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verifyToken, checkRole(['familia', 'admin', 'scouter']), documentosFamiliaController.updateDocumento);

/**
 * @swagger
 * /api/documentos-familia/{id}:
 *   delete:
 *     summary: Eliminar un documento
 *     tags: [Documentos Familia]
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
 *         description: Documento eliminado
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
 *                   example: Documento eliminado correctamente
 *       400:
 *         description: ID de documento inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verifyToken, checkRole(['familia', 'admin', 'scouter']), documentosFamiliaController.deleteDocumento);

/**
 * @swagger
 * /api/documentos-familia/{id}/aprobar:
 *   put:
 *     summary: Aprobar un documento
 *     tags: [Documentos Familia]
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
 *         description: Documento aprobado
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
 *                   example: Documento aprobado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/DocumentoFamilia'
 *       400:
 *         description: ID de documento inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/aprobar', verifyToken, checkRole(['admin', 'scouter']), documentosFamiliaController.aprobarDocumento);

/**
 * @swagger
 * /api/documentos-familia/{id}/rechazar:
 *   put:
 *     summary: Rechazar un documento
 *     tags: [Documentos Familia]
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
 *         description: Documento rechazado
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
 *                   example: Documento rechazado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/DocumentoFamilia'
 *       400:
 *         description: ID de documento inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/rechazar', verifyToken, checkRole(['admin', 'scouter']), documentosFamiliaController.rechazarDocumento);

/**
 * @swagger
 * /api/documentos-familia/por-vencer:
 *   get:
 *     summary: Obtener documentos por vencer
 *     tags: [Documentos Familia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Días para considerar como por vencer
 *     responses:
 *       200:
 *         description: Lista de documentos por vencer
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
 *                     $ref: '#/components/schemas/DocumentoFamilia'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/por-vencer', verifyToken, checkRole(['familia', 'admin', 'scouter']), documentosFamiliaController.getDocumentosPorVencer);

/**
 * @swagger
 * /api/documentos-familia/pendientes:
 *   get:
 *     summary: Obtener documentos pendientes de aprobación
 *     tags: [Documentos Familia]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de documentos pendientes
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
 *                     $ref: '#/components/schemas/DocumentoFamilia'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/pendientes', verifyToken, checkRole(['admin', 'scouter']), documentosFamiliaController.getDocumentosPendientes);

module.exports = router;