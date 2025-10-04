/**
 * Script para crear usuario administrador
 * Uso: node scripts/create-admin-user.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'osyris_user',
  password: process.env.DB_PASSWORD || 'osyris_password',
  database: process.env.DB_NAME || 'osyris_db'
});

async function createAdmin() {
  console.log('🔐 Creando usuario administrador...\n');

  try {
    // Datos del admin
    const adminData = {
      nombre: 'Admin',
      apellidos: 'Osyris',
      email: 'admin@osyris.com',
      password: 'Admin123!',  // Cambiar en producción
      rol: 'admin'
    };

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Verificar si ya existe
    const checkResult = await pool.query(
      'SELECT id, email, rol FROM usuarios WHERE email = $1',
      [adminData.email]
    );

    if (checkResult.rows.length > 0) {
      console.log('⚠ El usuario admin ya existe:');
      console.log(`   Email: ${checkResult.rows[0].email}`);
      console.log(`   Rol: ${checkResult.rows[0].rol}`);
      console.log(`   ID: ${checkResult.rows[0].id}\n`);

      // Preguntar si quiere actualizar la contraseña
      console.log('💡 Para actualizar la contraseña, ejecuta:');
      console.log(`   UPDATE usuarios SET contraseña = '${hashedPassword}' WHERE email = '${adminData.email}';\n`);

      await pool.end();
      return;
    }

    // Insertar admin
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellidos, email, contraseña, rol, activo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, nombre, apellidos, email, rol`,
      [adminData.nombre, adminData.apellidos, adminData.email, hashedPassword, adminData.rol]
    );

    const admin = result.rows[0];

    console.log('✅ Usuario administrador creado exitosamente:\n');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Nombre: ${admin.nombre} ${admin.apellidos}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Rol: ${admin.rol}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n⚠ IMPORTANTE: Cambia la contraseña después del primer login!\n');

  } catch (error) {
    console.error('❌ Error al crear admin:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin };
