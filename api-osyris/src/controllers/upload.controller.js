const { supabase } = require('../config/supabase.config');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * 🏕️ CONTROLADOR DE UPLOADS - SISTEMA CMS OSYRIS
 * Gestión de archivos con Supabase Storage
 */

// Configuración de Multer para memoria (no guardamos en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// 📤 Subir archivo a Supabase Storage
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo'
      });
    }

    const { folder = 'general', altText = '' } = req.body;
    const file = req.file;

    // Generar nombre único para el archivo
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;

    console.log(`📤 Subiendo archivo: ${fileName}`);

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('osyris-files')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Error al subir archivo:', uploadError);
      throw uploadError;
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('osyris-files')
      .getPublicUrl(fileName);

    const fileUrl = urlData.publicUrl;

    // Guardar información del archivo en la base de datos
    const { data: fileRecord, error: dbError } = await supabase
      .from('uploaded_files')
      .insert({
        filename: fileName,
        original_name: file.originalname,
        file_path: fileName,
        file_url: fileUrl,
        uploaded_by: req.usuario?.id,
        file_type: file.mimetype,
        file_size: file.size,
        alt_text: altText,
        folder: folder
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Error al guardar en BD:', dbError);
      // Intentar eliminar el archivo subido si falló la BD
      await supabase.storage
        .from('osyris-files')
        .remove([fileName]);

      throw dbError;
    }

    console.log(`✅ Archivo subido exitosamente: ${fileUrl}`);

    res.status(201).json({
      success: true,
      message: 'Archivo subido exitosamente',
      data: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalName: fileRecord.original_name,
        url: fileRecord.file_url,
        type: fileRecord.file_type,
        size: fileRecord.file_size,
        folder: fileRecord.folder,
        altText: fileRecord.alt_text,
        uploadedAt: fileRecord.uploaded_at
      }
    });

  } catch (error) {
    console.error('❌ Error en upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir el archivo',
      error: error.message
    });
  }
};

// 📋 Listar archivos
const getFiles = async (req, res) => {
  try {
    const { folder, type, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('uploaded_files')
      .select(`
        id, filename, original_name, file_url, file_type,
        file_size, folder, alt_text, uploaded_at,
        uploaded_by_user:usuarios(nombre, apellidos)
      `)
      .order('uploaded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtros opcionales
    if (folder) {
      query = query.eq('folder', folder);
    }

    if (type) {
      query = query.like('file_type', `${type}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: data.length
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de archivos',
      error: error.message
    });
  }
};

// 🗑️ Eliminar archivo
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información del archivo
    const { data: fileData, error: fetchError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !fileData) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Eliminar archivo de Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('osyris-files')
      .remove([fileData.file_path]);

    if (storageError) {
      console.error('⚠️ Error al eliminar de storage:', storageError);
      // Continuar aunque falle el storage
    }

    // Eliminar registro de la base de datos
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    console.log(`🗑️ Archivo eliminado: ${fileData.filename}`);

    res.status(200).json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el archivo',
      error: error.message
    });
  }
};

// 📁 Obtener carpetas disponibles
const getFolders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('folder')
      .not('folder', 'is', null);

    if (error) throw error;

    // Obtener carpetas únicas
    const folders = [...new Set(data.map(item => item.folder))];

    res.status(200).json({
      success: true,
      data: folders
    });

  } catch (error) {
    console.error('❌ Error al obtener carpetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las carpetas',
      error: error.message
    });
  }
};

// 📊 Estadísticas de archivos
const getFileStats = async (req, res) => {
  try {
    // Contar archivos por tipo
    const { data: typeStats, error: typeError } = await supabase
      .from('uploaded_files')
      .select('file_type');

    if (typeError) throw typeError;

    // Procesar estadísticas
    const stats = {
      total: typeStats.length,
      byType: {},
      byFolder: {},
      totalSize: 0
    };

    // Obtener estadísticas más detalladas
    const { data: detailedStats, error: detailedError } = await supabase
      .from('uploaded_files')
      .select('file_type, folder, file_size');

    if (detailedError) throw detailedError;

    detailedStats.forEach(file => {
      // Por tipo
      const mainType = file.file_type?.split('/')[0] || 'unknown';
      stats.byType[mainType] = (stats.byType[mainType] || 0) + 1;

      // Por carpeta
      const folder = file.folder || 'general';
      stats.byFolder[folder] = (stats.byFolder[folder] || 0) + 1;

      // Tamaño total
      stats.totalSize += file.file_size || 0;
    });

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de archivos',
      error: error.message
    });
  }
};

module.exports = {
  upload, // Middleware de multer
  uploadFile,
  getFiles,
  deleteFile,
  getFolders,
  getFileStats
};