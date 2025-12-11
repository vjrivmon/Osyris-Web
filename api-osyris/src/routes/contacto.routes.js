/**
 * Rutas del formulario de contacto
 * Osyris Scout Management System
 *
 * Endpoints públicos para el sistema de contacto
 */

const express = require('express');
const router = express.Router();

const { submitContactForm, checkHealth } = require('../controllers/contacto.controller');
const { contactRateLimit, rateLimitHeaders } = require('../middleware/rate-limit.middleware');

/**
 * POST /api/contacto
 * Envía un mensaje de contacto
 *
 * Body:
 * - nombre: string (requerido, 2-100 caracteres)
 * - email: string (requerido, email válido)
 * - asunto: string (requerido, 3-200 caracteres)
 * - mensaje: string (requerido, 10-5000 caracteres)
 *
 * Respuesta exitosa:
 * {
 *   success: true,
 *   message: "Tu mensaje ha sido enviado correctamente...",
 *   details: { savedToSheets, adminNotified, confirmationSent }
 * }
 *
 * Rate limit: 3 mensajes por IP cada 10 minutos
 */
router.post('/',
  rateLimitHeaders,
  contactRateLimit,
  submitContactForm
);

/**
 * GET /api/contacto/health
 * Verifica el estado del sistema de contacto
 *
 * Respuesta:
 * {
 *   success: true,
 *   status: "operational",
 *   services: { googleSheets, email }
 * }
 */
router.get('/health', checkHealth);

module.exports = router;
