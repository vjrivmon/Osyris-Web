#!/usr/bin/env node

/**
 * Script para migrar credenciales del admin
 * De: admin@grupoosyris.es / admin123
 * A: web.osyris@gmail.com / Admin123#
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Configuración de la base de datos
const getPool = (isProduction = false) => {
  if (isProduction) {
    return new Pool({
      host: '116.203.98.142',
      port: 5432,
      user: 'osyris_user',
      password: 'osyris_password',
      database: 'osyris_db',
    });
  }
  return new Pool({
    host: 'localhost',
    port: 5432,
    user: 'osyris_user',
    password: 'osyris_password',
    database: 'osyris_db',
  });
};

async function migrateAdmin(isProduction = false) {
  const env = isProduction ? 'PRODUCCIÓN' : 'LOCAL';
  console.log(`\n🔄 Migrando credenciales admin en ${env}...`);

  const pool = getPool(isProduction);

  try {
    // Generar nuevo hash
    const newPassword = 'Admin123#';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Primero verificar si existe el usuario antiguo
    const checkOld = await pool.query(
      "SELECT id, email FROM usuarios WHERE email = 'admin@grupoosyris.es'"
    );

    if (checkOld.rows.length > 0) {
      console.log(`   📧 Usuario antiguo encontrado: admin@grupoosyris.es`);

      // Actualizar email y contraseña
      await pool.query(
        `UPDATE usuarios
         SET email = 'web.osyris@gmail.com',
             contraseña = $1
         WHERE email = 'admin@grupoosyris.es'`,
        [hashedPassword]
      );

      console.log(`   ✅ Actualizado a: web.osyris@gmail.com`);
    } else {
      // Verificar si ya existe el nuevo usuario
      const checkNew = await pool.query(
        "SELECT id, email FROM usuarios WHERE email = 'web.osyris@gmail.com'"
      );

      if (checkNew.rows.length > 0) {
        console.log(`   ℹ️  Usuario ya migrado. Actualizando contraseña...`);

        await pool.query(
          `UPDATE usuarios
           SET contraseña = $1
           WHERE email = 'web.osyris@gmail.com'`,
          [hashedPassword]
        );

        console.log(`   ✅ Contraseña actualizada`);
      } else {
        console.log(`   ⚠️  No se encontró usuario admin. Creando nuevo...`);

        await pool.query(
          `INSERT INTO usuarios (nombre, apellidos, email, contraseña, rol, activo)
           VALUES ('Admin', 'Sistema', 'web.osyris@gmail.com', $1, 'admin', true)`,
          [hashedPassword]
        );

        console.log(`   ✅ Usuario admin creado`);
      }
    }

    // Verificar resultado final
    const result = await pool.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE email = 'web.osyris@gmail.com'"
    );

    if (result.rows.length > 0) {
      console.log(`\n   📋 Usuario admin final:`);
      console.log(`      ID: ${result.rows[0].id}`);
      console.log(`      Email: ${result.rows[0].email}`);
      console.log(`      Rol: ${result.rows[0].rol}`);
      console.log(`      Password: Admin123#`);
    }

    console.log(`\n   ✅ Migración ${env} completada!\n`);

  } catch (error) {
    console.error(`   ❌ Error en ${env}:`, error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar
async function main() {
  const args = process.argv.slice(2);

  console.log('═══════════════════════════════════════════════════════');
  console.log('   MIGRACIÓN DE CREDENCIALES ADMIN - OSYRIS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('   De: admin@grupoosyris.es / admin123');
  console.log('   A:  web.osyris@gmail.com / Admin123#');
  console.log('═══════════════════════════════════════════════════════');

  try {
    if (args.includes('--local') || args.includes('-l') || args.length === 0) {
      await migrateAdmin(false); // Local
    }

    if (args.includes('--production') || args.includes('-p')) {
      await migrateAdmin(true); // Producción
    }

    if (args.includes('--all') || args.includes('-a')) {
      await migrateAdmin(false); // Local
      await migrateAdmin(true); // Producción
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('   ✅ MIGRACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Uso: node migrate-admin-credentials.js [opciones]

Opciones:
  --local, -l       Migrar solo BD local (por defecto)
  --production, -p  Migrar solo BD producción
  --all, -a         Migrar ambas BDs
  --help, -h        Mostrar ayuda
`);
    process.exit(0);
  }

  main();
}

module.exports = { migrateAdmin };
