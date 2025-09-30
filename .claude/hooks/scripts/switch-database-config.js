/**
 * 🔄 Environment Switch Hook: Switch Database Configuration
 * Switches between SQLite (development) and Supabase (production) configurations
 */

const fs = require('fs').promises
const path = require('path')

async function execute(context, config) {
  const { to: targetEnvironment } = context

  try {
    // Validate target environment
    if (!['development', 'production'].includes(targetEnvironment)) {
      throw new Error(`Invalid target environment: ${targetEnvironment}`)
    }

    const results = {
      changes: [],
      backups: [],
      warnings: []
    }

    // 1. Create backups of current configuration
    await createConfigBackups(results)

    // 2. Switch database configuration
    await switchDatabaseConfig(targetEnvironment, results)

    // 3. Update environment-specific settings
    await updateEnvironmentSettings(targetEnvironment, results)

    // 4. Update imports in main files
    await updateImports(targetEnvironment, results)

    // 5. Verify configuration switch
    await verifyConfigSwitch(targetEnvironment, results)

    return {
      success: true,
      message: `Successfully switched to ${targetEnvironment} configuration`,
      details: results
    }

  } catch (error) {
    return {
      success: false,
      message: `Failed to switch to ${targetEnvironment} configuration`,
      error: error.message
    }
  }
}

async function createConfigBackups(results) {
  const filesToBackup = [
    'api-osyris/src/config/db.config.js',
    'api-osyris/src/index.js',
    'api-osyris/src/controllers/auth.controller.js',
    'api-osyris/src/controllers/usuario.controller.js'
  ]

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(__dirname, `../../../backups/config-${timestamp}`)

  // Create backup directory
  await fs.mkdir(backupDir, { recursive: true })

  for (const filePath of filesToBackup) {
    try {
      const fullPath = path.join(__dirname, '../../../', filePath)
      const backupPath = path.join(backupDir, path.basename(filePath))

      const content = await fs.readFile(fullPath, 'utf8')
      await fs.writeFile(backupPath, content, 'utf8')

      results.backups.push(`✅ Backed up ${filePath}`)
    } catch (error) {
      results.warnings.push(`⚠️ Could not backup ${filePath}: ${error.message}`)
    }
  }
}

async function switchDatabaseConfig(targetEnvironment, results) {
  const dbConfigPath = path.join(__dirname, '../../../api-osyris/src/config/db.config.js')

  let newConfig = ''

  if (targetEnvironment === 'development') {
    // Switch to SQLite configuration
    newConfig = `const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 🏠 DESARROLLO LOCAL: Base de datos SQLite
console.log('🏠 Configurando SQLite para desarrollo local...');

const dbPath = path.join(__dirname, '../../database/osyris.db');
const db = new sqlite3.Database(dbPath);

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
};

// Función para obtener conexión (compatibilidad con código existente)
async function getConnection() {
  return {
    query: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        } else {
          db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ insertId: this.lastID, changes: this.changes });
          });
        }
      });
    },
    release: () => {}
  };
}

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    console.log('✅ Conexión a SQLite establecida correctamente');
    console.log(\`📁 Base de datos ubicada en: \${dbPath}\`);

    // Crear tablas básicas si no existen
    await createTables();

    console.log('✅ Tablas de base de datos inicializadas');
    console.log('✅ SQLite local conectado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar SQLite:', error);
    throw error;
  }
}

// Crear tablas básicas
async function createTables() {
  const connection = await getConnection();

  // Tabla usuarios
  await connection.query(\`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      apellidos TEXT NOT NULL,
      fecha_nacimiento DATE,
      telefono TEXT,
      direccion TEXT,
      foto_perfil TEXT,
      rol TEXT CHECK(rol IN ('admin', 'coordinador', 'scouter', 'padre', 'educando')) NOT NULL,
      seccion_id INTEGER,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
      ultimo_acceso DATETIME,
      activo BOOLEAN DEFAULT 1,
      FOREIGN KEY (seccion_id) REFERENCES secciones(id)
    )
  \`);

  // Tabla secciones
  await connection.query(\`
    CREATE TABLE IF NOT EXISTS secciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      edad_minima INTEGER,
      edad_maxima INTEGER,
      color_primario TEXT,
      color_secundario TEXT,
      activa BOOLEAN DEFAULT 1
    )
  \`);

  connection.release();
}

// Función para cerrar la base de datos
function closeDatabase() {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err);
      } else {
        console.log('✅ Base de datos SQLite cerrada correctamente');
      }
      resolve();
    });
  });
}

module.exports = {
  dbConfig,
  getConnection,
  initializeDatabase,
  closeDatabase,
  query: async (sql, params) => {
    const connection = await getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    return result;
  }
};`

  } else {
    // Switch to Supabase configuration
    newConfig = `// ☁️ PRODUCCIÓN: Usar configuración Supabase
const supabaseConfig = require('./supabase.config');

console.log('☁️ Configurando Supabase para producción...');

// Exportar configuración Supabase como configuración principal
module.exports = {
  // Compatibilidad con código existente
  initializeDatabase: supabaseConfig.initializeDatabase,
  getConnection: supabaseConfig.getConnection,
  closeDatabase: supabaseConfig.closeDatabase,
  query: supabaseConfig.query,

  // Cliente Supabase directo
  supabase: supabaseConfig.supabase,
  supabasePublic: supabaseConfig.supabasePublic,

  // Funciones específicas por tabla
  usuarios: supabaseConfig.usuarios,
  secciones: supabaseConfig.secciones,
  actividades: supabaseConfig.actividades,
  documentos: supabaseConfig.documentos,
  mensajes: supabaseConfig.mensajes,

  // Configuración
  dbConfig: {
    host: 'supabase',
    dialect: 'postgresql',
    logging: false
  }
};`
  }

  await fs.writeFile(dbConfigPath, newConfig, 'utf8')
  results.changes.push(`✅ Updated db.config.js for ${targetEnvironment}`)
}

async function updateEnvironmentSettings(targetEnvironment, results) {
  // Update main server file to use appropriate configuration
  const serverPath = path.join(__dirname, '../../../api-osyris/src/index.js')

  try {
    let serverContent = await fs.readFile(serverPath, 'utf8')

    if (targetEnvironment === 'development') {
      // Ensure SQLite-specific initialization
      if (!serverContent.includes('SQLite local conectado')) {
        serverContent = serverContent.replace(
          /console\.log.*servidor.*en.*ejecución.*/gi,
          `console.log('🚀 Servidor en ejecución en http://localhost:5000');
console.log('📚 Documentación disponible en http://localhost:5000/api-docs');
console.log('🏠 Usando SQLite para desarrollo local');`
        )
      }
    } else {
      // Ensure Supabase-specific initialization
      serverContent = serverContent.replace(
        /console\.log.*SQLite.*local.*/gi,
        `console.log('☁️ Usando Supabase PostgreSQL para producción');`
      )
    }

    await fs.writeFile(serverPath, serverContent, 'utf8')
    results.changes.push(`✅ Updated server configuration for ${targetEnvironment}`)

  } catch (error) {
    results.warnings.push(`⚠️ Could not update server configuration: ${error.message}`)
  }
}

async function updateImports(targetEnvironment, results) {
  const filesToUpdate = [
    'api-osyris/src/controllers/auth.controller.js',
    'api-osyris/src/controllers/usuario.controller.js'
  ]

  for (const filePath of filesToUpdate) {
    try {
      const fullPath = path.join(__dirname, '../../../', filePath)
      let content = await fs.readFile(fullPath, 'utf8')

      if (targetEnvironment === 'development') {
        // Use SQLite model
        content = content.replace(
          /const Usuario = require\('.*usuario\.model.*'\);/,
          "// 🏠 DESARROLLO LOCAL: Usar modelo SQLite\nconst Usuario = require('../models/usuario.model');"
        )
      } else {
        // Use Supabase model
        content = content.replace(
          /const Usuario = require\('.*usuario\.model.*'\);/,
          "// ☁️ PRODUCCIÓN: Usar modelo Supabase\nconst Usuario = require('../models/usuario.model.supabase');"
        )
      }

      await fs.writeFile(fullPath, content, 'utf8')
      results.changes.push(`✅ Updated imports in ${path.basename(filePath)}`)

    } catch (error) {
      results.warnings.push(`⚠️ Could not update ${filePath}: ${error.message}`)
    }
  }
}

async function verifyConfigSwitch(targetEnvironment, results) {
  try {
    const dbConfigPath = path.join(__dirname, '../../../api-osyris/src/config/db.config.js')
    const content = await fs.readFile(dbConfigPath, 'utf8')

    if (targetEnvironment === 'development') {
      if (content.includes('sqlite3') && content.includes('🏠 DESARROLLO LOCAL')) {
        results.changes.push('✅ Verified: Configuration switched to SQLite')
      } else {
        results.warnings.push('⚠️ Configuration switch to SQLite may not be complete')
      }
    } else {
      if (content.includes('supabase.config') && content.includes('☁️ PRODUCCIÓN')) {
        results.changes.push('✅ Verified: Configuration switched to Supabase')
      } else {
        results.warnings.push('⚠️ Configuration switch to Supabase may not be complete')
      }
    }

  } catch (error) {
    results.warnings.push(`⚠️ Could not verify configuration switch: ${error.message}`)
  }
}

module.exports = { execute }`