const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const ActividadModel = require('../models/actividad.model');
const ConfirmacionesModel = require('../models/confirmaciones.model');
const {
  subirCircularCampamento,
  descargarCircular,
  eliminarCircular
} = require('../services/campamento-documentos.service');
const {
  crearHojaInscripciones
} = require('../services/campamento-sheets.service');
const { getRecordatoriosPredefinidos, DRIVE_CONFIG } = require('../config/google-drive.config');

// Configuracion de multer para subida de circulares
const uploadCircular = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max para circulares
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF para circulares'), false);
    }
  }
});

/**
 * @swagger
 * tags:
 *   name: Actividades
 *   description: Gestion de actividades del calendario
 */

/**
 * @swagger
 * /api/actividades:
 *   get:
 *     summary: Obtener todas las actividades
 *     tags: [Actividades]
 *     parameters:
 *       - in: query
 *         name: seccion_id
 *         schema:
 *           type: integer
 *         description: Filtrar por seccion
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de actividad
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *         description: Mes (1-12)
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *         description: Año
 *       - in: query
 *         name: visibilidad
 *         schema:
 *           type: string
 *           enum: [familias, kraal]
 *         description: Filtrar por visibilidad
 *     responses:
 *       200:
 *         description: Lista de actividades
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      seccion_id: req.query.seccion_id ? parseInt(req.query.seccion_id) : null,
      tipo: req.query.tipo || null,
      mes: req.query.mes ? parseInt(req.query.mes) : null,
      anio: req.query.anio ? parseInt(req.query.anio) : null,
      fecha_desde: req.query.fecha_desde || null,
      fecha_hasta: req.query.fecha_hasta || null,
      visibilidad: req.query.visibilidad || 'familias',
      estado: req.query.estado || null,
      incluir_cancelados: req.query.incluir_cancelados === 'true',
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : null
    };

    const actividades = await ActividadModel.findAll(filters);

    res.status(200).json({
      success: true,
      data: actividades,
      count: actividades.length
    });
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo actividades',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/proximas:
 *   get:
 *     summary: Obtener proximas actividades
 *     tags: [Actividades]
 */
router.get('/proximas', async (req, res) => {
  try {
    const filters = {
      dias: req.query.dias ? parseInt(req.query.dias) : 30,
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
      seccion_id: req.query.seccion_id ? parseInt(req.query.seccion_id) : null,
      visibilidad: req.query.visibilidad || 'familias'
    };

    const actividades = await ActividadModel.findProximas(filters);

    res.status(200).json({
      success: true,
      data: actividades,
      count: actividades.length
    });
  } catch (error) {
    console.error('Error obteniendo proximas actividades:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo proximas actividades',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/tipos:
 *   get:
 *     summary: Obtener configuracion de tipos de eventos
 *     tags: [Actividades]
 */
router.get('/tipos', (req, res) => {
  res.status(200).json({
    success: true,
    data: ActividadModel.getTiposEvento()
  });
});

/**
 * @swagger
 * /api/actividades/mes/{anio}/{mes}:
 *   get:
 *     summary: Obtener actividades de un mes especifico
 *     tags: [Actividades]
 *     description: |
 *       Si el usuario autenticado es scouter, las estadísticas de confirmación
 *       se filtran para mostrar solo los educandos de su sección.
 *       Admin ve todas las secciones.
 */
router.get('/mes/:anio/:mes', verifyToken, async (req, res) => {
  try {
    const anio = parseInt(req.params.anio);
    const mes = parseInt(req.params.mes);

    if (isNaN(anio) || isNaN(mes) || mes < 1 || mes > 12) {
      return res.status(400).json({
        success: false,
        message: 'Año o mes invalido'
      });
    }

    const filters = {
      seccion_id: req.query.seccion_id ? parseInt(req.query.seccion_id) : null,
      visibilidad: req.query.visibilidad || 'familias'
    };

    // Si el usuario es scouter y tiene sección asignada,
    // filtrar las estadísticas de confirmación para mostrar solo su sección
    // Admin (super usuario) ve todas las secciones
    if (req.usuario && req.usuario.rol === 'scouter' && req.usuario.seccion_id) {
      filters.seccion_stats_id = req.usuario.seccion_id;
    }

    const actividades = await ActividadModel.findByMes(anio, mes, filters);

    res.status(200).json({
      success: true,
      data: actividades,
      mes,
      anio,
      count: actividades.length,
      // Incluir info de filtrado para debug/UI
      filtrado_por_seccion: filters.seccion_stats_id || null
    });
  } catch (error) {
    console.error('Error obteniendo actividades del mes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo actividades del mes',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/educando/{educandoId}:
 *   get:
 *     summary: Obtener actividades para un educando
 *     tags: [Actividades]
 */
router.get('/educando/:educandoId', verifyToken, async (req, res) => {
  try {
    const educandoId = parseInt(req.params.educandoId);
    const actividades = await ActividadModel.findForEducando(educandoId);

    res.status(200).json({
      success: true,
      data: actividades,
      count: actividades.length
    });
  } catch (error) {
    console.error('Error obteniendo actividades del educando:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo actividades del educando',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/{id}:
 *   get:
 *     summary: Obtener una actividad por ID
 *     tags: [Actividades]
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const incluirStats = req.query.stats === 'true';

    let actividad;
    if (incluirStats) {
      actividad = await ActividadModel.findByIdWithStats(id);
    } else {
      actividad = await ActividadModel.findById(id);
    }

    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: actividad
    });
  } catch (error) {
    console.error('Error obteniendo actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo actividad',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades:
 *   post:
 *     summary: Crear una nueva actividad
 *     tags: [Actividades]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const actividadData = {
      ...req.body,
      creado_por: req.usuario.id
    };

    // Validaciones basicas
    if (!actividadData.titulo) {
      return res.status(400).json({
        success: false,
        message: 'El titulo es obligatorio'
      });
    }

    if (!actividadData.fecha_inicio) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio es obligatoria'
      });
    }

    const nuevaActividad = await ActividadModel.create(actividadData);

    res.status(201).json({
      success: true,
      message: 'Actividad creada correctamente',
      data: nuevaActividad
    });
  } catch (error) {
    console.error('Error creando actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando actividad',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/{id}:
 *   put:
 *     summary: Actualizar una actividad
 *     tags: [Actividades]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verificar que existe
    const actividadExistente = await ActividadModel.findById(id);
    if (!actividadExistente) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    const actividadActualizada = await ActividadModel.update(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Actividad actualizada correctamente',
      data: actividadActualizada
    });
  } catch (error) {
    console.error('Error actualizando actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando actividad',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/{id}/cancelar:
 *   post:
 *     summary: Cancelar una actividad
 *     tags: [Actividades]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/cancelar', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { motivo } = req.body;

    const actividadCancelada = await ActividadModel.cancelar(id, motivo);

    res.status(200).json({
      success: true,
      message: 'Actividad cancelada correctamente',
      data: actividadCancelada
    });
  } catch (error) {
    console.error('Error cancelando actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelando actividad',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/{id}:
 *   delete:
 *     summary: Eliminar una actividad
 *     tags: [Actividades]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const eliminado = await ActividadModel.remove(id);

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Actividad eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando actividad',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/{id}/confirmaciones:
 *   get:
 *     summary: Obtener confirmaciones de una actividad
 *     tags: [Actividades]
 */
router.get('/:id/confirmaciones', verifyToken, async (req, res) => {
  try {
    const actividadId = parseInt(req.params.id);
    const isKraal = req.usuario.rol === 'admin' || req.usuario.rol === 'scouter';

    // Obtener estadisticas
    const stats = await ConfirmacionesModel.getEstadisticasActividad(actividadId);

    // Si es kraal, devolver lista completa con nombres
    let confirmaciones = null;
    if (isKraal) {
      confirmaciones = await ConfirmacionesModel.findByActividadId(actividadId);
    }

    res.status(200).json({
      success: true,
      data: {
        estadisticas: {
          confirmados: parseInt(stats.asistiran) || 0,
          noAsisten: parseInt(stats.no_asistiran) || 0,
          pendientes: parseInt(stats.sin_confirmar) || 0,
          total: parseInt(stats.asistiran || 0) + parseInt(stats.no_asistiran || 0) + parseInt(stats.sin_confirmar || 0)
        },
        // Solo para kraal
        confirmaciones: isKraal ? confirmaciones : null,
        scouts_sin_confirmar: isKraal ? stats.scouts_sin_confirmar : null
      }
    });
  } catch (error) {
    console.error('Error obteniendo confirmaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo confirmaciones',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/{id}/confirmar:
 *   post:
 *     summary: Confirmar asistencia a una actividad
 *     tags: [Actividades]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/confirmar', verifyToken, async (req, res) => {
  try {
    const actividadId = parseInt(req.params.id);
    const { educando_id, asistira, comentarios } = req.body;

    if (!educando_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del educando es obligatorio'
      });
    }

    if (asistira === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debe indicar si asistira o no'
      });
    }

    const confirmacion = await ConfirmacionesModel.createOrUpdate({
      actividad_id: actividadId,
      familiar_id: req.usuario.id,
      scout_id: educando_id,
      asistira,
      comentarios,
      confirmado_por: req.usuario.id
    });

    res.status(200).json({
      success: true,
      message: asistira ? 'Asistencia confirmada' : 'No asistencia registrada',
      data: confirmacion
    });
  } catch (error) {
    console.error('Error confirmando asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirmando asistencia',
      error: error.message
    });
  }
});

// ========================================
// RUTAS DE CAMPAMENTOS - Gestion de circulares y documentos
// ========================================

/**
 * @swagger
 * /api/actividades/campamento/recordatorios:
 *   get:
 *     summary: Obtener lista de recordatorios predefinidos para campamentos
 *     tags: [Actividades]
 */
router.get('/campamento/recordatorios', (req, res) => {
  res.json({
    success: true,
    data: getRecordatoriosPredefinidos()
  });
});

/**
 * @swagger
 * /api/actividades/campamento/cuenta-bancaria:
 *   get:
 *     summary: Obtener numero de cuenta bancaria por defecto
 *     tags: [Actividades]
 */
router.get('/campamento/cuenta-bancaria', (req, res) => {
  res.json({
    success: true,
    data: {
      numero_cuenta: DRIVE_CONFIG.NUMERO_CUENTA_DEFAULT,
      concepto_sugerido: 'Campamento [NOMBRE] - [Nombre Educando]'
    }
  });
});

/**
 * @swagger
 * /api/actividades/{id}/circular:
 *   post:
 *     summary: Subir circular de campamento (solo Scouters)
 *     tags: [Actividades]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 */
router.post('/:id/circular', verifyToken, checkRole(['admin', 'scouter']), uploadCircular.single('file'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningun archivo'
      });
    }

    // Verificar que la actividad existe
    const actividad = await ActividadModel.findById(id);
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Si ya tiene circular, eliminar la anterior
    if (actividad.circular_drive_id) {
      try {
        await eliminarCircular(actividad.circular_drive_id);
      } catch (e) {
        console.warn('No se pudo eliminar circular anterior:', e.message);
      }
    }

    // Detectar tipo de campamento desde titulo
    const tipoCampamento = detectarTipoCampamento(actividad.titulo);

    // Subir nueva circular
    const resultado = await subirCircularCampamento(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      tipoCampamento
    );

    // Actualizar actividad con referencia a la circular
    await ActividadModel.update(id, {
      circular_drive_id: resultado.fileId,
      circular_drive_url: resultado.fileUrl,
      circular_nombre: resultado.fileName
    });

    res.json({
      success: true,
      message: 'Circular subida correctamente',
      data: {
        fileId: resultado.fileId,
        fileUrl: resultado.fileUrl,
        fileName: resultado.fileName,
        webViewLink: resultado.webViewLink
      }
    });
  } catch (error) {
    console.error('Error subiendo circular:', error);
    res.status(500).json({
      success: false,
      message: 'Error subiendo circular',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/{id}/circular:
 *   get:
 *     summary: Descargar circular de campamento
 *     tags: [Actividades]
 */
router.get('/:id/circular', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const actividad = await ActividadModel.findById(id);
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    if (!actividad.circular_drive_id) {
      return res.status(404).json({
        success: false,
        message: 'Esta actividad no tiene circular'
      });
    }

    // Descargar archivo de Drive
    const archivo = await descargarCircular(actividad.circular_drive_id);

    // Configurar headers para descarga
    res.setHeader('Content-Type', archivo.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${archivo.fileName}"`);
    res.send(archivo.buffer);
  } catch (error) {
    console.error('Error descargando circular:', error);
    res.status(500).json({
      success: false,
      message: 'Error descargando circular',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/{id}/circular:
 *   delete:
 *     summary: Eliminar circular de campamento (solo Scouters)
 *     tags: [Actividades]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/circular', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const actividad = await ActividadModel.findById(id);
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    if (!actividad.circular_drive_id) {
      return res.status(404).json({
        success: false,
        message: 'Esta actividad no tiene circular'
      });
    }

    // Eliminar de Drive
    await eliminarCircular(actividad.circular_drive_id);

    // Limpiar referencias en BD
    await ActividadModel.update(id, {
      circular_drive_id: null,
      circular_drive_url: null,
      circular_nombre: null
    });

    res.json({
      success: true,
      message: 'Circular eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando circular:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando circular',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/actividades/{id}/crear-sheets:
 *   post:
 *     summary: Crear Google Sheets para inscripciones (solo Scouters)
 *     tags: [Actividades]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/crear-sheets', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const actividad = await ActividadModel.findById(id);
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Verificar que es un campamento
    if (actividad.tipo !== 'campamento') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden crear hojas de inscripcion para campamentos'
      });
    }

    // Si ya tiene sheets, devolver info existente
    if (actividad.sheets_inscripciones_id) {
      return res.json({
        success: true,
        message: 'Ya existe una hoja de inscripciones',
        data: {
          sheetId: actividad.sheets_inscripciones_id,
          yaExiste: true
        }
      });
    }

    // Detectar tipo de campamento
    const tipoCampamento = detectarTipoCampamento(actividad.titulo);

    // Crear hoja de inscripciones
    const resultado = await crearHojaInscripciones(
      id,
      actividad.titulo,
      tipoCampamento
    );

    // Guardar referencia en BD
    await ActividadModel.update(id, {
      sheets_inscripciones_id: resultado.sheetId
    });

    res.json({
      success: true,
      message: 'Hoja de inscripciones creada correctamente',
      data: {
        sheetId: resultado.sheetId,
        spreadsheetUrl: resultado.spreadsheetUrl,
        folderName: resultado.folderName
      }
    });
  } catch (error) {
    console.error('Error creando hoja de inscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando hoja de inscripciones',
      error: error.message
    });
  }
});

/**
 * Detectar tipo de campamento desde titulo
 */
function detectarTipoCampamento(titulo) {
  const tituloLower = titulo.toLowerCase();

  if (tituloLower.includes('inicio') || tituloLower.includes('apertura')) {
    return 'INICIO';
  }
  if (tituloLower.includes('navidad') || tituloLower.includes('christmas')) {
    return 'NAVIDAD';
  }
  if (tituloLower.includes('aniversario')) {
    return 'ANIVERSARIO';
  }
  if (tituloLower.includes('pascua') || tituloLower.includes('semana santa')) {
    return 'PASCUA';
  }
  if (tituloLower.includes('verano') || tituloLower.includes('summer')) {
    return 'VERANO';
  }

  return 'INICIO';
}

module.exports = router;
