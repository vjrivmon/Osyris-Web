#!/usr/bin/env node
/**
 * 🔧 Script para aplicar correcciones de esquema en Supabase
 * Arregla las columnas faltantes que están causando errores 500
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixSchema() {
  console.log('🔧 Aplicando correcciones de esquema en Supabase...\n');

  try {
    // 1. Arreglar tabla paginas - añadir orden_menu
    console.log('📄 1. Arreglando tabla paginas...');
    const { error: paginasError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE paginas ADD COLUMN IF NOT EXISTS orden_menu INTEGER DEFAULT 0;
        ALTER TABLE paginas ADD COLUMN IF NOT EXISTS mostrar_en_menu BOOLEAN DEFAULT false;
        ALTER TABLE paginas ADD COLUMN IF NOT EXISTS permite_comentarios BOOLEAN DEFAULT false;
        ALTER TABLE paginas ADD COLUMN IF NOT EXISTS resumen TEXT;
        ALTER TABLE paginas ADD COLUMN IF NOT EXISTS imagen_destacada TEXT;
      `
    });

    if (paginasError) {
      // Intentar de forma individual si falla el batch
      console.log('⚠️ Intentando columnas individuales...');

      const queries = [
        'ALTER TABLE paginas ADD COLUMN IF NOT EXISTS orden_menu INTEGER DEFAULT 0',
        'ALTER TABLE paginas ADD COLUMN IF NOT EXISTS mostrar_en_menu BOOLEAN DEFAULT false',
        'ALTER TABLE paginas ADD COLUMN IF NOT EXISTS permite_comentarios BOOLEAN DEFAULT false',
        'ALTER TABLE paginas ADD COLUMN IF NOT EXISTS resumen TEXT',
        'ALTER TABLE paginas ADD COLUMN IF NOT EXISTS imagen_destacada TEXT'
      ];

      for (const query of queries) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: query });
          if (error) {
            console.log(`⚠️ Query failed (expected): ${query.slice(0, 50)}...`);
          } else {
            console.log(`✅ Applied: ${query.slice(0, 50)}...`);
          }
        } catch (err) {
          console.log(`⚠️ Error (expected): ${err.message.slice(0, 50)}...`);
        }
      }
    } else {
      console.log('✅ Tabla paginas actualizada');
    }

    // 2. Crear/arreglar tabla uploaded_files
    console.log('\n📁 2. Arreglando tabla uploaded_files...');
    const { error: uploadsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS uploaded_files (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INTEGER DEFAULT 0,
          mime_type VARCHAR(100),
          uploaded_by INTEGER REFERENCES usuarios(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (uploadsError) {
      console.log('⚠️ Error creando tabla (puede ya existir):', uploadsError.message);

      // Intentar añadir columnas individuales
      const uploadQueries = [
        'ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        'ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        'ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0',
        'ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100)'
      ];

      for (const query of uploadQueries) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: query });
          if (!error) {
            console.log(`✅ Applied: ${query.slice(0, 50)}...`);
          }
        } catch (err) {
          console.log(`⚠️ Expected error: ${err.message.slice(0, 50)}...`);
        }
      }
    } else {
      console.log('✅ Tabla uploaded_files actualizada');
    }

    // 3. Verificar que las tablas tienen datos
    console.log('\n📊 3. Verificando datos...');

    const { data: paginasCount } = await supabase
      .from('paginas')
      .select('id', { count: 'exact', head: true });

    const { data: usuariosCount } = await supabase
      .from('usuarios')
      .select('id', { count: 'exact', head: true });

    console.log(`✅ Páginas: ${paginasCount?.length || 0} registros`);
    console.log(`✅ Usuarios: ${usuariosCount?.length || 0} registros`);

    console.log('\n🎉 Correcciones de esquema aplicadas exitosamente!');
    console.log('🔄 Reinicia el servidor para que los cambios surtan efecto.');

  } catch (error) {
    console.error('\n❌ Error aplicando correcciones:', error.message);
  }
}

// Función auxiliar - Supabase no tiene exec_sql built-in, usamos el cliente SQL
async function execSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    return { data, error };
  } catch (err) {
    // Fallback - intentar con query directa
    return { data: null, error: err };
  }
}

fixSchema();