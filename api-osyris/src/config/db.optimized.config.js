const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

/**
 * 🚀 CONFIGURACIÓN OPTIMIZADA DE BASE DE DATOS OSYRIS
 * Versión mejorada con integridad referencial, transacciones y performance
 */

// Configuración de la base de datos
const DB_PATH = path.join(__dirname, '../../../database/osyris.db');
const DB_DIR = path.dirname(DB_PATH);

// Crear directorio de base de datos si no existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Variables globales
let db;
let connectionPool = [];
const MAX_CONNECTIONS = 10;

/**
 * 📊 Clase para gestión de transacciones
 */
class Transaction {
  constructor(database) {
    this.db = database;
    this.queries = [];
    this.isActive = false;
  }

  async begin() {
    if (this.isActive) {
      throw new Error('Transacción ya iniciada');
    }

    await this.exec('BEGIN TRANSACTION');
    this.isActive = true;
    console.log('🔄 Transacción iniciada');
  }

  async commit() {
    if (!this.isActive) {
      throw new Error('No hay transacción activa para confirmar');
    }

    await this.exec('COMMIT');
    this.isActive = false;
    console.log('✅ Transacción confirmada');
  }

  async rollback() {
    if (!this.isActive) {
      throw new Error('No hay transacción activa para revertir');
    }

    await this.exec('ROLLBACK');
    this.isActive = false;
    console.log('🔄 Transacción revertida');
  }

  async exec(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            insertId: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

/**
 * 🔧 Inicializar base de datos con configuración optimizada
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error al conectar con SQLite:', err);
        reject(err);
      } else {
        console.log('✅ Conexión a SQLite establecida correctamente');
        console.log(`📁 Base de datos ubicada en: ${DB_PATH}`);

        // Configurar SQLite para performance y seguridad
        configureSQLite()
          .then(() => createTablesAndIndexes())
          .then(() => insertBasicData())
          .then(() => {
            console.log('✅ Base de datos optimizada e inicializada');
            resolve();
          })
          .catch(reject);
      }
    });
  });
}

/**
 * ⚙️ Configurar SQLite con mejores prácticas
 */
async function configureSQLite() {
  const configs = [
    // 🚀 WAL mode para mejor concurrencia
    'PRAGMA journal_mode=WAL',

    // 🔗 Habilitar foreign keys
    'PRAGMA foreign_keys=ON',

    // 🔄 Habilitar triggers recursivos
    'PRAGMA recursive_triggers=ON',

    // 💾 Cache optimizado (8MB)
    'PRAGMA cache_size=-8000',

    // 🔒 Sincronización normal (balance performance/seguridad)
    'PRAGMA synchronous=NORMAL',

    // 🗂️ Auto vacuum incremental
    'PRAGMA auto_vacuum=INCREMENTAL',

    // 🕐 Timeout para operaciones
    'PRAGMA busy_timeout=30000'
  ];

  console.log('⚙️ Configurando SQLite para rendimiento óptimo...');

  for (const config of configs) {
    try {
      await execQuery(config);
      console.log(`✅ ${config}`);
    } catch (error) {
      console.error(`❌ Error en configuración ${config}:`, error);
    }
  }
}

/**
 * 🏗️ Crear tablas con constraints mejorados e índices
 */
async function createTablesAndIndexes() {
  console.log('🏗️ Creando tablas optimizadas...');

  // Tabla de secciones
  await execQuery(`
    CREATE TABLE IF NOT EXISTS secciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre VARCHAR(50) NOT NULL UNIQUE,
      nombre_completo VARCHAR(100) NOT NULL,
      edad_minima INTEGER NOT NULL CHECK(edad_minima >= 0 AND edad_minima <= 25),
      edad_maxima INTEGER NOT NULL CHECK(edad_maxima >= edad_minima AND edad_maxima <= 25),
      color_primario VARCHAR(20),
      descripcion TEXT,
      activa BOOLEAN DEFAULT 1 NOT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de usuarios
  await execQuery(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre VARCHAR(100) NOT NULL,
      apellidos VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      rol TEXT CHECK(rol IN ('admin', 'coordinador', 'scouter', 'padre', 'educando')) NOT NULL DEFAULT 'scouter',
      seccion_id INTEGER,
      fecha_nacimiento DATE CHECK(fecha_nacimiento <= date('now')),
      telefono VARCHAR(20),
      direccion TEXT,
      foto_perfil VARCHAR(500),
      activo BOOLEAN DEFAULT 1 NOT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      ultimo_acceso DATETIME,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);

  // Tabla de actividades
  await execQuery(`
    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo VARCHAR(200) NOT NULL,
      descripcion TEXT,
      fecha_inicio DATETIME NOT NULL CHECK(fecha_inicio >= date('now', '-1 day')),
      fecha_fin DATETIME CHECK(fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
      ubicacion VARCHAR(200),
      seccion_id INTEGER,
      tipo TEXT CHECK(tipo IN ('reunion', 'salida', 'campamento', 'servicio', 'formacion')) DEFAULT 'reunion',
      estado TEXT CHECK(estado IN ('planificada', 'confirmada', 'cancelada', 'completada')) DEFAULT 'planificada',
      creado_por INTEGER NOT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);

  // Tabla de documentos
  await execQuery(`
    CREATE TABLE IF NOT EXISTS documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo VARCHAR(200) NOT NULL,
      descripcion TEXT,
      archivo_nombre VARCHAR(255) NOT NULL,
      archivo_ruta VARCHAR(500) NOT NULL UNIQUE,
      tipo_archivo VARCHAR(50),
      tamaño_archivo INTEGER CHECK(tamaño_archivo > 0),
      seccion_id INTEGER,
      subido_por INTEGER NOT NULL,
      fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
      visible_para TEXT CHECK(visible_para IN ('todos', 'comite', 'kraal', 'seccion')) DEFAULT 'todos',
      activo BOOLEAN DEFAULT 1 NOT NULL,
      FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);

  // Tabla de mensajes
  await execQuery(`
    CREATE TABLE IF NOT EXISTS mensajes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asunto VARCHAR(200) NOT NULL,
      contenido TEXT NOT NULL,
      remitente_id INTEGER NOT NULL,
      destinatario_tipo TEXT CHECK(destinatario_tipo IN ('todos', 'seccion', 'rol', 'individual')) NOT NULL,
      destinatario_id INTEGER,
      fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_leido DATETIME,
      prioridad TEXT CHECK(prioridad IN ('baja', 'normal', 'alta')) DEFAULT 'normal',
      activo BOOLEAN DEFAULT 1 NOT NULL,
      FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  // Tabla de páginas
  await execQuery(`
    CREATE TABLE IF NOT EXISTS paginas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo VARCHAR(200) NOT NULL,
      slug VARCHAR(200) UNIQUE NOT NULL,
      contenido TEXT NOT NULL,
      resumen TEXT,
      meta_descripcion TEXT,
      imagen_destacada VARCHAR(500),
      estado TEXT CHECK(estado IN ('borrador', 'publicada', 'archivada')) DEFAULT 'borrador',
      tipo TEXT CHECK(tipo IN ('pagina', 'articulo', 'noticia')) DEFAULT 'pagina',
      orden_menu INTEGER DEFAULT 0 CHECK(orden_menu >= 0),
      mostrar_en_menu BOOLEAN DEFAULT 1 NOT NULL,
      permite_comentarios BOOLEAN DEFAULT 0 NOT NULL,
      creado_por INTEGER NOT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_publicacion DATETIME,
      FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);

  // Crear índices para optimización
  await createOptimizedIndexes();
}

/**
 * 📊 Crear índices optimizados para performance
 */
async function createOptimizedIndexes() {
  console.log('📊 Creando índices optimizados...');

  const indexes = [
    // Índices para usuarios
    'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)',
    'CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol)',
    'CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo)',
    'CREATE INDEX IF NOT EXISTS idx_usuarios_seccion ON usuarios(seccion_id)',
    'CREATE INDEX IF NOT EXISTS idx_usuarios_ultimo_acceso ON usuarios(ultimo_acceso)',

    // Índices para actividades
    'CREATE INDEX IF NOT EXISTS idx_actividades_fecha_inicio ON actividades(fecha_inicio)',
    'CREATE INDEX IF NOT EXISTS idx_actividades_estado ON actividades(estado)',
    'CREATE INDEX IF NOT EXISTS idx_actividades_tipo ON actividades(tipo)',
    'CREATE INDEX IF NOT EXISTS idx_actividades_seccion ON actividades(seccion_id)',
    'CREATE INDEX IF NOT EXISTS idx_actividades_creado_por ON actividades(creado_por)',

    // Índices para documentos
    'CREATE INDEX IF NOT EXISTS idx_documentos_tipo_archivo ON documentos(tipo_archivo)',
    'CREATE INDEX IF NOT EXISTS idx_documentos_fecha_subida ON documentos(fecha_subida)',
    'CREATE INDEX IF NOT EXISTS idx_documentos_visible_para ON documentos(visible_para)',
    'CREATE INDEX IF NOT EXISTS idx_documentos_seccion ON documentos(seccion_id)',
    'CREATE INDEX IF NOT EXISTS idx_documentos_activo ON documentos(activo)',

    // Índices para mensajes
    'CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id)',
    'CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario_tipo ON mensajes(destinatario_tipo)',
    'CREATE INDEX IF NOT EXISTS idx_mensajes_fecha_envio ON mensajes(fecha_envio)',
    'CREATE INDEX IF NOT EXISTS idx_mensajes_prioridad ON mensajes(prioridad)',
    'CREATE INDEX IF NOT EXISTS idx_mensajes_activo ON mensajes(activo)',

    // Índices para páginas
    'CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug)',
    'CREATE INDEX IF NOT EXISTS idx_paginas_estado ON paginas(estado)',
    'CREATE INDEX IF NOT EXISTS idx_paginas_tipo ON paginas(tipo)',
    'CREATE INDEX IF NOT EXISTS idx_paginas_mostrar_menu ON paginas(mostrar_en_menu)',
    'CREATE INDEX IF NOT EXISTS idx_paginas_orden_menu ON paginas(orden_menu)',
    'CREATE INDEX IF NOT EXISTS idx_paginas_fecha_publicacion ON paginas(fecha_publicacion)',

    // Índices compuestos para consultas frecuentes
    'CREATE INDEX IF NOT EXISTS idx_usuarios_rol_activo ON usuarios(rol, activo)',
    'CREATE INDEX IF NOT EXISTS idx_actividades_fecha_estado ON actividades(fecha_inicio, estado)',
    'CREATE INDEX IF NOT EXISTS idx_paginas_estado_menu ON paginas(estado, mostrar_en_menu)',
    'CREATE INDEX IF NOT EXISTS idx_documentos_visible_activo ON documentos(visible_para, activo)'
  ];

  for (const indexSQL of indexes) {
    try {
      await execQuery(indexSQL);
      console.log(`✅ ${indexSQL.split(' ')[5]}`); // Extraer nombre del índice
    } catch (error) {
      console.error(`❌ Error creando índice:`, error);
    }
  }
}

/**
 * 📝 Insertar datos básicos
 */
async function insertBasicData() {
  try {
    // Verificar si ya existen secciones
    const count = await query("SELECT COUNT(*) as count FROM secciones");

    if (count[0].count === 0) {
      console.log('📝 Insertando secciones básicas...');

      const transaction = new Transaction(db);
      await transaction.begin();

      try {
        const secciones = [
          ['castores', 'Colonia La Veleta', 5, 7, '#FFA500', 'Sección de los más pequeños'],
          ['lobatos', 'Manada Waingunga', 7, 10, '#FFA500', 'Manada de lobatos'],
          ['tropa', 'Tropa Brownsea', 10, 13, '#228B22', 'Tropa scout'],
          ['pioneros', 'Posta Kanhiwara', 13, 16, '#DC143C', 'Sección pioneros'],
          ['rutas', 'Ruta Walhalla', 16, 19, '#006400', 'Sección rutas']
        ];

        for (const seccion of secciones) {
          await transaction.exec(`
            INSERT INTO secciones (nombre, nombre_completo, edad_minima, edad_maxima, color_primario, descripcion)
            VALUES (?, ?, ?, ?, ?, ?)
          `, seccion);
        }

        await transaction.commit();
        console.log('✅ Secciones básicas insertadas con transacción');
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else {
      console.log('✅ Secciones ya existen en la base de datos');
    }
  } catch (error) {
    console.error('❌ Error insertando datos básicos:', error);
    throw error;
  }
}

/**
 * 🔍 Ejecutar consulta simple
 */
function execQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({
        insertId: this.lastID,
        changes: this.changes
      });
    });
  });
}

/**
 * 📊 Función para ejecutar consultas optimizadas
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA')) {
      // Para consultas SELECT
      db.all(sql, params, (err, rows) => {
        const endTime = Date.now();

        if (err) {
          console.error(`❌ Query error (${endTime - startTime}ms):`, err);
          reject(err);
        } else {
          // Log solo queries lentas (>100ms)
          if (endTime - startTime > 100) {
            console.warn(`⚠️ Slow query (${endTime - startTime}ms): ${sql.substring(0, 100)}...`);
          }
          resolve(rows);
        }
      });
    } else {
      // Para INSERT, UPDATE, DELETE
      db.run(sql, params, function(err) {
        const endTime = Date.now();

        if (err) {
          console.error(`❌ Query error (${endTime - startTime}ms):`, err);
          reject(err);
        } else {
          // Log solo queries lentas (>100ms)
          if (endTime - startTime > 100) {
            console.warn(`⚠️ Slow query (${endTime - startTime}ms): ${sql.substring(0, 100)}...`);
          }
          resolve({
            insertId: this.lastID,
            changes: this.changes,
            affectedRows: this.changes
          });
        }
      });
    }
  });
}

/**
 * 🔄 Crear transacción
 */
function createTransaction() {
  return new Transaction(db);
}

/**
 * 📊 Obtener estadísticas de la base de datos
 */
async function getDatabaseStats() {
  try {
    const stats = {
      tables: {},
      performance: {},
      integrity: {}
    };

    // Estadísticas por tabla
    const tables = ['usuarios', 'secciones', 'actividades', 'documentos', 'mensajes', 'paginas'];

    for (const table of tables) {
      const count = await query(`SELECT COUNT(*) as count FROM ${table}`);
      stats.tables[table] = count[0].count;
    }

    // Performance
    const dbSize = await query('PRAGMA page_count');
    const pageSize = await query('PRAGMA page_size');
    stats.performance.sizeKB = (dbSize[0].page_count * pageSize[0].page_size) / 1024;

    const freePages = await query('PRAGMA freelist_count');
    stats.performance.freePages = freePages[0].freelist_count;

    // Integridad
    const fkCheck = await query('PRAGMA foreign_key_check');
    stats.integrity.foreignKeyViolations = fkCheck.length;

    return stats;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    throw error;
  }
}

/**
 * 🧹 Optimizar base de datos (VACUUM, ANALYZE)
 */
async function optimizeDatabase() {
  try {
    console.log('🧹 Optimizando base de datos...');

    await execQuery('PRAGMA optimize');
    await execQuery('ANALYZE');

    // VACUUM incremental si hay páginas libres
    const freePages = await query('PRAGMA freelist_count');
    if (freePages[0].freelist_count > 100) {
      await execQuery('PRAGMA incremental_vacuum');
      console.log(`🗂️ VACUUM incremental ejecutado (${freePages[0].freelist_count} páginas liberadas)`);
    }

    console.log('✅ Base de datos optimizada');
  } catch (error) {
    console.error('❌ Error optimizando base de datos:', error);
    throw error;
  }
}

/**
 * 🔐 Función para obtener conexión (compatibilidad)
 */
async function getConnection() {
  return {
    query: query,
    createTransaction: createTransaction,
    release: () => {} // No-op para compatibilidad
  };
}

/**
 * 🔒 Función para cerrar la base de datos
 */
function closeDatabase() {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('❌ Error al cerrar la base de datos:', err);
        } else {
          console.log('✅ Conexión a la base de datos cerrada');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * 💾 Crear backup de la base de datos
 */
async function createBackup() {
  try {
    const backupDir = path.join(__dirname, '../../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `osyris_backup_${timestamp}.db`);

    // Crear backup usando SQLite BACKUP
    await execQuery(`VACUUM INTO '${backupPath}'`);

    console.log(`💾 Backup creado: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Error creando backup:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  query,
  execQuery,
  createTransaction,
  getConnection,
  closeDatabase,
  getDatabaseStats,
  optimizeDatabase,
  createBackup,
  Transaction
};