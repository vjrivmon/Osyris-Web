# 🔄 Database Sync Specialist Agent

## Purpose
Specialized agent for maintaining synchronization between local SQLite and production Supabase databases, ensuring consistent data across development and production environments.

## Capabilities

### 🔄 Bidirectional Synchronization
- **Local to Production**: Push development changes to production
- **Production to Local**: Pull production data for local development
- **Selective Sync**: Sync specific tables or records
- **Conflict Resolution**: Handle data conflicts intelligently

### 📊 Schema Management
- **Schema Comparison**: Detect differences between environments
- **Schema Evolution**: Apply schema changes consistently
- **Migration Generation**: Create migration scripts automatically
- **Version Control**: Track schema versions across environments

### 🎯 Data Consistency
- **Integrity Checks**: Validate data consistency across environments
- **Relationship Verification**: Ensure foreign key relationships are intact
- **Data Validation**: Check data against business rules
- **Orphan Detection**: Identify and handle orphaned records

### ⚡ Performance Optimization
- **Incremental Sync**: Only sync changed data
- **Batch Operations**: Optimize large data transfers
- **Parallel Processing**: Sync multiple tables simultaneously
- **Caching Strategy**: Cache frequently accessed data

## Key Functions

### Synchronization Operations
```javascript
syncFromLocalToProduction()
syncFromProductionToLocal()
syncSpecificTable(tableName)
syncSpecificRecord(table, id)
bidirectionalSync()
```

### Schema Operations
```javascript
compareSchemas()
generateMigration()
applySchemaChanges()
rollbackSchemaChanges()
validateSchemaCompatibility()
```

### Conflict Resolution
```javascript
detectConflicts()
resolveConflictsByTimestamp()
resolveConflictsByPriority()
manualConflictResolution()
createConflictReport()
```

### Data Validation
```javascript
validateDataIntegrity()
checkForeignKeyConstraints()
verifyBusinessRules()
detectDuplicates()
cleanupOrphanedRecords()
```

## Synchronization Strategies

### 🚀 Full Synchronization
- **Use Case**: Initial setup or major data refresh
- **Process**: Complete data replacement
- **Validation**: Full integrity checks
- **Recovery**: Complete backup before sync

### 🎯 Incremental Synchronization
- **Use Case**: Regular development workflow
- **Process**: Sync only changed records since last sync
- **Tracking**: Timestamp-based change detection
- **Efficiency**: Minimal data transfer

### ⚡ Real-time Synchronization
- **Use Case**: Critical data changes
- **Process**: Immediate sync upon data modification
- **Triggers**: Database triggers or application hooks
- **Monitoring**: Real-time sync status

### 🔄 Selective Synchronization
- **Use Case**: Specific feature development
- **Process**: Sync only relevant tables/records
- **Configuration**: Rule-based sync filters
- **Testing**: Isolated environment testing

## Data Flow Management

### Local Development → Production
```javascript
// Development workflow
1. detectLocalChanges()
2. validateChanges()
3. createChangeSet()
4. applyToProduction()
5. verifySync()
```

### Production → Local Development
```javascript
// Bug reproduction workflow
1. identifyProductionData()
2. anonymizeData() // Privacy protection
3. transferToLocal()
4. validateIntegrity()
5. updateLocalReferences()
```

## Conflict Resolution Strategies

### 🕒 Timestamp-Based Resolution
- **Last Write Wins**: Most recent change takes precedence
- **First Write Wins**: Original change maintained
- **Custom Logic**: Business-rule-based resolution

### 👑 Priority-Based Resolution
- **Environment Priority**: Production always wins
- **User Priority**: Admin changes override regular users
- **Data Type Priority**: Critical data takes precedence

### 🤝 Manual Resolution
- **Conflict Detection**: Automatic identification
- **Human Review**: Present conflicts for manual resolution
- **Resolution Tracking**: Log all manual interventions

## Table-Specific Sync Rules

### 👥 Users Table
- **Sync Direction**: Bidirectional with production priority
- **Sensitive Data**: Hash/encrypt personal information
- **Conflict Resolution**: Manual review for role changes

### 🏕️ Sections Table
- **Sync Direction**: Production to Local (read-only in development)
- **Master Data**: Maintained in production only
- **Updates**: Require admin approval

### 📅 Activities Table
- **Sync Direction**: Bidirectional with timestamp resolution
- **Conflict Resolution**: Merge non-conflicting fields
- **History**: Preserve activity history

### 📄 Documents Table
- **Sync Direction**: Production to Local
- **File Handling**: Coordinate with Upload System Specialist
- **Permissions**: Respect access controls

### 💬 Messages Table
- **Sync Direction**: Production to Local (archive)
- **Privacy**: Anonymize personal messages
- **Retention**: Apply retention policies

## Integration Points

### Database Connections
```javascript
// SQLite Connection
const localDb = require('../config/db.config')

// Supabase Connection
const { supabase } = require('../config/supabase.config')

// Connection Management
const connectionPool = new DatabaseConnectionPool()
```

### External Systems
- **Migration Specialist**: Coordinate complex migrations
- **Upload System Specialist**: Sync file references
- **Deployment Orchestrator**: Provide sync status

## Monitoring & Reporting

### 📊 Sync Metrics
- **Sync Frequency**: Track sync operations over time
- **Data Volume**: Monitor amount of data synchronized
- **Sync Duration**: Track performance metrics
- **Error Rates**: Monitor and alert on sync failures

### 📈 Health Monitoring
- **Connection Health**: Monitor database connections
- **Data Drift**: Detect unexpected data differences
- **Performance Impact**: Monitor sync impact on operations
- **Resource Usage**: Track CPU/memory during sync

### 📋 Reporting
```javascript
generateSyncReport()
createDataDriftReport()
exportSyncMetrics()
generateConflictSummary()
createPerformanceReport()
```

## Error Handling & Recovery

### Common Sync Issues
- **Network Connectivity**: Handle intermittent connections
- **Database Locks**: Manage concurrent access
- **Data Corruption**: Detect and recover from corruption
- **Schema Mismatches**: Handle version differences

### Recovery Procedures
```javascript
recoverFromFailedSync()
rollbackPartialSync()
recreateCorruptedData()
resyncFromBackup()
validateRecovery()
```

## Security & Privacy

### 🔒 Data Security
- **Encryption**: Encrypt sensitive data during sync
- **Access Control**: Validate sync permissions
- **Audit Trail**: Log all sync operations
- **Credential Management**: Secure database credentials

### 🛡️ Privacy Protection
- **Data Anonymization**: Anonymize personal data for development
- **GDPR Compliance**: Respect data protection regulations
- **Consent Management**: Track and respect user consent
- **Data Minimization**: Sync only necessary data

This specialist ensures that developers can work confidently with realistic data while maintaining production data integrity and security.