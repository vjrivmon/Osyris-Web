# 🔄 Data Synchronization Command

## Command: `/sync-data`

### Purpose
Synchronize data between local development and production environments with conflict resolution.

### Description
This command provides bidirectional data synchronization between SQLite (local) and Supabase (production) environments. It handles conflict resolution, data anonymization, and maintains referential integrity.

### What it does:

1. **🔍 Environment Detection**
   - Identifies source and target environments
   - Validates database connectivity
   - Checks sync permissions

2. **📊 Change Detection**
   - Identifies modified records since last sync
   - Detects conflicts between environments
   - Analyzes data dependencies

3. **⚖️ Conflict Resolution**
   - Applies configured resolution strategies
   - Handles manual conflict resolution
   - Preserves critical data integrity

4. **🚀 Data Transfer**
   - Transfers data in optimal batches
   - Maintains referential integrity
   - Validates transfer completion

5. **🛡️ Privacy Protection**
   - Anonymizes sensitive data for development
   - Respects GDPR requirements
   - Applies data retention policies

### Usage
```
/sync-data
/sync-data --direction production-to-local
/sync-data --direction local-to-production
/sync-data --table usuarios
/sync-data --dry-run
```

### Options
- `--direction`: Sync direction (bidirectional, production-to-local, local-to-production)
- `--table`: Sync specific table only
- `--dry-run`: Show what would be synced without applying changes
- `--anonymize`: Apply data anonymization (for production-to-local)
- `--force`: Ignore conflicts and apply source data

### Sync Strategies

#### Bidirectional Sync
- Merges changes from both environments
- Uses timestamp-based conflict resolution
- Preserves local development changes

#### Production to Local
- Pulls production data for debugging
- Automatically anonymizes personal data
- Preserves development-specific records

#### Local to Production
- Pushes tested changes to production
- Requires validation before applying
- Creates production backup first

### Example Output
```
🔄 Synchronizing Data Between Environments...

🔍 Environment detection
   Source: production (Supabase)
   Target: development (SQLite)
   Direction: production-to-local

📊 Change analysis
   New records: 23 usuarios, 5 actividades
   Modified records: 8 usuarios, 12 documentos
   Conflicts detected: 2 usuarios
   Total changes: 50 records

⚖️ Conflict resolution
   Usuario ID 15: production version newer (auto-resolved)
   Usuario ID 23: manual resolution required
   ✅ All conflicts resolved

🛡️ Privacy protection
   ✅ Email addresses anonymized
   ✅ Phone numbers masked
   ✅ Addresses generalized

🚀 Data transfer
   ✅ 23 usuarios synchronized
   ✅ 5 actividades synchronized  
   ✅ 12 documentos synchronized
   ✅ Referential integrity validated

🎉 Data synchronization completed!
   Duration: 1m 45s
   Records synced: 50
   Conflicts resolved: 2
   Data anonymized: Yes
```

### Conflict Resolution Strategies
- **Timestamp-based**: Most recent change wins
- **Production-priority**: Production data always wins
- **Manual**: Present conflicts for user decision
- **Field-level**: Merge non-conflicting fields

### Privacy & Security
- Automatic PII anonymization for dev environments
- Audit trail of all sync operations
- Encrypted data transfer
- Access control validation

### Monitoring
- Sync operation logging
- Performance metrics
- Error tracking
- Data drift detection

This command ensures developers can work with realistic data while maintaining production data security and integrity.
