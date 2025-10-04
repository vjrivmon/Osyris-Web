/**
 * Content Editor Controller
 * Gestión de contenido editable del sitio web
 */

const db = require('../config/db.config');
// Usar pool para las queries directas
const pool = db;

/**
 * GET /api/content/page/:seccion
 * Obtiene todo el contenido de una página/sección
 */
exports.getPageContent = async (req, res) => {
  const { seccion } = req.params;

  try {
    const rows = await pool.query(
      `SELECT
        id,
        seccion,
        identificador,
        tipo,
        contenido_texto,
        contenido_html,
        contenido_json,
        url_archivo,
        metadata,
        version,
        fecha_modificacion
      FROM contenido_editable
      WHERE seccion = $1 AND activo = true
      ORDER BY identificador`,
      [seccion]
    );

    // Organizar contenido en un objeto más fácil de consumir
    const content = {};

    if (rows && Array.isArray(rows)) {
      rows.forEach(row => {
        content[row.identificador] = {
          id: row.id,
          tipo: row.tipo,
          contenido: row.contenido_texto || row.contenido_html || row.contenido_json || row.url_archivo,
          metadata: row.metadata,
          version: row.version,
          lastModified: row.fecha_modificacion
        };
      });
    }

    res.json({
      success: true,
      seccion,
      content,
      total: rows ? rows.length : 0
    });

  } catch (error) {
    console.error('Error al obtener contenido de página:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contenido de la página',
      error: error.message
    });
  }
};

/**
 * GET /api/content/:id
 * Obtiene un contenido específico por ID
 */
exports.getContentById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM v_contenido_con_editor WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contenido no encontrado'
      });
    }

    res.json({
      success: true,
      content: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contenido',
      error: error.message
    });
  }
};

/**
 * PUT /api/content/:id
 * Actualiza contenido específico
 */
exports.updateContent = async (req, res) => {
  const { id } = req.params;
  const { tipo, contenido, metadata, comentario } = req.body;
  const userId = req.usuario?.id; // Del middleware de autenticación

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  try {
    // Determinar qué campo actualizar según el tipo
    let updateField, updateValue;

    switch (tipo) {
      case 'texto':
        updateField = 'contenido_texto';
        updateValue = contenido;
        break;
      case 'html':
        updateField = 'contenido_html';
        updateValue = contenido;
        break;
      case 'imagen':
        updateField = 'url_archivo';
        updateValue = contenido;
        break;
      case 'lista':
      case 'json':
        updateField = 'contenido_json';
        updateValue = contenido;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de contenido no válido'
        });
    }

    // Actualizar contenido (el trigger creará el snapshot automáticamente)
    const result = await pool.query(
      `UPDATE contenido_editable
       SET ${updateField} = $1,
           metadata = $2,
           modificado_por = $3
       WHERE id = $4
       RETURNING *`,
      [updateValue, metadata || {}, userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contenido no encontrado'
      });
    }

    // Registrar en audit log
    await pool.query(
      `INSERT INTO audit_log (usuario_id, accion, entidad_tipo, entidad_id, datos_nuevos, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        'editar_contenido',
        'contenido',
        id,
        { contenido: updateValue, metadata },
        req.ip,
        req.get('user-agent')
      ]
    );

    res.json({
      success: true,
      message: 'Contenido actualizado correctamente',
      content: result.rows[0],
      newVersion: result.rows[0].version
    });

  } catch (error) {
    console.error('Error al actualizar contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contenido',
      error: error.message
    });
  }
};

/**
 * POST /api/content
 * Crea nuevo contenido editable
 */
exports.createContent = async (req, res) => {
  const { seccion, identificador, tipo, contenido, metadata } = req.body;
  const userId = req.usuario?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  try {
    // Determinar qué campo usar según el tipo
    let fields, values;

    switch (tipo) {
      case 'texto':
        fields = 'contenido_texto';
        values = contenido;
        break;
      case 'html':
        fields = 'contenido_html';
        values = contenido;
        break;
      case 'imagen':
        fields = 'url_archivo';
        values = contenido;
        break;
      case 'lista':
      case 'json':
        fields = 'contenido_json';
        values = contenido;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de contenido no válido'
        });
    }

    const result = await pool.query(
      `INSERT INTO contenido_editable (seccion, identificador, tipo, ${fields}, metadata, creado_por, modificado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $6)
       RETURNING *`,
      [seccion, identificador, tipo, values, metadata || {}, userId]
    );

    // Registrar en audit log
    await pool.query(
      `INSERT INTO audit_log (usuario_id, accion, entidad_tipo, entidad_id, datos_nuevos)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'crear_contenido', 'contenido', result.rows[0].id, { seccion, identificador, tipo, contenido }]
    );

    res.status(201).json({
      success: true,
      message: 'Contenido creado correctamente',
      content: result.rows[0]
    });

  } catch (error) {
    // Error de unicidad (seccion + identificador ya existe)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe contenido con ese identificador en esta sección'
      });
    }

    console.error('Error al crear contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear contenido',
      error: error.message
    });
  }
};

/**
 * POST /api/content/upload
 * Sube una imagen y retorna la URL
 */
exports.uploadImage = async (req, res) => {
  const userId = req.usuario?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (!req.files || !req.files.image) {
    return res.status(400).json({
      success: false,
      message: 'No se proporcionó ninguna imagen'
    });
  }

  try {
    const image = req.files.image;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(image.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP, SVG'
      });
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB'
      });
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = image.name.split('.').pop();
    const filename = `content-${timestamp}-${randomStr}.${extension}`;

    // Directorio de uploads
    const uploadDir = process.env.UPLOAD_DIR || 'uploads/content';
    const fs = require('fs');
    const path = require('path');

    // Crear directorio si no existe
    const fullPath = path.join(__dirname, '../../', uploadDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    // Guardar archivo
    const filePath = path.join(fullPath, filename);
    await image.mv(filePath);

    // URL pública
    const fileUrl = `/${uploadDir}/${filename}`;

    // Registrar en audit log
    await pool.query(
      `INSERT INTO audit_log (usuario_id, accion, entidad_tipo, datos_nuevos)
       VALUES ($1, $2, $3, $4)`,
      [
        userId,
        'subir_imagen',
        'imagen',
        { filename, url: fileUrl, size: image.size, mimetype: image.mimetype }
      ]
    );

    res.json({
      success: true,
      message: 'Imagen subida correctamente',
      url: fileUrl,
      filename,
      size: image.size,
      mimetype: image.mimetype
    });

  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen',
      error: error.message
    });
  }
};

/**
 * GET /api/content/history/:id
 * Obtiene el historial de versiones de un contenido
 */
exports.getContentHistory = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT
        h.id,
        h.version,
        h.contenido_anterior,
        h.accion,
        h.comentario,
        h.fecha_cambio,
        u.nombre || ' ' || u.apellidos AS usuario,
        u.email
      FROM contenido_historial h
      LEFT JOIN usuarios u ON h.usuario_id = u.id
      WHERE h.contenido_id = $1
      ORDER BY h.fecha_cambio DESC
      LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    // Contar total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM contenido_historial WHERE contenido_id = $1`,
      [id]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      versions: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + result.rows.length < total
      }
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
};

/**
 * POST /api/content/restore/:id/:version
 * Restaura una versión anterior del contenido
 */
exports.restoreVersion = async (req, res) => {
  const { id, version } = req.params;
  const userId = req.usuario?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  try {
    // Obtener la versión del historial
    const historyResult = await pool.query(
      `SELECT contenido_anterior FROM contenido_historial
       WHERE contenido_id = $1 AND version = $2`,
      [id, version]
    );

    if (historyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Versión no encontrada en el historial'
      });
    }

    const previousContent = historyResult.rows[0].contenido_anterior;

    // Restaurar contenido
    const result = await pool.query(
      `UPDATE contenido_editable
       SET contenido_texto = $1,
           contenido_html = $2,
           contenido_json = $3,
           url_archivo = $4,
           metadata = $5,
           modificado_por = $6
       WHERE id = $7
       RETURNING *`,
      [
        previousContent.contenido_texto,
        previousContent.contenido_html,
        previousContent.contenido_json,
        previousContent.url_archivo,
        previousContent.metadata,
        userId,
        id
      ]
    );

    // Registrar en audit log
    await pool.query(
      `INSERT INTO audit_log (usuario_id, accion, entidad_tipo, entidad_id, datos_nuevos)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'restaurar_version', 'contenido', id, { version, previousContent }]
    );

    res.json({
      success: true,
      message: `Contenido restaurado a la versión ${version}`,
      content: result.rows[0]
    });

  } catch (error) {
    console.error('Error al restaurar versión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restaurar versión',
      error: error.message
    });
  }
};

/**
 * DELETE /api/content/:id
 * Elimina (desactiva) contenido
 */
exports.deleteContent = async (req, res) => {
  const { id } = req.params;
  const userId = req.usuario?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  try {
    // Soft delete (marcar como inactivo)
    const result = await pool.query(
      `UPDATE contenido_editable
       SET activo = false, modificado_por = $1
       WHERE id = $2
       RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contenido no encontrado'
      });
    }

    // Registrar en audit log
    await pool.query(
      `INSERT INTO audit_log (usuario_id, accion, entidad_tipo, entidad_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'eliminar_contenido', 'contenido', id]
    );

    res.json({
      success: true,
      message: 'Contenido eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar contenido',
      error: error.message
    });
  }
};
