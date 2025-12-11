const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('../utils/email');

const registrationController = {
  // Verificar token de invitación
  async verifyInvitation(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token de invitación requerido'
        });
      }

      const user = await db.query(`
        SELECT
          id, email, nombre, apellidos, rol, seccion_id,
          invitation_expires_at
        FROM usuarios
        WHERE invitation_token = $1
        AND activo = false
        AND invitation_expires_at > NOW()
      `, [token]);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Invitación no válida o ha expirado'
        });
      }

      res.json({
        success: true,
        data: {
          email: user[0].email,
          nombre: user[0].nombre,
          apellidos: user[0].apellidos,
          rol: user[0].rol,
          seccion_id: user[0].seccion_id,
          expiresAt: user[0].invitation_expires_at
        }
      });
    } catch (error) {
      console.error('Error verifying invitation:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar invitación'
      });
    }
  },

  // Completar registro con invitación
  async completeRegistration(req, res) {
    try {
      const { token, password, telefono, direccion, fecha_nacimiento } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: 'Token y contraseña son requeridos'
        });
      }

      // Verificar la invitación
      const user = await db.query(`
        SELECT id, email, nombre, invitation_expires_at
        FROM usuarios
        WHERE invitation_token = $1
        AND activo = false
        AND invitation_expires_at > NOW()
      `, [token]);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Invitación no válida o ha expirado'
        });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Actualizar usuario con los datos del registro
      await db.query(`
        UPDATE usuarios
        SET
          contraseña = $1,
          telefono = $2,
          direccion = $3,
          fecha_nacimiento = $4,
          activo = true,
          invitation_token = NULL,
          invitation_expires_at = NULL,
          ultimo_acceso = NOW()
        WHERE id = $5
      `, [hashedPassword, telefono || null, direccion || null, fecha_nacimiento || null, user[0].id]);

      // Registrar actividad
      await db.query(`
        INSERT INTO user_activity_logs (user_id, action, description)
        VALUES ($1, 'registration_completed', 'Registro completado via invitación')
      `, [user[0].id]);

      // Generar token JWT
      const jwtToken = jwt.sign(
        { userId: user[0].id, email: user[0].email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Obtener usuario actualizado
      const completedUser = await db.query(`
        SELECT
          id, email, nombre, apellidos, rol, seccion_id,
          telefono, direccion, fecha_nacimiento, activo, fecha_registro
        FROM usuarios
        WHERE id = $1
      `, [user[0].id]);

      res.status(201).json({
        success: true,
        message: 'Registro completado exitosamente',
        data: {
          user: completedUser[0],
          token: jwtToken
        }
      });
    } catch (error) {
      console.error('Error completing registration:', error);
      res.status(500).json({
        success: false,
        message: 'Error al completar registro'
      });
    }
  },

  // Login para usuarios registrados
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario activo
      const user = await db.query(`
        SELECT id, email, nombre, apellidos, rol, seccion_id,
               contraseña, telefono, direccion, fecha_nacimiento, activo
        FROM usuarios
        WHERE email = $1
        AND activo = true
      `, [email]);

      if (user.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user[0].contraseña);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Actualizar último acceso
      await db.query(`
        UPDATE usuarios
        SET ultimo_acceso = NOW()
        WHERE id = $1
      `, [user[0].id]);

      // Registrar actividad
      await db.query(`
        INSERT INTO user_activity_logs (user_id, action, description, ip_address)
        VALUES ($1, 'login', 'Inicio de sesión', $2)
      `, [user[0].id, req.ip]);

      // Generar token JWT
      const token = jwt.sign(
        { userId: user[0].id, email: user[0].email, rol: user[0].rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Limpiar datos sensibles
      const { contraseña, ...userWithoutPassword } = user[0];

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión'
      });
    }
  },

  // Solicitar restablecimiento de contraseña
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email es requerido'
        });
      }

      const user = await db.query(`
        SELECT id, nombre, activo
        FROM usuarios
        WHERE email = $1
        AND activo = true
      `, [email]);

      if (user.length === 0) {
        // No revelar si el email existe o no
        return res.json({
          success: true,
          message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña'
        });
      }

      // Generar token de restablecimiento
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1 hora

      await db.query(`
        UPDATE usuarios
        SET reset_password_token = $1,
            reset_password_expires_at = $2
        WHERE id = $3
      `, [resetToken, expiresAt, user[0].id]);

      // Enviar email con el enlace de restablecimiento
      await sendPasswordResetEmail(email, user[0].nombre || 'Usuario', resetToken);
      console.log(`📧 Email de restablecimiento enviado a ${email}`);

      res.json({
        success: true,
        message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña'
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      res.status(500).json({
        success: false,
        message: 'Error al solicitar restablecimiento de contraseña'
      });
    }
  },

  // Restablecer contraseña
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: 'Token y contraseña son requeridos'
        });
      }

      const user = await db.query(`
        SELECT id, email, nombre
        FROM usuarios
        WHERE reset_password_token = $1
        AND reset_password_expires_at > NOW()
        AND activo = true
      `, [token]);

      if (user.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido o ha expirado'
        });
      }

      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Actualizar contraseña y limpiar token
      await db.query(`
        UPDATE usuarios
        SET contraseña = $1,
            reset_password_token = NULL,
            reset_password_expires_at = NULL
        WHERE id = $2
      `, [hashedPassword, user[0].id]);

      // Registrar actividad
      await db.query(`
        INSERT INTO user_activity_logs (user_id, action, description)
        VALUES ($1, 'password_reset', 'Contraseña restablecida')
      `, [user[0].id]);

      // Enviar email de confirmación
      await sendPasswordChangedEmail(user[0].email, user[0].nombre || 'Usuario');
      console.log(`📧 Email de confirmación de cambio enviado a ${user[0].email}`);

      res.json({
        success: true,
        message: 'Contraseña restablecida exitosamente'
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({
        success: false,
        message: 'Error al restablecer contraseña'
      });
    }
  }
};

module.exports = registrationController;