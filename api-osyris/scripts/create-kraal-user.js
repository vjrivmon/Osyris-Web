#!/usr/bin/env node
/**
 * 🔧 Script para crear usuario kraal en Supabase
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const dbManager = require('../src/config/database.manager');

async function createKraal() {
  console.log('👤 Creando usuario kraal en Supabase...');

  try {
    await dbManager.initialize();

    // Generar hash de contraseña
    const password = 'kraal123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const kraalData = {
      id: 2,
      nombre: 'Kraal',
      apellidos: 'Osyris',
      email: 'kraal@osyris.es',
      contraseña: hashedPassword,
      rol: 'scouter',
      seccion_id: 1, // Seccion de castores
      activo: true,
      fecha_registro: new Date().toISOString(),
      telefono: '777777777',
      dni: '87654321X'
    };

    console.log('🔐 Insertando usuario kraal...');
    const result = await dbManager.createUser(kraalData);

    console.log('✅ Usuario kraal creado exitosamente:', {
      email: kraalData.email,
      password: password,
      rol: kraalData.rol,
      result: result
    });

  } catch (error) {
    if (error.message.includes('duplicate key')) {
      console.log('⚠️ Usuario kraal ya existe, actualizando contraseña...');

      try {
        const hashedPassword = await bcrypt.hash('kraal123', 10);
        const result = await dbManager.updateUser(2, {
          contraseña: hashedPassword,
          activo: true,
          rol: 'scouter'
        });
        console.log('✅ Contraseña de kraal actualizada');
      } catch (updateError) {
        console.error('❌ Error actualizando kraal:', updateError.message);
      }
    } else {
      console.error('❌ Error creando kraal:', error.message);
    }
  } finally {
    if (dbManager.close) {
      await dbManager.close();
    }
  }
}

createKraal();