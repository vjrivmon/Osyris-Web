/**
 * Script de seed para contenido de página Comité
 * Inserta contenido inicial con IDs 340-390
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'osyris_user',
  password: 'osyris_password',
  database: 'osyris_db'
});

const committeeTeam = [
  { name: "Isabel González", role: "Presidenta", description: "Madre de dos scouts del grupo. Coordina las actividades generales y representa al grupo ante Scouts de España.", photo: "/placeholder.svg?height=300&width=300" },
  { name: "Roberto Fernández", role: "Vicepresidente", description: "Padre scout con experiencia en gestión. Apoya a la presidenta y coordina proyectos especiales.", photo: "/placeholder.svg?height=300&width=300" },
  { name: "Carmen López", role: "Secretaria", description: "Responsable de las actas, comunicaciones oficiales y gestión documental del grupo.", photo: "/placeholder.svg?height=300&width=300" },
  { name: "David Martínez", role: "Tesorero", description: "Encargado de la gestión económica, presupuestos y control financiero del grupo.", photo: "/placeholder.svg?height=300&width=300" },
  { name: "Pilar Ruiz", role: "Vocal de Actividades", description: "Coordina la planificación de campamentos, excursiones y eventos especiales.", photo: "/placeholder.svg?height=300&width=300" },
  { name: "Miguel Serrano", role: "Vocal de Familias", description: "Enlace entre el Comité y las familias, promueve la participación parental.", photo: "/placeholder.svg?height=300&width=300" },
];

const committeeFunctions = [
  { title: "Planificación", description: "Planifica y coordina el calendario anual de actividades, campamentos y eventos especiales del grupo." },
  { title: "Gestión Económica", description: "Administra los recursos económicos, elabora presupuestos y controla los gastos e ingresos del grupo." },
  { title: "Gestión Administrativa", description: "Mantiene la documentación oficial, gestiona seguros, permisos y trámites necesarios." },
  { title: "Relaciones Institucionales", description: "Representa al grupo ante Scouts de España, instituciones locales y otros grupos scouts." },
  { title: "Apoyo a Familias", description: "Facilita la comunicación con las familias y promueve su participación en la vida del grupo." },
  { title: "Apoyo a Scouters", description: "Brinda apoyo logístico y material a los equipos de scouters para el desarrollo de sus actividades." }
];

function generateComiteContent() {
  const content = [];

  // Hero (340-341)
  content.push({ id: 340, identificador: 'hero-title', tipo: 'texto', contenido: 'Comité de Grupo' });
  content.push({ id: 341, identificador: 'hero-subtitle', tipo: 'texto', contenido: 'El equipo directivo que guía y coordina las actividades del Grupo Scout Osyris' });

  // What section (342-343)
  content.push({ id: 342, identificador: 'what-title', tipo: 'texto', contenido: '¿Qué es el Comité de Grupo?' });
  content.push({ id: 343, identificador: 'what-description', tipo: 'texto', contenido: 'El Comité de Grupo es el órgano de gobierno del grupo scout, responsable de la gestión, planificación y coordinación de todas las actividades. Está compuesto por padres y madres voluntarios que dedican su tiempo para asegurar el buen funcionamiento del grupo.' });

  // Members title (344)
  content.push({ id: 344, identificador: 'members-title', tipo: 'texto', contenido: 'Miembros del Comité' });

  // Members (345-368)
  committeeTeam.forEach((member, i) => {
    const baseId = 345 + i * 4;
    content.push({ id: baseId, identificador: `member-${i}-photo`, tipo: 'imagen', contenido: member.photo });
    content.push({ id: baseId + 1, identificador: `member-${i}-name`, tipo: 'texto', contenido: member.name });
    content.push({ id: baseId + 2, identificador: `member-${i}-role`, tipo: 'texto', contenido: member.role });
    content.push({ id: baseId + 3, identificador: `member-${i}-description`, tipo: 'texto', contenido: member.description });
  });

  // Functions title (369)
  content.push({ id: 369, identificador: 'functions-title', tipo: 'texto', contenido: 'Funciones del Comité' });

  // Functions (370-381)
  committeeFunctions.forEach((func, i) => {
    const baseId = 370 + i * 2;
    content.push({ id: baseId, identificador: `function-${i}-title`, tipo: 'texto', contenido: func.title });
    content.push({ id: baseId + 1, identificador: `function-${i}-description`, tipo: 'texto', contenido: func.description });
  });

  // Meetings section (382-388)
  content.push({ id: 382, identificador: 'meetings-title', tipo: 'texto', contenido: 'Reuniones y Participación' });
  content.push({ id: 383, identificador: 'meetings-regular-title', tipo: 'texto', contenido: '📅 Reuniones Regulares' });
  content.push({ id: 384, identificador: 'meetings-regular-description', tipo: 'texto', contenido: 'El Comité se reúne mensualmente para revisar la marcha del grupo, planificar actividades y tomar decisiones importantes. Las reuniones son abiertas a todos los padres y madres.' });
  content.push({ id: 385, identificador: 'meetings-assembly-title', tipo: 'texto', contenido: '🗳️ Asamblea General' });
  content.push({ id: 386, identificador: 'meetings-assembly-description', tipo: 'texto', contenido: 'Una vez al año se celebra la Asamblea General donde se presenta la memoria de actividades, el balance económico y se eligen los nuevos miembros del Comité.' });
  content.push({ id: 387, identificador: 'meetings-participation-title', tipo: 'texto', contenido: '🤝 Participación Familiar' });
  content.push({ id: 388, identificador: 'meetings-participation-description', tipo: 'texto', contenido: 'Todas las familias están invitadas a participar en las actividades del grupo y a colaborar con el Comité en la organización de eventos especiales.' });

  // Join section (389-390)
  content.push({ id: 389, identificador: 'join-title', tipo: 'texto', contenido: '¿Quieres formar parte del Comité?' });
  content.push({ id: 390, identificador: 'join-description', tipo: 'texto', contenido: 'Si quieres contribuir activamente a la educación scout de tu hijo/a y tienes tiempo para dedicar al grupo, ¡te invitamos a participar en nuestro Comité!' });

  return content;
}

async function seedComite() {
  const client = await pool.connect();

  try {
    console.log('🌱 Iniciando seed de contenido para Comité...');

    await client.query('BEGIN');

    await client.query('DELETE FROM contenido_editable WHERE id >= 340 AND id <= 390');
    console.log('🗑️  Contenido anterior eliminado');

    const comiteContent = generateComiteContent();

    for (const item of comiteContent) {
      const isImage = item.tipo === 'imagen';
      const query = isImage
        ? `INSERT INTO contenido_editable (id, identificador, seccion, tipo, url_archivo, version, activo, fecha_creacion, fecha_modificacion) VALUES ($1, $2, 'comite', $3, $4, 1, true, NOW(), NOW())`
        : `INSERT INTO contenido_editable (id, identificador, seccion, tipo, contenido_texto, version, activo, fecha_creacion, fecha_modificacion) VALUES ($1, $2, 'comite', $3, $4, 1, true, NOW(), NOW())`;

      await client.query(query, [item.id, item.identificador, item.tipo, item.contenido]);
      console.log(`✅ Insertado: ${item.identificador} (ID: ${item.id})`);
    }

    await client.query('COMMIT');
    console.log(`\n✨ Seed completado - ${comiteContent.length} elementos`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedComite();
