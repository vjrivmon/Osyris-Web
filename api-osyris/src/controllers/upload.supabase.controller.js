const { supabase } = require('../config/supabase.config');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * ☁️ CONTROLADOR DE UPLOADS SUPABASE - SISTEMA CMS OSYRIS
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

    console.log(`📤 Subiendo archivo a Supabase: ${fileName}`);

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('osyris-files')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Error al subir archivo:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Error al subir archivo a Supabase',
        error: uploadError.message
      });
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
        uploaded_by: req.user?.id || null,
        file_type: file.mimetype,
        file_size: file.size,
        alt_text: altText,
        folder: folder
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Error al guardar en BD:', dbError);

      // Si falla la BD, intentar eliminar el archivo de Storage
      try {
        await supabase.storage
          .from('osyris-files')
          .remove([fileName]);
      } catch (cleanupError) {
        console.error('Error en cleanup:', cleanupError);
      }

      return res.status(500).json({
        success: false,
        message: 'Error al guardar información del archivo',
        error: dbError.message
      });
    }

    console.log('✅ Archivo subido correctamente:', fileName);

    return res.status(201).json({
      success: true,
      message: 'Archivo subido correctamente',
      data: {
        id: fileRecord.id,
        filename: fileName,
        originalName: file.originalname,
        url: fileUrl,
        type: file.mimetype,
        size: file.size,
        folder: folder,
        altText: altText,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error general en upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// 📋 Obtener lista de archivos
const getFiles = async (req, res) => {
  try {
    const { folder, type, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('uploaded_files')
      .select('*');

    if (folder) {
      query = query.eq('folder', folder);
    }

    if (type) {
      query = query.like('file_type', `${type}%`);
    }

    // Ejecutar consulta con orden por ID (más robusto)
    const { data: files, error } = await query
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      // Si hay error por columna faltante, devolver array vacío
      if (error.message && error.message.includes('does not exist')) {
        console.warn('⚠️ Tabla uploaded_files no existe o columnas faltantes');
        return res.json({
          success: true,
          data: [],
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: 0
          }
        });
      }

      console.error('Error al obtener archivos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener archivos'
      });
    }

    return res.json({
      success: true,
      data: files,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: files.length
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// 🗑️ Eliminar archivo
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información del archivo
    const { data: file, error: fetchError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Eliminar archivo de Storage
    const { error: storageError } = await supabase.storage
      .from('osyris-files')
      .remove([file.file_path]);

    if (storageError) {
      console.error('Error al eliminar de Storage:', storageError);
    }

    // Eliminar registro de la base de datos
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error al eliminar de BD:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar archivo'
      });
    }

    return res.json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// 📁 Obtener carpetas disponibles
const getFolders = async (req, res) => {
  try {
    const { data: folders, error } = await supabase
      .from('uploaded_files')
      .select('folder')
      .neq('folder', null);

    if (error) {
      console.error('Error al obtener carpetas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener carpetas'
      });
    }

    // Obtener carpetas únicas
    const uniqueFolders = [...new Set(folders.map(f => f.folder))];

    return res.json({
      success: true,
      data: uniqueFolders
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// 📊 Obtener estadísticas de archivos
const getFileStats = async (req, res) => {
  try {
    // Total de archivos
    const { count: totalFiles, error: countError } = await supabase
      .from('uploaded_files')
      .select('*', { count: 'exact', head: true });

    // Tamaño total
    const { data: sizeData, error: sizeError } = await supabase
      .from('uploaded_files')
      .select('file_size');

    const totalSize = sizeData?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;

    // Por tipo
    const { data: typeData, error: typeError } = await supabase
      .from('uploaded_files')
      .select('file_type');

    const byType = typeData?.reduce((acc, file) => {
      const type = file.file_type?.startsWith('image/') ? 'images' :
                   file.file_type === 'application/pdf' ? 'documents' : 'others';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    return res.json({
      success: true,
      data: {
        total: totalFiles || 0,
        totalSize: totalSize,
        byType: byType
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

module.exports = {
  upload,
  uploadFile,
  getFiles,
  deleteFile,
  getFolders,
  getFileStats
};