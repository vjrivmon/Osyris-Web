const { query } = require('../config/db.config');

/**
 * Obtiene la config de ronda activa (solo puede haber una).
 */
const getActiva = async () => {
  const rows = await query(
    'SELECT * FROM configuracion_ronda WHERE activa = TRUE ORDER BY fecha_creacion DESC LIMIT 1'
  );
  return rows[0] || null;
};

/**
 * Obtiene una config de ronda por ID.
 */
const findById = async (id) => {
  const rows = await query('SELECT * FROM configuracion_ronda WHERE id = $1', [id]);
  return rows[0] || null;
};

/**
 * Lista todas las configs de ronda.
 */
const findAll = async () => {
  return await query('SELECT * FROM configuracion_ronda ORDER BY fecha_creacion DESC');
};

/**
 * Crea una nueva config de ronda. Desactiva la anterior si existía.
 */
const crear = async (data) => {
  // Desactivar todas las anteriores
  await query('UPDATE configuracion_ronda SET activa = FALSE WHERE activa = TRUE');

  const rows = await query(`
    INSERT INTO configuracion_ronda (
      nombre, fecha_inicio, fecha_fin, eventos_plantilla,
      temporada,
      responsable_castores, numero_responsable_castores,
      responsable_manada, numero_responsable_manada,
      responsable_tropa, numero_responsable_tropa,
      responsable_pioneros, numero_responsable_pioneros,
      responsable_rutas, numero_responsable_rutas,
      normas_generales, cuenta_bancaria, activa, creado_por
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, TRUE, $18)
    RETURNING *
  `, [
    data.temporada || 'Ronda ' + (data.temporada || ''),
    data.fecha_inicio || new Date().toISOString().slice(0, 10),
    data.fecha_fin || new Date(Date.now() + 365*86400000).toISOString().slice(0, 10),
    JSON.stringify(data.eventos_plantilla || []),
    data.temporada,
    data.responsable_castores || '',
    data.numero_responsable_castores || '',
    data.responsable_manada || '',
    data.numero_responsable_manada || '',
    data.responsable_tropa || '',
    data.numero_responsable_tropa || '',
    data.responsable_pioneros || '',
    data.numero_responsable_pioneros || '',
    data.responsable_rutas || '',
    data.numero_responsable_rutas || '',
    data.normas_generales || '',
    data.cuenta_bancaria || '',
    data.creado_por || 1
  ]);
  return rows[0];
};

/**
 * Actualiza una config de ronda existente.
 */
const actualizar = async (id, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  const updatable = [
    'temporada',
    'responsable_castores', 'numero_responsable_castores',
    'responsable_manada', 'numero_responsable_manada',
    'responsable_tropa', 'numero_responsable_tropa',
    'responsable_pioneros', 'numero_responsable_pioneros',
    'responsable_rutas', 'numero_responsable_rutas',
    'normas_generales', 'cuenta_bancaria'
  ];

  for (const f of updatable) {
    if (data[f] !== undefined) {
      fields.push(`${f} = $${idx}`);
      values.push(data[f]);
      idx++;
    }
  }

  if (fields.length === 0) return await findById(id);

  values.push(id);
  await query(`UPDATE configuracion_ronda SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  return await findById(id);
};

module.exports = { getActiva, findById, findAll, crear, actualizar };
