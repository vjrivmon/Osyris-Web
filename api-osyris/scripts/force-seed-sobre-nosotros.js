/**
 * Script de seed para contenido de página Sobre Nosotros
 * Inserta contenido inicial con IDs 200-219
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'osyris_user',
  password: 'osyris_password',
  database: 'osyris_db'
});

const sobreNosotrosContent = [
  // Hero section (200-201)
  {
    id: 200,
    identificador: 'hero-title',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Sobre Nosotros',
    version: 1
  },
  {
    id: 201,
    identificador: 'hero-subtitle',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Conoce la historia, valores y personas que forman el Grupo Scout Osyris',
    version: 1
  },

  // Historia tab (202-207)
  {
    id: 202,
    identificador: 'historia-title',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Nuestra Historia',
    version: 1
  },
  {
    id: 203,
    identificador: 'historia-parrafo-1',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'El Grupo Scout Osyris fue fundado el 23 de febrero de 1981, siendo su primera ronda la que corresponde a los años 1980-1981. Desde entonces, hemos estado comprometidos con la educación en valores de niños y jóvenes a través del método scout.',
    version: 1
  },
  {
    id: 204,
    identificador: 'historia-parrafo-2',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Estamos adscritos al Moviment Escolta de València (MEV) y tenemos nuestro domicilio en la Fundación Patronato de la Juventud Obrera: Colegio Sagrada Familia (P.J.O.), en el Barrio de Benimaclet.',
    version: 1
  },
  {
    id: 205,
    identificador: 'historia-parrafo-3',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'A lo largo de más de 40 años de historia, hemos formado a cientos de niños, niñas y jóvenes, contribuyendo a su desarrollo integral y a su compromiso con la sociedad.',
    version: 1
  },
  {
    id: 206,
    identificador: 'historia-imagen',
    seccion: 'sobre-nosotros',
    tipo: 'imagen',
    contenido: '/placeholder.svg?height=400&width=600',
    version: 1
  },
  {
    id: 207,
    identificador: 'historia-imagen-caption',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Primeros años del Grupo Scout Osyris',
    version: 1
  },

  // Valores tab (208-211)
  {
    id: 208,
    identificador: 'valores-title',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Nuestros Valores',
    version: 1
  },
  {
    id: 209,
    identificador: 'mision-title',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Nuestra Misión',
    version: 1
  },
  {
    id: 210,
    identificador: 'mision-parrafo-1',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'El Moviment Escolta de la Diòcesi de València – M.S.C. (M.E.V. M.SC.) tiene por fin contribuir a la educación y desarrollo integral de la infancia y la juventud a través de la vivencia de los valores del Escultismo, en conformidad con las enseñanzas y vida de la Iglesia Católica.',
    version: 1
  },
  {
    id: 211,
    identificador: 'mision-parrafo-2',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'De esta manera, el Grupo Scout Osyris promueve la formación de personas que ejerzan la ciudadanía responsable y comprometida con la sociedad, para que sean así agentes de cambio en la comunidad local, nacional e internacional.',
    version: 1
  },

  // Metodología tab (212-217)
  {
    id: 212,
    identificador: 'metodologia-title',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Nuestra Metodología',
    version: 1
  },
  {
    id: 213,
    identificador: 'metodo-scout-title',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'El Método Scout',
    version: 1
  },
  {
    id: 214,
    identificador: 'metodo-scout-intro',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'El método scout es un sistema de autoeducación progresiva basado en:',
    version: 1
  },
  {
    id: 215,
    identificador: 'metodo-scout-conclusion',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'A través de este método, buscamos el desarrollo integral de niños y jóvenes, potenciando su autonomía, responsabilidad, solidaridad y compromiso.',
    version: 1
  },
  {
    id: 216,
    identificador: 'secciones-title',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Educación por Secciones',
    version: 1
  },
  {
    id: 217,
    identificador: 'secciones-intro',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Adaptamos nuestra metodología a las diferentes etapas de desarrollo, dividiendo a los educandos en cinco secciones según su edad:',
    version: 1
  },

  // CTA section (218-219)
  {
    id: 218,
    identificador: 'cta-title',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: '¿Quieres conocer a nuestro equipo?',
    version: 1
  },
  {
    id: 219,
    identificador: 'cta-description',
    seccion: 'sobre-nosotros',
    tipo: 'texto',
    contenido: 'Descubre quiénes son las personas que hacen posible el Grupo Scout Osyris: nuestro Kraal de monitores y el Comité de Grupo.',
    version: 1
  }
];

async function seedSobreNosotros() {
  const client = await pool.connect();

  try {
    console.log('🌱 Iniciando seed de contenido para Sobre Nosotros...');

    await client.query('BEGIN');

    // Eliminar contenido existente de sobre-nosotros (IDs 200-219)
    await client.query(
      'DELETE FROM contenido_editable WHERE id >= 200 AND id <= 219'
    );
    console.log('🗑️  Contenido anterior eliminado');

    // Insertar nuevo contenido
    for (const item of sobreNosotrosContent) {
      // Determinar qué columna usar según el tipo
      const isImage = item.tipo === 'imagen';
      const query = isImage
        ? `INSERT INTO contenido_editable
           (id, identificador, seccion, tipo, url_archivo, version, activo, fecha_creacion, fecha_modificacion)
           VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`
        : `INSERT INTO contenido_editable
           (id, identificador, seccion, tipo, contenido_texto, version, activo, fecha_creacion, fecha_modificacion)
           VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`;

      const values = [item.id, item.identificador, item.seccion, item.tipo, item.contenido, item.version];

      await client.query(query, values);
      console.log(`✅ Insertado: ${item.identificador} (ID: ${item.id})`);
    }

    await client.query('COMMIT');

    console.log('\n✨ Seed completado exitosamente');
    console.log(`📊 Total de elementos insertados: ${sobreNosotrosContent.length}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedSobreNosotros();
