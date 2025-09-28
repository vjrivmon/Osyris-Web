#!/usr/bin/env node

/**
 * Script de prueba completo del sistema de autenticación
 * del proyecto Osyris Scout Management
 */

const path = require('path');

// Configurar el path para que funcione desde el directorio scripts
process.chdir(path.join(__dirname, '..'));

const { initializeDatabase, closeDatabase } = require('../src/config/db.config');
const authController = require('../src/controllers/auth.controller');
const { verifyToken } = require('../src/middleware/auth.middleware');
const jwt = require('jsonwebtoken');

/**
 * Función auxiliar para simular request/response
 */
function createMockResponse() {
  let statusCode = 200;
  let responseData = null;

  return {
    res: {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
            return { statusCode, data: responseData };
          }
        };
      },
      json: (data) => {
        responseData = data;
        return { statusCode, data: responseData };
      }
    },
    getResult: () => ({ statusCode, data: responseData })
  };
}

/**
 * Test 1: Login con credenciales correctas
 */
async function testValidLogin() {
  console.log('\n🧪 Test 1: Login con credenciales válidas');

  const req = {
    body: {
      email: 'admin@osyris.com',
      password: 'admin123'
    }
  };

  const mock = createMockResponse();
  await authController.login(req, mock.res);
  const result = mock.getResult();

  if (result.statusCode === 200 && result.data.success) {
    console.log('✅ Login exitoso');
    console.log(`   Token generado: ${result.data.data.token ? 'SÍ' : 'NO'}`);
    console.log(`   Usuario: ${result.data.data.usuario.nombre} ${result.data.data.usuario.apellidos}`);
    return result.data.data.token;
  } else {
    console.log('❌ Login falló');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Error: ${result.data.message}`);
    return null;
  }
}

/**
 * Test 2: Login con credenciales incorrectas
 */
async function testInvalidLogin() {
  console.log('\n🧪 Test 2: Login con credenciales inválidas');

  const req = {
    body: {
      email: 'admin@osyris.com',
      password: 'contraseña_incorrecta'
    }
  };

  const mock = createMockResponse();
  await authController.login(req, mock.res);
  const result = mock.getResult();

  if (result.statusCode === 401 && !result.data.success) {
    console.log('✅ Credenciales incorrectas rechazadas correctamente');
    console.log(`   Mensaje: ${result.data.message}`);
    return true;
  } else {
    console.log('❌ Las credenciales incorrectas fueron aceptadas (ERROR DE SEGURIDAD)');
    console.log(`   Status: ${result.statusCode}`);
    return false;
  }
}

/**
 * Test 3: Verificación de token
 */
async function testTokenVerification(token) {
  console.log('\n🧪 Test 3: Verificación de token');

  if (!token) {
    console.log('❌ No hay token para verificar');
    return false;
  }

  const req = {
    headers: {
      authorization: `Bearer ${token}`
    }
  };

  let mockUser = null;
  let mockTokenPayload = null;

  const res = {
    status: (code) => ({
      json: (data) => {
        console.log(`   Status: ${code}`);
        if (code !== 200) {
          console.log(`   Error: ${data.message}`);
        }
      }
    })
  };

  const next = () => {
    console.log('✅ Token verificado correctamente');
    console.log(`   Usuario: ${req.usuario.nombre} ${req.usuario.apellidos}`);
    console.log(`   Rol: ${req.usuario.rol}`);
    console.log(`   Token expira: ${new Date(req.tokenPayload.exp * 1000).toLocaleString()}`);
    return true;
  };

  try {
    await verifyToken(req, res, next);
    return true;
  } catch (error) {
    console.log('❌ Error en verificación de token:', error.message);
    return false;
  }
}

/**
 * Test 4: Endpoint de verificación de autenticación
 */
async function testAuthVerifyEndpoint(token) {
  console.log('\n🧪 Test 4: Endpoint /api/auth/verify');

  if (!token) {
    console.log('❌ No hay token para verificar');
    return false;
  }

  // Primero verificar el token para obtener el usuario
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'osyrisScoutGroup2024SecretKey');
  const Usuario = require('../src/models/usuario.model');
  const usuario = await Usuario.findById(decoded.id);

  const req = {
    usuario: usuario,
    tokenPayload: decoded
  };

  const mock = createMockResponse();
  await authController.verifyAuth(req, mock.res);
  const result = mock.getResult();

  if (result.statusCode === 200 && result.data.success) {
    console.log('✅ Endpoint de verificación funciona correctamente');
    console.log(`   Usuario verificado: ${result.data.data.usuario.nombre} ${result.data.data.usuario.apellidos}`);
    console.log(`   Tiempo hasta expiración: ${result.data.data.tokenInfo.timeToExpire} segundos`);
    return true;
  } else {
    console.log('❌ Endpoint de verificación falló');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Error: ${result.data.message}`);
    return false;
  }
}

/**
 * Test 5: Login con usuario inexistente
 */
async function testNonExistentUser() {
  console.log('\n🧪 Test 5: Login con usuario inexistente');

  const req = {
    body: {
      email: 'usuario_inexistente@osyris.com',
      password: 'cualquier_contraseña'
    }
  };

  const mock = createMockResponse();
  await authController.login(req, mock.res);
  const result = mock.getResult();

  if (result.statusCode === 404 && !result.data.success) {
    console.log('✅ Usuario inexistente rechazado correctamente');
    console.log(`   Mensaje: ${result.data.message}`);
    return true;
  } else {
    console.log('❌ Usuario inexistente no fue rechazado adecuadamente');
    console.log(`   Status: ${result.statusCode}`);
    return false;
  }
}

/**
 * Función principal de pruebas
 */
async function runAllTests() {
  console.log('🧪 Ejecutando suite de pruebas del sistema de autenticación');
  console.log('=' * 70);

  let passedTests = 0;
  let totalTests = 5;
  let token = null;

  try {
    // Inicializar la base de datos
    console.log('🔄 Inicializando base de datos...');
    await initializeDatabase();
    console.log('✅ Base de datos inicializada');

    // Test 1: Login válido
    token = await testValidLogin();
    if (token) passedTests++;

    // Test 2: Login inválido
    const test2 = await testInvalidLogin();
    if (test2) passedTests++;

    // Test 3: Verificación de token
    const test3 = await testTokenVerification(token);
    if (test3) passedTests++;

    // Test 4: Endpoint de verificación
    const test4 = await testAuthVerifyEndpoint(token);
    if (test4) passedTests++;

    // Test 5: Usuario inexistente
    const test5 = await testNonExistentUser();
    if (test5) passedTests++;

    // Resumen
    console.log('\n📊 RESUMEN DE PRUEBAS');
    console.log('=' * 50);
    console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);
    console.log(`❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}`);
    console.log(`📈 Porcentaje de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 ¡Todas las pruebas pasaron! El sistema está funcionando correctamente.');
      console.log('\n🔐 Credenciales del administrador:');
      console.log('   📧 Email: admin@osyris.com');
      console.log('   🔒 Contraseña: admin123');
      console.log('\n⚠️  Recuerda cambiar la contraseña en producción.');
    } else {
      console.log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
    }

  } catch (error) {
    console.error('\n💥 Error fatal durante las pruebas:', error.message);
  } finally {
    // Cerrar la conexión a la base de datos
    await closeDatabase();
  }

  return passedTests === totalTests;
}

// Ejecutar las pruebas si se llama directamente
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testValidLogin,
  testInvalidLogin,
  testTokenVerification,
  testAuthVerifyEndpoint,
  testNonExistentUser
};