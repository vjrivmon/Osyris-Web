/**
 * Script para insertar miembros del equipo de todas las secciones
 * Completa los IDs que faltaban en el seed principal
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'osyris_user',
  password: 'osyris_password',
  database: 'osyris_db'
});

// Miembros del equipo por sección (3 campos por miembro: photo, name, role)
const teamMembers = [
  // CASTORES (530+)
  { id: 531, identificador: 'team-0-photo', tipo: 'imagen', seccion: 'castores', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 532, identificador: 'team-0-name', tipo: 'texto', seccion: 'castores', contenido: 'Ana García' },
  { id: 533, identificador: 'team-0-role', tipo: 'texto', seccion: 'castores', contenido: 'Responsable Castores' },
  { id: 534, identificador: 'team-1-photo', tipo: 'imagen', seccion: 'castores', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 535, identificador: 'team-1-name', tipo: 'texto', seccion: 'castores', contenido: 'Carlos Ruiz' },
  { id: 536, identificador: 'team-1-role', tipo: 'texto', seccion: 'castores', contenido: 'Monitor' },

  // MANADA (630+)
  { id: 631, identificador: 'team-0-photo', tipo: 'imagen', seccion: 'manada', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 632, identificador: 'team-0-name', tipo: 'texto', seccion: 'manada', contenido: 'Laura Martín' },
  { id: 633, identificador: 'team-0-role', tipo: 'texto', seccion: 'manada', contenido: 'Akela' },
  { id: 634, identificador: 'team-1-photo', tipo: 'imagen', seccion: 'manada', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 635, identificador: 'team-1-name', tipo: 'texto', seccion: 'manada', contenido: 'Pedro López' },
  { id: 636, identificador: 'team-1-role', tipo: 'texto', seccion: 'manada', contenido: 'Baloo' },
  { id: 637, identificador: 'team-2-photo', tipo: 'imagen', seccion: 'manada', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 638, identificador: 'team-2-name', tipo: 'texto', seccion: 'manada', contenido: 'María Sánchez' },
  { id: 639, identificador: 'team-2-role', tipo: 'texto', seccion: 'manada', contenido: 'Bagheera' },

  // TROPA (730+)
  { id: 731, identificador: 'team-0-photo', tipo: 'imagen', seccion: 'tropa', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 732, identificador: 'team-0-name', tipo: 'texto', seccion: 'tropa', contenido: 'Javier Díaz' },
  { id: 733, identificador: 'team-0-role', tipo: 'texto', seccion: 'tropa', contenido: 'Responsable Tropa' },
  { id: 734, identificador: 'team-1-photo', tipo: 'imagen', seccion: 'tropa', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 735, identificador: 'team-1-name', tipo: 'texto', seccion: 'tropa', contenido: 'Elena Torres' },
  { id: 736, identificador: 'team-1-role', tipo: 'texto', seccion: 'tropa', contenido: 'Monitora' },
  { id: 737, identificador: 'team-2-photo', tipo: 'imagen', seccion: 'tropa', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 738, identificador: 'team-2-name', tipo: 'texto', seccion: 'tropa', contenido: 'Miguel Fernández' },
  { id: 739, identificador: 'team-2-role', tipo: 'texto', seccion: 'tropa', contenido: 'Monitor' },

  // PIONEROS (830+)
  { id: 831, identificador: 'team-0-photo', tipo: 'imagen', seccion: 'pioneros', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 832, identificador: 'team-0-name', tipo: 'texto', seccion: 'pioneros', contenido: 'Sofía Ramírez' },
  { id: 833, identificador: 'team-0-role', tipo: 'texto', seccion: 'pioneros', contenido: 'Responsable Pioneros' },
  { id: 834, identificador: 'team-1-photo', tipo: 'imagen', seccion: 'pioneros', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 835, identificador: 'team-1-name', tipo: 'texto', seccion: 'pioneros', contenido: 'David Moreno' },
  { id: 836, identificador: 'team-1-role', tipo: 'texto', seccion: 'pioneros', contenido: 'Monitor' },

  // RUTAS (930+)
  { id: 931, identificador: 'team-0-photo', tipo: 'imagen', seccion: 'rutas', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 932, identificador: 'team-0-name', tipo: 'texto', seccion: 'rutas', contenido: 'Pablo Jiménez' },
  { id: 933, identificador: 'team-0-role', tipo: 'texto', seccion: 'rutas', contenido: 'Responsable Ruta' },
  { id: 934, identificador: 'team-1-photo', tipo: 'imagen', seccion: 'rutas', contenido: '/placeholder.svg?height=100&width=100' },
  { id: 935, identificador: 'team-1-name', tipo: 'texto', seccion: 'rutas', contenido: 'Carmen Vargas' },
  { id: 936, identificador: 'team-1-role', tipo: 'texto', seccion: 'rutas', contenido: 'Monitora' },
];

async function seedTeamMembers() {
  console.log('🌱 Insertando miembros del equipo de todas las secciones...\n');

  let inserted = 0;
  let skipped = 0;

  for (const item of teamMembers) {
    try {
      // Verificar si ya existe
      const exists = await pool.query(
        'SELECT id FROM contenido_editable WHERE id = $1',
        [item.id]
      );

      if (exists.rows.length > 0) {
        console.log(`⏭️  ${item.identificador} (${item.id}) - ya existe`);
        skipped++;
        continue;
      }

      // Insertar
      await pool.query(
        `INSERT INTO contenido_editable (
          id, seccion, identificador, tipo, contenido_texto, url_archivo,
          metadata, activo, creado_por, modificado_por
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          item.id,
          item.seccion,
          item.identificador,
          item.tipo,
          item.tipo === 'texto' ? item.contenido : null,
          item.tipo === 'imagen' ? item.contenido : null,
          {},
          true,
          1, // admin user
          1
        ]
      );

      console.log(`✅ ${item.identificador} (${item.id})`);
      inserted++;
    } catch (err) {
      console.error(`❌ Error en ${item.identificador}:`, err.message);
    }
  }

  console.log(`\n✨ Seed completado:`);
  console.log(`   Insertados: ${inserted}`);
  console.log(`   Omitidos: ${skipped}`);
  console.log(`   Total: ${teamMembers.length}`);

  await pool.end();
}

seedTeamMembers().catch(err => {
  console.error('Error fatal:', err);
  pool.end();
  process.exit(1);
});
