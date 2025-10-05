const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const landingContent = [
  { id: 100, identificador: 'hero-title', tipo: 'texto', contenido: 'Grupo Scout Osyris' },
  { id: 101, identificador: 'hero-subtitle', tipo: 'texto', contenido: 'Formando jóvenes a través del método scout, promoviendo valores, aventura y servicio a la comunidad desde 1981.' },
  { id: 102, identificador: 'feature-1-title', tipo: 'texto', contenido: 'Aventura y Aprendizaje' },
  { id: 103, identificador: 'feature-1-description', tipo: 'texto', contenido: 'Actividades emocionantes que combinan diversión y desarrollo personal en un entorno seguro.' },
  { id: 104, identificador: 'feature-2-title', tipo: 'texto', contenido: 'Valores y Amistad' },
  { id: 105, identificador: 'feature-2-description', tipo: 'texto', contenido: 'Fomentamos valores como el respeto, la responsabilidad y la amistad a través del método scout.' },
  { id: 106, identificador: 'feature-3-title', tipo: 'texto', contenido: 'Naturaleza y Sostenibilidad' },
  { id: 107, identificador: 'feature-3-description', tipo: 'texto', contenido: 'Conectamos con la naturaleza y aprendemos a cuidar nuestro entorno a través de actividades al aire libre.' },
  { id: 108, identificador: 'join-us-image', tipo: 'imagen', contenido: '/placeholder.svg?height=300&width=400' },
];

async function forceSeed() {
  const client = await pool.connect();

  try {
    console.log('🗑️  Eliminando contenido anterior de landing...');
    await client.query("DELETE FROM contenido_editable WHERE seccion = 'landing'");

    console.log('🌱 Insertando nuevo contenido de landing...\n');

    for (const item of landingContent) {
      const contenidoField = item.tipo === 'imagen' ? 'url_archivo' : 'contenido_texto';

      await client.query(
        `INSERT INTO contenido_editable
         (id, seccion, identificador, tipo, ${contenidoField}, creado_por, modificado_por)
         VALUES ($1, 'landing', $2, $3, $4, 1, 1)`,
        [item.id, item.identificador, item.tipo, item.contenido]
      );

      console.log(`✅ Insertado: ${item.identificador}`);
    }

    console.log('\n📊 Verificando...');
    const result = await client.query(
      "SELECT id, identificador, tipo FROM contenido_editable WHERE seccion = 'landing' ORDER BY id"
    );

    console.log(`Total: ${result.rows.length} elementos`);
    result.rows.forEach(row => {
      console.log(`  - ${row.id}: ${row.identificador} (${row.tipo})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

forceSeed()
  .then(() => {
    console.log('\n🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
