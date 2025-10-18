const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminController = {
  // Obtener métricas resumidas del dashboard
  async getMetricsSummary(req, res) {
    try {
      // Contar usuarios totales
      const [usuariosResult] = await db.execute(
        'SELECT COUNT(*) as total FROM usuarios WHERE deleted_at IS NULL'
      );

      // Contar usuarios activos hoy (que han iniciado sesión en las últimas 24 horas)
      const [usuariosActivosHoyResult] = await db.execute(
        `SELECT COUNT(*) as total FROM usuarios
         WHERE deleted_at IS NULL
         AND ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
      );

      // Contar actividades totales
      const [actividadesResult] = await db.execute(
        'SELECT COUNT(*) as total FROM actividades WHERE deleted_at IS NULL'
      );

      // Contar mensajes del último mes
      const [mensajesResult] = await db.execute(
        `SELECT COUNT(*) as total FROM mensajes
         WHERE deleted_at IS NULL
         AND fecha_envio >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      );

      // Calcular engagement rate (usuarios activos en últimos 7 días / total usuarios)
      const [usuariosActivosSemanaResult] = await db.execute(
        `SELECT COUNT(*) as total FROM usuarios
         WHERE deleted_at IS NULL
         AND ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
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
      const [activityData] = await db.execute(`
        SELECT
          DATE(DATE_SUB(CURDATE(), INTERVAL seq DAY)) as date,
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
          WHERE deleted_at IS NULL
          AND ultimo_acceso >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          GROUP BY DATE(ultimo_acceso)
        ) u ON DATE(DATE_SUB(CURDATE(), INTERVAL seq DAY)) = u.date
        LEFT JOIN (
          SELECT
            DATE(fecha_creacion) as date,
            COUNT(*) as actividades
          FROM actividades
          WHERE deleted_at IS NULL
          AND fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          GROUP BY DATE(fecha_creacion)
        ) a ON DATE(DATE_SUB(CURDATE(), INTERVAL seq DAY)) = a.date
        LEFT JOIN (
          SELECT
            DATE(fecha_envio) as date,
            COUNT(*) as mensajes
          FROM mensajes
          WHERE deleted_at IS NULL
          AND fecha_envio >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          GROUP BY DATE(fecha_envio)
        ) m ON DATE(DATE_SUB(CURDATE(), INTERVAL seq DAY)) = m.date
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
        estado = '',
        seccion = ''
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir WHERE dinámico
      let whereConditions = ['deleted_at IS NULL'];
      let params = [];

      if (search) {
        whereConditions.push(`(
          nombre LIKE ? OR
          apellidos LIKE ? OR
          email LIKE ?
        )`);
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (rol) {
        whereConditions.push('rol = ?');
        params.push(rol);
      }

      if (estado) {
        whereConditions.push('estado = ?');
        params.push(estado);
      }

      if (seccion) {
        whereConditions.push('seccion = ?');
        params.push(seccion);
      }

      const whereClause = whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Query para obtener usuarios
      const [users] = await db.execute(`
        SELECT
          id, email, nombre, apellidos, rol, estado, seccion,
          ultimo_acceso, fecha_creacion, telefono, direccion
        FROM usuarios
        ${whereClause}
        ORDER BY fecha_creacion DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);

      // Query para obtener total
      const [countResult] = await db.execute(`
        SELECT COUNT(*) as total
        FROM usuarios
        ${whereClause}
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

  // Crear nuevo usuario (endpoint específico para admin)
  async createUser(req, res) {
    try {
      const { email, password, nombre, apellidos, rol, seccion } = req.body;

      // Validaciones básicas
      if (!email || !password || !nombre || !apellidos || !rol) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos obligatorios son requeridos'
        });
      }

      // Verificar si el email ya existe
      const [existingUser] = await db.execute(
        'SELECT id FROM usuarios WHERE email = ? AND deleted_at IS NULL',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar nuevo usuario
      const [result] = await db.execute(`
        INSERT INTO usuarios (
          email, password, nombre, apellidos, rol, seccion,
          estado, fecha_creacion, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'activo', NOW(), NOW())
      `, [email, hashedPassword, nombre, apellidos, rol, seccion]);

      // Obtener usuario creado
      const [newUser] = await db.execute(
        `SELECT id, email, nombre, apellidos, rol, seccion, estado,
                fecha_creacion FROM usuarios WHERE id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        data: newUser[0],
        message: 'Usuario creado exitosamente'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear usuario'
      });
    }
  },

  // Actualizar usuario (endpoint específico para admin)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellidos, rol, estado, seccion } = req.body;

      // Verificar si el usuario existe
      const [existingUser] = await db.execute(
        'SELECT id FROM usuarios WHERE id = ? AND deleted_at IS NULL',
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

      if (nombre !== undefined) {
        updates.push('nombre = ?');
        params.push(nombre);
      }

      if (apellidos !== undefined) {
        updates.push('apellidos = ?');
        params.push(apellidos);
      }

      if (rol !== undefined) {
        updates.push('rol = ?');
        params.push(rol);
      }

      if (estado !== undefined) {
        updates.push('estado = ?');
        params.push(estado);
      }

      if (seccion !== undefined) {
        updates.push('seccion = ?');
        params.push(seccion);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
      }

      // Agregar updated_at
      updates.push('updated_at = NOW()');
      params.push(id);

      // Actualizar usuario
      await db.execute(`
        UPDATE usuarios
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params);

      // Obtener usuario actualizado
      const [updatedUser] = await db.execute(
        `SELECT id, email, nombre, apellidos, rol, seccion, estado,
                ultimo_acceso, fecha_creacion FROM usuarios WHERE id = ?`,
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
      const [existingUser] = await db.execute(
        'SELECT id, rol FROM usuarios WHERE id = ? AND deleted_at IS NULL',
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

      // Soft delete
      await db.execute(
        'UPDATE usuarios SET deleted_at = NOW() WHERE id = ?',
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

  // Obtener páginas más visitadas (simulado - en producción esto requeriría analytics)
  async getPopularPages(req, res) {
    try {
      // Datos simulados - en producción esto vendría de Google Analytics o similar
      const popularPages = [
        { page: '/dashboard', title: 'Panel Principal', visits: 1250, uniqueVisitors: 890 },
        { page: '/secciones', title: 'Secciones Scout', visits: 980, uniqueVisitors: 720 },
        { page: '/calendario', title: 'Calendario', visits: 856, uniqueVisitors: 645 },
        { page: '/galeria', title: 'Galería', visits: 723, uniqueVisitors: 512 },
        { page: '/sobre-nosotros', title: 'Sobre Nosotros', visits: 654, uniqueVisitors: 489 }
      ];

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
      // Obtener alertas de la base de datos si existe la tabla, o generarlas automáticamente
      const alerts = [];

      // Alerta de usuarios inactivos
      const [inactiveUsers] = await db.execute(`
        SELECT COUNT(*) as count FROM usuarios
        WHERE deleted_at IS NULL
        AND estado = 'activo'
        AND ultimo_acceso < DATE_SUB(NOW(), INTERVAL 30 DAY)
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

      // Alerta de espacio en disco (simulada)
      alerts.push({
        id: 'disk-space',
        type: 'info',
        title: 'Uso de Almacenamiento',
        message: 'Uso actual: 68% (2.1 GB de 3 GB)',
        timestamp: new Date().toISOString(),
        read: false
      });

      // Alerta de copias de seguridad
      const [backupStatus] = await db.execute(`
        SELECT COUNT(*) as count FROM system_logs
        WHERE type = 'backup'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);

      if (backupStatus[0].count > 0) {
        alerts.push({
          id: 'backup-success',
          type: 'success',
          title: 'Copia de Seguridad',
          message: 'Copia de seguridad completada exitosamente',
          timestamp: new Date().toISOString(),
          read: false
        });
      } else {
        alerts.push({
          id: 'backup-missing',
          type: 'error',
          title: 'Copia de Seguridad',
          message: 'No se ha realizado copia de seguridad en las últimas 24 horas',
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
  }
};

module.exports = adminController;