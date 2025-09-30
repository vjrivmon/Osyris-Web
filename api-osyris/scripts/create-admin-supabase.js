#!/usr/bin/env node
/**
 * 🔧 Script para crear usuario admin en Supabase
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const dbManager = require('../src/config/database.manager');

async function createAdmin() {
  console.log('👤 Creando usuario admin en Supabase...');

  try {
    await dbManager.initialize();

    // Generar hash de contraseña
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminData = {
      id: 1,
      nombre: 'Administrador',
      apellidos: 'Sistema',
      email: 'admin@grupoosyris.es',
      contraseña: hashedPassword,
      rol: 'admin',
      seccion_id: null,
      activo: true,
      fecha_registro: new Date().toISOString(),
      telefono: '666666666',
      dni: '12345678Z'
    };

    console.log('🔐 Insertando usuario admin...');
    const result = await dbManager.createUser(adminData);

    console.log('✅ Usuario admin creado exitosamente:', {
      email: adminData.email,
      password: password,
      rol: adminData.rol,
      result: result
    });

  } catch (error) {
    if (error.message.includes('duplicate key')) {
      console.log('⚠️ Usuario admin ya existe, actualizando contraseña...');

      try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const result = await dbManager.updateUser(1, {
          contraseña: hashedPassword,
          activo: true
        });
        console.log('✅ Contraseña de admin actualizada');
      } catch (updateError) {
        console.error('❌ Error actualizando admin:', updateError.message);
      }
    } else {
      console.error('❌ Error creando admin:', error.message);
    }
  } finally {
    if (dbManager.close) {
      await dbManager.close();
    }
  }
}

createAdmin();