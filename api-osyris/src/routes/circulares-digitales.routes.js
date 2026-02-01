const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const controller = require('../controllers/circulares-digitales.controller');

// =============================================
// FAMILIAR: Perfil de salud
// =============================================
router.get('/perfil-salud/educando/:educandoId', verifyToken, controller.getPerfilSalud);
router.put('/perfil-salud/educando/:educandoId', verifyToken, controller.updatePerfilSalud);

// =============================================
// FAMILIAR: Circulares
// =============================================
router.get('/circulares/mis-circulares', verifyToken, controller.getCircularesFamiliar);
router.get('/circular/:actividadId/formulario', verifyToken, controller.getFormularioCircular);
router.post('/circular/:actividadId/firmar', verifyToken, controller.firmarCircular);
router.get('/circular/:actividadId/estado/:educandoId', verifyToken, controller.getEstadoCircular);

// =============================================
// ADMIN: CRUD circulares
// =============================================
router.get('/admin/circulares', verifyToken, checkRole(['admin', 'scouter']), controller.listarCirculares);
router.post('/admin/circulares', verifyToken, checkRole(['admin', 'scouter']), controller.crearCircular);
router.put('/admin/circulares/:id', verifyToken, checkRole(['admin', 'scouter']), controller.editarCircular);
router.put('/admin/circulares/:id/publicar', verifyToken, checkRole(['admin', 'scouter']), controller.publicarCircular);
router.get('/admin/circular/:actividadId/estado', verifyToken, checkRole(['admin', 'scouter']), controller.getDashboardEstado);
router.get('/admin/plantillas-circular', verifyToken, checkRole(['admin', 'scouter']), controller.listarPlantillas);

module.exports = router;
