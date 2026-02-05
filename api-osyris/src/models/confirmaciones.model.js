const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfirmacionAsistencia:
 *       type: object
 *       required:
 *         - actividad_id
 *         - familiar_id
 *         - educando_id
 *         - asistira
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la confirmación
 *         actividad_id:
 *           type: integer
 *           description: ID de la actividad
 *         familiar_id:
 *           type: integer
 *           description: ID del familiar que confirma
 *         educando_id:
 *           type: integer
 *           description: ID del scout
 *         asistira:
 *           type: boolean
 *           description: Indica si el scout asistirá a la actividad
 *         comentarios:
 *           type: string
 *           description: Comentarios adicionales sobre la asistencia
 *         confirmado_en:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la confirmación
 *         confirmado_por:
 *           type: integer
 *           description: ID del usuario que realizó la confirmación
 *       example:
 *         actividad_id: 15
 *         familiar_id: 1
 *         educando_id: 5
 *         asistira: true
 *         comentarios: Llevaré medicamentos para alergias
 */

// Función para obtener confirmaciones de un familiar
const findByFamiliarId = async (familiarId, options = {}) => {
  try {
    let query_str = `
      SELECT ca.id, ca.actividad_id, ca.familiar_id, ca.educando_id,
             ca.asistira, ca.estado, ca.comentarios, ca.confirmado_en, ca.confirmado_por,
             a.titulo as actividad_titulo, a.fecha_inicio as actividad_fecha_inicio,
             a.fecha_fin as actividad_fecha_fin, a.lugar as actividad_lugar,
             e.nombre as scout_nombre, e.apellidos as scout_apellidos,
             s.nombre as seccion_nombre, s.color_principal as seccion_color,
             uc.nombre as confirmador_nombre, uc.apellidos as confirmador_apellidos
      FROM confirmaciones_asistencia ca
      JOIN actividades a ON ca.actividad_id = a.id
      JOIN educandos e ON ca.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      LEFT JOIN usuarios uc ON ca.confirmado_por = uc.id
      WHERE ca.familiar_id = $1
    `;
    const queryParams = [familiarId];
    let paramIndex = 2;

    // Filtros opcionales
    if (options.educando_id) {
      query_str += ` AND ca.educando_id = $${paramIndex}`;
      queryParams.push(options.educando_id);
      paramIndex++;
    }

    if (options.asistira !== undefined) {
      query_str += ` AND ca.asistira = $${paramIndex}`;
      queryParams.push(options.asistira);
      paramIndex++;
    }

    if (options.estado_actividad) {
      query_str += ` AND a.estado = $${paramIndex}`;
      queryParams.push(options.estado_actividad);
      paramIndex++;
    }

    if (options.fecha_desde) {
      query_str += ` AND a.fecha_inicio >= $${paramIndex}`;
      queryParams.push(options.fecha_desde);
      paramIndex++;
    }

    if (options.fecha_hasta) {
      query_str += ` AND a.fecha_inicio <= $${paramIndex}`;
      queryParams.push(options.fecha_hasta);
      paramIndex++;
    }

    query_str += ' ORDER BY a.fecha_inicio ASC';

    const confirmaciones = await query(query_str, queryParams);
    return confirmaciones;
  } catch (error) {
    throw error;
  }
};

// Función para obtener confirmaciones de una actividad
const findByActividadId = async (actividadId, options = {}) => {
  try {
    let query_str = `
      SELECT ca.*,
             e.nombre as educando_nombre, e.apellidos as educando_apellidos,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             uf.email as familiar_email, uf.telefono as familiar_telefono,
             s.nombre as seccion_nombre, s.color_principal as seccion_color,
             uc.nombre as confirmador_nombre, uc.apellidos as confirmador_apellidos
      FROM confirmaciones_asistencia ca
      JOIN educandos e ON ca.educando_id = e.id
      JOIN usuarios uf ON ca.familiar_id = uf.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      LEFT JOIN usuarios uc ON ca.confirmado_por = uc.id
      WHERE ca.actividad_id = $1
    `;
    const queryParams = [actividadId];

    if (options.solo_asistiran) {
      query_str += ' AND ca.asistira = true';
    }

    if (options.solo_no_asistiran) {
      query_str += ' AND ca.asistira = false';
    }

    if (options.seccion_id) {
      query_str += ` AND e.seccion_id = $${queryParams.length + 1}`;
      queryParams.push(options.seccion_id);
    }

    query_str += ' ORDER BY s.nombre, e.nombre, e.apellidos';

    const confirmaciones = await query(query_str, queryParams);
    return confirmaciones;
  } catch (error) {
    throw error;
  }
};

// Función para obtener confirmaciones de un scout
const findByScoutId = async (scoutId, options = {}) => {
  try {
    let query_str = `
      SELECT ca.*,
             a.titulo as actividad_titulo, a.fecha_inicio as actividad_fecha_inicio,
             a.fecha_fin as actividad_fecha_fin, a.lugar as actividad_lugar,
             a.estado as actividad_estado,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             uc.nombre as confirmador_nombre, uc.apellidos as confirmador_apellidos
      FROM confirmaciones_asistencia ca
      JOIN actividades a ON ca.actividad_id = a.id
      JOIN usuarios uf ON ca.familiar_id = uf.id
      LEFT JOIN usuarios uc ON ca.confirmado_por = uc.id
      WHERE ca.educando_id = $1
    `;
    const queryParams = [scoutId];
    let paramIndex = 2;

    if (options.fecha_desde) {
      query_str += ` AND a.fecha_inicio >= $${paramIndex}`;
      queryParams.push(options.fecha_desde);
      paramIndex++;
    }

    if (options.fecha_hasta) {
      query_str += ` AND a.fecha_inicio <= $${paramIndex}`;
      queryParams.push(options.fecha_hasta);
      paramIndex++;
    }

    query_str += ' ORDER BY a.fecha_inicio DESC';

    const confirmaciones = await query(query_str, queryParams);
    return confirmaciones;
  } catch (error) {
    throw error;
  }
};

// Función para obtener una confirmación específica
const findById = async (id, familiarId = null) => {
  try {
    let query_str = `
      SELECT ca.*,
             a.titulo as actividad_titulo, a.fecha_inicio as actividad_fecha_inicio,
             a.fecha_fin as actividad_fecha_fin, a.lugar as actividad_lugar,
             e.nombre as scout_nombre, e.apellidos as scout_apellidos,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             s.nombre as seccion_nombre, s.color_principal as seccion_color,
             uc.nombre as confirmador_nombre, uc.apellidos as confirmador_apellidos
      FROM confirmaciones_asistencia ca
      JOIN actividades a ON ca.actividad_id = a.id
      JOIN educandos e ON ca.educando_id = e.id
      JOIN usuarios uf ON ca.familiar_id = uf.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      LEFT JOIN usuarios uc ON ca.confirmado_por = uc.id
      WHERE ca.id = $1
    `;
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND ca.familiar_id = $2';
      queryParams.push(familiarId);
    }

    const confirmaciones = await query(query_str, queryParams);
    return confirmaciones.length ? confirmaciones[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para verificar si existe una confirmación
const findByActividadAndScout = async (actividadId, scoutId, familiarId = null) => {
  try {
    let query_str = `
      SELECT * FROM confirmaciones_asistencia
      WHERE actividad_id = $1 AND educando_id = $2
    `;
    const queryParams = [actividadId, scoutId];

    if (familiarId) {
      query_str += ' AND familiar_id = $3';
      queryParams.push(familiarId);
    }

    const confirmaciones = await query(query_str, queryParams);
    return confirmaciones.length ? confirmaciones[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para crear o actualizar una confirmación
const createOrUpdate = async (confirmacionData) => {
  try {
    // Verificar si ya existe una confirmación
    const existente = await findByActividadAndScout(
      confirmacionData.actividad_id,
      confirmacionData.educando_id,
      confirmacionData.familiar_id
    );

    if (existente) {
      // Actualizar existente
      const setClauses = [];
      const queryParams = [];
      let paramIndex = 1;

      if (confirmacionData.asistira !== undefined) {
        setClauses.push(`asistira = $${paramIndex}`);
        queryParams.push(confirmacionData.asistira);
        paramIndex++;
        // Sincronizar campo estado con asistira
        const nuevoEstado = confirmacionData.asistira ? 'confirmado' : 'no_asiste';
        setClauses.push(`estado = $${paramIndex}`);
        queryParams.push(nuevoEstado);
        paramIndex++;
      }

      if (confirmacionData.comentarios !== undefined) {
        setClauses.push(`comentarios = $${paramIndex}`);
        queryParams.push(confirmacionData.comentarios);
        paramIndex++;
      }

      if (confirmacionData.confirmado_por) {
        setClauses.push(`confirmado_por = $${paramIndex}`);
        queryParams.push(confirmacionData.confirmado_por);
        paramIndex++;
      }

      setClauses.push('confirmado_en = CURRENT_TIMESTAMP');

      const whereClause = `WHERE actividad_id = $${paramIndex} AND educando_id = $${paramIndex + 1} AND familiar_id = $${paramIndex + 2}`;
      queryParams.push(confirmacionData.actividad_id, confirmacionData.educando_id, confirmacionData.familiar_id);

      const query_str = `UPDATE confirmaciones_asistencia SET ${setClauses.join(', ')} ${whereClause}`;
      await query(query_str, queryParams);
      return await findByActividadAndScout(confirmacionData.actividad_id, confirmacionData.educando_id, confirmacionData.familiar_id);
    } else {
      // Crear nueva
      // Calcular estado basándose en asistira
      const estado = confirmacionData.asistira ? 'confirmado' : 'no_asiste';
      const result = await query(`
        INSERT INTO confirmaciones_asistencia (
          actividad_id, familiar_id, educando_id, asistira, comentarios, confirmado_por, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        confirmacionData.actividad_id,
        confirmacionData.familiar_id,
        confirmacionData.educando_id,
        confirmacionData.asistira,
        confirmacionData.comentarios || null,
        confirmacionData.confirmado_por || null,
        estado
      ]);

      const newConfirmacion = await findById(result.insertId);
      return newConfirmacion;
    }
  } catch (error) {
    throw error;
  }
};

// Función para eliminar una confirmación
const remove = async (id, familiarId = null) => {
  try {
    let query_str = 'DELETE FROM confirmaciones_asistencia WHERE id = $1';
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND familiar_id = $2';
      queryParams.push(familiarId);
    }

    const result = await query(query_str, queryParams);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Función para obtener estadísticas de asistencia de una actividad
const getEstadisticasActividad = async (actividadId) => {
  try {
    const stats = await query(`
      SELECT
        COUNT(*) as total_confirmaciones,
        COUNT(CASE WHEN asistira = true THEN 1 END) as asistiran,
        COUNT(CASE WHEN asistira = false THEN 1 END) as no_asistiran,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as sin_confirmar,
        COUNT(DISTINCT educando_id) as scouts_unicos
      FROM confirmaciones_asistencia
      WHERE actividad_id = $1
    `, [actividadId]);

    // Obtener educandos que aún no han confirmado
    const sinConfirmar = await query(`
      SELECT e.id, e.nombre, e.apellidos, s.nombre as seccion_nombre
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      LEFT JOIN confirmaciones_asistencia ca ON e.id = ca.educando_id AND ca.actividad_id = $1
      WHERE e.activo = true
      AND ca.id IS NULL
    `, [actividadId]);

    return {
      ...stats[0],
      scouts_sin_confirmar: sinConfirmar
    };
  } catch (error) {
    throw error;
  }
};

// Función para obtener actividades próximas que requieren confirmación
const getActividadesPendientesConfirmacion = async (familiarId, dias = 30) => {
  try {
    const actividades = await query(`
      SELECT DISTINCT
        a.id, a.titulo, a.fecha_inicio, a.fecha_fin, a.lugar,
        a.inscripcion_abierta, a.cupo_maximo,
        COUNT(CASE WHEN ca.asistira = true THEN 1 END) as confirmados_asistencia,
        COUNT(CASE WHEN ca.id IS NULL THEN 1 END) as sin_confirmar
      FROM actividades a
      JOIN educandos e ON e.seccion_id = a.seccion_id
      JOIN familiares_educandos fe ON e.id = fe.educando_id
      LEFT JOIN confirmaciones_asistencia ca ON a.id = ca.actividad_id AND e.id = ca.educando_id
      WHERE fe.familiar_id = $1
      AND a.fecha_inicio BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * $2
      AND a.estado IN ('planificada', 'confirmada')
      AND a.inscripcion_abierta = true
      GROUP BY a.id, a.titulo, a.fecha_inicio, a.fecha_fin, a.lugar, a.inscripcion_abierta, a.cupo_maximo
      HAVING COUNT(CASE WHEN ca.id IS NULL THEN 1 END) > 0
      ORDER BY a.fecha_inicio ASC
    `, [familiarId, dias]);

    return actividades;
  } catch (error) {
    throw error;
  }
};

// Función para obtener confirmaciones por rango de fechas
const findByRangoFechas = async (familiarId, fechaInicio, fechaFin) => {
  try {
    const confirmaciones = await query(`
      SELECT ca.*,
             a.titulo as actividad_titulo, a.fecha_inicio as actividad_fecha_inicio,
             a.fecha_fin as actividad_fecha_fin, a.lugar as actividad_lugar,
             e.nombre as scout_nombre, e.apellidos as scout_apellidos,
             s.nombre as seccion_nombre, s.color_principal as seccion_color
      FROM confirmaciones_asistencia ca
      JOIN actividades a ON ca.actividad_id = a.id
      JOIN educandos e ON ca.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE ca.familiar_id = $1
      AND a.fecha_inicio BETWEEN $2 AND $3
      ORDER BY a.fecha_inicio ASC
    `, [familiarId, fechaInicio, fechaFin]);

    return confirmaciones;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener educandos que aún no han confirmado su asistencia a una actividad
 * @param {number} actividadId - ID de la actividad
 * @param {number|null} seccionId - ID de la sección para filtrar (null = todas)
 */
const getEducandosSinConfirmar = async (actividadId, seccionId = null) => {
  try {
    let sql = `
      SELECT
        e.id as educando_id,
        e.nombre as educando_nombre,
        e.apellidos as educando_apellidos,
        e.seccion_id,
        s.nombre as seccion_nombre,
        'pendiente' as estado
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE e.activo = true
        AND NOT EXISTS (
          SELECT 1 FROM confirmaciones_asistencia ca
          WHERE ca.educando_id = e.id
          AND ca.actividad_id = $1
        )
    `;

    const params = [actividadId];

    if (seccionId) {
      sql += ` AND e.seccion_id = $2`;
      params.push(seccionId);
    }

    sql += ` ORDER BY s.nombre, e.nombre, e.apellidos`;

    return await query(sql, params);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findByFamiliarId,
  findByActividadId,
  findByScoutId,
  findById,
  findByActividadAndScout,
  createOrUpdate,
  remove,
  getEstadisticasActividad,
  getActividadesPendientesConfirmacion,
  findByRangoFechas,
  getEducandosSinConfirmar
};