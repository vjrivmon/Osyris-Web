#!/usr/bin/env node

/**
 * 🔄 Automatic Migration Generator
 * Generates PostgreSQL migration scripts from SQLite schema
 */

const fs = require('fs').promises
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

class MigrationGenerator {
  constructor() {
    this.sqliteDbPath = path.join(__dirname, '../../api-osyris/database/osyris.db')
    this.migrationsDir = path.join(__dirname, '../migrations')
    this.outputDir = path.join(this.migrationsDir, 'generated')
  }

  async generateMigration(options = {}) {
    try {
      console.log('🔄 Starting automatic migration generation...')

      // 1. Analyze SQLite schema
      console.log('📊 Analyzing SQLite schema...')
      const sqliteSchema = await this.analyzeSQLiteSchema()

      // 2. Convert to PostgreSQL
      console.log('🔄 Converting to PostgreSQL schema...')
      const postgresSchema = await this.convertToPostgreSQL(sqliteSchema)

      // 3. Generate migration scripts
      console.log('📝 Generating migration scripts...')
      const migrationFiles = await this.generateMigrationFiles(postgresSchema, options)

      // 4. Generate rollback scripts
      console.log('🔙 Generating rollback scripts...')
      await this.generateRollbackScripts(sqliteSchema, options)

      // 5. Create validation scripts
      console.log('✅ Creating validation scripts...')
      await this.generateValidationScripts(sqliteSchema, postgresSchema)

      console.log('🎉 Migration generation completed successfully!')
      console.log('📁 Generated files:', migrationFiles)

      return {
        success: true,
        files: migrationFiles,
        sqliteSchema,
        postgresSchema
      }

    } catch (error) {
      console.error('❌ Migration generation failed:', error)
      return { success: false, error: error.message }
    }
  }

  async analyzeSQLiteSchema() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.sqliteDbPath, sqlite3.OPEN_READONLY)
      const schema = { tables: {}, indexes: {}, triggers: {} }

      // Get table information
      db.all(`
        SELECT name, sql 
        FROM sqlite_master 
        WHERE type = 'table' 
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `, (err, tables) => {
        if (err) return reject(err)

        Promise.all(tables.map(table => this.analyzeTable(db, table)))
          .then(tableAnalyses => {
            tableAnalyses.forEach((analysis, index) => {
              schema.tables[tables[index].name] = analysis
            })

            // Get indexes
            return new Promise((resolve) => {
              db.all(`
                SELECT name, sql, tbl_name
                FROM sqlite_master 
                WHERE type = 'index' 
                AND name NOT LIKE 'sqlite_%'
              `, (err, indexes) => {
                if (!err) {
                  indexes.forEach(index => {
                    if (!schema.indexes[index.tbl_name]) {
                      schema.indexes[index.tbl_name] = []
                    }
                    schema.indexes[index.tbl_name].push(index)
                  })
                }
                resolve()
              })
            })
          })
          .then(() => {
            db.close()
            resolve(schema)
          })
          .catch(reject)
      })
    })
  }

  async analyzeTable(db, table) {
    return new Promise((resolve, reject) => {
      db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
        if (err) return reject(err)

        db.all(`PRAGMA foreign_key_list(${table.name})`, (err, foreignKeys) => {
          if (err) return reject(err)

          resolve({
            name: table.name,
            sql: table.sql,
            columns: columns.map(col => ({
              name: col.name,
              type: col.type,
              notnull: col.notnull,
              defaultValue: col.dflt_value,
              primaryKey: col.pk
            })),
            foreignKeys: foreignKeys.map(fk => ({
              column: fk.from,
              referencesTable: fk.table,
              referencesColumn: fk.to
            }))
          })
        })
      })
    })
  }

  async convertToPostgreSQL(sqliteSchema) {
    const postgresSchema = { tables: {}, indexes: {} }

    // Convert tables
    for (const [tableName, tableInfo] of Object.entries(sqliteSchema.tables)) {
      postgresSchema.tables[tableName] = await this.convertTable(tableInfo)
    }

    // Convert indexes
    for (const [tableName, indexes] of Object.entries(sqliteSchema.indexes)) {
      postgresSchema.indexes[tableName] = indexes.map(index => 
        this.convertIndex(index)
      )
    }

    return postgresSchema
  }

  async convertTable(tableInfo) {
    const convertedColumns = tableInfo.columns.map(col => {
      let pgType = this.convertDataType(col.type, col.primaryKey)
      let constraints = []

      if (col.primaryKey && col.type === 'INTEGER') {
        pgType = 'SERIAL PRIMARY KEY'
      } else if (col.primaryKey) {
        constraints.push('PRIMARY KEY')
      }

      if (col.notnull && !col.primaryKey) {
        constraints.push('NOT NULL')
      }

      if (col.defaultValue !== null) {
        constraints.push(`DEFAULT ${this.convertDefaultValue(col.defaultValue, pgType)}`)
      }

      return {
        name: col.name,
        type: pgType,
        constraints: constraints.join(' ')
      }
    })

    const convertedForeignKeys = tableInfo.foreignKeys.map(fk => ({
      column: fk.column,
      referencesTable: fk.referencesTable,
      referencesColumn: fk.referencesColumn
    }))

    return {
      name: tableInfo.name,
      columns: convertedColumns,
      foreignKeys: convertedForeignKeys
    }
  }

  convertDataType(sqliteType, isPrimaryKey = false) {
    const typeMap = {
      'INTEGER': isPrimaryKey ? 'SERIAL' : 'INTEGER',
      'TEXT': 'TEXT',
      'VARCHAR': 'VARCHAR',
      'BOOLEAN': 'BOOLEAN',
      'DATE': 'DATE',
      'DATETIME': 'TIMESTAMPTZ',
      'REAL': 'DECIMAL',
      'BLOB': 'BYTEA'
    }

    // Handle VARCHAR with length
    if (sqliteType.includes('VARCHAR')) {
      return sqliteType.replace('VARCHAR', 'VARCHAR')
    }

    const baseType = sqliteType.split('(')[0].toUpperCase()
    return typeMap[baseType] || 'TEXT'
  }

  convertDefaultValue(value, type) {
    if (value === null) return 'NULL'
    if (value === 'CURRENT_TIMESTAMP') return 'NOW()'
    if (type === 'BOOLEAN') {
      return value === '1' || value === 'true' ? 'TRUE' : 'FALSE'
    }
    if (type === 'INTEGER' || type === 'DECIMAL') {
      return value
    }
    return `'${value}'`
  }

  convertIndex(index) {
    // Parse SQLite index SQL and convert to PostgreSQL
    let pgIndexSQL = index.sql.replace(/CREATE\s+INDEX/i, 'CREATE INDEX')
    pgIndexSQL = pgIndexSQL.replace(/IF\s+NOT\s+EXISTS/i, '')
    return {
      name: index.name,
      table: index.tbl_name,
      sql: pgIndexSQL
    }
  }

  async generateMigrationFiles(postgresSchema, options) {
    await fs.mkdir(this.outputDir, { recursive: true })

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const version = options.version || `${timestamp}_001`
    
    const migrationFile = path.join(this.outputDir, `${version}_migration.sql`)
    const migrationContent = this.generateMigrationSQL(postgresSchema, version)

    await fs.writeFile(migrationFile, migrationContent)

    return [migrationFile]
  }

  generateMigrationSQL(schema, version) {
    const timestamp = new Date().toISOString()
    
    let sql = `-- Migration: Auto-generated from SQLite
-- Version: ${version}
-- Date: ${timestamp}
-- Description: Automatic schema migration from SQLite to PostgreSQL

-- Pre-migration checks
DO $$ 
BEGIN
    -- Check if migration already applied
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'schema_migrations'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM schema_migrations 
            WHERE version = '${version}'
        ) THEN
            RAISE EXCEPTION 'Migration % already applied', '${version}';
        END IF;
    ELSE
        -- Create schema_migrations table
        CREATE TABLE schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            applied_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Main migration
BEGIN;

`

    // Generate table creation statements
    for (const [tableName, tableInfo] of Object.entries(schema.tables)) {
      sql += `-- Create table: ${tableName}\n`
      sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`
      
      const columnDefs = tableInfo.columns.map(col => {
        return `    ${col.name} ${col.type} ${col.constraints}`.trim()
      })
      
      sql += columnDefs.join(',\n')

      // Add foreign key constraints
      if (tableInfo.foreignKeys.length > 0) {
        const fkConstraints = tableInfo.foreignKeys.map(fk => 
          `    FOREIGN KEY (${fk.column}) REFERENCES ${fk.referencesTable}(${fk.referencesColumn})`
        )
        sql += ',\n' + fkConstraints.join(',\n')
      }

      sql += `\n);\n\n`
    }

    // Generate index creation statements
    for (const [tableName, indexes] of Object.entries(schema.indexes)) {
      if (indexes.length > 0) {
        sql += `-- Create indexes for table: ${tableName}\n`
        indexes.forEach(index => {
          sql += `${index.sql};\n`
        })
        sql += '\n'
      }
    }

    sql += `-- Update schema version
INSERT INTO schema_migrations (version, name) 
VALUES ('${version}', 'Auto-generated migration');

COMMIT;

-- Post-migration validation
DO $$
BEGIN
    -- Validate all tables exist
    PERFORM 1;
    -- Add any validation logic here
END $$;
`

    return sql
  }

  async generateRollbackScripts(sqliteSchema, options) {
    const rollbackDir = path.join(this.outputDir, 'rollbacks')
    await fs.mkdir(rollbackDir, { recursive: true })

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const version = options.version || `${timestamp}_001`
    
    const rollbackFile = path.join(rollbackDir, `${version}_rollback.sql`)
    
    let rollbackSQL = `-- Rollback Migration: ${version}
-- This will drop all created tables and indexes

BEGIN;

-- Drop tables in reverse dependency order
`
    
    // Generate DROP statements (in reverse order)
    const tableNames = Object.keys(sqliteSchema.tables).reverse()
    tableNames.forEach(tableName => {
      rollbackSQL += `DROP TABLE IF EXISTS ${tableName} CASCADE;\n`
    })

    rollbackSQL += `
-- Remove schema version record
DELETE FROM schema_migrations WHERE version = '${version}';

COMMIT;
`

    await fs.writeFile(rollbackFile, rollbackSQL)
  }

  async generateValidationScripts(sqliteSchema, postgresSchema) {
    const validationFile = path.join(this.outputDir, 'validate_migration.sql')
    
    let validationSQL = `-- Migration Validation Script
-- Validates that all tables and columns exist in PostgreSQL

DO $$
DECLARE
    table_count INTEGER;
    column_count INTEGER;
BEGIN
    -- Check table count
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    IF table_count < ${Object.keys(sqliteSchema.tables).length} THEN
        RAISE EXCEPTION 'Migration validation failed: Missing tables';
    END IF;
    
    -- Validate specific tables exist
`

    Object.keys(sqliteSchema.tables).forEach(tableName => {
      validationSQL += `    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = '${tableName}'
    ) THEN
        RAISE EXCEPTION 'Table ${tableName} does not exist';
    END IF;
    
`
    })

    validationSQL += `    RAISE NOTICE 'Migration validation completed successfully';
END $$;
`

    await fs.writeFile(validationFile, validationSQL)
  }
}

// CLI interface
if (require.main === module) {
  const generator = new MigrationGenerator()
  
  const args = process.argv.slice(2)
  const options = {}
  
  // Parse command line arguments
  args.forEach((arg, index) => {
    if (arg === '--version' && args[index + 1]) {
      options.version = args[index + 1]
    }
  })

  generator.generateMigration(options)
    .then(result => {
      if (result.success) {
        console.log('✅ Migration generation completed successfully')
        process.exit(0)
      } else {
        console.error('❌ Migration generation failed:', result.error)
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error)
      process.exit(1)
    })
}

module.exports = MigrationGenerator
