/**
 * Routes: Control de Asistencia In-Situ
 * Issue #6
 */

const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const asistenciaController = require('../controllers/asistencia-actividad.controller');

/**
 * @swagger
 * tags:
 *   name: AsistenciaActividad
 *   description: Control de asistencia in-situ para campamentos y salidas
 */

/**
 * @swagger
 * /api/asistencia/{actividadId}:
 *   get:
 *     summary: Obtener lista de asistencia de una actividad
 *     tags: [AsistenciaActividad]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actividadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: seccion_id
 *         schema:
 *           type: integer
 *         description: Filtrar por sección
 */
router.get('/:actividadId',
  verifyToken,
  checkRole(['admin', 'scouter']),
  asistenciaController.getAsistencia
);

/**
 * @swagger
 * /api/asistencia/{actividadId}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de asistencia
 *     tags: [AsistenciaActividad]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:actividadId/estadisticas',
  verifyToken,
  checkRole(['admin', 'scouter']),
  asistenciaController.getEstadisticas
);

/**
 * @swagger
 * /api/asistencia/{actividadId}/educando/{educandoId}/llegada:
 *   patch:
 *     summary: Marcar llegada de un educando
 *     tags: [AsistenciaActividad]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               llegado:
 *                 type: boolean
 *                 default: true
 */
router.patch('/:actividadId/educando/:educandoId/llegada',
  verifyToken,
  checkRole(['admin', 'scouter']),
  asistenciaController.marcarLlegada
);

/**
 * @swagger
 * /api/asistencia/{actividadId}/educando/{educandoId}/sip:
 *   patch:
 *     summary: Marcar entrega de SIP (tarjeta sanitaria)
 *     tags: [AsistenciaActividad]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entregado:
 *                 type: boolean
 *                 default: true
 */
router.patch('/:actividadId/educando/:educandoId/sip',
  verifyToken,
  checkRole(['admin', 'scouter']),
  asistenciaController.marcarSIP
);

/**
 * @swagger
 * /api/asistencia/{actividadId}/educando/{educandoId}/observaciones:
 *   patch:
 *     summary: Actualizar observaciones de un educando
 *     tags: [AsistenciaActividad]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:actividadId/educando/:educandoId/observaciones',
  verifyToken,
  checkRole(['admin', 'scouter']),
  asistenciaController.actualizarObservaciones
);

/**
 * @swagger
 * /api/asistencia/{actividadId}/educando/{educandoId}/no-asiste:
 *   patch:
 *     summary: Marcar que un inscrito no asistió
 *     tags: [AsistenciaActividad]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:actividadId/educando/:educandoId/no-asiste',
  verifyToken,
  checkRole(['admin', 'scouter']),
  asistenciaController.marcarNoAsiste
);

module.exports = router;
