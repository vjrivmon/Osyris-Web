const { query, getConnection } = require('../config/db.config');

const findById = async (id) => {
  const rows = await query('SELECT * FROM circular_respuesta WHERE id = $1', [id]);
  return rows[0] || null;
};

const findByCircularAndEducando = async (circularActividadId, educandoId) => {
  const rows = await query(`
    SELECT * FROM circular_respuesta
    WHERE circular_actividad_id = $1 AND educando_id = $2 AND estado NOT IN ('superseded','anulada')
    ORDER BY version DESC LIMIT 1
  `, [circularActividadId, educandoId]);
  return rows[0] || null;
};

const findByCircularId = async (circularActividadId) => {
  return await query(`
    SELECT cr.*, e.nombre as educando_nombre, e.apellidos as educando_apellidos,
           s.nombre as seccion_nombre,
           u.nombre as familiar_nombre, u.apellidos as familiar_apellidos, u.email as familiar_email
    FROM circular_respuesta cr
    JOIN educandos e ON cr.educando_id = e.id
    JOIN secciones s ON e.seccion_id = s.id
    JOIN usuarios u ON cr.familiar_id = u.id
    WHERE cr.circular_actividad_id = $1 AND cr.estado NOT IN ('superseded','anulada')
    ORDER BY e.apellidos, e.nombre
  `, [circularActividadId]);
};

const create = async (data) => {
  // Mark any previous versions as superseded
  await query(`
    UPDATE circular_respuesta SET estado = 'superseded'
    WHERE circular_actividad_id = $1 AND educando_id = $2 AND estado NOT IN ('superseded','anulada')
  `, [data.circular_actividad_id, data.educando_id]);

  // Get next version
  const vRows = await query(`
    SELECT COALESCE(MAX(version), 0) + 1 as next_version
    FROM circular_respuesta
    WHERE circular_actividad_id = $1 AND educando_id = $2
  `, [data.circular_actividad_id, data.educando_id]);
  const nextVersion = vRows[0].next_version;

  const rows = await query(`
    INSERT INTO circular_respuesta (
      circular_actividad_id, educando_id, familiar_id,
      datos_medicos_snapshot, contactos_emergencia_snapshot, campos_custom_respuestas,
      firma_base64, firma_tipo, ip_firma, user_agent_firma, fecha_firma,
      estado, version
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), 'firmada', $11)
    RETURNING *
  `, [
    data.circular_actividad_id,
    data.educando_id,
    data.familiar_id,
    JSON.stringify(data.datos_medicos_snapshot),
    JSON.stringify(data.contactos_emergencia_snapshot),
    JSON.stringify(data.campos_custom_respuestas || {}),
    data.firma_base64,
    data.firma_tipo || 'image',
    data.ip_firma || null,
    data.user_agent_firma || null,
    nextVersion
  ]);
  return rows[0];
};

const updateEstado = async (id, estado, extra = {}) => {
  const fields = ['estado = $2'];
  const values = [id, estado];
  let idx = 3;

  if (extra.pdf_drive_id !== undefined) {
    fields.push(`pdf_drive_id = $${idx}`);
    values.push(extra.pdf_drive_id);
    idx++;
  }
  if (extra.pdf_hash_sha256 !== undefined) {
    fields.push(`pdf_hash_sha256 = $${idx}`);
    values.push(extra.pdf_hash_sha256);
    idx++;
  }
  if (extra.pdf_local_path !== undefined) {
    fields.push(`pdf_local_path = $${idx}`);
    values.push(extra.pdf_local_path);
    idx++;
  }

  await query(`UPDATE circular_respuesta SET ${fields.join(', ')} WHERE id = $1`, values);
  return await findById(id);
};

/**
 * Get dashboard stats for a circular
 */
const getEstadisticas = async (circularActividadId) => {
  const rows = await query(`
    SELECT
      (SELECT COUNT(*) FROM inscripciones_campamento ic
       JOIN circular_actividad ca ON ic.actividad_id = ca.actividad_id
       WHERE ca.id = $1 AND ic.estado IN ('pendiente','inscrito')) as total,
      COUNT(*) FILTER (WHERE cr.estado IN ('firmada','pdf_generado','archivada')) as firmadas,
      COUNT(*) FILTER (WHERE cr.estado IN ('error_pdf','error_drive')) as errores
    FROM circular_respuesta cr
    WHERE cr.circular_actividad_id = $1 AND cr.estado NOT IN ('superseded','anulada')
  `, [circularActividadId]);

  const stats = rows[0];
  const total = parseInt(stats.total) || 0;
  const firmadas = parseInt(stats.firmadas) || 0;
  const errores = parseInt(stats.errores) || 0;

  return {
    total,
    firmadas,
    pendientes: total - firmadas - errores,
    error: errores
  };
};

module.exports = { findById, findByCircularAndEducando, findByCircularId, create, updateEstado, getEstadisticas };
