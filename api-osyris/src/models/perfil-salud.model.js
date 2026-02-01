const { query } = require('../config/db.config');

/**
 * Obtener perfil de salud de un educando
 */
const findByEducandoId = async (educandoId) => {
  const rows = await query(
    'SELECT * FROM perfil_salud WHERE educando_id = $1',
    [educandoId]
  );
  return rows[0] || null;
};

/**
 * Crear o actualizar perfil de salud
 */
const upsert = async (educandoId, data) => {
  const result = await query(`
    INSERT INTO perfil_salud (
      educando_id, alergias, intolerancias, dieta_especial,
      medicacion, observaciones_medicas, grupo_sanguineo,
      tarjeta_sanitaria, enfermedades_cronicas, puede_hacer_deporte,
      notas_adicionales, ultima_actualizacion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    ON CONFLICT (educando_id) DO UPDATE SET
      alergias = EXCLUDED.alergias,
      intolerancias = EXCLUDED.intolerancias,
      dieta_especial = EXCLUDED.dieta_especial,
      medicacion = EXCLUDED.medicacion,
      observaciones_medicas = EXCLUDED.observaciones_medicas,
      grupo_sanguineo = EXCLUDED.grupo_sanguineo,
      tarjeta_sanitaria = EXCLUDED.tarjeta_sanitaria,
      enfermedades_cronicas = EXCLUDED.enfermedades_cronicas,
      puede_hacer_deporte = EXCLUDED.puede_hacer_deporte,
      notas_adicionales = EXCLUDED.notas_adicionales,
      ultima_actualizacion = NOW()
    RETURNING *
  `, [
    educandoId,
    data.alergias || '',
    data.intolerancias || '',
    data.dieta_especial || '',
    data.medicacion || '',
    data.observaciones_medicas || '',
    data.grupo_sanguineo || '',
    data.tarjeta_sanitaria || '',
    data.enfermedades_cronicas || '',
    data.puede_hacer_deporte !== false,
    data.notas_adicionales || ''
  ]);
  return result[0];
};

/**
 * Obtener contactos de emergencia de un educando
 */
const getContactos = async (educandoId) => {
  return await query(
    'SELECT * FROM contactos_emergencia WHERE educando_id = $1 ORDER BY orden',
    [educandoId]
  );
};

/**
 * Reemplazar contactos de emergencia
 */
const replaceContactos = async (educandoId, contactos) => {
  await query('DELETE FROM contactos_emergencia WHERE educando_id = $1', [educandoId]);
  
  for (const c of contactos) {
    await query(`
      INSERT INTO contactos_emergencia (educando_id, nombre_completo, telefono, relacion, orden)
      VALUES ($1, $2, $3, $4, $5)
    `, [educandoId, c.nombre_completo, c.telefono, c.relacion, c.orden]);
  }
  
  return await getContactos(educandoId);
};

module.exports = {
  findByEducandoId,
  upsert,
  getContactos,
  replaceContactos
};
