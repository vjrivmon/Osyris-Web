const { query, createTransaction } = require('../config/db.optimized.config');
const bcrypt = require('bcryptjs');

/**
 * 🚀 MODELO OPTIMIZADO DE USUARIOS - SISTEMA OSYRIS
 * Versión mejorada con transacciones, validaciones y performance
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - nombre
 *         - apellidos
 *         - rol
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario (único)
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario (hasheada)
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         apellidos:
 *           type: string
 *           description: Apellidos del usuario
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento del usuario
 *         telefono:
 *           type: string
 *           description: Número de teléfono del usuario
 *         direccion:
 *           type: string
 *           description: Dirección del usuario
 *         foto_perfil:
 *           type: string
 *           description: URL de la foto de perfil del usuario
 *         rol:
 *           type: string
 *           enum: [admin, coordinador, scouter, padre, educando]
 *           description: Rol del usuario
 *         fecha_registro:
 *           type: string
 *           format: date-time
 *           description: Fecha de registro del usuario
 *         ultimo_acceso:
 *           type: string
 *           format: date-time
 *           description: Última fecha de acceso del usuario
 *         activo:
 *           type: boolean
 *           description: Indica si el usuario está activo
 */

class UsuarioModel {
  /**
   * 🔍 Obtener todos los usuarios con filtros y paginación
   */
  static async findAll(options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        rol = null,
        activo = null,
        seccion_id = null,
        search = null,
        orderBy = 'fecha_registro',
        orderDirection = 'DESC'
      } = options;

      let sql = `
        SELECT
          u.id, u.email, u.nombre, u.apellidos, u.fecha_nacimiento,
          u.telefono, u.direccion, u.foto_perfil, u.rol, u.activo,
          u.fecha_registro, u.ultimo_acceso,
          s.nombre as seccion_nombre, s.nombre_completo as seccion_completa
        FROM usuarios u
        LEFT JOIN secciones s ON u.seccion_id = s.id
        WHERE 1=1
      `;

      const params = [];

      // Filtros dinámicos
      if (rol) {
        sql += ' AND u.rol = ?';
        params.push(rol);
      }

      if (activo !== null) {
        sql += ' AND u.activo = ?';
        params.push(activo ? 1 : 0);
      }

      if (seccion_id) {
        sql += ' AND u.seccion_id = ?';
        params.push(seccion_id);
      }

      if (search) {
        sql += ' AND (u.nombre LIKE ? OR u.apellidos LIKE ? OR u.email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Ordenamiento seguro
      const validOrderFields = ['nombre', 'apellidos', 'email', 'fecha_registro', 'ultimo_acceso', 'rol'];
      const validDirections = ['ASC', 'DESC'];

      if (validOrderFields.includes(orderBy) && validDirections.includes(orderDirection.toUpperCase())) {
        sql += ` ORDER BY u.${orderBy} ${orderDirection.toUpperCase()}`;
      } else {
        sql += ' ORDER BY u.fecha_registro DESC';
      }

      // Paginación
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const usuarios = await query(sql, params);

      // Obtener total para paginación
      let countSql = 'SELECT COUNT(*) as total FROM usuarios u WHERE 1=1';
      const countParams = [];

      if (rol) {
        countSql += ' AND rol = ?';
        countParams.push(rol);
      }
      if (activo !== null) {
        countSql += ' AND activo = ?';
        countParams.push(activo ? 1 : 0);
      }
      if (seccion_id) {
        countSql += ' AND seccion_id = ?';
        countParams.push(seccion_id);
      }
      if (search) {
        countSql += ' AND (nombre LIKE ? OR apellidos LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      const totalResult = await query(countSql, countParams);
      const total = totalResult[0].total;

      return {
        data: usuarios,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  /**
   * 🔍 Obtener usuario por ID con información de sección
   */
  static async findById(id) {
    try {
      const usuarios = await query(`
        SELECT
          u.id, u.email, u.nombre, u.apellidos, u.fecha_nacimiento,
          u.telefono, u.direccion, u.foto_perfil, u.rol, u.activo,
          u.fecha_registro, u.ultimo_acceso, u.seccion_id,
          s.nombre as seccion_nombre, s.nombre_completo as seccion_completa
        FROM usuarios u
        LEFT JOIN secciones s ON u.seccion_id = s.id
        WHERE u.id = ?
      `, [id]);

      return usuarios.length ? usuarios[0] : null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  /**
   * 🔍 Obtener usuario por email (para autenticación)
   */
  static async findByEmail(email) {
    try {
      // Optimizado con índice en email
      const usuarios = await query(`
        SELECT * FROM usuarios
        WHERE email = ? AND activo = 1
      `, [email]);

      return usuarios.length ? usuarios[0] : null;
    } catch (error) {
      throw new Error(`Error al obtener usuario por email: ${error.message}`);
    }
  }

  /**
   * ➕ Crear nuevo usuario con transacción
   */
  static async create(userData) {
    const transaction = createTransaction();

    try {
      await transaction.begin();

      // Validar email único
      const existingUser = await transaction.all(
        'SELECT id FROM usuarios WHERE email = ?',
        [userData.email]
      );

      if (existingUser.length > 0) {
        throw new Error('El email ya está registrado');
      }

      // Hash de la contraseña
      const salt = await bcrypt.genSalt(12); // Mayor seguridad
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Validar sección si se proporciona
      if (userData.seccion_id) {
        const seccionExists = await transaction.all(
          'SELECT id FROM secciones WHERE id = ? AND activa = 1',
          [userData.seccion_id]
        );

        if (seccionExists.length === 0) {
          throw new Error('La sección especificada no existe o no está activa');
        }
      }

      // Insertar usuario
      const result = await transaction.exec(`
        INSERT INTO usuarios (
          email, password, nombre, apellidos, fecha_nacimiento,
          telefono, direccion, foto_perfil, rol, seccion_id, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userData.email,
        hashedPassword,
        userData.nombre,
        userData.apellidos,
        userData.fecha_nacimiento || null,
        userData.telefono || null,
        userData.direccion || null,
        userData.foto_perfil || null,
        userData.rol || 'scouter',
        userData.seccion_id || null,
        1 // activo por defecto
      ]);

      await transaction.commit();

      // Retornar usuario creado sin contraseña
      const newUser = await this.findById(result.insertId);
      delete newUser.password;

      return newUser;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  /**
   * ✏️ Actualizar usuario con transacción
   */
  static async update(id, userData) {
    const transaction = createTransaction();

    try {
      await transaction.begin();

      // Verificar que el usuario existe
      const existingUser = await transaction.all(
        'SELECT id, email FROM usuarios WHERE id = ?',
        [id]
      );

      if (existingUser.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar email único si se está cambiando
      if (userData.email && userData.email !== existingUser[0].email) {
        const emailExists = await transaction.all(
          'SELECT id FROM usuarios WHERE email = ? AND id != ?',
          [userData.email, id]
        );

        if (emailExists.length > 0) {
          throw new Error('El email ya está en uso por otro usuario');
        }
      }

      // Construir query de actualización dinámicamente
      const updateFields = [];
      const updateValues = [];

      // Campos permitidos para actualización
      const allowedFields = [
        'nombre', 'apellidos', 'email', 'fecha_nacimiento',
        'telefono', 'direccion', 'foto_perfil', 'rol',
        'seccion_id', 'activo'
      ];

      for (const field of allowedFields) {
        if (userData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          updateValues.push(userData[field]);
        }
      }

      // Manejar contraseña por separado
      if (userData.password) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        updateFields.push('password = ?');
        updateValues.push(hashedPassword);
      }

      if (updateFields.length === 0) {
        await transaction.rollback();
        return await this.findById(id);
      }

      // Agregar fecha de actualización
      updateFields.push('fecha_actualizacion = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const sql = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;

      const result = await transaction.exec(sql, updateValues);

      if (result.changes === 0) {
        throw new Error('No se pudo actualizar el usuario');
      }

      await transaction.commit();

      // Retornar usuario actualizado
      return await this.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  /**
   * 🗑️ Eliminar usuario (soft delete recomendado)
   */
  static async remove(id) {
    const transaction = createTransaction();

    try {
      await transaction.begin();

      // Verificar que el usuario existe
      const user = await transaction.all(
        'SELECT id FROM usuarios WHERE id = ?',
        [id]
      );

      if (user.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      // Soft delete (marcar como inactivo)
      const result = await transaction.exec(
        'UPDATE usuarios SET activo = 0, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      if (result.changes === 0) {
        throw new Error('No se pudo desactivar el usuario');
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  /**
   * 🔒 Verificar contraseña
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error('Error al verificar contraseña');
    }
  }

  /**
   * 🕐 Actualizar último acceso
   */
  static async updateLastAccess(id) {
    try {
      await query(
        'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar último acceso: ${error.message}`);
    }
  }

  /**
   * 📊 Obtener estadísticas de usuarios
   */
  static async getStats() {
    try {
      const stats = {};

      // Total de usuarios
      const total = await query('SELECT COUNT(*) as count FROM usuarios');
      stats.total = total[0].count;

      // Usuarios activos
      const activos = await query('SELECT COUNT(*) as count FROM usuarios WHERE activo = 1');
      stats.activos = activos[0].count;

      // Por rol
      const byRole = await query(`
        SELECT rol, COUNT(*) as count
        FROM usuarios
        WHERE activo = 1
        GROUP BY rol
        ORDER BY count DESC
      `);
      stats.por_rol = byRole;

      // Por sección
      const bySection = await query(`
        SELECT s.nombre, COUNT(u.id) as count
        FROM secciones s
        LEFT JOIN usuarios u ON s.id = u.seccion_id AND u.activo = 1
        GROUP BY s.id, s.nombre
        ORDER BY count DESC
      `);
      stats.por_seccion = bySection;

      // Últimos registros
      const recentUsers = await query(`
        SELECT nombre, apellidos, fecha_registro
        FROM usuarios
        WHERE activo = 1
        ORDER BY fecha_registro DESC
        LIMIT 5
      `);
      stats.ultimos_registros = recentUsers;

      return stats;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * 🔍 Buscar usuarios por término
   */
  static async search(searchTerm, options = {}) {
    try {
      const { limit = 20, includeInactive = false } = options;

      let sql = `
        SELECT
          u.id, u.nombre, u.apellidos, u.email, u.rol, u.activo,
          s.nombre as seccion_nombre
        FROM usuarios u
        LEFT JOIN secciones s ON u.seccion_id = s.id
        WHERE (
          u.nombre LIKE ? OR
          u.apellidos LIKE ? OR
          u.email LIKE ? OR
          (u.nombre || ' ' || u.apellidos) LIKE ?
        )
      `;

      const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

      if (!includeInactive) {
        sql += ' AND u.activo = 1';
      }

      sql += ' ORDER BY u.nombre, u.apellidos LIMIT ?';
      params.push(limit);

      const usuarios = await query(sql, params);
      return usuarios;
    } catch (error) {
      throw new Error(`Error en búsqueda: ${error.message}`);
    }
  }
}

module.exports = UsuarioModel;