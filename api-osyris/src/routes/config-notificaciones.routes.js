const express = require('express');
const router = express.Router();
const configController = require('../controllers/config-notificaciones.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// GET /api/notificaciones/config - Obtener configuración (kraal/admin)
router.get('/', verifyToken, checkRole(['scouter', 'admin']), configController.getConfig);

// PUT /api/notificaciones/config/:tipo - Actualizar urgencia (solo admin)
router.put('/:tipo', verifyToken, checkRole(['admin']), configController.updateConfig);

module.exports = router;
