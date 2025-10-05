/**
 * Script de seed para contenido de página Kraal
 * Inserta contenido inicial con IDs 220-337
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'osyris_user',
  password: 'osyris_password',
  database: 'osyris_db'
});

// Coordinación team
const coordinationTeam = [
  {
    name: "María García",
    role: "Coordinadora de Grupo",
    description: "Más de 10 años de experiencia en el escultismo. Coordina y supervisa todas las actividades del grupo.",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Carlos Rodríguez",
    role: "Secretario de Grupo",
    description: "Responsable de la gestión administrativa y documentación del grupo.",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Ana Martínez",
    role: "Tesorera de Grupo",
    description: "Encargada de la gestión económica y financiera del grupo.",
    photo: "/placeholder.svg?height=300&width=300",
  },
];

const sections = [
  {
    name: "Castores - Colonia La Veleta",
    members: [
      { name: "Laura Sánchez", role: "Coordinadora de Castores", experience: "5 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
      { name: "Pedro Gómez", role: "Scouter de Castores", experience: "3 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
      { name: "Lucía Fernández", role: "Scouter de Castores", experience: "2 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
    ],
  },
  {
    name: "Lobatos - Manada Waingunga",
    members: [
      { name: "Miguel Torres", role: "Coordinador de Lobatos", experience: "7 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
      { name: "Carmen Ruiz", role: "Scouter de Lobatos", experience: "4 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
      { name: "Javier Serrano", role: "Scouter de Lobatos", experience: "3 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
      { name: "Elena Moreno", role: "Scouter de Lobatos", experience: "2 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
    ],
  },
  {
    name: "Tropa - Tropa Brownsea",
    members: [
      { name: "Raúl Jiménez", role: "Coordinador de Tropa", experience: "6 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
      { name: "Cristina Díaz", role: "Scouter de Tropa", experience: "4 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
      { name: "Antonio Navarro", role: "Scouter de Tropa", experience: "3 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
    ],
  },
  {
    name: "Pioneros - Posta Kanhiwara",
    members: [
      { name: "Sara García", role: "Coordinadora de Pioneros", experience: "8 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
      { name: "Héctor Rivas", role: "Scouter de Pioneros", experience: "5 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
    ],
  },
  {
    name: "Rutas - Ruta Walhalla",
    members: [
      { name: "Itziar Sánchez", role: "Coordinadora de Rutas", experience: "9 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
      { name: "Álvaro Santandreu", role: "Scouter de Rutas", experience: "6 años en el grupo", photo: "/placeholder.svg?height=200&width=200" },
    ],
  },
];

function generateKraalContent() {
  const content = [];

  // Hero section (220-221)
  content.push({ id: 220, identificador: 'hero-title', tipo: 'texto', contenido: 'Nuestro Kraal' });
  content.push({ id: 221, identificador: 'hero-subtitle', tipo: 'texto', contenido: 'Conoce al equipo de monitores que hacen posible el Grupo Scout Osyris' });

  // Coordinación title (222)
  content.push({ id: 222, identificador: 'coordinacion-title', tipo: 'texto', contenido: 'Coordinación de Grupo' });

  // Coordinación team members (223-234)
  coordinationTeam.forEach((member, i) => {
    const baseId = 223 + i * 4;
    content.push({ id: baseId, identificador: `coord-${i}-photo`, tipo: 'imagen', contenido: member.photo });
    content.push({ id: baseId + 1, identificador: `coord-${i}-name`, tipo: 'texto', contenido: member.name });
    content.push({ id: baseId + 2, identificador: `coord-${i}-role`, tipo: 'texto', contenido: member.role });
    content.push({ id: baseId + 3, identificador: `coord-${i}-description`, tipo: 'texto', contenido: member.description });
  });

  // Secciones title (235)
  content.push({ id: 235, identificador: 'secciones-title', tipo: 'texto', contenido: 'Scouters por Secciones' });

  // Sections and members (236-335)
  sections.forEach((section, i) => {
    const baseSectionId = 236 + i * 20;
    content.push({ id: baseSectionId, identificador: `section-${i}-title`, tipo: 'texto', contenido: section.name });

    section.members.forEach((member, j) => {
      const baseMemberId = 237 + i * 20 + j * 4;
      content.push({ id: baseMemberId, identificador: `section-${i}-member-${j}-photo`, tipo: 'imagen', contenido: member.photo });
      content.push({ id: baseMemberId + 1, identificador: `section-${i}-member-${j}-name`, tipo: 'texto', contenido: member.name });
      content.push({ id: baseMemberId + 2, identificador: `section-${i}-member-${j}-role`, tipo: 'texto', contenido: member.role });
      content.push({ id: baseMemberId + 3, identificador: `section-${i}-member-${j}-experience`, tipo: 'texto', contenido: member.experience });
    });
  });

  // Join section (336-337)
  content.push({ id: 336, identificador: 'join-title', tipo: 'texto', contenido: '¿Quieres formar parte de nuestro Kraal?' });
  content.push({ id: 337, identificador: 'join-description', tipo: 'texto', contenido: 'Si tienes experiencia scout, ganas de aprender y quieres contribuir a la educación de niños y jóvenes, ¡únete a nuestro equipo!' });

  return content;
}

async function seedKraal() {
  const client = await pool.connect();

  try {
    console.log('🌱 Iniciando seed de contenido para Kraal...');

    await client.query('BEGIN');

    // Eliminar contenido existente de kraal (IDs 220-337)
    await client.query(
      'DELETE FROM contenido_editable WHERE id >= 220 AND id <= 337'
    );
    console.log('🗑️  Contenido anterior eliminado');

    // Generar e insertar nuevo contenido
    const kraalContent = generateKraalContent();

    for (const item of kraalContent) {
      const isImage = item.tipo === 'imagen';
      const query = isImage
        ? `INSERT INTO contenido_editable
           (id, identificador, seccion, tipo, url_archivo, version, activo, fecha_creacion, fecha_modificacion)
           VALUES ($1, $2, 'kraal', $3, $4, 1, true, NOW(), NOW())`
        : `INSERT INTO contenido_editable
           (id, identificador, seccion, tipo, contenido_texto, version, activo, fecha_creacion, fecha_modificacion)
           VALUES ($1, $2, 'kraal', $3, $4, 1, true, NOW(), NOW())`;

      const values = [item.id, item.identificador, item.tipo, item.contenido];

      await client.query(query, values);
      console.log(`✅ Insertado: ${item.identificador} (ID: ${item.id})`);
    }

    await client.query('COMMIT');

    console.log('\n✨ Seed completado exitosamente');
    console.log(`📊 Total de elementos insertados: ${kraalContent.length}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedKraal();
