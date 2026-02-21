const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { query } = require('../config/db.config');
const ActividadModel = require('../models/actividad.model');

// ========================================
// GET /api/calendario/:seccion_id/token
// Genera o devuelve token iCal para una sección (requiere auth: admin/scouter)
// ========================================
router.get('/:seccion_id/token', verifyToken, checkRole(['admin', 'scouter']), async (req, res) => {
  try {
    const seccionId = parseInt(req.params.seccion_id);

    if (isNaN(seccionId)) {
      return res.status(400).json({ success: false, message: 'seccion_id inválido' });
    }

    // Scouter solo puede generar token de su propia sección
    if (req.usuario.rol === 'scouter' && req.usuario.seccion_id !== seccionId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes obtener el token de tu propia sección'
      });
    }

    // Verificar que la sección existe
    const secciones = await query('SELECT id, nombre FROM secciones WHERE id = $1', [seccionId]);
    if (secciones.length === 0) {
      return res.status(404).json({ success: false, message: 'Sección no encontrada' });
    }

    // Buscar token existente
    const existing = await query(
      'SELECT token FROM tokens_calendario WHERE seccion_id = $1',
      [seccionId]
    );

    if (existing.length > 0) {
      return res.json({
        success: true,
        data: {
          token: existing[0].token,
          seccion: secciones[0].nombre,
          url: `/api/calendario/${seccionId}/export.ics?token=${existing[0].token}`
        }
      });
    }

    // Generar nuevo token
    const token = crypto.randomBytes(32).toString('hex');
    await query(
      'INSERT INTO tokens_calendario (seccion_id, token) VALUES ($1, $2)',
      [seccionId, token]
    );

    res.json({
      success: true,
      data: {
        token,
        seccion: secciones[0].nombre,
        url: `/api/calendario/${seccionId}/export.ics?token=${token}`
      }
    });
  } catch (error) {
    console.error('Error generando token calendario:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando token',
      error: error.message
    });
  }
});

// ========================================
// GET /api/calendario/:seccion_id/export.ics
// Exportación iCal pública (autenticación por token en query param)
// RFC 5545 compliant - sin librería externa
// ========================================
router.get('/:seccion_id/export.ics', async (req, res) => {
  try {
    const seccionId = parseInt(req.params.seccion_id);
    const token = req.query.token;

    if (isNaN(seccionId) || !token) {
      return res.status(400).send('Parámetros inválidos');
    }

    // Verificar token
    const tokens = await query(
      'SELECT id FROM tokens_calendario WHERE seccion_id = $1 AND token = $2',
      [seccionId, token]
    );

    if (tokens.length === 0) {
      return res.status(403).send('Token no válido');
    }

    // Obtener nombre de sección
    const secciones = await query('SELECT nombre FROM secciones WHERE id = $1', [seccionId]);
    const seccionNombre = secciones.length > 0 ? secciones[0].nombre : 'Sección';

    // Obtener actividades (sección + globales)
    const actividades = await ActividadModel.findBySeccionForICal(seccionId);

    // Generar iCal RFC5545
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Grupo Scout Osyris//Calendario ' + escapeICal(seccionNombre) + '//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Osyris - ' + escapeICal(seccionNombre),
      'X-WR-TIMEZONE:Europe/Madrid'
    ];

    for (const act of actividades) {
      const uid = `act-${act.id}@grupoosyris.es`;
      const dtStart = formatICalDate(act.fecha_inicio, act.hora_inicio);
      const dtEnd = formatICalDate(act.fecha_fin || act.fecha_inicio, act.hora_fin || act.hora_inicio);
      const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + uid);
      lines.push('DTSTAMP:' + dtstamp);
      lines.push('DTSTART:' + dtStart);
      lines.push('DTEND:' + dtEnd);
      lines.push('SUMMARY:' + escapeICal(act.titulo));

      if (act.descripcion) {
        lines.push('DESCRIPTION:' + escapeICal(act.descripcion));
      }
      if (act.lugar) {
        lines.push('LOCATION:' + escapeICal(act.lugar));
      }
      if (act.seccion_nombre) {
        lines.push('CATEGORIES:' + escapeICal(act.seccion_nombre));
      }

      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    const ical = lines.join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="osyris-${seccionNombre.toLowerCase().replace(/\s+/g, '-')}.ics"`);
    res.send(ical);
  } catch (error) {
    console.error('Error exportando iCal:', error);
    res.status(500).send('Error generando calendario');
  }
});

/**
 * Formatear fecha+hora a formato iCal (YYYYMMDDTHHMMSS)
 * Si no hay hora, usar todo-el-día (YYYYMMDD)
 */
function formatICalDate(fecha, hora) {
  if (!fecha) return '';

  // fecha viene como "YYYY-MM-DD" (ya formateada por el modelo)
  const datePart = String(fecha).replace(/-/g, '');

  if (hora) {
    // hora viene como "HH:MM:SS" o "HH:MM"
    const timePart = String(hora).replace(/:/g, '').substring(0, 6).padEnd(6, '0');
    return datePart + 'T' + timePart;
  }

  // Sin hora: evento de todo el día
  return datePart;
}

/**
 * Escapar texto para iCal RFC5545
 */
function escapeICal(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

module.exports = router;
