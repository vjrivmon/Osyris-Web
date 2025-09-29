const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const {
  upload,
  uploadFile,
  getFiles,
  deleteFile,
  getFolders,
  getFileStats
} = require('../controllers/upload.controller');

/**
 * 🏕️ RUTAS DE UPLOADS - SISTEMA CMS OSYRIS
 * Gestión de archivos para superusuarios
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadedFile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del archivo
 *         filename:
 *           type: string
 *           description: Nombre del archivo en el storage
 *         originalName:
 *           type: string
 *           description: Nombre original del archivo
 *         url:
 *           type: string
 *           description: URL pública del archivo
 *         type:
 *           type: string
 *           description: Tipo MIME del archivo
 *         size:
 *           type: integer
 *           description: Tamaño del archivo en bytes
 *         folder:
 *           type: string
 *           description: Carpeta donde está almacenado
 *         altText:
 *           type: string
 *           description: Texto alternativo para imágenes
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de subida
 */

/**
 * @swagger
 * /api/uploads:
 *   post:
 *     summary: Subir un archivo
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: Archivo a subir
 *       - in: formData
 *         name: folder
 *         type: string
 *         description: Carpeta destino (por defecto 'general')
 *       - in: formData
 *         name: altText
 *         type: string
 *         description: Texto alternativo para imágenes
 *     responses:
 *       201:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UploadedFile'
 *       400:
 *         description: Error en la subida
 *       401:
 *         description: No autorizado
 *       413:
 *         description: Archivo demasiado grande
 */
router.post('/',
  authenticateToken,
  requireRole(['super_admin']),
  upload.single('file'),
  uploadFile
);

/**
 * @swagger
 * /api/uploads:
 *   get:
 *     summary: Listar archivos subidos
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Filtrar por carpeta
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo (image, application, etc.)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a saltar
 *     responses:
 *       200:
 *         description: Lista de archivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UploadedFile'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     total:
 *                       type: integer
 */
router.get('/',
  authenticateToken,
  requireRole(['super_admin']),
  getFiles
);

/**
 * @swagger
 * /api/uploads/{id}:
 *   delete:
 *     summary: Eliminar un archivo
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del archivo a eliminar
 *     responses:
 *       200:
 *         description: Archivo eliminado exitosamente
 *       404:
 *         description: Archivo no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/:id',
  authenticateToken,
  requireRole(['super_admin']),
  deleteFile
);

/**
 * @swagger
 * /api/uploads/folders:
 *   get:
 *     summary: Obtener lista de carpetas
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carpetas disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/folders',
  authenticateToken,
  requireRole(['super_admin']),
  getFolders
);

/**
 * @swagger
 * /api/uploads/stats:
 *   get:
 *     summary: Obtener estadísticas de archivos
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de archivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     byType:
 *                       type: object
 *                     byFolder:
 *                       type: object
 *                     totalSize:
 *                       type: integer
 */
router.get('/stats',
  authenticateToken,
  requireRole(['super_admin']),
  getFileStats
);

module.exports = router;