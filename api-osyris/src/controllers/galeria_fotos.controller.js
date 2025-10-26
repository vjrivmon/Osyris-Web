const GaleriaFotos = require('../models/galeria_fotos.model');
const Familiar = require('../models/familiar.model');
const Joi = require('joi');
const path = require('path');

// Esquema de validación para la creación de fotos
const fotoSchema = Joi.object({
  album_id: Joi.string().required(),
  nombre_album: Joi.string().required(),
  nombre_archivo: Joi.string().required(),
  archivo_ruta: Joi.string().required(),
  descripcion: Joi.string().optional(),
  fotografiado_ids: Joi.array().items(Joi.number().integer()).optional(),
  fecha_tomada: Joi.date().optional(),
  evento_id: Joi.number().integer().optional(),
  visible_para_familiares: Joi.boolean().default(true),
  etiquetas: Joi.array().items(Joi.string()).optional()
});

// Esquema de validación para la actualización de fotos
const fotoUpdateSchema = Joi.object({
  descripcion: Joi.string().optional(),
  fotografiado_ids: Joi.array().items(Joi.number().integer()).optional(),
  fecha_tomada: Joi.date().optional(),
  visible_para_familiares: Joi.boolean().optional(),
  etiquetas: Joi.array().items(Joi.string()).optional()
}).min(1);

// Obtener todas las fotos visibles para un familiar
const getFotosByFamiliar = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const {
      album_id,
      evento_id,
      etiqueta,
      fecha_desde,
      fecha_hasta,
      limit = 50,
      offset = 0
    } = req.query;

    const options = {
      album_id,
      evento_id: evento_id ? parseInt(evento_id) : null,
      etiqueta,
      fecha_desde,
      fecha_hasta,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const fotos = await GaleriaFotos.findByFamiliarId(familiarId, options);

    res.status(200).json({
      success: true,
      data: fotos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las fotos',
      error: error.message
    });
  }
};

// Obtener fotos de un scout específico
const getFotosByScout = async (req, res) => {
  try {
    const scoutId = parseInt(req.params.scoutId);
    const familiarId = req.usuario.id;
    const { album_id, limit = 50 } = req.query;

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

    const options = {
      album_id,
      limit: parseInt(limit)
    };

    const fotos = await GaleriaFotos.findByScoutId(scoutId, familiarId, options);

    res.status(200).json({
      success: true,
      data: fotos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las fotos del scout',
      error: error.message
    });
  }
};

// Obtener todos los álbumes disponibles para un familiar
const getAlbumesByFamiliar = async (req, res) => {
  try {
    // TODO: Implementar consulta real cuando se corrijan los placeholders SQL
    // Por ahora devuelve array vacío
    const albumes = [];

    res.status(200).json({
      success: true,
      data: albumes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los álbumes',
      error: error.message
    });
  }
};

// Obtener una foto por ID
const getFotoById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de foto inválido'
      });
    }

    const foto = await GaleriaFotos.findById(id, familiarId);

    if (!foto) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: foto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la foto',
      error: error.message
    });
  }
};

// Crear una nueva foto (solo admins y scouters)
const createFoto = async (req, res) => {
  try {
    // Solo admins y scouters pueden subir fotos
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para subir fotos'
      });
    }

    // Validar datos de entrada
    const { error, value } = fotoSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de foto inválidos',
        error: error.details[0].message
      });
    }

    // Agregar el usuario que subió la foto
    value.subido_por = req.usuario.id;

    const newFoto = await GaleriaFotos.create(value);

    res.status(201).json({
      success: true,
      message: 'Foto subida correctamente',
      data: newFoto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al subir la foto',
      error: error.message
    });
  }
};

// Actualizar una foto (solo admins y scouters)
const updateFoto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de foto inválido'
      });
    }

    // Solo admins y scouters pueden actualizar fotos
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar fotos'
      });
    }

    // Verificar que la foto existe
    const foto = await GaleriaFotos.findById(id);
    if (!foto) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    // Validar datos de entrada
    const { error, value } = fotoUpdateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de foto inválidos',
        error: error.details[0].message
      });
    }

    const updatedFoto = await GaleriaFotos.update(id, value);

    res.status(200).json({
      success: true,
      message: 'Foto actualizada correctamente',
      data: updatedFoto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la foto',
      error: error.message
    });
  }
};

// Eliminar una foto
const deleteFoto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de foto inválido'
      });
    }

    // Verificar que la foto existe
    const foto = await GaleriaFotos.findById(id);
    if (!foto) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    // Solo el usuario que subió la foto o un admin puede eliminarla
    if (foto.subido_por !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta foto'
      });
    }

    const deleted = await GaleriaFotos.remove(id, req.usuario.id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo eliminar la foto'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Foto eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la foto',
      error: error.message
    });
  }
};

// Eliminar un álbum completo (solo admins y scouters)
const deleteAlbum = async (req, res) => {
  try {
    const { album_id } = req.params;

    if (!album_id) {
      return res.status(400).json({
        success: false,
        message: 'ID de álbum inválido'
      });
    }

    // Solo admins y scouters pueden eliminar álbumes
    if (!['admin', 'scouter'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar álbumes'
      });
    }

    const eliminadas = await GaleriaFotos.removeAlbum(album_id, req.usuario.id);

    res.status(200).json({
      success: true,
      message: `${eliminadas} fotos eliminadas del álbum`,
      eliminadas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el álbum',
      error: error.message
    });
  }
};

// Obtener fotos por evento
const getFotosByEvento = async (req, res) => {
  try {
    const eventoId = parseInt(req.params.eventoId);
    const familiarId = req.usuario.id;

    if (isNaN(eventoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de evento inválido'
      });
    }

    const fotos = await GaleriaFotos.findByEventoId(eventoId, familiarId);

    res.status(200).json({
      success: true,
      data: fotos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las fotos del evento',
      error: error.message
    });
  }
};

// Obtener etiquetas populares para un familiar
const getEtiquetasPopulares = async (req, res) => {
  try {
    const familiarId = req.usuario.id;
    const { limit = 20 } = req.query;

    const etiquetas = await GaleriaFotos.getEtiquetasPopulares(familiarId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: etiquetas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las etiquetas populares',
      error: error.message
    });
  }
};

// Servir archivo de foto
const serveArchivo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de foto inválido'
      });
    }

    const foto = await GaleriaFotos.findById(id, familiarId);

    if (!foto) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    // Verificar que el archivo existe
    const fs = require('fs');
    if (!fs.existsSync(foto.archivo_ruta)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Determinar el content type
    const mimeType = foto.tipo_archivo || 'image/jpeg';

    // Enviar el archivo
    res.setHeader('Content-Type', mimeType);
    res.sendFile(path.resolve(foto.archivo_ruta));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al servir el archivo',
      error: error.message
    });
  }
};

// Obtener miniatura (thumbnail)
const getThumbnail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const familiarId = req.usuario.id;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de foto inválido'
      });
    }

    const foto = await GaleriaFotos.findById(id, familiarId);

    if (!foto) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    // Para ahora, servir la misma foto
    // En el futuro, se puede implementar generación de thumbnails
    res.setHeader('Content-Type', foto.tipo_archivo || 'image/jpeg');
    res.sendFile(path.resolve(foto.archivo_ruta));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la miniatura',
      error: error.message
    });
  }
};

module.exports = {
  getFotosByFamiliar,
  getFotosByScout,
  getAlbumesByFamiliar,
  getFotoById,
  createFoto,
  updateFoto,
  deleteFoto,
  deleteAlbum,
  getFotosByEvento,
  getEtiquetasPopulares,
  serveArchivo,
  getThumbnail
};