const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Configuración para desarrollo con SQLite
const DB_PATH = path.join(__dirname, '../../../database/osyris.db');
const DB_DIR = path.dirname(DB_PATH);

// Crear directorio de base de datos si no existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Configuración de la base de datos
let db;

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error al conectar con SQLite:', err);
        reject(err);
      } else {
        console.log('✅ Conexión a SQLite establecida correctamente');
        console.log(`📁 Base de datos ubicada en: ${DB_PATH}`);

        // Crear tablas básicas si no existen
        createTables()
          .then(() => {
            console.log('✅ Tablas de base de datos inicializadas');
            resolve();
          })
          .catch(reject);
      }
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    // Tabla de usuarios
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol TEXT CHECK(rol IN ('comite', 'kraal', 'familia', 'educando')) NOT NULL,
        seccion_id INTEGER,
        fecha_nacimiento DATE,
        telefono VARCHAR(20),
        direccion TEXT,
        activo BOOLEAN DEFAULT 1,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
        ultimo_acceso DATETIME,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id)
      )
    `;

    // Tabla de secciones
    const createSectionsTable = `
      CREATE TABLE IF NOT EXISTS secciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(50) NOT NULL,
        nombre_completo VARCHAR(100) NOT NULL,
        edad_minima INTEGER NOT NULL,
        edad_maxima INTEGER NOT NULL,
        color_primario VARCHAR(20),
        descripcion TEXT,
        activa BOOLEAN DEFAULT 1
      )
    `;

    // Tabla de actividades
    const createActivitiesTable = `
      CREATE TABLE IF NOT EXISTS actividades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        fecha_inicio DATETIME NOT NULL,
        fecha_fin DATETIME,
        ubicacion VARCHAR(200),
        seccion_id INTEGER,
        tipo TEXT CHECK(tipo IN ('reunion', 'salida', 'campamento', 'servicio', 'formacion')) DEFAULT 'reunion',
        estado TEXT CHECK(estado IN ('planificada', 'confirmada', 'cancelada', 'completada')) DEFAULT 'planificada',
        creado_por INTEGER,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id),
        FOREIGN KEY (creado_por) REFERENCES usuarios(id)
      )
    `;

    // Tabla de documentos
    const createDocumentsTable = `
      CREATE TABLE IF NOT EXISTS documentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        archivo_nombre VARCHAR(255) NOT NULL,
        archivo_ruta VARCHAR(500) NOT NULL,
        tipo_archivo VARCHAR(50),
        tamaño_archivo INTEGER,
        seccion_id INTEGER,
        subido_por INTEGER,
        fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
        visible_para TEXT CHECK(visible_para IN ('todos', 'comite', 'kraal', 'seccion')) DEFAULT 'todos',
        FOREIGN KEY (seccion_id) REFERENCES secciones(id),
        FOREIGN KEY (subido_por) REFERENCES usuarios(id)
      )
    `;

    // Tabla de mensajes/comunicaciones
    const createMessagesTable = `
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
        activo BOOLEAN DEFAULT 1,
        FOREIGN KEY (remitente_id) REFERENCES usuarios(id)
      )
    `;

    // Ejecutar creación de tablas
    db.serialize(() => {
      db.run(createSectionsTable);
      db.run(createUsersTable);
      db.run(createActivitiesTable);
      db.run(createDocumentsTable);
      db.run(createMessagesTable, (err) => {
        if (err) {
          reject(err);
        } else {
          // Insertar datos básicos de secciones
          insertBasicData()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  });
}

function insertBasicData() {
  return new Promise((resolve, reject) => {
    // Verificar si ya existen secciones
    db.get("SELECT COUNT(*) as count FROM secciones", (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        // Insertar secciones básicas
        const secciones = [
          ['castores', 'Colonia La Veleta', 5, 7, '#FFA500', 'Sección de los más pequeños'],
          ['lobatos', 'Manada Waingunga', 7, 10, '#FFA500', 'Manada de lobatos'],
          ['tropa', 'Tropa Brownsea', 10, 13, '#228B22', 'Tropa scout'],
          ['pioneros', 'Posta Kanhiwara', 13, 16, '#DC143C', 'Sección pioneros'],
          ['rutas', 'Ruta Walhalla', 16, 19, '#006400', 'Sección rutas']
        ];

        const insertSection = db.prepare(`
          INSERT INTO secciones (nombre, nombre_completo, edad_minima, edad_maxima, color_primario, descripcion)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        let completed = 0;
        secciones.forEach(seccion => {
          insertSection.run(seccion, (err) => {
            if (err) {
              reject(err);
              return;
            }
            completed++;
            if (completed === secciones.length) {
              insertSection.finalize();
              console.log('✅ Secciones básicas insertadas');
              resolve();
            }
          });
        });
      } else {
        console.log('✅ Secciones ya existen en la base de datos');
        resolve();
      }
    });
  });
}

// Función para ejecutar consultas
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA')) {
      // Para consultas SELECT
      if (params.length > 0) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        db.all(sql, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }
    } else {
      // Para INSERT, UPDATE, DELETE
      if (params.length > 0) {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({
            insertId: this.lastID,
            changes: this.changes,
            affectedRows: this.changes
          });
        });
      } else {
        db.run(sql, function(err) {
          if (err) reject(err);
          else resolve({
            insertId: this.lastID,
            changes: this.changes,
            affectedRows: this.changes
          });
        });
      }
    }
  });
}

// Función para obtener conexión (compatibilidad)
async function getConnection() {
  return {
    query: query,
    release: () => {} // No-op para compatibilidad
  };
}

// Función para cerrar la base de datos
function closeDatabase() {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error al cerrar la base de datos:', err);
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

module.exports = {
  initializeDatabase,
  query,
  getConnection,
  closeDatabase
};