const { Pool } = require('pg');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function checkContent() {
  const client = await pool.connect();

  try {
    console.log('🔍 Verificando contenido en la base de datos...\n');

    // Ver todos los registros
    const allContent = await client.query(
      `SELECT id, seccion, identificador, tipo,
       SUBSTRING(contenido_texto, 1, 50) as contenido
       FROM contenido_editable
       ORDER BY id`
    );

    console.log(`📊 Total registros: ${allContent.rows.length}\n`);

    if (allContent.rows.length > 0) {
      console.log('Registros encontrados:');
      console.log('---');
      allContent.rows.forEach(row => {
        console.log(`ID: ${row.id} | Sección: ${row.seccion} | Tipo: ${row.tipo} | ID: ${row.identificador}`);
        if (row.contenido) {
          console.log(`   Contenido: ${row.contenido}...`);
        }
        console.log('');
      });
    } else {
      console.log('⚠️  No hay contenido en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkContent();
