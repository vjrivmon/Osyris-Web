const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

/**
 * 🔄 SCRIPT DE MIGRACIÓN PARA OPTIMIZACIÓN DE BASE DE DATOS OSYRIS
 * Migra de la configuración básica a la optimizada
 */

const DB_PATH = path.join(__dirname, '../../../database/osyris.db');
const BACKUP_DIR = path.join(__dirname, '../../../backups');

class DatabaseMigrator {
  constructor() {
    this.db = null;
  }

  // Conectar a la base de datos
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Conectado a la base de datos para migración');
          resolve();
        }
      });
    });
  }

  // Ejecutar query
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Ejecutar comando
  async exec(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({
          insertId: this.lastID,
          changes: this.changes
        });
      });
    });
  }

  // Crear backup antes de migrar
  async createBackup() {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUP_DIR, `pre_migration_backup_${timestamp}.db`);

      await this.exec(`VACUUM INTO '${backupPath}'`);
      console.log(`💾 Backup creado: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      throw error;
    }
  }

  // Verificar estado actual de la BD
  async checkCurrentState() {
    try {
      console.log('🔍 Verificando estado actual de la base de datos...');

      // Verificar foreign keys
      const fkStatus = await this.query('PRAGMA foreign_keys');
      console.log(`Foreign Keys: ${fkStatus[0].foreign_keys ? '✅ Habilitadas' : '❌ Deshabilitadas'}`);

      // Verificar journal mode
      const journalMode = await this.query('PRAGMA journal_mode');
      console.log(`Journal Mode: ${journalMode[0].journal_mode}`);

      // Verificar índices existentes
      const indexes = await this.query(`
        SELECT name, tbl_name, sql
        FROM sqlite_master
        WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
      `);
      console.log(`📊 Índices personalizados: ${indexes.length}`);

      // Verificar estructura de tablas
      const tables = await this.query(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);
      console.log(`📋 Tablas encontradas: ${tables.map(t => t.name).join(', ')}`);

      return {
        foreignKeys: fkStatus[0].foreign_keys,
        journalMode: journalMode[0].journal_mode,
        indexCount: indexes.length,
        tables: tables.map(t => t.name)
      };
    } catch (error) {
      console.error('❌ Error verificando estado:', error);
      throw error;
    }
  }

  // Habilitar configuraciones optimizadas
  async enableOptimizations() {
    try {
      console.log('🚀 Aplicando optimizaciones...');

      const optimizations = [
        'PRAGMA foreign_keys=ON',
        'PRAGMA journal_mode=WAL',
        'PRAGMA recursive_triggers=ON',
        'PRAGMA cache_size=-8000',
        'PRAGMA synchronous=NORMAL',
        'PRAGMA auto_vacuum=INCREMENTAL',
        'PRAGMA busy_timeout=30000'
      ];

      for (const pragma of optimizations) {
        try {
          await this.exec(pragma);
          console.log(`✅ ${pragma}`);
        } catch (error) {
          console.error(`❌ Error en ${pragma}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error aplicando optimizaciones:', error);
      throw error;
    }
  }

  // Agregar constraints faltantes
  async addMissingConstraints() {
    try {
      console.log('🛡️ Agregando constraints faltantes...');

      // Como SQLite no permite ALTER TABLE para agregar constraints,
      // verificamos que las nuevas tablas se crearán con constraints
      // y agregamos validaciones en el nivel de aplicación

      // Verificar datos existentes que podrían violar constraints
      const checks = [
        {
          name: 'Usuarios con email duplicado',
          query: `
            SELECT email, COUNT(*) as count
            FROM usuarios
            GROUP BY email
            HAVING COUNT(*) > 1
          `
        },
        {
          name: 'Actividades con fechas inválidas',
          query: `
            SELECT id, titulo, fecha_inicio, fecha_fin
            FROM actividades
            WHERE fecha_fin IS NOT NULL AND fecha_fin < fecha_inicio
          `
        },
        {
          name: 'Usuarios con sección inexistente',
          query: `
            SELECT u.id, u.nombre, u.seccion_id
            FROM usuarios u
            WHERE u.seccion_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM secciones s WHERE s.id = u.seccion_id)
          `
        }
      ];

      for (const check of checks) {
        const result = await this.query(check.query);
        if (result.length > 0) {
          console.warn(`⚠️ ${check.name}: ${result.length} registros`);
          console.log(result);
        } else {
          console.log(`✅ ${check.name}: Sin problemas`);
        }
      }
    } catch (error) {
      console.error('❌ Error verificando constraints:', error);
      throw error;
    }
  }

  // Crear índices optimizados
  async createOptimizedIndexes() {
    try {
      console.log('📊 Creando índices optimizados...');

      const indexes = [
        // Índices para usuarios
        'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)',
        'CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol)',
        'CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo)',
        'CREATE INDEX IF NOT EXISTS idx_usuarios_seccion ON usuarios(seccion_id)',
        'CREATE INDEX IF NOT EXISTS idx_usuarios_ultimo_acceso ON usuarios(ultimo_acceso)',

        // Índices para actividades
        'CREATE INDEX IF NOT EXISTS idx_actividades_fecha_inicio ON actividades(fecha_inicio)',
        'CREATE INDEX IF NOT EXISTS idx_actividades_estado ON actividades(estado)',
        'CREATE INDEX IF NOT EXISTS idx_actividades_tipo ON actividades(tipo)',
        'CREATE INDEX IF NOT EXISTS idx_actividades_seccion ON actividades(seccion_id)',
        'CREATE INDEX IF NOT EXISTS idx_actividades_creado_por ON actividades(creado_por)',

        // Índices para documentos
        'CREATE INDEX IF NOT EXISTS idx_documentos_tipo_archivo ON documentos(tipo_archivo)',
        'CREATE INDEX IF NOT EXISTS idx_documentos_fecha_subida ON documentos(fecha_subida)',
        'CREATE INDEX IF NOT EXISTS idx_documentos_visible_para ON documentos(visible_para)',
        'CREATE INDEX IF NOT EXISTS idx_documentos_seccion ON documentos(seccion_id)',

        // Índices para mensajes
        'CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id)',
        'CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario_tipo ON mensajes(destinatario_tipo)',
        'CREATE INDEX IF NOT EXISTS idx_mensajes_fecha_envio ON mensajes(fecha_envio)',
        'CREATE INDEX IF NOT EXISTS idx_mensajes_prioridad ON mensajes(prioridad)',

        // Índices para páginas
        'CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug)',
        'CREATE INDEX IF NOT EXISTS idx_paginas_estado ON paginas(estado)',
        'CREATE INDEX IF NOT EXISTS idx_paginas_tipo ON paginas(tipo)',
        'CREATE INDEX IF NOT EXISTS idx_paginas_mostrar_menu ON paginas(mostrar_en_menu)',
        'CREATE INDEX IF NOT EXISTS idx_paginas_orden_menu ON paginas(orden_menu)',

        // Índices compuestos para consultas frecuentes
        'CREATE INDEX IF NOT EXISTS idx_usuarios_rol_activo ON usuarios(rol, activo)',
        'CREATE INDEX IF NOT EXISTS idx_actividades_fecha_estado ON actividades(fecha_inicio, estado)',
        'CREATE INDEX IF NOT EXISTS idx_paginas_estado_menu ON paginas(estado, mostrar_en_menu)'
      ];

      let created = 0;
      for (const indexSQL of indexes) {
        try {
          await this.exec(indexSQL);
          created++;
          const indexName = indexSQL.split(' ')[5]; // Extraer nombre
          console.log(`✅ ${indexName}`);
        } catch (error) {
          console.error(`❌ Error creando índice: ${error.message}`);
        }
      }

      console.log(`📊 Índices creados: ${created}/${indexes.length}`);
    } catch (error) {
      console.error('❌ Error creando índices:', error);
      throw error;
    }
  }

  // Agregar columnas faltantes si es necesario
  async addMissingColumns() {
    try {
      console.log('📝 Verificando columnas faltantes...');

      const tablesToCheck = [
        {
          table: 'usuarios',
          columns: ['fecha_actualizacion']
        },
        {
          table: 'actividades',
          columns: ['fecha_actualizacion']
        },
        {
          table: 'documentos',
          columns: ['activo']
        },
        {
          table: 'secciones',
          columns: ['fecha_creacion', 'fecha_actualizacion']
        }
      ];

      for (const tableInfo of tablesToCheck) {
        const { table, columns } = tableInfo;

        // Obtener columnas existentes
        const existingColumns = await this.query(`PRAGMA table_info(${table})`);
        const existingNames = existingColumns.map(col => col.name);

        for (const column of columns) {
          if (!existingNames.includes(column)) {
            try {
              let columnDef = '';
              switch (column) {
                case 'fecha_actualizacion':
                  columnDef = 'DATETIME DEFAULT CURRENT_TIMESTAMP';
                  break;
                case 'fecha_creacion':
                  columnDef = 'DATETIME DEFAULT CURRENT_TIMESTAMP';
                  break;
                case 'activo':
                  columnDef = 'BOOLEAN DEFAULT 1 NOT NULL';
                  break;
                default:
                  columnDef = 'TEXT';
              }

              await this.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${columnDef}`);
              console.log(`✅ Columna ${column} agregada a ${table}`);
            } catch (error) {
              console.error(`❌ Error agregando ${column} a ${table}: ${error.message}`);
            }
          } else {
            console.log(`✅ Columna ${column} ya existe en ${table}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error agregando columnas:', error);
      throw error;
    }
  }

  // Optimizar base de datos
  async optimizeDatabase() {
    try {
      console.log('🧹 Optimizando base de datos...');

      await this.exec('PRAGMA optimize');
      await this.exec('ANALYZE');

      console.log('✅ Base de datos optimizada');
    } catch (error) {
      console.error('❌ Error optimizando:', error);
      throw error;
    }
  }

  // Verificar integridad final
  async verifyIntegrity() {
    try {
      console.log('🔍 Verificando integridad final...');

      // Check de integridad
      const integrityCheck = await this.query('PRAGMA integrity_check');
      if (integrityCheck[0].integrity_check === 'ok') {
        console.log('✅ Integridad: OK');
      } else {
        console.error('❌ Problemas de integridad:', integrityCheck);
      }

      // Check de foreign keys
      const fkCheck = await this.query('PRAGMA foreign_key_check');
      if (fkCheck.length === 0) {
        console.log('✅ Foreign Keys: OK');
      } else {
        console.error('❌ Violaciones de foreign key:', fkCheck);
      }

      // Estadísticas finales
      const tables = await this.query(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

      for (const table of tables) {
        const count = await this.query(`SELECT COUNT(*) as count FROM ${table.name}`);
        console.log(`📊 ${table.name}: ${count[0].count} registros`);
      }

      // Tamaño final
      const dbSize = await this.query('PRAGMA page_count');
      const pageSize = await this.query('PRAGMA page_size');
      const totalSize = dbSize[0].page_count * pageSize[0].page_size;
      console.log(`💾 Tamaño final: ${(totalSize / 1024).toFixed(2)} KB`);

    } catch (error) {
      console.error('❌ Error verificando integridad:', error);
      throw error;
    }
  }

  // Ejecutar migración completa
  async migrate() {
    try {
      console.log('🚀 INICIANDO MIGRACIÓN DE BASE DE DATOS OSYRIS');
      console.log('='.repeat(60));

      await this.connect();

      // 1. Verificar estado actual
      const currentState = await this.checkCurrentState();

      // 2. Crear backup
      const backupPath = await this.createBackup();

      // 3. Aplicar optimizaciones
      await this.enableOptimizations();

      // 4. Agregar columnas faltantes
      await this.addMissingColumns();

      // 5. Verificar constraints
      await this.addMissingConstraints();

      // 6. Crear índices
      await this.createOptimizedIndexes();

      // 7. Optimizar BD
      await this.optimizeDatabase();

      // 8. Verificar integridad
      await this.verifyIntegrity();

      console.log('='.repeat(60));
      console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
      console.log(`💾 Backup disponible en: ${backupPath}`);
      console.log('='.repeat(60));

    } catch (error) {
      console.error('❌ Error durante la migración:', error);
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }

  // Cerrar conexión
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Ejecutar migración si se llama directamente
async function main() {
  const migrator = new DatabaseMigrator();
  try {
    await migrator.migrate();
  } catch (error) {
    console.error('💥 Migración fallida:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseMigrator;