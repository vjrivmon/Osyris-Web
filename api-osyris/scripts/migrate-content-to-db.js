/**
 * Script de Migración de Contenido Hardcoded a Base de Datos
 * Extrae el contenido de dynamic-section-page.tsx y lo inserta en PostgreSQL
 */

const { Pool } = require('pg');
const path = require('path');

// Configuración de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'osyris_user',
  password: process.env.DB_PASSWORD || 'osyris_password',
  database: process.env.DB_NAME || 'osyris_db'
});

// Contenido hardcoded de las secciones scout (extraído de dynamic-section-page.tsx)
const fallbackSections = {
  castores: {
    name: "Castores",
    fullName: "Colonia La Veleta",
    slug: "castores",
    emoji: "🦫",
    motto: "Compartir",
    ageRange: "5-7 años",
    colors: {
      from: "from-orange-500",
      to: "to-blue-500",
      accent: "bg-orange-500"
    },
    description: "Los Castores son los más pequeños del grupo scout. A través del juego y la diversión, descubren el mundo que les rodea.",
    details: "En la Colonia La Veleta, los Castores aprenden valores fundamentales como el compartir, el respeto y la amistad. Realizan actividades adaptadas a su edad, siempre en un ambiente seguro y divertido.",
    frame: "La vida en la presa con sus amigos castores",
    activities: [
      {
        icon: "🎨",
        title: "Manualidades",
        description: "Desarrollo de la creatividad y motricidad fina a través del arte"
      },
      {
        icon: "🎭",
        title: "Juegos cooperativos",
        description: "Aprendizaje en equipo mediante dinámicas y actividades lúdicas"
      },
      {
        icon: "🌳",
        title: "Naturaleza",
        description: "Primeros contactos con el medio ambiente y sus maravillas"
      }
    ],
    methodology: {
      title: "Juego y Exploración",
      description: "A través del juego simbólico y la exploración, los Castores descubren su entorno de forma natural."
    },
    team: [
      {
        name: "Equipo Castores",
        role: "Scouters",
        photo: "/images/team/default-castores.jpg"
      }
    ],
    navigation: {
      prev: null,
      next: { name: "Lobatos", url: "/secciones/manada" }
    }
  },

  manada: {
    name: "Manada",
    fullName: "Manada Waingunga",
    slug: "manada",
    emoji: "🐺",
    motto: "Haremos lo mejor",
    ageRange: "7-10 años",
    colors: {
      from: "from-yellow-500",
      to: "to-green-600",
      accent: "bg-yellow-500"
    },
    description: "La Manada Waingunga acoge a los lobatos, donde viven grandes aventuras inspiradas en El Libro de la Selva.",
    details: "Los lobatos desarrollan su personalidad a través del juego y las aventuras en la selva. Aprenden a trabajar en equipo, a cuidar de la naturaleza y a ser mejores cada día.",
    frame: "El Libro de la Selva de Rudyard Kipling",
    activities: [
      {
        icon: "📚",
        title: "Grandes Juegos",
        description: "Aventuras temáticas que desarrollan imaginación y trabajo en equipo"
      },
      {
        icon: "⚡",
        title: "Especialidades",
        description: "Desarrollo de habilidades específicas según los intereses de cada lobato"
      },
      {
        icon: "🏕️",
        title: "Acampadas",
        description: "Primeras experiencias de convivencia en la naturaleza"
      }
    ],
    methodology: {
      title: "Aprendizaje por Descubrimiento",
      description: "A través de las historias de Mowgli y sus amigos, los lobatos aprenden valores y habilidades para la vida."
    },
    team: [
      {
        name: "Akela",
        role: "Responsable de Manada",
        photo: "/images/team/default-manada.jpg"
      }
    ],
    navigation: {
      prev: { name: "Castores", url: "/secciones/castores" },
      next: { name: "Tropa", url: "/secciones/tropa" }
    }
  },

  tropa: {
    name: "Tropa",
    fullName: "Tropa Brownsea",
    slug: "tropa",
    emoji: "⚜️",
    motto: "Siempre Listos",
    ageRange: "10-13 años",
    colors: {
      from: "from-green-600",
      to: "to-green-800",
      accent: "bg-green-600"
    },
    description: "La Tropa Brownsea es donde los scouts viven la aventura en su máxima expresión, organizados en patrullas.",
    details: "En la Tropa, los scouts aprenden técnicas de campismo, orientación, primeros auxilios y muchas otras habilidades. El sistema de patrullas fomenta el liderazgo y la responsabilidad.",
    frame: "El sistema de patrullas de Baden-Powell",
    activities: [
      {
        icon: "🧭",
        title: "Técnica Scout",
        description: "Nudos, construcciones, orientación y habilidades de supervivencia"
      },
      {
        icon: "🎖️",
        title: "Sistema de Patrullas",
        description: "Organización en pequeños grupos que fomentan el liderazgo"
      },
      {
        icon: "🏔️",
        title: "Raids y Rutas",
        description: "Expediciones que ponen a prueba las habilidades aprendidas"
      }
    ],
    methodology: {
      title: "Aprender Haciendo",
      description: "La práctica directa de habilidades scouts en entornos naturales es la mejor forma de aprendizaje."
    },
    team: [
      {
        name: "Equipo Tropa",
        role: "Scouters",
        photo: "/images/team/default-tropa.jpg"
      }
    ],
    navigation: {
      prev: { name: "Manada", url: "/secciones/manada" },
      next: { name: "Pioneros", url: "/secciones/pioneros" }
    }
  },

  pioneros: {
    name: "Pioneros",
    fullName: "Posta Kanhiwara",
    slug: "pioneros",
    emoji: "🏔️",
    motto: "Buscar, Descubrir, Compartir",
    ageRange: "13-16 años",
    colors: {
      from: "from-red-600",
      to: "to-red-800",
      accent: "bg-red-600"
    },
    description: "La Posta Kanhiwara es el espacio donde los pioneros descubren su identidad a través de proyectos y empresas.",
    details: "Los pioneros trabajan en equipo en proyectos que ellos mismos diseñan y ejecutan. Es una etapa de crecimiento personal y compromiso social.",
    frame: "La comunidad de jóvenes comprometidos",
    activities: [
      {
        icon: "💡",
        title: "Empresas",
        description: "Proyectos planificados y ejecutados por los propios pioneros"
      },
      {
        icon: "🤝",
        title: "Servicio Comunitario",
        description: "Compromiso activo con la mejora de la sociedad"
      },
      {
        icon: "🌍",
        title: "Exploraciones",
        description: "Viajes y expediciones que amplían horizontes"
      }
    ],
    methodology: {
      title: "Proyecto Personal",
      description: "Cada pionero traza su propio camino de crecimiento a través de proyectos significativos."
    },
    team: [
      {
        name: "Equipo Pioneros",
        role: "Scouters",
        photo: "/images/team/default-pioneros.jpg"
      }
    ],
    navigation: {
      prev: { name: "Tropa", url: "/secciones/tropa" },
      next: { name: "Rutas", url: "/secciones/rutas" }
    }
  },

  rutas: {
    name: "Rutas",
    fullName: "Ruta Walhalla",
    slug: "rutas",
    emoji: "🎒",
    motto: "Crear mi propio camino",
    ageRange: "16-19 años",
    colors: {
      from: "from-green-700",
      to: "to-green-900",
      accent: "bg-green-700"
    },
    description: "La Ruta Walhalla es la última etapa del escultismo, donde los jóvenes alcanzan su máxima autonomía y compromiso.",
    details: "Los rovers son jóvenes adultos que diseñan su propio camino de crecimiento. Participan activamente en la organización del grupo y en proyectos de servicio a la comunidad.",
    frame: "El camino hacia la vida adulta comprometida",
    activities: [
      {
        icon: "🚶",
        title: "Travesías",
        description: "Expediciones de larga duración que forjan carácter"
      },
      {
        icon: "🎯",
        title: "Proyecto de Vida",
        description: "Planificación del futuro personal y profesional"
      },
      {
        icon: "🌟",
        title: "Liderazgo",
        description: "Participación activa en la gestión del grupo scout"
      }
    ],
    methodology: {
      title: "Autonomía y Servicio",
      description: "Los rovers son protagonistas de su desarrollo y comprometidos con la transformación social."
    },
    team: [
      {
        name: "Equipo Rutas",
        role: "Scouters",
        photo: "/images/team/default-rutas.jpg"
      }
    ],
    navigation: {
      prev: { name: "Pioneros", url: "/secciones/pioneros" },
      next: null
    }
  }
};

/**
 * Inserta contenido en la base de datos
 */
async function insertContent(seccion, identificador, tipo, contenido, metadata = {}) {
  try {
    let query, values;

    switch (tipo) {
      case 'texto':
        query = `
          INSERT INTO contenido_editable (seccion, identificador, tipo, contenido_texto, metadata, creado_por, modificado_por)
          VALUES ($1, $2, $3, $4, $5, 1, 1)
          ON CONFLICT (seccion, identificador) DO UPDATE
          SET contenido_texto = EXCLUDED.contenido_texto,
              metadata = EXCLUDED.metadata,
              modificado_por = 1
          RETURNING id`;
        values = [seccion, identificador, tipo, contenido, JSON.stringify(metadata)];
        break;

      case 'lista':
      case 'json':
        query = `
          INSERT INTO contenido_editable (seccion, identificador, tipo, contenido_json, metadata, creado_por, modificado_por)
          VALUES ($1, $2, $3, $4, $5, 1, 1)
          ON CONFLICT (seccion, identificador) DO UPDATE
          SET contenido_json = EXCLUDED.contenido_json,
              metadata = EXCLUDED.metadata,
              modificado_por = 1
          RETURNING id`;
        values = [seccion, identificador, tipo, JSON.stringify(contenido), JSON.stringify(metadata)];
        break;

      case 'imagen':
        query = `
          INSERT INTO contenido_editable (seccion, identificador, tipo, url_archivo, metadata, creado_por, modificado_por)
          VALUES ($1, $2, $3, $4, $5, 1, 1)
          ON CONFLICT (seccion, identificador) DO UPDATE
          SET url_archivo = EXCLUDED.url_archivo,
              metadata = EXCLUDED.metadata,
              modificado_por = 1
          RETURNING id`;
        values = [seccion, identificador, tipo, contenido, JSON.stringify(metadata)];
        break;

      default:
        console.warn(`⚠ Tipo no soportado: ${tipo}`);
        return null;
    }

    const result = await pool.query(query, values);
    return result.rows[0].id;

  } catch (error) {
    console.error(`❌ Error insertando contenido ${seccion}/${identificador}:`, error.message);
    return null;
  }
}

/**
 * Migra el contenido de una sección
 */
async function migrateSection(slug, data) {
  console.log(`\n📦 Migrando sección: ${data.fullName} (${slug})`);

  let insertedCount = 0;

  // Hero section
  await insertContent(slug, 'hero-titulo', 'texto', data.fullName);
  await insertContent(slug, 'hero-nombre-corto', 'texto', data.name);
  await insertContent(slug, 'hero-emoji', 'texto', data.emoji);
  await insertContent(slug, 'hero-lema', 'texto', data.motto);
  await insertContent(slug, 'hero-edad', 'texto', data.ageRange);
  insertedCount += 5;

  // Colors
  await insertContent(slug, 'colores', 'json', data.colors);
  insertedCount += 1;

  // Description & Details
  await insertContent(slug, 'descripcion', 'texto', data.description);
  await insertContent(slug, 'detalles', 'texto', data.details);
  await insertContent(slug, 'marco-simbolico', 'texto', data.frame);
  insertedCount += 3;

  // Activities
  await insertContent(slug, 'actividades', 'lista', data.activities);
  insertedCount += 1;

  // Methodology
  await insertContent(slug, 'metodologia', 'json', data.methodology);
  insertedCount += 1;

  // Team
  await insertContent(slug, 'equipo', 'lista', data.team);
  insertedCount += 1;

  // Navigation
  await insertContent(slug, 'navegacion', 'json', data.navigation);
  insertedCount += 1;

  console.log(`✅ Migrados ${insertedCount} elementos de ${slug}`);
  return insertedCount;
}

/**
 * Función principal de migración
 */
async function migrate() {
  console.log('🚀 Iniciando migración de contenido hardcoded a PostgreSQL...\n');
  console.log('📊 Base de datos: osyris_db@localhost:5432\n');

  try {
    // Verificar conexión
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL establecida\n');

    let totalInserted = 0;

    // Migrar cada sección
    for (const [slug, data] of Object.entries(fallbackSections)) {
      const count = await migrateSection(slug, data);
      totalInserted += count;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migración completada exitosamente`);
    console.log(`📊 Total de elementos migrados: ${totalInserted}`);
    console.log(`📁 Secciones migradas: ${Object.keys(fallbackSections).length}`);
    console.log('='.repeat(50) + '\n');

    // Verificar migración
    const { rows } = await pool.query('SELECT seccion, COUNT(*) as total FROM contenido_editable GROUP BY seccion ORDER BY seccion');
    console.log('📈 Contenido por sección:');
    rows.forEach(row => {
      console.log(`   - ${row.seccion}: ${row.total} elementos`);
    });

    console.log('\n✅ Puedes verificar el contenido en la base de datos');
    console.log('   docker exec -it osyris-db psql -U osyris_user -d osyris_db -c "SELECT * FROM contenido_editable LIMIT 10;"\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar migración
if (require.main === module) {
  migrate();
}

module.exports = { migrate, migrateSection, insertContent };
