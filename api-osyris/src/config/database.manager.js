/**
 * 🏕️ DATABASE MANAGER - SISTEMA DUAL SQLite/Supabase
 * Gestión inteligente de bases de datos con fallback automático
 */

require('dotenv').config();

// Determinar qué sistema usar
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'sqlite';
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

console.log(`🔍 DATABASE_TYPE configurado: ${DATABASE_TYPE}`);
console.log(`📁 STORAGE_TYPE configurado: ${STORAGE_TYPE}`);

class DatabaseManager {
  constructor() {
    this.dbType = DATABASE_TYPE;
    this.isSupabase = DATABASE_TYPE === 'supabase';
    this.db = null;
    this.initialized = false;
  }

  /**
   * Inicializar el sistema de base de datos
   */
  async initialize() {
    try {
      if (this.isSupabase) {
        console.log('🔄 Intentando conectar a Supabase...');

        // Verificar que las credenciales estén configuradas
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
          console.warn('⚠️ Credenciales de Supabase no configuradas, cambiando a SQLite');
          this.dbType = 'sqlite';
          this.isSupabase = false;
        } else {
          // Intentar cargar Supabase
          try {
            this.db = require('./supabase.config');

            // Verificar conexión
            const testResult = await this.db.testConnection();
            if (!testResult) {
              throw new Error('No se pudo conectar a Supabase');
            }

            console.log('✅ Supabase conectado exitosamente');
            this.initialized = true;
            return true;
          } catch (error) {
            console.error('❌ Error conectando a Supabase:', error.message);
            console.warn('⚠️ Cambiando a SQLite como fallback');
            this.dbType = 'sqlite';
            this.isSupabase = false;
          }
        }
      }

      // Si no es Supabase o falló, usar SQLite
      if (!this.isSupabase) {
        console.log('🔄 Conectando a SQLite local...');
        this.db = require('./db.config');
        await this.db.initializeDatabase();
        console.log('✅ SQLite conectado exitosamente');
        this.initialized = true;
        return true;
      }
    } catch (error) {
      console.error('❌ Error crítico inicializando base de datos:', error);
      throw error;
    }
  }

  /**
   * Obtener el tipo de base de datos actual
   */
  getDatabaseType() {
    return this.dbType;
  }

  /**
   * Verificar si está usando Supabase
   */
  isUsingSupabase() {
    return this.isSupabase && this.initialized;
  }

  /**
   * Ejecutar query (compatible con ambos sistemas)
   */
  async query(sql, params = []) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Si es Supabase, no se pueden ejecutar queries SQL directas
    if (this.isSupabase) {
      console.warn('⚠️ Query SQL directa no soportada en Supabase:', sql);
      throw new Error('Usar métodos específicos de Supabase en lugar de SQL directo');
    }

    // Para SQLite, ejecutar normalmente
    return this.db.query(sql, params);
  }

  /**
   * USUARIOS - Métodos unificados
   */
  async getAllUsers() {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.usuarios.getAll();
    } else {
      const result = await this.db.query('SELECT * FROM usuarios WHERE activo = 1');
      return result;
    }
  }

  async getUserById(id) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.usuarios.getById(id);
    } else {
      const result = await this.db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
      return result[0];
    }
  }

  async getUserByEmail(email) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.usuarios.getByEmail(email);
    } else {
      const result = await this.db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
      return result[0];
    }
  }

  async createUser(userData) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.usuarios.create(userData);
    } else {
      const { nombre, apellidos, email, contraseña, rol, seccion_id, telefono, dni, direccion, fecha_nacimiento } = userData;
      const result = await this.db.query(
        `INSERT INTO usuarios (nombre, apellidos, email, contraseña, rol, seccion_id, telefono, dni, direccion, fecha_nacimiento)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, apellidos, email, contraseña, rol, seccion_id, telefono, dni, direccion, fecha_nacimiento]
      );
      return { id: result.insertId, ...userData };
    }
  }

  async updateUser(id, userData) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.usuarios.update(id, userData);
    } else {
      const fields = Object.keys(userData);
      const values = Object.values(userData);
      const setClause = fields.map(field => `${field} = ?`).join(', ');

      await this.db.query(
        `UPDATE usuarios SET ${setClause} WHERE id = ?`,
        [...values, id]
      );

      return await this.getUserById(id);
    }
  }

  async deleteUser(id) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.usuarios.delete(id);
    } else {
      const result = await this.db.query('DELETE FROM usuarios WHERE id = ?', [id]);
      return { success: result.changes > 0 };
    }
  }

  /**
   * PÁGINAS - Métodos unificados
   */
  async getAllPages(filters = {}) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.paginas.getAll(filters);
    } else {
      // Verificar si existe la columna 'orden' y crearla si no existe
      try {
        await this.db.query("ALTER TABLE paginas ADD COLUMN orden INTEGER DEFAULT 0");
        console.log('✅ Columna orden añadida a tabla paginas');
      } catch (error) {
        // La columna ya existe, esto es esperado
      }

      let sql = 'SELECT * FROM paginas WHERE 1=1';
      const params = [];

      if (filters.visible !== undefined) {
        sql += ' AND visible = ?';
        params.push(filters.visible ? 1 : 0);
      }

      if (filters.seccion) {
        sql += ' AND seccion = ?';
        params.push(filters.seccion);
      }

      if (filters.categoria) {
        sql += ' AND categoria = ?';
        params.push(filters.categoria);
      }

      // Usar COALESCE para manejar valores NULL en orden
      sql += ' ORDER BY COALESCE(orden, 0) ASC, fecha_actualizacion DESC';

      return await this.db.query(sql, params);
    }
  }

  async getPageById(id) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.paginas.getById(id);
    } else {
      const result = await this.db.query('SELECT * FROM paginas WHERE id = ?', [id]);
      return result[0];
    }
  }

  async getPageBySlug(slug) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.paginas.getBySlug(slug);
    } else {
      const result = await this.db.query('SELECT * FROM paginas WHERE slug = ?', [slug]);
      return result[0];
    }
  }

  async createPage(pageData) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.paginas.create(pageData);
    } else {
      const {
        titulo, slug, contenido, seccion, categoria,
        imagen_principal, imagenes_galeria, visible,
        orden, meta_descripcion, actualizado_por
      } = pageData;

      const result = await this.db.query(
        `INSERT INTO paginas (titulo, slug, contenido, seccion, categoria,
          imagen_principal, imagenes_galeria, visible, orden, meta_descripcion,
          actualizado_por, fecha_creacion, fecha_actualizacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [titulo, slug, contenido, seccion, categoria,
         imagen_principal, imagenes_galeria, visible ? 1 : 0,
         orden, meta_descripcion, actualizado_por]
      );

      return { id: result.insertId, ...pageData };
    }
  }

  async updatePage(id, pageData) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.paginas.update(id, pageData);
    } else {
      // Agregar fecha_actualizacion
      const updateData = { ...pageData, fecha_actualizacion: new Date().toISOString() };

      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      const setClause = fields.map(field => `${field} = ?`).join(', ');

      await this.db.query(
        `UPDATE paginas SET ${setClause} WHERE id = ?`,
        [...values, id]
      );

      return await this.getPageById(id);
    }
  }

  async deletePage(id) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.paginas.delete(id);
    } else {
      const result = await this.db.query('DELETE FROM paginas WHERE id = ?', [id]);
      return { success: result.changes > 0 };
    }
  }

  /**
   * SECCIONES - Métodos unificados
   */
  async getAllSections() {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.secciones.getAll();
    } else {
      return await this.db.query('SELECT * FROM secciones WHERE activa = 1 ORDER BY orden');
    }
  }

  async getSectionById(id) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.secciones.getById(id);
    } else {
      const result = await this.db.query('SELECT * FROM secciones WHERE id = ?', [id]);
      return result[0];
    }
  }

  /**
   * ACTIVIDADES - Métodos unificados
   */
  async getAllActivities() {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.actividades.getAll();
    } else {
      return await this.db.query(
        `SELECT a.*, s.nombre as seccion_nombre
         FROM actividades a
         LEFT JOIN secciones s ON a.seccion_id = s.id
         ORDER BY a.fecha_inicio ASC`
      );
    }
  }

  async getActivitiesBySection(seccionId) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.actividades.getBySeccion(seccionId);
    } else {
      return await this.db.query(
        'SELECT * FROM actividades WHERE seccion_id = ? ORDER BY fecha_inicio',
        [seccionId]
      );
    }
  }

  async createActivity(activityData) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.actividades.create(activityData);
    } else {
      const fields = Object.keys(activityData);
      const values = Object.values(activityData);
      const placeholders = fields.map(() => '?').join(', ');

      const result = await this.db.query(
        `INSERT INTO actividades (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );

      return { id: result.insertId, ...activityData };
    }
  }

  /**
   * DOCUMENTOS - Métodos unificados
   */
  async getAllDocuments() {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.documentos.getAll();
    } else {
      return await this.db.query(
        'SELECT * FROM documentos ORDER BY fecha_subida DESC'
      );
    }
  }

  async createDocument(documentData) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.documentos.create(documentData);
    } else {
      const fields = Object.keys(documentData);
      const values = Object.values(documentData);
      const placeholders = fields.map(() => '?').join(', ');

      const result = await this.db.query(
        `INSERT INTO documentos (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );

      return { id: result.insertId, ...documentData };
    }
  }

  /**
   * MENSAJES - Métodos unificados
   */
  async getAllMessages() {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.mensajes.getAll();
    } else {
      return await this.db.query(
        `SELECT m.*, u.nombre as remitente_nombre
         FROM mensajes m
         LEFT JOIN usuarios u ON m.remitente_id = u.id
         ORDER BY m.fecha_envio DESC`
      );
    }
  }

  async createMessage(messageData) {
    if (!this.initialized) await this.initialize();

    if (this.isSupabase) {
      return await this.db.mensajes.create(messageData);
    } else {
      const fields = Object.keys(messageData);
      const values = Object.values(messageData);
      const placeholders = fields.map(() => '?').join(', ');

      const result = await this.db.query(
        `INSERT INTO mensajes (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );

      return { id: result.insertId, ...messageData };
    }
  }

  /**
   * Obtener estadísticas del sistema
   */
  async getSystemStats() {
    if (!this.initialized) await this.initialize();

    try {
      const stats = {
        usuarios: 0,
        secciones: 0,
        actividades: 0,
        documentos: 0,
        paginas: 0,
        mensajes: 0,
        database: this.dbType
      };

      if (this.isSupabase) {
        // Para Supabase, usar counts específicos
        const [usuarios, secciones, actividades, documentos, paginas, mensajes] = await Promise.all([
          this.db.supabase.from('usuarios').select('*', { count: 'exact', head: true }),
          this.db.supabase.from('secciones').select('*', { count: 'exact', head: true }),
          this.db.supabase.from('actividades').select('*', { count: 'exact', head: true }),
          this.db.supabase.from('documentos').select('*', { count: 'exact', head: true }),
          this.db.supabase.from('paginas').select('*', { count: 'exact', head: true }),
          this.db.supabase.from('mensajes').select('*', { count: 'exact', head: true })
        ]);

        stats.usuarios = usuarios.count || 0;
        stats.secciones = secciones.count || 0;
        stats.actividades = actividades.count || 0;
        stats.documentos = documentos.count || 0;
        stats.paginas = paginas.count || 0;
        stats.mensajes = mensajes.count || 0;
      } else {
        // Para SQLite, usar COUNT queries
        const [usuarios, secciones, actividades, documentos, paginas, mensajes] = await Promise.all([
          this.db.query('SELECT COUNT(*) as count FROM usuarios'),
          this.db.query('SELECT COUNT(*) as count FROM secciones'),
          this.db.query('SELECT COUNT(*) as count FROM actividades'),
          this.db.query('SELECT COUNT(*) as count FROM documentos'),
          this.db.query('SELECT COUNT(*) as count FROM paginas'),
          this.db.query('SELECT COUNT(*) as count FROM mensajes')
        ]);

        stats.usuarios = usuarios[0]?.count || 0;
        stats.secciones = secciones[0]?.count || 0;
        stats.actividades = actividades[0]?.count || 0;
        stats.documentos = documentos[0]?.count || 0;
        stats.paginas = paginas[0]?.count || 0;
        stats.mensajes = mensajes[0]?.count || 0;
      }

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        usuarios: 0,
        secciones: 0,
        actividades: 0,
        documentos: 0,
        paginas: 0,
        mensajes: 0,
        database: this.dbType,
        error: error.message
      };
    }
  }

  /**
   * Test de conexión
   */
  async testConnection() {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.initialized;
  }

  /**
   * Cerrar conexión
   */
  async close() {
    if (this.db && this.db.closeDatabase) {
      await this.db.closeDatabase();
    }
    this.initialized = false;
  }
}

// Singleton para asegurar una sola instancia
const databaseManager = new DatabaseManager();

module.exports = databaseManager;