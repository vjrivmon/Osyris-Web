/**
 * Rutas de notificaciones para familias
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const notificacionesModel = require('../models/notificaciones_familia.model');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/notificaciones-familia
 * Obtiene las notificaciones del familiar autenticado
 */
router.get('/', async (req, res) => {
  try {
    const familiarId = req.usuario?.id || req.user?.id;
    const { soloNoLeidas, tipo, limit } = req.query;

    const options = {
      soloNoLeidas: soloNoLeidas === 'true',
      tipo: tipo || null,
      limit: limit ? parseInt(limit) : 20
    };

    const notificaciones = await notificacionesModel.findByFamiliarId(familiarId, options);

    res.json({
      success: true,
      data: notificaciones,
      total: notificaciones.length
    });
  } catch (error) {
    console.error('Error obteniendo notificaciones familia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
});

/**
 * GET /api/notificaciones-familia/contador
 * Obtiene el contador de notificaciones no leídas
 */
router.get('/contador', async (req, res) => {
  try {
    const familiarId = req.usuario?.id || req.user?.id;
    const count = await notificacionesModel.getContadorNoLeidas(familiarId);

    res.json({
      success: true,
      count: parseInt(count) || 0
    });
  } catch (error) {
    console.error('Error contando notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al contar notificaciones',
      error: error.message
    });
  }
});

/**
 * PUT /api/notificaciones-familia/:id/leida
 * Marca una notificación como leída
 */
router.put('/:id/leida', async (req, res) => {
  try {
    const { id } = req.params;
    const familiarId = req.usuario?.id || req.user?.id;

    const notificacion = await notificacionesModel.marcarComoLeida(id, familiarId);

    res.json({
      success: true,
      data: notificacion
    });
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación',
      error: error.message
    });
  }
});

/**
 * PUT /api/notificaciones-familia/marcar-todas-leidas
 * Marca todas las notificaciones como leídas
 */
router.put('/marcar-todas-leidas', async (req, res) => {
  try {
    const familiarId = req.usuario?.id || req.user?.id;
    const afectadas = await notificacionesModel.marcarTodasComoLeidas(familiarId);

    res.json({
      success: true,
      afectadas
    });
  } catch (error) {
    console.error('Error marcando todas como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificaciones',
      error: error.message
    });
  }
});

module.exports = router;
