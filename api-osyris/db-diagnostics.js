const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/osyris.db');

/**
 * 🔍 SCRIPT DE DIAGNÓSTICO DE BASE DE DATOS OSYRIS
 * Analiza la estructura, integridad y performance de SQLite
 */

class DatabaseDiagnostics {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
  }

  // Promisificar sqlite3
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // 📊 Verificar esquema de tablas
  async checkTableSchema() {
    console.log('\n🏗️  ESTRUCTURA DE TABLAS:');
    console.log('='.repeat(50));

    const tables = await this.query(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    for (const table of tables) {
      console.log(`\n📋 Tabla: ${table.name}`);

      // Información de columnas
      const columns = await this.query(`PRAGMA table_info(${table.name})`);
      console.log('   Columnas:');
      columns.forEach(col => {
        const nullable = col.notnull ? 'NOT NULL' : 'NULL';
        const defaultVal = col.dflt_value ? `DEFAULT ${col.dflt_value}` : '';
        const pk = col.pk ? '🔑 PRIMARY KEY' : '';
        console.log(`     - ${col.name}: ${col.type} ${nullable} ${defaultVal} ${pk}`);
      });

      // Foreign keys
      const fks = await this.query(`PRAGMA foreign_key_list(${table.name})`);
      if (fks.length > 0) {
        console.log('   Foreign Keys:');
        fks.forEach(fk => {
          console.log(`     - ${fk.from} → ${fk.table}.${fk.to}`);
        });
      }

      // Índices
      const indexes = await this.query(`PRAGMA index_list(${table.name})`);
      if (indexes.length > 0) {
        console.log('   Índices:');
        for (const idx of indexes) {
          const indexInfo = await this.query(`PRAGMA index_info(${idx.name})`);
          const columns = indexInfo.map(i => i.name).join(', ');
          const unique = idx.unique ? '🔒 UNIQUE' : '';
          console.log(`     - ${idx.name}: (${columns}) ${unique}`);
        }
      }

      // Número de registros
      const count = await this.query(`SELECT COUNT(*) as count FROM ${table.name}`);
      console.log(`   📊 Registros: ${count[0].count}`);
    }
    return tables;
  }

  // 🔗 Verificar integridad referencial
  async checkReferentialIntegrity() {
    console.log('\n🔗 INTEGRIDAD REFERENCIAL:');
    console.log('='.repeat(50));

    // Verificar que foreign keys estén habilitadas
    const fkStatus = await this.query('PRAGMA foreign_keys');
    console.log(`Foreign Keys habilitadas: ${fkStatus[0].foreign_keys ? '✅ SÍ' : '❌ NO'}`);

    // Verificar violaciones de foreign key
    try {
      const violations = await this.query('PRAGMA foreign_key_check');
      if (violations.length === 0) {
        console.log('✅ No se encontraron violaciones de foreign key');
      } else {
        console.log('❌ Violaciones de foreign key encontradas:');
        violations.forEach(v => {
          console.log(`   - Tabla: ${v.table}, Row: ${v.rowid}, Parent: ${v.parent}, FK: ${v.fkid}`);
        });
      }
    } catch (error) {
      console.log(`⚠️  Error al verificar foreign keys: ${error.message}`);
    }

    return fkStatus[0].foreign_keys;
  }

  // 📈 Análisis de performance
  async analyzePerformance() {
    console.log('\n📈 ANÁLISIS DE PERFORMANCE:');
    console.log('='.repeat(50));

    // Tamaño de la base de datos
    const dbSize = await this.query('PRAGMA page_count');
    const pageSize = await this.query('PRAGMA page_size');
    const totalSize = dbSize[0].page_count * pageSize[0].page_size;
    console.log(`📊 Tamaño BD: ${(totalSize / 1024).toFixed(2)} KB`);

    // VACUUM stats
    const freePages = await this.query('PRAGMA freelist_count');
    console.log(`🗂️  Páginas libres: ${freePages[0].freelist_count}`);

    // Análisis de consultas frecuentes (simular)
    const tables = ['usuarios', 'paginas', 'secciones', 'actividades', 'documentos', 'mensajes'];

    console.log('\n🔍 Consultas de prueba:');
    for (const table of tables) {
      try {
        const start = Date.now();
        await this.query(`SELECT COUNT(*) FROM ${table}`);
        const end = Date.now();
        console.log(`   - SELECT COUNT(*) FROM ${table}: ${end - start}ms`);
      } catch (error) {
        console.log(`   - ${table}: Tabla no existe`);
      }
    }
  }

  // 🛡️ Verificar constraints y validaciones
  async checkConstraints() {
    console.log('\n🛡️  CONSTRAINTS Y VALIDACIONES:');
    console.log('='.repeat(50));

    const tables = await this.query(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);

    for (const table of tables) {
      console.log(`\n📋 ${table.name}:`);

      // Check constraints (mostrar el SQL de creación)
      const createSQL = await this.query(`
        SELECT sql FROM sqlite_master
        WHERE type='table' AND name='${table.name}'
      `);

      if (createSQL[0]?.sql) {
        const sql = createSQL[0].sql;

        // Buscar CHECK constraints
        const checkMatches = sql.match(/CHECK\s*\([^)]+\)/gi);
        if (checkMatches) {
          console.log('   ✅ CHECK Constraints:');
          checkMatches.forEach(check => {
            console.log(`     - ${check}`);
          });
        }

        // Buscar UNIQUE constraints
        const uniqueMatches = sql.match(/\w+\s+[^,]*UNIQUE[^,]*/gi);
        if (uniqueMatches) {
          console.log('   🔒 UNIQUE Constraints:');
          uniqueMatches.forEach(unique => {
            console.log(`     - ${unique.trim()}`);
          });
        }

        // Buscar NOT NULL constraints
        const notNullMatches = sql.match(/\w+\s+[^,]*NOT NULL[^,]*/gi);
        if (notNullMatches) {
          console.log('   ⚠️  NOT NULL Constraints:');
          notNullMatches.forEach(notNull => {
            console.log(`     - ${notNull.trim()}`);
          });
        }
      }
    }
  }

  // 💾 Información de configuración
  async checkConfiguration() {
    console.log('\n⚙️  CONFIGURACIÓN DE SQLITE:');
    console.log('='.repeat(50));

    const configs = [
      'journal_mode',
      'synchronous',
      'cache_size',
      'temp_store',
      'locking_mode',
      'foreign_keys',
      'recursive_triggers',
      'auto_vacuum'
    ];

    for (const config of configs) {
      try {
        const result = await this.query(`PRAGMA ${config}`);
        console.log(`${config}: ${JSON.stringify(result[0])}`);
      } catch (error) {
        console.log(`${config}: Error - ${error.message}`);
      }
    }
  }

  // 🏃 Ejecutar diagnóstico completo
  async runFullDiagnostics() {
    console.log('🔍 DIAGNÓSTICO COMPLETO DE BASE DE DATOS OSYRIS');
    console.log('='.repeat(60));

    try {
      await this.checkTableSchema();
      await this.checkReferentialIntegrity();
      await this.analyzePerformance();
      await this.checkConstraints();
      await this.checkConfiguration();

      console.log('\n✅ DIAGNÓSTICO COMPLETADO');
      console.log('='.repeat(60));
    } catch (error) {
      console.error('❌ Error durante el diagnóstico:', error);
    } finally {
      this.db.close();
    }
  }

  // 🔧 Generar recomendaciones de optimización
  async generateRecommendations() {
    console.log('\n💡 RECOMENDACIONES DE OPTIMIZACIÓN:');
    console.log('='.repeat(50));

    const recommendations = [
      '1. 🚀 Habilitar WAL mode para mejor concurrencia: PRAGMA journal_mode=WAL',
      '2. 🔗 Asegurar que foreign_keys estén habilitadas: PRAGMA foreign_keys=ON',
      '3. 📊 Crear índices para columnas de búsqueda frecuente (email, slug, estado)',
      '4. 🔄 Implementar transacciones para operaciones múltiples',
      '5. 🗂️ Considerar VACUUM periódico para optimizar espacio',
      '6. 🛡️ Validar datos en la aplicación antes de INSERT/UPDATE',
      '7. 📈 Usar prepared statements para queries repetitivas',
      '8. 💾 Implementar pool de conexiones si es necesario'
    ];

    recommendations.forEach(rec => console.log(rec));
  }
}

// Ejecutar diagnóstico
async function main() {
  const diagnostics = new DatabaseDiagnostics();
  await diagnostics.runFullDiagnostics();
  await diagnostics.generateRecommendations();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseDiagnostics;