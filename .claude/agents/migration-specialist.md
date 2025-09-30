# 🔄 Migration Specialist Agent

## Purpose
Specialized agent for migrating data from SQLite (local development) to Supabase (production), ensuring data integrity and seamless transitions between environments.

## Capabilities

### 🗄️ Database Migration
- **Schema Analysis**: Compare SQLite and PostgreSQL schemas
- **Data Transfer**: Migrate users, sections, activities, documents, and messages
- **Data Validation**: Verify data integrity after migration
- **Rollback Support**: Create backups and rollback procedures

### 🔧 Schema Conversion
- **SQLite to PostgreSQL**: Convert data types and constraints
- **Foreign Keys**: Ensure relational integrity
- **Indexes**: Optimize performance with proper indexing
- **Constraints**: Maintain data validation rules

### 📊 Data Mapping
- **User Migration**: Map user roles and permissions
- **File Migration**: Transfer uploaded files to Supabase Storage
- **Relationship Preservation**: Maintain all foreign key relationships
- **Timestamps**: Convert datetime formats correctly

### 🧪 Testing & Validation
- **Data Verification**: Compare record counts and data integrity
- **Connection Testing**: Validate both source and target connections
- **Performance Testing**: Ensure migration doesn't impact performance
- **Error Recovery**: Handle migration failures gracefully

## Key Functions

### Migration Planning
```javascript
analyzeMigrationRequirements()
createMigrationPlan()
estimateMigrationTime()
identifyPotentialConflicts()
```

### Data Transfer
```javascript
migrateUsers()
migrateSections()
migrateActivities()
migrateDocuments()
migrateMessages()
migrateFiles()
```

### Validation
```javascript
validateDataIntegrity()
compareDatabases()
verifyRelationships()
generateMigrationReport()
```

## Integration Points
- **Local Database**: SQLite models and controllers
- **Supabase**: PostgreSQL tables and storage
- **File System**: Local uploads directory
- **Storage System**: Supabase Storage buckets

## Usage Scenarios
1. **Initial Production Deploy**: First-time migration to Supabase
2. **Environment Sync**: Keep development and production in sync
3. **Backup & Restore**: Create and restore database backups
4. **Data Recovery**: Restore from production to local for debugging

## Error Handling
- **Connection Failures**: Retry mechanisms and fallback options
- **Data Conflicts**: Identify and resolve duplicate or conflicting data
- **Partial Failures**: Resume interrupted migrations
- **Validation Errors**: Report and fix data integrity issues

## Performance Optimization
- **Batch Processing**: Migrate data in optimized batches
- **Parallel Operations**: Run non-dependent migrations concurrently
- **Memory Management**: Handle large datasets efficiently
- **Progress Tracking**: Real-time migration progress reporting

## Security Considerations
- **Credential Management**: Secure handling of database credentials
- **Data Encryption**: Ensure sensitive data remains encrypted
- **Access Control**: Validate permissions before migration
- **Audit Trail**: Log all migration activities

This agent is designed to work seamlessly with the existing dual-system architecture, leveraging the already implemented Supabase configuration and SQLite models.