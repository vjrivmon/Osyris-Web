const DocumentoFamilia = require('../models/documentos_familia.model');
const Familiar = require('../models/familiar.model');
const Joi = require('joi');

// Esquema de validación para la creación de documentos
const documentoSchema = Joi.object({
  scout_id: Joi.number().integer().required(),
  tipo_documento: Joi.string().required(),
  titulo: Joi.string().required(),
  descripcion: Joi.string().optional(),
  archivo_nombre: Joi.string().optional(),
  archivo_ruta: Joi.string().optional(),
  tipo_archivo: Joi.string().optional(),
  tamaño_archivo: Joi.number().integer().optional(),
  fecha_vencimiento: Joi.date().optional(),
  estado: Joi.string().valid('vigente', 'por_vencer', 'vencido', 'pendiente').default('pendiente')
});

// Esquema de validación para la actualización de documentos
const documentoUpdateSchema = Joi.object({
  titulo: Joi.string().optional(),
  descripcion: Joi.string().optional(),
  tipo_documento: Joi.string().optional(),
  fecha_vencimiento: Joi.date().optional(),
  estado: Joi.string().valid('vigente', 'por_vencer', 'vencido', 'pendiente').optional(),
  aprobado: Joi.boolean().optional()
}).min(1);

// Obtener todos los documentos de los scouts de un familiar
const getDocumentosByFamiliar = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const { scout_id, estado, tipo_documento } = req.query;

    let documentos;

    if (scout_id) {
      // Verificar que el familiar tiene acceso al scout
      const tieneAcceso = await Familiar.verificarAcceso(familiarId, parseInt(scout_id));
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este scout'
        });
      }
      documentos = await DocumentoFamilia.findByScoutId(parseInt(scout_id), familiarId);
    } else {
      // Obtener todos los documentos de todos los scouts del familiar
      const scouts = await Familiar.findByFamiliarId(familiarId);
      const todosDocumentos = [];

      for (const scout of scouts) {
        const documentosScout = await DocumentoFamilia.findByScoutId(scout.scout_id, familiarId);
        todosDocumentos.push(...documentosScout);
      }

      documentos = todosDocumentos;
    }

    // Filtrar por estado si se proporciona
    if (estado) {
      documentos = documentos.filter(doc => doc.estado === estado);
    }

    // Filtrar por tipo de documento si se proporciona
    if (tipo_documento) {
      documentos = documentos.filter(doc => doc.tipo_documento === tipo_documento);
    }

    res.status(200).json({
      success: true,
      data: documentos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los documentos',
      error: error.message
    });
  }
};

// Obtener documentos de un scout específico
const getDocumentosByScout = async (req, res) => {
  try {
    const scoutId = parseInt(req.params.scoutId);
    const familiarId = req.usuario.id;

    if (isNaN(scoutId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de scout inválido'
      });
    }

    // Verificar que el familiar tiene acceso al scout
    const tieneAcceso = await Familiar.verificarAcceso(familiarId, scoutId);
    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este scout'
      });
    }

    const documentos = await DocumentoFamilia.findByScoutId(scoutId, familiarId);

    res.status(200).json({
      success: true,
      data: documentos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los documentos del scout',
      error: error.message
    });
  }
};

// Obtener un documento por ID
const getDocumentoById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de documento inválido'
      });
    }

    const documento = await DocumentoFamilia.findById(id, familiarId);

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar que el familiar tiene acceso al scout
    const tieneAcceso = await Familiar.verificarAcceso(familiarId, documento.scout_id);
    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este documento'
      });
    }

    res.status(200).json({
      success: true,
      data: documento
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el documento',
      error: error.message
    });
  }
};

// Crear un nuevo documento
const createDocumento = async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = documentoSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de documento inválidos',
        error: error.details[0].message
      });
    }

    const familiarId = req.usuario.id;

    // Verificar que el familiar tiene acceso al scout
    const tieneAcceso = await Familiar.verificarAcceso(familiarId, value.scout_id);
    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este scout'
      });
    }

    // Agregar el familiar_id al documento
    value.familiar_id = familiarId;

    const newDocumento = await DocumentoFamilia.create(value);

    res.status(201).json({
      success: true,
      message: 'Documento creado correctamente',
      data: newDocumento
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el documento',
      error: error.message
    });
  }
};

// Actualizar un documento
const updateDocumento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de documento inválido'
      });
    }

    // Verificar que el documento existe
    const documento = await DocumentoFamilia.findById(id, familiarId);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar que el familiar es quien subió el documento
    if (documento.familiar_id !== familiarId && !['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar este documento'
      });
    }

    // Validar datos de entrada
    const { error, value } = documentoUpdateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de documento inválidos',
        error: error.details[0].message
      });
    }

    // Solo admins y scouters pueden cambiar el estado de aprobación
    if (value.aprobado !== undefined && !['admin', 'scouter'].includes(req.usuario.rol)) {
      delete value.aprobado;
    }

    const updatedDocumento = await DocumentoFamilia.update(id, value, req.usuario.id);

    res.status(200).json({
      success: true,
      message: 'Documento actualizado correctamente',
      data: updatedDocumento
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el documento',
      error: error.message
    });
  }
};

// Eliminar un documento
const deleteDocumento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de documento inválido'
      });
    }

    // Verificar que el documento existe
    const documento = await DocumentoFamilia.findById(id, familiarId);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar que el familiar es quien subió el documento o es admin/scouter
    if (documento.familiar_id !== familiarId && !['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este documento'
      });
    }

    const deleted = await DocumentoFamilia.remove(id, familiarId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo eliminar el documento'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Documento eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el documento',
      error: error.message
    });
  }
};

// Aprobar un documento (solo admins y scouters)
const aprobarDocumento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de documento inválido'
      });
    }

    // Solo admins y scouters pueden aprobar documentos
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para aprobar documentos'
      });
    }

    // Verificar que el documento existe
    const documento = await DocumentoFamilia.findById(id);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    const updatedDocumento = await DocumentoFamilia.aprobar(id, req.usuario.id);

    res.status(200).json({
      success: true,
      message: 'Documento aprobado correctamente',
      data: updatedDocumento
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al aprobar el documento',
      error: error.message
    });
  }
};

// Rechazar un documento (solo admins y scouters)
const rechazarDocumento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de documento inválido'
      });
    }

    // Solo admins y scouters pueden rechazar documentos
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para rechazar documentos'
      });
    }

    // Verificar que el documento existe
    const documento = await DocumentoFamilia.findById(id);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    const updatedDocumento = await DocumentoFamilia.rechazar(id, req.usuario.id);

    res.status(200).json({
      success: true,
      message: 'Documento rechazado correctamente',
      data: updatedDocumento
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al rechazar el documento',
      error: error.message
    });
  }
};

// Obtener documentos por vencer
const getDocumentosPorVencer = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const dias = parseInt(req.query.dias) || 30;

    const scouts = await Familiar.findByFamiliarId(familiarId);
    const todosDocumentos = [];

    for (const scout of scouts) {
      const documentosScout = await DocumentoFamilia.getDocumentosPorVencer(dias, familiarId);
      todosDocumentos.push(...documentosScout);
    }

    res.status(200).json({
      success: true,
      data: todosDocumentos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentos por vencer',
      error: error.message
    });
  }
};

// Obtener documentos pendientes de aprobación (solo admins y scouters)
const getDocumentosPendientes = async (req, res) => {
  try {
    // Solo admins y scouters pueden ver documentos pendientes
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver documentos pendientes'
      });
    }

    const documentos = await DocumentoFamilia.findByEstado('pendiente');

    res.status(200).json({
      success: true,
      data: documentos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentos pendientes',
      error: error.message
    });
  }
};

module.exports = {
  getDocumentosByFamiliar,
  getDocumentosByScout,
  getDocumentoById,
  createDocumento,
  updateDocumento,
  deleteDocumento,
  aprobarDocumento,
  rechazarDocumento,
  getDocumentosPorVencer,
  getDocumentosPendientes
};