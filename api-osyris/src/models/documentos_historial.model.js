/**
 * Modelo: Historial de Versiones de Documentos
 *
 * Gestiona el historial de versiones anteriores de documentos.
 * Permite restaurar versiones cuando se rechaza una nueva.
 */

const { query } = require('../config/db.config');

/**
 * Guarda la versión actual de un documento antes de reemplazarla
 * @param {number} documentoId - ID del documento
 * @param {Object} datos - Datos de la versión a guardar
 * @returns {Object} Versión guardada
 */
const guardarVersionAnterior = async (documentoId, datos) => {
  try {
    const result = await query(`
      INSERT INTO documentos_historial (
        documento_id,
        google_drive_file_id,
        archivo_nombre,
        archivo_ruta,
        tipo_archivo,
        tamaño_archivo,
        version,
        subido_por,
        fecha_subida,
        estado,
        motivo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      documentoId,
      datos.google_drive_file_id,
      datos.archivo_nombre,
      datos.archivo_ruta,
      datos.tipo_archivo,
      datos.tamaño_archivo,
      datos.version || 1,
      datos.subido_por,
      datos.fecha_subida || new Date(),
      datos.estado || 'reemplazado',
      datos.motivo || 'Nueva versión subida'
    ]);

    return result[0];
  } catch (error) {
    console.error('Error guardando versión anterior:', error);
    throw error;
  }
};

/**
 * Obtiene el historial de versiones de un documento
 * @param {number} documentoId - ID del documento
 * @returns {Array} Lista de versiones ordenadas por fecha (más reciente primero)
 */
const obtenerHistorial = async (documentoId) => {
  try {
    const versiones = await query(`
      SELECT
        dh.*,
        u.nombre as subido_por_nombre,
        u.apellidos as subido_por_apellidos
      FROM documentos_historial dh
      LEFT JOIN usuarios u ON dh.subido_por = u.id
      WHERE dh.documento_id = $1
      ORDER BY dh.fecha_subida DESC
    `, [documentoId]);

    return versiones;
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    throw error;
  }
};

/**
 * Obtiene la última versión válida (no rechazada) de un documento
 * @param {number} documentoId - ID del documento
 * @returns {Object|null} Última versión válida o null si no existe
 */
const obtenerVersionAnteriorValida = async (documentoId) => {
  try {
    const versiones = await query(`
      SELECT *
      FROM documentos_historial
      WHERE documento_id = $1
        AND estado IN ('reemplazado', 'restaurado')
        AND google_drive_file_id IS NOT NULL
      ORDER BY fecha_subida DESC
      LIMIT 1
    `, [documentoId]);

    return versiones.length > 0 ? versiones[0] : null;
  } catch (error) {
    console.error('Error obteniendo versión anterior válida:', error);
    throw error;
  }
};

/**
 * Obtiene una versión específica por ID
 * @param {number} id - ID de la versión en historial
 * @returns {Object|null} Versión o null
 */
const findById = async (id) => {
  try {
    const versiones = await query(`
      SELECT *
      FROM documentos_historial
      WHERE id = $1
    `, [id]);

    return versiones.length > 0 ? versiones[0] : null;
  } catch (error) {
    console.error('Error obteniendo versión por ID:', error);
    throw error;
  }
};

/**
 * Marca una versión como restaurada
 * @param {number} id - ID de la versión en historial
 * @returns {Object} Versión actualizada
 */
const marcarComoRestaurada = async (id) => {
  try {
    const result = await query(`
      UPDATE documentos_historial
      SET estado = 'restaurado'
      WHERE id = $1
      RETURNING *
    `, [id]);

    return result[0];
  } catch (error) {
    console.error('Error marcando versión como restaurada:', error);
    throw error;
  }
};

/**
 * Marca la versión actual (más reciente) como rechazada
 * @param {number} documentoId - ID del documento
 * @param {string} motivo - Motivo del rechazo
 * @returns {Object} Versión actualizada
 */
const marcarUltimaComoRechazada = async (documentoId, motivo) => {
  try {
    const result = await query(`
      UPDATE documentos_historial
      SET estado = 'rechazado', motivo = $2
      WHERE id = (
        SELECT id FROM documentos_historial
        WHERE documento_id = $1
        ORDER BY fecha_subida DESC
        LIMIT 1
      )
      RETURNING *
    `, [documentoId, motivo]);

    return result[0];
  } catch (error) {
    console.error('Error marcando versión como rechazada:', error);
    throw error;
  }
};

/**
 * Cuenta el número de versiones de un documento
 * @param {number} documentoId - ID del documento
 * @returns {number} Número de versiones
 */
const contarVersiones = async (documentoId) => {
  try {
    const result = await query(`
      SELECT COUNT(*) as total
      FROM documentos_historial
      WHERE documento_id = $1
    `, [documentoId]);

    return parseInt(result[0].total);
  } catch (error) {
    console.error('Error contando versiones:', error);
    throw error;
  }
};

/**
 * Elimina versiones antiguas, manteniendo solo las N más recientes
 * @param {number} documentoId - ID del documento
 * @param {number} mantener - Número de versiones a mantener (default: 5)
 */
const limpiarVersionesAntiguas = async (documentoId, mantener = 5) => {
  try {
    await query(`
      DELETE FROM documentos_historial
      WHERE documento_id = $1
        AND id NOT IN (
          SELECT id FROM documentos_historial
          WHERE documento_id = $1
          ORDER BY fecha_subida DESC
          LIMIT $2
        )
    `, [documentoId, mantener]);
  } catch (error) {
    console.error('Error limpiando versiones antiguas:', error);
    throw error;
  }
};

/**
 * Elimina todo el historial de un documento
 * @param {number} documentoId - ID del documento
 */
const eliminarHistorial = async (documentoId) => {
  try {
    await query(`
      DELETE FROM documentos_historial
      WHERE documento_id = $1
    `, [documentoId]);
  } catch (error) {
    console.error('Error eliminando historial:', error);
    throw error;
  }
};

module.exports = {
  guardarVersionAnterior,
  obtenerHistorial,
  obtenerVersionAnteriorValida,
  findById,
  marcarComoRestaurada,
  marcarUltimaComoRechazada,
  contarVersiones,
  limpiarVersionesAntiguas,
  eliminarHistorial
};
