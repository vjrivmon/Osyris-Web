const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function createSimpleAdmin() {
  console.log('🚀 Creando usuario admin con credenciales simples...\n');

  // Datos del admin
  const email = 'admin@grupoosyris.es';
  const password = 'admin123'; // Contraseña simple para pruebas
  const nombre = 'Admin';
  const apellidos = 'Osyris';

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

    // Eliminar usuario existente y crear nuevo
    const deleteSql = `DELETE FROM usuarios WHERE email = ?`;

    db.run(deleteSql, [email], function(deleteErr) {
      if (deleteErr) {
        console.error('Error eliminando usuario existente:', deleteErr);
        return;
      }

      // Insertar nuevo usuario
      const sql = `
        INSERT INTO usuarios (
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
        1
      ], function(err) {
        if (err) {
          console.error('❌ Error creando usuario:', err);
        } else {
          console.log('✅ Usuario admin creado correctamente!');
          console.log(`   ID: ${this.lastID}`);
          console.log('');
          console.log('🔑 CREDENCIALES DE ACCESO:');
          console.log(`   Email: ${email}`);
          console.log(`   Password: ${password}`);
          console.log('');
          console.log('🌐 URLs de acceso:');
          console.log('   http://localhost:3000/login');
          console.log('   http://localhost:3000/admin');
          console.log('');
          console.log('🎯 ¡Ya puedes probar el login!');
        }

        db.close();
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createSimpleAdmin();