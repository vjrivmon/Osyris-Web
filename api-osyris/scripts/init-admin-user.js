#!/usr/bin/env node

/**
 * Script para inicializar un usuario administrador en la base de datos SQLite
 * del proyecto Osyris Scout Management
 *
 * Este script:
 * - Conecta con la base de datos SQLite
 * - Encripta la contraseña usando bcryptjs
 * - Inserta el usuario admin si no existe
 * - Proporciona feedback del proceso
 */

const path = require('path');
const bcrypt = require('bcryptjs');

// Configurar el path para que funcione desde el directorio scripts
process.chdir(path.join(__dirname, '..'));

const { initializeDatabase, query, closeDatabase } = require('../src/config/db.config');

// Configuración del usuario administrador
const ADMIN_USER = {
  email: 'admin@osyris.com',
  password: 'admin123',
  nombre: 'Administrador',
  apellidos: 'Sistema',
  rol: 'comite'
};

/**
 * Función para encriptar la contraseña
 */
async function hashPassword(password) {
  try {
    const saltRounds = 12; // Mayor seguridad con 12 rounds
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Error al encriptar la contraseña: ${error.message}`);
  }
}

/**
 * Función para verificar si el usuario admin ya existe
 */
async function checkAdminExists() {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM usuarios WHERE email = ?',
      [ADMIN_USER.email]
    );
    return result[0].count > 0;
  } catch (error) {
    throw new Error(`Error al verificar usuario existente: ${error.message}`);
  }
}

/**
 * Función para insertar el usuario administrador
 */
async function insertAdminUser() {
  try {
    console.log('🔐 Encriptando contraseña...');
    const hashedPassword = await hashPassword(ADMIN_USER.password);

    console.log('💾 Insertando usuario administrador...');
    const result = await query(
      `INSERT INTO usuarios
       (nombre, apellidos, email, password, rol, activo, fecha_registro)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        ADMIN_USER.nombre,
        ADMIN_USER.apellidos,
        ADMIN_USER.email,
        hashedPassword,
        ADMIN_USER.rol,
        1 // activo = true
      ]
    );

    if (result.insertId) {
      console.log(`✅ Usuario administrador creado exitosamente con ID: ${result.insertId}`);
      return result.insertId;
    } else {
      throw new Error('No se pudo obtener el ID del usuario creado');
    }
  } catch (error) {
    throw new Error(`Error al insertar usuario administrador: ${error.message}`);
  }
}

/**
 * Función para verificar la creación del usuario
 */
async function verifyAdminUser() {
  try {
    const user = await query(
      'SELECT id, nombre, apellidos, email, rol, activo, fecha_registro FROM usuarios WHERE email = ?',
      [ADMIN_USER.email]
    );

    if (user.length > 0) {
      console.log('\n📋 Detalles del usuario administrador:');
      console.log(`   ID: ${user[0].id}`);
      console.log(`   Nombre: ${user[0].nombre} ${user[0].apellidos}`);
      console.log(`   Email: ${user[0].email}`);
      console.log(`   Rol: ${user[0].rol}`);
      console.log(`   Activo: ${user[0].activo ? 'Sí' : 'No'}`);
      console.log(`   Fecha de registro: ${user[0].fecha_registro}`);
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(`Error al verificar usuario: ${error.message}`);
  }
}

/**
 * Función principal para inicializar el usuario administrador
 */
async function initializeAdminUser() {
  try {
    console.log('🚀 Iniciando proceso de inicialización del usuario administrador...');
    console.log(`📁 Base de datos: ${path.join(__dirname, '../../../database/osyris.db')}`);

    // Inicializar la base de datos
    console.log('🔄 Inicializando conexión a la base de datos...');
    await initializeDatabase();

    // Verificar si el usuario admin ya existe
    console.log('🔍 Verificando si el usuario administrador ya existe...');
    const adminExists = await checkAdminExists();

    if (adminExists) {
      console.log('⚠️  El usuario administrador ya existe en la base de datos.');
      console.log('💡 Si necesitas restablecer la contraseña, usa el script reset-admin-password.js');

      // Mostrar detalles del usuario existente
      await verifyAdminUser();
      return;
    }

    // Crear el usuario administrador
    console.log('➕ El usuario administrador no existe. Creando...');
    await insertAdminUser();

    // Verificar la creación
    const verified = await verifyAdminUser();
    if (!verified) {
      throw new Error('No se pudo verificar la creación del usuario');
    }

    console.log('\n🎉 ¡Usuario administrador inicializado correctamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log(`   Email: ${ADMIN_USER.email}`);
    console.log(`   Contraseña: ${ADMIN_USER.password}`);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión.');

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error.message);
    process.exit(1);
  } finally {
    // Cerrar la conexión a la base de datos
    await closeDatabase();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  initializeAdminUser()
    .then(() => {
      console.log('\n✨ Proceso completado exitosamente.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = {
  initializeAdminUser,
  hashPassword,
  ADMIN_USER
};