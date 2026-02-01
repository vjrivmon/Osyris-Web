const { query } = require('../config/db.config');

const findById = async (id) => {
  const rows = await query(`
    SELECT ca.*, a.titulo as actividad_titulo, a.fecha_inicio as actividad_fecha_inicio,
           a.fecha_fin as actividad_fecha_fin, a.lugar as actividad_lugar
    FROM circular_actividad ca
    JOIN actividades a ON ca.actividad_id = a.id
    WHERE ca.id = $1
  `, [id]);
  return rows[0] || null;
};

const findByActividadId = async (actividadId) => {
  const rows = await query(`
    SELECT ca.*, a.titulo as actividad_titulo, a.fecha_inicio as actividad_fecha_inicio,
           a.fecha_fin as actividad_fecha_fin, a.lugar as actividad_lugar
    FROM circular_actividad ca
    JOIN actividades a ON ca.actividad_id = a.id
    WHERE ca.actividad_id = $1
    ORDER BY ca.created_at DESC
    LIMIT 1
  `, [actividadId]);
  return rows[0] || null;
};

const findAll = async (filters = {}) => {
  let sql = `
    SELECT ca.*, a.titulo as actividad_titulo, a.fecha_inicio as actividad_fecha_inicio,
           a.fecha_fin as actividad_fecha_fin, a.lugar as actividad_lugar,
           (SELECT COUNT(*) FROM circular_respuesta cr WHERE cr.circular_actividad_id = ca.id AND cr.estado NOT IN ('superseded','anulada')) as total_respuestas,
           (SELECT COUNT(*) FROM inscripciones_campamento ic WHERE ic.actividad_id = ca.actividad_id AND ic.estado IN ('pendiente','inscrito')) as total_inscritos
    FROM circular_actividad ca
    JOIN actividades a ON ca.actividad_id = a.id
  `;
  const params = [];
  let idx = 1;

  if (filters.estado) {
    sql += ` WHERE ca.estado = $${idx}`;
    params.push(filters.estado);
    idx++;
  }

  sql += ' ORDER BY ca.created_at DESC';
  return await query(sql, params);
};

const create = async (data) => {
  const rows = await query(`
    INSERT INTO circular_actividad (actividad_id, plantilla_id, titulo, texto_introductorio, fecha_limite_firma, estado, configuracion, creado_por)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    data.actividad_id,
    data.plantilla_id || null,
    data.titulo,
    data.texto_introductorio || '',
    data.fecha_limite_firma || null,
    data.estado || 'borrador',
    JSON.stringify(data.configuracion || {}),
    data.creado_por
  ]);
  return rows[0];
};

const update = async (id, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  const updatable = ['titulo', 'texto_introductorio', 'fecha_limite_firma', 'estado', 'configuracion', 'plantilla_id'];
  for (const f of updatable) {
    if (data[f] !== undefined) {
      fields.push(`${f} = $${idx}`);
      values.push(f === 'configuracion' ? JSON.stringify(data[f]) : data[f]);
      idx++;
    }
  }

  if (fields.length === 0) return await findById(id);
  values.push(id);
  await query(`UPDATE circular_actividad SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  return await findById(id);
};

module.exports = { findById, findByActividadId, findAll, create, update };
