#!/usr/bin/env node
/**
 * 🔐 Script para crear usuario admin en Supabase (Producción)
 * Ejecutar: node create-admin-production.js
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuración de Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nwkopngnziocsczqkjra.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY no está configurado');
  console.log('💡 Configura la variable de entorno SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdmin() {
  console.log('🚀 Creando usuario administrador en Supabase...\n');

  try {
    // Credenciales del admin
    const email = 'admin@grupoosyris.es';
    const password = 'OsyrisAdmin2024!';

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('⚠️  Usuario admin ya existe, actualizando contraseña...');

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          contraseña: hashedPassword,
          activo: true,
          rol: 'admin'
        })
        .eq('email', email);

      if (updateError) throw updateError;

      console.log('✅ Contraseña actualizada exitosamente');
    } else {
      console.log('👤 Creando nuevo usuario admin...');

      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          nombre: 'Administrador',
          apellidos: 'Sistema',
          email: email,
          contraseña: hashedPassword,
          rol: 'admin',
          activo: true,
          fecha_registro: new Date().toISOString(),
          telefono: '666666666',
          dni: '12345678A'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Usuario admin creado exitosamente');
      console.log('📋 ID:', data.id);
    }

    console.log('\n🔑 Credenciales de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Rol:      admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Accede en: https://tu-dominio.vercel.app/login');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error al crear usuario admin:', error.message);

    if (error.message.includes('relation "usuarios" does not exist')) {
      console.log('\n💡 La tabla "usuarios" no existe en Supabase.');
      console.log('   Ejecuta primero el script de migración de schema:');
      console.log('   node api-osyris/scripts/migrate-to-supabase.js');
    }

    process.exit(1);
  }
}

createAdmin();