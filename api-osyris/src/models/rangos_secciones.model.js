const { query } = require('../config/db.config');

/**
 * Modelo para rangos de edad por sección.
 * Tabla rangos_secciones: define qué rango de edad corresponde a cada sección.
 */

/**
 * Inicializar tabla rangos_secciones (idempotente)
 */
const initTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS rangos_secciones (
      id SERIAL PRIMARY KEY,
      seccion_id INTEGER NOT NULL REFERENCES secciones(id),
      edad_min INTEGER NOT NULL,
      edad_max INTEGER NOT NULL,
      activo BOOLEAN DEFAULT true,
      UNIQUE(seccion_id)
    )
  `);

  // Seed datos iniciales (ON CONFLICT DO NOTHING = idempotente)
  const seeds = [
    { seccion_id: 1, edad_min: 6,  edad_max: 8  }, // Castores
    { seccion_id: 2, edad_min: 9,  edad_max: 11 }, // Lobatos
    { seccion_id: 3, edad_min: 12, edad_max: 14 }, // Tropa
    { seccion_id: 4, edad_min: 15, edad_max: 17 }, // Pioneros
    { seccion_id: 5, edad_min: 18, edad_max: 20 }, // Rutas
  ];

  for (const s of seeds) {
    await query(
      `INSERT INTO rangos_secciones (seccion_id, edad_min, edad_max)
       VALUES ($1, $2, $3)
       ON CONFLICT (seccion_id) DO NOTHING`,
      [s.seccion_id, s.edad_min, s.edad_max]
    );
  }
};

/**
 * Obtener todos los rangos con info de sección
 */
const findAll = async () => {
  return await query(`
    SELECT rs.*, s.nombre as seccion_nombre, s.color as seccion_color, s.icono as seccion_icono
    FROM rangos_secciones rs
    JOIN secciones s ON rs.seccion_id = s.id
    ORDER BY rs.edad_min ASC
  `);
};

/**
 * Obtener un rango por ID
 */
const findById = async (id) => {
  const rows = await query(
    `SELECT rs.*, s.nombre as seccion_nombre
     FROM rangos_secciones rs
     JOIN secciones s ON rs.seccion_id = s.id
     WHERE rs.id = $1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Actualizar un rango
 */
const update = async (id, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.edad_min !== undefined) {
    fields.push(`edad_min = $${idx}`);
    values.push(data.edad_min);
    idx++;
  }
  if (data.edad_max !== undefined) {
    fields.push(`edad_max = $${idx}`);
    values.push(data.edad_max);
    idx++;
  }
  if (data.activo !== undefined) {
    fields.push(`activo = $${idx}`);
    values.push(data.activo);
    idx++;
  }

  if (fields.length === 0) return await findById(id);

  values.push(id);
  await query(
    `UPDATE rangos_secciones SET ${fields.join(', ')} WHERE id = $${idx}`,
    values
  );
  return await findById(id);
};

/**
 * Calcular la sección correspondiente a un educando según la ronda activa.
 *
 * edad_efectiva = año_fin_ronda_activa - año_nacimiento_educando
 * Si cumple años en sep-dic del año de cierre, igualmente pasa de sección
 * (el cálculo basado en años ya lo contempla).
 */
const calcularSeccion = async (educandoId) => {
  // 1. Obtener educando
  const educandos = await query(
    `SELECT id, nombre, apellidos, fecha_nacimiento, seccion_id
     FROM educandos WHERE id = $1`,
    [educandoId]
  );
  if (!educandos.length) throw new Error('Educando no encontrado');
  const educando = educandos[0];

  if (!educando.fecha_nacimiento) {
    throw new Error('El educando no tiene fecha de nacimiento registrada');
  }

  // 2. Obtener ronda activa
  const rondas = await query(
    `SELECT id, fecha_fin FROM configuracion_ronda WHERE activa = true LIMIT 1`
  );
  if (!rondas.length) throw new Error('No hay ronda activa');
  const ronda = rondas[0];

  const anioFinRonda = new Date(ronda.fecha_fin).getFullYear();
  const nacimiento = new Date(educando.fecha_nacimiento);
  const anioNacimiento = nacimiento.getFullYear();
  const mesNacimiento = nacimiento.getMonth() + 1; // 1-12

  let edadEfectiva = anioFinRonda - anioNacimiento;

  // Si cumple en sep-dic del año de cierre de ronda, igualmente pasa
  // (la resta de años ya da la edad que cumplirán ese año,
  //  pero reforzamos: si mes >= 9 se trata como edad completa)
  // La lógica year-based ya cubre este caso; no se necesita ajuste extra.

  // 3. Buscar rango que encaje
  const rangos = await query(
    `SELECT rs.*, s.nombre as seccion_nombre
     FROM rangos_secciones rs
     JOIN secciones s ON rs.seccion_id = s.id
     WHERE rs.activo = true
     ORDER BY rs.edad_min ASC`
  );

  let seccionCalculada = null;
  for (const r of rangos) {
    if (edadEfectiva >= r.edad_min && edadEfectiva <= r.edad_max) {
      seccionCalculada = r;
      break;
    }
  }

  // Sección actual
  const seccionActualRows = await query(
    `SELECT id, nombre FROM secciones WHERE id = $1`,
    [educando.seccion_id]
  );
  const seccionActual = seccionActualRows[0] || null;

  return {
    educando_id: educando.id,
    nombre: educando.nombre,
    apellidos: educando.apellidos,
    fecha_nacimiento: educando.fecha_nacimiento,
    edad_efectiva: edadEfectiva,
    mes_nacimiento: mesNacimiento,
    seccion_actual: seccionActual,
    seccion_calculada: seccionCalculada
      ? { id: seccionCalculada.seccion_id, nombre: seccionCalculada.seccion_nombre }
      : null,
    cambio_necesario: seccionCalculada
      ? seccionCalculada.seccion_id !== educando.seccion_id
      : false
  };
};

/**
 * Calcular secciones para TODOS los educandos activos.
 * Devuelve { movidos, sin_cambio, pendientes_rutas, sin_rango }
 */
const calcularTodos = async () => {
  // Ronda activa
  const rondas = await query(
    `SELECT id, fecha_fin FROM configuracion_ronda WHERE activa = true LIMIT 1`
  );
  if (!rondas.length) throw new Error('No hay ronda activa');
  const ronda = rondas[0];
  const anioFinRonda = new Date(ronda.fecha_fin).getFullYear();

  // Rangos activos
  const rangos = await query(
    `SELECT rs.*, s.nombre as seccion_nombre
     FROM rangos_secciones rs
     JOIN secciones s ON rs.seccion_id = s.id
     WHERE rs.activo = true
     ORDER BY rs.edad_min ASC`
  );

  // Sección Rutas
  const rutasRows = await query(`SELECT id FROM secciones WHERE LOWER(nombre) = 'rutas' LIMIT 1`);
  const rutasSeccionId = rutasRows.length ? rutasRows[0].id : null;

  // Todos los educandos activos
  const educandos = await query(`
    SELECT e.id, e.nombre, e.apellidos, e.fecha_nacimiento, e.seccion_id,
           s.nombre as seccion_nombre
    FROM educandos e
    LEFT JOIN secciones s ON e.seccion_id = s.id
    WHERE e.activo = true
  `);

  const movidos = [];
  const sinCambio = [];
  const pendientesRutas = [];
  const sinRango = [];

  for (const edu of educandos) {
    if (!edu.fecha_nacimiento) {
      sinRango.push({ ...edu, razon: 'Sin fecha de nacimiento' });
      continue;
    }

    const anioNac = new Date(edu.fecha_nacimiento).getFullYear();
    const edadEfectiva = anioFinRonda - anioNac;

    let rangoEncontrado = null;
    for (const r of rangos) {
      if (edadEfectiva >= r.edad_min && edadEfectiva <= r.edad_max) {
        rangoEncontrado = r;
        break;
      }
    }

    if (!rangoEncontrado) {
      sinRango.push({ ...edu, edad_efectiva: edadEfectiva, razon: 'Edad fuera de rangos' });
      continue;
    }

    const nuevaSeccionId = rangoEncontrado.seccion_id;
    const item = {
      id: edu.id,
      nombre: edu.nombre,
      apellidos: edu.apellidos,
      edad_efectiva: edadEfectiva,
      seccion_actual_id: edu.seccion_id,
      seccion_actual_nombre: edu.seccion_nombre,
      seccion_nueva_id: nuevaSeccionId,
      seccion_nueva_nombre: rangoEncontrado.seccion_nombre
    };

    if (nuevaSeccionId === edu.seccion_id) {
      sinCambio.push(item);
    } else if (edu.seccion_id === rutasSeccionId) {
      // Los de Rutas no se mueven automáticamente
      pendientesRutas.push(item);
    } else {
      movidos.push(item);
    }
  }

  return { movidos, sinCambio, pendientesRutas, sinRango, ronda };
};

/**
 * Aplicar movimientos: actualizar seccion_id de los educandos movidos
 */
const aplicarMovimientos = async (movidos) => {
  const resultados = [];
  for (const m of movidos) {
    await query(
      `UPDATE educandos SET seccion_id = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $2`,
      [m.seccion_nueva_id, m.id]
    );
    resultados.push(m);
  }
  return resultados;
};

module.exports = {
  initTable,
  findAll,
  findById,
  update,
  calcularSeccion,
  calcularTodos,
  aplicarMovimientos
};
