const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     DocumentoFamilia:
 *       type: object
 *       required:
 *         - scout_id
 *         - familiar_id
 *         - tipo_documento
 *         - titulo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del documento
 *         scout_id:
 *           type: integer
 *           description: ID del scout relacionado
 *         familiar_id:
 *           type: integer
 *           description: ID del familiar que subió el documento
 *         tipo_documento:
 *           type: string
 *           description: Tipo de documento (autorización, informe médico, etc.)
 *         titulo:
 *           type: string
 *           description: Título del documento
 *         descripcion:
 *           type: string
 *           description: Descripción del documento
 *         archivo_nombre:
 *           type: string
 *           description: Nombre original del archivo
 *         archivo_ruta:
 *           type: string
 *           description: Ruta del archivo en el servidor
 *         tipo_archivo:
 *           type: string
 *           description: MIME type del archivo
 *         tamaño_archivo:
 *           type: integer
 *           description: Tamaño del archivo en bytes
 *         fecha_vencimiento:
 *           type: string
 *           format: date
 *           description: Fecha de vencimiento del documento
 *         estado:
 *           type: string
 *           enum: [vigente, por_vencer, vencido, pendiente]
 *           description: Estado del documento
 *         fecha_subida:
 *           type: string
 *           format: date-time
 *           description: Fecha de subida del documento
 *         aprobado:
 *           type: boolean
 *           description: Indica si el documento está aprobado
 *         aprobado_por:
 *           type: integer
 *           description: ID del usuario que aprobó el documento
 *       example:
 *         scout_id: 5
 *         familiar_id: 1
 *         tipo_documento: autorizacion_salida
 *         titulo: Autorización para campamento de verano
 *         descripcion: Autorización firmada para participar en el campamento
 *         estado: vigente
 *         aprobado: true
 */

// Función para obtener todos los documentos de un scout
const findByScoutId = async (scoutId, familiarId = null) => {
  try {
    let query_str = `
      SELECT df.*,
             u.nombre as familiar_nombre, u.apellidos as familiar_apellidos,
             ua.nombre as aprobador_nombre, ua.apellidos as aprobador_apellidos
      FROM documentos_familia df
      JOIN usuarios u ON df.familiar_id = u.id
      LEFT JOIN usuarios ua ON df.aprobado_por = ua.id
      WHERE df.scout_id = ?
    `;
    const queryParams = [scoutId];

    // Si se proporciona familiar_id, verificar que tenga acceso
    if (familiarId) {
      query_str += ` AND (
        df.familiar_id = ? OR
        df.visible_para_familiares = true OR
        EXISTS (
          SELECT 1 FROM familiares_scouts fs
          WHERE fs.familiar_id = ? AND fs.scout_id = ?
        )
      )`;
      queryParams.push(familiarId, familiarId, scoutId);
    }

    query_str += ' ORDER BY df.fecha_subida DESC';

    const documentos = await query(query_str, queryParams);
    return documentos;
  } catch (error) {
    throw error;
  }
};

// Función para obtener todos los documentos subidos por un familiar
const findByFamiliarId = async (familiarId) => {
  try {
    const documentos = await query(`
      SELECT df.*,
             u.nombre as scout_nombre, u.apellidos as scout_apellidos,
             s.nombre as seccion_nombre,
             ua.nombre as aprobador_nombre, ua.apellidos as aprobador_apellidos
      FROM documentos_familia df
      JOIN usuarios u ON df.scout_id = u.id
      LEFT JOIN secciones s ON u.seccion_id = s.id
      LEFT JOIN usuarios ua ON df.aprobado_por = ua.id
      WHERE df.familiar_id = ?
      ORDER BY df.fecha_subida DESC
    `, [familiarId]);
    return documentos;
  } catch (error) {
    throw error;
  }
};

// Función para obtener documentos por estado
const findByEstado = async (estado, familiarId = null) => {
  try {
    let query_str = `
      SELECT df.*,
             e.nombre as scout_nombre, e.apellidos as scout_apellidos,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             s.nombre as seccion_nombre, s.id as seccion_id
      FROM documentos_familia df
      LEFT JOIN educandos e ON df.educando_id = e.id
      LEFT JOIN usuarios uf ON df.familiar_id = uf.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE df.estado = $1
    `;
    const queryParams = [estado];

    if (familiarId) {
      query_str += ' AND df.familiar_id = $2';
      queryParams.push(familiarId);
    }

    query_str += ' ORDER BY df.fecha_vencimiento ASC, df.fecha_subida DESC';

    const documentos = await query(query_str, queryParams);
    return documentos;
  } catch (error) {
    throw error;
  }
};

// Función para obtener documentos por vencer
const getDocumentosPorVencer = async (dias = 30, familiarId = null) => {
  try {
    let query_str = `
      SELECT df.*,
             u.nombre as scout_nombre, u.apellidos as scout_apellidos,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             s.nombre as seccion_nombre
      FROM documentos_familia df
      JOIN usuarios u ON df.scout_id = u.id
      JOIN usuarios uf ON df.familiar_id = uf.id
      LEFT JOIN secciones s ON u.seccion_id = s.id
      WHERE df.fecha_vencimiento IS NOT NULL
      AND df.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '? days'
      AND df.estado IN ('vigente', 'por_vencer')
    `;
    const queryParams = [dias];

    if (familiarId) {
      query_str += ' AND df.familiar_id = ?';
      queryParams.push(familiarId);
    }

    query_str += ' ORDER BY df.fecha_vencimiento ASC';

    const documentos = await query(query_str, queryParams);
    return documentos;
  } catch (error) {
    throw error;
  }
};

// Función para obtener un documento por ID
const findById = async (id, familiarId = null) => {
  try {
    let query_str = `
      SELECT df.*,
             e.nombre as scout_nombre, e.apellidos as scout_apellidos,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             s.nombre as seccion_nombre,
             ua.nombre as aprobador_nombre, ua.apellidos as aprobador_apellidos
      FROM documentos_familia df
      LEFT JOIN educandos e ON df.educando_id = e.id
      LEFT JOIN usuarios uf ON df.familiar_id = uf.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      LEFT JOIN usuarios ua ON df.aprobado_por = ua.id
      WHERE df.id = $1
    `;
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND df.familiar_id = $2';
      queryParams.push(familiarId);
    }

    const documentos = await query(query_str, queryParams);
    return documentos.length ? documentos[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para crear un nuevo documento
const create = async (documentoData) => {
  try {
    const result = await query(`
      INSERT INTO documentos_familia (
        educando_id, familiar_id, tipo_documento, titulo, descripcion,
        archivo_nombre, archivo_ruta, tipo_archivo, tamaño_archivo,
        fecha_vencimiento, estado, google_drive_file_id, google_drive_folder_id,
        estado_revision
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `, [
      documentoData.educando_id,  // ✅ Solo una nomenclatura consistente
      documentoData.familiar_id,
      documentoData.tipo_documento,
      documentoData.titulo,
      documentoData.descripcion || null,
      documentoData.archivo_nombre || null,
      documentoData.archivo_ruta || null,
      documentoData.tipo_archivo || null,
      documentoData.tamaño_archivo || null,
      documentoData.fecha_vencimiento || null,
      documentoData.estado || 'vigente',
      documentoData.google_drive_file_id || null,
      documentoData.google_drive_folder_id || null,
      documentoData.estado_revision || 'pendiente'
    ]);

    // result puede ser un objeto { insertId } o un array según db.config.js
    const newId = result.insertId || (Array.isArray(result) ? result[0]?.id : null);
    if (!newId) {
      throw new Error('No se pudo obtener el ID del documento insertado');
    }
    const newDocumento = await findById(newId);
    return newDocumento;
  } catch (error) {
    throw error;
  }
};

// Función para actualizar un documento
const update = async (id, documentoData, userId = null) => {
  try {
    let query_str = 'UPDATE documentos_familia SET ';
    const queryParams = [];

    if (documentoData.titulo) {
      query_str += 'titulo = ?, ';
      queryParams.push(documentoData.titulo);
    }

    if (documentoData.descripcion !== undefined) {
      query_str += 'descripcion = ?, ';
      queryParams.push(documentoData.descripcion);
    }

    if (documentoData.tipo_documento) {
      query_str += 'tipo_documento = ?, ';
      queryParams.push(documentoData.tipo_documento);
    }

    if (documentoData.fecha_vencimiento) {
      query_str += 'fecha_vencimiento = ?, ';
      queryParams.push(documentoData.fecha_vencimiento);
    }

    if (documentoData.estado) {
      query_str += 'estado = ?, ';
      queryParams.push(documentoData.estado);
    }

    if (documentoData.aprobado !== undefined) {
      query_str += 'aprobado = ?, ';
      queryParams.push(documentoData.aprobado);
    }

    if (documentoData.aprobado !== undefined && documentoData.aprobado === true && userId) {
      query_str += 'aprobado_por = ?, ';
      queryParams.push(userId);
    }

    // Soporte para campos de Google Drive
    if (documentoData.archivo_ruta) {
      query_str += 'archivo_ruta = ?, ';
      queryParams.push(documentoData.archivo_ruta);
    }

    if (documentoData.google_drive_file_id) {
      query_str += 'google_drive_file_id = ?, ';
      queryParams.push(documentoData.google_drive_file_id);
    }

    if (documentoData.google_drive_folder_id) {
      query_str += 'google_drive_folder_id = ?, ';
      queryParams.push(documentoData.google_drive_folder_id);
    }

    if (documentoData.estado_revision) {
      query_str += 'estado_revision = ?, ';
      queryParams.push(documentoData.estado_revision);
    }

    if (queryParams.length === 0) {
      return await findById(id);
    }

    query_str = query_str.slice(0, -2);
    query_str += ' WHERE id = ?';
    queryParams.push(id);

    await query(query_str, queryParams);
    return await findById(id);
  } catch (error) {
    throw error;
  }
};

// Función para eliminar un documento
const remove = async (id, familiarId = null) => {
  try {
    let query_str = 'DELETE FROM documentos_familia WHERE id = ?';
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND familiar_id = ?';
      queryParams.push(familiarId);
    }

    const result = await query(query_str, queryParams);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Función para aprobar un documento
const aprobar = async (id, aprobadoPorId) => {
  try {
    await query(`
      UPDATE documentos_familia
      SET aprobado = true, aprobado_por = $1, estado = 'vigente', estado_revision = 'aprobado'
      WHERE id = $2
    `, [aprobadoPorId, id]);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

// Función para rechazar un documento
const rechazar = async (id, aprobadoPorId, motivo = null) => {
  try {
    await query(`
      UPDATE documentos_familia
      SET aprobado = false, aprobado_por = $1, estado = 'rechazado',
          estado_revision = 'rechazado', motivo_rechazo = $2
      WHERE id = $3
    `, [aprobadoPorId, motivo, id]);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

// Función para actualizar estados de documentos vencidos
const actualizarEstadosVencidos = async () => {
  try {
    await query(`
      UPDATE documentos_familia
      SET estado = 'vencido'
      WHERE fecha_vencimiento < CURRENT_DATE
      AND estado IN ('vigente', 'por_vencer')
    `);

    await query(`
      UPDATE documentos_familia
      SET estado = 'por_vencer'
      WHERE fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      AND estado = 'vigente'
    `);

    return true;
  } catch (error) {
    throw error;
  }
};

// Función para buscar documento existente por educando y tipo
const findByEducandoAndTipo = async (educandoId, tipoDocumento) => {
  try {
    const documentos = await query(`
      SELECT df.*
      FROM documentos_familia df
      WHERE df.educando_id = $1 AND df.tipo_documento = $2
      ORDER BY df.fecha_subida DESC
      LIMIT 1
    `, [educandoId, tipoDocumento]);
    return documentos.length ? documentos[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para actualizar documento existente (resubida)
const updateForReupload = async (id, documentoData) => {
  try {
    await query(`
      UPDATE documentos_familia
      SET archivo_nombre = $1,
          archivo_ruta = $2,
          tipo_archivo = $3,
          tamaño_archivo = $4,
          google_drive_file_id = $5,
          fecha_subida = NOW(),
          estado = 'pendiente_revision',
          estado_revision = 'pendiente',
          aprobado = false,
          aprobado_por = NULL,
          motivo_rechazo = NULL
      WHERE id = $6
    `, [
      documentoData.archivo_nombre,
      documentoData.archivo_ruta,
      documentoData.tipo_archivo,
      documentoData.tamaño_archivo,
      documentoData.google_drive_file_id,
      id
    ]);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

// Función para obtener documentos por estado de revisión
const findByEstadoRevision = async (estadoRevision) => {
  try {
    const documentos = await query(`
      SELECT df.*,
             e.nombre as scout_nombre, e.apellidos as scout_apellidos,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             s.nombre as seccion_nombre, s.id as seccion_id
      FROM documentos_familia df
      LEFT JOIN educandos e ON df.educando_id = e.id
      LEFT JOIN usuarios uf ON df.familiar_id = uf.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE df.estado_revision = $1
      ORDER BY df.fecha_subida DESC
    `, [estadoRevision]);
    return documentos;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findByScoutId,
  findByFamiliarId,
  findByEstado,
  findByEstadoRevision,
  findByEducandoAndTipo,
  getDocumentosPorVencer,
  findById,
  create,
  update,
  updateForReupload,
  remove,
  aprobar,
  rechazar,
  actualizarEstadosVencidos
};