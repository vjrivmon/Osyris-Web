const { query } = require('../config/db.config');

/**
 * Modelo para notificaciones dirigidas a scouters
 * Filtra por sección para que cada monitor vea solo los de sus educandos
 */

// Crear notificación para scouters de una sección específica
const crearParaSeccion = async (notificacionData) => {
  try {
    const result = await query(`
      INSERT INTO notificaciones_scouter (
        educando_id, educando_nombre, seccion_id, tipo,
        titulo, mensaje, enlace_accion, metadata, prioridad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      notificacionData.educando_id,
      notificacionData.educando_nombre,
      notificacionData.seccion_id,
      notificacionData.tipo || 'documento_pendiente',
      notificacionData.titulo,
      notificacionData.mensaje,
      notificacionData.enlace_accion || '/aula-virtual/documentos-pendientes',
      notificacionData.metadata ? JSON.stringify(notificacionData.metadata) : null,
      notificacionData.prioridad || 'alta'
    ]);

    return result[0];
  } catch (error) {
    console.error('Error creando notificación scouter:', error);
    throw error;
  }
};

// Obtener notificaciones para un scouter basado en su sección
// IMPORTANTE: Filtra automáticamente notificaciones de documentos ya aprobados
const findBySeccionId = async (seccionId, options = {}) => {
  try {
    let sql = `
      SELECT ns.*,
             e.nombre as educando_nombre_real,
             e.apellidos as educando_apellidos,
             s.nombre as seccion_nombre
      FROM notificaciones_scouter ns
      LEFT JOIN educandos e ON ns.educando_id = e.id
      LEFT JOIN secciones s ON ns.seccion_id = s.id
      LEFT JOIN documentos_familia df ON (ns.metadata->>'documento_id')::int = df.id
      WHERE ns.seccion_id = $1
        AND (
          -- Incluir si no es notificación de documento
          ns.tipo != 'documento_pendiente'
          OR ns.metadata->>'documento_id' IS NULL
          -- O si el documento todavía está pendiente
          OR (df.estado = 'pendiente_revision' OR df.estado_revision = 'pendiente')
        )
    `;
    const params = [seccionId];
    let paramIndex = 2;

    if (options.soloNoLeidas) {
      sql += ` AND ns.leida = false`;
    }

    if (options.tipo) {
      sql += ` AND ns.tipo = $${paramIndex}`;
      params.push(options.tipo);
      paramIndex++;
    }

    sql += ` ORDER BY ns.fecha_creacion DESC`;

    if (options.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(options.limit);
    }

    const result = await query(sql, params);
    return result;
  } catch (error) {
    console.error('Error obteniendo notificaciones scouter:', error);
    throw error;
  }
};

// Obtener notificaciones para un scouter (por su ID de usuario)
const findByScouterId = async (scouterId, options = {}) => {
  try {
    // Primero obtener la sección del scouter
    const scouterResult = await query(`
      SELECT seccion_id FROM usuarios WHERE id = $1 AND rol IN ('scouter', 'admin')
    `, [scouterId]);

    if (scouterResult.length === 0) {
      return [];
    }

    const seccionId = scouterResult[0].seccion_id;

    // Si es admin sin sección, mostrar todas
    if (!seccionId) {
      const adminResult = await query(`
        SELECT rol FROM usuarios WHERE id = $1
      `, [scouterId]);

      if (adminResult[0]?.rol === 'admin') {
        return await findAll(options);
      }
      return [];
    }

    return await findBySeccionId(seccionId, options);
  } catch (error) {
    console.error('Error obteniendo notificaciones por scouter:', error);
    throw error;
  }
};

// Obtener todas las notificaciones (para admins)
// IMPORTANTE: Filtra automáticamente notificaciones de documentos ya aprobados
const findAll = async (options = {}) => {
  try {
    let sql = `
      SELECT ns.*,
             e.nombre as educando_nombre_real,
             e.apellidos as educando_apellidos,
             s.nombre as seccion_nombre
      FROM notificaciones_scouter ns
      LEFT JOIN educandos e ON ns.educando_id = e.id
      LEFT JOIN secciones s ON ns.seccion_id = s.id
      LEFT JOIN documentos_familia df ON (ns.metadata->>'documento_id')::int = df.id
      WHERE (
        -- Incluir si no es notificación de documento
        ns.tipo != 'documento_pendiente'
        OR ns.metadata->>'documento_id' IS NULL
        -- O si el documento todavía está pendiente
        OR (df.estado = 'pendiente_revision' OR df.estado_revision = 'pendiente')
      )
    `;
    const params = [];
    let paramIndex = 1;

    if (options.soloNoLeidas) {
      sql += ` AND ns.leida = false`;
    }

    if (options.tipo) {
      sql += ` AND ns.tipo = $${paramIndex}`;
      params.push(options.tipo);
      paramIndex++;
    }

    sql += ` ORDER BY ns.fecha_creacion DESC`;

    if (options.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(options.limit);
    }

    const result = await query(sql, params);
    return result;
  } catch (error) {
    console.error('Error obteniendo todas las notificaciones:', error);
    throw error;
  }
};

// Marcar como leída
const marcarComoLeida = async (id) => {
  try {
    await query(`
      UPDATE notificaciones_scouter
      SET leida = true, fecha_lectura = NOW()
      WHERE id = $1
    `, [id]);

    return await findById(id);
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    throw error;
  }
};

// Obtener por ID
const findById = async (id) => {
  try {
    const result = await query(`
      SELECT ns.*,
             e.nombre as educando_nombre_real,
             e.apellidos as educando_apellidos,
             s.nombre as seccion_nombre
      FROM notificaciones_scouter ns
      LEFT JOIN educandos e ON ns.educando_id = e.id
      LEFT JOIN secciones s ON ns.seccion_id = s.id
      WHERE ns.id = $1
    `, [id]);

    return result.length ? result[0] : null;
  } catch (error) {
    console.error('Error obteniendo notificación:', error);
    throw error;
  }
};

// Contar no leídas por sección
// IMPORTANTE: Filtra automáticamente notificaciones de documentos ya aprobados
const contarNoLeidasPorSeccion = async (seccionId) => {
  try {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM notificaciones_scouter ns
      LEFT JOIN documentos_familia df ON (ns.metadata->>'documento_id')::int = df.id
      WHERE ns.seccion_id = $1
        AND ns.leida = false
        AND (
          -- Incluir si no es notificación de documento
          ns.tipo != 'documento_pendiente'
          OR ns.metadata->>'documento_id' IS NULL
          -- O si el documento todavía está pendiente
          OR (df.estado = 'pendiente_revision' OR df.estado_revision = 'pendiente')
        )
    `, [seccionId]);

    return parseInt(result[0].count);
  } catch (error) {
    console.error('Error contando notificaciones:', error);
    throw error;
  }
};

// Eliminar notificación
const remove = async (id) => {
  try {
    await query(`DELETE FROM notificaciones_scouter WHERE id = $1`, [id]);
    return true;
  } catch (error) {
    console.error('Error eliminando notificación:', error);
    throw error;
  }
};

// Eliminar notificaciones asociadas a un documento
const removeByDocumentoId = async (documentoId) => {
  try {
    await query(`
      DELETE FROM notificaciones_scouter
      WHERE metadata->>'documento_id' = $1
    `, [documentoId.toString()]);
    return true;
  } catch (error) {
    console.error('Error eliminando notificaciones de documento:', error);
    throw error;
  }
};

// Eliminar todas las notificaciones de una sección
const removeAllBySeccionId = async (seccionId) => {
  try {
    const result = await query(`
      DELETE FROM notificaciones_scouter
      WHERE seccion_id = $1
      RETURNING id
    `, [seccionId]);
    return result.length;
  } catch (error) {
    console.error('Error eliminando todas las notificaciones:', error);
    throw error;
  }
};

// Eliminar todas las notificaciones (para admins)
const removeAll = async () => {
  try {
    const result = await query(`
      DELETE FROM notificaciones_scouter
      RETURNING id
    `);
    return result.length;
  } catch (error) {
    console.error('Error eliminando todas las notificaciones:', error);
    throw error;
  }
};

module.exports = {
  crearParaSeccion,
  findBySeccionId,
  findByScouterId,
  findAll,
  findById,
  marcarComoLeida,
  contarNoLeidasPorSeccion,
  remove,
  removeByDocumentoId,
  removeAllBySeccionId,
  removeAll
};
