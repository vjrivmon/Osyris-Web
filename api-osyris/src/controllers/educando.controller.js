const Educando = require('../models/educando.model');
const Joi = require('joi');

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
  id_externo: Joi.number().integer().allow(null)
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
  notas: Joi.string().allow(null, '')
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
    // Solo admins y scouters pueden ver todos los educandos
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta información'
      });
    }

    const filters = {
      seccion_id: req.query.seccion_id ? parseInt(req.query.seccion_id) : undefined,
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
    // Solo admins pueden crear educandos
    if (req.usuario.rol !== 'admin') {
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

    res.status(201).json({
      success: true,
      message: 'Educando creado exitosamente',
      data: nuevoEducando
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

    // Solo admins pueden actualizar educandos
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar educandos'
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

    // Validar datos
    const { error, value } = educandoUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const educandoActualizado = await Educando.update(id, value);

    res.status(200).json({
      success: true,
      message: 'Educando actualizado exitosamente',
      data: educandoActualizado
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

    // Solo admins pueden desactivar educandos
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para desactivar educandos'
      });
    }

    const educando = await Educando.findById(id);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
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

    // Solo admins pueden reactivar educandos
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para reactivar educandos'
      });
    }

    const educando = await Educando.findById(id);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
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

    const educandos = await Educando.search(searchTerm);

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
  getEstadisticas
};
