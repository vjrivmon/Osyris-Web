const express = require('express');
const router = express.Router();
const educandoController = require('../controllers/educando.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Educandos
 *   description: Gestión de educandos/scouts del grupo
 */

/**
 * @swagger
 * /api/educandos:
 *   get:
 *     summary: Obtener lista de educandos con filtros opcionales
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: seccion_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de sección
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo (true/false)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o apellidos
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *           enum: [masculino, femenino, otro, prefiero_no_decir]
 *         description: Filtrar por género
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados para paginación
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Desplazamiento para paginación
 *     responses:
 *       200:
 *         description: Lista de educandos obtenida exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/', verifyToken, checkRole(['admin', 'scouter']), educandoController.getAllEducandos);

/**
 * @swagger
 * /api/educandos/search:
 *   get:
 *     summary: Buscar educandos por término
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *       400:
 *         description: Término de búsqueda requerido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/search', verifyToken, checkRole(['admin', 'scouter']), educandoController.searchEducandos);

/**
 * @swagger
 * /api/educandos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de educandos
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo admin)
 *       500:
 *         description: Error del servidor
 */
router.get('/estadisticas', verifyToken, checkRole(['admin']), educandoController.getEstadisticas);

/**
 * @swagger
 * /api/educandos/seccion/{seccionId}:
 *   get:
 *     summary: Obtener educandos de una sección específica
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seccionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sección
 *     responses:
 *       200:
 *         description: Educandos de la sección obtenidos exitosamente
 *       400:
 *         description: ID de sección inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/seccion/:seccionId', verifyToken, checkRole(['admin', 'scouter']), educandoController.getEducandosBySeccion);

/**
 * @swagger
 * /api/educandos/{id}:
 *   get:
 *     summary: Obtener un educando por ID
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Educando encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verifyToken, educandoController.getEducandoById);

/**
 * @swagger
 * /api/educandos:
 *   post:
 *     summary: Crear un nuevo educando
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Educando'
 *     responses:
 *       201:
 *         description: Educando creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo admin)
 *       409:
 *         description: DNI ya existe
 *       500:
 *         description: Error del servidor
 */
router.post('/', verifyToken, checkRole(['admin']), educandoController.createEducando);

/**
 * @swagger
 * /api/educandos/{id}:
 *   put:
 *     summary: Actualizar un educando
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Educando'
 *     responses:
 *       200:
 *         description: Educando actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo admin)
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verifyToken, checkRole(['admin']), educandoController.updateEducando);

/**
 * @swagger
 * /api/educandos/{id}/deactivate:
 *   patch:
 *     summary: Desactivar un educando (soft delete)
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Educando desactivado exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo admin)
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/deactivate', verifyToken, checkRole(['admin']), educandoController.deactivateEducando);

/**
 * @swagger
 * /api/educandos/{id}/reactivate:
 *   patch:
 *     summary: Reactivar un educando previamente desactivado
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Educando reactivado exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo admin)
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/reactivate', verifyToken, checkRole(['admin']), educandoController.reactivateEducando);

/**
 * @swagger
 * /api/educandos/{id}:
 *   delete:
 *     summary: Eliminar permanentemente un educando (hard delete)
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Educando eliminado permanentemente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo admin)
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verifyToken, checkRole(['admin']), educandoController.deleteEducando);

module.exports = router;
