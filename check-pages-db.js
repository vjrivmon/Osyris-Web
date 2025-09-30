const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'osyris.db');

console.log('🔍 Verificando datos de páginas en la base de datos...\n');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    return;
  }
  console.log('✅ Conectado a la base de datos SQLite');
});

// Verificar si la tabla páginas existe
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='paginas';", (err, row) => {
  if (err) {
    console.error('Error al verificar tabla páginas:', err.message);
    return;
  }

  if (!row) {
    console.log('❌ La tabla "paginas" no existe');
    db.close();
    return;
  }

  console.log('✅ Tabla "paginas" encontrada\n');

  // Contar total de páginas
  db.get('SELECT COUNT(*) as total FROM paginas', (err, row) => {
    if (err) {
      console.error('Error al contar páginas:', err.message);
      return;
    }

    console.log(`📊 Total de páginas: ${row.total}\n`);

    if (row.total > 0) {
      // Mostrar algunas páginas
      db.all('SELECT id, titulo, slug, estado, contenido FROM paginas LIMIT 5', (err, rows) => {
        if (err) {
          console.error('Error al obtener páginas:', err.message);
          return;
        }

        console.log('📄 Páginas encontradas:');
        console.log('═══════════════════════');

        rows.forEach(page => {
          console.log(`ID: ${page.id}`);
          console.log(`Título: ${page.titulo}`);
          console.log(`Slug: ${page.slug}`);
          console.log(`Estado: ${page.estado}`);
          console.log(`Contenido: ${page.contenido ? page.contenido.substring(0, 100) + '...' : 'Sin contenido'}`);
          console.log('---');
        });
      });
    } else {
      console.log('📝 No hay páginas en la base de datos');
      console.log('💡 Necesitas crear páginas de ejemplo');
    }

    db.close();
  });
});