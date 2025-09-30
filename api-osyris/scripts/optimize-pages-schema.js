#!/usr/bin/env node

/**
 * 🔧 OPTIMIZACIÓN DE SCHEMA DE PÁGINAS - OSYRIS DATABASE
 * Optimización completa del esquema de la tabla páginas
 *
 * MISIÓN: Asegurar que el schema esté optimizado para el CMS
 * - Verificar índices para performance
 * - Añadir constraints de integridad
 * - Optimizar tipos de datos
 * - Crear vistas útiles para consultas
 */

const path = require('path');
process.chdir(path.join(__dirname, '..'));

const { query, initializeDatabase, closeDatabase } = require('../src/config/db.config');

/**
 * 📊 SCHEMA OPTIMIZADO DE LA TABLA PÁGINAS
 */
const optimizedPagesSchema = `
  CREATE TABLE IF NOT EXISTS paginas_optimized (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(200) NOT NULL CHECK(LENGTH(titulo) >= 1),
    slug VARCHAR(200) UNIQUE NOT NULL CHECK(LENGTH(slug) >= 1 AND slug = LOWER(slug)),
    contenido TEXT NOT NULL CHECK(LENGTH(contenido) >= 1),
    resumen TEXT DEFAULT '',
    meta_descripcion TEXT DEFAULT '',
    imagen_destacada VARCHAR(500) DEFAULT '',
    estado VARCHAR(20) CHECK(estado IN ('borrador', 'publicada', 'archivada')) DEFAULT 'borrador',
    tipo VARCHAR(20) CHECK(tipo IN ('pagina', 'articulo', 'noticia')) DEFAULT 'pagina',
    orden_menu INTEGER DEFAULT 0 CHECK(orden_menu >= 0),
    mostrar_en_menu BOOLEAN DEFAULT 1,
    permite_comentarios BOOLEAN DEFAULT 0,
    creado_por INTEGER NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_publicacion DATETIME,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id),

    -- Índices para performance
    INDEX idx_pages_slug (slug),
    INDEX idx_pages_estado (estado),
    INDEX idx_pages_tipo (tipo),
    INDEX idx_pages_menu (mostrar_en_menu, orden_menu),
    INDEX idx_pages_publicacion (estado, fecha_publicacion),
    INDEX idx_pages_autor (creado_por)
  )
`;

/**
 * 🔍 CREAR ÍNDICES ADICIONALES PARA PERFORMANCE
 */
const performanceIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug)',
  'CREATE INDEX IF NOT EXISTS idx_paginas_estado ON paginas(estado)',
  'CREATE INDEX IF NOT EXISTS idx_paginas_tipo ON paginas(tipo)',
  'CREATE INDEX IF NOT EXISTS idx_paginas_menu ON paginas(mostrar_en_menu, orden_menu)',
  'CREATE INDEX IF NOT EXISTS idx_paginas_publicacion ON paginas(estado, fecha_publicacion)',
  'CREATE INDEX IF NOT EXISTS idx_paginas_autor ON paginas(creado_por)',
  'CREATE INDEX IF NOT EXISTS idx_paginas_busqueda ON paginas(titulo, contenido)',
];

/**
 * 📋 CREAR VISTAS ÚTILES PARA CONSULTAS COMUNES
 */
const usefulViews = [
  // Vista de páginas publicadas
  `CREATE VIEW IF NOT EXISTS v_paginas_publicadas AS
   SELECT * FROM paginas
   WHERE estado = 'publicada'
   ORDER BY orden_menu ASC, fecha_publicacion DESC`,

  // Vista de páginas de menú
  `CREATE VIEW IF NOT EXISTS v_paginas_menu AS
   SELECT id, titulo, slug, orden_menu, tipo
   FROM paginas
   WHERE estado = 'publicada' AND mostrar_en_menu = 1
   ORDER BY orden_menu ASC, titulo ASC`,

  // Vista de estadísticas por tipo
  `CREATE VIEW IF NOT EXISTS v_stats_paginas AS
   SELECT
     tipo,
     estado,
     COUNT(*) as total,
     AVG(LENGTH(contenido)) as contenido_promedio,
     MAX(fecha_actualizacion) as ultima_actualizacion
   FROM paginas
   GROUP BY tipo, estado`,

  // Vista de páginas recientes
  `CREATE VIEW IF NOT EXISTS v_paginas_recientes AS
   SELECT id, titulo, slug, tipo, fecha_actualizacion
   FROM paginas
   WHERE estado = 'publicada'
   ORDER BY fecha_actualizacion DESC
   LIMIT 10`
];

/**
 * ✅ TRIGGERS PARA MANTENER INTEGRIDAD
 */
const integrityTriggers = [
  // Trigger para actualizar fecha_actualizacion automáticamente
  `CREATE TRIGGER IF NOT EXISTS tr_paginas_update_timestamp
   AFTER UPDATE ON paginas
   BEGIN
     UPDATE paginas
     SET fecha_actualizacion = CURRENT_TIMESTAMP
     WHERE id = NEW.id;
   END`,

  // Trigger para establecer fecha_publicacion cuando se publica
  `CREATE TRIGGER IF NOT EXISTS tr_paginas_set_publish_date
   AFTER UPDATE ON paginas
   WHEN OLD.estado != 'publicada' AND NEW.estado = 'publicada'
   BEGIN
     UPDATE paginas
     SET fecha_publicacion = CURRENT_TIMESTAMP
     WHERE id = NEW.id;
   END`,

  // Trigger para validar slug único (formato correcto)
  `CREATE TRIGGER IF NOT EXISTS tr_paginas_validate_slug
   BEFORE INSERT ON paginas
   BEGIN
     SELECT CASE
       WHEN NEW.slug != LOWER(NEW.slug) THEN
         RAISE(ABORT, 'El slug debe estar en minúsculas')
       WHEN NEW.slug LIKE '% %' THEN
         RAISE(ABORT, 'El slug no puede contener espacios')
       WHEN NEW.slug GLOB '*[^a-z0-9-]*' THEN
         RAISE(ABORT, 'El slug solo puede contener letras, números y guiones')
     END;
   END`
];

/**
 * 🧹 FUNCIONES DE LIMPIEZA DE DATOS
 */
async function cleanDataIntegrity() {
  try {
    console.log('🧹 Limpiando integridad de datos...');

    // Corregir slugs con formato incorrecto
    const badSlugs = await query(`
      SELECT id, slug FROM paginas
      WHERE slug != LOWER(slug) OR slug LIKE '% %' OR slug = ''
    `);

    for (const page of badSlugs) {
      const cleanSlug = page.slug
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'pagina-sin-slug';

      await query('UPDATE paginas SET slug = ? WHERE id = ?', [cleanSlug, page.id]);
      console.log(`   🔧 Corregido slug: "${page.slug}" → "${cleanSlug}"`);
    }

    // Establecer fechas de publicación para páginas ya publicadas sin fecha
    const publishedWithoutDate = await query(`
      SELECT id FROM paginas
      WHERE estado = 'publicada' AND fecha_publicacion IS NULL
    `);

    for (const page of publishedWithoutDate) {
      await query(
        'UPDATE paginas SET fecha_publicacion = fecha_creacion WHERE id = ?',
        [page.id]
      );
    }

    console.log(`   ✅ Corregidas ${publishedWithoutDate.length} fechas de publicación`);

    // Asegurar que orden_menu no sea negativo
    await query('UPDATE paginas SET orden_menu = 0 WHERE orden_menu < 0');

    console.log('   ✅ Limpieza de datos completada');

  } catch (error) {
    console.error('❌ Error durante limpieza de datos:', error.message);
  }
}

/**
 * 📊 ESTADÍSTICAS DE LA TABLA
 */
async function showTableStats() {
  try {
    console.log('📊 ESTADÍSTICAS DE LA TABLA PÁGINAS:');

    // Estadísticas generales
    const totalPages = await query('SELECT COUNT(*) as count FROM paginas');
    const byStatus = await query(`
      SELECT estado, COUNT(*) as count
      FROM paginas
      GROUP BY estado
    `);
    const byType = await query(`
      SELECT tipo, COUNT(*) as count
      FROM paginas
      GROUP BY tipo
    `);

    console.log(`\n   📄 Total páginas: ${totalPages[0].count}`);

    console.log('\n   📊 Por estado:');
    byStatus.forEach(stat => {
      console.log(`      ${stat.estado}: ${stat.count}`);
    });

    console.log('\n   📊 Por tipo:');
    byType.forEach(stat => {
      console.log(`      ${stat.tipo}: ${stat.count}`);
    });

    // Páginas en menú
    const menuPages = await query(`
      SELECT COUNT(*) as count
      FROM paginas
      WHERE mostrar_en_menu = 1 AND estado = 'publicada'
    `);
    console.log(`\n   📋 Páginas en menú: ${menuPages[0].count}`);

    // Tamaño promedio de contenido
    const contentStats = await query(`
      SELECT
        AVG(LENGTH(contenido)) as avg_length,
        MIN(LENGTH(contenido)) as min_length,
        MAX(LENGTH(contenido)) as max_length
      FROM paginas
    `);

    console.log(`\n   📝 Estadísticas de contenido:`);
    console.log(`      Longitud promedio: ${Math.round(contentStats[0].avg_length)} caracteres`);
    console.log(`      Longitud mínima: ${contentStats[0].min_length} caracteres`);
    console.log(`      Longitud máxima: ${contentStats[0].max_length} caracteres`);

  } catch (error) {
    console.error('❌ Error al mostrar estadísticas:', error.message);
  }
}

/**
 * 🔍 VERIFICAR ÍNDICES EXISTENTES
 */
async function checkExistingIndexes() {
  try {
    const indexes = await query(`
      SELECT name FROM sqlite_master
      WHERE type = 'index' AND tbl_name = 'paginas'
    `);

    console.log('🔍 Índices existentes en tabla páginas:');
    if (indexes.length === 0) {
      console.log('   ⚠️  No hay índices personalizados');
    } else {
      indexes.forEach(index => {
        console.log(`   ✅ ${index.name}`);
      });
    }

    return indexes.length;
  } catch (error) {
    console.error('❌ Error al verificar índices:', error.message);
    return 0;
  }
}

/**
 * 🚀 FUNCIÓN PRINCIPAL DE OPTIMIZACIÓN
 */
async function optimizePagesSchema() {
  try {
    console.log('🔧 OPTIMIZANDO SCHEMA DE TABLA PÁGINAS...');

    // Conectar a la base de datos
    await initializeDatabase();

    // Verificar estado actual
    console.log('\n1️⃣ VERIFICANDO ESTADO ACTUAL:');
    const existingIndexes = await checkExistingIndexes();
    await showTableStats();

    // Limpiar integridad de datos
    console.log('\n2️⃣ LIMPIANDO INTEGRIDAD DE DATOS:');
    await cleanDataIntegrity();

    // Crear índices de performance
    console.log('\n3️⃣ CREANDO ÍNDICES DE PERFORMANCE:');
    let indexesCreated = 0;
    for (const indexSQL of performanceIndexes) {
      try {
        await query(indexSQL);
        const indexName = indexSQL.match(/idx_\w+/)?.[0] || 'índice';
        console.log(`   ✅ Creado: ${indexName}`);
        indexesCreated++;
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`   ⚠️  Error creando índice: ${error.message}`);
        }
      }
    }

    // Crear vistas útiles
    console.log('\n4️⃣ CREANDO VISTAS ÚTILES:');
    let viewsCreated = 0;
    for (const viewSQL of usefulViews) {
      try {
        await query(viewSQL);
        const viewName = viewSQL.match(/v_\w+/)?.[0] || 'vista';
        console.log(`   ✅ Creada vista: ${viewName}`);
        viewsCreated++;
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`   ⚠️  Error creando vista: ${error.message}`);
        }
      }
    }

    // Crear triggers de integridad
    console.log('\n5️⃣ CREANDO TRIGGERS DE INTEGRIDAD:');
    let triggersCreated = 0;
    for (const triggerSQL of integrityTriggers) {
      try {
        await query(triggerSQL);
        const triggerName = triggerSQL.match(/tr_\w+/)?.[0] || 'trigger';
        console.log(`   ✅ Creado trigger: ${triggerName}`);
        triggersCreated++;
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`   ⚠️  Error creando trigger: ${error.message}`);
        }
      }
    }

    // Estadísticas finales
    console.log('\n6️⃣ ESTADO FINAL:');
    await showTableStats();
    const finalIndexes = await checkExistingIndexes();

    console.log('\n🎉 OPTIMIZACIÓN COMPLETADA:');
    console.log(`   📊 Índices totales: ${finalIndexes} (creados: ${indexesCreated})`);
    console.log(`   📋 Vistas creadas: ${viewsCreated}`);
    console.log(`   🔧 Triggers creados: ${triggersCreated}`);
    console.log(`   ✅ Schema optimizado para performance y integridad`);

  } catch (error) {
    console.error('❌ Error durante la optimización:', error.message);
  } finally {
    await closeDatabase();
  }
}

/**
 * 🧪 FUNCIÓN DE ANÁLISIS DE PERFORMANCE
 */
async function analyzePerformance() {
  try {
    console.log('🧪 ANALIZANDO PERFORMANCE DE CONSULTAS...');

    await initializeDatabase();

    // Consultas comunes para probar performance
    const testQueries = [
      {
        name: 'Búsqueda por slug',
        sql: 'SELECT * FROM paginas WHERE slug = ?',
        params: ['home']
      },
      {
        name: 'Páginas publicadas',
        sql: 'SELECT * FROM paginas WHERE estado = "publicada"'
      },
      {
        name: 'Páginas de menú',
        sql: 'SELECT * FROM paginas WHERE mostrar_en_menu = 1 AND estado = "publicada" ORDER BY orden_menu'
      },
      {
        name: 'Búsqueda de texto',
        sql: 'SELECT * FROM paginas WHERE contenido LIKE "%scout%"'
      }
    ];

    console.log('\n⏱️  Tiempos de consulta:');
    for (const testQuery of testQueries) {
      const startTime = Date.now();
      await query(testQuery.sql, testQuery.params || []);
      const endTime = Date.now();
      console.log(`   ${testQuery.name}: ${endTime - startTime}ms`);
    }

  } catch (error) {
    console.error('❌ Error en análisis de performance:', error.message);
  } finally {
    await closeDatabase();
  }
}

/**
 * 📋 MOSTRAR AYUDA
 */
function showHelp() {
  console.log('🔧 Script de Optimización de Schema - Páginas CMS Osyris');
  console.log('\nPropósito: Optimizar tabla páginas para máximo performance');
  console.log('\nUso:');
  console.log('  node optimize-pages-schema.js [opciones]');
  console.log('\nOpciones:');
  console.log('  --help, -h        Mostrar esta ayuda');
  console.log('  --analyze, -a     Solo analizar performance');
  console.log('  --stats, -s       Solo mostrar estadísticas');
  console.log('\nOptimizaciones incluidas:');
  console.log('  ✅ Índices de performance para consultas comunes');
  console.log('  ✅ Vistas útiles para queries frecuentes');
  console.log('  ✅ Triggers para mantener integridad');
  console.log('  ✅ Limpieza de datos inconsistentes');
  console.log('  ✅ Constraints de validación');
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--analyze') || args.includes('-a')) {
    analyzePerformance()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else if (args.includes('--stats') || args.includes('-s')) {
    (async () => {
      await initializeDatabase();
      await showTableStats();
      await closeDatabase();
    })()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    optimizePagesSchema()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = {
  optimizePagesSchema,
  analyzePerformance,
  showTableStats,
  cleanDataIntegrity
};