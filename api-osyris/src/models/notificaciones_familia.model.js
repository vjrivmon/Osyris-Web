const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificacionFamilia:
 *       type: object
 *       required:
 *         - familiar_id
 *         - scout_id
 *         - titulo
 *         - mensaje
 *         - tipo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la notificación
 *         familiar_id:
 *           type: integer
 *           description: ID del familiar destinatario
 *         scout_id:
 *           type: integer
 *           description: ID del scout relacionado
 *         titulo:
 *           type: string
 *           description: Título de la notificación
 *         mensaje:
 *           type: string
 *           description: Contenido del mensaje
 *         tipo:
 *           type: string
 *           enum: [urgente, importante, informativo, recordatorio]
 *           description: Tipo de notificación
 *         prioridad:
 *           type: string
 *           enum: [alta, normal, baja]
 *           description: Nivel de prioridad
 *         categoria:
 *           type: string
 *           description: Categoría de la notificación
 *         leida:
 *           type: boolean
 *           description: Indica si la notificación ha sido leída
 *         fecha_lectura:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de lectura
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación
 *         fecha_expiracion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de expiración
 *         enlace_accion:
 *           type: string
 *           description: URL para acción relacionada
 *         metadata:
 *           type: object
 *           description: Datos adicionales en formato JSON
 *       example:
 *         familiar_id: 1
 *         scout_id: 5
 *         titulo: Recordatorio de campamento
 *         mensaje: No olvide preparar el equipaje para el campamento de fin de semana
 *         tipo: recordatorio
 *         prioridad: alta
 *         categoria: actividad
 */

// Función para obtener notificaciones de un familiar
const findByFamiliarId = async (familiarId, options = {}) => {
  try {
    let query_str = `
      SELECT nf.*,
             u.nombre as scout_nombre, u.apellidos as scout_apellidos,
             s.nombre as seccion_nombre, s.color_principal as seccion_color
      FROM notificaciones_familia nf
      JOIN usuarios u ON nf.scout_id = u.id
      LEFT JOIN secciones s ON u.seccion_id = s.id
      WHERE nf.familiar_id = ?
    `;
    const queryParams = [familiarId];

    // Filtros opcionales
    if (options.soloNoLeidas) {
      query_str += ' AND nf.leida = false';
    }

    if (options.tipo) {
      query_str += ' AND nf.tipo = ?';
      queryParams.push(options.tipo);
    }

    if (options.categoria) {
      query_str += ' AND nf.categoria = ?';
      queryParams.push(options.categoria);
    }

    if (options.prioridad) {
      query_str += ' AND nf.prioridad = ?';
      queryParams.push(options.prioridad);
    }

    // Excluir notificaciones expiradas
    query_str += ' AND (nf.fecha_expiracion IS NULL OR nf.fecha_expiracion > CURRENT_TIMESTAMP)';

    query_str += ' ORDER BY nf.prioridad DESC, nf.fecha_creacion DESC';

    if (options.limit) {
      query_str += ' LIMIT ?';
      queryParams.push(options.limit);
    }

    const notificaciones = await query(query_str, queryParams);
    return notificaciones;
  } catch (error) {
    throw error;
  }
};

// Función para obtener notificaciones de un scout
const findByScoutId = async (scoutId, options = {}) => {
  try {
    let query_str = `
      SELECT nf.*,
             u.nombre as familiar_nombre, u.apellidos as familiar_apellidos
      FROM notificaciones_familia nf
      JOIN usuarios u ON nf.familiar_id = u.id
      WHERE nf.scout_id = ?
    `;
    const queryParams = [scoutId];

    if (options.soloNoLeidas) {
      query_str += ' AND nf.leida = false';
    }

    if (options.tipo) {
      query_str += ' AND nf.tipo = ?';
      queryParams.push(options.tipo);
    }

    query_str += ' AND (nf.fecha_expiracion IS NULL OR nf.fecha_expiracion > CURRENT_TIMESTAMP)';
    query_str += ' ORDER BY nf.fecha_creacion DESC';

    const notificaciones = await query(query_str, queryParams);
    return notificaciones;
  } catch (error) {
    throw error;
  }
};

// Función para obtener una notificación por ID
const findById = async (id, familiarId = null) => {
  try {
    let query_str = `
      SELECT nf.*,
             u.nombre as scout_nombre, u.apellidos as scout_apellidos,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             s.nombre as seccion_nombre
      FROM notificaciones_familia nf
      JOIN usuarios u ON nf.scout_id = u.id
      JOIN usuarios uf ON nf.familiar_id = uf.id
      LEFT JOIN secciones s ON u.seccion_id = s.id
      WHERE nf.id = ?
    `;
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND nf.familiar_id = ?';
      queryParams.push(familiarId);
    }

    const notificaciones = await query(query_str, queryParams);
    return notificaciones.length ? notificaciones[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para crear una nueva notificación
const create = async (notificacionData) => {
  try {
    const result = await query(`
      INSERT INTO notificaciones_familia (
        familiar_id, scout_id, titulo, mensaje, tipo, prioridad,
        categoria, enlace_accion, metadata, fecha_expiracion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      notificacionData.familiar_id,
      notificacionData.scout_id,
      notificacionData.titulo,
      notificacionData.mensaje,
      notificacionData.tipo,
      notificacionData.prioridad || 'normal',
      notificacionData.categoria || null,
      notificacionData.enlace_accion || null,
      notificacionData.metadata ? JSON.stringify(notificacionData.metadata) : null,
      notificacionData.fecha_expiracion || null
    ]);

    const newNotificacion = await findById(result.insertId);
    return newNotificacion;
  } catch (error) {
    throw error;
  }
};

// Función para crear notificaciones masivas
const createBulk = async (notificacionesData) => {
  try {
    const results = [];
    for (const notificacion of notificacionesData) {
      const result = await create(notificacion);
      results.push(result);
    }
    return results;
  } catch (error) {
    throw error;
  }
};

// Función para marcar como leída
const marcarComoLeida = async (id, familiarId = null) => {
  try {
    let query_str = `
      UPDATE notificaciones_familia
      SET leida = true, fecha_lectura = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND familiar_id = ?';
      queryParams.push(familiarId);
    }

    await query(query_str, queryParams);
    return await findById(id, familiarId);
  } catch (error) {
    throw error;
  }
};

// Función para marcar todas como leídas de un familiar
const marcarTodasComoLeidas = async (familiarId, scoutId = null) => {
  try {
    let query_str = `
      UPDATE notificaciones_familia
      SET leida = true, fecha_lectura = CURRENT_TIMESTAMP
      WHERE familiar_id = ? AND leida = false
    `;
    const queryParams = [familiarId];

    if (scoutId) {
      query_str += ' AND scout_id = ?';
      queryParams.push(scoutId);
    }

    query_str += ' AND (fecha_expiracion IS NULL OR fecha_expiracion > CURRENT_TIMESTAMP)';

    const result = await query(query_str, queryParams);
    return result.affectedRows;
  } catch (error) {
    throw error;
  }
};

// Función para eliminar una notificación
const remove = async (id, familiarId = null) => {
  try {
    let query_str = 'DELETE FROM notificaciones_familia WHERE id = ?';
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

// Función para eliminar notificaciones expiradas
const eliminarExpiradas = async () => {
  try {
    const result = await query(`
      DELETE FROM notificaciones_familia
      WHERE fecha_expiracion IS NOT NULL AND fecha_expiracion < CURRENT_TIMESTAMP
    `);
    return result.affectedRows;
  } catch (error) {
    throw error;
  }
};

// Función para obtener contador de no leídas
const getContadorNoLeidas = async (familiarId, scoutId = null) => {
  try {
    let query_str = `
      SELECT COUNT(*) as no_leidas
      FROM notificaciones_familia
      WHERE familiar_id = ? AND leida = false
    `;
    const queryParams = [familiarId];

    if (scoutId) {
      query_str += ' AND scout_id = ?';
      queryParams.push(scoutId);
    }

    query_str += ' AND (fecha_expiracion IS NULL OR fecha_expiracion > CURRENT_TIMESTAMP)';

    const result = await query(query_str, queryParams);
    return result[0].no_leidas;
  } catch (error) {
    throw error;
  }
};

// Función para enviar notificación a todos los familiares de un scout
const enviarAFamiliaresScout = async (scoutId, notificacionBase) => {
  try {
    // Obtener todos los familiares del scout
    const familiares = await query(`
      SELECT familiar_id FROM familiares_scouts WHERE scout_id = ?
    `, [scoutId]);

    const notificaciones = familiares.map(familiar => ({
      ...notificacionBase,
      familiar_id: familiar.familiar_id,
      scout_id: scoutId
    }));

    return await createBulk(notificaciones);
  } catch (error) {
    throw error;
  }
};

// Función para enviar notificación a todos los familiares de una sección
const enviarAFamiliaresSeccion = async (seccionId, notificacionBase) => {
  try {
    const familiares = await query(`
      SELECT DISTINCT fs.familiar_id, u.id as scout_id
      FROM familiares_scouts fs
      JOIN usuarios u ON fs.scout_id = u.id
      WHERE u.seccion_id = ? AND u.activo = true
    `, [seccionId]);

    const notificaciones = familiares.map(familiar => ({
      ...notificacionBase,
      familiar_id: familiar.familiar_id,
      scout_id: familiar.scout_id
    }));

    return await createBulk(notificaciones);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findByFamiliarId,
  findByScoutId,
  findById,
  create,
  createBulk,
  marcarComoLeida,
  marcarTodasComoLeidas,
  remove,
  eliminarExpiradas,
  getContadorNoLeidas,
  enviarAFamiliaresScout,
  enviarAFamiliaresSeccion
};