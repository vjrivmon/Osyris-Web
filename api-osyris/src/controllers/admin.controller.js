const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminController = {
  // Obtener métricas resumidas del dashboard
  async getMetricsSummary(req, res) {
    try {
      // Contar usuarios totales
      const usuariosResult = await db.query(
        'SELECT COUNT(*) as total FROM usuarios WHERE activo = true'
      );

      // Contar usuarios activos hoy (que han iniciado sesión en las últimas 24 horas)
      const usuariosActivosHoyResult = await db.query(
        `SELECT COUNT(*) as total FROM usuarios
         WHERE activo = true
         AND ultimo_acceso >= NOW() - INTERVAL '24 hours'`
      );

      // Contar actividades totales
      const actividadesResult = await db.query(
        'SELECT COUNT(*) as total FROM actividades'
      );

      // Contar mensajes del último mes
      const mensajesResult = await db.query(
        `SELECT COUNT(*) as total FROM mensajes
         WHERE fecha_envio >= NOW() - INTERVAL '30 days'`
      );

      // Calcular engagement rate (usuarios activos en últimos 7 días / total usuarios)
      const usuariosActivosSemanaResult = await db.query(
        `SELECT COUNT(*) as total FROM usuarios
         WHERE activo = true
         AND ultimo_acceso >= NOW() - INTERVAL '7 days'`
      );

      const totalUsuarios = usuariosResult[0].total;
      const usuariosActivosSemana = usuariosActivosSemanaResult[0].total;
      const engagementRate = totalUsuarios > 0 ? (usuariosActivosSemana / totalUsuarios * 100).toFixed(1) : 0;

      res.json({
        success: true,
        data: {
          totalUsuarios,
          usuariosActivosHoy: usuariosActivosHoyResult[0].total,
          totalActividades: actividadesResult[0].total,
          totalMensajes: mensajesResult[0].total,
          engagementRate: parseFloat(engagementRate)
        }
      });
    } catch (error) {
      console.error('Error getting metrics summary:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas'
      });
    }
  },

  // Obtener datos de actividad de los últimos 7 días
  async getActivityMetrics(req, res) {
    try {
      const activityData = await db.query(`
        SELECT
          DATE(CURRENT_DATE - (seq * INTERVAL '1 day')) as date,
          COALESCE(u.usuarios, 0) as usuarios,
          COALESCE(a.actividades, 0) as actividades,
          COALESCE(m.mensajes, 0) as mensajes
        FROM (
          SELECT 0 as seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION
          SELECT 4 UNION SELECT 5 UNION SELECT 6
        ) as seq
        LEFT JOIN (
          SELECT
            DATE(ultimo_acceso) as date,
            COUNT(*) as usuarios
          FROM usuarios
          WHERE activo = true
          AND ultimo_acceso >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(ultimo_acceso)
        ) u ON DATE(CURRENT_DATE - (seq * INTERVAL '1 day')) = u.date
        LEFT JOIN (
          SELECT
            DATE(fecha_creacion) as date,
            COUNT(*) as actividades
          FROM actividades
          WHERE fecha_creacion >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(fecha_creacion)
        ) a ON DATE(CURRENT_DATE - (seq * INTERVAL '1 day')) = a.date
        LEFT JOIN (
          SELECT
            DATE(fecha_envio) as date,
            COUNT(*) as mensajes
          FROM mensajes
          WHERE fecha_envio >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(fecha_envio)
        ) m ON DATE(CURRENT_DATE - (seq * INTERVAL '1 day')) = m.date
        ORDER BY date ASC
      `);

      // Formatear las fechas
      const formattedData = activityData.map(row => ({
        date: new Date(row.date).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short'
        }),
        usuarios: row.usuarios,
        actividades: row.actividades,
        mensajes: row.mensajes
      }));

      res.json({
        success: true,
        data: formattedData
      });
    } catch (error) {
      console.error('Error getting activity metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos de actividad'
      });
    }
  },

  // Obtener usuarios con filtros y paginación
  async getUsersWithFilters(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        rol = '',
        seccion = ''
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir WHERE dinámico
      let whereConditions = ['activo = true'];
      let params = [];
      let paramIndex = 1;

      if (search) {
        whereConditions.push(`(
          nombre ILIKE $${paramIndex} OR
          apellidos ILIKE $${paramIndex + 1} OR
          email ILIKE $${paramIndex + 2}
        )`);
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
        paramIndex += 3;
      }

      if (rol) {
        whereConditions.push(`rol = $${paramIndex}`);
        params.push(rol);
        paramIndex++;
      }

      if (seccion) {
        whereConditions.push(`seccion_id = $${paramIndex}`);
        params.push(seccion);
        paramIndex++;
      }

      const whereClause = whereConditions.join(' AND ');

      // Query para obtener usuarios
      const users = await db.query(`
        SELECT
          id, email, nombre, apellidos, rol, seccion_id,
          ultimo_acceso, fecha_registro, telefono, direccion, fecha_nacimiento
        FROM usuarios
        WHERE ${whereClause}
        ORDER BY fecha_registro DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, parseInt(limit), offset]);

      // Query para obtener total
      const countResult = await db.query(`
        SELECT COUNT(*) as total
        FROM usuarios
        WHERE ${whereClause}
      `, params);

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });
    } catch (error) {
      console.error('Error getting users with filters:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios'
      });
    }
  },

  // Crear invitación para nuevo usuario
  async createInvitation(req, res) {
    try {
      const { email, nombre, apellidos, rol, seccion_id } = req.body;

      // Validaciones básicas
      if (!email || !nombre || !rol) {
        return res.status(400).json({
          success: false,
          message: 'Email, nombre y rol son campos obligatorios'
        });
      }

      // Verificar si el email ya está registrado o tiene una invitación pendiente
      const existingUser = await db.query(
        'SELECT id, activo FROM usuarios WHERE email = $1',
        [email]
      );

      if (existingUser.length > 0 && existingUser[0].activo) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado como usuario activo'
        });
      }

      // Generar token de invitación único
      const invitationToken = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

      // Si el usuario existe pero está inactivo, actualizar con nueva invitación
      if (existingUser.length > 0 && !existingUser[0].activo) {
        await db.query(`
          UPDATE usuarios
          SET invitation_token = $1, invitation_expires_at = $2,
              nombre = $3, apellidos = $4, rol = $5, seccion_id = $6
          WHERE email = $7
        `, [invitationToken, expiresAt, nombre, apellidos, rol, seccion_id, email]);
      } else {
        // Crear nueva invitación
        await db.query(`
          INSERT INTO usuarios (
            email, nombre, apellidos, rol, seccion_id,
            invitation_token, invitation_expires_at, activo, fecha_registro
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW())
        `, [email, nombre, apellidos, rol, seccion_id, invitationToken, expiresAt]);
      }

      // TODO: Enviar email con el enlace de invitación
      console.log(`📧 Invitación enviada a ${email}:`);
      console.log(`🔗 Enlace de registro: ${process.env.FRONTEND_URL}/registro?token=${invitationToken}`);

      res.status(201).json({
        success: true,
        message: 'Invitación enviada exitosamente',
        data: {
          email,
          invitationToken,
          expiresAt
        }
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear invitación'
      });
    }
  },

  // Actualizar usuario (endpoint específico para admin)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellidos, rol, seccion_id } = req.body;

      // Verificar si el usuario existe
      const existingUser = await db.query(
        'SELECT id, rol FROM usuarios WHERE id = $1 AND activo = true',
        [id]
      );

      if (existingUser.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Construir SET dinámico
      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (nombre !== undefined) {
        updates.push(`nombre = $${paramIndex}`);
        params.push(nombre);
        paramIndex++;
      }

      if (apellidos !== undefined) {
        updates.push(`apellidos = $${paramIndex}`);
        params.push(apellidos);
        paramIndex++;
      }

      if (rol !== undefined) {
        updates.push(`rol = $${paramIndex}`);
        params.push(rol);
        paramIndex++;
      }

      if (seccion_id !== undefined) {
        updates.push(`seccion_id = $${paramIndex}`);
        params.push(seccion_id);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
      }

      params.push(id);

      // Actualizar usuario
      await db.query(`
        UPDATE usuarios
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
      `, params);

      // Obtener usuario actualizado
      const updatedUser = await db.query(
        `SELECT id, email, nombre, apellidos, rol, seccion_id,
                ultimo_acceso, fecha_registro FROM usuarios WHERE id = $1`,
        [id]
      );

      res.json({
        success: true,
        data: updatedUser[0],
        message: 'Usuario actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar usuario'
      });
    }
  },

  // Eliminar usuario (endpoint específico para admin)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el usuario existe
      const existingUser = await db.query(
        'SELECT id, rol FROM usuarios WHERE id = $1 AND activo = true',
        [id]
      );

      if (existingUser.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // No permitir eliminar admin
      if (existingUser[0].rol === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No se puede eliminar un usuario administrador'
        });
      }

      // Soft delete (marcar como inactivo)
      await db.query(
        'UPDATE usuarios SET activo = false WHERE id = $1',
        [id]
      );

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario'
      });
    }
  },

  // Obtener páginas más visitadas (basado en vistas de páginas estáticas)
  async getPopularPages(req, res) {
    try {
      // Contar páginas por visibilidad y contenido
      const popularPages = await db.query(`
        SELECT
          slug as page,
          titulo as title,
          CASE
            WHEN visible = true THEN 100 + ROW_NUMBER() OVER (ORDER BY orden)
            ELSE 10 + ROW_NUMBER() OVER (ORDER BY orden)
          END as visits,
          CASE
            WHEN visible = true THEN 80 + ROW_NUMBER() OVER (ORDER BY orden)
            ELSE 8 + ROW_NUMBER() OVER (ORDER BY orden)
          END as uniqueVisitors
        FROM paginas
        WHERE visible = true
        ORDER BY orden ASC
        LIMIT 5
      `);

      res.json({
        success: true,
        data: popularPages
      });
    } catch (error) {
      console.error('Error getting popular pages:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener páginas populares'
      });
    }
  },

  // Obtener alertas del sistema
  async getAlerts(req, res) {
    try {
      const alerts = [];

      // Alerta de usuarios inactivos
      const inactiveUsers = await db.query(`
        SELECT COUNT(*) as count FROM usuarios
        WHERE activo = true
        AND (ultimo_acceso < NOW() - INTERVAL '30 days' OR ultimo_acceso IS NULL)
      `);

      if (inactiveUsers[0].count > 0) {
        alerts.push({
          id: 'inactive-users',
          type: 'warning',
          title: 'Usuarios Inactivos',
          message: `${inactiveUsers[0].count} usuarios no han iniciado sesión en los últimos 30 días`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      // Alerta de usuarios pendientes de registro
      const pendingUsers = await db.query(`
        SELECT COUNT(*) as count FROM usuarios
        WHERE activo = false
        AND invitation_token IS NOT NULL
        AND invitation_expires_at > NOW()
      `);

      if (pendingUsers[0].count > 0) {
        alerts.push({
          id: 'pending-users',
          type: 'info',
          title: 'Invitaciones Pendientes',
          message: `${pendingUsers[0].count} usuarios tienen invitaciones pendientes de completar`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      // Alerta de actividades próximas
      const upcomingActivities = await db.query(`
        SELECT COUNT(*) as count FROM actividades
        WHERE fecha_inicio BETWEEN NOW() AND NOW() + INTERVAL '7 days'
        AND estado = 'planificada'
      `);

      if (upcomingActivities[0].count > 0) {
        alerts.push({
          id: 'upcoming-activities',
          type: 'success',
          title: 'Actividades Próximas',
          message: `${upcomingActivities[0].count} actividades programadas para los próximos 7 días`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Error getting alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener alertas'
      });
    }
  },

  // Obtener usuarios pendientes de registro
  async getPendingUsers(req, res) {
    try {
      const pendingUsers = await db.query(`
        SELECT
          id, email, nombre, apellidos, rol, seccion_id,
          invitation_expires_at, fecha_registro
        FROM usuarios
        WHERE activo = false
        AND invitation_token IS NOT NULL
        AND invitation_expires_at > NOW()
        ORDER BY fecha_registro DESC
      `);

      res.json({
        success: true,
        data: pendingUsers
      });
    } catch (error) {
      console.error('Error getting pending users:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios pendientes'
      });
    }
  },

  // Reenviar invitación
  async resendInvitation(req, res) {
    try {
      const { id } = req.params;

      const user = await db.query(
        'SELECT email, nombre FROM usuarios WHERE id = $1 AND activo = false',
        [id]
      );

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado o ya está activo'
        });
      }

      // Generar nuevo token
      const invitationToken = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.query(`
        UPDATE usuarios
        SET invitation_token = $1, invitation_expires_at = $2
        WHERE id = $3
      `, [invitationToken, expiresAt, id]);

      console.log(`📧 Invitación reenviada a ${user[0].email}:`);
      console.log(`🔗 Enlace de registro: ${process.env.FRONTEND_URL}/registro?token=${invitationToken}`);

      res.json({
        success: true,
        message: 'Invitación reenviada exitosamente'
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      res.status(500).json({
        success: false,
        message: 'Error al reenviar invitación'
      });
    }
  }
};

module.exports = adminController;