const db = require('../config/db.config');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

/**
 * 🏠 CONTROLADOR DE UPLOADS LOCALES - SISTEMA CMS OSYRIS
 * Gestión de archivos con sistema de archivos local
 */

// Configuración de Multer para guardar archivos en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const uploadPath = path.join(__dirname, '../../../uploads', folder);

    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
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

// 📤 Subir archivo al sistema local
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo'
      });
    }

    const { folder = 'general', altText = '', titulo = '' } = req.body;
    const file = req.file;

    // Usar el título proporcionado o el nombre original del archivo
    const finalTitle = titulo.trim() || file.originalname;

    // Crear URL pública del archivo
    const fileUrl = `/uploads/${folder}/${file.filename}`;

    // Guardar información del archivo en la base de datos
    try {
      const result = await db.query(`
        INSERT INTO documentos (
          titulo, descripcion, archivo_nombre, archivo_ruta,
          tipo_archivo, tamaño_archivo, subido_por, visible_para
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        finalTitle,
        altText,
        file.filename,
        fileUrl,
        file.mimetype,
        file.size,
        req.usuario?.id || 1, // ID del usuario admin por defecto
        'todos'
      ]);

      return res.status(201).json({
        success: true,
        message: 'Archivo subido correctamente',
        data: {
          id: result.insertId,
          filename: file.filename,
          originalName: file.originalname,
          titulo: finalTitle,
          url: fileUrl,
          type: file.mimetype,
          size: file.size,
          folder: folder,
          altText: altText,
          descripcion: altText,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (dbError) {
      // Si falla la BD, eliminar el archivo subido
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo:', unlinkError);
      }

      throw dbError;
    }
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al subir archivo',
      error: error.message
    });
  }
};

// 📋 Obtener lista de archivos
const getFiles = async (req, res) => {
  try {
    const { folder, type, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT * FROM documentos WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (folder) {
      sql += ` AND archivo_ruta LIKE $${paramIndex}`;
      params.push(`%/${folder}/%`);
      paramIndex++;
    }

    if (type) {
      sql += ` AND tipo_archivo LIKE $${paramIndex}`;
      params.push(`${type}%`);
      paramIndex++;
    }

    sql += ` ORDER BY fecha_subida DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const files = await db.query(sql, params);

    // Asegurar URLs completas para cada archivo
    const filesWithUrls = files.map(file => ({
      ...file,
      url: file.archivo_ruta?.startsWith('http')
        ? file.archivo_ruta
        : `http://localhost:5000${file.archivo_ruta}`
    }));

    return res.json({
      success: true,
      data: filesWithUrls,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: files.length
      }
    });
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener archivos'
    });
  }
};

// 🗑️ Eliminar archivo
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información del archivo
    const files = await db.query('SELECT * FROM documentos WHERE id = ?', [id]);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    const file = files[0];

    // Eliminar archivo físico
    const filePath = path.join(__dirname, '../../../', file.archivo_ruta);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar registro de la base de datos
    await db.query('DELETE FROM documentos WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar archivo'
    });
  }
};

// 📁 Obtener carpetas disponibles
const getFolders = async (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, '../../../uploads');
    const folders = fs.readdirSync(uploadsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return res.json({
      success: true,
      data: folders
    });
  } catch (error) {
    console.error('Error al obtener carpetas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener carpetas'
    });
  }
};

// 📊 Obtener estadísticas de archivos
const getFileStats = async (req, res) => {
  try {
    const totalFiles = await db.query('SELECT COUNT(*) as count FROM documentos');
    const totalSize = await db.query('SELECT SUM(tamaño_archivo) as size FROM documentos');

    const byType = await db.query(`
      SELECT
        CASE
          WHEN tipo_archivo LIKE 'image%' THEN 'images'
          WHEN tipo_archivo LIKE 'application/pdf%' THEN 'documents'
          ELSE 'others'
        END as type,
        COUNT(*) as count
      FROM documentos
      GROUP BY type
    `);

    return res.json({
      success: true,
      data: {
        total: totalFiles[0]?.count || 0,
        totalSize: totalSize[0]?.size || 0,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item.count;
          return acc;
        }, {})
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