const { query } = require('../config/db.config');
const InscripcionModel = require('../models/inscripcion-campamento.model');

/**
 * Obtener lista de campamentos disponibles (proximos y recientes)
 */
const getCampamentos = async (req, res) => {
  try {
    const campamentos = await query(`
      SELECT a.id, a.titulo, a.fecha_inicio, a.fecha_fin, a.lugar,
        (SELECT COUNT(*) FROM inscripciones_campamento ic
         WHERE ic.actividad_id = a.id AND ic.estado IN ('inscrito', 'pendiente')) as total_inscritos
      FROM actividades a
      WHERE a.tipo = 'campamento'
        AND a.fecha_inicio >= CURRENT_DATE - INTERVAL '30 days'
        AND (a.estado IS NULL OR a.estado != 'cancelado')
      ORDER BY a.fecha_inicio ASC
    `);

    res.json({
      success: true,
      data: campamentos
    });
  } catch (error) {
    console.error('Error getCampamentos comite:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener campamentos',
      error: error.message
    });
  }
};

/**
 * Obtener detalle completo de un campamento:
 * - Stats globales
 * - Desglose por seccion
 * - Resumen de dietas/alergias
 * - Lista completa de inscripciones
 */
const getCampamentoDetalle = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la actividad existe
    const actividades = await query(
      'SELECT id, titulo, fecha_inicio, fecha_fin, lugar FROM actividades WHERE id = $1',
      [id]
    );

    if (actividades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campamento no encontrado'
      });
    }

    const actividad = actividades[0];

    // Cada sub-query en try/catch independiente para resiliencia
    const _debug_errors = [];

    let statsGlobal = { total: 0, inscritos: 0, pendientes: 0, lista_espera: 0, cancelados: 0, pagados: 0, sin_pagar: 0 };
    try {
      statsGlobal = await InscripcionModel.getEstadisticas(id);
    } catch (err) {
      console.error('Error getEstadisticas campamento', id, ':', err.message);
      _debug_errors.push({ query: 'statsGlobal', error: err.message });
    }

    let porSeccion = [];
    try {
      porSeccion = await query(`
        SELECT s.id as seccion_id, COALESCE(s.nombre, 'Sin sección') as nombre, s.color_principal,
          COUNT(*) FILTER (WHERE ic.estado IN ('inscrito', 'pendiente')) as inscritos
        FROM inscripciones_campamento ic
        LEFT JOIN educandos e ON ic.educando_id = e.id
        LEFT JOIN secciones s ON e.seccion_id = s.id
        WHERE ic.actividad_id = $1
        GROUP BY s.id, s.nombre, s.color_principal, s.orden
        ORDER BY s.orden NULLS LAST
      `, [id]);
    } catch (err) {
      console.error('Error porSeccion campamento', id, ':', err.message);
      _debug_errors.push({ query: 'porSeccion', error: err.message });
    }

    let dietas = { con_alergias: [], con_intolerancias: [], con_dieta_especial: [], con_medicacion: [], total_con_restricciones: 0 };
    try {
      dietas = await InscripcionModel.getResumenDietas(id);
    } catch (err) {
      console.error('Error getResumenDietas campamento', id, ':', err.message);
      _debug_errors.push({ query: 'dietas', error: err.message });
    }

    let inscripciones = [];
    try {
      inscripciones = await InscripcionModel.findByActividad(id);
    } catch (err) {
      console.error('Error findByActividad campamento', id, ':', err.message);
      _debug_errors.push({ query: 'inscripciones', error: err.message });
    }

    res.json({
      success: true,
      data: {
        actividad,
        stats_global: statsGlobal,
        por_seccion: porSeccion,
        dietas,
        inscripciones,
        ..._debug_errors.length > 0 ? { _debug_errors } : {}
      }
    });
  } catch (error) {
    console.error('Error getCampamentoDetalle comite:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle del campamento',
      error: error.message
    });
  }
};

/**
 * Exportar CSV de asistencia de un campamento
 */
const exportCSV = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener titulo del campamento
    const actividades = await query(
      'SELECT titulo FROM actividades WHERE id = $1',
      [id]
    );

    if (actividades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campamento no encontrado'
      });
    }

    const titulo = actividades[0].titulo;

    // Filtros opcionales
    const { secciones, solo_restricciones } = req.query;
    const params = [id];
    let extraWhere = '';

    if (secciones) {
      const seccionIds = secciones.split(',').map(Number).filter(n => !isNaN(n) && n > 0);
      if (seccionIds.length > 0) {
        params.push(seccionIds);
        extraWhere += ` AND e.seccion_id = ANY($${params.length})`;
      }
    }

    if (solo_restricciones === 'true') {
      extraWhere += ` AND (
        (ic.alergias IS NOT NULL AND ic.alergias != '') OR
        (ic.intolerancias IS NOT NULL AND ic.intolerancias != '') OR
        (ic.dieta_especial IS NOT NULL AND ic.dieta_especial != '') OR
        (ic.medicacion IS NOT NULL AND ic.medicacion != '')
      )`;
    }

    // Obtener inscritos con datos relevantes para cocina
    const rows = await query(`
      SELECT
        e.nombre,
        e.apellidos,
        COALESCE(s.nombre, 'Sin seccion') as seccion,
        ic.estado,
        ic.alergias,
        ic.intolerancias,
        ic.dieta_especial,
        ic.medicacion,
        ic.observaciones_medicas
      FROM inscripciones_campamento ic
      LEFT JOIN educandos e ON ic.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE ic.actividad_id = $1
        AND ic.estado IN ('inscrito', 'pendiente')
        ${extraWhere}
      ORDER BY s.orden ASC NULLS LAST, e.apellidos ASC, e.nombre ASC
    `, params);

    // Generar CSV con separador ; para compatibilidad directa con Excel
    const SEP = ';';
    const escapeCSV = (val) => {
      if (val == null || val === '') return '';
      const str = String(val);
      if (str.includes(SEP) || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headers = ['Nombre', 'Apellidos', 'Seccion', 'Estado', 'Alergias', 'Intolerancias', 'Dieta Especial', 'Medicacion', 'Observaciones Medicas'];
    const csvLines = ['sep=' + SEP, headers.join(SEP)];

    for (const row of rows) {
      csvLines.push([
        escapeCSV(row.nombre),
        escapeCSV(row.apellidos),
        escapeCSV(row.seccion),
        escapeCSV(row.estado),
        escapeCSV(row.alergias),
        escapeCSV(row.intolerancias),
        escapeCSV(row.dieta_especial),
        escapeCSV(row.medicacion),
        escapeCSV(row.observaciones_medicas)
      ].join(SEP));
    }

    const csvContent = '\uFEFF' + csvLines.join('\r\n'); // BOM for Excel UTF-8

    const safeTitle = titulo.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=asistencia-${safeTitle}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exportCSV comite:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar CSV',
      error: error.message
    });
  }
};

module.exports = {
  getCampamentos,
  getCampamentoDetalle,
  exportCSV
};
