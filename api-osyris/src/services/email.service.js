/**
 * Servicio de email con toggle SMTP.
 *
 * Configuración vía variables de entorno:
 *   SMTP_ENABLED=true       (activar envío real, por defecto desactivado)
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=tu@email.com
 *   SMTP_PASS=contraseña
 *   SMTP_FROM=Grupo Scout Osyris <tu@email.com>
 *
 * Mientras SMTP_ENABLED !== 'true', los emails se loguean en consola
 * pero NO se envían. Esto permite desarrollar y probar sin configurar SMTP.
 */

const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: (process.env.SMTP_PORT || '587') === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  return _transporter;
}

/**
 * Envía un email o lo loguea si SMTP no está habilitado.
 *
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto
 * @param {string} htmlContent - Contenido HTML del email
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, htmlContent) {
  if (process.env.SMTP_ENABLED !== 'true') {
    console.log(`[EMAIL PENDIENTE SMTP] to=${to} subject="${subject}"`);
    return;
  }

  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL ENVIADO] to=${to} messageId=${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL ERROR] to=${to}:`, error.message);
    throw error;
  }
}

module.exports = { sendEmail };
