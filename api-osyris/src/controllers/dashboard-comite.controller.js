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

    // Stats globales (reutiliza modelo existente)
    const statsGlobal = await InscripcionModel.getEstadisticas(id);

    // Desglose por seccion
    const porSeccion = await query(`
      SELECT s.id as seccion_id, s.nombre, s.color_principal,
        COUNT(*) FILTER (WHERE ic.estado IN ('inscrito', 'pendiente')) as inscritos,
        COUNT(*) FILTER (WHERE ic.estado = 'no_asiste') as no_asisten
      FROM inscripciones_campamento ic
      JOIN educandos e ON ic.educando_id = e.id
      JOIN secciones s ON e.seccion_id = s.id
      WHERE ic.actividad_id = $1
      GROUP BY s.id, s.nombre, s.color_principal, s.orden
      ORDER BY s.orden
    `, [id]);

    // Resumen de dietas (reutiliza modelo existente)
    const dietas = await InscripcionModel.getResumenDietas(id);

    // Lista completa de inscripciones
    const inscripciones = await InscripcionModel.findByActividad(id);

    res.json({
      success: true,
      data: {
        actividad,
        stats_global: statsGlobal,
        por_seccion: porSeccion,
        dietas,
        inscripciones
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

    // Obtener inscritos con datos relevantes para cocina
    const rows = await query(`
      SELECT
        e.nombre,
        e.apellidos,
        s.nombre as seccion,
        ic.alergias,
        ic.intolerancias,
        ic.dieta_especial,
        ic.medicacion,
        ic.observaciones_medicas
      FROM inscripciones_campamento ic
      JOIN educandos e ON ic.educando_id = e.id
      JOIN secciones s ON e.seccion_id = s.id
      WHERE ic.actividad_id = $1
        AND ic.estado IN ('inscrito', 'pendiente')
      ORDER BY s.orden ASC, e.apellidos ASC, e.nombre ASC
    `, [id]);

    // Generar CSV manualmente (sin dependencias extra)
    const escapeCSV = (val) => {
      if (val == null || val === '') return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headers = ['Nombre', 'Apellidos', 'Seccion', 'Alergias', 'Intolerancias', 'Dieta Especial', 'Medicacion', 'Observaciones Medicas'];
    const csvLines = [headers.join(',')];

    for (const row of rows) {
      csvLines.push([
        escapeCSV(row.nombre),
        escapeCSV(row.apellidos),
        escapeCSV(row.seccion),
        escapeCSV(row.alergias),
        escapeCSV(row.intolerancias),
        escapeCSV(row.dieta_especial),
        escapeCSV(row.medicacion),
        escapeCSV(row.observaciones_medicas)
      ].join(','));
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
