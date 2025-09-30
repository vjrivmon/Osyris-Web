# 🏠 Local Development Command

## Command: `/local-dev`

### Purpose
Switch the entire Osyris system to local development mode using SQLite database and local file storage.

### Description
This command orchestrates the complete transition from any environment to local development mode. It handles database configuration switching, dependency management, service restart, and environment validation.

### What it does:

1. **🔄 Environment Detection**
   - Detects current environment configuration
   - Validates if already in development mode

2. **💾 Configuration Backup**
   - Creates timestamped backup of current configuration
   - Stores backups in `backups/config-{timestamp}/`

3. **🗄️ Database Switch**
   - Switches from Supabase to SQLite configuration
   - Updates `api-osyris/src/config/db.config.js`
   - Modifies imports in controllers to use SQLite models

4. **📦 Dependency Management**
   - Ensures SQLite3 is installed
   - Validates development dependencies

5. **🔄 Service Restart**
   - Stops any running services
   - Restarts with development configuration
   - Validates service health

6. **✅ Validation**
   - Verifies SQLite database connectivity
   - Confirms local file storage is working
   - Runs health checks on all services

### Integration Points
- **Hook Manager**: Executes `environment-switch` hooks
- **Migration Specialist**: Handles database configuration migration
- **Database Sync Specialist**: Optionally syncs production data to local
- **Upload System Specialist**: Configures local file storage

### Usage
```
/local-dev
```

### Expected Output
```
🏠 Switching to Local Development Mode...

✅ Current environment detected: production
✅ Configuration backed up to: backups/config-2025-09-29T17-45-32-123Z/
✅ Database configuration switched to SQLite
✅ Dependencies validated
✅ Services restarted successfully
✅ Health checks passed

🎉 Local development environment ready!

🌐 Service URLs:
   Frontend: http://localhost:3000
   Backend:  http://localhost:5000
   API Docs: http://localhost:5000/api-docs

📊 Local Database: api-osyris/database/osyris.db
📁 File Storage: uploads/
```

### Error Handling
- **Configuration Errors**: Automatic rollback to previous state
- **Database Issues**: SQLite database recreation if corrupted
- **Service Startup Failures**: Detailed error logging with resolution steps
- **Dependency Problems**: Automatic installation of missing packages

This command is designed to be safe, reversible, and comprehensive, ensuring developers can quickly switch to local development without any manual configuration.
