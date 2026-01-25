/**
 * Controlador de notificaciones para scouters
 * Maneja las notificaciones de documentos pendientes filtradas por sección
 */

const notificacionesScouterModel = require('../models/notificaciones_scouter.model');
const documentosFamiliaModel = require('../models/documentos_familia.model');

/**
 * Obtiene las notificaciones del scouter logueado
 * Filtradas por su sección asignada
 */
const getNotificaciones = async (req, res) => {
  try {
    const userId = req.usuario?.id || req.user?.id;
    const { soloNoLeidas, tipo, limit } = req.query;

    const options = {
      soloNoLeidas: soloNoLeidas === 'true',
      tipo: tipo || null,
      limit: limit ? parseInt(limit) : null
    };

    const notificaciones = await notificacionesScouterModel.findByScouterId(userId, options);

    res.json({
      success: true,
      data: notificaciones,
      total: notificaciones.length
    });
  } catch (error) {
    console.error('Error obteniendo notificaciones scouter:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
};

/**
 * Obtiene el contador de notificaciones no leídas
 */
const getContadorNoLeidas = async (req, res) => {
  try {
    const userId = req.usuario?.id || req.user?.id;

    // Obtener sección del scouter
    const { query } = require('../config/db.config');
    const scouterResult = await query(`
      SELECT seccion_id, rol FROM usuarios WHERE id = $1
    `, [userId]);

    if (scouterResult.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    const { seccion_id, rol } = scouterResult[0];

    let count = 0;
    if (rol === 'admin' && !seccion_id) {
      // Admin sin sección: contar todas
      const result = await query(`
        SELECT COUNT(*) as count FROM notificaciones_scouter WHERE leida = false
      `);
      count = parseInt(result[0].count);
    } else if (seccion_id) {
      count = await notificacionesScouterModel.contarNoLeidasPorSeccion(seccion_id);
    }

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error contando notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al contar notificaciones',
      error: error.message
    });
  }
};

/**
 * Marca una notificación como leída
 */
const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await notificacionesScouterModel.marcarComoLeida(id);

    res.json({
      success: true,
      data: notificacion
    });
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación',
      error: error.message
    });
  }
};

/**
 * Obtiene documentos pendientes de revisión para el scouter
 * Filtrados por la sección del scouter logueado
 */
const getDocumentosPendientes = async (req, res) => {
  try {
    const userId = req.usuario?.id || req.user?.id;

    const { query } = require('../config/db.config');

    // Obtener sección del scouter
    const scouterResult = await query(`
      SELECT seccion_id, rol FROM usuarios WHERE id = $1
    `, [userId]);

    if (scouterResult.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const { seccion_id, rol } = scouterResult[0];

    // Query para documentos pendientes
    let sql = `
      SELECT
        df.*,
        e.nombre as educando_nombre,
        e.apellidos as educando_apellidos,
        e.seccion_id,
        s.nombre as seccion_nombre,
        s.color_principal as seccion_color
      FROM documentos_familia df
      JOIN educandos e ON df.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE df.estado = 'pendiente_revision'
    `;
    const params = [];

    // Filtrar por sección si no es admin global
    if (rol !== 'admin' && seccion_id) {
      sql += ` AND e.seccion_id = $1`;
      params.push(seccion_id);
    } else if (rol !== 'admin' && !seccion_id) {
      // Scouter sin sección asignada
      return res.json({
        success: true,
        data: [],
        total: 0,
        message: 'No tienes una sección asignada'
      });
    }

    sql += ` ORDER BY df.fecha_subida DESC`;

    const documentos = await query(sql, params);

    res.json({
      success: true,
      data: documentos,
      total: documentos.length,
      seccion_id: seccion_id
    });
  } catch (error) {
    console.error('Error obteniendo documentos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentos pendientes',
      error: error.message
    });
  }
};

/**
 * Elimina una notificación individual
 * Verifica que pertenezca a la sección del scouter
 */
const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.usuario?.id || req.user?.id;

    const { query } = require('../config/db.config');

    // Obtener sección del scouter
    const scouterResult = await query(`
      SELECT seccion_id, rol FROM usuarios WHERE id = $1
    `, [userId]);

    if (scouterResult.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const { seccion_id, rol } = scouterResult[0];

    // Verificar que la notificación pertenece a la sección del scouter (o es admin)
    const notifResult = await query(`
      SELECT seccion_id FROM notificaciones_scouter WHERE id = $1
    `, [id]);

    if (notifResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    if (rol !== 'admin' && notifResult[0].seccion_id !== seccion_id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta notificación'
      });
    }

    await notificacionesScouterModel.remove(id);

    res.json({
      success: true,
      message: 'Notificación eliminada'
    });
  } catch (error) {
    console.error('Error eliminando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar notificación',
      error: error.message
    });
  }
};

/**
 * Elimina todas las notificaciones leídas del scouter
 */
const eliminarTodasLeidas = async (req, res) => {
  try {
    const userId = req.usuario?.id || req.user?.id;

    const { query } = require('../config/db.config');

    // Obtener sección del scouter
    const scouterResult = await query(`
      SELECT seccion_id, rol FROM usuarios WHERE id = $1
    `, [userId]);

    if (scouterResult.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const { seccion_id, rol } = scouterResult[0];

    let deleteQuery;
    let params = [];

    if (rol === 'admin' && !seccion_id) {
      // Admin sin sección: eliminar todas las leídas
      deleteQuery = `
        DELETE FROM notificaciones_scouter
        WHERE leida = true
        RETURNING id
      `;
    } else if (seccion_id) {
      // Scouter con sección: eliminar solo de su sección
      deleteQuery = `
        DELETE FROM notificaciones_scouter
        WHERE seccion_id = $1 AND leida = true
        RETURNING id
      `;
      params = [seccion_id];
    } else {
      return res.json({
        success: true,
        count: 0,
        message: 'No tienes una sección asignada'
      });
    }

    const result = await query(deleteQuery, params);

    res.json({
      success: true,
      count: result.length,
      message: `${result.length} notificación(es) eliminada(s)`
    });
  } catch (error) {
    console.error('Error eliminando notificaciones leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar notificaciones',
      error: error.message
    });
  }
};

/**
 * Marca todas las notificaciones como leídas
 */
const marcarTodasComoLeidas = async (req, res) => {
  try {
    const userId = req.usuario?.id || req.user?.id;

    const { query } = require('../config/db.config');

    // Obtener sección del scouter
    const scouterResult = await query(`
      SELECT seccion_id, rol FROM usuarios WHERE id = $1
    `, [userId]);

    if (scouterResult.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const { seccion_id, rol } = scouterResult[0];

    let updateQuery;
    let params = [];

    if (rol === 'admin' && !seccion_id) {
      // Admin sin sección: marcar todas
      updateQuery = `
        UPDATE notificaciones_scouter
        SET leida = true, fecha_lectura = NOW()
        WHERE leida = false
        RETURNING id
      `;
    } else if (seccion_id) {
      // Scouter con sección: marcar solo de su sección
      updateQuery = `
        UPDATE notificaciones_scouter
        SET leida = true, fecha_lectura = NOW()
        WHERE seccion_id = $1 AND leida = false
        RETURNING id
      `;
      params = [seccion_id];
    } else {
      return res.json({
        success: true,
        count: 0,
        message: 'No tienes una sección asignada'
      });
    }

    const result = await query(updateQuery, params);

    res.json({
      success: true,
      count: result.length,
      message: `${result.length} notificación(es) marcada(s) como leída(s)`
    });
  } catch (error) {
    console.error('Error marcando todas como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificaciones',
      error: error.message
    });
  }
};

module.exports = {
  getNotificaciones,
  getContadorNoLeidas,
  marcarComoLeida,
  getDocumentosPendientes,
  eliminarNotificacion,
  eliminarTodasLeidas,
  marcarTodasComoLeidas
};
