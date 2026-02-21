const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const db = require('../config/db.config');

// Tipos de permisos disponibles
const PERMISOS_DISPONIBLES = [
  'aprobar_documentos',
  'gestionar_eventos',
  'ver_metricas',
  'gestionar_secciones',
  'enviar_newsletter'
];

// GET /api/permisos/tipos-disponibles - Listar tipos de permisos
router.get('/tipos-disponibles', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: PERMISOS_DISPONIBLES
  });
});

// GET /api/permisos/:usuario_id - Obtener permisos de un usuario
router.get('/:usuario_id', verifyToken, checkRole(['superadmin', 'kraal', 'jefe_seccion']), async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const permisos = await db.query(
      'SELECT * FROM permisos_usuario WHERE usuario_id = $1 ORDER BY created_at DESC',
      [usuario_id]
    );
    res.json({
      success: true,
      data: permisos
    });
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener permisos del usuario',
      error: error.message
    });
  }
});

// POST /api/permisos - Asignar permiso (solo superadmin)
router.post('/', verifyToken, checkRole(['superadmin']), async (req, res) => {
  try {
    const { usuario_id, permiso, seccion_id } = req.body;

    if (!usuario_id || !permiso) {
      return res.status(400).json({
        success: false,
        message: 'usuario_id y permiso son obligatorios'
      });
    }

    if (!PERMISOS_DISPONIBLES.includes(permiso)) {
      return res.status(400).json({
        success: false,
        message: `Permiso no válido. Permisos disponibles: ${PERMISOS_DISPONIBLES.join(', ')}`
      });
    }

    // Verificar que el usuario existe
    const usuario = await db.getUserById(usuario_id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const result = await db.query(
      `INSERT INTO permisos_usuario (usuario_id, permiso, seccion_id, otorgado_por)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (usuario_id, permiso, seccion_id) DO NOTHING
       RETURNING *`,
      [usuario_id, permiso, seccion_id || null, req.usuario.id]
    );

    if (result.length === 0) {
      return res.status(409).json({
        success: false,
        message: 'El usuario ya tiene este permiso asignado'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Permiso asignado correctamente',
      data: result[0]
    });
  } catch (error) {
    console.error('Error al asignar permiso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar permiso',
      error: error.message
    });
  }
});

// DELETE /api/permisos/:id - Revocar permiso (solo superadmin)
router.delete('/:id', verifyToken, checkRole(['superadmin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM permisos_usuario WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permiso no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Permiso revocado correctamente',
      data: result[0]
    });
  } catch (error) {
    console.error('Error al revocar permiso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al revocar permiso',
      error: error.message
    });
  }
});

module.exports = router;
