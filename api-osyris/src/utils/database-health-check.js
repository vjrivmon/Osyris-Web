const fs = require('fs');
const path = require('path');
const { getBackupSystem } = require('./backup-system');
const DatabaseDiagnostics = require('../../db-diagnostics');
const DatabaseMigrator = require('./migrate-database');
const { Validator } = require('./validators');

/**
 * 🏥 SISTEMA DE CHEQUEO INTEGRAL DE SALUD DE BASE DE DATOS
 * Verifica, optimiza y mantiene la BD Osyris en estado óptimo
 */

class DatabaseHealthCheck {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overallHealth: 'unknown',
      checks: [],
      recommendations: [],
      actions: []
    };
  }

  /**
   * 🔍 Ejecutar chequeo completo de salud
   */
  async performHealthCheck() {
    console.log('🏥 INICIANDO CHEQUEO INTEGRAL DE SALUD DE BASE DE DATOS');
    console.log('='.repeat(70));

    try {
      // 1. Verificar existencia y acceso a BD
      await this.checkDatabaseAccess();

      // 2. Verificar configuración óptima
      await this.checkConfiguration();

      // 3. Verificar integridad estructural
      await this.checkStructuralIntegrity();

      // 4. Verificar performance
      await this.checkPerformance();

      // 5. Verificar sistema de backup
      await this.checkBackupSystem();

      // 6. Verificar validaciones
      await this.checkValidationSystem();

      // 7. Calcular puntuación general
      this.calculateOverallHealth();

      // 8. Generar recomendaciones
      this.generateRecommendations();

      // 9. Mostrar resultados
      this.displayResults();

      return this.results;
    } catch (error) {
      console.error('❌ Error durante el chequeo:', error);
      this.results.overallHealth = 'critical';
      this.results.checks.push({
        name: 'Sistema',
        status: 'error',
        message: error.message
      });
      return this.results;
    }
  }

  /**
   * 📁 Verificar acceso a base de datos
   */
  async checkDatabaseAccess() {
    const check = { name: 'Acceso a Base de Datos', status: 'unknown', details: {} };

    try {
      const dbPath = path.join(__dirname, '../../../database/osyris.db');

      // Verificar que el archivo existe
      if (!fs.existsSync(dbPath)) {
        check.status = 'error';
        check.message = 'Base de datos no encontrada';
        check.details.path = dbPath;
      } else {
        // Verificar permisos
        try {
          fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
          check.status = 'pass';
          check.message = 'Base de datos accesible';

          // Obtener estadísticas del archivo
          const stats = fs.statSync(dbPath);
          check.details = {
            path: dbPath,
            size: `${(stats.size / 1024).toFixed(2)} KB`,
            lastModified: stats.mtime.toISOString(),
            permissions: 'Lectura/Escritura OK'
          };
        } catch (permError) {
          check.status = 'warn';
          check.message = 'Problemas de permisos en BD';
          check.details.error = permError.message;
        }
      }
    } catch (error) {
      check.status = 'error';
      check.message = error.message;
    }

    this.results.checks.push(check);
  }

  /**
   * ⚙️ Verificar configuración de SQLite
   */
  async checkConfiguration() {
    const check = { name: 'Configuración SQLite', status: 'unknown', details: {} };

    try {
      const diagnostics = new DatabaseDiagnostics();
      await diagnostics.connect();

      // Verificar configuraciones críticas
      const configs = {
        foreign_keys: await diagnostics.query('PRAGMA foreign_keys'),
        journal_mode: await diagnostics.query('PRAGMA journal_mode'),
        synchronous: await diagnostics.query('PRAGMA synchronous'),
        cache_size: await diagnostics.query('PRAGMA cache_size'),
        auto_vacuum: await diagnostics.query('PRAGMA auto_vacuum')
      };

      // Evaluar configuraciones
      const issues = [];
      let score = 100;

      if (configs.foreign_keys[0].foreign_keys === 0) {
        issues.push('Foreign keys deshabilitadas');
        score -= 30;
      }

      if (configs.journal_mode[0].journal_mode !== 'wal') {
        issues.push(`Journal mode ineficiente: ${configs.journal_mode[0].journal_mode}`);
        score -= 20;
      }

      if (configs.cache_size[0].cache_size > -4000) {
        issues.push('Cache size insuficiente para performance óptima');
        score -= 10;
      }

      // Determinar estado
      if (score >= 90) {
        check.status = 'pass';
        check.message = 'Configuración óptima';
      } else if (score >= 70) {
        check.status = 'warn';
        check.message = 'Configuración mejorable';
      } else {
        check.status = 'error';
        check.message = 'Configuración problemática';
      }

      check.details = {
        score: `${score}/100`,
        issues: issues,
        configs: {
          foreign_keys: configs.foreign_keys[0].foreign_keys ? 'ON' : 'OFF',
          journal_mode: configs.journal_mode[0].journal_mode,
          synchronous: configs.synchronous[0].synchronous,
          cache_size: configs.cache_size[0].cache_size,
          auto_vacuum: configs.auto_vacuum[0].auto_vacuum
        }
      };

      diagnostics.db.close();
    } catch (error) {
      check.status = 'error';
      check.message = `Error verificando configuración: ${error.message}`;
    }

    this.results.checks.push(check);
  }

  /**
   * 🏗️ Verificar integridad estructural
   */
  async checkStructuralIntegrity() {
    const check = { name: 'Integridad Estructural', status: 'unknown', details: {} };

    try {
      const diagnostics = new DatabaseDiagnostics();
      await diagnostics.connect();

      // Verificar integridad de la BD
      const integrityCheck = await diagnostics.query('PRAGMA integrity_check');
      const isIntegrityOk = integrityCheck[0].integrity_check === 'ok';

      // Verificar foreign keys
      const fkCheck = await diagnostics.query('PRAGMA foreign_key_check');
      const hasFkViolations = fkCheck.length > 0;

      // Verificar estructura de tablas
      const tables = await diagnostics.query(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);

      const expectedTables = ['usuarios', 'secciones', 'actividades', 'documentos', 'mensajes', 'paginas'];
      const missingTables = expectedTables.filter(table =>
        !tables.find(t => t.name === table)
      );

      // Evaluar estado
      if (isIntegrityOk && !hasFkViolations && missingTables.length === 0) {
        check.status = 'pass';
        check.message = 'Estructura íntegra y completa';
      } else if (isIntegrityOk && missingTables.length === 0) {
        check.status = 'warn';
        check.message = 'Estructura correcta, problemas menores';
      } else {
        check.status = 'error';
        check.message = 'Problemas estructurales detectados';
      }

      check.details = {
        integrity: isIntegrityOk ? 'OK' : 'CORRUPTA',
        foreignKeyViolations: fkCheck.length,
        tablesFound: tables.length,
        missingTables: missingTables,
        violations: fkCheck.slice(0, 5) // Mostrar máximo 5
      };

      diagnostics.db.close();
    } catch (error) {
      check.status = 'error';
      check.message = `Error verificando integridad: ${error.message}`;
    }

    this.results.checks.push(check);
  }

  /**
   * 📈 Verificar performance
   */
  async checkPerformance() {
    const check = { name: 'Performance y Optimización', status: 'unknown', details: {} };

    try {
      const diagnostics = new DatabaseDiagnostics();
      await diagnostics.connect();

      // Contar índices
      const indexes = await diagnostics.query(`
        SELECT COUNT(*) as count FROM sqlite_master
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
      `);

      // Verificar páginas libres
      const freePages = await diagnostics.query('PRAGMA freelist_count');

      // Test de velocidad en consultas básicas
      const performanceTests = [];
      const tables = ['usuarios', 'paginas', 'secciones', 'documentos'];

      for (const table of tables) {
        try {
          const start = Date.now();
          await diagnostics.query(`SELECT COUNT(*) FROM ${table}`);
          const end = Date.now();
          performanceTests.push({
            table: table,
            time: end - start
          });
        } catch (error) {
          performanceTests.push({
            table: table,
            time: -1,
            error: error.message
          });
        }
      }

      // Evaluar performance
      const avgTime = performanceTests
        .filter(t => t.time >= 0)
        .reduce((sum, t) => sum + t.time, 0) / performanceTests.length;

      const slowQueries = performanceTests.filter(t => t.time > 10);

      if (avgTime < 5 && slowQueries.length === 0 && indexes.count >= 15) {
        check.status = 'pass';
        check.message = 'Performance excelente';
      } else if (avgTime < 15 && slowQueries.length <= 1) {
        check.status = 'warn';
        check.message = 'Performance aceptable';
      } else {
        check.status = 'error';
        check.message = 'Performance problemática';
      }

      check.details = {
        avgQueryTime: `${avgTime.toFixed(2)}ms`,
        slowQueries: slowQueries.length,
        indexCount: indexes[0].count,
        freePages: freePages[0].freelist_count,
        tests: performanceTests
      };

      diagnostics.db.close();
    } catch (error) {
      check.status = 'error';
      check.message = `Error verificando performance: ${error.message}`;
    }

    this.results.checks.push(check);
  }

  /**
   * 💾 Verificar sistema de backup
   */
  async checkBackupSystem() {
    const check = { name: 'Sistema de Backup', status: 'unknown', details: {} };

    try {
      const backupSystem = getBackupSystem();
      const backups = await backupSystem.listBackups();

      // Verificar directorio de backup
      const backupDir = path.join(__dirname, '../../../backups');
      const hasDirAccess = fs.existsSync(backupDir);

      // Verificar backup reciente
      const recentBackup = backups.length > 0 ? backups[0] : null;
      const hasRecentBackup = recentBackup &&
        (new Date() - new Date(recentBackup.timestamp)) < (7 * 24 * 60 * 60 * 1000); // 7 días

      // Evaluar estado
      if (hasDirAccess && hasRecentBackup && backups.length >= 3) {
        check.status = 'pass';
        check.message = 'Sistema de backup funcionando correctamente';
      } else if (hasDirAccess && backups.length > 0) {
        check.status = 'warn';
        check.message = 'Sistema de backup presente pero mejorable';
      } else {
        check.status = 'error';
        check.message = 'Sistema de backup no configurado o fallando';
      }

      check.details = {
        backupDirectory: hasDirAccess ? 'Accesible' : 'No accesible',
        totalBackups: backups.length,
        lastBackup: recentBackup ? recentBackup.timestamp : 'Nunca',
        hasRecentBackup: hasRecentBackup,
        oldestBackup: backups.length > 0 ? backups[backups.length - 1].timestamp : 'N/A'
      };
    } catch (error) {
      check.status = 'error';
      check.message = `Error verificando sistema de backup: ${error.message}`;
    }

    this.results.checks.push(check);
  }

  /**
   * 🛡️ Verificar sistema de validación
   */
  async checkValidationSystem() {
    const check = { name: 'Sistema de Validación', status: 'unknown', details: {} };

    try {
      // Test básico de validadores
      const testCases = [
        {
          name: 'Usuario válido',
          test: () => Validator.validateUserCreate({
            nombre: 'Test',
            apellidos: 'User',
            email: 'test@example.com',
            password: 'Test123!@#',
            rol: 'scouter'
          })
        },
        {
          name: 'Usuario inválido',
          test: () => {
            try {
              Validator.validateUserCreate({
                nombre: 'T',
                email: 'invalid-email',
                password: '123'
              });
              return false; // No debería llegar aquí
            } catch (error) {
              return error.name === 'ValidationError';
            }
          }
        },
        {
          name: 'ID válido',
          test: () => {
            try {
              Validator.validateId(123);
              return true;
            } catch (error) {
              return false;
            }
          }
        },
        {
          name: 'ID inválido',
          test: () => {
            try {
              Validator.validateId('invalid');
              return false;
            } catch (error) {
              return error.name === 'ValidationError';
            }
          }
        }
      ];

      const results = testCases.map(testCase => {
        try {
          const result = testCase.test();
          return {
            name: testCase.name,
            passed: result === true
          };
        } catch (error) {
          return {
            name: testCase.name,
            passed: false,
            error: error.message
          };
        }
      });

      const passedTests = results.filter(r => r.passed).length;
      const totalTests = results.length;

      if (passedTests === totalTests) {
        check.status = 'pass';
        check.message = 'Sistema de validación funcionando correctamente';
      } else if (passedTests >= totalTests * 0.75) {
        check.status = 'warn';
        check.message = 'Sistema de validación mayormente funcional';
      } else {
        check.status = 'error';
        check.message = 'Sistema de validación con problemas';
      }

      check.details = {
        testsPassed: `${passedTests}/${totalTests}`,
        successRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
        results: results
      };
    } catch (error) {
      check.status = 'error';
      check.message = `Error verificando validadores: ${error.message}`;
    }

    this.results.checks.push(check);
  }

  /**
   * 📊 Calcular salud general
   */
  calculateOverallHealth() {
    const checks = this.results.checks;
    const passCount = checks.filter(c => c.status === 'pass').length;
    const warnCount = checks.filter(c => c.status === 'warn').length;
    const errorCount = checks.filter(c => c.status === 'error').length;

    const score = (passCount * 100 + warnCount * 60) / checks.length;

    if (errorCount > 0) {
      this.results.overallHealth = 'critical';
    } else if (score >= 90) {
      this.results.overallHealth = 'excellent';
    } else if (score >= 75) {
      this.results.overallHealth = 'good';
    } else if (score >= 60) {
      this.results.overallHealth = 'fair';
    } else {
      this.results.overallHealth = 'poor';
    }

    this.results.healthScore = Math.round(score);
  }

  /**
   * 💡 Generar recomendaciones
   */
  generateRecommendations() {
    const recommendations = [];

    this.results.checks.forEach(check => {
      if (check.status === 'error' || check.status === 'warn') {
        switch (check.name) {
          case 'Configuración SQLite':
            if (check.details.configs && check.details.configs.foreign_keys === 'OFF') {
              recommendations.push('🔗 Habilitar foreign keys permanentemente');
            }
            if (check.details.configs && check.details.configs.journal_mode !== 'wal') {
              recommendations.push('🚀 Cambiar a WAL mode para mejor performance');
            }
            break;

          case 'Performance y Optimización':
            if (check.details.slowQueries > 0) {
              recommendations.push('📊 Optimizar queries lentas con índices adicionales');
            }
            if (check.details.indexCount < 15) {
              recommendations.push('📈 Crear más índices para consultas frecuentes');
            }
            break;

          case 'Sistema de Backup':
            if (!check.details.hasRecentBackup) {
              recommendations.push('💾 Configurar backups automáticos regulares');
            }
            if (check.details.totalBackups < 3) {
              recommendations.push('🗂️ Mantener más copias de backup históricas');
            }
            break;

          case 'Integridad Estructural':
            if (check.details.foreignKeyViolations > 0) {
              recommendations.push('🛡️ Corregir violaciones de integridad referencial');
            }
            if (check.details.missingTables && check.details.missingTables.length > 0) {
              recommendations.push('🏗️ Recrear tablas faltantes');
            }
            break;
        }
      }
    });

    // Recomendaciones generales
    if (this.results.healthScore < 80) {
      recommendations.push('🔧 Ejecutar migración de optimización completa');
    }

    if (this.results.healthScore >= 90) {
      recommendations.push('✨ Sistema en excelente estado - mantener rutinas de mantenimiento');
    }

    this.results.recommendations = recommendations;
  }

  /**
   * 📋 Mostrar resultados
   */
  displayResults() {
    console.log('\n📋 RESULTADOS DEL CHEQUEO DE SALUD');
    console.log('='.repeat(50));

    // Estado general
    const healthEmoji = {
      excellent: '🟢',
      good: '🟡',
      fair: '🟠',
      poor: '🔴',
      critical: '💀'
    };

    console.log(`\n${healthEmoji[this.results.overallHealth]} Estado General: ${this.results.overallHealth.toUpperCase()}`);
    console.log(`📊 Puntuación: ${this.results.healthScore}/100`);

    // Resumen de checks
    console.log('\n🔍 Resumen de Verificaciones:');
    this.results.checks.forEach(check => {
      const emoji = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
      console.log(`   ${emoji} ${check.name}: ${check.message}`);
    });

    // Recomendaciones
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recomendaciones:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log(`🕐 Chequeo completado: ${this.results.timestamp}`);
  }

  /**
   * 💾 Guardar reporte
   */
  async saveReport() {
    try {
      const reportDir = path.join(__dirname, '../../../reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(reportDir, `health-check-${timestamp}.json`);

      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Reporte guardado: ${reportPath}`);

      return reportPath;
    } catch (error) {
      console.error('❌ Error guardando reporte:', error);
      return null;
    }
  }
}

// Ejecutar si se llama directamente
async function main() {
  const healthCheck = new DatabaseHealthCheck();
  const results = await healthCheck.performHealthCheck();
  await healthCheck.saveReport();

  // Código de salida basado en la salud
  const exitCode = {
    excellent: 0,
    good: 0,
    fair: 1,
    poor: 1,
    critical: 2
  }[results.overallHealth] || 2;

  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseHealthCheck;