/**
 * Modelo: Solicitudes de Desbloqueo
 *
 * Gestiona las solicitudes de familias para desbloquear
 * el límite de subida de 24h por documento.
 */

const { query } = require('../config/db.config');

/**
 * Crea una nueva solicitud de desbloqueo
 * @param {Object} solicitudData - Datos de la solicitud
 * @returns {Object} Solicitud creada
 */
const crear = async (solicitudData) => {
  try {
    const result = await query(`
      INSERT INTO solicitudes_desbloqueo (
        documento_id,
        educando_id,
        familiar_id,
        seccion_id,
        tipo_documento,
        titulo_documento,
        motivo,
        estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
      RETURNING *
    `, [
      solicitudData.documento_id,
      solicitudData.educando_id,
      solicitudData.familiar_id,
      solicitudData.seccion_id,
      solicitudData.tipo_documento,
      solicitudData.titulo_documento,
      solicitudData.motivo || null
    ]);

    return result[0];
  } catch (error) {
    console.error('Error creando solicitud de desbloqueo:', error);
    throw error;
  }
};

/**
 * Obtiene una solicitud por ID
 * @param {number} id - ID de la solicitud
 * @returns {Object|null} Solicitud o null
 */
const findById = async (id) => {
  try {
    const solicitudes = await query(`
      SELECT
        sd.*,
        e.nombre as educando_nombre,
        e.apellidos as educando_apellidos,
        u.nombre as familiar_nombre,
        u.apellidos as familiar_apellidos,
        u.email as familiar_email,
        s.nombre as seccion_nombre,
        r.nombre as revisado_por_nombre,
        r.apellidos as revisado_por_apellidos
      FROM solicitudes_desbloqueo sd
      LEFT JOIN educandos e ON sd.educando_id = e.id
      LEFT JOIN usuarios u ON sd.familiar_id = u.id
      LEFT JOIN secciones s ON sd.seccion_id = s.id
      LEFT JOIN usuarios r ON sd.revisado_por = r.id
      WHERE sd.id = $1
    `, [id]);

    return solicitudes.length > 0 ? solicitudes[0] : null;
  } catch (error) {
    console.error('Error obteniendo solicitud por ID:', error);
    throw error;
  }
};

/**
 * Obtiene solicitudes por sección (para scouters)
 * @param {number} seccionId - ID de la sección
 * @param {string} estado - Estado a filtrar (opcional)
 * @returns {Array} Lista de solicitudes
 */
const findBySeccionId = async (seccionId, estado = null) => {
  try {
    let sql = `
      SELECT
        sd.*,
        e.nombre as educando_nombre,
        e.apellidos as educando_apellidos,
        u.nombre as familiar_nombre,
        u.apellidos as familiar_apellidos,
        u.email as familiar_email,
        s.nombre as seccion_nombre
      FROM solicitudes_desbloqueo sd
      LEFT JOIN educandos e ON sd.educando_id = e.id
      LEFT JOIN usuarios u ON sd.familiar_id = u.id
      LEFT JOIN secciones s ON sd.seccion_id = s.id
      WHERE sd.seccion_id = $1
    `;

    const params = [seccionId];

    if (estado) {
      sql += ` AND sd.estado = $2`;
      params.push(estado);
    }

    sql += ` ORDER BY sd.fecha_solicitud DESC`;

    return await query(sql, params);
  } catch (error) {
    console.error('Error obteniendo solicitudes por sección:', error);
    throw error;
  }
};

/**
 * Obtiene solicitudes de un familiar
 * @param {number} familiarId - ID del familiar
 * @returns {Array} Lista de solicitudes
 */
const findByFamiliarId = async (familiarId) => {
  try {
    return await query(`
      SELECT
        sd.*,
        e.nombre as educando_nombre,
        e.apellidos as educando_apellidos,
        s.nombre as seccion_nombre
      FROM solicitudes_desbloqueo sd
      LEFT JOIN educandos e ON sd.educando_id = e.id
      LEFT JOIN secciones s ON sd.seccion_id = s.id
      WHERE sd.familiar_id = $1
      ORDER BY sd.fecha_solicitud DESC
    `, [familiarId]);
  } catch (error) {
    console.error('Error obteniendo solicitudes del familiar:', error);
    throw error;
  }
};

/**
 * Cuenta solicitudes pendientes por sección
 * @param {number} seccionId - ID de la sección
 * @returns {number} Número de solicitudes pendientes
 */
const contarPendientesPorSeccion = async (seccionId) => {
  try {
    const result = await query(`
      SELECT COUNT(*) as total
      FROM solicitudes_desbloqueo
      WHERE seccion_id = $1 AND estado = 'pendiente'
    `, [seccionId]);

    return parseInt(result[0].total);
  } catch (error) {
    console.error('Error contando solicitudes pendientes:', error);
    throw error;
  }
};

/**
 * Cuenta todas las solicitudes pendientes (para admin)
 * @returns {number} Total de solicitudes pendientes
 */
const contarTodasPendientes = async () => {
  try {
    const result = await query(`
      SELECT COUNT(*) as total
      FROM solicitudes_desbloqueo
      WHERE estado = 'pendiente'
    `);

    return parseInt(result[0].total);
  } catch (error) {
    console.error('Error contando todas las solicitudes pendientes:', error);
    throw error;
  }
};

/**
 * Aprueba una solicitud de desbloqueo
 * Resetea el contador de subidas del documento
 * @param {number} id - ID de la solicitud
 * @param {number} scouterId - ID del scouter que aprueba
 * @param {string} respuesta - Respuesta opcional
 * @returns {Object} Solicitud actualizada
 */
const aprobar = async (id, scouterId, respuesta = null) => {
  try {
    // 1. Actualizar solicitud
    const result = await query(`
      UPDATE solicitudes_desbloqueo
      SET
        estado = 'aprobada',
        revisado_por = $2,
        fecha_revision = NOW(),
        respuesta_scouter = $3,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, scouterId, respuesta]);

    if (result.length === 0) {
      throw new Error('Solicitud no encontrada');
    }

    const solicitud = result[0];

    // 2. Resetear contador de subidas del documento
    await query(`
      UPDATE documentos_familia
      SET
        subidas_hoy = 0,
        fecha_reset_subidas = CURRENT_DATE
      WHERE id = $1
    `, [solicitud.documento_id]);

    return solicitud;
  } catch (error) {
    console.error('Error aprobando solicitud:', error);
    throw error;
  }
};

/**
 * Rechaza una solicitud de desbloqueo
 * @param {number} id - ID de la solicitud
 * @param {number} scouterId - ID del scouter que rechaza
 * @param {string} respuesta - Motivo del rechazo (obligatorio)
 * @returns {Object} Solicitud actualizada
 */
const rechazar = async (id, scouterId, respuesta) => {
  try {
    if (!respuesta || respuesta.trim() === '') {
      throw new Error('El motivo del rechazo es obligatorio');
    }

    const result = await query(`
      UPDATE solicitudes_desbloqueo
      SET
        estado = 'rechazada',
        revisado_por = $2,
        fecha_revision = NOW(),
        respuesta_scouter = $3,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, scouterId, respuesta]);

    if (result.length === 0) {
      throw new Error('Solicitud no encontrada');
    }

    return result[0];
  } catch (error) {
    console.error('Error rechazando solicitud:', error);
    throw error;
  }
};

/**
 * Verifica si hay una solicitud pendiente para un documento
 * @param {number} documentoId - ID del documento
 * @param {number} familiarId - ID del familiar
 * @returns {Object|null} Solicitud pendiente o null
 */
const findPendienteByDocumento = async (documentoId, familiarId) => {
  try {
    const solicitudes = await query(`
      SELECT *
      FROM solicitudes_desbloqueo
      WHERE documento_id = $1
        AND familiar_id = $2
        AND estado = 'pendiente'
      ORDER BY fecha_solicitud DESC
      LIMIT 1
    `, [documentoId, familiarId]);

    return solicitudes.length > 0 ? solicitudes[0] : null;
  } catch (error) {
    console.error('Error buscando solicitud pendiente:', error);
    throw error;
  }
};

/**
 * Obtiene todas las solicitudes pendientes (para admin)
 * @returns {Array} Lista de todas las solicitudes pendientes
 */
const findAllPendientes = async () => {
  try {
    return await query(`
      SELECT
        sd.*,
        e.nombre as educando_nombre,
        e.apellidos as educando_apellidos,
        u.nombre as familiar_nombre,
        u.apellidos as familiar_apellidos,
        u.email as familiar_email,
        s.nombre as seccion_nombre
      FROM solicitudes_desbloqueo sd
      LEFT JOIN educandos e ON sd.educando_id = e.id
      LEFT JOIN usuarios u ON sd.familiar_id = u.id
      LEFT JOIN secciones s ON sd.seccion_id = s.id
      WHERE sd.estado = 'pendiente'
      ORDER BY sd.fecha_solicitud DESC
    `);
  } catch (error) {
    console.error('Error obteniendo todas las solicitudes pendientes:', error);
    throw error;
  }
};

/**
 * Elimina solicitudes antiguas resueltas (limpieza)
 * @param {number} diasAntiguedad - Días de antigüedad para eliminar (default: 30)
 */
const limpiarSolicitudesAntiguas = async (diasAntiguedad = 30) => {
  try {
    await query(`
      DELETE FROM solicitudes_desbloqueo
      WHERE estado IN ('aprobada', 'rechazada')
        AND fecha_revision < NOW() - INTERVAL '${diasAntiguedad} days'
    `);
  } catch (error) {
    console.error('Error limpiando solicitudes antiguas:', error);
    throw error;
  }
};

module.exports = {
  crear,
  findById,
  findBySeccionId,
  findByFamiliarId,
  contarPendientesPorSeccion,
  contarTodasPendientes,
  aprobar,
  rechazar,
  findPendienteByDocumento,
  findAllPendientes,
  limpiarSolicitudesAntiguas
};
