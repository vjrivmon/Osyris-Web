/**
 * Rutas: Solicitudes de Desbloqueo
 *
 * Endpoints para gestión de solicitudes de familias
 * para desbloquear el límite de subida de 24h.
 */

const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudes-desbloqueo.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * POST /api/solicitudes-desbloqueo
 * Crea una nueva solicitud de desbloqueo (familias)
 */
router.post('/', solicitudesController.crearSolicitud);

/**
 * GET /api/solicitudes-desbloqueo/mis-solicitudes
 * Obtiene las solicitudes del familiar autenticado
 */
router.get('/mis-solicitudes', solicitudesController.misSolicitudes);

/**
 * GET /api/solicitudes-desbloqueo/contador
 * Obtiene el contador de solicitudes pendientes (scouter/admin)
 */
router.get('/contador', solicitudesController.obtenerContador);

/**
 * GET /api/solicitudes-desbloqueo/pendientes
 * Lista todas las solicitudes pendientes (solo admin)
 */
router.get('/pendientes', requireRole(['admin']), solicitudesController.listarTodasPendientes);

/**
 * GET /api/solicitudes-desbloqueo/seccion/:seccionId
 * Lista solicitudes por sección (scouters y admin)
 */
router.get('/seccion/:seccionId', requireRole(['scouter', 'admin']), solicitudesController.listarPorSeccion);

/**
 * PUT /api/solicitudes-desbloqueo/:id/aprobar
 * Aprueba una solicitud (scouter/admin)
 * Body: { respuesta?: string }
 */
router.put('/:id/aprobar', requireRole(['scouter', 'admin']), solicitudesController.aprobarSolicitud);

/**
 * PUT /api/solicitudes-desbloqueo/:id/rechazar
 * Rechaza una solicitud (scouter/admin)
 * Body: { respuesta: string } (obligatorio)
 */
router.put('/:id/rechazar', requireRole(['scouter', 'admin']), solicitudesController.rechazarSolicitud);

module.exports = router;
