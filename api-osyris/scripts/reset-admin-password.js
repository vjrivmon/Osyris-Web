#!/usr/bin/env node

/**
 * Script para restablecer la contraseña del usuario administrador
 * del proyecto Osyris Scout Management
 */

const path = require('path');

// Configurar el path para que funcione desde el directorio scripts
process.chdir(path.join(__dirname, '..'));

const { initializeDatabase, query, closeDatabase } = require('../src/config/db.config');
const { hashPassword } = require('./password-utils');

/**
 * Función para restablecer la contraseña del administrador
 */
async function resetAdminPassword(newPassword = 'Admin123#') {
  try {
    console.log('🔐 Restableciendo contraseña del administrador...');

    // Inicializar la base de datos
    await initializeDatabase();

    // Verificar que el usuario admin existe
    const adminUser = await query(
      'SELECT id, email, nombre, apellidos FROM usuarios WHERE email = ?',
      ['web.osyris@gmail.com']
    );

    if (adminUser.length === 0) {
      throw new Error('Usuario administrador no encontrado. Ejecuta primero init-admin-user.js');
    }

    console.log(`👤 Usuario encontrado: ${adminUser[0].nombre} ${adminUser[0].apellidos} (${adminUser[0].email})`);

    // Encriptar la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar la contraseña
    const result = await query(
      'UPDATE usuarios SET password = ? WHERE email = ?',
      [hashedPassword, 'web.osyris@gmail.com']
    );

    if (result.changes > 0) {
      console.log('✅ Contraseña restablecida exitosamente');
      console.log('\n🔑 Nuevas credenciales:');
      console.log(`   📧 Email: admin@osyris.com`);
      console.log(`   🔒 Contraseña: ${newPassword}`);
    } else {
      throw new Error('No se pudo actualizar la contraseña');
    }

  } catch (error) {
    console.error('❌ Error al restablecer la contraseña:', error.message);
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const newPassword = args[0] || 'admin123';

  if (args.includes('--help') || args.includes('-h')) {
    console.log('🔧 Script para restablecer contraseña de administrador');
    console.log('\nUso:');
    console.log('  node reset-admin-password.js [nueva_contraseña]');
    console.log('\nEjemplos:');
    console.log('  node reset-admin-password.js              # Restablece a "admin123"');
    console.log('  node reset-admin-password.js nuevaPass123 # Restablece a "nuevaPass123"');
    process.exit(0);
  }

  resetAdminPassword(newPassword)
    .then(() => {
      console.log('\n✨ Proceso completado exitosamente.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { resetAdminPassword };