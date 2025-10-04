/**
 * Content Editor Routes
 * Rutas para la gestión de contenido editable
 */

const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

/**
 * Middleware de autenticación y autorización
 * - verifyToken: Verifica que el usuario esté autenticado
 * - requireRole(['admin', 'editor']): Verifica que tenga permisos de edición
 */

// ============================================
// RUTAS PÚBLICAS (solo lectura)
// ============================================

/**
 * @route   GET /api/content/page/:seccion
 * @desc    Obtiene todo el contenido de una página/sección
 * @access  Public
 * @example GET /api/content/page/castores
 */
router.get('/page/:seccion', contentController.getPageContent);

/**
 * @route   GET /api/content/:id
 * @desc    Obtiene un contenido específico por ID
 * @access  Public
 * @example GET /api/content/123
 */
router.get('/:id', contentController.getContentById);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * @route   PUT /api/content/:id
 * @desc    Actualiza contenido específico
 * @access  Private (Admin, Editor)
 * @body    { tipo, contenido, metadata, comentario }
 * @example PUT /api/content/123
 */
router.put('/:id', verifyToken, requireRole(['admin', 'editor']), contentController.updateContent);

/**
 * @route   POST /api/content
 * @desc    Crea nuevo contenido editable
 * @access  Private (Admin, Editor)
 * @body    { seccion, identificador, tipo, contenido, metadata }
 * @example POST /api/content
 */
router.post('/', verifyToken, requireRole(['admin', 'editor']), contentController.createContent);

/**
 * @route   POST /api/content/upload
 * @desc    Sube una imagen y retorna la URL
 * @access  Private (Admin, Editor)
 * @body    FormData con campo 'image'
 * @example POST /api/content/upload
 */
router.post('/upload', verifyToken, requireRole(['admin', 'editor']), contentController.uploadImage);

/**
 * @route   GET /api/content/history/:id
 * @desc    Obtiene el historial de versiones de un contenido
 * @access  Private (Admin, Editor)
 * @query   { page, limit }
 * @example GET /api/content/history/123?page=1&limit=10
 */
router.get('/history/:id', verifyToken, requireRole(['admin', 'editor']), contentController.getContentHistory);

/**
 * @route   POST /api/content/restore/:id/:version
 * @desc    Restaura una versión anterior del contenido
 * @access  Private (Admin only)
 * @example POST /api/content/restore/123/5
 */
router.post('/restore/:id/:version', verifyToken, requireRole(['admin']), contentController.restoreVersion);

/**
 * @route   DELETE /api/content/:id
 * @desc    Elimina (desactiva) contenido
 * @access  Private (Admin only)
 * @example DELETE /api/content/123
 */
router.delete('/:id', verifyToken, requireRole(['admin']), contentController.deleteContent);

module.exports = router;
