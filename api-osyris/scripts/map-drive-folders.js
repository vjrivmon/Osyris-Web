#!/usr/bin/env node
/**
 * Script de mapeo automático de carpetas Drive a educandos
 *
 * Este script:
 * 1. Lista TODAS las carpetas de educandos en Drive (todas las secciones)
 * 2. Para cada educando en BD, busca la mejor coincidencia usando fuzzy matching
 * 3. Prioriza carpetas CON archivos sobre carpetas vacías
 * 4. Guarda el folder_id en la BD
 * 5. Genera reporte de mapeos
 *
 * Uso: node scripts/map-drive-folders.js [--dry-run] [--force]
 *   --dry-run: Solo mostrar lo que haría, sin guardar en BD
 *   --force: Sobrescribir mapeos existentes
 */

require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');
const { Pool } = require('pg');

// Configuración
const CREDENTIALS_PATH = path.join(__dirname, '../credentials/google-service-account.json');
const SECCIONES = {
  castores: process.env.GOOGLE_DRIVE_CASTORES_FOLDER_ID,
  manada: process.env.GOOGLE_DRIVE_MANADA_FOLDER_ID,
  tropa: process.env.GOOGLE_DRIVE_TROPA_FOLDER_ID,
  pioneros: process.env.GOOGLE_DRIVE_PIONEROS_FOLDER_ID,
  rutas: process.env.GOOGLE_DRIVE_RUTAS_FOLDER_ID
};

// Argumentos
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');

// Pool de BD
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'osyris_user',
  password: process.env.DB_PASSWORD || 'osyris_password',
  database: process.env.DB_NAME || 'osyris_db'
});

// Cliente de Drive
let drive;

/**
 * Inicializa cliente de Google Drive
 */
async function initDrive() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  drive = google.drive({ version: 'v3', auth });
  console.log('✅ Google Drive inicializado');
}

/**
 * Normaliza un nombre para comparación
 */
function normalizar(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calcula similitud entre nombre de educando y nombre de carpeta
 * Retorna un score de 0 a 1
 */
function calcularSimilitud(nombreEducando, nombreCarpeta) {
  const a = normalizar(nombreEducando);
  const b = normalizar(nombreCarpeta);

  // Si son iguales, score perfecto
  if (a === b) return 1.0;

  // Extraer palabras
  const palabrasEducando = a.split(' ').filter(p => p.length > 1);
  const palabrasCarpeta = b.split(' ').filter(p => p.length > 1);

  if (palabrasCarpeta.length === 0) return 0;

  // Contar palabras de la carpeta que están en el nombre del educando
  let coincidencias = 0;
  for (const palabra of palabrasCarpeta) {
    if (palabrasEducando.some(pe => pe === palabra || pe.includes(palabra) || palabra.includes(pe))) {
      coincidencias++;
    }
  }

  // Score basado en qué porcentaje de palabras de la carpeta coinciden
  const score = coincidencias / palabrasCarpeta.length;

  // Bonus si el primer nombre coincide
  if (palabrasEducando[0] === palabrasCarpeta[0]) {
    return Math.min(1.0, score + 0.2);
  }

  return score;
}

/**
 * Lista todas las carpetas de educandos en Drive
 */
async function listarTodasLasCarpetas() {
  console.log('\n📂 Listando carpetas de todas las secciones...');
  const todasLasCarpetas = [];

  for (const [seccion, folderId] of Object.entries(SECCIONES)) {
    if (!folderId) {
      console.log(`   ⚠️ ${seccion}: Sin configurar`);
      continue;
    }

    try {
      // Listar subcarpetas (años)
      const añosResp = await drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)'
      });

      for (const anioFolder of añosResp.data.files) {
        // Listar carpetas de educandos en cada año
        const educandosResp = await drive.files.list({
          q: `'${anioFolder.id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: 'files(id, name)'
        });

        for (const educandoFolder of educandosResp.data.files) {
          // Contar archivos en la carpeta
          const archivosResp = await drive.files.list({
            q: `'${educandoFolder.id}' in parents and trashed=false`,
            fields: 'files(id)'
          });

          todasLasCarpetas.push({
            id: educandoFolder.id,
            nombre: educandoFolder.name,
            seccion,
            anio: anioFolder.name,
            numArchivos: archivosResp.data.files.length
          });
        }
      }

      console.log(`   ✅ ${seccion}: ${todasLasCarpetas.filter(c => c.seccion === seccion).length} carpetas`);
    } catch (error) {
      console.log(`   ❌ ${seccion}: ${error.message}`);
    }
  }

  console.log(`\n📊 Total carpetas encontradas: ${todasLasCarpetas.length}`);
  return todasLasCarpetas;
}

/**
 * Obtiene todos los educandos de la BD
 */
async function obtenerEducandos() {
  const result = await pool.query(`
    SELECT id, nombre, apellidos, drive_folder_id
    FROM educandos
    ORDER BY apellidos, nombre
  `);
  return result.rows;
}

/**
 * Encuentra la mejor carpeta para un educando
 */
function encontrarMejorCarpeta(educando, carpetas) {
  const nombreCompleto = `${educando.nombre} ${educando.apellidos}`;
  let mejorMatch = null;
  let mejorScore = 0;

  for (const carpeta of carpetas) {
    const score = calcularSimilitud(nombreCompleto, carpeta.nombre);

    // Solo considerar si hay alguna coincidencia
    if (score > 0.3) {
      // Priorizar carpetas con archivos
      const scoreAjustado = carpeta.numArchivos > 0 ? score + 0.3 : score;

      if (scoreAjustado > mejorScore) {
        mejorScore = scoreAjustado;
        mejorMatch = { ...carpeta, score, scoreAjustado };
      }
    }
  }

  return mejorMatch;
}

/**
 * Guarda el mapeo en la BD
 */
async function guardarMapeo(educandoId, folderId) {
  if (DRY_RUN) return;

  await pool.query(
    'UPDATE educandos SET drive_folder_id = $1 WHERE id = $2',
    [folderId, educandoId]
  );
}

/**
 * Ejecuta el mapeo
 */
async function ejecutarMapeo() {
  console.log('═'.repeat(60));
  console.log('🚀 SCRIPT DE MAPEO DRIVE ↔ EDUCANDOS');
  console.log('═'.repeat(60));

  if (DRY_RUN) console.log('⚠️  MODO DRY-RUN: No se guardarán cambios');
  if (FORCE) console.log('⚠️  MODO FORCE: Se sobrescribirán mapeos existentes');

  await initDrive();

  // Obtener datos
  const carpetas = await listarTodasLasCarpetas();
  const educandos = await obtenerEducandos();
  console.log(`\n👥 Educandos en BD: ${educandos.length}`);

  // Estadísticas
  const stats = {
    yaMapados: 0,
    mapeadosAuto: 0,
    noEncontrados: 0,
    errores: 0
  };

  const resultados = [];

  console.log('\n🔄 Procesando educandos...\n');

  for (const educando of educandos) {
    const nombreCompleto = `${educando.nombre} ${educando.apellidos}`;

    // Si ya tiene mapeo y no es force, saltar
    if (educando.drive_folder_id && !FORCE) {
      stats.yaMapados++;
      resultados.push({
        educando: nombreCompleto,
        estado: 'YA_MAPEADO',
        folderId: educando.drive_folder_id
      });
      continue;
    }

    // Buscar mejor coincidencia
    const mejorCarpeta = encontrarMejorCarpeta(educando, carpetas);

    if (mejorCarpeta && mejorCarpeta.score >= 0.5) {
      // Buena coincidencia
      try {
        await guardarMapeo(educando.id, mejorCarpeta.id);
        stats.mapeadosAuto++;

        const icono = mejorCarpeta.numArchivos > 0 ? '✅' : '⚠️';
        console.log(`${icono} ${nombreCompleto}`);
        console.log(`   → "${mejorCarpeta.nombre}" (${mejorCarpeta.seccion}/${mejorCarpeta.anio})`);
        console.log(`   → Score: ${(mejorCarpeta.score * 100).toFixed(0)}%, Archivos: ${mejorCarpeta.numArchivos}`);

        resultados.push({
          educando: nombreCompleto,
          estado: 'MAPEADO',
          carpeta: mejorCarpeta.nombre,
          seccion: mejorCarpeta.seccion,
          anio: mejorCarpeta.anio,
          archivos: mejorCarpeta.numArchivos,
          score: mejorCarpeta.score,
          folderId: mejorCarpeta.id
        });
      } catch (error) {
        stats.errores++;
        console.log(`❌ ${nombreCompleto}: Error guardando - ${error.message}`);
      }
    } else if (mejorCarpeta) {
      // Coincidencia baja
      console.log(`⚠️ ${nombreCompleto}`);
      console.log(`   → Posible: "${mejorCarpeta.nombre}" (score: ${(mejorCarpeta.score * 100).toFixed(0)}%)`);
      console.log(`   → Requiere revisión manual`);

      stats.noEncontrados++;
      resultados.push({
        educando: nombreCompleto,
        estado: 'REVISAR',
        posibleCarpeta: mejorCarpeta.nombre,
        score: mejorCarpeta.score
      });
    } else {
      console.log(`❌ ${nombreCompleto}: Sin coincidencia`);
      stats.noEncontrados++;
      resultados.push({
        educando: nombreCompleto,
        estado: 'NO_ENCONTRADO'
      });
    }
  }

  // Resumen
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RESUMEN');
  console.log('═'.repeat(60));
  console.log(`   ✅ Ya mapeados (sin cambios): ${stats.yaMapados}`);
  console.log(`   🔗 Mapeados automáticamente:  ${stats.mapeadosAuto}`);
  console.log(`   ⚠️  Requieren revisión:        ${stats.noEncontrados}`);
  console.log(`   ❌ Errores:                    ${stats.errores}`);
  console.log('═'.repeat(60));

  if (DRY_RUN) {
    console.log('\n⚠️  MODO DRY-RUN: No se guardaron cambios');
    console.log('   Ejecuta sin --dry-run para aplicar los mapeos');
  }

  await pool.end();
}

// Ejecutar
ejecutarMapeo().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
