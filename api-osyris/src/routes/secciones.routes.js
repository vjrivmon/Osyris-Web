const express = require('express');
const router = express.Router();
const seccionController = require('../controllers/seccion.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const RangosSecciones = require('../models/rangos_secciones.model');

// Inicializar tabla rangos_secciones al cargar las rutas (idempotente)
RangosSecciones.initTable().catch(err =>
  console.error('Error inicializando rangos_secciones:', err.message)
);

/**
 * @swagger
 * tags:
 *   name: Secciones
 *   description: Gestión de secciones
 */

/**
 * @swagger
 * /api/secciones:
 *   get:
 *     summary: Obtener todas las secciones
 *     tags: [Secciones]
 *     responses:
 *       200:
 *         description: Lista de secciones
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
 *                     $ref: '#/components/schemas/Seccion'
 *       500:
 *         description: Error del servidor
 */
router.get('/', seccionController.getAll);

// ─── Rangos de secciones ───────────────────────────────────────────

/**
 * GET /api/secciones/rangos - Obtener todos los rangos de edad por sección
 */
router.get('/rangos', async (req, res) => {
  try {
    const rangos = await RangosSecciones.findAll();
    res.json({ success: true, data: rangos });
  } catch (error) {
    console.error('Error obteniendo rangos:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/secciones/rangos/:id - Actualizar rango (solo admin/super_admin)
 */
router.put('/rangos/:id', verifyToken, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const existing = await RangosSecciones.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Rango no encontrado' });
    }

    const { edad_min, edad_max, activo } = req.body;
    if (edad_min !== undefined && edad_max !== undefined && edad_min > edad_max) {
      return res.status(400).json({ success: false, message: 'edad_min no puede ser mayor que edad_max' });
    }

    const updated = await RangosSecciones.update(id, { edad_min, edad_max, activo });
    res.json({ success: true, data: updated, message: 'Rango actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando rango:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/secciones/calcular-seccion/:educando_id - Calcular sección de un educando
 */
router.get('/calcular-seccion/:educando_id', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const educandoId = parseInt(req.params.educando_id);
    if (isNaN(educandoId)) {
      return res.status(400).json({ success: false, message: 'ID de educando inválido' });
    }

    const resultado = await RangosSecciones.calcularSeccion(educandoId);
    res.json({ success: true, data: resultado });
  } catch (error) {
    console.error('Error calculando sección:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/secciones/calcular-todos - Calcular secciones de todos los educandos activos
 */
router.get('/calcular-todos', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const resultado = await RangosSecciones.calcularTodos();
    res.json({ success: true, data: resultado });
  } catch (error) {
    console.error('Error calculando secciones:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── CRUD de secciones ─────────────────────────────────────────────

/**
 * @swagger
 * /api/secciones/{id}:
 *   get:
 *     summary: Obtener una sección por ID
 *     tags: [Secciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sección
 *     responses:
 *       200:
 *         description: Sección encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Seccion'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Sección no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', seccionController.getById);

/**
 * @swagger
 * /api/secciones:
 *   post:
 *     summary: Crear una nueva sección
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Seccion'
 *     responses:
 *       201:
 *         description: Sección creada
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
 *                   example: Sección creada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Seccion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', verifyToken, checkRole(['admin']), seccionController.create);

/**
 * @swagger
 * /api/secciones/{id}:
 *   put:
 *     summary: Actualizar una sección existente
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sección
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               rango_edad:
 *                 type: string
 *               color:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               icono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sección actualizada
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
 *                   example: Sección actualizada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Seccion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Sección no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verifyToken, checkRole(['admin']), seccionController.update);

/**
 * @swagger
 * /api/secciones/{id}:
 *   delete:
 *     summary: Eliminar una sección
 *     tags: [Secciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sección
 *     responses:
 *       200:
 *         description: Sección eliminada
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
 *                   example: Sección eliminada correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Sección no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verifyToken, checkRole(['admin']), seccionController.remove);

module.exports = router; 