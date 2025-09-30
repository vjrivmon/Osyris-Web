// 🏕️ SCRIPT PARA CREAR USUARIO SUPER_ADMIN EN BD LOCAL (SQLite)
// Ejecutar: node create-super-admin-local.js

const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function createSuperAdminLocal() {
  console.log('🚀 Creando usuario admin en base de datos local...\n');

  // Datos del super admin
  const email = 'admin@grupoosyris.es';
  const password = 'OsyrisAdmin2024!'; // CAMBIAR EN PRODUCCIÓN
  const nombre = 'Vicente';
  const apellidos = 'Rivas Monferrer';

  try {
    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('📋 Datos del usuario admin:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Nombre: ${nombre} ${apellidos}`);
    console.log('');

    // Conectar a la base de datos SQLite
    const dbPath = path.join(__dirname, '..', 'database', 'osyris.db');
    const db = new sqlite3.Database(dbPath);

    console.log(`📁 Conectando a: ${dbPath}`);

    // Insertar o actualizar el usuario
    const sql = `
      INSERT OR REPLACE INTO usuarios (
        nombre,
        apellidos,
        email,
        password,
        rol,
        activo,
        fecha_creacion,
        fecha_actualizacion
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    db.run(sql, [
      nombre,
      apellidos,
      email,
      hashedPassword,
      'admin',
      1 // SQLite usa 1 para true
    ], function(err) {
      if (err) {
        console.error('❌ Error al insertar usuario:', err.message);
        return;
      }

      console.log('✅ Usuario admin creado/actualizado correctamente!');
      console.log(`   ID: ${this.lastID}`);
      console.log('');
      console.log('🔑 CREDENCIALES DE ACCESO:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('');
      console.log('🌐 URL del panel de administración:');
      console.log('   http://localhost:3000/aula-virtual/admin');
      console.log('');
      console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
      console.log('🎯 ¡Ya puedes probar todas las funcionalidades del panel!');
    });

    db.close();

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Verificar si la base de datos existe
const dbPath = path.join(__dirname, '..', 'database', 'osyris.db');
const fs = require('fs');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Base de datos no encontrada en:', dbPath);
  console.log('📝 Primero ejecuta el servidor backend para crear la BD:');
  console.log('   cd api-osyris && npm run dev');
  process.exit(1);
}

createSuperAdminLocal();