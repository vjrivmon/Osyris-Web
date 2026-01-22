const Educando = require('../models/educando.model');
const familiarEducandoModel = require('../models/familiar_educando.model');
const driveService = require('../services/google-drive.service');
const { DRIVE_CONFIG } = require('../config/google-drive.config');
const notificacionFamiliaModel = require('../models/notificaciones_familia.model');
const Joi = require('joi');

/**
 * Obtiene el slug de una sección dado su ID
 * @param {number} seccionId - ID de la sección
 * @returns {string|null} - Slug de la sección o null si no existe
 */
const getSeccionSlugById = (seccionId) => {
  const seccion = DRIVE_CONFIG.SECCIONES_ASISTENCIA.find(s => s.id === seccionId);
  return seccion ? seccion.slug : null;
};

// Esquema de validación para la creación de educandos
const educandoCreateSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  apellidos: Joi.string().min(2).max(200).required(),
  genero: Joi.string().valid('masculino', 'femenino', 'otro', 'prefiero_no_decir').default('prefiero_no_decir'),
  fecha_nacimiento: Joi.date().required(),
  dni: Joi.string().max(20).allow(null, ''),
  pasaporte: Joi.string().max(50).allow(null, ''),
  direccion: Joi.string().allow(null, ''),
  codigo_postal: Joi.string().max(10).allow(null, ''),
  municipio: Joi.string().max(100).allow(null, ''),
  telefono_casa: Joi.string().max(20).allow(null, ''),
  telefono_movil: Joi.string().max(20).allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  alergias: Joi.string().allow(null, ''),
  notas_medicas: Joi.string().allow(null, ''),
  seccion_id: Joi.number().integer().required(),
  foto_perfil: Joi.string().uri().allow(null, ''),
  activo: Joi.boolean().default(true),
  notas: Joi.string().allow(null, ''),
  id_externo: Joi.number().integer().allow(null),
  autorizacion_imagenes: Joi.boolean().allow(null).default(null)
});

// Esquema de validación para la actualización de educandos
const educandoUpdateSchema = Joi.object({
  nombre: Joi.string().min(2).max(100),
  apellidos: Joi.string().min(2).max(200),
  genero: Joi.string().valid('masculino', 'femenino', 'otro', 'prefiero_no_decir'),
  fecha_nacimiento: Joi.date(),
  dni: Joi.string().max(20).allow(null, ''),
  pasaporte: Joi.string().max(50).allow(null, ''),
  direccion: Joi.string().allow(null, ''),
  codigo_postal: Joi.string().max(10).allow(null, ''),
  municipio: Joi.string().max(100).allow(null, ''),
  telefono_casa: Joi.string().max(20).allow(null, ''),
  telefono_movil: Joi.string().max(20).allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  alergias: Joi.string().allow(null, ''),
  notas_medicas: Joi.string().allow(null, ''),
  seccion_id: Joi.number().integer(),
  foto_perfil: Joi.string().uri().allow(null, ''),
  activo: Joi.boolean(),
  notas: Joi.string().allow(null, ''),
  autorizacion_imagenes: Joi.boolean().allow(null)
}).min(1);

/**
 * @swagger
 * /api/educandos:
 *   get:
 *     summary: Obtener lista de educandos
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: seccion_id
 *         schema:
 *           type: integer
 *         description: Filtrar por sección
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre/apellidos
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *         description: Filtrar por género
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Desplazamiento para paginación
 *     responses:
 *       200:
 *         description: Lista de educandos obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
const getAllEducandos = async (req, res) => {
  try {
    // Solo admins y scouters pueden ver educandos
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta información'
      });
    }

    // IMPORTANTE: Scouters solo pueden ver educandos de SU sección
    let seccionIdFiltro;
    if (req.usuario.rol === 'scouter') {
      // Forzar la sección del scouter (no puede ver otras secciones)
      seccionIdFiltro = req.usuario.seccion_id;
      if (!seccionIdFiltro) {
        console.error(`[CRIT-001] Usuario scouter ${req.usuario.id} (${req.usuario.email}) no tiene seccion_id asignada`);
        return res.status(403).json({
          success: false,
          message: 'No tienes una sección asignada a tu cuenta.',
          details: 'Tu usuario de Kraal necesita tener una sección asignada para poder ver educandos. Contacta al administrador del sistema para que te asigne tu sección (Castores, Manada, Tropa, Pioneros o Rutas).',
          error_code: 'SCOUTER_NO_SECTION',
          usuario_id: req.usuario.id
        });
      }
    } else {
      // Admin puede filtrar por cualquier sección o ver todas
      seccionIdFiltro = req.query.seccion_id ? parseInt(req.query.seccion_id) : undefined;
    }

    const filters = {
      seccion_id: seccionIdFiltro,
      activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
      search: req.query.search || undefined,
      genero: req.query.genero || undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined
    };

    const educandos = await Educando.findAll(filters);
    const total = await Educando.count(filters);

    res.status(200).json({
      success: true,
      data: educandos,
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los educandos',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/{id}:
 *   get:
 *     summary: Obtener un educando por ID
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Educando encontrado
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
const getEducandoById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de educando inválido'
      });
    }

    const educando = await Educando.findById(id);

    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    // Verificar permisos: familias solo pueden ver sus propios educandos
    if (req.usuario.rol === 'familia') {
      // TODO: Verificar si el familiar tiene acceso a este educando
      // Por ahora, denegamos acceso
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este educando'
      });
    }

    // IMPORTANTE: Scouters solo pueden ver educandos de SU sección
    if (req.usuario.rol === 'scouter' && educando.seccion_id !== req.usuario.seccion_id) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes ver educandos de tu propia sección'
      });
    }

    res.status(200).json({
      success: true,
      data: educando
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el educando',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos:
 *   post:
 *     summary: Crear un nuevo educando
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Educando'
 *     responses:
 *       201:
 *         description: Educando creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const createEducando = async (req, res) => {
  try {
    // Admins pueden crear en cualquier sección
    // Scouters solo pueden crear en SU sección
    if (req.usuario.rol === 'scouter') {
      const seccionIdSolicitada = req.body.seccion_id;
      if (seccionIdSolicitada !== req.usuario.seccion_id) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes crear educandos en tu propia sección'
        });
      }
    } else if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear educandos'
      });
    }

    // Validar datos
    const { error, value } = educandoCreateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const nuevoEducando = await Educando.create(value);

    // CRIT-003: Crear carpeta en Google Drive para el educando
    // No bloquear si falla - el educando se crea igual
    let driveFolderCreated = false;
    try {
      const folder = await driveService.createEducandoFolder(nuevoEducando);
      if (folder && folder.id) {
        // Actualizar el educando con el drive_folder_id
        await Educando.update(nuevoEducando.id, { drive_folder_id: folder.id });
        nuevoEducando.drive_folder_id = folder.id;
        driveFolderCreated = true;
        console.log(`✅ Carpeta Drive creada y vinculada para educando ${nuevoEducando.id}`);
      }
    } catch (driveError) {
      console.error(`⚠️ Error creando carpeta en Drive para educando ${nuevoEducando.id}:`, driveError.message);
      // No fallar la creación del educando por error de Drive
    }

    res.status(201).json({
      success: true,
      message: 'Educando creado exitosamente',
      data: nuevoEducando,
      driveFolderCreated
    });
  } catch (error) {
    if (error.message.includes('Ya existe')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear el educando',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/{id}:
 *   put:
 *     summary: Actualizar un educando
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Educando'
 *     responses:
 *       200:
 *         description: Educando actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const updateEducando = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de educando inválido'
      });
    }

    // Verificar que existe
    const educandoExistente = await Educando.findById(id);
    if (!educandoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    // Admins y Scouters pueden actualizar educandos
    // Scouters solo pueden actualizar educandos de SU sección actual
    if (req.usuario.rol === 'scouter') {
      if (educandoExistente.seccion_id !== req.usuario.seccion_id) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes editar educandos de tu propia sección'
        });
      }
      // Scouters SÍ pueden cambiar educandos a otra sección (para promociones)
    } else if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar educandos'
      });
    }

    // Validar datos
    const { error, value } = educandoUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Detectar si hay cambio de sección
    const cambioSeccion = value.seccion_id && value.seccion_id !== educandoExistente.seccion_id;
    let carpetaMovida = false;

    // Si hay cambio de sección Y el educando tiene carpeta en Drive, moverla
    if (cambioSeccion && educandoExistente.drive_folder_id) {
      try {
        const newSeccionSlug = getSeccionSlugById(value.seccion_id);
        if (!newSeccionSlug) {
          return res.status(400).json({
            success: false,
            message: `Sección destino inválida: ${value.seccion_id}`
          });
        }

        const anioNacimiento = new Date(educandoExistente.fecha_nacimiento).getFullYear();

        console.log(`📦 Moviendo carpeta de educando ${id} de sección ${educandoExistente.seccion_id} a ${value.seccion_id}`);

        await driveService.moveEducandoFolderToSection(
          educandoExistente.drive_folder_id,
          newSeccionSlug,
          anioNacimiento
        );

        carpetaMovida = true;
        console.log(`✅ Carpeta movida exitosamente para educando ${id}`);
      } catch (driveError) {
        console.error(`❌ Error moviendo carpeta en Drive:`, driveError.message);
        // Decidir si fallar la operación completa o continuar sin mover la carpeta
        // Por seguridad, fallamos para evitar inconsistencias
        return res.status(500).json({
          success: false,
          message: 'Error al mover la carpeta de documentos a la nueva sección',
          error: driveError.message
        });
      }
    }

    const educandoActualizado = await Educando.update(id, value);

    // Construir mensaje de respuesta
    let mensaje = 'Educando actualizado exitosamente';
    if (cambioSeccion) {
      const oldSeccionSlug = getSeccionSlugById(educandoExistente.seccion_id);
      const newSeccionSlug = getSeccionSlugById(value.seccion_id);
      mensaje += `. Cambiado de ${oldSeccionSlug?.toUpperCase() || 'sección anterior'} a ${newSeccionSlug?.toUpperCase() || 'nueva sección'}`;
      if (carpetaMovida) {
        mensaje += ' (carpeta de documentos movida)';
      }
    }

    res.status(200).json({
      success: true,
      message: mensaje,
      data: educandoActualizado,
      cambioSeccion,
      carpetaMovida
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el educando',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/{id}/deactivate:
 *   patch:
 *     summary: Desactivar un educando
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Educando desactivado exitosamente
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const deactivateEducando = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de educando inválido'
      });
    }

    const educando = await Educando.findById(id);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    // Admins pueden desactivar cualquier educando
    // Scouters solo pueden desactivar educandos de SU sección
    if (req.usuario.rol === 'scouter') {
      if (educando.seccion_id !== req.usuario.seccion_id) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes desactivar educandos de tu propia sección'
        });
      }
    } else if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para desactivar educandos'
      });
    }

    const educandoDesactivado = await Educando.deactivate(id);

    res.status(200).json({
      success: true,
      message: 'Educando desactivado exitosamente',
      data: educandoDesactivado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al desactivar el educando',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/{id}/reactivate:
 *   patch:
 *     summary: Reactivar un educando
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Educando reactivado exitosamente
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const reactivateEducando = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de educando inválido'
      });
    }

    const educando = await Educando.findById(id);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    // Admins pueden reactivar cualquier educando
    // Scouters solo pueden reactivar educandos de SU sección
    if (req.usuario.rol === 'scouter') {
      if (educando.seccion_id !== req.usuario.seccion_id) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes reactivar educandos de tu propia sección'
        });
      }
    } else if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para reactivar educandos'
      });
    }

    const educandoReactivado = await Educando.reactivate(id);

    res.status(200).json({
      success: true,
      message: 'Educando reactivado exitosamente',
      data: educandoReactivado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al reactivar el educando',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/{id}:
 *   delete:
 *     summary: Eliminar permanentemente un educando
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Educando eliminado exitosamente
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const deleteEducando = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de educando inválido'
      });
    }

    // Solo admins pueden eliminar educandos
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar educandos'
      });
    }

    const educando = await Educando.findById(id);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    await Educando.remove(id);

    res.status(200).json({
      success: true,
      message: 'Educando eliminado permanentemente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el educando',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/seccion/{seccionId}:
 *   get:
 *     summary: Obtener educandos por sección
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seccionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sección
 *     responses:
 *       200:
 *         description: Educandos de la sección obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const getEducandosBySeccion = async (req, res) => {
  try {
    const seccionId = parseInt(req.params.seccionId);

    if (isNaN(seccionId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de sección inválido'
      });
    }

    // Solo admins y scouters pueden ver educandos por sección
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta información'
      });
    }

    // IMPORTANTE: Scouter solo puede ver educandos de SU sección
    if (req.usuario.rol === 'scouter' && seccionId !== req.usuario.seccion_id) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes ver educandos de tu propia sección'
      });
    }

    const educandos = await Educando.findBySeccion(seccionId);

    res.status(200).json({
      success: true,
      data: educandos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener educandos de la sección',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/search:
 *   get:
 *     summary: Buscar educandos
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *       400:
 *         description: Término de búsqueda requerido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const searchEducandos = async (req, res) => {
  try {
    // Solo admins y scouters pueden buscar educandos
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para buscar educandos'
      });
    }

    const searchTerm = req.query.q;

    if (!searchTerm || searchTerm.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Término de búsqueda requerido'
      });
    }

    // IMPORTANTE: Scouters solo pueden buscar en SU sección
    let seccionIdFiltro = null;
    if (req.usuario.rol === 'scouter') {
      seccionIdFiltro = req.usuario.seccion_id;
      if (!seccionIdFiltro) {
        console.error(`[CRIT-001] Usuario scouter ${req.usuario.id} (${req.usuario.email}) no tiene seccion_id asignada`);
        return res.status(403).json({
          success: false,
          message: 'No tienes una sección asignada a tu cuenta.',
          details: 'Tu usuario de Kraal necesita tener una sección asignada para poder buscar educandos. Contacta al administrador del sistema para que te asigne tu sección.',
          error_code: 'SCOUTER_NO_SECTION',
          usuario_id: req.usuario.id
        });
      }
    }

    const educandos = await Educando.search(searchTerm, seccionIdFiltro);

    res.status(200).json({
      success: true,
      data: educandos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar educandos',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de educandos
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const getEstadisticas = async (req, res) => {
  try {
    // Solo admins pueden ver estadísticas
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver estadísticas'
      });
    }

    const estadisticas = await Educando.getEstadisticas();

    res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/{id}/documentacion:
 *   get:
 *     summary: Obtener estado de documentación de un educando
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     responses:
 *       200:
 *         description: Estado de documentación obtenido
 *       404:
 *         description: Educando no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const getEducandoDocumentacion = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de educando inválido'
      });
    }

    // Verificar permisos
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta información'
      });
    }

    const educando = await Educando.findById(id);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    // Verificar que scouter solo acceda a su sección
    if (req.usuario.rol === 'scouter' && educando.seccion_id !== req.usuario.seccion_id) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes ver documentación de educandos de tu sección'
      });
    }

    // Calcular edad
    const fechaNacimiento = new Date(educando.fecha_nacimiento);
    const anioNacimiento = fechaNacimiento.getFullYear();
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesCumple = fechaNacimiento.getMonth();
    if (mesActual < mesCumple || (mesActual === mesCumple && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    const nombreCompleto = `${educando.nombre} ${educando.apellidos}`;
    const seccionSlug = educando.seccion_nombre?.toLowerCase().replace(/\s+/g, '') || '';

    // Obtener estructura de carpeta y documentos
    const estructura = await driveService.getEducandoFolderStructure(
      seccionSlug,
      anioNacimiento,
      nombreCompleto,
      edad,
      id
    );

    res.status(200).json({
      success: true,
      data: {
        educando: {
          id: educando.id,
          nombre: educando.nombre,
          apellidos: educando.apellidos,
          edad
        },
        documentos: estructura.status,
        resumen: estructura.resumen
      }
    });
  } catch (error) {
    console.error('Error obteniendo documentación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentación',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/seccion/{seccionId}/completo:
 *   get:
 *     summary: Obtener educandos de sección con info de documentación y familia
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seccionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sección
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Registros por página (default 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre/apellidos
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [nombre, apellidos, edad, fecha_nacimiento, genero]
 *         description: Campo para ordenar
 *       - in: query
 *         name: orderDir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Dirección de ordenación
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *         description: Filtrar por género
 *       - in: query
 *         name: estadoDocs
 *         schema:
 *           type: string
 *           enum: [todos, completos, incompletos, pendientes]
 *         description: Filtrar por estado de documentación
 *     responses:
 *       200:
 *         description: Lista de educandos con información completa
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const getEducandosBySeccionCompleto = async (req, res) => {
  try {
    const seccionId = parseInt(req.params.seccionId);

    if (isNaN(seccionId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de sección inválido'
      });
    }

    // Verificar permisos
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta información'
      });
    }

    // Scouter solo puede ver su sección
    if (req.usuario.rol === 'scouter' && seccionId !== req.usuario.seccion_id) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes ver educandos de tu propia sección'
      });
    }

    // Parámetros de paginación y filtros
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const orderBy = req.query.orderBy || 'apellidos';
    const orderDir = req.query.orderDir === 'desc' ? 'desc' : 'asc';
    const genero = req.query.genero || '';
    const estadoDocs = req.query.estadoDocs || 'todos';
    const grupoEdad = req.query.grupoEdad || 'todos';
    // Filtro de activo: puede ser 'true', 'false' o undefined (todos)
    const activoParam = req.query.activo;
    const activoFiltro = activoParam !== undefined ? activoParam === 'true' : undefined;

    // Obtener TODOS los educandos (sin paginación) para poder filtrar correctamente
    // La paginación se aplicará después del filtrado por estadoDocs
    const filters = {
      seccion_id: seccionId,
      activo: activoFiltro, // undefined = todos, true = solo activos, false = solo inactivos
      search: search || undefined,
      genero: genero || undefined
      // NO incluimos limit/offset aquí - la paginación se hace al final
    };

    const educandos = await Educando.findAll(filters);

    // Enriquecer cada educando con info de familia y docs
    const educandosEnriquecidos = await Promise.all(
      educandos.map(async (educando) => {
        // Obtener familias vinculadas
        const familiares = await familiarEducandoModel.findFamiliaresByEducando(educando.id);
        const tieneFamiliaVinculada = familiares.length > 0;

        // Calcular edad
        const fechaNacimiento = new Date(educando.fecha_nacimiento);
        const anioNacimiento = fechaNacimiento.getFullYear();
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mesActual = hoy.getMonth();
        const mesCumple = fechaNacimiento.getMonth();
        if (mesActual < mesCumple || (mesActual === mesCumple && hoy.getDate() < fechaNacimiento.getDate())) {
          edad--;
        }

        // Obtener resumen de documentación
        let docsResumen = { completos: 0, total: 5, pendientes: 0, faltantes: 0 };
        try {
          const nombreCompleto = `${educando.nombre} ${educando.apellidos}`;
          const seccionSlug = educando.seccion_nombre?.toLowerCase().replace(/\s+/g, '') || '';

          const estructura = await driveService.getEducandoFolderStructure(
            seccionSlug,
            anioNacimiento,
            nombreCompleto,
            edad,
            educando.id
          );

          if (estructura && estructura.resumen) {
            docsResumen = {
              completos: estructura.resumen.completos || 0,
              total: estructura.resumen.total || 5,
              pendientes: estructura.resumen.pendientes || 0,
              faltantes: estructura.resumen.faltantes || 0
            };
          }
        } catch (err) {
          console.error(`Error obteniendo docs para educando ${educando.id}:`, err.message);
        }

        // Formatear datos de familiares para el frontend
        const familiaresFormateados = familiares.map(f => ({
          id: f.familiar_id,
          nombre: f.nombre,
          apellidos: f.apellidos,
          telefono: f.telefono,
          email: f.email,
          relacion: f.relacion,
          es_contacto_principal: f.es_contacto_principal
        }));

        return {
          ...educando,
          edad,
          tiene_familia_vinculada: tieneFamiliaVinculada,
          familiares_count: familiares.length,
          familiares: familiaresFormateados,
          docs_completos: docsResumen.completos,
          docs_total: docsResumen.total,
          docs_pendientes: docsResumen.pendientes,
          docs_faltantes: docsResumen.faltantes
        };
      })
    );

    // Filtrar por estado de documentación si se especifica
    let educandosFiltrados = educandosEnriquecidos;
    if (estadoDocs !== 'todos') {
      educandosFiltrados = educandosFiltrados.filter(e => {
        if (estadoDocs === 'completos') return e.docs_completos === e.docs_total;
        if (estadoDocs === 'incompletos') return e.docs_completos < e.docs_total;
        if (estadoDocs === 'pendientes') return e.docs_pendientes > 0;
        return true;
      });
    }

    // Filtrar por grupo de edad si se especifica
    if (grupoEdad !== 'todos') {
      // Parsear el rango de edad del formato "5-7", "8-10", etc.
      const [minEdad, maxEdad] = grupoEdad.split('-').map(Number);
      if (!isNaN(minEdad) && !isNaN(maxEdad)) {
        educandosFiltrados = educandosFiltrados.filter(e =>
          e.edad >= minEdad && e.edad <= maxEdad
        );
      }
    }

    // Ordenar
    educandosFiltrados.sort((a, b) => {
      let valA, valB;
      if (orderBy === 'edad') {
        valA = a.edad;
        valB = b.edad;
      } else if (orderBy === 'fecha_nacimiento') {
        valA = new Date(a.fecha_nacimiento);
        valB = new Date(b.fecha_nacimiento);
      } else {
        valA = (a[orderBy] || '').toString().toLowerCase();
        valB = (b[orderBy] || '').toString().toLowerCase();
      }

      if (valA < valB) return orderDir === 'asc' ? -1 : 1;
      if (valA > valB) return orderDir === 'asc' ? 1 : -1;
      return 0;
    });

    // Calcular total y totalPages DESPUÉS del filtrado
    const total = educandosFiltrados.length;
    const totalPages = Math.ceil(total / limit);

    // Aplicar paginación al resultado ya filtrado y ordenado
    const offset = (page - 1) * limit;
    const educandosPaginados = educandosFiltrados.slice(offset, offset + limit);

    res.status(200).json({
      success: true,
      data: educandosPaginados,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error obteniendo educandos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener educandos de la sección',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/educandos/{id}/notificar-documentacion:
 *   post:
 *     summary: Enviar notificación a familias sobre documentación faltante
 *     tags: [Educandos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del educando
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentos_faltantes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de tipos de documentos faltantes
 *               mensaje:
 *                 type: string
 *                 description: Mensaje personalizado opcional
 *     responses:
 *       200:
 *         description: Notificación enviada exitosamente
 *       404:
 *         description: Educando no encontrado o sin familia vinculada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
const notificarDocumentacionFaltante = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { documentos_faltantes, mensaje } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de educando inválido'
      });
    }

    // Verificar permisos
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para enviar notificaciones'
      });
    }

    const educando = await Educando.findById(id);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    // Verificar que scouter solo notifique su sección
    if (req.usuario.rol === 'scouter' && educando.seccion_id !== req.usuario.seccion_id) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes enviar notificaciones para educandos de tu sección'
      });
    }

    // Obtener familiares vinculados
    const familiares = await familiarEducandoModel.findFamiliaresByEducando(id);
    if (familiares.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Este educando no tiene familias vinculadas'
      });
    }

    // Construir mensaje de notificación
    const docsListaTexto = documentos_faltantes && documentos_faltantes.length > 0
      ? documentos_faltantes.join(', ')
      : 'documentos pendientes';

    const tituloNotif = `Documentación pendiente de ${educando.nombre}`;
    const mensajeNotif = mensaje
      ? mensaje
      : `Por favor, recuerda subir la documentación faltante de ${educando.nombre} ${educando.apellidos}: ${docsListaTexto}`;

    // Crear notificación para cada familiar
    const notificacionesCreadas = [];
    for (const familiar of familiares) {
      try {
        const notif = await notificacionFamiliaModel.create({
          familiar_id: familiar.familiar_id,
          educando_id: id,
          tipo: 'aviso_documentacion',
          titulo: tituloNotif,
          mensaje: mensajeNotif,
          enlace_accion: `/familia/documentos/${id}`,
          prioridad: 'alta',
          metadata: {
            documentos_faltantes,
            enviado_por: req.usuario.id,
            enviado_por_nombre: `${req.usuario.nombre} ${req.usuario.apellidos}`
          }
        });
        notificacionesCreadas.push(notif);
      } catch (err) {
        console.error(`Error creando notificación para familiar ${familiar.familiar_id}:`, err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Notificación enviada a ${notificacionesCreadas.length} familiar(es)`,
      data: {
        familiaresNotificados: notificacionesCreadas.length,
        totalFamiliares: familiares.length
      }
    });
  } catch (error) {
    console.error('Error enviando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificación',
      error: error.message
    });
  }
};

module.exports = {
  getAllEducandos,
  getEducandoById,
  createEducando,
  updateEducando,
  deactivateEducando,
  reactivateEducando,
  deleteEducando,
  getEducandosBySeccion,
  searchEducandos,
  getEstadisticas,
  getEducandoDocumentacion,
  getEducandosBySeccionCompleto,
  notificarDocumentacionFaltante
};
