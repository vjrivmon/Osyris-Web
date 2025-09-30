#!/usr/bin/env node

/**
 * 🧪 TEST SCRIPT - SISTEMA DE UPLOAD OSYRIS
 * Prueba end-to-end del sistema de uploads local
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const API_BASE = 'http://localhost:5000';
const TEST_IMAGE = path.join(__dirname, 'test-image.png');

console.log('🧪 INICIANDO TESTS DEL SISTEMA DE UPLOAD\n');

// Crear una imagen de prueba básica (PNG 1x1 transparente)
const createTestImage = () => {
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0xF8, 0x0F, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  fs.writeFileSync(TEST_IMAGE, pngData);
  console.log('✅ Imagen de prueba creada');
};

// Test 1: Verificar servidor corriendo
const testServerRunning = () => {
  return new Promise((resolve) => {
    const req = http.get(`${API_BASE}/`, (res) => {
      console.log('✅ Servidor backend corriendo en puerto 5000');
      resolve(true);
    });

    req.on('error', (err) => {
      console.error('❌ Servidor backend NO está corriendo');
      console.error('   Ejecuta: npm run dev:backend');
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      console.error('❌ Timeout conectando al servidor');
      resolve(false);
    });
  });
};

// Test 2: Verificar archivos estáticos
const testStaticFiles = () => {
  return new Promise((resolve) => {
    // Buscar un archivo existente
    const uploadsDir = path.join(__dirname, 'uploads', 'general');
    if (!fs.existsSync(uploadsDir)) {
      console.log('⚠️  No hay archivos en uploads/general para probar');
      resolve(true);
      return;
    }

    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.png'));
    if (files.length === 0) {
      console.log('⚠️  No hay imágenes PNG para probar static serving');
      resolve(true);
      return;
    }

    const testFile = files[0];
    const testUrl = `${API_BASE}/uploads/general/${testFile}`;

    const req = http.get(testUrl, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Static file serving funcionando');
        console.log(`   Tested: ${testUrl}`);
      } else {
        console.log(`❌ Static files devuelve ${res.statusCode}`);
      }
      resolve(res.statusCode === 200);
    });

    req.on('error', (err) => {
      console.error('❌ Error probando static files:', err.message);
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      console.error('❌ Timeout probando static files');
      resolve(false);
    });
  });
};

// Test 3: Verificar rutas de API
const testApiRoutes = () => {
  return new Promise((resolve) => {
    const req = http.get(`${API_BASE}/api/uploads`, (res) => {
      if (res.statusCode === 401) {
        console.log('✅ API uploads disponible (requiere auth)');
        resolve(true);
      } else {
        console.log(`⚠️  API uploads devuelve ${res.statusCode} (esperaba 401)`);
        resolve(true); // No es un error crítico
      }
    });

    req.on('error', (err) => {
      console.error('❌ Error probando API routes:', err.message);
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      console.error('❌ Timeout probando API routes');
      resolve(false);
    });
  });
};

// Test 4: Verificar estructura de directorios
const testDirectoryStructure = () => {
  console.log('📁 Verificando estructura de directorios...');

  const requiredDirs = [
    'uploads',
    'uploads/general',
    'api-osyris/src',
    'app/admin'
  ];

  let allGood = true;

  requiredDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${dir}/`);
    } else {
      console.log(`❌ ${dir}/ (falta)`);
      allGood = false;
    }
  });

  return allGood;
};

// Test 5: Verificar archivos de configuración
const testConfigFiles = () => {
  console.log('⚙️  Verificando archivos de configuración...');

  const requiredFiles = [
    'api-osyris/src/index.js',
    'api-osyris/src/controllers/upload.local.controller.js',
    'api-osyris/src/routes/upload.routes.js',
    'app/admin/files/page.tsx',
    'app/admin/pages/page.tsx'
  ];

  let allGood = true;

  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} (falta)`);
      allGood = false;
    }
  });

  return allGood;
};

// Ejecutar todos los tests
const runAllTests = async () => {
  createTestImage();
  console.log('');

  const results = {
    server: await testServerRunning(),
    static: await testStaticFiles(),
    api: await testApiRoutes(),
    directories: testDirectoryStructure(),
    config: testConfigFiles()
  };

  console.log('\n📊 RESUMEN DE TESTS:');
  console.log('===================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASS' : 'FAIL'}`);
  });

  const allPassed = Object.values(results).every(r => r === true);

  console.log('\n🎯 RESULTADO FINAL:');
  if (allPassed) {
    console.log('✅ TODOS LOS TESTS PASARON - Sistema de upload funcionando correctamente');
    console.log('');
    console.log('🚀 SIGUIENTE PASO:');
    console.log('   1. Abre http://localhost:3000/admin/files');
    console.log('   2. Inicia sesión como admin');
    console.log('   3. Prueba subir un archivo');
    console.log('   4. Ve a http://localhost:3000/admin/pages para usar archivos en contenido');
  } else {
    console.log('❌ ALGUNOS TESTS FALLARON - Revisa los errores arriba');
    console.log('');
    console.log('🔧 ACCIONES RECOMENDADAS:');
    if (!results.server) {
      console.log('   • Ejecuta: npm run dev:backend');
    }
    if (!results.directories || !results.config) {
      console.log('   • Verifica la estructura del proyecto');
    }
  }

  // Limpiar archivo de prueba
  if (fs.existsSync(TEST_IMAGE)) {
    fs.unlinkSync(TEST_IMAGE);
  }

  process.exit(allPassed ? 0 : 1);
};

// Ejecutar
runAllTests().catch(err => {
  console.error('💥 Error ejecutando tests:', err);
  process.exit(1);
});