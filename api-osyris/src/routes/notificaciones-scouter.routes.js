const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificaciones-scouter.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y rol scouter/admin
router.use(verifyToken);
router.use(checkRole(['scouter', 'admin']));

// GET /api/notificaciones-scouter - Obtener notificaciones del scouter
router.get('/', notificacionesController.getNotificaciones);

// GET /api/notificaciones-scouter/contador - Contador de no leídas
router.get('/contador', notificacionesController.getContadorNoLeidas);

// GET /api/notificaciones-scouter/documentos-pendientes - Documentos pendientes de revisión
router.get('/documentos-pendientes', notificacionesController.getDocumentosPendientes);

// PUT /api/notificaciones-scouter/:id/leida - Marcar como leída
router.put('/:id/leida', notificacionesController.marcarComoLeida);

// PUT /api/notificaciones-scouter/marcar-todas-leidas - Marcar todas como leídas
router.put('/marcar-todas-leidas', notificacionesController.marcarTodasComoLeidas);

// DELETE /api/notificaciones-scouter/leidas - Eliminar todas las leídas
router.delete('/leidas', notificacionesController.eliminarTodasLeidas);

// DELETE /api/notificaciones-scouter/:id - Eliminar notificación individual
router.delete('/:id', notificacionesController.eliminarNotificacion);

module.exports = router;
