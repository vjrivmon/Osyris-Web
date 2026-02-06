/**
 * Model: Control de Asistencia In-Situ
 * Issue #6
 * 
 * Maneja el registro de asistencia para campamentos y salidas
 */

const { query } = require('../config/db.config');

/**
 * Obtener lista de asistencia para una actividad
 * Incluye todos los educandos inscritos con su estado de asistencia
 */
const getAsistenciaByActividad = async (actividadId, seccionId = null) => {
  try {
    let sql = `
      SELECT 
        ic.id as inscripcion_id,
        ic.actividad_id,
        ic.educando_id,
        ic.estado as estado_inscripcion,
        e.nombre as educando_nombre,
        e.apellidos as educando_apellidos,
        s.id as seccion_id,
        s.nombre as seccion_nombre,
        s.color_principal as seccion_color,
        COALESCE(aa.ha_llegado, false) as ha_llegado,
        aa.hora_llegada,
        aa.registrado_por,
        ur.nombre as registrado_por_nombre,
        COALESCE(aa.sip_entregado, false) as sip_entregado,
        aa.sip_registrado_por,
        us.nombre as sip_registrado_por_nombre,
        aa.sip_hora_registro,
        aa.observaciones
      FROM inscripciones_campamento ic
      JOIN educandos e ON ic.educando_id = e.id
      JOIN secciones s ON e.seccion_id = s.id
      LEFT JOIN asistencia_actividad aa ON aa.actividad_id = ic.actividad_id AND aa.educando_id = ic.educando_id
      LEFT JOIN usuarios ur ON aa.registrado_por = ur.id
      LEFT JOIN usuarios us ON aa.sip_registrado_por = us.id
      WHERE ic.actividad_id = $1
        AND ic.estado IN ('inscrito', 'pendiente')
    `;
    
    const params = [actividadId];
    
    if (seccionId) {
      sql += ` AND s.id = $2`;
      params.push(seccionId);
    }
    
    sql += ` ORDER BY s.orden ASC NULLS LAST, e.apellidos ASC, e.nombre ASC`;
    
    const result = await query(sql, params);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener estadísticas de asistencia
 */
const getEstadisticasAsistencia = async (actividadId, seccionId = null) => {
  try {
    let sql = `
      SELECT 
        COUNT(DISTINCT ic.educando_id) as total_inscritos,
        COUNT(DISTINCT CASE WHEN aa.ha_llegado = true THEN ic.educando_id END) as han_llegado,
        COUNT(DISTINCT CASE WHEN aa.sip_entregado = true THEN ic.educando_id END) as sip_entregados,
        COUNT(DISTINCT CASE WHEN aa.ha_llegado = true AND aa.sip_entregado = true THEN ic.educando_id END) as completos
      FROM inscripciones_campamento ic
      JOIN educandos e ON ic.educando_id = e.id
      LEFT JOIN asistencia_actividad aa ON aa.actividad_id = ic.actividad_id AND aa.educando_id = ic.educando_id
      WHERE ic.actividad_id = $1
        AND ic.estado IN ('inscrito', 'pendiente')
    `;
    
    const params = [actividadId];
    
    if (seccionId) {
      sql += ` AND e.seccion_id = $2`;
      params.push(seccionId);
    }
    
    const result = await query(sql, params);
    return result[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Marcar llegada de un educando
 */
const marcarLlegada = async (actividadId, educandoId, scouterId, llegado = true) => {
  try {
    const sql = `
      INSERT INTO asistencia_actividad (actividad_id, educando_id, ha_llegado, hora_llegada, registrado_por)
      VALUES ($1, $2, $3, ${llegado ? 'CURRENT_TIMESTAMP' : 'NULL'}, $4)
      ON CONFLICT (actividad_id, educando_id)
      DO UPDATE SET 
        ha_llegado = $3,
        hora_llegada = ${llegado ? 'CURRENT_TIMESTAMP' : 'NULL'},
        registrado_por = $4,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await query(sql, [actividadId, educandoId, llegado, scouterId]);
    return result[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Marcar entrega de SIP
 */
const marcarSIP = async (actividadId, educandoId, scouterId, entregado = true) => {
  try {
    const sql = `
      INSERT INTO asistencia_actividad (actividad_id, educando_id, sip_entregado, sip_hora_registro, sip_registrado_por)
      VALUES ($1, $2, $3, ${entregado ? 'CURRENT_TIMESTAMP' : 'NULL'}, $4)
      ON CONFLICT (actividad_id, educando_id)
      DO UPDATE SET 
        sip_entregado = $3,
        sip_hora_registro = ${entregado ? 'CURRENT_TIMESTAMP' : 'NULL'},
        sip_registrado_por = $4,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await query(sql, [actividadId, educandoId, entregado, scouterId]);
    return result[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar observaciones de un educando
 */
const actualizarObservaciones = async (actividadId, educandoId, observaciones) => {
  try {
    const sql = `
      INSERT INTO asistencia_actividad (actividad_id, educando_id, observaciones)
      VALUES ($1, $2, $3)
      ON CONFLICT (actividad_id, educando_id)
      DO UPDATE SET 
        observaciones = $3,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await query(sql, [actividadId, educandoId, observaciones]);
    return result[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Marcar "No asiste" para un educando que estaba inscrito pero no vino
 */
const marcarNoAsiste = async (actividadId, educandoId, scouterId, observaciones = null) => {
  try {
    const sql = `
      INSERT INTO asistencia_actividad (actividad_id, educando_id, ha_llegado, observaciones, registrado_por)
      VALUES ($1, $2, false, $3, $4)
      ON CONFLICT (actividad_id, educando_id)
      DO UPDATE SET 
        ha_llegado = false,
        hora_llegada = NULL,
        observaciones = COALESCE($3, asistencia_actividad.observaciones),
        registrado_por = $4,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await query(sql, [actividadId, educandoId, observaciones, scouterId]);
    return result[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAsistenciaByActividad,
  getEstadisticasAsistencia,
  marcarLlegada,
  marcarSIP,
  actualizarObservaciones,
  marcarNoAsiste
};
