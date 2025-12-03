/**
 * Script para sincronizar educandos desde archivo Excel
 * - Elimina educandos que no están en el Excel
 * - Agrega nuevos educandos del Excel
 * - Actualiza secciones según columna "Rama" del Excel
 *
 * Uso:
 *   LOCAL: node scripts/sync-educandos-from-excel.js
 *   REMOTO: DB_HOST=116.203.98.142 node scripts/sync-educandos-from-excel.js
 */

const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Config DB
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'osyris_db',
  user: process.env.DB_USER || 'osyris_user',
  password: process.env.DB_PASSWORD || 'osyris_password'
});

// Mapeo de Rama (catalán) a seccion_id
const RAMA_TO_SECCION = {
  'Colònia': 1,  // Castores
  'Estol': 2,    // Lobatos
  'Unitat': 3,   // Tropa
  'Expedició': 4, // Pioneros
  'Ruta': 5      // Rutas
};

// Educandos a eliminar (están en BD pero no en Excel)
const EDUCANDOS_A_ELIMINAR = [
  { nombre: 'Toni', apellidos: 'Brezuica' },
  { nombre: 'Jadiel', apellidos: 'Contento Gualán' },
  { nombre: 'Marc', apellidos: 'Elvers-Molina' },
  { nombre: 'Raúl', apellidos: 'Encinas Castilla' },
  { nombre: 'Jana', apellidos: 'Faustino García' },
  { nombre: 'Adriana', apellidos: 'Joelle Lizarraga' },
  { nombre: 'Manuel', apellidos: 'Ramirez de la Dueña' }
];

async function syncEducandos() {
  console.log('========================================');
  console.log('  SINCRONIZACIÓN DE EDUCANDOS');
  console.log('========================================');
  console.log(`  BD: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
  console.log(`  Database: ${process.env.DB_NAME || 'osyris_db'}`);
  console.log('========================================\n');

  // Leer Excel
  console.log('📥 Leyendo archivo Excel...');
  const excelPath = path.join(__dirname, '../../asociadas-21-11-2025-12-39-15.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Encontrar fila de cabeceras
  const headerIdx = data.findIndex(row => row.some(cell => cell && String(cell).includes('Nombre')));
  const headers = data[headerIdx];
  const rows = data.slice(headerIdx + 1);

  // Índices de columnas
  const cols = {
    tipo: headers.indexOf('Tipo'),
    rama: headers.indexOf('Rama'),
    nombre: headers.indexOf('Nombre'),
    apellidos: headers.indexOf('Apellidos'),
    fechaNacimiento: headers.indexOf('Fecha de nacimiento'),
    activo: headers.indexOf('Activo')
  };

  // Filtrar solo educandos activos
  const educandosExcel = rows
    .filter(row => row[cols.tipo] === 'Jove' && row[cols.activo] === 'Sí')
    .map(row => ({
      nombre: (row[cols.nombre] || '').trim(),
      apellidos: (row[cols.apellidos] || '').trim(),
      rama: row[cols.rama],
      fechaNacimiento: row[cols.fechaNacimiento]
    }));

  console.log(`📊 Educandos activos en Excel: ${educandosExcel.length}\n`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // =====================================================
    // PASO 1: Eliminar educandos que no están en Excel
    // =====================================================
    console.log('🗑️  PASO 1: Eliminando educandos que no están en Excel...');
    let eliminados = 0;

    for (const ed of EDUCANDOS_A_ELIMINAR) {
      const result = await client.query(
        'DELETE FROM educandos WHERE nombre = $1 AND apellidos = $2 RETURNING id',
        [ed.nombre, ed.apellidos]
      );
      if (result.rowCount > 0) {
        console.log(`   ❌ Eliminado: ${ed.nombre} ${ed.apellidos}`);
        eliminados++;
      }
    }
    console.log(`   Total eliminados: ${eliminados}\n`);

    // =====================================================
    // PASO 2: Actualizar secciones de educandos existentes
    // =====================================================
    console.log('📝 PASO 2: Actualizando secciones...');
    let actualizados = 0;
    let sinCambios = 0;
    let noEncontrados = 0;
    let nuevos = 0;

    for (const ed of educandosExcel) {
      if (!ed.nombre || !ed.apellidos) continue;

      const seccionId = RAMA_TO_SECCION[ed.rama];
      if (!seccionId) {
        console.log(`   ⚠️  Rama desconocida "${ed.rama}" para ${ed.nombre} ${ed.apellidos}`);
        continue;
      }

      // Buscar educando existente
      const existing = await client.query(
        'SELECT id, seccion_id FROM educandos WHERE LOWER(nombre) = LOWER($1) AND LOWER(apellidos) = LOWER($2)',
        [ed.nombre, ed.apellidos]
      );

      if (existing.rows.length > 0) {
        const educando = existing.rows[0];

        if (educando.seccion_id !== seccionId) {
          // Actualizar sección
          await client.query(
            'UPDATE educandos SET seccion_id = $1, fecha_actualizacion = NOW() WHERE id = $2',
            [seccionId, educando.id]
          );
          console.log(`   ✏️  ${ed.nombre} ${ed.apellidos}: sección ${educando.seccion_id} → ${seccionId}`);
          actualizados++;
        } else {
          sinCambios++;
        }
      } else {
        // Nuevo educando - insertar
        const fechaNac = parseFechaNacimiento(ed.fechaNacimiento);

        await client.query(`
          INSERT INTO educandos (nombre, apellidos, fecha_nacimiento, seccion_id, activo, fecha_alta)
          VALUES ($1, $2, $3, $4, true, NOW())
        `, [ed.nombre, ed.apellidos, fechaNac, seccionId]);

        console.log(`   ➕ Nuevo: ${ed.nombre} ${ed.apellidos} → sección ${seccionId}`);
        nuevos++;
      }
    }

    await client.query('COMMIT');

    // =====================================================
    // RESUMEN FINAL
    // =====================================================
    console.log('\n========================================');
    console.log('  RESUMEN');
    console.log('========================================');
    console.log(`  ❌ Eliminados: ${eliminados}`);
    console.log(`  ➕ Nuevos: ${nuevos}`);
    console.log(`  ✏️  Actualizados (cambio de sección): ${actualizados}`);
    console.log(`  ✓  Sin cambios: ${sinCambios}`);
    console.log('========================================\n');

    // Verificar conteo final
    const countResult = await client.query('SELECT COUNT(*) as total FROM educandos WHERE activo = true');
    console.log(`📊 Total educandos activos en BD: ${countResult.rows[0].total}\n`);

    // Mostrar distribución por sección
    const distribucion = await client.query(`
      SELECT s.nombre as seccion, COUNT(*) as cantidad
      FROM educandos e
      JOIN secciones s ON e.seccion_id = s.id
      WHERE e.activo = true
      GROUP BY s.nombre, s.id
      ORDER BY s.id
    `);

    console.log('📈 Distribución por sección:');
    distribucion.rows.forEach(row => {
      console.log(`   ${row.seccion}: ${row.cantidad}`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Parsear fecha en formato DD-MM-YYYY o DD/MM/YYYY
function parseFechaNacimiento(dateStr) {
  if (!dateStr) return null;
  const parts = String(dateStr).split(/[-/]/);
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toISOString().split('T')[0];
}

syncEducandos().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
