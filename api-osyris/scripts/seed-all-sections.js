/**
 * Script para insertar contenido de TODAS las secciones scout
 * IDs asignados:
 * - Castores: 500-599
 * - Manada: 600-699
 * - Tropa: 700-799
 * - Pioneros: 800-899
 * - Rutas: 900-999
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'osyris_user',
  password: 'osyris_password',
  database: 'osyris_db'
});

// ==================== CASTORES (500-599) ====================
const castoresContent = [
  // Hero Section
  { id: 500, identificador: 'hero-title', tipo: 'texto', seccion: 'castores', contenido: 'Castores - Colonia La Veleta' },
  { id: 501, identificador: 'hero-subtitle', tipo: 'texto', seccion: 'castores', contenido: '"Compartir" - Niños y niñas de 5 a 7 años' },
  { id: 502, identificador: 'hero-image', tipo: 'imagen', seccion: 'castores', contenido: '/placeholder.svg?height=400&width=600' },

  // About Section
  { id: 503, identificador: 'about-title', tipo: 'texto', seccion: 'castores', contenido: '¿Quiénes son los Castores?' },
  { id: 504, identificador: 'about-description', tipo: 'texto', seccion: 'castores', contenido: 'Los Castores son los más pequeños del grupo scout. A través del juego y la fantasía, aprenden a compartir y a descubrir el mundo que les rodea.' },
  { id: 505, identificador: 'about-details', tipo: 'texto', seccion: 'castores', contenido: 'En la Colonia La Veleta, los niños y niñas de 5 a 7 años comienzan su aventura scout en un ambiente seguro y divertido.' },
  { id: 506, identificador: 'about-frame', tipo: 'texto', seccion: 'castores', contenido: 'El marco simbólico de los Castores está inspirado en el cuento "Los amigos del bosque".' },

  // Activities
  { id: 507, identificador: 'activities-title', tipo: 'texto', seccion: 'castores', contenido: '¿Qué hacen los Castores?' },
  { id: 510, identificador: 'activity-0-title', tipo: 'texto', seccion: 'castores', contenido: 'Juegos' },
  { id: 511, identificador: 'activity-0-description', tipo: 'texto', seccion: 'castores', contenido: 'Juegos educativos que fomentan la cooperación y el trabajo en equipo.' },
  { id: 512, identificador: 'activity-1-title', tipo: 'texto', seccion: 'castores', contenido: 'Manualidades' },
  { id: 513, identificador: 'activity-1-description', tipo: 'texto', seccion: 'castores', contenido: 'Desarrollan su creatividad y motricidad fina con actividades artísticas.' },
  { id: 514, identificador: 'activity-2-title', tipo: 'texto', seccion: 'castores', contenido: 'Naturaleza' },
  { id: 515, identificador: 'activity-2-description', tipo: 'texto', seccion: 'castores', contenido: 'Descubren el medio ambiente y aprenden a cuidar la naturaleza.' },

  // Methodology
  { id: 520, identificador: 'methodology-title', tipo: 'texto', seccion: 'castores', contenido: 'Metodología' },
  { id: 521, identificador: 'methodology-0-title', tipo: 'texto', seccion: 'castores', contenido: 'Aprendizaje a través del juego' },
  { id: 522, identificador: 'methodology-0-description', tipo: 'texto', seccion: 'castores', contenido: 'Todo se hace jugando, porque es la mejor forma de aprender a esta edad.' },
  { id: 523, identificador: 'methodology-1-title', tipo: 'texto', seccion: 'castores', contenido: 'Educación en valores' },
  { id: 524, identificador: 'methodology-1-description', tipo: 'texto', seccion: 'castores', contenido: 'Aprendemos a compartir, respetar y cuidar de los demás.' },

  // Team
  { id: 530, identificador: 'team-title', tipo: 'texto', seccion: 'castores', contenido: 'Nuestro Equipo' },
];

// ==================== MANADA (600-699) ====================
const manadaContent = [
  // Hero Section
  { id: 600, identificador: 'hero-title', tipo: 'texto', seccion: 'manada', contenido: 'Lobatos - Manada Waingunga' },
  { id: 601, identificador: 'hero-subtitle', tipo: 'texto', seccion: 'manada', contenido: '"Haremos lo mejor" - Niños y niñas de 7 a 10 años' },
  { id: 602, identificador: 'hero-image', tipo: 'imagen', seccion: 'manada', contenido: '/placeholder.svg?height=400&width=600' },

  // About Section
  { id: 603, identificador: 'about-title', tipo: 'texto', seccion: 'manada', contenido: '¿Quiénes son los Lobatos?' },
  { id: 604, identificador: 'about-description', tipo: 'texto', seccion: 'manada', contenido: 'En la Manada Waingunga, los lobatos viven aventuras inspiradas en "El Libro de la Selva" de Rudyard Kipling.' },
  { id: 605, identificador: 'about-details', tipo: 'texto', seccion: 'manada', contenido: 'A través del juego y las actividades en la naturaleza, desarrollan sus habilidades y aprenden los valores del escultismo.' },
  { id: 606, identificador: 'about-frame', tipo: 'texto', seccion: 'manada', contenido: 'Nuestro marco simbólico está basado en El Libro de la Selva, donde cada lobato forma parte de la Manada.' },

  // Activities
  { id: 607, identificador: 'activities-title', tipo: 'texto', seccion: 'manada', contenido: '¿Qué hacen los Lobatos?' },
  { id: 610, identificador: 'activity-0-title', tipo: 'texto', seccion: 'manada', contenido: 'Grandes Juegos' },
  { id: 611, identificador: 'activity-0-description', tipo: 'texto', seccion: 'manada', contenido: 'Aventuras y juegos dinámicos que desarrollan el compañerismo.' },
  { id: 612, identificador: 'activity-1-title', tipo: 'texto', seccion: 'manada', contenido: 'Especialidades' },
  { id: 613, identificador: 'activity-1-description', tipo: 'texto', seccion: 'manada', contenido: 'Desarrollan habilidades específicas: deporte, arte, naturaleza, ciencia...' },
  { id: 614, identificador: 'activity-2-title', tipo: 'texto', seccion: 'manada', contenido: 'Excursiones' },
  { id: 615, identificador: 'activity-2-description', tipo: 'texto', seccion: 'manada', contenido: 'Salidas a la naturaleza para descubrir y aprender del entorno.' },

  // Methodology
  { id: 620, identificador: 'methodology-title', tipo: 'texto', seccion: 'manada', contenido: 'Metodología' },
  { id: 621, identificador: 'methodology-0-title', tipo: 'texto', seccion: 'manada', contenido: 'Sistema de seisenas' },
  { id: 622, identificador: 'methodology-0-description', tipo: 'texto', seccion: 'manada', contenido: 'Los lobatos se organizan en pequeños grupos llamados seisenas.' },
  { id: 623, identificador: 'methodology-1-title', tipo: 'texto', seccion: 'manada', contenido: 'Aprendizaje activo' },
  { id: 624, identificador: 'methodology-1-description', tipo: 'texto', seccion: 'manada', contenido: 'Aprenden haciendo, experimentando y viviendo aventuras reales.' },

  // Team
  { id: 630, identificador: 'team-title', tipo: 'texto', seccion: 'manada', contenido: 'Nuestro Equipo' },
];

// ==================== TROPA (700-799) ====================
const tropaContent = [
  // Hero Section
  { id: 700, identificador: 'hero-title', tipo: 'texto', seccion: 'tropa', contenido: 'Tropa - Tropa Brownsea' },
  { id: 701, identificador: 'hero-subtitle', tipo: 'texto', seccion: 'tropa', contenido: '"Siempre listos" - Chicos y chicas de 10 a 13 años' },
  { id: 702, identificador: 'hero-image', tipo: 'imagen', seccion: 'tropa', contenido: '/placeholder.svg?height=400&width=600' },

  // About Section
  { id: 703, identificador: 'about-title', tipo: 'texto', seccion: 'tropa', contenido: '¿Quiénes son los Scouts?' },
  { id: 704, identificador: 'about-description', tipo: 'texto', seccion: 'tropa', contenido: 'En la Tropa Brownsea, los scouts viven la aventura del escultismo en su máxima expresión.' },
  { id: 705, identificador: 'about-details', tipo: 'texto', seccion: 'tropa', contenido: 'Organizados en patrullas, desarrollan su autonomía, liderazgo y espíritu de servicio.' },
  { id: 706, identificador: 'about-frame', tipo: 'texto', seccion: 'tropa', contenido: 'La tropa se inspira en los primeros scouts de Baden-Powell en la isla de Brownsea.' },

  // Activities
  { id: 707, identificador: 'activities-title', tipo: 'texto', seccion: 'tropa', contenido: '¿Qué hacen los Scouts?' },
  { id: 710, identificador: 'activity-0-title', tipo: 'texto', seccion: 'tropa', contenido: 'Campamentos' },
  { id: 711, identificador: 'activity-0-description', tipo: 'texto', seccion: 'tropa', contenido: 'Acampadas donde aprenden técnicas scout y conviven en la naturaleza.' },
  { id: 712, identificador: 'activity-1-title', tipo: 'texto', seccion: 'tropa', contenido: 'Proyectos' },
  { id: 713, identificador: 'activity-1-description', tipo: 'texto', seccion: 'tropa', contenido: 'Realizan proyectos de servicio a la comunidad y medioambientales.' },
  { id: 714, identificador: 'activity-2-title', tipo: 'texto', seccion: 'tropa', contenido: 'Aventuras' },
  { id: 715, identificador: 'activity-2-description', tipo: 'texto', seccion: 'tropa', contenido: 'Raids, excursiones y actividades de reto y superación personal.' },

  // Methodology
  { id: 720, identificador: 'methodology-title', tipo: 'texto', seccion: 'tropa', contenido: 'Metodología' },
  { id: 721, identificador: 'methodology-0-title', tipo: 'texto', seccion: 'tropa', contenido: 'Sistema de patrullas' },
  { id: 722, identificador: 'methodology-0-description', tipo: 'texto', seccion: 'tropa', contenido: 'Los scouts se organizan en patrullas de 6-8 miembros con autonomía propia.' },
  { id: 723, identificador: 'methodology-1-title', tipo: 'texto', seccion: 'tropa', contenido: 'Aprender haciendo' },
  { id: 724, identificador: 'methodology-1-description', tipo: 'texto', seccion: 'tropa', contenido: 'La educación se basa en la acción y la experiencia práctica.' },

  // Team
  { id: 730, identificador: 'team-title', tipo: 'texto', seccion: 'tropa', contenido: 'Nuestro Equipo' },
];

// ==================== PIONEROS (800-899) ====================
const pionerosContent = [
  // Hero Section
  { id: 800, identificador: 'hero-title', tipo: 'texto', seccion: 'pioneros', contenido: 'Pioneros - Posta Kanhiwara' },
  { id: 801, identificador: 'hero-subtitle', tipo: 'texto', seccion: 'pioneros', contenido: '"Siempre adelante" - Jóvenes de 13 a 16 años' },
  { id: 802, identificador: 'hero-image', tipo: 'imagen', seccion: 'pioneros', contenido: '/placeholder.svg?height=400&width=600' },

  // About Section
  { id: 803, identificador: 'about-title', tipo: 'texto', seccion: 'pioneros', contenido: '¿Quiénes son los Pioneros?' },
  { id: 804, identificador: 'about-description', tipo: 'texto', seccion: 'pioneros', contenido: 'Los pioneros son los aventureros del grupo scout, siempre dispuestos a explorar nuevos horizontes.' },
  { id: 805, identificador: 'about-details', tipo: 'texto', seccion: 'pioneros', contenido: 'En la Posta Kanhiwara, los jóvenes diseñan y ejecutan sus propios proyectos y aventuras.' },
  { id: 806, identificador: 'about-frame', tipo: 'texto', seccion: 'pioneros', contenido: 'Kanhiwara representa el espíritu pionero de exploración y descubrimiento.' },

  // Activities
  { id: 807, identificador: 'activities-title', tipo: 'texto', seccion: 'pioneros', contenido: '¿Qué hacen los Pioneros?' },
  { id: 810, identificador: 'activity-0-title', tipo: 'texto', seccion: 'pioneros', contenido: 'Expediciones' },
  { id: 811, identificador: 'activity-0-description', tipo: 'texto', seccion: 'pioneros', contenido: 'Travesías y expediciones de varios días diseñadas por ellos mismos.' },
  { id: 812, identificador: 'activity-1-title', tipo: 'texto', seccion: 'pioneros', contenido: 'Proyectos Sociales' },
  { id: 813, identificador: 'activity-1-description', tipo: 'texto', seccion: 'pioneros', contenido: 'Iniciativas de servicio a la comunidad y voluntariado activo.' },
  { id: 814, identificador: 'activity-2-title', tipo: 'texto', seccion: 'pioneros', contenido: 'Autogestión' },
  { id: 815, identificador: 'activity-2-description', tipo: 'texto', seccion: 'pioneros', contenido: 'Planifican y gestionan sus propias actividades con total autonomía.' },

  // Methodology
  { id: 820, identificador: 'methodology-title', tipo: 'texto', seccion: 'pioneros', contenido: 'Metodología' },
  { id: 821, identificador: 'methodology-0-title', tipo: 'texto', seccion: 'pioneros', contenido: 'Autogestión' },
  { id: 822, identificador: 'methodology-0-description', tipo: 'texto', seccion: 'pioneros', contenido: 'Los pioneros toman sus propias decisiones y gestionan sus actividades.' },
  { id: 823, identificador: 'methodology-1-title', tipo: 'texto', seccion: 'pioneros', contenido: 'Servicio a la comunidad' },
  { id: 824, identificador: 'methodology-1-description', tipo: 'texto', seccion: 'pioneros', contenido: 'El compromiso social es el eje central de su desarrollo personal.' },

  // Team
  { id: 830, identificador: 'team-title', tipo: 'texto', seccion: 'pioneros', contenido: 'Nuestro Equipo' },
];

// ==================== RUTAS (900-999) ====================
const rutasContent = [
  // Hero Section
  { id: 900, identificador: 'hero-title', tipo: 'texto', seccion: 'rutas', contenido: 'Rutas - Ruta Walhalla' },
  { id: 901, identificador: 'hero-subtitle', tipo: 'texto', seccion: 'rutas', contenido: '"Servir" - Jóvenes de 16 a 19 años' },
  { id: 902, identificador: 'hero-image', tipo: 'imagen', seccion: 'rutas', contenido: '/placeholder.svg?height=400&width=600' },

  // About Section
  { id: 903, identificador: 'about-title', tipo: 'texto', seccion: 'rutas', contenido: '¿Quiénes son los Rutas?' },
  { id: 904, identificador: 'about-description', tipo: 'texto', seccion: 'rutas', contenido: 'Los rutas son los jóvenes scouts en su etapa final, enfocados en el servicio y el compromiso social.' },
  { id: 905, identificador: 'about-details', tipo: 'texto', seccion: 'rutas', contenido: 'En la Ruta Walhalla, los jóvenes se preparan para su vida adulta manteniendo los valores scout.' },
  { id: 906, identificador: 'about-frame', tipo: 'texto', seccion: 'rutas', contenido: 'Walhalla representa el destino final del camino scout, donde el servicio es el objetivo principal.' },

  // Activities
  { id: 907, identificador: 'activities-title', tipo: 'texto', seccion: 'rutas', contenido: '¿Qué hacen los Rutas?' },
  { id: 910, identificador: 'activity-0-title', tipo: 'texto', seccion: 'rutas', contenido: 'Rutas y Travesías' },
  { id: 911, identificador: 'activity-0-description', tipo: 'texto', seccion: 'rutas', contenido: 'Viajes de larga distancia a pie, en bici o en canoa, viviendo el espíritu de aventura.' },
  { id: 912, identificador: 'activity-1-title', tipo: 'texto', seccion: 'rutas', contenido: 'Servicio Comunitario' },
  { id: 913, identificador: 'activity-1-description', tipo: 'texto', seccion: 'rutas', contenido: 'Proyectos de voluntariado y compromiso activo con la sociedad.' },
  { id: 914, identificador: 'activity-2-title', tipo: 'texto', seccion: 'rutas', contenido: 'Formación' },
  { id: 915, identificador: 'activity-2-description', tipo: 'texto', seccion: 'rutas', contenido: 'Preparación para convertirse en scouters y formar parte del Kraal.' },

  // Methodology
  { id: 920, identificador: 'methodology-title', tipo: 'texto', seccion: 'rutas', contenido: 'Metodología' },
  { id: 921, identificador: 'methodology-0-title', tipo: 'texto', seccion: 'rutas', contenido: 'Compromiso personal' },
  { id: 922, identificador: 'methodology-0-description', tipo: 'texto', seccion: 'rutas', contenido: 'Cada ruta asume compromisos personales de desarrollo y servicio.' },
  { id: 923, identificador: 'methodology-1-title', tipo: 'texto', seccion: 'rutas', contenido: 'Proyecto de vida' },
  { id: 924, identificador: 'methodology-1-description', tipo: 'texto', seccion: 'rutas', contenido: 'Trabajan en su proyecto personal de vida según los valores scout.' },

  // Team
  { id: 930, identificador: 'team-title', tipo: 'texto', seccion: 'rutas', contenido: 'Nuestro Equipo' },
];

// Combinar todos los contenidos
const allContent = [
  ...castoresContent,
  ...manadaContent,
  ...tropaContent,
  ...pionerosContent,
  ...rutasContent
];

async function seedAllSections() {
  console.log('🌱 Insertando contenido de todas las secciones scout...\n');

  let inserted = 0;
  let skipped = 0;

  for (const item of allContent) {
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
  console.log(`   Total: ${allContent.length}`);

  await pool.end();
}

seedAllSections().catch(err => {
  console.error('Error fatal:', err);
  pool.end();
  process.exit(1);
});
