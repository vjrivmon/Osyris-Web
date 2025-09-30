// 🏕️ SCRIPT PARA CREAR USUARIO ADMIN EN SQLITE LOCAL
// Ejecutar: node create-admin-sqlite.js

const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/osyris.db');

async function createAdminUser() {
  console.log('🚀 Creando usuario admin para SQLite local...\n');

  // Datos del admin
  const email = 'admin@gruposcoutosyris.com';
  const password = 'OsyrisAdmin2024!';
  const nombre = 'Super';
  const apellidos = 'Admin';
  const rol = 'admin';

  try {
    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('📋 Datos del admin:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Rol: ${rol}`);
    console.log('');

    // Conectar a SQLite
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error al conectar con SQLite:', err);
        return;
      }
      console.log('✅ Conectado a SQLite local');
    });

    // Insertar o actualizar usuario admin
    const sql = `
      INSERT OR REPLACE INTO usuarios (
        nombre,
        apellidos,
        email,
        password,
        rol,
        activo,
        fecha_registro,
        ultimo_acceso
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    db.run(sql, [nombre, apellidos, email, hashedPassword, rol, 1], function(err) {
      if (err) {
        console.error('❌ Error al crear admin:', err);
      } else {
        console.log('✅ Usuario admin creado/actualizado exitosamente');
        console.log(`   ID del usuario: ${this.lastID}`);
        console.log('');
        console.log('🔑 CREDENCIALES DE ACCESO:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log('');
        console.log('🎯 Ahora puedes hacer login en el admin panel');
      }

      // Cerrar conexión
      db.close((err) => {
        if (err) {
          console.error('Error al cerrar BD:', err);
        } else {
          console.log('✅ Conexión cerrada');
        }
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAdminUser();