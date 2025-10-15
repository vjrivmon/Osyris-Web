#!/usr/bin/env node

/**
 * Script para probar la resolución de URLs del API
 * Verifica que getApiUrl() funcione correctamente en diferentes escenarios
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Probando resolución de URLs del API\n');

// Simular diferentes entornos
const tests = [
  {
    name: 'Entorno Local (development)',
    env: { NODE_ENV: 'development', NEXT_PUBLIC_API_URL: '' },
    hostname: 'localhost',
    expected: 'http://localhost:5000'
  },
  {
    name: 'Entorno Producción con variable de entorno',
    env: { NODE_ENV: 'production', NEXT_PUBLIC_API_URL: 'https://api.gruposcoutosyris.es' },
    hostname: 'gruposcoutosyris.es',
    expected: 'https://api.gruposcoutosyris.es'
  },
  {
    name: 'Entorno Producción sin variable (dominio gruposcoutosyris.es)',
    env: { NODE_ENV: 'production', NEXT_PUBLIC_API_URL: '' },
    hostname: 'gruposcoutosyris.es',
    expected: 'https://api.gruposcoutosyris.es'
  },
  {
    name: 'Entorno Producción con www',
    env: { NODE_ENV: 'production', NEXT_PUBLIC_API_URL: '' },
    hostname: 'www.gruposcoutosyris.es',
    expected: 'https://api.gruposcoutosyris.es'
  },
  {
    name: 'Entorno Producción otros dominios osyris',
    env: { NODE_ENV: 'production', NEXT_PUBLIC_API_URL: '' },
    hostname: 'osyris-test.com',
    expected: 'https://api.osyris-test.com'
  }
];

// Función para crear un test temporal
function createTestFile(env, hostname) {
  const testContent = `
// Test temporal para getApiUrl
process.env.NODE_ENV = '${env.NODE_ENV || 'development'}';
process.env.NEXT_PUBLIC_API_URL = '${env.NEXT_PUBLIC_API_URL || ''}';

// Mock window.location para测试
if (typeof window === 'undefined') {
  global.window = {
    location: {
      hostname: '${hostname}',
      protocol: 'https:'
    }
  };
}

const { getApiUrl } = require('./lib/api-utils.ts');

// Ejecutar la función
try {
  const result = getApiUrl();
  console.log(result);
} catch (error) {
  console.error('ERROR:', error.message);
}
`;

  fs.writeFileSync('/tmp/test-api-url.js', testContent);
}

function runTest(test) {
  console.log(`📝 ${test.name}`);
  console.log(`   Hostname: ${test.hostname}`);
  console.log(`   Expected: ${test.expected}`);

  try {
    // Crear archivo de prueba temporal
    createTestFile(test.env, test.hostname);

    // Ejecutar test con Node.js (transpilado)
    const result = execSync('node -r @babel/register /tmp/test-api-url.js',
      { encoding: 'utf8', timeout: 5000 }
    ).trim();

    console.log(`   ✅ Result: ${result}`);

    if (result === test.expected) {
      console.log(`   ✅ PASS`);
    } else {
      console.log(`   ❌ FAIL - Expected ${test.expected}, got ${result}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }

  console.log('');
}

// Ejecutar todos los tests
tests.forEach(test => runTest(test));

// Limpiar
if (fs.existsSync('/tmp/test-api-url.js')) {
  fs.unlinkSync('/tmp/test-api-url.js');
}

console.log('✅ Pruebas completadas');

// Verificar configuración actual
console.log('\n🔍 Verificando configuración actual:');

try {
  const envContent = fs.readFileSync('.env.production', 'utf8');
  const apiUrlMatch = envContent.match(/NEXT_PUBLIC_API_URL=(.+)/);

  if (apiUrlMatch) {
    console.log(`   NEXT_PUBLIC_API_URL: ${apiUrlMatch[1]}`);
  }

  const corsMatch = envContent.match(/ALLOWED_ORIGINS=(.+)/);
  if (corsMatch) {
    console.log(`   ALLOWED_ORIGINS: ${corsMatch[1]}`);
  }
} catch (error) {
  console.log('   No se pudo leer .env.production');
}

console.log('\n📋 Resumen de cambios aplicados:');
console.log('   ✅ Mejorada detección automática de dominio gruposcoutosyris.es');
console.log('   ✅ Corregido AuthContext para usar getApiUrl()');
console.log('   ✅ Actualizados componentes para usar getApiUrl()');
console.log('   ✅ Corregido API route de verify');
console.log('   ✅ Actualizado .env.production con dominio correcto');

console.log('\n🚀 Pasos siguientes:');
console.log('   1. Deploy los cambios a producción');
console.log('   2. Los usuarios deberán cerrar sesión y volver a iniciar');
console.log('   3. Verificar que las llamadas al API funcionen correctamente');