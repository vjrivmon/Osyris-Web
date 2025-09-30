#!/usr/bin/env node
/**
 * 🔧 Script para arreglar el esquema SQLite antes de migración
 */

require('dotenv').config();
const dbManager = require('../src/config/database.manager');

async function fixSchema() {
  console.log('🔧 Arreglando esquema SQLite...');

  try {
    await dbManager.initialize();

    // Intentar añadir columnas faltantes directamente a través del database manager
    console.log('📋 Verificando y actualizando esquemas...');

    // Para secciones, añadir columna orden si no existe
    try {
      await dbManager.db.query("ALTER TABLE secciones ADD COLUMN orden INTEGER DEFAULT 0");
      console.log('✅ Columna orden añadida a secciones');
    } catch (error) {
      console.log('⚠️ Columna orden ya existe en secciones');
    }

    // Para paginas, añadir columnas faltantes
    const columnasNecesarias = [
      { name: 'orden', sql: 'ALTER TABLE paginas ADD COLUMN orden INTEGER DEFAULT 0' },
      { name: 'estado', sql: 'ALTER TABLE paginas ADD COLUMN estado VARCHAR(50) DEFAULT "publicada"' },
      { name: 'tipo', sql: 'ALTER TABLE paginas ADD COLUMN tipo VARCHAR(50) DEFAULT "pagina"' }
    ];

    for (const columna of columnasNecesarias) {
      try {
        await dbManager.db.query(columna.sql);
        console.log(`✅ Columna ${columna.name} añadida a paginas`);
      } catch (error) {
        console.log(`⚠️ Columna ${columna.name} ya existe en paginas`);
      }
    }

    // Actualizar datos existentes
    try {
      await dbManager.db.query(`
        UPDATE paginas
        SET estado = CASE WHEN visible = 1 THEN 'publicada' ELSE 'borrador' END
        WHERE estado IS NULL OR estado = ''
      `);
      console.log('✅ Estados de páginas actualizados');
    } catch (error) {
      console.log('⚠️ Error actualizando estados:', error.message);
    }

    console.log('✅ Esquema SQLite actualizado correctamente');

  } catch (error) {
    console.error('❌ Error arreglando esquema:', error);
  } finally {
    if (dbManager.close) {
      await dbManager.close();
    }
  }
}

fixSchema();