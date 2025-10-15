/**
 * Content Routes
 * Rutas para contenido estático (solo lectura)
 *
 * NOTA: Las rutas de edición han sido desactivadas.
 * El modo edición en vivo ha sido eliminado del sistema.
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
// RUTAS DE EDICIÓN DESACTIVADAS
// ============================================
//
// Las siguientes rutas han sido desactivadas:
// - PUT /api/content/:id (actualizar contenido)
// - POST /api/content (crear contenido)
// - POST /api/content/upload (subir imágenes)
// - GET /api/content/history/:id (historial)
// - POST /api/content/restore/:id/:version (restaurar)
// - DELETE /api/content/:id (eliminar)
//
// El modo edición en vivo ha sido eliminado del sistema.
// El contenido ahora es estático y se gestiona directamente en el código.
//

module.exports = router;
