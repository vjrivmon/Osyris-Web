const { query } = require('../config/db.config');

const findByCircularId = async (circularActividadId) => {
  return await query(
    'SELECT * FROM campos_custom_circular WHERE circular_actividad_id = $1 ORDER BY orden',
    [circularActividadId]
  );
};

const create = async (circularActividadId, campo) => {
  const rows = await query(`
    INSERT INTO campos_custom_circular (circular_actividad_id, nombre_campo, tipo_campo, etiqueta, obligatorio, opciones, orden)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
  `, [
    circularActividadId,
    campo.nombre_campo,
    campo.tipo_campo || 'texto',
    campo.etiqueta,
    campo.obligatorio || false,
    campo.opciones ? JSON.stringify(campo.opciones) : null,
    campo.orden || 0
  ]);
  return rows[0];
};

const replaceBulk = async (circularActividadId, campos) => {
  await query('DELETE FROM campos_custom_circular WHERE circular_actividad_id = $1', [circularActividadId]);
  const results = [];
  for (const campo of campos) {
    results.push(await create(circularActividadId, campo));
  }
  return results;
};

module.exports = { findByCircularId, create, replaceBulk };
