const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const InscripcionModel = require('../models/inscripcion-campamento.model');
const inscripcionController = require('../controllers/inscripcion-campamento.controller');

// Configuracion de multer para subida de archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Permitir PDF, imagenes y documentos comunes
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Use PDF o imagenes.'), false);
    }
  }
});

/**
 * @swagger
 * tags:
 *   name: InscripcionesCampamento
 *   description: Gestion de inscripciones a campamentos
 */

/**
 * @swagger
 * /api/inscripciones-campamento/actividad/{actividadId}:
 *   get:
 *     summary: Obtener inscripciones de un campamento (solo Kraal)
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.get('/actividad/:actividadId', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const actividadId = parseInt(req.params.actividadId);
    const filters = {
      estado: req.query.estado || null,
      seccion_id: req.query.seccion_id ? parseInt(req.query.seccion_id) : null,
      pagado: req.query.pagado !== undefined ? req.query.pagado === 'true' : undefined
    };

    const inscripciones = await InscripcionModel.findByActividad(actividadId, filters);

    res.status(200).json({
      success: true,
      data: inscripciones,
      count: inscripciones.length
    });
  } catch (error) {
    console.error('Error obteniendo inscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo inscripciones',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/actividad/{actividadId}/estadisticas:
 *   get:
 *     summary: Obtener estadisticas de inscripciones de un campamento
 *     tags: [InscripcionesCampamento]
 */
router.get('/actividad/:actividadId/estadisticas', verifyToken, async (req, res) => {
  try {
    const actividadId = parseInt(req.params.actividadId);
    const estadisticas = await InscripcionModel.getEstadisticas(actividadId);

    res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error obteniendo estadisticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadisticas',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/actividad/{actividadId}/dietas:
 *   get:
 *     summary: Obtener resumen de dietas y alergias (solo Kraal)
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.get('/actividad/:actividadId/dietas', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const actividadId = parseInt(req.params.actividadId);
    const resumen = await InscripcionModel.getResumenDietas(actividadId);

    res.status(200).json({
      success: true,
      data: resumen
    });
  } catch (error) {
    console.error('Error obteniendo resumen de dietas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo resumen de dietas',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/educando/{educandoId}:
 *   get:
 *     summary: Obtener inscripciones de un educando
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.get('/educando/:educandoId', verifyToken, async (req, res) => {
  try {
    const educandoId = parseInt(req.params.educandoId);
    const filters = {
      estado: req.query.estado || null,
      fecha_desde: req.query.fecha_desde || null
    };

    const inscripciones = await InscripcionModel.findByEducando(educandoId, filters);

    res.status(200).json({
      success: true,
      data: inscripciones,
      count: inscripciones.length
    });
  } catch (error) {
    console.error('Error obteniendo inscripciones del educando:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo inscripciones',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/familia:
 *   get:
 *     summary: Obtener inscripciones de todos los educandos del familiar autenticado
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.get('/familia', verifyToken, async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const filters = {
      proximos: req.query.proximos === 'true'
    };

    const inscripciones = await InscripcionModel.findByFamiliar(familiarId, filters);

    res.status(200).json({
      success: true,
      data: inscripciones,
      count: inscripciones.length
    });
  } catch (error) {
    console.error('Error obteniendo inscripciones familia:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo inscripciones',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/prellenar/{educandoId}:
 *   get:
 *     summary: Obtener datos de salud prellenados desde ficha del educando
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.get('/prellenar/:educandoId', verifyToken, async (req, res) => {
  try {
    const educandoId = parseInt(req.params.educandoId);
    const datosSalud = await InscripcionModel.prellenarDatosSalud(educandoId);

    if (!datosSalud) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: datosSalud
    });
  } catch (error) {
    console.error('Error obteniendo datos prellenados:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo datos',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/{id}:
 *   get:
 *     summary: Obtener una inscripcion por ID
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const inscripcion = await InscripcionModel.findById(id);

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripcion no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: inscripcion
    });
  } catch (error) {
    console.error('Error obteniendo inscripcion:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo inscripcion',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento:
 *   post:
 *     summary: Crear o actualizar una inscripcion (usa controlador que crea spreadsheet de asistencia)
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, inscripcionController.inscribirCampamento);

/**
 * @swagger
 * /api/inscripciones-campamento/{id}:
 *   put:
 *     summary: Actualizar una inscripcion
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const inscripcionData = {
      ...req.body,
      actualizado_por: req.usuario.id
    };

    const inscripcionActualizada = await InscripcionModel.update(id, inscripcionData);

    res.status(200).json({
      success: true,
      message: 'Inscripcion actualizada correctamente',
      data: inscripcionActualizada
    });
  } catch (error) {
    console.error('Error actualizando inscripcion:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando inscripcion',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/{id}/inscribir:
 *   post:
 *     summary: Confirmar inscripcion (cambiar estado a inscrito)
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/inscribir', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { datos_confirmados } = req.body;

    const inscripcion = await InscripcionModel.inscribir(id, datos_confirmados !== false);

    res.status(200).json({
      success: true,
      message: 'Inscripcion confirmada correctamente',
      data: inscripcion
    });
  } catch (error) {
    console.error('Error confirmando inscripcion:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirmando inscripcion',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/{id}/no-asiste:
 *   post:
 *     summary: Marcar que el educando no asistira
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/no-asiste', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { motivo } = req.body;

    const inscripcion = await InscripcionModel.marcarNoAsiste(id, motivo);

    res.status(200).json({
      success: true,
      message: 'No asistencia registrada',
      data: inscripcion
    });
  } catch (error) {
    console.error('Error marcando no asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error registrando no asistencia',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/{id}/cancelar:
 *   post:
 *     summary: Cancelar una inscripción al campamento
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 description: Motivo de la cancelación (opcional)
 */
router.post('/:id/cancelar', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { motivo } = req.body;

    // Verificar que la inscripción existe y pertenece al usuario
    const inscripcionExistente = await InscripcionModel.findById(id);
    if (!inscripcionExistente) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Verificar que el usuario es el familiar que hizo la inscripción
    if (inscripcionExistente.familiar_id !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta inscripción'
      });
    }

    // Verificar que la inscripción no esté ya cancelada
    if (inscripcionExistente.estado === 'cancelado') {
      return res.status(400).json({
        success: false,
        message: 'La inscripción ya está cancelada'
      });
    }

    const inscripcion = await InscripcionModel.cancelar(id, motivo);

    res.status(200).json({
      success: true,
      message: 'Inscripción cancelada correctamente',
      data: inscripcion
    });
  } catch (error) {
    console.error('Error cancelando inscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelando inscripción',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/{id}/pago:
 *   post:
 *     summary: Registrar pago de una inscripcion (solo Kraal)
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/pago', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { metodo_pago, referencia } = req.body;

    const inscripcion = await InscripcionModel.registrarPago(id, metodo_pago, referencia);

    res.status(200).json({
      success: true,
      message: 'Pago registrado correctamente',
      data: inscripcion
    });
  } catch (error) {
    console.error('Error registrando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error registrando pago',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/{id}:
 *   delete:
 *     summary: Eliminar una inscripcion (solo Admin)
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const eliminado = await InscripcionModel.remove(id);

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        message: 'Inscripcion no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inscripcion eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando inscripcion:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando inscripcion',
      error: error.message
    });
  }
});

// ========================================
// NUEVAS RUTAS PARA DOCUMENTOS DE CAMPAMENTO
// ========================================

/**
 * @swagger
 * /api/inscripciones-campamento/{id}/circular-firmada:
 *   post:
 *     summary: Subir circular firmada por la familia
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: Circular firmada (PDF o imagen)
 */
router.post('/:id/circular-firmada', verifyToken, upload.single('file'), inscripcionController.subirCircularFirmada);

/**
 * @swagger
 * /api/inscripciones-campamento/{id}/justificante-pago:
 *   post:
 *     summary: Subir justificante de pago
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: Justificante de pago (PDF o imagen)
 */
router.post('/:id/justificante-pago', verifyToken, upload.single('file'), inscripcionController.subirJustificantePago);

/**
 * @swagger
 * /api/inscripciones-campamento/{id}/documentos:
 *   get:
 *     summary: Obtener estado de documentos de una inscripcion
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/documentos', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const inscripcion = await InscripcionModel.findById(id);

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripcion no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        circular_firmada: {
          subida: !!inscripcion.circular_firmada_drive_id,
          drive_id: inscripcion.circular_firmada_drive_id,
          url: inscripcion.circular_firmada_url,
          fecha_subida: inscripcion.fecha_subida_circular,
          enviada_seccion: inscripcion.circular_enviada_seccion
        },
        justificante_pago: {
          subido: !!inscripcion.justificante_pago_drive_id,
          drive_id: inscripcion.justificante_pago_drive_id,
          url: inscripcion.justificante_pago_url,
          fecha_subida: inscripcion.fecha_subida_justificante,
          enviado_tesoreria: inscripcion.justificante_enviado_tesoreria
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo documentos',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/inscripciones-campamento/verificar/{actividadId}/{educandoId}:
 *   get:
 *     summary: Verificar si existe inscripcion para actividad y educando
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 */
router.get('/verificar/:actividadId/:educandoId', verifyToken, async (req, res) => {
  try {
    const { actividadId, educandoId } = req.params;
    const inscripcion = await InscripcionModel.findByActividadAndEducando(
      parseInt(actividadId),
      parseInt(educandoId)
    );

    res.json({
      success: true,
      data: inscripcion,
      existe: !!inscripcion
    });
  } catch (error) {
    console.error('Error verificando inscripcion:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando inscripcion',
      error: error.message
    });
  }
});

// ========================================
// ISSUE #5: VERIFICACIÓN DE CIRCULARES
// ========================================

/**
 * @swagger
 * /api/inscripciones-campamento/actividad/{actividadId}/circulares-pendientes:
 *   get:
 *     summary: Obtener circulares pendientes de verificación (solo Kraal)
 *     tags: [InscripcionesCampamento]
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
router.get('/actividad/:actividadId/circulares-pendientes',
  verifyToken,
  checkRole(['admin', 'scouter']),
  inscripcionController.getCircularesPendientes
);

/**
 * @swagger
 * /api/inscripciones-campamento/actividad/{actividadId}/estadisticas-verificacion:
 *   get:
 *     summary: Obtener estadísticas de verificación de circulares (solo Kraal)
 *     tags: [InscripcionesCampamento]
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
 */
router.get('/actividad/:actividadId/estadisticas-verificacion',
  verifyToken,
  checkRole(['admin', 'scouter']),
  inscripcionController.getEstadisticasVerificacion
);

/**
 * @swagger
 * /api/inscripciones-campamento/{id}/verificar-circular:
 *   patch:
 *     summary: Verificar circular de una inscripción (solo Kraal)
 *     tags: [InscripcionesCampamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 */
router.patch('/:id/verificar-circular',
  verifyToken,
  checkRole(['admin', 'scouter']),
  inscripcionController.verificarCircular
);

module.exports = router;
