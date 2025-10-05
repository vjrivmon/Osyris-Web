/**
 * Script para poblar contenido editable de tipo JSON (listas editables)
 * Ejecutar: node scripts/seed-editable-lists.js
 */

const { Pool } = require('pg');

// Configuración de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'osyris_user',
  password: process.env.DB_PASSWORD || 'osyris_password',
  database: process.env.DB_NAME || 'osyris_db'
});

// Datos para listas editables
const editableLists = [
  // ===== LANDING PAGE =====

  // Testimonios (contentId: 128)
  {
    id: 128,
    seccion: 'landing',
    identificador: 'testimonials-list',
    tipo: 'json',
    contenido_json: JSON.stringify([
      {
        name: 'María García',
        role: 'Madre de Lobato',
        avatar: '/placeholder.svg?height=100&width=100',
        text: 'El grupo scout ha sido una experiencia transformadora para mi hijo. Ha ganado confianza, independencia y ha hecho amigos para toda la vida.'
      },
      {
        name: 'Carlos Rodríguez',
        role: 'Antiguo Ruta',
        avatar: '/placeholder.svg?height=100&width=100',
        text: 'Mis años en el Grupo Scout Osyris marcaron mi vida. Los valores que aprendí me han acompañado siempre y me han ayudado a ser quien soy hoy.'
      },
      {
        name: 'Ana Martínez',
        role: 'Scouter de Pioneros',
        avatar: '/placeholder.svg?height=100&width=100',
        text: 'Ser scouter es una de las experiencias más gratificantes que he tenido. Ver cómo crecen los jóvenes y se convierten en personas comprometidas es increíble.'
      }
    ]),
    metadata: {}
  },

  // ===== SOBRE NOSOTROS PAGE =====

  // Timeline title (contentId: 208)
  {
    id: 208,
    seccion: 'sobre-nosotros',
    identificador: 'timeline-title',
    tipo: 'texto',
    contenido_texto: 'Línea del Tiempo',
    metadata: {}
  },

  // Timeline events (contentId: 209)
  {
    id: 209,
    seccion: 'sobre-nosotros',
    identificador: 'timeline-events',
    tipo: 'json',
    contenido_json: JSON.stringify([
      { year: '1981', description: 'Fundación del Grupo Scout Osyris, con su primera ronda solar 1980-1981.' },
      { year: '1990', description: 'Celebración del 10º aniversario con un gran campamento en los Pirineos.' },
      { year: '2000', description: 'Ampliación de las secciones y consolidación del grupo en el barrio de Benimaclet.' },
      { year: '2006', description: 'Renovación del proyecto educativo y metodología del grupo.' },
      { year: '2016', description: 'Celebración del 35º aniversario con una gran fiesta y encuentro de antiguos miembros.' },
      { year: '2021', description: '40º aniversario del grupo, adaptándonos a los nuevos tiempos y retos.' },
      { year: 'Actualidad', description: 'Seguimos creciendo y formando a niños, niñas y jóvenes en valores scouts.' }
    ]),
    metadata: {}
  },

  // Valores list (contentId: 210)
  {
    id: 210,
    seccion: 'sobre-nosotros',
    identificador: 'valores-list',
    tipo: 'json',
    contenido_json: JSON.stringify([
      {
        icon: 'Users',
        title: 'Comunidad',
        description: 'Fomentamos el sentido de pertenencia y el trabajo en equipo, creando vínculos fuertes entre todos los miembros.'
      },
      {
        icon: 'Heart',
        title: 'Servicio',
        description: 'Promovemos la actitud de ayuda desinteresada hacia los demás y el compromiso con la mejora de la sociedad.'
      },
      {
        icon: 'Award',
        title: 'Compromiso',
        description: 'Desarrollamos la responsabilidad personal y el compromiso con los demás y con la sociedad.'
      },
      {
        icon: 'MapPin',
        title: 'Naturaleza',
        description: 'Fomentamos el respeto y cuidado del medio ambiente a través de actividades al aire libre.'
      },
      {
        icon: 'Calendar',
        title: 'Progresión Personal',
        description: 'Acompañamos el desarrollo individual de cada persona, respetando sus ritmos y potenciando sus capacidades.'
      },
      {
        icon: 'FileText',
        title: 'Educación',
        description: 'Trabajamos por el desarrollo integral de niños y jóvenes a través del método scout.'
      }
    ]),
    metadata: {}
  },

  // Método Scout items (contentId: 215)
  {
    id: 216,
    seccion: 'sobre-nosotros',
    identificador: 'metodo-scout-items',
    tipo: 'json',
    contenido_json: JSON.stringify([
      { text: 'La Promesa y la Ley Scout' },
      { text: 'La educación por la acción' },
      { text: 'El sistema de patrullas o equipos' },
      { text: 'Programas progresivos y atractivos' },
      { text: 'Contacto con la naturaleza' },
      { text: 'Apoyo de adultos' }
    ]),
    metadata: {}
  }
];

async function seedEditableLists() {
  const client = await pool.connect();

  try {
    console.log('🌱 Iniciando seed de listas editables...\n');

    // Iniciar transacción
    await client.query('BEGIN');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of editableLists) {
      // Verificar si ya existe
      const existsResult = await client.query(
        'SELECT id FROM contenido_editable WHERE id = $1',
        [item.id]
      );

      if (existsResult.rows.length > 0) {
        // Actualizar
        if (item.tipo === 'json') {
          await client.query(
            `UPDATE contenido_editable
             SET seccion = $2, identificador = $3, tipo = $4,
                 contenido_json = $5, contenido_texto = NULL, contenido_html = NULL, url_archivo = NULL,
                 metadata = $6, fecha_modificacion = NOW()
             WHERE id = $1`,
            [item.id, item.seccion, item.identificador, item.tipo, item.contenido_json, JSON.stringify(item.metadata)]
          );
        } else {
          await client.query(
            `UPDATE contenido_editable
             SET seccion = $2, identificador = $3, tipo = $4,
                 contenido_texto = $5, contenido_html = NULL, contenido_json = NULL, url_archivo = NULL,
                 metadata = $6, fecha_modificacion = NOW()
             WHERE id = $1`,
            [item.id, item.seccion, item.identificador, item.tipo, item.contenido_texto, JSON.stringify(item.metadata)]
          );
        }
        updatedCount++;
        console.log(`✏️  Actualizado: ${item.seccion}/${item.identificador} (ID: ${item.id})`);
      } else {
        // Insertar
        if (item.tipo === 'json') {
          await client.query(
            `INSERT INTO contenido_editable (id, seccion, identificador, tipo, contenido_json, metadata, activo, fecha_creacion, fecha_modificacion)
             VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW(), NOW())`,
            [item.id, item.seccion, item.identificador, item.tipo, item.contenido_json, JSON.stringify(item.metadata)]
          );
        } else {
          await client.query(
            `INSERT INTO contenido_editable (id, seccion, identificador, tipo, contenido_texto, metadata, activo, fecha_creacion, fecha_modificacion)
             VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW(), NOW())`,
            [item.id, item.seccion, item.identificador, item.tipo, item.contenido_texto, JSON.stringify(item.metadata)]
          );
        }
        insertedCount++;
        console.log(`✅ Insertado: ${item.seccion}/${item.identificador} (ID: ${item.id})`);
      }
    }

    // Confirmar transacción
    await client.query('COMMIT');

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Insertados: ${insertedCount}`);
    console.log(`   ✏️  Actualizados: ${updatedCount}`);
    console.log(`   📝 Total: ${editableLists.length}`);
    console.log('\n✨ Seed completado exitosamente!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al ejecutar seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar seed
if (require.main === module) {
  seedEditableLists()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedEditableLists };
