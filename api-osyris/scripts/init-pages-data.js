#!/usr/bin/env node

/**
 * Script para inicializar páginas de ejemplo en el sistema CMS Osyris
 */

const path = require('path');
process.chdir(path.join(__dirname, '..'));

const { query, initializeDatabase, closeDatabase } = require('../src/config/db.config');

/**
 * Datos de páginas de ejemplo
 */
const paginasEjemplo = [
  {
    titulo: 'Página Principal',
    slug: 'home',
    contenido: `# Bienvenidos al Grupo Scout Osyris

## Quiénes Somos

Somos un grupo scout comprometido con la educación en valores y el desarrollo integral de niños y jóvenes.

### Nuestras Secciones

- **Castores (5-7 años)**: Colonia La Veleta
- **Lobatos (7-10 años)**: Manada Waingunga
- **Tropa (10-13 años)**: Tropa Brownsea
- **Pioneros (13-16 años)**: Posta Kanhiwara
- **Rutas (16-19 años)**: Ruta Walhalla

> "El scoutismo es un juego para chicos, dirigido por ellos mismos, en el que los hermanos mayores pueden dar a sus hermanos menores sanas diversiones al aire libre" - Baden Powell

**¡Únete a nuestra gran aventura!**`,
    resumen: 'Página principal del Grupo Scout Osyris con información general y secciones',
    meta_descripcion: 'Grupo Scout Osyris - Educación en valores y desarrollo integral para niños y jóvenes',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 1,
    mostrar_en_menu: true,
    permite_comentarios: false,
    creado_por: 1
  },
  {
    titulo: 'Quiénes Somos',
    slug: 'quienes-somos',
    contenido: `# Conoce al Grupo Scout Osyris

## Nuestra Historia

El Grupo Scout Osyris fue fundado en 1995 con el objetivo de proporcionar a los jóvenes una educación complementaria basada en los valores del escultismo.

## Nuestra Misión

Formar ciudadanos comprometidos, responsables y solidarios a través de:

- Educación en valores
- Vida al aire libre
- Aprendizaje a través de la acción
- Desarrollo del liderazgo

## Nuestros Valores

- **Honestidad**: Base de todas nuestras relaciones
- **Solidaridad**: Ayudar siempre a quien lo necesite
- **Responsabilidad**: Cumplir con nuestros compromisos
- **Respeto**: Por la naturaleza y las personas`,
    resumen: 'Historia, misión y valores del Grupo Scout Osyris',
    meta_descripcion: 'Conoce la historia, misión y valores del Grupo Scout Osyris desde 1995',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 2,
    mostrar_en_menu: true,
    permite_comentarios: false,
    creado_por: 1
  },
  {
    titulo: 'Nuestras Actividades',
    slug: 'actividades',
    contenido: `# Nuestras Actividades

## Actividades Semanales

Todos los sábados de 16:00 a 18:30 en nuestro local.

### Por Secciones

**Castores**: Juegos, manualidades y primeros contactos con la naturaleza
**Lobatos**: Aventuras, especialidades y vida en la naturaleza
**Tropa**: Campamentos, pionerismo y especialidades avanzadas
**Pioneros**: Proyectos de servicio y expediciones
**Rutas**: Rutas de senderismo y proyectos comunitarios

## Campamentos

- **Campamento de Verano**: 15 días en plena naturaleza
- **Acampadas de Fin de Semana**: Una vez al mes
- **Campamentos Especiales**: Navidad, Semana Santa

## Actividades Especiales

- Día del Pensamiento Mundial
- Festival de la Canción Scout
- Olimpiadas Scouts
- Servicio Comunitario`,
    resumen: 'Actividades semanales, campamentos y eventos especiales del grupo scout',
    meta_descripcion: 'Descubre las actividades semanales, campamentos y eventos especiales del Grupo Scout Osyris',
    estado: 'borrador',
    tipo: 'pagina',
    orden_menu: 3,
    mostrar_en_menu: true,
    permite_comentarios: false,
    creado_por: 1
  },
  {
    titulo: 'Cómo Unirse',
    slug: 'como-unirse',
    contenido: `# Cómo Unirse al Grupo Scout Osyris

## Proceso de Inscripción

### 1. Contacto Inicial
Ponte en contacto con nosotros a través de:
- Email: contacto@osyris.com
- Teléfono: 123 456 789
- Visítanos los sábados de 16:00 a 18:30

### 2. Reunión Informativa
Organizamos reuniones informativas el primer sábado de cada mes para:
- Conocer el proyecto educativo
- Resolver dudas sobre el escultismo
- Presentar las actividades por secciones

### 3. Documentación Necesaria
- Ficha de inscripción
- Autorización médica
- Fotocopia del DNI del menor
- Seguro de responsabilidad civil

## Cuotas

- **Inscripción anual**: 50€
- **Cuota mensual**: 25€
- **Campamentos**: Precio variable según actividad

## ¿Tienes Dudas?

No dudes en contactarnos. Estaremos encantados de resolver todas tus preguntas sobre el escultismo y nuestro grupo.`,
    resumen: 'Información sobre el proceso de inscripción y cómo unirse al grupo scout',
    meta_descripcion: 'Aprende cómo unirte al Grupo Scout Osyris: proceso de inscripción, documentación y cuotas',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 4,
    mostrar_en_menu: true,
    permite_comentarios: true,
    creado_por: 1
  }
];

/**
 * Verificar si ya existen páginas en la base de datos
 */
async function checkExistingPages() {
  try {
    const pages = await query('SELECT COUNT(*) as count FROM paginas');
    return pages[0].count;
  } catch (error) {
    console.error('Error al verificar páginas existentes:', error.message);
    return 0;
  }
}

/**
 * Insertar una página en la base de datos
 */
async function insertPage(pageData) {
  try {
    const result = await query(`
      INSERT INTO paginas (
        titulo, slug, contenido, resumen, meta_descripcion,
        estado, tipo, orden_menu, mostrar_en_menu, permite_comentarios, creado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      pageData.titulo,
      pageData.slug,
      pageData.contenido,
      pageData.resumen,
      pageData.meta_descripcion,
      pageData.estado,
      pageData.tipo,
      pageData.orden_menu,
      pageData.mostrar_en_menu ? 1 : 0,
      pageData.permite_comentarios ? 1 : 0,
      pageData.creado_por
    ]);

    return result.insertId;
  } catch (error) {
    console.error(`Error al insertar página "${pageData.titulo}":`, error.message);
    return null;
  }
}

/**
 * Función principal para inicializar páginas de ejemplo
 */
async function initializePagesData() {
  try {
    console.log('🚀 Inicializando páginas de ejemplo para el CMS Osyris...');

    // Conectar a la base de datos
    await initializeDatabase();

    // Verificar páginas existentes
    const existingPages = await checkExistingPages();
    console.log(`📄 Páginas existentes en la base de datos: ${existingPages}`);

    if (existingPages > 0) {
      console.log('ℹ️  Ya existen páginas en la base de datos.');
      console.log('   Usa --force para sobrescribir o --add para añadir más páginas.');
      return;
    }

    console.log('📝 Insertando páginas de ejemplo...');

    let insertedCount = 0;
    for (const pageData of paginasEjemplo) {
      const pageId = await insertPage(pageData);
      if (pageId) {
        console.log(`   ✅ Página "${pageData.titulo}" insertada con ID: ${pageId}`);
        insertedCount++;
      } else {
        console.log(`   ❌ Error al insertar página "${pageData.titulo}"`);
      }
    }

    console.log(`\n🎉 Proceso completado!`);
    console.log(`   📊 Páginas insertadas: ${insertedCount}/${paginasEjemplo.length}`);

    // Verificar el resultado final
    const finalCount = await checkExistingPages();
    console.log(`   📄 Total de páginas en la base de datos: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error durante la inicialización de páginas:', error.message);
  } finally {
    await closeDatabase();
  }
}

/**
 * Función para añadir páginas sin verificar si existen
 */
async function addPagesForce() {
  try {
    console.log('🚀 Añadiendo páginas de ejemplo (modo forzado)...');

    await initializeDatabase();

    // Limpiar páginas existentes si es necesario
    const args = process.argv.slice(2);
    if (args.includes('--clear')) {
      console.log('🗑️  Limpiando páginas existentes...');
      await query('DELETE FROM paginas');
      console.log('   ✅ Páginas eliminadas');
    }

    console.log('📝 Insertando páginas de ejemplo...');

    let insertedCount = 0;
    for (const pageData of paginasEjemplo) {
      const pageId = await insertPage(pageData);
      if (pageId) {
        console.log(`   ✅ Página "${pageData.titulo}" insertada con ID: ${pageId}`);
        insertedCount++;
      }
    }

    console.log(`\n🎉 Proceso completado! Páginas insertadas: ${insertedCount}`);

  } catch (error) {
    console.error('❌ Error durante la inserción forzada:', error.message);
  } finally {
    await closeDatabase();
  }
}

/**
 * Mostrar ayuda
 */
function showHelp() {
  console.log('📝 Script de inicialización de páginas - Osyris CMS');
  console.log('\nUso:');
  console.log('  node init-pages-data.js [opciones]');
  console.log('\nOpciones:');
  console.log('  --help, -h     Mostrar esta ayuda');
  console.log('  --force, -f    Insertar páginas sin verificar existentes');
  console.log('  --clear        Limpiar páginas existentes antes de insertar (usar con --force)');
  console.log('\nEjemplos:');
  console.log('  node init-pages-data.js              # Inserción normal');
  console.log('  node init-pages-data.js --force      # Inserción forzada');
  console.log('  node init-pages-data.js --force --clear  # Limpiar e insertar');
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--force') || args.includes('-f')) {
    addPagesForce()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    initializePagesData()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = {
  initializePagesData,
  addPagesForce,
  paginasEjemplo
};