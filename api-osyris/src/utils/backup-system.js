const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');

const execAsync = promisify(exec);

/**
 * 💾 SISTEMA DE BACKUP Y RECOVERY AUTOMÁTICO - OSYRIS
 * Gestión completa de respaldos de la base de datos SQLite
 */

const DB_PATH = path.join(__dirname, '../../../database/osyris.db');
const BACKUP_DIR = path.join(__dirname, '../../../backups');
const LOG_FILE = path.join(BACKUP_DIR, 'backup.log');

class BackupSystem {
  constructor() {
    this.db = null;
    this.scheduledJobs = [];
    this.isRunning = false;

    // Crear directorio de backups si no existe
    this.ensureBackupDirectory();
  }

  /**
   * 📁 Asegurar que existe el directorio de backups
   */
  ensureBackupDirectory() {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`📁 Directorio de backups creado: ${BACKUP_DIR}`);
    }
  }

  /**
   * 📝 Escribir log de operaciones
   */
  writeLog(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    try {
      fs.appendFileSync(LOG_FILE, logMessage);
      console.log(`[BACKUP] ${message}`);
    } catch (error) {
      console.error('Error escribiendo log:', error);
    }
  }

  /**
   * 🔌 Conectar a la base de datos
   */
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          this.writeLog(`Error conectando a BD: ${err.message}`, 'ERROR');
          reject(err);
        } else {
          this.writeLog('Conectado a la base de datos para backup');
          resolve();
        }
      });
    });
  }

  /**
   * 📊 Obtener estadísticas de la BD antes del backup
   */
  async getDatabaseStats() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('No hay conexión a la base de datos'));
        return;
      }

      const stats = {};

      // Tamaño de archivo
      try {
        const dbStats = fs.statSync(DB_PATH);
        stats.fileSize = dbStats.size;
        stats.lastModified = dbStats.mtime;
      } catch (error) {
        stats.fileSize = 0;
        stats.lastModified = new Date();
      }

      // Contar registros por tabla
      const tables = ['usuarios', 'secciones', 'actividades', 'documentos', 'mensajes', 'paginas'];
      let completed = 0;

      stats.tables = {};

      tables.forEach(table => {
        this.db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
          if (!err) {
            stats.tables[table] = row.count;
          } else {
            stats.tables[table] = 0;
          }

          completed++;
          if (completed === tables.length) {
            resolve(stats);
          }
        });
      });

      // Si no hay tablas, resolver inmediatamente
      if (tables.length === 0) {
        resolve(stats);
      }
    });
  }

  /**
   * 💾 Crear backup completo
   */
  async createFullBackup(description = 'Backup automático') {
    try {
      this.writeLog(`Iniciando backup: ${description}`);

      // Conectar a BD si no está conectado
      if (!this.db) {
        await this.connect();
      }

      // Obtener estadísticas
      const stats = await this.getDatabaseStats();

      // Generar nombre del archivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `osyris_backup_${timestamp}.db`;
      const backupPath = path.join(BACKUP_DIR, backupFilename);

      // Crear backup usando VACUUM INTO (más rápido y confiable)
      await this.execSQLCommand(`VACUUM INTO '${backupPath}'`);

      // Verificar que el backup se creó correctamente
      if (!fs.existsSync(backupPath)) {
        throw new Error('El archivo de backup no se creó');
      }

      const backupStats = fs.statSync(backupPath);

      // Crear metadata del backup
      const metadata = {
        filename: backupFilename,
        path: backupPath,
        description: description,
        timestamp: new Date().toISOString(),
        originalSize: stats.fileSize,
        backupSize: backupStats.size,
        tables: stats.tables,
        compression: ((stats.fileSize - backupStats.size) / stats.fileSize * 100).toFixed(2) + '%',
        checksum: await this.calculateChecksum(backupPath)
      };

      // Guardar metadata
      const metadataPath = path.join(BACKUP_DIR, `${backupFilename}.meta.json`);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      this.writeLog(`Backup completado: ${backupFilename} (${(backupStats.size / 1024).toFixed(2)} KB)`);

      return metadata;
    } catch (error) {
      this.writeLog(`Error creando backup: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
   * 📦 Crear backup incremental (solo cambios)
   */
  async createIncrementalBackup() {
    try {
      // Para SQLite, implementaremos un backup incremental basado en timestamp
      this.writeLog('Iniciando backup incremental');

      const lastBackup = await this.getLastBackup();
      if (!lastBackup) {
        this.writeLog('No hay backup previo, creando backup completo');
        return await this.createFullBackup('Backup completo inicial');
      }

      // Verificar si hay cambios desde el último backup
      const dbStats = fs.statSync(DB_PATH);
      const lastBackupTime = new Date(lastBackup.timestamp);

      if (dbStats.mtime <= lastBackupTime) {
        this.writeLog('No hay cambios desde el último backup');
        return null;
      }

      // Si hay cambios, crear backup completo (SQLite no soporta incrementales nativos)
      return await this.createFullBackup('Backup incremental');
    } catch (error) {
      this.writeLog(`Error en backup incremental: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
   * 🔍 Obtener el último backup
   */
  async getLastBackup() {
    try {
      const backupFiles = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.meta.json'))
        .map(file => {
          try {
            const content = fs.readFileSync(path.join(BACKUP_DIR, file), 'utf8');
            return JSON.parse(content);
          } catch {
            return null;
          }
        })
        .filter(meta => meta !== null)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return backupFiles.length > 0 ? backupFiles[0] : null;
    } catch (error) {
      this.writeLog(`Error obteniendo último backup: ${error.message}`, 'ERROR');
      return null;
    }
  }

  /**
   * 📋 Listar todos los backups
   */
  async listBackups() {
    try {
      const backupFiles = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.meta.json'))
        .map(file => {
          try {
            const content = fs.readFileSync(path.join(BACKUP_DIR, file), 'utf8');
            const metadata = JSON.parse(content);

            // Verificar que el archivo de backup existe
            const backupExists = fs.existsSync(metadata.path);

            return {
              ...metadata,
              exists: backupExists,
              age: this.getFileAge(metadata.timestamp)
            };
          } catch {
            return null;
          }
        })
        .filter(meta => meta !== null)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return backupFiles;
    } catch (error) {
      this.writeLog(`Error listando backups: ${error.message}`, 'ERROR');
      return [];
    }
  }

  /**
   * 🔄 Restaurar desde backup
   */
  async restoreFromBackup(backupFilename, targetPath = null) {
    try {
      this.writeLog(`Iniciando restauración desde: ${backupFilename}`);

      const backupPath = path.join(BACKUP_DIR, backupFilename);
      const target = targetPath || DB_PATH;

      // Verificar que el backup existe
      if (!fs.existsSync(backupPath)) {
        throw new Error(`El archivo de backup no existe: ${backupPath}`);
      }

      // Verificar integridad del backup
      const isValid = await this.verifyBackupIntegrity(backupPath);
      if (!isValid) {
        throw new Error('El backup está corrupto o es inválido');
      }

      // Crear backup de seguridad de la BD actual si existe
      if (fs.existsSync(target)) {
        const safetyBackup = `${target}.pre-restore-${Date.now()}`;
        fs.copyFileSync(target, safetyBackup);
        this.writeLog(`Backup de seguridad creado: ${safetyBackup}`);
      }

      // Restaurar
      fs.copyFileSync(backupPath, target);

      // Verificar la restauración
      const restoredValid = await this.verifyBackupIntegrity(target);
      if (!restoredValid) {
        throw new Error('La restauración falló, base de datos corrupta');
      }

      this.writeLog(`Restauración completada exitosamente`);

      return {
        success: true,
        backupFile: backupFilename,
        targetPath: target,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.writeLog(`Error en restauración: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
   * ✅ Verificar integridad de backup
   */
  async verifyBackupIntegrity(filePath) {
    return new Promise((resolve) => {
      const testDb = new sqlite3.Database(filePath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          resolve(false);
          return;
        }

        // Ejecutar PRAGMA integrity_check
        testDb.get('PRAGMA integrity_check', (err, row) => {
          testDb.close();

          if (err) {
            resolve(false);
          } else {
            resolve(row.integrity_check === 'ok');
          }
        });
      });
    });
  }

  /**
   * 🧮 Calcular checksum de archivo
   */
  async calculateChecksum(filePath) {
    try {
      const { stdout } = await execAsync(`sha256sum "${filePath}"`);
      return stdout.split(' ')[0];
    } catch (error) {
      this.writeLog(`Error calculando checksum: ${error.message}`, 'WARN');
      return 'unavailable';
    }
  }

  /**
   * 🗑️ Limpiar backups antiguos
   */
  async cleanOldBackups(options = {}) {
    const {
      maxAge = 30, // días
      maxCount = 10,
      minFree = 100 * 1024 * 1024 // 100MB mínimo libre
    } = options;

    try {
      this.writeLog('Iniciando limpieza de backups antiguos');

      const backups = await this.listBackups();

      // Filtrar backups a eliminar por edad
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);

      let toDelete = backups.filter(backup => {
        return new Date(backup.timestamp) < cutoffDate;
      });

      // Si hay más backups que el máximo permitido, eliminar los más antiguos
      if (backups.length > maxCount) {
        const excess = backups.slice(maxCount);
        toDelete = [...toDelete, ...excess];
      }

      // Eliminar duplicados
      toDelete = toDelete.filter((backup, index, self) =>
        index === self.findIndex(b => b.filename === backup.filename)
      );

      // Eliminar archivos
      let deletedCount = 0;
      let freedSpace = 0;

      for (const backup of toDelete) {
        try {
          const backupSize = fs.statSync(backup.path).size;

          // Eliminar archivo de backup
          fs.unlinkSync(backup.path);

          // Eliminar metadata
          const metaPath = backup.path + '.meta.json';
          if (fs.existsSync(metaPath)) {
            fs.unlinkSync(metaPath);
          }

          deletedCount++;
          freedSpace += backupSize;

          this.writeLog(`Backup eliminado: ${backup.filename}`);
        } catch (error) {
          this.writeLog(`Error eliminando ${backup.filename}: ${error.message}`, 'WARN');
        }
      }

      this.writeLog(`Limpieza completada: ${deletedCount} backups eliminados, ${(freedSpace / 1024 / 1024).toFixed(2)} MB liberados`);

      return {
        deleted: deletedCount,
        freedSpace: freedSpace,
        remaining: backups.length - deletedCount
      };
    } catch (error) {
      this.writeLog(`Error en limpieza: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
   * ⏰ Configurar backup automático
   */
  scheduleAutomaticBackups(options = {}) {
    const {
      daily = true,
      weekly = true,
      monthly = true,
      cleanup = true
    } = options;

    try {
      // Backup diario a las 2:00 AM
      if (daily) {
        const dailyJob = cron.schedule('0 2 * * *', async () => {
          try {
            await this.createIncrementalBackup();
            this.writeLog('Backup diario automático completado');
          } catch (error) {
            this.writeLog(`Error en backup diario: ${error.message}`, 'ERROR');
          }
        }, { scheduled: false });

        this.scheduledJobs.push({ name: 'daily', job: dailyJob });
      }

      // Backup semanal los domingos a las 3:00 AM
      if (weekly) {
        const weeklyJob = cron.schedule('0 3 * * 0', async () => {
          try {
            await this.createFullBackup('Backup semanal automático');
            this.writeLog('Backup semanal automático completado');
          } catch (error) {
            this.writeLog(`Error en backup semanal: ${error.message}`, 'ERROR');
          }
        }, { scheduled: false });

        this.scheduledJobs.push({ name: 'weekly', job: weeklyJob });
      }

      // Backup mensual el primer día del mes a las 4:00 AM
      if (monthly) {
        const monthlyJob = cron.schedule('0 4 1 * *', async () => {
          try {
            await this.createFullBackup('Backup mensual automático');
            this.writeLog('Backup mensual automático completado');
          } catch (error) {
            this.writeLog(`Error en backup mensual: ${error.message}`, 'ERROR');
          }
        }, { scheduled: false });

        this.scheduledJobs.push({ name: 'monthly', job: monthlyJob });
      }

      // Limpieza semanal los miércoles a las 1:00 AM
      if (cleanup) {
        const cleanupJob = cron.schedule('0 1 * * 3', async () => {
          try {
            await this.cleanOldBackups();
            this.writeLog('Limpieza automática completada');
          } catch (error) {
            this.writeLog(`Error en limpieza automática: ${error.message}`, 'ERROR');
          }
        }, { scheduled: false });

        this.scheduledJobs.push({ name: 'cleanup', job: cleanupJob });
      }

      this.writeLog(`Programados ${this.scheduledJobs.length} trabajos automáticos`);
    } catch (error) {
      this.writeLog(`Error programando backups: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
   * ▶️ Iniciar sistema de backup automático
   */
  start() {
    if (this.isRunning) {
      this.writeLog('El sistema de backup ya está ejecutándose', 'WARN');
      return;
    }

    this.scheduledJobs.forEach(scheduledJob => {
      scheduledJob.job.start();
    });

    this.isRunning = true;
    this.writeLog('Sistema de backup automático iniciado');
  }

  /**
   * ⏹️ Detener sistema de backup automático
   */
  stop() {
    if (!this.isRunning) {
      this.writeLog('El sistema de backup no está ejecutándose', 'WARN');
      return;
    }

    this.scheduledJobs.forEach(scheduledJob => {
      scheduledJob.job.stop();
    });

    this.isRunning = false;
    this.writeLog('Sistema de backup automático detenido');
  }

  /**
   * 📊 Obtener estado del sistema
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduledJobs: this.scheduledJobs.map(job => ({
        name: job.name,
        running: job.job.running
      })),
      backupDirectory: BACKUP_DIR,
      databasePath: DB_PATH,
      logFile: LOG_FILE
    };
  }

  /**
   * 🔧 Utilidades
   */
  execSQLCommand(sql) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  getFileAge(timestamp) {
    const now = new Date();
    const fileDate = new Date(timestamp);
    const diffTime = Math.abs(now - fileDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 día';
    if (diffDays < 7) return `${diffDays} días`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas`;
    return `${Math.floor(diffDays / 30)} meses`;
  }

  /**
   * 🔐 Cerrar conexiones
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    this.stop();
  }
}

// Instancia singleton
let backupInstance = null;

/**
 * 🏭 Factory para obtener instancia del sistema de backup
 */
function getBackupSystem() {
  if (!backupInstance) {
    backupInstance = new BackupSystem();
  }
  return backupInstance;
}

module.exports = {
  BackupSystem,
  getBackupSystem
};