# ☁️ Supabase Deploy Command

## Command: `/supabase-deploy`

### Purpose
Deploy the Osyris system to production using Supabase (PostgreSQL database) and Supabase Storage.

### Description
This command orchestrates the complete deployment process from local development to production. It handles schema migration, data transfer, file uploads, configuration switching, and deployment validation.

### What it does:

1. **🔍 Pre-Deployment Validation**
   - Validates Supabase credentials and connectivity
   - Checks schema compatibility
   - Runs production readiness tests
   - Validates environment variables

2. **💾 Backup Creation**
   - Creates local configuration backup
   - Creates production database backup (if exists)
   - Stores deployment artifacts

3. **🗄️ Database Migration**
   - Migrates SQLite schema to PostgreSQL
   - Transfers data with integrity validation
   - Creates indexes and constraints
   - Updates schema version

4. **📁 File Migration**
   - Transfers local files to Supabase Storage
   - Updates file references in database
   - Configures CDN and permissions
   - Validates file accessibility

5. **⚙️ Configuration Switch**
   - Updates to Supabase configuration
   - Switches to production models
   - Updates environment variables
   - Configures production settings

6. **🚀 Deployment**
   - Builds production frontend
   - Deploys to Vercel/production platform
   - Updates DNS and routing
   - Monitors deployment health

7. **✅ Post-Deployment Validation**
   - Runs smoke tests
   - Validates all APIs are functional
   - Tests file upload/download
   - Monitors performance metrics

### Integration Points
- **Deployment Orchestrator**: Master coordinator for the entire process
- **Migration Specialist**: Handles database data migration
- **Schema Migration Specialist**: Manages schema conversion
- **Upload System Specialist**: Transfers files to Supabase Storage
- **Database Sync Specialist**: Validates data integrity

### Usage
```
/supabase-deploy
```

### Options (future enhancement)
```
/supabase-deploy --dry-run      # Simulate deployment without changes
/supabase-deploy --force        # Force deployment even if checks fail
/supabase-deploy --rollback     # Rollback to previous version
/supabase-deploy --migrate-only # Only migrate data, don't deploy
```

### Expected Output
```
☁️ Deploying to Supabase Production...

🔍 Pre-deployment validation
   ✅ Supabase connectivity confirmed
   ✅ Schema compatibility validated
   ✅ Environment variables verified
   ✅ Production readiness confirmed

💾 Creating backups
   ✅ Local configuration backed up
   ✅ Production backup created

🗄️ Database migration
   ✅ Schema migrated to PostgreSQL
   ✅ Data transferred (1,247 records)
   ✅ Indexes and constraints created
   ✅ Migration integrity validated

📁 File migration
   ✅ 89 files uploaded to Supabase Storage
   ✅ File references updated in database
   ✅ CDN configuration applied

⚙️ Configuration update
   ✅ Switched to Supabase configuration
   ✅ Production models activated
   ✅ Environment variables updated

🚀 Deployment
   ✅ Frontend built successfully
   ✅ Deployed to production platform
   ✅ DNS updated and propagated

✅ Post-deployment validation
   ✅ All API endpoints responding
   ✅ File upload/download functional
   ✅ Performance metrics nominal
   ✅ Smoke tests passed

🎉 Deployment completed successfully!

🌐 Production URLs:
   Frontend: https://osyris-scout.vercel.app
   API:      https://your-api-domain.com
   Admin:    https://osyris-scout.vercel.app/admin

📊 Database: Supabase PostgreSQL
📁 Storage:  Supabase Storage
⏱️  Deploy time: 4m 32s
```

### Deployment Phases

#### Phase 1: Validation & Preparation
- Environment validation
- Dependency checks
- Backup creation
- Risk assessment

#### Phase 2: Data Migration
- Schema conversion
- Data transfer
- Relationship validation
- Performance optimization

#### Phase 3: Asset Migration
- File uploads
- CDN configuration
- Permission setup
- Access validation

#### Phase 4: Configuration
- Environment switching
- Service configuration
- Credential management
- Feature flags

#### Phase 5: Deployment
- Build process
- Platform deployment
- DNS configuration
- Health monitoring

#### Phase 6: Validation
- Functional testing
- Performance validation
- Security checks
- User acceptance

### Rollback Strategy
If deployment fails at any stage:
1. **Automatic Rollback**: Configuration restored to previous state
2. **Database Rollback**: Previous backup restored if needed
3. **File Rollback**: Local files preserved, Supabase cleaned up
4. **Service Rollback**: Development services restarted

### Error Handling
- **Connection Failures**: Retry with exponential backoff
- **Migration Errors**: Partial rollback and error reporting
- **File Upload Failures**: Resume from last successful upload
- **Deployment Failures**: Complete rollback with detailed logs

### Monitoring
- Real-time deployment progress
- Error tracking and alerting
- Performance metrics collection
- Health check automation

This command provides a complete, automated, and safe deployment process with comprehensive validation and rollback capabilities.
