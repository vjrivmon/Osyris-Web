/**
 * Script para importar educandos desde archivo Excel MEV
 * Uso: node scripts/import-educandos-xlsx.js
 */

const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api-osyris/.env') });

// Config DB
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'osyris_db',
  user: process.env.DB_USER || 'osyris_user',
  password: process.env.DB_PASSWORD || 'osyris_password'
});

// Mapping de secciones basado en edad (calculada desde fecha actual)
const getSectionByBirthYear = (birthDate) => {
  const today = new Date();
  const birth = parseDate(birthDate);
  if (!birth) return null;

  const age = today.getFullYear() - birth.getFullYear();

  // Ajustar edad si no ha cumplido años este año
  const hasBirthdayPassed = today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  const actualAge = hasBirthdayPassed ? age : age - 1;

  if (actualAge >= 5 && actualAge < 8) return { id: 1, name: 'Castores' };
  if (actualAge >= 8 && actualAge < 11) return { id: 2, name: 'Lobatos' };
  if (actualAge >= 11 && actualAge < 14) return { id: 3, name: 'Tropa' };
  if (actualAge >= 14 && actualAge < 17) return { id: 4, name: 'Pioneros' };
  if (actualAge >= 17 && actualAge < 21) return { id: 5, name: 'Rutas' };
  return null;
};

// Parse date formats: "02-09-2013" or "15/04/2015"
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

// Generate random vinculacion code
const generateVinculacionCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

async function importEducandos() {
  console.log('📥 Leyendo archivo Excel...');

  const workbook = XLSX.readFile(path.join(__dirname, '../../asociadas-21-11-2025-12-39-15.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Find header row
  const headerIdx = data.findIndex(row => row.some(cell => cell && String(cell).includes('Nom')));
  if (headerIdx < 0) {
    console.error('❌ No se encontró la fila de cabeceras');
    return;
  }

  const headers = data[headerIdx];
  const rows = data.slice(headerIdx + 1);

  // Column indices
  const cols = {
    id: headers.indexOf('Id'),
    tipo: headers.indexOf('Tipo'),
    nombre: headers.indexOf('Nombre'),
    apellidos: headers.indexOf('Apellidos'),
    genero: headers.indexOf('Género'),
    fechaNacimiento: headers.indexOf('Fecha de nacimiento'),
    dni: headers.indexOf('DNI/NIE'),
    direccion: headers.indexOf('Dirección'),
    codigoPostal: headers.indexOf('Código postal'),
    telefono: headers.indexOf('Teléfono móvil'),
    email: headers.indexOf('Email'),
    activo: headers.indexOf('Activo'),
    alergias: headers.indexOf('Allergies')
  };

  console.log(`📊 Encontradas ${rows.length} filas de datos`);

  // Filter only "Jove" (scouts/educandos)
  const educandos = rows.filter(row => row[cols.tipo] === 'Jove' && row[cols.activo] === 'Sí');
  console.log(`👧 Educandos activos a importar: ${educandos.length}`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of educandos) {
      const nombre = (row[cols.nombre] || '').trim();
      const apellidos = (row[cols.apellidos] || '').trim();
      const fechaNacimiento = row[cols.fechaNacimiento];

      if (!nombre || !apellidos) {
        console.log(`⚠️  Saltando fila sin nombre: ${row[cols.id]}`);
        skipped++;
        continue;
      }

      // Get section based on age
      const seccion = getSectionByBirthYear(fechaNacimiento);
      if (!seccion) {
        console.log(`⚠️  ${nombre} ${apellidos}: edad fuera de rango (${fechaNacimiento})`);
        skipped++;
        continue;
      }

      // Parse date to ISO format
      const birthDate = parseDate(fechaNacimiento);
      const fechaISO = birthDate ? birthDate.toISOString().split('T')[0] : null;

      // Check if already exists
      const existing = await client.query(
        'SELECT id FROM educandos WHERE nombre = $1 AND apellidos = $2',
        [nombre, apellidos]
      );

      if (existing.rows.length > 0) {
        console.log(`🔄 Ya existe: ${nombre} ${apellidos}`);
        skipped++;
        continue;
      }

      // Insert educando
      const result = await client.query(`
        INSERT INTO educandos (nombre, apellidos, fecha_nacimiento, seccion_id, activo, fecha_alta)
        VALUES ($1, $2, $3, $4, true, NOW())
        RETURNING id
      `, [nombre, apellidos, fechaISO, seccion.id]);

      const educandoId = result.rows[0].id;

      console.log(`✅ ${nombre} ${apellidos} -> ${seccion.name} (ID: ${educandoId})`);
      imported++;
    }

    await client.query('COMMIT');

    console.log('\n📊 RESUMEN:');
    console.log(`   ✅ Importados: ${imported}`);
    console.log(`   ⏭️  Saltados: ${skipped}`);
    console.log(`   ❌ Errores: ${errors}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

importEducandos();
