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
 *         - scout_id
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
 *         scout_id:
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
 *         scout_id: 5
 *         asistira: true
 *         comentarios: Llevaré medicamentos para alergias
 */

// Función para obtener confirmaciones de un familiar
const findByFamiliarId = async (familiarId, options = {}) => {
  try {
    let query_str = `
      SELECT ca.*,
             a.titulo as actividad_titulo, a.fecha_inicio as actividad_fecha_inicio,
             a.fecha_fin as actividad_fecha_fin, a.lugar as actividad_lugar,
             u.nombre as scout_nombre, u.apellidos as scout_apellidos,
             s.nombre as seccion_nombre, s.color_principal as seccion_color,
             uc.nombre as confirmador_nombre, uc.apellidos as confirmador_apellidos
      FROM confirmaciones_asistencia ca
      JOIN actividades a ON ca.actividad_id = a.id
      JOIN usuarios u ON ca.scout_id = u.id
      LEFT JOIN secciones s ON u.seccion_id = s.id
      LEFT JOIN usuarios uc ON ca.confirmado_por = uc.id
      WHERE ca.familiar_id = ?
    `;
    const queryParams = [familiarId];

    // Filtros opcionales
    if (options.scout_id) {
      query_str += ' AND ca.scout_id = ?';
      queryParams.push(options.scout_id);
    }

    if (options.asistira !== undefined) {
      query_str += ' AND ca.asistira = ?';
      queryParams.push(options.asistira);
    }

    if (options.estado_actividad) {
      query_str += ' AND a.estado = ?';
      queryParams.push(options.estado_actividad);
    }

    if (options.fecha_desde) {
      query_str += ' AND a.fecha_inicio >= ?';
      queryParams.push(options.fecha_desde);
    }

    if (options.fecha_hasta) {
      query_str += ' AND a.fecha_inicio <= ?';
      queryParams.push(options.fecha_hasta);
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
             u.nombre as scout_nombre, u.apellidos as scout_apellidos,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             uf.email as familiar_email, uf.telefono as familiar_telefono,
             s.nombre as seccion_nombre, s.color_principal as seccion_color,
             uc.nombre as confirmador_nombre, uc.apellidos as confirmador_apellidos
      FROM confirmaciones_asistencia ca
      JOIN usuarios u ON ca.scout_id = u.id
      JOIN usuarios uf ON ca.familiar_id = uf.id
      LEFT JOIN secciones s ON u.seccion_id = s.id
      LEFT JOIN usuarios uc ON ca.confirmado_por = uc.id
      WHERE ca.actividad_id = ?
    `;
    const queryParams = [actividadId];

    if (options.solo_asistiran) {
      query_str += ' AND ca.asistira = true';
    }

    if (options.solo_no_asistiran) {
      query_str += ' AND ca.asistira = false';
    }

    if (options.seccion_id) {
      query_str += ' AND u.seccion_id = ?';
      queryParams.push(options.seccion_id);
    }

    query_str += ' ORDER BY s.nombre, u.nombre, u.apellidos';

    const confirmaciones = await query(query_str, queryParams);
    return confirmaciones;
  } catch (error) {
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
      WHERE ca.scout_id = ?
    `;
    const queryParams = [scoutId];

    if (options.fecha_desde) {
      query_str += ' AND a.fecha_inicio >= ?';
      queryParams.push(options.fecha_desde);
    }

    if (options.fecha_hasta) {
      query_str += ' AND a.fecha_inicio <= ?';
      queryParams.push(options.fecha_hasta);
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
             u.nombre as scout_nombre, u.apellidos as scout_apellidos,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             s.nombre as seccion_nombre, s.color_principal as seccion_color,
             uc.nombre as confirmador_nombre, uc.apellidos as confirmador_apellidos
      FROM confirmaciones_asistencia ca
      JOIN actividades a ON ca.actividad_id = a.id
      JOIN usuarios u ON ca.scout_id = u.id
      JOIN usuarios uf ON ca.familiar_id = uf.id
      LEFT JOIN secciones s ON u.seccion_id = s.id
      LEFT JOIN usuarios uc ON ca.confirmado_por = uc.id
      WHERE ca.id = ?
    `;
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND ca.familiar_id = ?';
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
      WHERE actividad_id = ? AND scout_id = ?
    `;
    const queryParams = [actividadId, scoutId];

    if (familiarId) {
      query_str += ' AND familiar_id = ?';
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
      confirmacionData.scout_id,
      confirmacionData.familiar_id
    );

    if (existente) {
      // Actualizar existente
      let query_str = 'UPDATE confirmaciones_asistencia SET ';
      const queryParams = [];

      if (confirmacionData.asistira !== undefined) {
        query_str += 'asistira = ?, ';
        queryParams.push(confirmacionData.asistira);
      }

      if (confirmacionData.comentarios !== undefined) {
        query_str += 'comentarios = ?, ';
        queryParams.push(confirmacionData.comentarios);
      }

      if (confirmacionData.confirmado_por) {
        query_str += 'confirmado_por = ?, ';
        queryParams.push(confirmacionData.confirmado_por);
      }

      query_str += 'confirmado_en = CURRENT_TIMESTAMP ';
      query_str += 'WHERE actividad_id = ? AND scout_id = ? AND familiar_id = ?';
      queryParams.push(confirmacionData.actividad_id, confirmacionData.scout_id, confirmacionData.familiar_id);

      await query(query_str, queryParams);
      return await findByActividadAndScout(confirmacionData.actividad_id, confirmacionData.scout_id, confirmacionData.familiar_id);
    } else {
      // Crear nueva
      const result = await query(`
        INSERT INTO confirmaciones_asistencia (
          actividad_id, familiar_id, scout_id, asistira, comentarios, confirmado_por
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        confirmacionData.actividad_id,
        confirmacionData.familiar_id,
        confirmacionData.scout_id,
        confirmacionData.asistira,
        confirmacionData.comentarios || null,
        confirmacionData.confirmado_por || null
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
    let query_str = 'DELETE FROM confirmaciones_asistencia WHERE id = ?';
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND familiar_id = ?';
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
        COUNT(CASE WHEN asistira IS NULL THEN 1 END) as sin_confirmar,
        COUNT(DISTINCT scout_id) as scouts_unicos
      FROM confirmaciones_asistencia
      WHERE actividad_id = ?
    `, [actividadId]);

    // Obtener scouts que aún no han confirmado
    const sinConfirmar = await query(`
      SELECT u.id, u.nombre, u.apellidos, s.nombre as seccion_nombre
      FROM usuarios u
      LEFT JOIN secciones s ON u.seccion_id = s.id
      LEFT JOIN confirmaciones_asistencia ca ON u.id = ca.scout_id AND ca.actividad_id = ?
      WHERE u.activo = true AND u.rol = 'educando'
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
      JOIN usuarios u ON u.seccion_id = a.seccion_id
      JOIN familiares_scouts fs ON u.id = fs.scout_id
      LEFT JOIN confirmaciones_asistencia ca ON a.id = ca.actividad_id AND u.id = ca.scout_id
      WHERE fs.familiar_id = ?
      AND a.fecha_inicio BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '? days'
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
             u.nombre as scout_nombre, u.apellidos as scout_apellidos,
             s.nombre as seccion_nombre, s.color_principal as seccion_color
      FROM confirmaciones_asistencia ca
      JOIN actividades a ON ca.actividad_id = a.id
      JOIN usuarios u ON ca.scout_id = u.id
      LEFT JOIN secciones s ON u.seccion_id = s.id
      WHERE ca.familiar_id = ?
      AND a.fecha_inicio BETWEEN ? AND ?
      ORDER BY a.fecha_inicio ASC
    `, [familiarId, fechaInicio, fechaFin]);

    return confirmaciones;
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
  findByRangoFechas
};