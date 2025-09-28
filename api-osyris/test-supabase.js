// 🧪 TEST DE CONEXIÓN A SUPABASE
// Script para probar que la migración funciona correctamente

const dotenv = require('dotenv');
dotenv.config();

async function testSupabaseConnection() {
  console.log('🚀 Iniciando test de conexión Supabase...\n');

  try {
    // Test 1: Importar configuración
    console.log('📋 Test 1: Importando configuración Supabase...');
    const { initializeDatabase, secciones, usuarios } = require('./src/config/supabase.config');
    console.log('✅ Configuración importada correctamente\n');

    // Test 2: Conexión a la base de datos
    console.log('📋 Test 2: Conectando a Supabase...');
    await initializeDatabase();
    console.log('✅ Conexión establecida correctamente\n');

    // Test 3: Listar secciones
    console.log('📋 Test 3: Obteniendo secciones...');
    const seccionesData = await secciones.getAll();
    console.log(`✅ Secciones obtenidas: ${seccionesData.length}`);
    seccionesData.forEach(seccion => {
      console.log(`   - ${seccion.nombre}: ${seccion.nombre_completo}`);
    });
    console.log('');

    // Test 4: Buscar usuarios
    console.log('📋 Test 4: Obteniendo usuarios...');
    const usuariosData = await usuarios.getAll();
    console.log(`✅ Usuarios encontrados: ${usuariosData.length}`);

    if (usuariosData.length > 0) {
      console.log('   Usuarios existentes:');
      usuariosData.forEach(usuario => {
        console.log(`   - ${usuario.nombre} ${usuario.apellidos} (${usuario.email})`);
      });
    } else {
      console.log('   ℹ️  No hay usuarios registrados aún');
    }
    console.log('');

    // Test 5: Probar modelo de usuario migrado
    console.log('📋 Test 5: Probando modelo de usuario migrado...');
    const Usuario = require('./src/models/usuario.model.supabase');
    const usuariosModelo = await Usuario.findAll();
    console.log(`✅ Modelo migrado funciona correctamente: ${usuariosModelo.length} usuarios\n`);

    // Resumen
    console.log('🎉 ¡MIGRACIÓN A SUPABASE EXITOSA!');
    console.log('✅ Configuración correcta');
    console.log('✅ Conexión establecida');
    console.log('✅ Secciones cargadas');
    console.log('✅ Modelo de usuarios migrado');
    console.log('\n🚀 Ya puedes usar el sistema con Supabase PostgreSQL');

  } catch (error) {
    console.error('❌ Error en el test de Supabase:');
    console.error('Mensaje:', error.message);

    if (error.message.includes('service_role')) {
      console.error('\n⚠️  SOLUCIÓN: Añade la SERVICE_ROLE_KEY en el archivo .env');
      console.error('1. Ve a tu proyecto Supabase');
      console.error('2. Settings > API');
      console.error('3. Copia la "service_role" key');
      console.error('4. Actualiza SUPABASE_SERVICE_KEY en .env');
    }

    if (error.message.includes('Invalid JWT')) {
      console.error('\n⚠️  SOLUCIÓN: Verifica las keys de Supabase');
      console.error('Asegúrate de que SUPABASE_URL y las keys sean correctas');
    }

    console.error('\n🔧 Variables de entorno actuales:');
    console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Falta');
    console.error('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Falta');
    console.error('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ Falta');
  }
}

// Ejecutar test
testSupabaseConnection();