const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de PostgreSQL (usa las variables de entorno del backend)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function applySchema() {
  const client = await pool.connect();

  try {
    console.log('📋 Aplicando schema de contenido editable...');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, '../database/schema-content-editor.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar el SQL
    await client.query(sql);

    console.log('✅ Schema aplicado correctamente');

  } catch (error) {
    console.error('❌ Error al aplicar schema:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
applySchema()
  .then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
