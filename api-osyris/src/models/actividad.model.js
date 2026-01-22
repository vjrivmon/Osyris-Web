const { query } = require('../config/db.config');

/**
 * Formatear fecha a string YYYY-MM-DD sin problemas de timezone
 * PostgreSQL devuelve timestamps en UTC, lo que causa que medianoche España
 * se convierta a 23:00 UTC del día anterior. Esta función corrige eso.
 */
const formatearFechaLocal = (fecha) => {
  if (!fecha) return null;

  // Si ya es string en formato ISO, extraer solo la parte de fecha
  if (typeof fecha === 'string') {
    // Convertir a Date y extraer componentes locales
    const d = new Date(fecha);
    // Usar toLocaleDateString con zona horaria de España para obtener el día correcto
    const año = d.toLocaleString('es-ES', { year: 'numeric', timeZone: 'Europe/Madrid' });
    const mes = d.toLocaleString('es-ES', { month: '2-digit', timeZone: 'Europe/Madrid' });
    const dia = d.toLocaleString('es-ES', { day: '2-digit', timeZone: 'Europe/Madrid' });
    return `${año}-${mes}-${dia}`;
  }

  // Si es objeto Date
  if (fecha instanceof Date) {
    const año = fecha.toLocaleString('es-ES', { year: 'numeric', timeZone: 'Europe/Madrid' });
    const mes = fecha.toLocaleString('es-ES', { month: '2-digit', timeZone: 'Europe/Madrid' });
    const dia = fecha.toLocaleString('es-ES', { day: '2-digit', timeZone: 'Europe/Madrid' });
    return `${año}-${mes}-${dia}`;
  }

  return null;
};

/**
 * Transformar actividad para respuesta API (corregir fechas)
 */
const transformarActividad = (actividad) => {
  if (!actividad) return null;

  return {
    ...actividad,
    // Sobrescribir fechas con formato correcto
    fecha_inicio: formatearFechaLocal(actividad.fecha_inicio),
    fecha_fin: formatearFechaLocal(actividad.fecha_fin),
    fecha_limite_inscripcion: formatearFechaLocal(actividad.fecha_limite_inscripcion)
  };
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Actividad:
 *       type: object
 *       required:
 *         - titulo
 *         - tipo
 *         - fecha_inicio
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la actividad
 *         titulo:
 *           type: string
 *           description: Titulo de la actividad
 *         descripcion:
 *           type: string
 *           description: Descripcion detallada
 *         fecha_inicio:
 *           type: string
 *           format: date-time
 *         fecha_fin:
 *           type: string
 *           format: date-time
 *         hora_inicio:
 *           type: string
 *           format: time
 *         hora_fin:
 *           type: string
 *           format: time
 *         lugar:
 *           type: string
 *         tipo:
 *           type: string
 *           enum: [reunion_sabado, campamento, salida, excursion, evento_especial, asamblea, festivo, consejo_grupo, reunion_kraal, formacion, otro]
 *         seccion_id:
 *           type: integer
 *         visibilidad:
 *           type: string
 *           enum: [todos, familias, kraal]
 *         requiere_confirmacion:
 *           type: boolean
 *         requiere_inscripcion:
 *           type: boolean
 *         precio:
 *           type: number
 *         cancelado:
 *           type: boolean
 */

// Configuracion de tipos de eventos con sus colores e iconos
const TIPOS_EVENTO = {
  reunion_sabado: {
    label: 'Reunion',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    dotColor: 'bg-blue-500',
    icon: 'Users'
  },
  campamento: {
    label: 'Campamento',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    dotColor: 'bg-green-500',
    icon: 'Tent'
  },
  salida: {
    label: 'Salida',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    dotColor: 'bg-purple-500',
    icon: 'MapPin'
  },
  excursion: {
    label: 'Excursion',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    dotColor: 'bg-purple-500',
    icon: 'MapPin'
  },
  evento_especial: {
    label: 'Evento Especial',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    dotColor: 'bg-orange-500',
    icon: 'Star'
  },
  asamblea: {
    label: 'Asamblea',
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-300',
    dotColor: 'bg-indigo-500',
    icon: 'Users2'
  },
  festivo: {
    label: 'Festivo',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-400',
    icon: 'Calendar'
  },
  consejo_grupo: {
    label: 'Consejo',
    color: 'slate',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    dotColor: 'bg-slate-500',
    icon: 'Briefcase'
  },
  reunion_kraal: {
    label: 'Reunion Kraal',
    color: 'violet',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-300',
    dotColor: 'bg-violet-500',
    icon: 'UserCog'
  },
  formacion: {
    label: 'Formacion',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    dotColor: 'bg-yellow-500',
    icon: 'GraduationCap'
  },
  otro: {
    label: 'Otro',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-500',
    icon: 'Calendar'
  }
};

/**
 * Obtener todas las actividades con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} filters.seccion_stats_id - Si se proporciona, filtra las estadísticas de confirmación
 *                                            para mostrar solo los educandos de esta sección
 */
const findAll = async (filters = {}) => {
  try {
    // Si se proporciona seccion_stats_id, las estadísticas de confirmación se filtran por sección
    // Esto permite que cada kraal vea solo la asistencia de su sección
    const seccionStatsFilter = filters.seccion_stats_id
      ? `JOIN educandos e ON ca.educando_id = e.id WHERE e.seccion_id = ${parseInt(filters.seccion_stats_id)}`
      : '';

    let sql = `
      SELECT a.*,
             s.nombre as seccion_nombre,
             s.color_principal as seccion_color,
             u.nombre as responsable_nombre,
             u.apellidos as responsable_apellidos,
             uc.nombre as creador_nombre,
             uc.apellidos as creador_apellidos,
             COALESCE(conf.total_confirmados, 0) as confirmados,
             COALESCE(conf.total_no_asisten, 0) as no_asisten,
             COALESCE(conf.total_pendientes, 0) as pendientes
      FROM actividades a
      LEFT JOIN secciones s ON a.seccion_id = s.id
      LEFT JOIN usuarios u ON a.responsable_id = u.id
      LEFT JOIN usuarios uc ON a.creado_por = uc.id
      LEFT JOIN (
        SELECT
          ca.actividad_id,
          COUNT(*) FILTER (WHERE ca.estado = 'confirmado') as total_confirmados,
          COUNT(*) FILTER (WHERE ca.estado = 'no_asiste') as total_no_asisten,
          COUNT(*) FILTER (WHERE ca.estado = 'pendiente') as total_pendientes
        FROM confirmaciones_asistencia ca
        ${seccionStatsFilter}
        GROUP BY ca.actividad_id
      ) conf ON a.id = conf.actividad_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filtro por seccion
    // Las reuniones de sabado y campamentos comunes se muestran a TODAS las familias
    // Campamentos comunes: Navidad, Aniversario, Verano (todas las secciones)
    // Campamento Pascua: Solo Castores (1), Manada (2), Tropa (3)
    if (filters.seccion_id) {
      sql += ` AND (
        a.seccion_id = $${paramIndex}
        OR a.seccion_id IS NULL
        OR a.tipo = 'reunion_sabado'
        OR (a.tipo = 'campamento' AND (
          LOWER(a.titulo) LIKE '%navidad%'
          OR LOWER(a.titulo) LIKE '%aniversario%'
          OR LOWER(a.titulo) LIKE '%verano%'
        ))
        OR (a.tipo = 'campamento' AND LOWER(a.titulo) LIKE '%pascua%' AND $${paramIndex} IN (1, 2, 3))
      )`;
      params.push(filters.seccion_id);
      paramIndex++;
    }

    // Filtro por tipo
    if (filters.tipo) {
      sql += ` AND a.tipo = $${paramIndex}`;
      params.push(filters.tipo);
      paramIndex++;
    }

    // Filtro por visibilidad (familias vs kraal)
    if (filters.visibilidad) {
      if (filters.visibilidad === 'familias') {
        sql += ` AND a.visibilidad IN ('todos', 'familias')`;
      } else if (filters.visibilidad === 'kraal') {
        // Kraal ve todo
        sql += ` AND a.visibilidad IN ('todos', 'familias', 'kraal')`;
      }
    }

    // Filtro por rango de fechas
    if (filters.fecha_desde) {
      sql += ` AND a.fecha_inicio >= $${paramIndex}`;
      params.push(filters.fecha_desde);
      paramIndex++;
    }

    if (filters.fecha_hasta) {
      sql += ` AND a.fecha_inicio <= $${paramIndex}`;
      params.push(filters.fecha_hasta);
      paramIndex++;
    }

    // Filtro por mes especifico
    if (filters.mes && filters.anio) {
      sql += ` AND EXTRACT(MONTH FROM a.fecha_inicio) = $${paramIndex}`;
      sql += ` AND EXTRACT(YEAR FROM a.fecha_inicio) = $${paramIndex + 1}`;
      params.push(filters.mes, filters.anio);
      paramIndex += 2;
    }

    // Excluir cancelados por defecto
    if (filters.incluir_cancelados !== true) {
      sql += ` AND (a.cancelado = false OR a.cancelado IS NULL)`;
    }

    // Filtro por estado
    if (filters.estado) {
      sql += ` AND a.estado = $${paramIndex}`;
      params.push(filters.estado);
      paramIndex++;
    }

    // Ordenar por fecha
    sql += ` ORDER BY a.fecha_inicio ASC`;

    // Limite
    if (filters.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
      paramIndex++;
    }

    const actividades = await query(sql, params);

    // Agregar configuracion de tipo a cada actividad y transformar fechas
    return actividades.map(a => transformarActividad({
      ...a,
      tipo_config: TIPOS_EVENTO[a.tipo] || TIPOS_EVENTO.otro
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener proximas actividades
 */
const findProximas = async (filters = {}) => {
  const hoy = new Date();
  const limite = filters.dias || 30;
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + limite);

  return findAll({
    ...filters,
    fecha_desde: hoy.toISOString(),
    fecha_hasta: fechaLimite.toISOString(),
    limit: filters.limit || 10
  });
};

/**
 * Obtener una actividad por ID
 */
const findById = async (id) => {
  try {
    const actividades = await query(`
      SELECT a.*,
             s.nombre as seccion_nombre,
             s.descripcion as seccion_descripcion,
             s.color_principal as seccion_color,
             u.nombre as responsable_nombre,
             u.apellidos as responsable_apellidos,
             u.email as responsable_email,
             uc.nombre as creador_nombre,
             uc.apellidos as creador_apellidos
      FROM actividades a
      LEFT JOIN secciones s ON a.seccion_id = s.id
      LEFT JOIN usuarios u ON a.responsable_id = u.id
      LEFT JOIN usuarios uc ON a.creado_por = uc.id
      WHERE a.id = $1
    `, [id]);

    if (actividades.length === 0) return null;

    const actividad = actividades[0];
    actividad.tipo_config = TIPOS_EVENTO[actividad.tipo] || TIPOS_EVENTO.otro;

    return transformarActividad(actividad);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener actividad con estadisticas de confirmacion
 */
const findByIdWithStats = async (id) => {
  try {
    const actividad = await findById(id);
    if (!actividad) return null;

    // Obtener estadisticas de confirmacion
    const stats = await query(`
      SELECT
        COUNT(*) FILTER (WHERE estado = 'confirmado') as confirmados,
        COUNT(*) FILTER (WHERE estado = 'no_asiste') as no_asisten,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes
      FROM confirmaciones_asistencia
      WHERE actividad_id = $1
    `, [id]);

    // Si es campamento, obtener estadisticas de inscripcion
    let inscripcionStats = null;
    if (actividad.tipo === 'campamento') {
      const inscStats = await query(`
        SELECT
          COUNT(*) FILTER (WHERE estado = 'inscrito') as total_inscritos,
          COUNT(*) FILTER (WHERE estado = 'pendiente') as total_pendientes,
          COUNT(*) FILTER (WHERE estado = 'no_asiste') as total_no_asisten,
          COUNT(*) FILTER (WHERE estado = 'lista_espera') as total_lista_espera
        FROM inscripciones_campamento
        WHERE actividad_id = $1
      `, [id]);
      inscripcionStats = inscStats[0];
    }

    return transformarActividad({
      ...actividad,
      confirmaciones: stats[0],
      inscripciones: inscripcionStats
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Crear una nueva actividad
 */
const create = async (actividadData) => {
  try {
    const result = await query(`
      INSERT INTO actividades (
        titulo, descripcion, fecha_inicio, fecha_fin,
        hora_inicio, hora_fin, lugar, tipo,
        seccion_id, responsable_id, visibilidad,
        requiere_confirmacion, requiere_inscripcion,
        fecha_limite_inscripcion, cupo_maximo, precio,
        material_necesario, observaciones, documentos_drive,
        metadata, ronda_id, estado, creado_por,
        lugar_salida, hora_salida, mapa_salida_url,
        lugar_regreso, hora_regreso, numero_cuenta,
        concepto_pago, recordatorios_predefinidos,
        recordatorios_personalizados, circular_drive_id,
        circular_drive_url, circular_nombre, sheets_inscripciones_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
      RETURNING id
    `, [
      actividadData.titulo,
      actividadData.descripcion || null,
      actividadData.fecha_inicio,
      actividadData.fecha_fin || actividadData.fecha_inicio,
      actividadData.hora_inicio || null,
      actividadData.hora_fin || null,
      actividadData.lugar || null,
      actividadData.tipo || 'otro',
      actividadData.seccion_id || null,
      actividadData.responsable_id || null,
      actividadData.visibilidad || 'todos',
      actividadData.requiere_confirmacion !== false,
      actividadData.requiere_inscripcion || false,
      actividadData.fecha_limite_inscripcion || null,
      actividadData.cupo_maximo || null,
      actividadData.precio || null,
      actividadData.material_necesario || null,
      actividadData.observaciones || null,
      JSON.stringify(actividadData.documentos_drive || []),
      JSON.stringify(actividadData.metadata || {}),
      actividadData.ronda_id || null,
      actividadData.estado || 'planificada',
      actividadData.creado_por || null,
      // Campamento fields
      actividadData.lugar_salida || null,
      actividadData.hora_salida || null,
      actividadData.mapa_salida_url || null,
      actividadData.lugar_regreso || null,
      actividadData.hora_regreso || null,
      actividadData.numero_cuenta || null,
      actividadData.concepto_pago || null,
      JSON.stringify(actividadData.recordatorios_predefinidos || []),
      actividadData.recordatorios_personalizados || [],
      actividadData.circular_drive_id || null,
      actividadData.circular_drive_url || null,
      actividadData.circular_nombre || null,
      actividadData.sheets_inscripciones_id || null
    ]);

    // query() returns { insertId, changes } for INSERT statements
    const actividadId = result.insertId || result[0]?.id;
    return await findById(actividadId);
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar una actividad
 */
const update = async (id, actividadData) => {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updatableFields = [
      'titulo', 'descripcion', 'fecha_inicio', 'fecha_fin',
      'hora_inicio', 'hora_fin', 'lugar', 'tipo',
      'seccion_id', 'responsable_id', 'visibilidad',
      'requiere_confirmacion', 'requiere_inscripcion',
      'fecha_limite_inscripcion', 'cupo_maximo', 'precio',
      'material_necesario', 'observaciones', 'estado',
      'cancelado', 'motivo_cancelacion',
      // Campamento fields
      'lugar_salida', 'hora_salida', 'mapa_salida_url',
      'lugar_regreso', 'hora_regreso', 'numero_cuenta',
      'concepto_pago', 'circular_drive_id', 'circular_drive_url',
      'circular_nombre', 'sheets_inscripciones_id'
    ];

    for (const field of updatableFields) {
      if (actividadData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(actividadData[field]);
        paramIndex++;
      }
    }

    // Campos JSON
    if (actividadData.documentos_drive !== undefined) {
      fields.push(`documentos_drive = $${paramIndex}`);
      values.push(JSON.stringify(actividadData.documentos_drive));
      paramIndex++;
    }

    if (actividadData.metadata !== undefined) {
      fields.push(`metadata = $${paramIndex}`);
      values.push(JSON.stringify(actividadData.metadata));
      paramIndex++;
    }

    // Campos JSONB de campamento
    if (actividadData.recordatorios_predefinidos !== undefined) {
      fields.push(`recordatorios_predefinidos = $${paramIndex}`);
      values.push(JSON.stringify(actividadData.recordatorios_predefinidos));
      paramIndex++;
    }

    // Campos TEXT[] de campamento
    if (actividadData.recordatorios_personalizados !== undefined) {
      fields.push(`recordatorios_personalizados = $${paramIndex}`);
      values.push(actividadData.recordatorios_personalizados);
      paramIndex++;
    }

    if (fields.length === 0) {
      return await findById(id);
    }

    values.push(id);
    const sql = `UPDATE actividades SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
    await query(sql, values);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Cancelar una actividad
 */
const cancelar = async (id, motivo = null) => {
  try {
    await query(`
      UPDATE actividades
      SET cancelado = true, motivo_cancelacion = $2, estado = 'cancelada'
      WHERE id = $1
    `, [id, motivo]);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar una actividad
 */
const remove = async (id) => {
  try {
    const result = await query('DELETE FROM actividades WHERE id = $1', [id]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener actividades por mes para calendario
 */
const findByMes = async (anio, mes, filters = {}) => {
  return findAll({
    ...filters,
    mes,
    anio
  });
};

/**
 * Obtener actividades para un educando (por su seccion + eventos generales)
 */
const findForEducando = async (educandoId) => {
  try {
    const actividades = await query(`
      SELECT a.*,
             s.nombre as seccion_nombre,
             s.color_principal as seccion_color,
             ca.estado as mi_estado_confirmacion,
             ca.comentarios as mi_comentario
      FROM actividades a
      LEFT JOIN secciones s ON a.seccion_id = s.id
      LEFT JOIN educandos e ON e.id = $1
      LEFT JOIN confirmaciones_asistencia ca ON ca.actividad_id = a.id AND ca.educando_id = $1
      WHERE (
        a.seccion_id = e.seccion_id
        OR a.seccion_id IS NULL
        OR a.tipo = 'reunion_sabado'
        OR (a.tipo = 'campamento' AND (
          LOWER(a.titulo) LIKE '%navidad%'
          OR LOWER(a.titulo) LIKE '%aniversario%'
          OR LOWER(a.titulo) LIKE '%verano%'
        ))
        OR (a.tipo = 'campamento' AND LOWER(a.titulo) LIKE '%pascua%' AND e.seccion_id IN (1, 2, 3))
      )
        AND a.visibilidad IN ('todos', 'familias')
        AND (a.cancelado = false OR a.cancelado IS NULL)
        AND a.fecha_inicio >= CURRENT_DATE
      ORDER BY a.fecha_inicio ASC
    `, [educandoId]);

    return actividades.map(a => transformarActividad({
      ...a,
      tipo_config: TIPOS_EVENTO[a.tipo] || TIPOS_EVENTO.otro
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener configuracion de tipos de evento
 */
const getTiposEvento = () => {
  return TIPOS_EVENTO;
};

module.exports = {
  findAll,
  findProximas,
  findById,
  findByIdWithStats,
  create,
  update,
  cancelar,
  remove,
  findByMes,
  findForEducando,
  getTiposEvento,
  TIPOS_EVENTO
};
