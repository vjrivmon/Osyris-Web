const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     InscripcionCampamento:
 *       type: object
 *       required:
 *         - actividad_id
 *         - educando_id
 *         - familiar_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la inscripcion
 *         actividad_id:
 *           type: integer
 *           description: ID de la actividad (campamento)
 *         educando_id:
 *           type: integer
 *           description: ID del educando
 *         familiar_id:
 *           type: integer
 *           description: ID del familiar que inscribe
 *         estado:
 *           type: string
 *           enum: [pendiente, inscrito, no_asiste, lista_espera, cancelado]
 *         alergias:
 *           type: string
 *         intolerancias:
 *           type: string
 *         dieta_especial:
 *           type: string
 *         medicacion:
 *           type: string
 *         observaciones_medicas:
 *           type: string
 *         pagado:
 *           type: boolean
 */

/**
 * Obtener todas las inscripciones de un campamento
 */
const findByActividad = async (actividadId, filters = {}) => {
  try {
    let sql = `
      SELECT ic.*,
             e.nombre as educando_nombre,
             e.apellidos as educando_apellidos,
             e.fecha_nacimiento as educando_fecha_nacimiento,
             e.alergias as educando_alergias_ficha,
             e.notas_medicas as educando_notas_medicas_ficha,
             s.nombre as seccion_nombre,
             s.color_principal as seccion_color,
             s.id as seccion_id,
             u.nombre as familiar_nombre,
             u.apellidos as familiar_apellidos,
             u.email as familiar_email,
             u.telefono as familiar_telefono,
             uv.nombre as verificador_nombre,
             uv.apellidos as verificador_apellidos
      FROM inscripciones_campamento ic
      LEFT JOIN educandos e ON ic.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      LEFT JOIN usuarios u ON ic.familiar_id = u.id
      LEFT JOIN usuarios uv ON ic.circular_verificada_por = uv.id
      WHERE ic.actividad_id = $1
    `;
    const params = [actividadId];
    let paramIndex = 2;

    // Filtro por estado
    if (filters.estado) {
      sql += ` AND ic.estado = $${paramIndex}`;
      params.push(filters.estado);
      paramIndex++;
    }

    // Filtro por seccion
    if (filters.seccion_id) {
      sql += ` AND e.seccion_id = $${paramIndex}`;
      params.push(filters.seccion_id);
      paramIndex++;
    }

    // Filtro por pagado
    if (filters.pagado !== undefined) {
      sql += ` AND ic.pagado = $${paramIndex}`;
      params.push(filters.pagado);
      paramIndex++;
    }

    sql += ` ORDER BY s.orden ASC NULLS LAST, e.apellidos ASC, e.nombre ASC`;

    const inscripciones = await query(sql, params);
    return inscripciones;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener inscripciones de un educando
 */
const findByEducando = async (educandoId, filters = {}) => {
  try {
    let sql = `
      SELECT ic.*,
             a.titulo as actividad_titulo,
             a.fecha_inicio as actividad_fecha_inicio,
             a.fecha_fin as actividad_fecha_fin,
             a.lugar as actividad_lugar,
             a.precio as actividad_precio
      FROM inscripciones_campamento ic
      JOIN actividades a ON ic.actividad_id = a.id
      WHERE ic.educando_id = $1
    `;
    const params = [educandoId];
    let paramIndex = 2;

    if (filters.estado) {
      sql += ` AND ic.estado = $${paramIndex}`;
      params.push(filters.estado);
      paramIndex++;
    }

    if (filters.fecha_desde) {
      sql += ` AND a.fecha_inicio >= $${paramIndex}`;
      params.push(filters.fecha_desde);
      paramIndex++;
    }

    sql += ` ORDER BY a.fecha_inicio DESC`;

    const inscripciones = await query(sql, params);
    return inscripciones;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener inscripciones de un familiar (todos sus educandos)
 */
const findByFamiliar = async (familiarId, filters = {}) => {
  try {
    let sql = `
      SELECT ic.*,
             e.nombre as educando_nombre,
             e.apellidos as educando_apellidos,
             a.titulo as actividad_titulo,
             a.fecha_inicio as actividad_fecha_inicio,
             a.fecha_fin as actividad_fecha_fin,
             a.lugar as actividad_lugar,
             a.precio as actividad_precio,
             s.nombre as seccion_nombre
      FROM inscripciones_campamento ic
      JOIN educandos e ON ic.educando_id = e.id
      JOIN actividades a ON ic.actividad_id = a.id
      JOIN secciones s ON e.seccion_id = s.id
      WHERE ic.familiar_id = $1
    `;
    const params = [familiarId];
    let paramIndex = 2;

    if (filters.proximos) {
      sql += ` AND a.fecha_inicio >= CURRENT_DATE`;
    }

    sql += ` ORDER BY a.fecha_inicio ASC`;

    const inscripciones = await query(sql, params);
    return inscripciones;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener una inscripcion por ID
 */
const findById = async (id) => {
  try {
    const inscripciones = await query(`
      SELECT ic.*,
             e.nombre as educando_nombre,
             e.apellidos as educando_apellidos,
             e.fecha_nacimiento as educando_fecha_nacimiento,
             e.alergias as educando_alergias_ficha,
             e.notas_medicas as educando_notas_medicas_ficha,
             s.nombre as seccion_nombre,
             s.color_principal as seccion_color,
             u.nombre as familiar_nombre,
             u.apellidos as familiar_apellidos,
             u.email as familiar_email,
             u.telefono as familiar_telefono,
             a.titulo as actividad_titulo,
             a.fecha_inicio as actividad_fecha_inicio,
             a.fecha_fin as actividad_fecha_fin,
             a.lugar as actividad_lugar,
             a.precio as actividad_precio
      FROM inscripciones_campamento ic
      JOIN educandos e ON ic.educando_id = e.id
      JOIN secciones s ON e.seccion_id = s.id
      JOIN usuarios u ON ic.familiar_id = u.id
      JOIN actividades a ON ic.actividad_id = a.id
      WHERE ic.id = $1
    `, [id]);

    return inscripciones.length ? inscripciones[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Verificar si existe una inscripcion
 */
const findByActividadAndEducando = async (actividadId, educandoId) => {
  try {
    const inscripciones = await query(`
      SELECT * FROM inscripciones_campamento
      WHERE actividad_id = $1 AND educando_id = $2
    `, [actividadId, educandoId]);

    return inscripciones.length ? inscripciones[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear o actualizar una inscripcion
 */
const createOrUpdate = async (inscripcionData) => {
  try {
    // Verificar si ya existe
    const existente = await findByActividadAndEducando(
      inscripcionData.actividad_id,
      inscripcionData.educando_id
    );

    if (existente) {
      // Actualizar existente
      return await update(existente.id, inscripcionData);
    } else {
      // Crear nueva
      return await create(inscripcionData);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Crear una nueva inscripcion
 */
const create = async (inscripcionData) => {
  try {
    const result = await query(`
      INSERT INTO inscripciones_campamento (
        actividad_id, educando_id, familiar_id, estado,
        alergias, intolerancias, dieta_especial,
        medicacion, observaciones_medicas,
        telefono_emergencia, persona_emergencia,
        observaciones, datos_confirmados,
        email_familiar, telefono_familiar, nombre_familiar
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `, [
      inscripcionData.actividad_id,
      inscripcionData.educando_id,
      inscripcionData.familiar_id,
      inscripcionData.estado || 'pendiente',
      inscripcionData.alergias || null,
      inscripcionData.intolerancias || null,
      inscripcionData.dieta_especial || null,
      inscripcionData.medicacion || null,
      inscripcionData.observaciones_medicas || null,
      inscripcionData.telefono_emergencia || null,
      inscripcionData.persona_emergencia || null,
      inscripcionData.observaciones || null,
      inscripcionData.datos_confirmados || false,
      inscripcionData.email_familiar || null,
      inscripcionData.telefono_familiar || null,
      inscripcionData.nombre_familiar || null
    ]);

    const inscripcionId = result.insertId || result[0]?.id;
    return await findById(inscripcionId);
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar una inscripcion
 */
const update = async (id, inscripcionData) => {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updatableFields = [
      'estado', 'alergias', 'intolerancias', 'dieta_especial',
      'medicacion', 'observaciones_medicas', 'telefono_emergencia',
      'persona_emergencia', 'observaciones', 'datos_confirmados',
      'pagado', 'metodo_pago', 'referencia_pago',
      'email_familiar', 'telefono_familiar', 'nombre_familiar',
      'circular_firmada_drive_id', 'circular_firmada_url',
      'justificante_pago_drive_id', 'justificante_pago_url',
      'circular_enviada_seccion', 'justificante_enviado_tesoreria'
    ];

    for (const field of updatableFields) {
      if (inscripcionData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(inscripcionData[field]);
        paramIndex++;
      }
    }

    // Campos especiales con timestamp
    if (inscripcionData.datos_confirmados === true) {
      fields.push(`fecha_confirmacion_datos = CURRENT_TIMESTAMP`);
    }

    if (inscripcionData.pagado === true) {
      fields.push(`fecha_pago = CURRENT_TIMESTAMP`);
    }

    if (inscripcionData.circular_firmada_drive_id) {
      fields.push(`fecha_subida_circular = CURRENT_TIMESTAMP`);
      // Issue #5: Resetear verificación al re-subir circular
      fields.push(`circular_verificada = false`);
      fields.push(`circular_verificada_por = NULL`);
      fields.push(`circular_verificada_fecha = NULL`);
    }

    if (inscripcionData.justificante_pago_drive_id) {
      fields.push(`fecha_subida_justificante = CURRENT_TIMESTAMP`);
    }

    if (inscripcionData.actualizado_por) {
      fields.push(`actualizado_por = $${paramIndex}`);
      values.push(inscripcionData.actualizado_por);
      paramIndex++;
    }

    if (fields.length === 0) {
      return await findById(id);
    }

    values.push(id);
    const sql = `UPDATE inscripciones_campamento SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
    await query(sql, values);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Inscribir (cambiar estado a inscrito)
 */
const inscribir = async (id, datosConfirmados = true) => {
  try {
    await query(`
      UPDATE inscripciones_campamento
      SET estado = 'inscrito',
          datos_confirmados = $2,
          fecha_confirmacion_datos = CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE fecha_confirmacion_datos END
      WHERE id = $1
    `, [id, datosConfirmados]);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Marcar como no asiste
 */
const marcarNoAsiste = async (id, motivo = null) => {
  try {
    await query(`
      UPDATE inscripciones_campamento
      SET estado = 'no_asiste', observaciones = COALESCE($2, observaciones)
      WHERE id = $1
    `, [id, motivo]);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Cancelar inscripción (cambiar estado a cancelado)
 */
const cancelar = async (id, motivo = null) => {
  try {
    // Asegurar que motivo sea string o null, nunca undefined
    const motivoText = motivo && motivo.trim() ? motivo.trim() : null;

    await query(`
      UPDATE inscripciones_campamento
      SET estado = 'cancelado',
          observaciones = CASE
            WHEN $2::text IS NOT NULL AND $2::text != '' THEN COALESCE(observaciones, '') || ' | Motivo cancelación: ' || $2::text
            ELSE observaciones
          END
      WHERE id = $1
    `, [id, motivoText]);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Registrar pago
 */
const registrarPago = async (id, metodoPago = null, referencia = null) => {
  try {
    await query(`
      UPDATE inscripciones_campamento
      SET pagado = true, fecha_pago = CURRENT_TIMESTAMP,
          metodo_pago = $2, referencia_pago = $3
      WHERE id = $1
    `, [id, metodoPago, referencia]);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar una inscripcion
 */
const remove = async (id) => {
  try {
    const result = await query('DELETE FROM inscripciones_campamento WHERE id = $1', [id]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener estadisticas de un campamento
 */
const getEstadisticas = async (actividadId) => {
  try {
    const stats = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE estado = 'inscrito') as inscritos,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'no_asiste') as no_asisten,
        COUNT(*) FILTER (WHERE estado = 'lista_espera') as lista_espera,
        COUNT(*) FILTER (WHERE estado = 'cancelado') as cancelados,
        COUNT(*) FILTER (WHERE pagado = true) as pagados,
        COUNT(*) FILTER (WHERE pagado = false OR pagado IS NULL) as sin_pagar
      FROM inscripciones_campamento
      WHERE actividad_id = $1
    `, [actividadId]);

    return stats[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener resumen de dietas y alergias de un campamento
 */
const getResumenDietas = async (actividadId) => {
  try {
    const inscripciones = await query(`
      SELECT
        e.nombre,
        e.apellidos,
        ic.alergias,
        ic.intolerancias,
        ic.dieta_especial,
        ic.medicacion,
        ic.observaciones_medicas,
        s.nombre as seccion_nombre
      FROM inscripciones_campamento ic
      LEFT JOIN educandos e ON ic.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE ic.actividad_id = $1
        AND ic.estado IN ('inscrito', 'pendiente')
        AND (
          ic.alergias IS NOT NULL AND ic.alergias != '' OR
          ic.intolerancias IS NOT NULL AND ic.intolerancias != '' OR
          ic.dieta_especial IS NOT NULL AND ic.dieta_especial != '' OR
          ic.medicacion IS NOT NULL AND ic.medicacion != ''
        )
      ORDER BY s.orden ASC NULLS LAST, e.apellidos ASC
    `, [actividadId]);

    // Agrupar por tipo de restriccion
    const resumen = {
      con_alergias: inscripciones.filter(i => i.alergias),
      con_intolerancias: inscripciones.filter(i => i.intolerancias),
      con_dieta_especial: inscripciones.filter(i => i.dieta_especial),
      con_medicacion: inscripciones.filter(i => i.medicacion),
      total_con_restricciones: inscripciones.length
    };

    return resumen;
  } catch (error) {
    throw error;
  }
};

/**
 * Prellenar datos de salud desde ficha del educando
 */
const prellenarDatosSalud = async (educandoId) => {
  try {
    const educando = await query(`
      SELECT alergias, notas_medicas
      FROM educandos
      WHERE id = $1
    `, [educandoId]);

    if (educando.length === 0) return null;

    return {
      alergias: educando[0].alergias || '',
      observaciones_medicas: educando[0].notas_medicas || ''
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Verificar una circular (marcar como verificada por scouter)
 */
const verificarCircular = async (inscripcionId, scouterId) => {
  try {
    await query(`
      UPDATE inscripciones_campamento
      SET circular_verificada = true,
          circular_verificada_por = $2,
          circular_verificada_fecha = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [inscripcionId, scouterId]);

    return await findById(inscripcionId);
  } catch (error) {
    throw error;
  }
};

/**
 * Resetear verificación de circular (cuando se re-sube)
 */
const resetVerificacionCircular = async (inscripcionId) => {
  try {
    await query(`
      UPDATE inscripciones_campamento
      SET circular_verificada = false,
          circular_verificada_por = NULL,
          circular_verificada_fecha = NULL
      WHERE id = $1
    `, [inscripcionId]);

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener circulares pendientes de verificación (para panel de scouters)
 * Filtra por sección si se proporciona
 */
const getCircularesPendientesVerificacion = async (actividadId, seccionId = null) => {
  try {
    let sql = `
      SELECT ic.id,
             ic.actividad_id,
             ic.educando_id,
             ic.circular_firmada_drive_id,
             ic.circular_firmada_url,
             ic.fecha_subida_circular,
             ic.circular_verificada,
             ic.circular_verificada_por,
             ic.circular_verificada_fecha,
             ic.pagado,
             ic.estado,
             e.nombre as educando_nombre,
             e.apellidos as educando_apellidos,
             s.nombre as seccion_nombre,
             s.id as seccion_id,
             s.color_principal as seccion_color,
             u.nombre as familiar_nombre,
             u.apellidos as familiar_apellidos,
             uv.nombre as verificador_nombre,
             uv.apellidos as verificador_apellidos
      FROM inscripciones_campamento ic
      JOIN educandos e ON ic.educando_id = e.id
      JOIN secciones s ON e.seccion_id = s.id
      LEFT JOIN usuarios u ON ic.familiar_id = u.id
      LEFT JOIN usuarios uv ON ic.circular_verificada_por = uv.id
      WHERE ic.actividad_id = $1
        AND ic.circular_firmada_drive_id IS NOT NULL
        AND ic.estado IN ('inscrito', 'pendiente')
    `;
    const params = [actividadId];

    if (seccionId) {
      sql += ` AND s.id = $2`;
      params.push(seccionId);
    }

    sql += ` ORDER BY ic.circular_verificada ASC, ic.fecha_subida_circular DESC`;

    const circulares = await query(sql, params);
    return circulares;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener estadísticas de verificación de circulares
 */
const getEstadisticasVerificacion = async (actividadId, seccionId = null) => {
  try {
    let sql = `
      SELECT
        COUNT(*) FILTER (WHERE ic.circular_firmada_drive_id IS NOT NULL) as total_subidas,
        COUNT(*) FILTER (WHERE ic.circular_verificada = true) as verificadas,
        COUNT(*) FILTER (WHERE ic.circular_firmada_drive_id IS NOT NULL AND (ic.circular_verificada = false OR ic.circular_verificada IS NULL)) as pendientes_verificar,
        COUNT(*) FILTER (WHERE ic.circular_firmada_drive_id IS NULL AND ic.estado IN ('inscrito', 'pendiente')) as sin_subir
      FROM inscripciones_campamento ic
      JOIN educandos e ON ic.educando_id = e.id
      WHERE ic.actividad_id = $1
        AND ic.estado IN ('inscrito', 'pendiente')
    `;
    const params = [actividadId];

    if (seccionId) {
      sql += ` AND e.seccion_id = $2`;
      params.push(seccionId);
    }

    const stats = await query(sql, params);
    return stats[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findByActividad,
  findByEducando,
  findByFamiliar,
  findById,
  findByActividadAndEducando,
  createOrUpdate,
  create,
  update,
  inscribir,
  marcarNoAsiste,
  cancelar,
  registrarPago,
  remove,
  getEstadisticas,
  getResumenDietas,
  prellenarDatosSalud,
  verificarCircular,
  resetVerificacionCircular,
  getCircularesPendientesVerificacion,
  getEstadisticasVerificacion
};
