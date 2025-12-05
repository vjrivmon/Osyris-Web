/**
 * Rutas: Documentos Resubida
 *
 * Endpoints para gestión de límites de subida,
 * verificación, historial y restauración de versiones.
 */

const express = require('express');
const router = express.Router();
const documentosResubidaController = require('../controllers/documentos-resubida.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/documentos-resubida/:id/puede-subir
 * Verifica si un documento puede ser subido (límite 24h)
 * Retorna: { puedeSubir, subidasHoy, limiteDiario, tiempoRestante, proximaSubida }
 */
router.get('/:id/puede-subir', documentosResubidaController.verificarLimiteSubida);

/**
 * GET /api/documentos-resubida/educando/:educandoId/tipo/:tipoDocumento/puede-subir
 * Verifica si un documento puede ser subido usando educando y tipo
 * Retorna: { puedeSubir, subidasHoy, documentoId, esPrimerSubida, etc }
 */
router.get('/educando/:educandoId/tipo/:tipoDocumento/puede-subir', documentosResubidaController.verificarLimiteByTipo);

/**
 * GET /api/documentos-resubida/:id/historial
 * Obtiene el historial de versiones de un documento
 */
router.get('/:id/historial', documentosResubidaController.obtenerHistorial);

/**
 * POST /api/documentos-resubida/:id/restaurar/:versionId
 * Restaura una versión anterior de un documento (solo scouter/admin)
 */
router.post('/:id/restaurar/:versionId', documentosResubidaController.restaurarVersion);

/**
 * GET /api/documentos-resubida/tipo/:tipoDocumento/config
 * Obtiene la configuración de un tipo de documento
 */
router.get('/tipo/:tipoDocumento/config', documentosResubidaController.obtenerConfigTipoDocumento);

module.exports = router;
