#!/usr/bin/env node

/**
 * Utilidades para el manejo de contraseñas con bcryptjs
 * Incluye funciones para encriptar, verificar y generar contraseñas
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Configuración por defecto para bcrypt
 */
const DEFAULT_SALT_ROUNDS = 12;

/**
 * Encripta una contraseña usando bcryptjs
 * @param {string} password - Contraseña en texto plano
 * @param {number} saltRounds - Número de rounds para el salt (por defecto 12)
 * @returns {Promise<string>} - Contraseña encriptada
 */
async function hashPassword(password, saltRounds = DEFAULT_SALT_ROUNDS) {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('La contraseña debe ser una cadena de texto válida');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    console.log(`🔐 Encriptando contraseña con ${saltRounds} rounds...`);

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('✅ Contraseña encriptada exitosamente');
    return hashedPassword;
  } catch (error) {
    console.error('❌ Error al encriptar la contraseña:', error.message);
    throw error;
  }
}

/**
 * Verifica si una contraseña en texto plano coincide con un hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash de la contraseña
 * @returns {Promise<boolean>} - true si coinciden, false si no
 */
async function verifyPassword(password, hash) {
  try {
    if (!password || !hash) {
      throw new Error('Se requieren tanto la contraseña como el hash');
    }

    console.log('🔍 Verificando contraseña...');
    const isValid = await bcrypt.compare(password, hash);

    if (isValid) {
      console.log('✅ Contraseña válida');
    } else {
      console.log('❌ Contraseña inválida');
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error al verificar la contraseña:', error.message);
    throw error;
  }
}

/**
 * Genera una contraseña aleatoria segura
 * @param {number} length - Longitud de la contraseña (por defecto 12)
 * @param {object} options - Opciones para la generación
 * @returns {string} - Contraseña generada
 */
function generatePassword(length = 12, options = {}) {
  const defaults = {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true // Excluir caracteres similares como 0, O, 1, l, I
  };

  const config = { ...defaults, ...options };

  let charset = '';

  if (config.includeLowercase) {
    charset += config.excludeSimilar ? 'abcdefghijkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  }

  if (config.includeUppercase) {
    charset += config.excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }

  if (config.includeNumbers) {
    charset += config.excludeSimilar ? '23456789' : '0123456789';
  }

  if (config.includeSymbols) {
    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }

  if (charset === '') {
    throw new Error('Debe incluir al menos un tipo de carácter');
  }

  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

/**
 * Función para obtener información sobre un hash de bcrypt
 * @param {string} hash - Hash de bcrypt
 * @returns {object} - Información del hash
 */
function getHashInfo(hash) {
  try {
    if (!hash || typeof hash !== 'string') {
      throw new Error('El hash debe ser una cadena de texto válida');
    }

    // Los hashes de bcrypt tienen el formato: $2a$rounds$salt+hash
    const parts = hash.split('$');

    if (parts.length !== 4 || parts[0] !== '' || !parts[1].startsWith('2')) {
      throw new Error('El hash no parece ser un hash válido de bcrypt');
    }

    const version = parts[1];
    const rounds = parseInt(parts[2]);
    const saltAndHash = parts[3];

    return {
      version,
      rounds,
      saltLength: 22, // bcrypt siempre usa 22 caracteres para el salt
      hashLength: saltAndHash.length - 22,
      isValid: true
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Script de línea de comandos para usar las utilidades
 */
async function runCLI() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'hash':
        if (!args[1]) {
          console.error('❌ Uso: node password-utils.js hash <contraseña> [rounds]');
          process.exit(1);
        }
        const password = args[1];
        const rounds = args[2] ? parseInt(args[2]) : DEFAULT_SALT_ROUNDS;
        const hashed = await hashPassword(password, rounds);
        console.log('🔑 Hash generado:');
        console.log(hashed);
        break;

      case 'verify':
        if (!args[1] || !args[2]) {
          console.error('❌ Uso: node password-utils.js verify <contraseña> <hash>');
          process.exit(1);
        }
        const plainPassword = args[1];
        const hashToVerify = args[2];
        const isValid = await verifyPassword(plainPassword, hashToVerify);
        console.log(`🔍 Resultado: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
        break;

      case 'generate':
        const length = args[1] ? parseInt(args[1]) : 12;
        const generatedPassword = generatePassword(length);
        console.log('🎲 Contraseña generada:');
        console.log(generatedPassword);
        console.log('\n🔐 Hash de la contraseña:');
        const generatedHash = await hashPassword(generatedPassword);
        console.log(generatedHash);
        break;

      case 'info':
        if (!args[1]) {
          console.error('❌ Uso: node password-utils.js info <hash>');
          process.exit(1);
        }
        const hashInfo = getHashInfo(args[1]);
        console.log('ℹ️  Información del hash:');
        console.log(JSON.stringify(hashInfo, null, 2));
        break;

      default:
        console.log('🔧 Utilidades de contraseñas para Osyris Scout Management');
        console.log('\nComandos disponibles:');
        console.log('  hash <contraseña> [rounds]     - Encripta una contraseña');
        console.log('  verify <contraseña> <hash>     - Verifica una contraseña contra un hash');
        console.log('  generate [longitud]            - Genera una contraseña aleatoria');
        console.log('  info <hash>                    - Muestra información sobre un hash');
        console.log('\nEjemplos:');
        console.log('  node password-utils.js hash admin123');
        console.log('  node password-utils.js generate 16');
        console.log('  node password-utils.js verify admin123 $2b$12$...');
        break;
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar CLI si el script se llama directamente
if (require.main === module) {
  runCLI();
}

module.exports = {
  hashPassword,
  verifyPassword,
  generatePassword,
  getHashInfo,
  DEFAULT_SALT_ROUNDS
};