const { query } = require('../config/db.config');

/**
 * Obtener la configuración de todos los tipos de notificación
 * GET /api/notificaciones/config
 * Requiere: scouter o admin
 */
const getConfig = async (req, res) => {
  try {
    const result = await query(`
      SELECT id, tipo_notificacion, es_urgente, descripcion, updated_at
      FROM config_notificaciones
      ORDER BY tipo_notificacion ASC
    `);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error obteniendo config notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la configuración de notificaciones',
      error: error.message
    });
  }
};

/**
 * Actualizar la urgencia de un tipo de notificación
 * PUT /api/notificaciones/config/:tipo
 * Requiere: admin
 */
const updateConfig = async (req, res) => {
  try {
    const { tipo } = req.params;
    const { es_urgente } = req.body;

    if (typeof es_urgente !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo es_urgente debe ser un booleano'
      });
    }

    const result = await query(`
      UPDATE config_notificaciones
      SET es_urgente = $1, updated_at = CURRENT_TIMESTAMP
      WHERE tipo_notificacion = $2
      RETURNING *
    `, [es_urgente, tipo]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tipo de notificación '${tipo}' no encontrado`
      });
    }

    res.json({
      success: true,
      message: `Configuración de '${tipo}' actualizada`,
      data: result[0]
    });
  } catch (error) {
    console.error('Error actualizando config notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la configuración',
      error: error.message
    });
  }
};

module.exports = {
  getConfig,
  updateConfig
};
