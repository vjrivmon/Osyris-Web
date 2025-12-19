const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const RondaModel = require('../models/ronda.model');

/**
 * @swagger
 * tags:
 *   name: Ronda
 *   description: Gestion de configuracion de rondas scout
 */

/**
 * @swagger
 * /api/ronda:
 *   get:
 *     summary: Obtener todas las rondas
 *     tags: [Ronda]
 */
router.get('/', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const rondas = await RondaModel.findAll();
    res.status(200).json({
      success: true,
      data: rondas
    });
  } catch (error) {
    console.error('Error obteniendo rondas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo rondas',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ronda/activa:
 *   get:
 *     summary: Obtener la ronda activa actual
 *     tags: [Ronda]
 */
router.get('/activa', async (req, res) => {
  try {
    const ronda = await RondaModel.findActiva();
    if (!ronda) {
      return res.status(404).json({
        success: false,
        message: 'No hay ronda activa configurada'
      });
    }

    res.status(200).json({
      success: true,
      data: ronda
    });
  } catch (error) {
    console.error('Error obteniendo ronda activa:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ronda activa',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ronda/{id}:
 *   get:
 *     summary: Obtener una ronda por ID
 *     tags: [Ronda]
 */
router.get('/:id', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ronda = await RondaModel.findById(id);

    if (!ronda) {
      return res.status(404).json({
        success: false,
        message: 'Ronda no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: ronda
    });
  } catch (error) {
    console.error('Error obteniendo ronda:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ronda',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ronda/{id}/resumen:
 *   get:
 *     summary: Obtener resumen de eventos de una ronda
 *     tags: [Ronda]
 */
router.get('/:id/resumen', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resumen = await RondaModel.getResumenEventos(id);

    if (!resumen) {
      return res.status(404).json({
        success: false,
        message: 'Ronda no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: resumen
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo resumen',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ronda:
 *   post:
 *     summary: Crear una nueva ronda
 *     tags: [Ronda]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const rondaData = {
      ...req.body,
      creado_por: req.user.id
    };

    // Validaciones
    if (!rondaData.nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio'
      });
    }

    if (!rondaData.fecha_inicio || !rondaData.fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas de inicio y fin son obligatorias'
      });
    }

    const nuevaRonda = await RondaModel.create(rondaData);

    res.status(201).json({
      success: true,
      message: 'Ronda creada correctamente',
      data: nuevaRonda
    });
  } catch (error) {
    console.error('Error creando ronda:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando ronda',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ronda/{id}:
 *   put:
 *     summary: Actualizar una ronda
 *     tags: [Ronda]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rondaActualizada = await RondaModel.update(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Ronda actualizada correctamente',
      data: rondaActualizada
    });
  } catch (error) {
    console.error('Error actualizando ronda:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando ronda',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ronda/{id}/activar:
 *   post:
 *     summary: Activar una ronda (desactiva las demas)
 *     tags: [Ronda]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/activar', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rondaActivada = await RondaModel.activar(id);

    res.status(200).json({
      success: true,
      message: 'Ronda activada correctamente',
      data: rondaActivada
    });
  } catch (error) {
    console.error('Error activando ronda:', error);
    res.status(500).json({
      success: false,
      message: 'Error activando ronda',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ronda/{id}/generar-actividades:
 *   post:
 *     summary: Generar actividades desde la plantilla de la ronda
 *     tags: [Ronda]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/generar-actividades', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const count = await RondaModel.generarActividades(id);

    res.status(200).json({
      success: true,
      message: `Se generaron ${count} actividades correctamente`,
      data: { actividades_generadas: count }
    });
  } catch (error) {
    console.error('Error generando actividades:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando actividades',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ronda/{id}/clonar:
 *   post:
 *     summary: Clonar una ronda para el siguiente año
 *     tags: [Ronda]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/clonar', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, fecha_inicio, fecha_fin } = req.body;

    if (!nombre || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, fecha inicio y fecha fin son obligatorios'
      });
    }

    const nuevaRonda = await RondaModel.clonar(id, nombre, fecha_inicio, fecha_fin, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Ronda clonada correctamente',
      data: nuevaRonda
    });
  } catch (error) {
    console.error('Error clonando ronda:', error);
    res.status(500).json({
      success: false,
      message: 'Error clonando ronda',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ronda/{id}:
 *   delete:
 *     summary: Eliminar una ronda
 *     tags: [Ronda]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await RondaModel.remove(id);

    res.status(200).json({
      success: true,
      message: 'Ronda eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando ronda:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando ronda',
      error: error.message
    });
  }
});

module.exports = router;
