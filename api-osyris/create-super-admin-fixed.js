// 🏕️ SCRIPT PARA CREAR USUARIO SUPER_ADMIN - VERSIÓN CORREGIDA
// Ejecutar: node create-super-admin-fixed.js

const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

async function createSuperAdmin() {
  console.log('🚀 Creando usuario super_admin (versión corregida)...\n');

  // Datos del super admin
  const email = 'admin@gruposcoutosyris.com';
  const password = 'OsyrisAdmin2024!'; // CAMBIAR EN PRODUCCIÓN
  const nombre = 'Super';
  const apellidos = 'Admin';

  // Generar hash de la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  console.log('📋 Datos del super admin:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Hash: ${hashedPassword}`);
  console.log('');

  // SQL para insertar el usuario CON TODAS LAS COLUMNAS REQUERIDAS
  const sql = `
-- Insertar usuario super_admin (VERSIÓN CORREGIDA)
INSERT INTO usuarios (
  nombre,
  apellidos,
  email,
  password,
  rol,
  activo,
  fecha_registro,
  ultimo_acceso
)
VALUES (
  '${nombre}',
  '${apellidos}',
  '${email}',
  '${hashedPassword}',
  'super_admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email)
DO UPDATE SET
  password = '${hashedPassword}',
  rol = 'super_admin',
  activo = true,
  ultimo_acceso = NOW();
  `;

  console.log('📝 SQL CORREGIDO generado:');
  console.log(sql);
  console.log('');
  console.log('⚠️  INSTRUCCIONES:');
  console.log('1. Copia el SQL de arriba');
  console.log('2. Ve a Supabase → SQL Editor');
  console.log('3. Pega y ejecuta el SQL');
  console.log('4. El usuario super_admin estará listo');
  console.log('');
  console.log('🔑 CREDENCIALES DE ACCESO:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('');
  console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
}

createSuperAdmin();