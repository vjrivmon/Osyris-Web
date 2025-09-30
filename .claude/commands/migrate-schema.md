# 🗄️ Schema Migration Command

## Command: `/migrate-schema`

### Purpose
Migrate database schema changes between environments or apply new schema versions.

### Description
This command handles database schema migrations with support for both SQLite (development) and PostgreSQL (production). It can migrate schema changes, validate compatibility, and ensure data integrity throughout the process.

### What it does:

1. **🔍 Schema Analysis**
   - Compares current schema with target schema
   - Identifies structural changes needed
   - Validates migration safety

2. **📝 Migration Generation**
   - Creates migration scripts automatically
   - Generates rollback procedures
   - Optimizes migration performance

3. **✅ Pre-Migration Validation**
   - Backs up current database
   - Tests migration on copy
   - Validates data integrity

4. **🚀 Migration Execution**
   - Applies schema changes
   - Migrates data if needed
   - Updates schema version

5. **🔄 Post-Migration Verification**
   - Validates migration success
   - Tests application functionality
   - Generates migration report

### Usage
```
/migrate-schema
/migrate-schema --to-version 1.2.0
/migrate-schema --rollback
/migrate-schema --dry-run
```

### Options
- `--to-version`: Target schema version
- `--rollback`: Rollback to previous version
- `--dry-run`: Simulate migration without applying changes
- `--force`: Force migration even with warnings

### Example Output
```
🗄️ Migrating Database Schema...

🔍 Analyzing schema changes
   Current version: 1.1.0
   Target version:  1.2.0
   Changes found:   3 table modifications, 2 new indexes

📝 Generating migration scripts
   ✅ Migration script created
   ✅ Rollback script prepared

✅ Pre-migration validation
   ✅ Database backup created
   ✅ Migration tested on copy
   ✅ Data integrity verified

🚀 Executing migration
   ✅ Schema changes applied
   ✅ Data migrated successfully
   ✅ Schema version updated

🔄 Post-migration verification
   ✅ Migration validated
   ✅ Application tests passed
   ✅ Performance benchmarked

🎉 Schema migration completed successfully!
   Duration: 2m 15s
   Records affected: 1,847
   New schema version: 1.2.0
```
