# 🗃️ Schema Migration Specialist Agent

## Purpose
Specialized agent for managing database schema migrations between SQLite (development) and PostgreSQL (Supabase production), ensuring schema compatibility and seamless evolution across environments.

## Capabilities

### 🔄 Schema Conversion
- **SQLite → PostgreSQL**: Convert data types, constraints, and indexes
- **Cross-Database Compatibility**: Handle database-specific features
- **Constraint Migration**: Translate CHECK, UNIQUE, and FK constraints
- **Index Optimization**: Optimize indexes for PostgreSQL performance

### 📝 Migration Generation
- **Automatic Detection**: Identify schema differences
- **Migration Scripts**: Generate SQL migration scripts
- **Rollback Scripts**: Create safe rollback procedures
- **Version Control**: Track schema versions and changes

### ✅ Schema Validation
- **Compatibility Checks**: Ensure schema compatibility across environments
- **Data Type Validation**: Verify data type conversions
- **Constraint Verification**: Validate all database constraints
- **Performance Analysis**: Analyze schema performance implications

### 🔧 Evolution Management
- **Incremental Changes**: Apply schema changes safely
- **Zero-Downtime Migrations**: Deploy without service interruption
- **Conflict Resolution**: Handle concurrent schema modifications
- **Backup & Recovery**: Safeguard against migration failures

## Key Functions

### Schema Analysis
```javascript
analyzeSQLiteSchema()
analyzePostgreSQLSchema()
compareSchemas()
generateSchemaDiff()
validateSchemaCompatibility()
```

### Migration Generation
```javascript
generateMigrationScript()
createRollbackScript()
optimizeMigrationPerformance()
validateMigrationScript()
estimateMigrationTime()
```

### Schema Application
```javascript
applyMigration()
rollbackMigration()
verifyMigrationSuccess()
updateSchemaVersion()
cleanupMigrationArtifacts()
```

### Validation & Testing
```javascript
testMigrationOnCopy()
validateDataIntegrity()
benchmarkPerformance()
generateMigrationReport()
```

## Database Schema Mapping

### 🏗️ Core Tables Structure

#### Users Table (usuarios)
```sql
-- SQLite (Development)
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  fecha_nacimiento DATE,
  telefono TEXT,
  direccion TEXT,
  foto_perfil TEXT,
  rol TEXT CHECK(rol IN ('admin', 'coordinador', 'scouter', 'padre', 'educando')) NOT NULL,
  seccion_id INTEGER,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso DATETIME,
  activo BOOLEAN DEFAULT 1,
  FOREIGN KEY (seccion_id) REFERENCES secciones(id)
);

-- PostgreSQL (Production)
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  fecha_nacimiento DATE,
  telefono VARCHAR(20),
  direccion TEXT,
  foto_perfil TEXT,
  rol VARCHAR(20) CHECK(rol IN ('admin', 'coordinador', 'scouter', 'padre', 'educando')) NOT NULL,
  seccion_id INTEGER REFERENCES secciones(id),
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acceso TIMESTAMPTZ,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Sections Table (secciones)
```sql
-- SQLite (Development)
CREATE TABLE secciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  edad_minima INTEGER,
  edad_maxima INTEGER,
  color_primario TEXT,
  color_secundario TEXT,
  activa BOOLEAN DEFAULT 1
);

-- PostgreSQL (Production)
CREATE TABLE secciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  edad_minima INTEGER,
  edad_maxima INTEGER,
  color_primario VARCHAR(7), -- Hex color codes
  color_secundario VARCHAR(7),
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 📊 Data Type Conversions

#### SQLite → PostgreSQL Mapping
```javascript
const dataTypeMapping = {
  'INTEGER': 'INTEGER',
  'INTEGER PRIMARY KEY AUTOINCREMENT': 'SERIAL PRIMARY KEY',
  'TEXT': 'TEXT',
  'VARCHAR(n)': 'VARCHAR(n)',
  'BOOLEAN': 'BOOLEAN',
  'DATE': 'DATE',
  'DATETIME': 'TIMESTAMPTZ',
  'CURRENT_TIMESTAMP': 'NOW()',
  'REAL': 'DECIMAL',
  'BLOB': 'BYTEA'
}
```

#### Constraint Conversions
```javascript
const constraintMapping = {
  'CHECK(column IN (...))': 'CHECK(column IN (...)) -- Same syntax',
  'FOREIGN KEY': 'REFERENCES', // Simplified syntax in PostgreSQL
  'UNIQUE': 'UNIQUE', // Same syntax
  'NOT NULL': 'NOT NULL', // Same syntax
  'DEFAULT value': 'DEFAULT value' // Same syntax
}
```

## Migration Strategies

### 🚀 Initial Schema Creation
```javascript
const createInitialSchema = async () => {
  // 1. Analyze existing SQLite schema
  const sqliteSchema = await analyzeSQLiteSchema()

  // 2. Generate PostgreSQL equivalent
  const postgresSchema = await convertSchemaToPostgreSQL(sqliteSchema)

  // 3. Create tables in correct order (respecting dependencies)
  const creationOrder = await determineDependencyOrder(postgresSchema)

  // 4. Execute schema creation
  for (const table of creationOrder) {
    await executeSchemaCreation(table)
  }

  // 5. Create indexes and constraints
  await createIndexes(postgresSchema)
  await createConstraints(postgresSchema)
}
```

### 🔄 Incremental Schema Updates
```javascript
const applySchemaUpdate = async (migrationScript) => {
  // 1. Backup current schema
  await backupCurrentSchema()

  // 2. Test migration on copy
  const testResult = await testMigrationOnCopy(migrationScript)
  if (!testResult.success) {
    throw new Error(`Migration test failed: ${testResult.error}`)
  }

  // 3. Apply migration
  await beginTransaction()
  try {
    await executeMigrationScript(migrationScript)
    await updateSchemaVersion()
    await commitTransaction()
  } catch (error) {
    await rollbackTransaction()
    throw error
  }

  // 4. Validate migration success
  await validateMigrationSuccess()
}
```

### ⚡ Zero-Downtime Migrations
```javascript
const zeroDowntimeMigration = async (migrationPlan) => {
  // 1. Create new version of tables
  await createNewVersionTables()

  // 2. Set up dual-write system
  await enableDualWriteMode()

  // 3. Migrate existing data
  await migrateExistingData()

  // 4. Switch reads to new tables
  await switchReadsToNewTables()

  // 5. Remove old tables
  await removeOldTables()
  await disableDualWriteMode()
}
```

## Migration File Management

### 📁 Migration File Structure
```
migrations/
├── 001_initial_schema.sql
├── 002_add_user_sections.sql
├── 003_add_activities_table.sql
├── rollbacks/
│   ├── 001_initial_schema_rollback.sql
│   ├── 002_add_user_sections_rollback.sql
│   └── 003_add_activities_table_rollback.sql
└── seeds/
    ├── development/
    │   ├── sections_seed.sql
    │   └── test_users_seed.sql
    └── production/
        └── essential_data_seed.sql
```

### 📝 Migration Script Template
```sql
-- Migration: {migration_name}
-- Version: {version_number}
-- Date: {creation_date}
-- Description: {migration_description}

-- Pre-migration checks
DO $$
BEGIN
    -- Check if migration already applied
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '{version}') THEN
        RAISE EXCEPTION 'Migration % already applied', '{version}';
    END IF;
END $$;

-- Migration steps
BEGIN;

-- 1. Schema changes
{schema_changes}

-- 2. Data transformations
{data_transformations}

-- 3. Index creation
{index_creation}

-- 4. Update schema version
INSERT INTO schema_migrations (version, name, applied_at)
VALUES ('{version}', '{migration_name}', NOW());

COMMIT;
```

## Validation & Testing

### 🧪 Migration Testing
```javascript
const testMigration = async (migrationScript) => {
  // 1. Create test database copy
  const testDb = await createTestDatabaseCopy()

  try {
    // 2. Apply migration to test copy
    await applyMigrationToTestDb(testDb, migrationScript)

    // 3. Run validation tests
    const validationResults = await runValidationTests(testDb)

    // 4. Performance benchmarks
    const performanceResults = await runPerformanceBenchmarks(testDb)

    return {
      success: true,
      validation: validationResults,
      performance: performanceResults
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  } finally {
    // 5. Cleanup test database
    await cleanupTestDatabase(testDb)
  }
}
```

### ✅ Data Integrity Checks
```javascript
const validateDataIntegrity = async () => {
  const checks = [
    // Foreign key integrity
    async () => await checkForeignKeyConstraints(),

    // Data consistency
    async () => await validateDataConsistency(),

    // Business rule validation
    async () => await validateBusinessRules(),

    // Performance checks
    async () => await analyzeQueryPerformance()
  ]

  const results = await Promise.all(checks.map(check => check()))
  return results.every(result => result.passed)
}
```

## Error Handling & Recovery

### 🚨 Migration Failure Recovery
```javascript
const handleMigrationFailure = async (error, migrationVersion) => {
  console.error(`Migration ${migrationVersion} failed:`, error)

  // 1. Immediate rollback
  try {
    await rollbackMigration(migrationVersion)
    console.log('✅ Rollback successful')
  } catch (rollbackError) {
    console.error('❌ Rollback failed:', rollbackError)

    // 2. Emergency recovery from backup
    await emergencyRecoveryFromBackup()
  }

  // 3. Notify administrators
  await notifyAdministrators({
    type: 'migration_failure',
    migration: migrationVersion,
    error: error.message,
    recovery_action: 'rollback_completed'
  })

  // 4. Generate incident report
  await generateIncidentReport(error, migrationVersion)
}
```

### 🔄 Automatic Recovery
```javascript
const setupAutomaticRecovery = () => {
  // Monitor migration health
  setInterval(async () => {
    const healthCheck = await checkMigrationHealth()

    if (!healthCheck.healthy) {
      await initiateAutomaticRecovery(healthCheck.issues)
    }
  }, 60000) // Check every minute during migrations
}
```

## Performance Optimization

### ⚡ Migration Performance
```javascript
const optimizeMigrationPerformance = async (migrationScript) => {
  // 1. Analyze migration complexity
  const complexity = await analyzeMigrationComplexity(migrationScript)

  // 2. Optimize based on complexity
  if (complexity.level === 'high') {
    // Use batch processing for large data sets
    await enableBatchProcessing()
    await optimizeMemoryUsage()
  }

  // 3. Parallel processing for independent operations
  const parallelOperations = await identifyParallelOperations(migrationScript)
  if (parallelOperations.length > 0) {
    await enableParallelExecution(parallelOperations)
  }

  // 4. Index management
  await dropNonEssentialIndexes()
  await scheduleIndexRecreation()
}
```

This specialist ensures smooth, safe, and efficient schema migrations while maintaining data integrity and system performance across all environments.