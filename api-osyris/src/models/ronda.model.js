const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfiguracionRonda:
 *       type: object
 *       required:
 *         - nombre
 *         - fecha_inicio
 *         - fecha_fin
 *         - eventos_plantilla
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la ronda
 *         nombre:
 *           type: string
 *           description: Nombre de la ronda (ej. Ronda Solar 2025-2026)
 *         fecha_inicio:
 *           type: string
 *           format: date
 *           description: Fecha de inicio de la ronda
 *         fecha_fin:
 *           type: string
 *           format: date
 *           description: Fecha de fin de la ronda
 *         eventos_plantilla:
 *           type: array
 *           description: JSON con todos los eventos de la ronda
 *         activa:
 *           type: boolean
 *           description: Si esta es la ronda activa actual
 */

/**
 * Obtener todas las rondas
 */
const findAll = async () => {
  try {
    const rondas = await query(`
      SELECT r.*,
             u.nombre as creador_nombre,
             u.apellidos as creador_apellidos,
             (SELECT COUNT(*) FROM actividades WHERE ronda_id = r.id) as total_actividades
      FROM configuracion_ronda r
      LEFT JOIN usuarios u ON r.creado_por = u.id
      ORDER BY r.fecha_inicio DESC
    `);
    return rondas;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener la ronda activa
 */
const findActiva = async () => {
  try {
    const rondas = await query(`
      SELECT r.*,
             u.nombre as creador_nombre,
             u.apellidos as creador_apellidos
      FROM configuracion_ronda r
      LEFT JOIN usuarios u ON r.creado_por = u.id
      WHERE r.activa = true
      LIMIT 1
    `);
    return rondas.length ? rondas[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener una ronda por ID
 */
const findById = async (id) => {
  try {
    const rondas = await query(`
      SELECT r.*,
             u.nombre as creador_nombre,
             u.apellidos as creador_apellidos,
             (SELECT COUNT(*) FROM actividades WHERE ronda_id = r.id) as total_actividades
      FROM configuracion_ronda r
      LEFT JOIN usuarios u ON r.creado_por = u.id
      WHERE r.id = $1
    `, [id]);
    return rondas.length ? rondas[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear una nueva ronda
 */
const create = async (rondaData) => {
  try {
    const result = await query(`
      INSERT INTO configuracion_ronda (
        nombre, fecha_inicio, fecha_fin, eventos_plantilla, activa, creado_por
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      rondaData.nombre,
      rondaData.fecha_inicio,
      rondaData.fecha_fin,
      JSON.stringify(rondaData.eventos_plantilla || []),
      rondaData.activa || false,
      rondaData.creado_por || null
    ]);

    return await findById(result[0].id);
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar una ronda
 */
const update = async (id, rondaData) => {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (rondaData.nombre !== undefined) {
      fields.push(`nombre = $${paramIndex}`);
      values.push(rondaData.nombre);
      paramIndex++;
    }

    if (rondaData.fecha_inicio !== undefined) {
      fields.push(`fecha_inicio = $${paramIndex}`);
      values.push(rondaData.fecha_inicio);
      paramIndex++;
    }

    if (rondaData.fecha_fin !== undefined) {
      fields.push(`fecha_fin = $${paramIndex}`);
      values.push(rondaData.fecha_fin);
      paramIndex++;
    }

    if (rondaData.eventos_plantilla !== undefined) {
      fields.push(`eventos_plantilla = $${paramIndex}`);
      values.push(JSON.stringify(rondaData.eventos_plantilla));
      paramIndex++;
    }

    if (fields.length === 0) {
      return await findById(id);
    }

    values.push(id);
    const sql = `UPDATE configuracion_ronda SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
    await query(sql, values);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Activar una ronda (desactiva las demas)
 */
const activar = async (id) => {
  try {
    // Desactivar todas las rondas
    await query(`UPDATE configuracion_ronda SET activa = false`);

    // Activar la ronda especificada
    await query(`UPDATE configuracion_ronda SET activa = true WHERE id = $1`, [id]);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar una ronda
 */
const remove = async (id) => {
  try {
    // Verificar que no tenga actividades asociadas
    const actividades = await query(`SELECT COUNT(*) as count FROM actividades WHERE ronda_id = $1`, [id]);
    if (actividades[0].count > 0) {
      throw new Error('No se puede eliminar la ronda porque tiene actividades asociadas');
    }

    const result = await query('DELETE FROM configuracion_ronda WHERE id = $1', [id]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Generar actividades desde la plantilla de la ronda
 * Llama a la funcion SQL generar_actividades_desde_ronda
 */
const generarActividades = async (rondaId) => {
  try {
    const result = await query(`SELECT generar_actividades_desde_ronda($1) as count`, [rondaId]);
    return result[0].count;
  } catch (error) {
    throw error;
  }
};

/**
 * Clonar una ronda para el siguiente año
 */
const clonar = async (rondaOrigenId, nuevoNombre, nuevaFechaInicio, nuevaFechaFin, creadoPor) => {
  try {
    // Obtener ronda origen
    const rondaOrigen = await findById(rondaOrigenId);
    if (!rondaOrigen) {
      throw new Error('Ronda origen no encontrada');
    }

    // Calcular diferencia de años
    const origenInicio = new Date(rondaOrigen.fecha_inicio);
    const nuevoInicio = new Date(nuevaFechaInicio);
    const diffYears = nuevoInicio.getFullYear() - origenInicio.getFullYear();

    // Ajustar fechas en los eventos de la plantilla
    const nuevosEventos = rondaOrigen.eventos_plantilla.map(evento => {
      const fechaInicio = new Date(evento.fecha_inicio);
      fechaInicio.setFullYear(fechaInicio.getFullYear() + diffYears);

      const fechaFin = evento.fecha_fin ? new Date(evento.fecha_fin) : null;
      if (fechaFin) {
        fechaFin.setFullYear(fechaFin.getFullYear() + diffYears);
      }

      return {
        ...evento,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin ? fechaFin.toISOString() : null
      };
    });

    // Crear la nueva ronda
    return await create({
      nombre: nuevoNombre,
      fecha_inicio: nuevaFechaInicio,
      fecha_fin: nuevaFechaFin,
      eventos_plantilla: nuevosEventos,
      activa: false,
      creado_por: creadoPor
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener resumen de eventos por tipo de la ronda
 */
const getResumenEventos = async (rondaId) => {
  try {
    const ronda = await findById(rondaId);
    if (!ronda || !ronda.eventos_plantilla) {
      return null;
    }

    const resumen = {};
    for (const evento of ronda.eventos_plantilla) {
      const tipo = evento.tipo || 'otro';
      if (!resumen[tipo]) {
        resumen[tipo] = 0;
      }
      resumen[tipo]++;
    }

    return {
      ronda_id: rondaId,
      nombre: ronda.nombre,
      total_eventos: ronda.eventos_plantilla.length,
      por_tipo: resumen
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findAll,
  findActiva,
  findById,
  create,
  update,
  activar,
  remove,
  generarActividades,
  clonar,
  getResumenEventos
};
