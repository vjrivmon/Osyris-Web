#!/usr/bin/env node

/**
 * Script para crear usuario administrador
 */

const path = require('path');
process.chdir(path.join(__dirname));

const bcrypt = require('bcryptjs');
const { query, initializeDatabase, closeDatabase } = require('./src/config/db.config');

async function createAdminUser() {
  try {
    console.log('🔧 Inicializando base de datos...');
    await initializeDatabase();

    // Verificar si el usuario admin ya existe
    const existingAdmin = await query(
      'SELECT * FROM usuarios WHERE email = ?',
      ['web.osyris@gmail.com']
    );

    if (existingAdmin.length > 0) {
      console.log('ℹ️  El usuario admin ya existe.');
      console.log('   Email: web.osyris@gmail.com');
      console.log('   Password: Admin123#');
      return;
    }

    // Crear contraseña hasheada
    const password = 'Admin123#';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario administrador
    const result = await query(`
      INSERT INTO usuarios (
        nombre, apellidos, email, password, rol, activo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'Administrador',
      'Grupo Osyris',
      'web.osyris@gmail.com',
      hashedPassword,
      'admin',
      1
    ]);

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log(`   ID: ${result.insertId}`);
    console.log('   Email: web.osyris@gmail.com');
    console.log('   Password: Admin123#');
    console.log('   Rol: admin');
    console.log('');
    console.log('🎯 Ahora puedes usar estas credenciales para:');
    console.log('   • Iniciar sesión en el sistema');
    console.log('   • Editar páginas usando el botón "Editar página"');
    console.log('   • Gestionar contenido del CMS');
    console.log('');
    console.log('🔗 URLs disponibles para editar:');
    console.log('   • http://localhost:3000/secciones/castores');
    console.log('   • http://localhost:3000/secciones/manada');
    console.log('   • http://localhost:3000/secciones/tropa');
    console.log('   • http://localhost:3000/secciones/pioneros');
    console.log('   • http://localhost:3000/secciones/rutas');
    console.log('   • http://localhost:3000/sobre-nosotros');
    console.log('   • http://localhost:3000/galeria');
    console.log('   • http://localhost:3000/contacto');

  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
  } finally {
    await closeDatabase();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAdminUser()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { createAdminUser };