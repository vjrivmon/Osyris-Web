/**
 * Rutas de Google Drive API
 * Grupo Scout Osyris - Sistema de Gestión
 */

const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const googleDriveController = require('../controllers/google-drive.controller');

/**
 * @swagger
 * tags:
 *   name: Google Drive
 *   description: Gestión de documentos mediante Google Drive API
 */

/**
 * @swagger
 * /api/drive/init:
 *   post:
 *     summary: Inicializar servicio Google Drive
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Servicio inicializado correctamente
 *       500:
 *         description: Error al inicializar servicio
 */
router.post('/init', verifyToken, checkRole(['admin']), googleDriveController.initializeService);

/**
 * @swagger
 * /api/drive/documents:
 *   get:
 *     summary: Listar documentos de Google Drive
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Categoría para filtrar
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Desplazamiento para paginación
 *     responses:
 *       200:
 *         description: Lista de documentos
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/documents', verifyToken, googleDriveController.listDocuments);

/**
 * @swagger
 * /api/drive/documents/{id}:
 *   get:
 *     summary: Obtener documento por ID
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del documento en Google Drive
 *     responses:
 *       200:
 *         description: Información del documento
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/documents/:id', verifyToken, googleDriveController.getDocument);

/**
 * @swagger
 * /api/drive/upload:
 *   post:
 *     summary: Subir archivo a Google Drive
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir
 *               category:
 *                 type: string
 *                 description: Categoría del documento
 *               description:
 *                 type: string
 *                 description: Descripción del documento
 *     responses:
 *       201:
 *         description: Archivo subido correctamente
 *       400:
 *         description: Error en los datos
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.post('/upload', verifyToken, checkRole(['admin', 'scouter']), googleDriveController.uploadFile);

/**
 * @swagger
 * /api/drive/documents/{id}:
 *   delete:
 *     summary: Eliminar documento de Google Drive
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del documento a eliminar
 *     responses:
 *       200:
 *         description: Documento eliminado correctamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/documents/:id', verifyToken, checkRole(['admin', 'scouter']), googleDriveController.deleteDocument);

/**
 * @swagger
 * /api/drive/folders:
 *   post:
 *     summary: Crear folder en Google Drive
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - folderName
 *             properties:
 *               folderName:
 *                 type: string
 *                 description: Nombre del folder
 *               parentFolderId:
 *                 type: string
 *                 description: ID del folder padre (opcional)
 *     responses:
 *       201:
 *         description: Folder creado correctamente
 *       400:
 *         description: Error en los datos
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.post('/folders', verifyToken, checkRole(['admin', 'scouter']), googleDriveController.createFolder);

module.exports = router;