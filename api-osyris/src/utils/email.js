const nodemailer = require('nodemailer');

/**
 * Sistema de envío de correos electrónicos para Grupo Scout Osyris
 * Utiliza Nodemailer con Gmail como proveedor
 */

// Configurar transporter de correo
const createTransporter = () => {
  // Validar que existan las credenciales
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('⚠️ Credenciales de email no configuradas. Los correos no se enviarán.');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 segundos
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
};

/**
 * Enviar email de invitación a un nuevo usuario
 * @param {string} email - Email del destinatario
 * @param {string} nombre - Nombre del destinatario
 * @param {string} invitationToken - Token de invitación único
 * @returns {Promise<void>}
 */
async function sendInvitationEmail(email, nombre, invitationToken) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`📧 [MODO DEMO] Invitación para ${email}:`);
    console.log(`🔗 Enlace de registro: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/registro?token=${invitationToken}`);
    return;
  }

  const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/registro?token=${invitationToken}`;
  
  const mailOptions = {
    from: {
      name: 'Grupo Scout Osyris',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: '✉️ Invitación al Grupo Scout Osyris',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f3f4f6;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .brand {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .tagline {
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #059669;
            margin-bottom: 20px;
          }
          .text {
            color: #4b5563;
            margin-bottom: 16px;
            font-size: 16px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
            transition: transform 0.2s;
          }
          .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .alert-box strong {
            color: #d97706;
          }
          .features {
            background: #f0fdf4;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          .features-title {
            font-weight: 600;
            color: #047857;
            margin-bottom: 16px;
            font-size: 18px;
          }
          .feature-item {
            display: flex;
            align-items: start;
            margin-bottom: 12px;
            color: #374151;
          }
          .feature-icon {
            font-size: 20px;
            margin-right: 12px;
            min-width: 24px;
          }
          .signature {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 2px solid #e5e7eb;
          }
          .signature-name {
            font-weight: 600;
            color: #059669;
            margin-bottom: 4px;
          }
          .signature-email {
            color: #6b7280;
            font-size: 14px;
          }
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
          }
          .footer-text {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 8px;
          }
          .footer-link {
            color: #059669;
            text-decoration: none;
            font-weight: 500;
          }
          .scout-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏕️</div>
            <div class="brand">Grupo Scout Osyris</div>
            <div class="tagline">Educando en valores desde 1981</div>
            <div class="scout-badge">✨ Siempre listos ✨</div>
          </div>
          
          <div class="content">
            <div class="greeting">¡Hola ${nombre}!</div>
            
            <p class="text">
              Has sido invitado a unirte al sistema de gestión del <strong>Grupo Scout Osyris</strong>. 
              Estamos emocionados de tenerte en nuestra familia scout.
            </p>
            
            <p class="text">
              Para completar tu registro y acceder a todas las funcionalidades de la plataforma, 
              haz clic en el siguiente botón:
            </p>
            
            <div class="button-container">
              <a href="${registrationLink}" class="button">
                🚀 Completar mi Registro
              </a>
            </div>
            
            <div class="alert-box">
              <strong>⏰ Importante:</strong> Este enlace expira en 7 días. 
              No compartas este correo con nadie.
            </div>
            
            <div class="features">
              <div class="features-title">Una vez completes tu registro, podrás:</div>
              <div class="feature-item">
                <span class="feature-icon">📅</span>
                <span>Ver y apuntarte al calendario de actividades scout</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💬</span>
                <span>Recibir comunicaciones importantes del grupo</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📄</span>
                <span>Acceder a documentos, circulares y material educativo</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">👥</span>
                <span>Conectar con otros miembros de tu sección</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎯</span>
                <span>Seguir tu progresión scout y especialidades</span>
              </div>
            </div>
            
            <p class="text">
              Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos. 
              Estaremos encantados de ayudarte.
            </p>
            
            <p class="text">
              <strong>¡Nos vemos en las actividades!</strong> 🏕️
            </p>
            
            <div class="signature">
              <div class="signature-name">Equipo del Grupo Scout Osyris</div>
              <div class="signature-email">📧 info@grupoosyris.es</div>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Si no solicitaste esta invitación, puedes ignorar este correo de forma segura.
            </p>
            <p class="footer-text">
              © ${new Date().getFullYear()} Grupo Scout Osyris. Todos los derechos reservados.
            </p>
            <p class="footer-text" style="margin-top: 16px;">
              <a href="https://gruposcoutosyris.es" class="footer-link">gruposcoutosyris.es</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    // Versión texto plano como fallback
    text: `
¡Hola ${nombre}!

Has sido invitado a unirte al sistema de gestión del Grupo Scout Osyris.

Para completar tu registro, accede al siguiente enlace:
${registrationLink}

⏰ Este enlace expira en 7 días.

Una vez completes tu registro, podrás:
- Ver el calendario de actividades
- Recibir comunicaciones del grupo
- Acceder a documentos importantes
- Conectar con otros miembros

Si tienes alguna duda, no dudes en contactarnos en info@grupoosyris.es

¡Nos vemos en las actividades!

Equipo del Grupo Scout Osyris
www.gruposcoutosyris.es

---
Si no solicitaste esta invitación, puedes ignorar este correo.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado exitosamente a ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error enviando email a ${email}:`, error);
    throw error;
  }
}

/**
 * Enviar email de bienvenida tras completar el registro
 * @param {string} email - Email del destinatario
 * @param {string} nombre - Nombre del destinatario
 * @returns {Promise<void>}
 */
async function sendWelcomeEmail(email, nombre) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`📧 [MODO DEMO] Bienvenida para ${email}`);
    return;
  }

  const mailOptions = {
    from: {
      name: 'Grupo Scout Osyris',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: '🎉 ¡Bienvenido al Grupo Scout Osyris!',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 24px; font-weight: bold;">🏕️ Grupo Scout Osyris</div>
        </div>
        <div class="content">
          <h2>¡Bienvenido ${nombre}!</h2>
          <p>Tu registro se ha completado exitosamente. Ya formas parte de nuestra familia scout.</p>
          <p>Puedes acceder a la plataforma en: <a href="${process.env.FRONTEND_URL || 'https://gruposcoutosyris.es'}">${process.env.FRONTEND_URL || 'gruposcoutosyris.es'}</a></p>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenida enviado a ${email}`);
    return info;
  } catch (error) {
    console.error(`❌ Error enviando email de bienvenida a ${email}:`, error);
    throw error;
  }
}

/**
 * Verificar configuración de email
 * @returns {Promise<boolean>}
 */
async function verifyEmailConfig() {
  const transporter = createTransporter();
  
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Configuración de email verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de email:', error);
    return false;
  }
}

module.exports = {
  sendInvitationEmail,
  sendWelcomeEmail,
  verifyEmailConfig
};

