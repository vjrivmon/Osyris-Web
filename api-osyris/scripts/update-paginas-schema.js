#!/usr/bin/env node
/**
 * 🔧 Script para actualizar el esquema de la tabla paginas
 * Añade columnas faltantes para compatibilidad completa
 */

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../../database/osyris.db');

console.log('🔧 Actualizando esquema de la tabla paginas...');
console.log(`📁 Base de datos: ${DB_PATH}`);

try {
  const db = Database(DB_PATH);

  // Verificar si la tabla existe
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='paginas'
  `).get();

  if (!tableExists) {
    console.log('❌ La tabla paginas no existe');
    process.exit(1);
  }

  // Obtener el esquema actual
  const currentSchema = db.prepare("PRAGMA table_info(paginas)").all();
  console.log('📋 Esquema actual:', currentSchema.map(col => col.name));

  const existingColumns = currentSchema.map(col => col.name);

  // Definir columnas que necesitamos
  const requiredColumns = [
    { name: 'orden', sql: 'ALTER TABLE paginas ADD COLUMN orden INTEGER DEFAULT 0' },
    { name: 'estado', sql: 'ALTER TABLE paginas ADD COLUMN estado VARCHAR(50) DEFAULT "publicada"' },
    { name: 'tipo', sql: 'ALTER TABLE paginas ADD COLUMN tipo VARCHAR(50) DEFAULT "pagina"' },
    { name: 'mostrar_en_menu', sql: 'ALTER TABLE paginas ADD COLUMN mostrar_en_menu BOOLEAN DEFAULT 0' },
    { name: 'permite_comentarios', sql: 'ALTER TABLE paginas ADD COLUMN permite_comentarios BOOLEAN DEFAULT 0' },
    { name: 'resumen', sql: 'ALTER TABLE paginas ADD COLUMN resumen TEXT' },
    { name: 'imagen_destacada', sql: 'ALTER TABLE paginas ADD COLUMN imagen_destacada TEXT' }
  ];

  // Añadir columnas faltantes
  let addedColumns = 0;

  for (const column of requiredColumns) {
    if (!existingColumns.includes(column.name)) {
      try {
        console.log(`➕ Añadiendo columna: ${column.name}`);
        db.exec(column.sql);
        addedColumns++;
      } catch (error) {
        console.warn(`⚠️  Error añadiendo ${column.name}:`, error.message);
      }
    } else {
      console.log(`✅ Columna ya existe: ${column.name}`);
    }
  }

  // Actualizar datos existentes si es necesario
  if (addedColumns > 0) {
    console.log('🔄 Actualizando datos existentes...');

    // Establecer estado por defecto basado en visible
    db.exec(`
      UPDATE paginas
      SET estado = CASE WHEN visible = 1 THEN 'publicada' ELSE 'borrador' END
      WHERE estado IS NULL OR estado = ''
    `);

    // Establecer tipo por defecto
    db.exec(`
      UPDATE paginas
      SET tipo = 'pagina'
      WHERE tipo IS NULL OR tipo = ''
    `);

    console.log('✅ Datos actualizados');
  }

  // Mostrar esquema final
  const finalSchema = db.prepare("PRAGMA table_info(paginas)").all();
  console.log('📋 Esquema final:', finalSchema.map(col => col.name));

  // Contar páginas
  const count = db.prepare("SELECT COUNT(*) as count FROM paginas").get();
  console.log(`📊 Total páginas: ${count.count}`);

  db.close();
  console.log('✅ Esquema actualizado correctamente');

} catch (error) {
  console.error('❌ Error actualizando esquema:', error);
  process.exit(1);
}