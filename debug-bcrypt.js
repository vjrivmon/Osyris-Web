const bcrypt = require('bcryptjs');

async function testBcrypt() {
  console.log('🔍 Debug de bcrypt en servidor');

  // Hash para contraseña 123456
  const hash1 = '$2b$10$Y9ARubvpCisG9OzofKyIHuXGS1Zm4U9BELepi2wLS1Q7kZP0qh4DC';
  const password = '123456';

  console.log('\n📊 Test 1: Verificación de hash existente');
  console.log('Contraseña:', password);
  console.log('Hash:', hash1);

  try {
    const result1 = await bcrypt.compare(password, hash1);
    console.log('✅ bcrypt.compare resultado:', result1);
  } catch (error) {
    console.log('❌ bcrypt.compare error:', error.message);
  }

  console.log('\n📊 Test 2: Crear nuevo hash');
  try {
    const newHash = await bcrypt.hash(password, 10);
    console.log('✅ Nuevo hash generado:', newHash);

    const result2 = await bcrypt.compare(password, newHash);
    console.log('✅ Verificación de nuevo hash:', result2);
  } catch (error) {
    console.log('❌ Error creando nuevo hash:', error.message);
  }

  console.log('\n📊 Test 3: Verificar diferentes contraseñas');
  try {
    const result3 = await bcrypt.compare('wrong', hash1);
    console.log('✅ Contraseña incorrecta (debe ser false):', result3);
  } catch (error) {
    console.log('❌ Error verificando contraseña incorrecta:', error.message);
  }

  console.log('\n🔍 Fin del debug');
}

testBcrypt().catch(console.error);