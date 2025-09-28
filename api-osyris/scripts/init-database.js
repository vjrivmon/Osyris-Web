#!/usr/bin/env node

/**
 * Script ejecutable para inicializar completamente la base de datos
 * del proyecto Osyris Scout Management
 *
 * Este script:
 * - Inicializa la base de datos y crea las tablas
 * - Crea el usuario administrador inicial
 * - Inserta datos básicos (secciones)
 * - Proporciona feedback detallado del proceso
 */

const path = require('path');
const fs = require('fs');

// Configurar el path para que funcione desde el directorio scripts
process.chdir(path.join(__dirname, '..'));

const { initializeDatabase, closeDatabase, query } = require('../src/config/db.config');
const { initializeAdminUser } = require('./init-admin-user');

/**
 * Verificar que existe el directorio de la base de datos
 */
function ensureDatabaseDirectory() {
  const dbPath = path.join(__dirname, '../../../database');

  if (!fs.existsSync(dbPath)) {
    console.log('📁 Creando directorio de base de datos...');
    fs.mkdirSync(dbPath, { recursive: true });
    console.log(`✅ Directorio creado: ${dbPath}`);
  } else {
    console.log(`✅ Directorio de base de datos existe: ${dbPath}`);
  }
}

/**
 * Verificar el estado de las tablas en la base de datos
 */
async function checkDatabaseTables() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');

    const tables = await query(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    if (tables.length === 0) {
      console.log('⚠️  No se encontraron tablas en la base de datos.');
      return false;
    }

    console.log(`✅ Se encontraron ${tables.length} tablas:`);
    tables.forEach(table => {
      console.log(`   • ${table.name}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Error al verificar las tablas:', error.message);
    return false;
  }
}

/**
 * Verificar los datos básicos en la base de datos
 */
async function checkBasicData() {
  try {
    console.log('\n🔍 Verificando datos básicos...');

    // Verificar secciones
    const secciones = await query('SELECT COUNT(*) as count FROM secciones');
    console.log(`   • Secciones: ${secciones[0].count}`);

    // Verificar usuarios
    const usuarios = await query('SELECT COUNT(*) as count FROM usuarios');
    console.log(`   • Usuarios: ${usuarios[0].count}`);

    if (usuarios[0].count > 0) {
      const admins = await query(`
        SELECT COUNT(*) as count FROM usuarios
        WHERE rol IN ('comite', 'admin')
      `);
      console.log(`   • Usuarios administradores: ${admins[0].count}`);
    }

    return {
      secciones: secciones[0].count,
      usuarios: usuarios[0].count
    };
  } catch (error) {
    console.error('❌ Error al verificar datos básicos:', error.message);
    return null;
  }
}

/**
 * Mostrar información de la base de datos
 */
async function showDatabaseInfo() {
  try {
    const dbPath = path.join(__dirname, '../../../database/osyris.db');
    const stats = fs.statSync(dbPath);

    console.log('\n📊 Información de la base de datos:');
    console.log(`   📁 Ubicación: ${dbPath}`);
    console.log(`   📏 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   📅 Última modificación: ${stats.mtime.toLocaleString()}`);
  } catch (error) {
    console.error('❌ Error al obtener información de la base de datos:', error.message);
  }
}

/**
 * Función principal para inicializar toda la base de datos
 */
async function initializeCompleteDatabase() {
  let success = false;

  try {
    console.log('🚀 Iniciando inicialización completa de la base de datos Osyris...');
    console.log('=' * 60);

    // 1. Asegurar que existe el directorio
    ensureDatabaseDirectory();

    // 2. Inicializar la base de datos (esto crea las tablas y datos básicos)
    console.log('\n📋 Paso 1: Inicializando estructura de base de datos...');
    await initializeDatabase();

    // 3. Verificar que las tablas se crearon correctamente
    console.log('\n📋 Paso 2: Verificando estructura...');
    const tablesExist = await checkDatabaseTables();

    if (!tablesExist) {
      throw new Error('Las tablas no se crearon correctamente');
    }

    // 4. Verificar datos básicos
    console.log('\n📋 Paso 3: Verificando datos básicos...');
    const basicData = await checkBasicData();

    if (!basicData) {
      throw new Error('No se pudieron verificar los datos básicos');
    }

    // 5. Crear usuario administrador
    console.log('\n📋 Paso 4: Inicializando usuario administrador...');
    await initializeAdminUser();

    // 6. Verificación final
    console.log('\n📋 Paso 5: Verificación final...');
    await checkBasicData();
    await showDatabaseInfo();

    success = true;
    console.log('\n🎉 ¡Inicialización completa exitosa!');
    console.log('=' * 60);
    console.log('\n✨ La base de datos Osyris está lista para usar.');
    console.log('\n🔑 Credenciales de administrador:');
    console.log('   📧 Email: admin@osyris.com');
    console.log('   🔒 Contraseña: admin123');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión.');

  } catch (error) {
    console.error('\n❌ Error durante la inicialización completa:', error.message);
    console.log('\n🔧 Sugerencias para solucionar problemas:');
    console.log('   1. Verifica que SQLite3 esté instalado');
    console.log('   2. Verifica los permisos de escritura en el directorio database/');
    console.log('   3. Asegúrate de que no hay otro proceso usando la base de datos');
    success = false;
  } finally {
    // Cerrar la conexión a la base de datos
    await closeDatabase();
  }

  return success;
}

/**
 * Función para mostrar ayuda
 */
function showHelp() {
  console.log('🔧 Script de inicialización de base de datos - Osyris Scout Management');
  console.log('\nUso:');
  console.log('  node init-database.js [opciones]');
  console.log('\nOpciones:');
  console.log('  --help, -h     Mostrar esta ayuda');
  console.log('  --force, -f    Forzar la inicialización (sobrescribir datos existentes)');
  console.log('  --check, -c    Solo verificar el estado de la base de datos');
  console.log('\nEjemplos:');
  console.log('  node init-database.js              # Inicialización normal');
  console.log('  node init-database.js --check      # Solo verificar estado');
  console.log('  node init-database.js --force      # Forzar reinicialización');
}

/**
 * Función para solo verificar el estado
 */
async function checkDatabaseStatus() {
  try {
    console.log('🔍 Verificando estado de la base de datos...');

    await initializeDatabase();
    await checkDatabaseTables();
    await checkBasicData();
    await showDatabaseInfo();

    console.log('\n✅ Verificación completada.');
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  } finally {
    await closeDatabase();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--check') || args.includes('-c')) {
    checkDatabaseStatus()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    const force = args.includes('--force') || args.includes('-f');

    if (force) {
      console.log('⚠️  Modo forzado activado - se sobrescribirán los datos existentes');
    }

    initializeCompleteDatabase()
      .then((success) => {
        process.exit(success ? 0 : 1);
      })
      .catch((error) => {
        console.error('💥 Error fatal:', error.message);
        process.exit(1);
      });
  }
}

module.exports = {
  initializeCompleteDatabase,
  checkDatabaseStatus,
  checkDatabaseTables,
  checkBasicData
};