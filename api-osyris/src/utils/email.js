const nodemailer = require('nodemailer');

/**
 * Sistema de envío de correos electrónicos para Grupo Scout Osyris
 * Rediseño 2025: Responsive, minimalista, consistente con la web
 * Colores: Azul Oscuro (#1a0066) + Amarillo Dorado (#fcdc4f)
 */

// ============================================
// CONFIGURACIÓN
// ============================================

const COLORS = {
  primary: '#1a0066',      // Azul oscuro scout
  accent: '#fcdc4f',       // Amarillo dorado
  text: '#1f2937',         // Gris oscuro
  textLight: '#6b7280',    // Gris
  background: '#f3f4f6',   // Gris claro
  white: '#ffffff',
  success: '#059669',      // Verde
  warning: '#f59e0b',      // Naranja
  error: '#dc2626',        // Rojo
  infoBg: '#f0f6ff',       // Azul muy claro
};

const CONTACT = {
  email: 'web.osyris@gmail.com',
  instagram: 'https://www.instagram.com/osyris.scouts/',
  instagramHandle: '@osyris.scouts',
  phone: '601 037 577',
  phoneLink: '+34601037577',
  web: 'https://gruposcoutosyris.es',
};

const LOGO_URL = 'https://gruposcoutosyris.es/images/logo-osyris.png';

// ============================================
// TRANSPORTER
// ============================================

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('⚠️ Credenciales de email no configuradas. Los correos no se enviarán.');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
};

// ============================================
// COMPONENTES REUTILIZABLES
// ============================================

/**
 * Estilos CSS base para todos los emails
 */
function getEmailStyles() {
  return `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: Arial, 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: ${COLORS.text};
        background: ${COLORS.background};
        padding: 20px;
        -webkit-font-smoothing: antialiased;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: ${COLORS.white};
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .header {
        background: ${COLORS.primary};
        color: ${COLORS.white};
        padding: 30px 24px;
        text-align: center;
      }
      .header-logo {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 2px solid ${COLORS.accent};
        margin-bottom: 12px;
      }
      .header-title {
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .header-subtitle {
        font-size: 14px;
        color: ${COLORS.accent};
        font-weight: 500;
      }
      .content {
        padding: 32px 24px;
      }
      .greeting {
        font-size: 22px;
        font-weight: 600;
        color: ${COLORS.primary};
        margin-bottom: 16px;
      }
      .text {
        color: ${COLORS.text};
        font-size: 16px;
        margin-bottom: 16px;
        line-height: 1.7;
      }
      .button-container {
        text-align: center;
        margin: 28px 0;
      }
      .button {
        display: inline-block;
        padding: 14px 36px;
        background: ${COLORS.accent};
        color: ${COLORS.primary} !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
      }
      .note {
        font-size: 14px;
        color: ${COLORS.textLight};
        text-align: center;
        margin: 16px 0;
      }
      .info-card {
        background: ${COLORS.infoBg};
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .info-row {
        margin-bottom: 10px;
        font-size: 15px;
      }
      .info-row:last-child {
        margin-bottom: 0;
      }
      .info-label {
        font-weight: 600;
        color: ${COLORS.primary};
      }
      .alert-box {
        background: #fef3c7;
        border-left: 3px solid ${COLORS.warning};
        padding: 14px 16px;
        margin: 20px 0;
        border-radius: 0 8px 8px 0;
        font-size: 14px;
      }
      .success-box {
        background: #d1fae5;
        border-left: 3px solid ${COLORS.success};
        padding: 14px 16px;
        margin: 20px 0;
        border-radius: 0 8px 8px 0;
        font-size: 15px;
        color: #047857;
      }
      .error-box {
        background: #fee2e2;
        border-left: 3px solid ${COLORS.error};
        padding: 14px 16px;
        margin: 20px 0;
        border-radius: 0 8px 8px 0;
        font-size: 15px;
      }
      .footer {
        background: ${COLORS.background};
        padding: 24px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }
      .footer-contact {
        font-size: 14px;
        color: ${COLORS.textLight};
        margin-bottom: 16px;
      }
      .footer-contact p {
        margin: 6px 0;
      }
      .footer-contact a {
        color: ${COLORS.primary};
        text-decoration: none;
      }
      .footer-copyright {
        font-size: 12px;
        color: ${COLORS.textLight};
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
        margin-top: 12px;
      }
      .footer-copyright a {
        color: ${COLORS.primary};
        text-decoration: none;
      }

      /* Responsive */
      @media only screen and (max-width: 600px) {
        body { padding: 10px; }
        .container { border-radius: 8px; }
        .header { padding: 24px 16px; }
        .header-title { font-size: 20px; }
        .content { padding: 24px 16px; }
        .greeting { font-size: 20px; }
        .text { font-size: 15px; }
        .button {
          display: block;
          width: 100%;
          padding: 16px 20px;
          text-align: center;
        }
        .footer { padding: 20px 16px; }
      }
    </style>
  `;
}

/**
 * Header del email con logo
 */
function getEmailHeader(title = 'Grupo Scout Osyris', subtitle = 'Siempre listos') {
  return `
    <div class="header">
      <img src="${LOGO_URL}" alt="Osyris" class="header-logo" width="60" height="60">
      <div class="header-title">${title}</div>
      <div class="header-subtitle">${subtitle}</div>
    </div>
  `;
}

/**
 * Footer del email con contacto
 */
function getEmailFooter() {
  return `
    <div class="footer">
      <div class="footer-contact">
        <p style="margin-bottom: 10px; color: ${COLORS.text};">
          Si tienes cualquier incidencia, contacta con el administrador:
        </p>
        <p><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></p>
        <p><a href="${CONTACT.instagram}">${CONTACT.instagramHandle}</a></p>
        <p><a href="tel:${CONTACT.phoneLink}">${CONTACT.phone}</a></p>
      </div>
      <div class="footer-copyright">
        &copy; ${new Date().getFullYear()} Grupo Scout Osyris &middot;
        <a href="${CONTACT.web}">gruposcoutosyris.es</a>
      </div>
    </div>
  `;
}

/**
 * Estructura base del email
 */
function getEmailTemplate(headerTitle, headerSubtitle, content) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Grupo Scout Osyris</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="container">
        ${getEmailHeader(headerTitle, headerSubtitle)}
        <div class="content">
          ${content}
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
}

// ============================================
// FUNCIONES DE EMAIL
// ============================================

/**
 * Email de invitación a nuevo usuario
 */
async function sendInvitationEmail(email, nombre, invitationToken, rol = 'scouter') {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [MODO DEMO] Invitación para ${email} (${rol}):`);
    console.log(`🔗 Enlace: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/registro?token=${invitationToken}`);
    return;
  }

  const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/registro?token=${invitationToken}`;

  const content = `
    <div class="greeting">¡Hola ${nombre}!</div>

    <p class="text">
      Has sido invitado a unirte al sistema de gestión del <strong>Grupo Scout Osyris</strong>.
    </p>

    <p class="text">
      Para completar tu registro, haz clic en el siguiente botón:
    </p>

    <div class="button-container">
      <a href="${registrationLink}" class="button">Completar Registro</a>
    </div>

    <p class="note">Este enlace expira en 7 días</p>
  `;

  const mailOptions = {
    from: { name: 'Grupo Scout Osyris', address: process.env.EMAIL_USER },
    to: email,
    subject: 'Invitación al Grupo Scout Osyris',
    html: getEmailTemplate('Grupo Scout Osyris', 'Siempre listos', content),
    text: `
¡Hola ${nombre}!

Has sido invitado a unirte al sistema de gestión del Grupo Scout Osyris.

Para completar tu registro, accede al siguiente enlace:
${registrationLink}

Este enlace expira en 7 días.

---
Grupo Scout Osyris
${CONTACT.web}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${email}`);
    return info;
  } catch (error) {
    console.error(`❌ Error enviando email a ${email}:`, error);
    throw error;
  }
}

/**
 * Email de bienvenida tras completar registro
 */
async function sendWelcomeEmail(email, nombre) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [MODO DEMO] Bienvenida para ${email}`);
    return;
  }

  const portalLink = process.env.FRONTEND_URL || 'https://gruposcoutosyris.es';

  const content = `
    <div class="greeting">¡Bienvenido, ${nombre}!</div>

    <p class="text">
      Tu registro se ha completado correctamente. Ya formas parte de nuestra familia scout.
    </p>

    <div class="button-container">
      <a href="${portalLink}" class="button">Acceder al Portal</a>
    </div>
  `;

  const mailOptions = {
    from: { name: 'Grupo Scout Osyris', address: process.env.EMAIL_USER },
    to: email,
    subject: '¡Bienvenido al Grupo Scout Osyris!',
    html: getEmailTemplate('Grupo Scout Osyris', 'Siempre listos', content),
    text: `
¡Bienvenido, ${nombre}!

Tu registro se ha completado correctamente. Ya formas parte de nuestra familia scout.

Accede al portal: ${portalLink}

---
Grupo Scout Osyris
${CONTACT.web}
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
 */
async function verifyEmailConfig() {
  const transporter = createTransporter();

  if (!transporter) return false;

  try {
    await transporter.verify();
    console.log('✅ Configuración de email verificada');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de email:', error);
    return false;
  }
}

/**
 * Email de vinculación de educando
 */
async function sendVinculacionEmail(email, nombreFamiliar, nombreEducando, seccion, relacion) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [MODO DEMO] Vinculación para ${email} - ${nombreEducando}`);
    return;
  }

  const relacionTexto = {
    'padre': 'Padre',
    'madre': 'Madre',
    'tutor_legal': 'Tutor Legal',
    'abuelo': 'Abuelo/a',
    'otro': 'Familiar'
  }[relacion] || 'Familiar';

  const portalLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/familia`;

  const content = `
    <div class="greeting">¡Hola ${nombreFamiliar}!</div>

    <p class="text">
      Se ha vinculado un nuevo educando a tu cuenta:
    </p>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Educando:</span> ${nombreEducando}
      </div>
      <div class="info-row">
        <span class="info-label">Sección:</span> ${seccion}
      </div>
      <div class="info-row">
        <span class="info-label">Relación:</span> ${relacionTexto}
      </div>
    </div>

    <p class="text">
      Ya puedes acceder a su información desde el portal familiar.
    </p>

    <div class="button-container">
      <a href="${portalLink}" class="button">Ver en el Portal</a>
    </div>
  `;

  const mailOptions = {
    from: { name: 'Grupo Scout Osyris', address: process.env.EMAIL_USER },
    to: email,
    subject: `Educando vinculado: ${nombreEducando}`,
    html: getEmailTemplate('Portal de Familias', 'Grupo Scout Osyris', content),
    text: `
¡Hola ${nombreFamiliar}!

Se ha vinculado un nuevo educando a tu cuenta:

• Educando: ${nombreEducando}
• Sección: ${seccion}
• Relación: ${relacionTexto}

Accede al portal: ${portalLink}

---
Grupo Scout Osyris
${CONTACT.web}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de vinculación enviado a ${email}`);
    return info;
  } catch (error) {
    console.error(`❌ Error enviando email de vinculación a ${email}:`, error);
    throw error;
  }
}

/**
 * Email de desvinculación de educando
 */
async function sendDesvinculacionEmail(email, nombreFamiliar, nombreEducando, seccion) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [MODO DEMO] Desvinculación para ${email}`);
    return;
  }

  const content = `
    <div class="greeting">Hola ${nombreFamiliar}</div>

    <p class="text">
      Se ha desvinculado el siguiente educando de tu cuenta:
    </p>

    <div class="error-box">
      <strong>${nombreEducando}</strong> - ${seccion}
    </div>

    <p class="text">
      Ya no tendrás acceso a su información en el portal familiar.
    </p>

    <p class="text">
      Si esto es un error, contacta con el administrador del grupo.
    </p>
  `;

  // Header rojo para alertas
  const customHeader = `
    <div class="header" style="background: ${COLORS.error};">
      <img src="${LOGO_URL}" alt="Osyris" class="header-logo" width="60" height="60" style="border-color: white;">
      <div class="header-title">Notificación</div>
      <div class="header-subtitle" style="color: white;">Grupo Scout Osyris</div>
    </div>
  `;

  const mailOptions = {
    from: { name: 'Grupo Scout Osyris', address: process.env.EMAIL_USER },
    to: email,
    subject: `Desvinculación: ${nombreEducando}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          ${customHeader}
          <div class="content">${content}</div>
          ${getEmailFooter()}
        </div>
      </body>
      </html>
    `,
    text: `
Hola ${nombreFamiliar},

Se ha desvinculado el siguiente educando de tu cuenta:
${nombreEducando} - ${seccion}

Ya no tendrás acceso a su información en el portal familiar.

Si esto es un error, contacta con el administrador.

---
Grupo Scout Osyris
${CONTACT.web}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de desvinculación enviado a ${email}`);
    return info;
  } catch (error) {
    console.error(`❌ Error enviando email de desvinculación a ${email}:`, error);
    throw error;
  }
}

/**
 * Email de reseteo de contraseña
 */
async function sendPasswordResetEmail(email, nombre, resetToken) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [MODO DEMO] Reset contraseña para ${email}`);
    return;
  }

  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const content = `
    <div class="greeting">Hola ${nombre}</div>

    <p class="text">
      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
    </p>

    <div class="button-container">
      <a href="${resetLink}" class="button">Restablecer Contraseña</a>
    </div>

    <div class="alert-box">
      <strong>Importante:</strong> Este enlace expira en 1 hora.
    </div>

    <p class="text" style="font-size: 14px; color: ${COLORS.textLight};">
      Si no solicitaste este cambio, ignora este correo.
    </p>
  `;

  const mailOptions = {
    from: { name: 'Grupo Scout Osyris', address: process.env.EMAIL_USER },
    to: email,
    subject: 'Recuperación de contraseña - Grupo Scout Osyris',
    html: getEmailTemplate('Grupo Scout Osyris', 'Recuperar contraseña', content),
    text: `
Hola ${nombre},

Hemos recibido una solicitud para restablecer tu contraseña.

Accede al siguiente enlace:
${resetLink}

Este enlace expira en 1 hora.

Si no solicitaste este cambio, ignora este correo.

---
Grupo Scout Osyris
${CONTACT.web}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de reset enviado a ${email}`);
    return info;
  } catch (error) {
    console.error(`❌ Error enviando email de reset a ${email}:`, error);
    throw error;
  }
}

/**
 * Email de confirmación de cambio de contraseña
 */
async function sendPasswordChangedEmail(email, nombre) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [MODO DEMO] Confirmación cambio contraseña para ${email}`);
    return;
  }

  const content = `
    <div class="greeting">Hola ${nombre}</div>

    <div class="success-box">
      Tu contraseña ha sido actualizada correctamente.
    </div>

    <p class="text">
      Ya puedes iniciar sesión con tu nueva contraseña.
    </p>

    <p class="text" style="font-size: 14px; color: ${COLORS.textLight};">
      Si no realizaste este cambio, contacta inmediatamente con el administrador.
    </p>
  `;

  const mailOptions = {
    from: { name: 'Grupo Scout Osyris', address: process.env.EMAIL_USER },
    to: email,
    subject: 'Contraseña actualizada - Grupo Scout Osyris',
    html: getEmailTemplate('Grupo Scout Osyris', 'Contraseña actualizada', content),
    text: `
Hola ${nombre},

Tu contraseña ha sido actualizada correctamente.

Ya puedes iniciar sesión con tu nueva contraseña.

Si no realizaste este cambio, contacta con el administrador.

---
Grupo Scout Osyris
${CONTACT.web}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmación enviado a ${email}`);
    return info;
  } catch (error) {
    console.error(`❌ Error enviando email de confirmación a ${email}:`, error);
    throw error;
  }
}

module.exports = {
  sendInvitationEmail,
  sendWelcomeEmail,
  sendVinculacionEmail,
  sendDesvinculacionEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  verifyEmailConfig
};
