const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuración de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'osyris_user',
  password: process.env.DB_PASSWORD || 'osyris_password',
  database: process.env.DB_NAME || 'osyris_db',
});

async function seedContent() {
  const client = await pool.connect();

  try {
    console.log('🌱 Insertando contenido de la landing page...');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, '../database/seed-landing-content.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar el SQL
    await client.query(sql);

    console.log('✅ Contenido insertado correctamente');

    // Verificar
    const result = await client.query(
      "SELECT COUNT(*) as total FROM contenido_editable WHERE seccion = 'landing'"
    );

    console.log(`📊 Total de elementos en la landing: ${result.rows[0].total}`);

  } catch (error) {
    console.error('❌ Error al insertar contenido:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
seedContent()
  .then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
