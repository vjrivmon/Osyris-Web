const express = require('express');
const router = express.Router();
const paginasController = require('../controllers/paginas.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * 🏠 RUTAS DE PÁGINAS - SISTEMA CMS OSYRIS
 * Gestión de páginas de contenido web
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Pagina:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la página
 *         titulo:
 *           type: string
 *           description: Título de la página
 *         slug:
 *           type: string
 *           description: URL amigable única
 *         contenido:
 *           type: string
 *           description: Contenido principal en HTML/Markdown
 *         resumen:
 *           type: string
 *           description: Resumen breve de la página
 *         meta_descripcion:
 *           type: string
 *           description: Meta descripción para SEO
 *         imagen_destacada:
 *           type: string
 *           description: URL de la imagen destacada
 *         estado:
 *           type: string
 *           enum: [borrador, publicada, archivada]
 *           description: Estado de publicación
 *         tipo:
 *           type: string
 *           enum: [pagina, articulo, noticia]
 *           description: Tipo de contenido
 *         orden_menu:
 *           type: integer
 *           description: Orden en el menú de navegación
 *         mostrar_en_menu:
 *           type: boolean
 *           description: Si se muestra en el menú principal
 *         permite_comentarios:
 *           type: boolean
 *           description: Si permite comentarios
 *         creado_por:
 *           type: integer
 *           description: ID del usuario creador
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *         fecha_actualizacion:
 *           type: string
 *           format: date-time
 *         fecha_publicacion:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/paginas:
 *   get:
 *     summary: Obtener todas las páginas
 *     tags: [Páginas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [borrador, publicada, archivada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [pagina, articulo, noticia]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: mostrar_en_menu
 *         schema:
 *           type: boolean
 *         description: Filtrar por visibilidad en menú
 *     responses:
 *       200:
 *         description: Lista de páginas
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
 *                     $ref: '#/components/schemas/Pagina'
 */
router.get('/', verifyToken, checkRole(['admin']), paginasController.getAll);

/**
 * @swagger
 * /api/paginas/menu:
 *   get:
 *     summary: Obtener páginas para menú de navegación
 *     tags: [Páginas]
 *     responses:
 *       200:
 *         description: Páginas del menú
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       titulo:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       orden_menu:
 *                         type: integer
 */
router.get('/menu', paginasController.getMenuPages);

/**
 * @swagger
 * /api/paginas/stats:
 *   get:
 *     summary: Obtener estadísticas de páginas
 *     tags: [Páginas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de páginas
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
 *                     publicadas:
 *                       type: integer
 *                     borradores:
 *                       type: integer
 *                     por_tipo:
 *                       type: array
 */
router.get('/stats', verifyToken, checkRole(['admin']), paginasController.getStats);

/**
 * @swagger
 * /api/paginas/{id}:
 *   get:
 *     summary: Obtener página por ID
 *     tags: [Páginas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la página
 *     responses:
 *       200:
 *         description: Página encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pagina'
 *       404:
 *         description: Página no encontrada
 */
router.get('/:id', verifyToken, checkRole(['admin']), paginasController.getById);

/**
 * @swagger
 * /api/paginas:
 *   post:
 *     summary: Crear nueva página
 *     tags: [Páginas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - slug
 *               - contenido
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               slug:
 *                 type: string
 *                 pattern: '^[a-z0-9-]+$'
 *                 description: Solo letras minúsculas, números y guiones
 *               contenido:
 *                 type: string
 *                 minLength: 1
 *               resumen:
 *                 type: string
 *                 maxLength: 500
 *               meta_descripcion:
 *                 type: string
 *                 maxLength: 300
 *               imagen_destacada:
 *                 type: string
 *                 maxLength: 500
 *               estado:
 *                 type: string
 *                 enum: [borrador, publicada, archivada]
 *                 default: borrador
 *               tipo:
 *                 type: string
 *                 enum: [pagina, articulo, noticia]
 *                 default: pagina
 *               orden_menu:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *               mostrar_en_menu:
 *                 type: boolean
 *                 default: true
 *               permite_comentarios:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Página creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El slug ya está en uso
 */
router.post('/', verifyToken, checkRole(['admin']), paginasController.create);

/**
 * @swagger
 * /api/paginas/{id}:
 *   put:
 *     summary: Actualizar página existente
 *     tags: [Páginas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la página
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               slug:
 *                 type: string
 *                 pattern: '^[a-z0-9-]+$'
 *               contenido:
 *                 type: string
 *                 minLength: 1
 *               resumen:
 *                 type: string
 *                 maxLength: 500
 *               meta_descripcion:
 *                 type: string
 *                 maxLength: 300
 *               imagen_destacada:
 *                 type: string
 *                 maxLength: 500
 *               estado:
 *                 type: string
 *                 enum: [borrador, publicada, archivada]
 *               tipo:
 *                 type: string
 *                 enum: [pagina, articulo, noticia]
 *               orden_menu:
 *                 type: integer
 *                 minimum: 0
 *               mostrar_en_menu:
 *                 type: boolean
 *               permite_comentarios:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Página actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Página no encontrada
 *       409:
 *         description: El slug ya está en uso
 */
router.put('/:id', verifyToken, checkRole(['admin']), paginasController.update);

/**
 * @swagger
 * /api/paginas/{id}:
 *   delete:
 *     summary: Eliminar página
 *     tags: [Páginas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la página
 *     responses:
 *       200:
 *         description: Página eliminada exitosamente
 *       404:
 *         description: Página no encontrada
 */
router.delete('/:id', verifyToken, checkRole(['admin']), paginasController.remove);

/**
 * @swagger
 * /api/paginas/slug/{slug}:
 *   get:
 *     summary: Obtener página por slug
 *     tags: [Páginas]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug de la página
 *     responses:
 *       200:
 *         description: Página encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pagina'
 *       404:
 *         description: Página no encontrada
 */
router.get('/slug/:slug', paginasController.getBySlug);

module.exports = router;