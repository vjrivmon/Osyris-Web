/**
 * Script para insertar valores de landing (109-118) y contacto (400-427)
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'osyris_user',
  password: 'osyris_password',
  database: 'osyris_db'
});

const valoresContent = [
  { id: 109, identificador: 'valores-title', tipo: 'texto', seccion: 'landing', contenido: 'Nuestros Valores' },
  { id: 110, identificador: 'valores-subtitle', tipo: 'texto', seccion: 'landing', contenido: 'El escultismo se basa en valores fundamentales que guían nuestras actividades y nuestra forma de entender la educación.' },
  { id: 111, identificador: 'valor-0-title', tipo: 'texto', seccion: 'landing', contenido: 'Comunidad' },
  { id: 112, identificador: 'valor-0-description', tipo: 'texto', seccion: 'landing', contenido: 'Fomentamos el sentido de pertenencia y el trabajo en equipo, creando vínculos fuertes entre todos los miembros.' },
  { id: 113, identificador: 'valor-1-title', tipo: 'texto', seccion: 'landing', contenido: 'Naturaleza' },
  { id: 114, identificador: 'valor-1-description', tipo: 'texto', seccion: 'landing', contenido: 'Promovemos el respeto y cuidado del medio ambiente a través de actividades al aire libre.' },
  { id: 115, identificador: 'valor-2-title', tipo: 'texto', seccion: 'landing', contenido: 'Compromiso' },
  { id: 116, identificador: 'valor-2-description', tipo: 'texto', seccion: 'landing', contenido: 'Desarrollamos la responsabilidad personal y el compromiso con los demás y con la sociedad.' },
  { id: 117, identificador: 'valor-3-title', tipo: 'texto', seccion: 'landing', contenido: 'Educación' },
  { id: 118, identificador: 'valor-3-description', tipo: 'texto', seccion: 'landing', contenido: 'Trabajamos por el desarrollo integral de niños y jóvenes a través del método scout.' },
];

const contactoContent = [
  { id: 400, identificador: 'hero-title', tipo: 'texto', seccion: 'contacto', contenido: 'Contacto' },
  { id: 401, identificador: 'hero-subtitle', tipo: 'texto', seccion: 'contacto', contenido: '¿Tienes alguna pregunta o quieres formar parte de nuestro grupo? ¡Contáctanos!' },
  { id: 402, identificador: 'form-title', tipo: 'texto', seccion: 'contacto', contenido: 'Envíanos un mensaje' },
  { id: 403, identificador: 'form-description', tipo: 'texto', seccion: 'contacto', contenido: 'Rellena el formulario y te responderemos lo antes posible.' },
  { id: 404, identificador: 'contact-info-title', tipo: 'texto', seccion: 'contacto', contenido: 'Información de contacto' },
  { id: 405, identificador: 'contact-address', tipo: 'texto', seccion: 'contacto', contenido: 'Calle Poeta Ricard Sanmartí nº3, Barrio de Benimaclet, Valencia' },
  { id: 406, identificador: 'contact-email', tipo: 'texto', seccion: 'contacto', contenido: 'info@grupoosyris.es' },
  { id: 407, identificador: 'contact-phone', tipo: 'texto', seccion: 'contacto', contenido: '+34 600 123 456' },
  { id: 408, identificador: 'horario-title', tipo: 'texto', seccion: 'contacto', contenido: 'Horario' },
  { id: 409, identificador: 'horario-description', tipo: 'texto', seccion: 'contacto', contenido: 'Nuestras actividades regulares y horario de atención.' },
  { id: 410, identificador: 'horario-reuniones-title', tipo: 'texto', seccion: 'contacto', contenido: 'Reuniones semanales' },
  { id: 411, identificador: 'horario-reuniones-time', tipo: 'texto', seccion: 'contacto', contenido: 'Sábados de 17:00 a 19:00' },
  { id: 412, identificador: 'horario-familias-title', tipo: 'texto', seccion: 'contacto', contenido: 'Atención a familias' },
  { id: 413, identificador: 'horario-familias-time', tipo: 'texto', seccion: 'contacto', contenido: 'Sábados de 16:30 a 17:00 y de 19:00 a 19:30' },
  { id: 414, identificador: 'horario-kraal-title', tipo: 'texto', seccion: 'contacto', contenido: 'Reuniones de Kraal' },
  { id: 415, identificador: 'horario-kraal-time', tipo: 'texto', seccion: 'contacto', contenido: 'Viernes de 20:00 a 22:00' },
  { id: 416, identificador: 'map-title', tipo: 'texto', seccion: 'contacto', contenido: 'Nuestra ubicación' },
  { id: 417, identificador: 'faq-title', tipo: 'texto', seccion: 'contacto', contenido: 'Preguntas frecuentes' },
  // FAQs (418-427)
  { id: 418, identificador: 'faq-0-question', tipo: 'texto', seccion: 'contacto', contenido: '¿Cómo puedo inscribir a mi hijo/a en el grupo scout?' },
  { id: 419, identificador: 'faq-0-answer', tipo: 'texto', seccion: 'contacto', contenido: 'Para inscribir a tu hijo/a, puedes contactarnos a través del formulario de esta página, por email o acercarte directamente a nuestro local en horario de atención a familias. Te informaremos sobre el proceso de inscripción y las plazas disponibles.' },
  { id: 420, identificador: 'faq-1-question', tipo: 'texto', seccion: 'contacto', contenido: '¿Cuál es la cuota y qué incluye?' },
  { id: 421, identificador: 'faq-1-answer', tipo: 'texto', seccion: 'contacto', contenido: 'La cuota anual es de 180€, que se puede pagar en tres plazos trimestrales. Incluye el seguro, materiales para las actividades regulares y la cuota de pertenencia a la Federación. Las acampadas y campamentos tienen un coste adicional.' },
  { id: 422, identificador: 'faq-2-question', tipo: 'texto', seccion: 'contacto', contenido: '¿Qué edad debe tener mi hijo/a para unirse al grupo?' },
  { id: 423, identificador: 'faq-2-answer', tipo: 'texto', seccion: 'contacto', contenido: 'Aceptamos niños y niñas desde los 5 años (Castores) hasta los 19 años (Rutas). Cada sección tiene un rango de edad específico: Castores (5-7), Lobatos (7-10), Scouts (10-13), Pioneros (13-16) y Rutas (16-19).' },
  { id: 424, identificador: 'faq-3-question', tipo: 'texto', seccion: 'contacto', contenido: '¿Cómo puedo colaborar como adulto?' },
  { id: 425, identificador: 'faq-3-answer', tipo: 'texto', seccion: 'contacto', contenido: 'Hay varias formas de colaborar: como monitor/a (Scouter), como miembro del Comité de Padres, o como colaborador puntual en actividades específicas. Contáctanos para más información.' },
  { id: 426, identificador: 'faq-4-question', tipo: 'texto', seccion: 'contacto', contenido: '¿Qué actividades realizan durante el año?' },
  { id: 427, identificador: 'faq-4-answer', tipo: 'texto', seccion: 'contacto', contenido: 'Realizamos reuniones semanales los sábados, acampadas de fin de semana aproximadamente una vez al trimestre, y un campamento de verano de 15 días en julio. También participamos en actividades con otros grupos scouts y eventos comunitarios.' },
];

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Insertando valores y contacto...');

    await client.query('BEGIN');

    // Eliminar contenido existente
    await client.query('DELETE FROM contenido_editable WHERE id >= 109 AND id <= 118');
    await client.query('DELETE FROM contenido_editable WHERE id >= 400 AND id <= 427');

    // Insertar valores
    for (const item of valoresContent) {
      await client.query(
        `INSERT INTO contenido_editable (id, identificador, seccion, tipo, contenido_texto, version, activo, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, $5, 1, true, NOW(), NOW())`,
        [item.id, item.identificador, item.seccion, item.tipo, item.contenido]
      );
      console.log(`✅ ${item.identificador} (${item.id})`);
    }

    // Insertar contacto
    for (const item of contactoContent) {
      await client.query(
        `INSERT INTO contenido_editable (id, identificador, seccion, tipo, contenido_texto, version, activo, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, $5, 1, true, NOW(), NOW())`,
        [item.id, item.identificador, item.seccion, item.tipo, item.contenido]
      );
      console.log(`✅ ${item.identificador} (${item.id})`);
    }

    await client.query('COMMIT');

    const total = valoresContent.length + contactoContent.length;
    console.log(`\n✨ Seed completado - ${total} elementos`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
