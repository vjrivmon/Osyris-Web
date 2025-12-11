/**
 * Controlador de Contacto
 * Osyris Scout Management System
 *
 * Gestiona el formulario de contacto público
 */

const validator = require('validator');
const { appendContactMessage, verifySheetsConnection, SHEETS_CONFIG } = require('../services/google-sheets.service');
const { sendContactNotification, sendContactConfirmation } = require('../utils/email');
const { getClientIP } = require('../middleware/rate-limit.middleware');

/**
 * Sanitiza un string para prevenir XSS
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
function sanitizeInput(str) {
  if (!str) return '';
  return validator.escape(validator.trim(str));
}

/**
 * Valida los datos del formulario de contacto
 * @param {Object} data - Datos del formulario
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateContactData(data) {
  const errors = [];

  // Nombre requerido (2-100 caracteres)
  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  } else if (data.nombre.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }

  // Email requerido y válido
  if (!data.email || !validator.isEmail(data.email)) {
    errors.push('El email no es válido');
  }

  // Asunto requerido (3-200 caracteres)
  if (!data.asunto || data.asunto.trim().length < 3) {
    errors.push('El asunto debe tener al menos 3 caracteres');
  } else if (data.asunto.length > 200) {
    errors.push('El asunto no puede exceder 200 caracteres');
  }

  // Mensaje requerido (10-5000 caracteres)
  if (!data.mensaje || data.mensaje.trim().length < 10) {
    errors.push('El mensaje debe tener al menos 10 caracteres');
  } else if (data.mensaje.length > 5000) {
    errors.push('El mensaje no puede exceder 5000 caracteres');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * POST /api/contacto
 * Procesa el formulario de contacto
 */
async function submitContactForm(req, res) {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    // Validar datos
    const validation = validateContactData({ nombre, email, asunto, mensaje });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'validation_error',
        message: 'Por favor, revisa los datos del formulario',
        errors: validation.errors
      });
    }

    // Sanitizar inputs
    const sanitizedData = {
      nombre: sanitizeInput(nombre),
      email: validator.normalizeEmail(email) || email,
      asunto: sanitizeInput(asunto),
      mensaje: sanitizeInput(mensaje),
      ip: getClientIP(req),
      userAgent: req.headers['user-agent'] || ''
    };

    console.log(`📧 Nuevo mensaje de contacto de: ${sanitizedData.email}`);

    // Guardar en Google Sheets
    let sheetsSaved = false;
    try {
      await appendContactMessage(sanitizedData);
      sheetsSaved = true;
    } catch (sheetsError) {
      console.error('⚠️ Error guardando en Sheets (continuando con email):', sheetsError.message);
      // No lanzar error - el mensaje se enviará por email de todas formas
    }

    // Enviar email de notificación al administrador
    let adminEmailSent = false;
    try {
      await sendContactNotification(sanitizedData);
      adminEmailSent = true;
    } catch (emailError) {
      console.error('⚠️ Error enviando email a admin:', emailError.message);
    }

    // Enviar email de confirmación al usuario
    let userEmailSent = false;
    try {
      await sendContactConfirmation(sanitizedData);
      userEmailSent = true;
    } catch (emailError) {
      console.error('⚠️ Error enviando email de confirmación:', emailError.message);
    }

    // Verificar que al menos una operación fue exitosa
    if (!sheetsSaved && !adminEmailSent) {
      return res.status(500).json({
        success: false,
        error: 'processing_error',
        message: 'No pudimos procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.'
      });
    }

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Tu mensaje ha sido enviado correctamente. Te responderemos lo antes posible.',
      details: {
        savedToSheets: sheetsSaved,
        adminNotified: adminEmailSent,
        confirmationSent: userEmailSent
      }
    });

  } catch (error) {
    console.error('❌ Error en submitContactForm:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'
    });
  }
}

/**
 * GET /api/contacto/health
 * Verifica el estado del sistema de contacto
 */
async function checkHealth(req, res) {
  try {
    const sheetsConnected = await verifySheetsConnection();

    res.json({
      success: true,
      status: 'operational',
      services: {
        googleSheets: sheetsConnected ? 'connected' : 'disconnected',
        email: process.env.EMAIL_USER ? 'configured' : 'not_configured'
      },
      spreadsheetUrl: SHEETS_CONFIG.SPREADSHEET_URL
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'degraded',
      error: error.message
    });
  }
}

module.exports = {
  submitContactForm,
  checkHealth,
  validateContactData,
  sanitizeInput
};
