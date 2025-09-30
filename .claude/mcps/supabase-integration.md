# 🚀 Supabase MCP Integration

## Overview
Model Context Protocol integration for Supabase services, enabling seamless database and storage operations from Claude Code agents.

## Capabilities

### Database Operations
- **Query Execution**: Direct SQL queries to PostgreSQL
- **CRUD Operations**: Create, Read, Update, Delete operations
- **Schema Management**: Table creation, modification, indexing
- **Data Migration**: Bulk data transfers from SQLite

### Storage Operations
- **File Upload**: Direct uploads to Supabase Storage
- **File Management**: List, delete, move files
- **Bucket Management**: Create and configure storage buckets
- **CDN Integration**: Generate public URLs with transformations

### Authentication
- **User Management**: Create, update, delete users
- **Role Management**: Assign and manage user roles
- **Session Management**: Handle authentication sessions
- **Policy Management**: Configure Row Level Security

## Agent Integration

### Migration Specialist
```javascript
// Use Supabase MCP for data migration
const migrationResult = await supabaseMCP.migrateData({
  source: 'sqlite',
  target: 'postgresql',
  tables: ['usuarios', 'secciones', 'actividades'],
  batchSize: 1000,
  validateIntegrity: true
})
```

### Upload System Specialist
```javascript
// Use Supabase MCP for file operations
const uploadResult = await supabaseMCP.uploadFile({
  bucket: 'osyris-files',
  path: 'profiles/user-123.jpg',
  file: fileBuffer,
  metadata: {
    contentType: 'image/jpeg',
    cacheControl: '3600'
  }
})
```

### Database Sync Specialist
```javascript
// Use Supabase MCP for synchronization
const syncResult = await supabaseMCP.syncTables({
  direction: 'bidirectional',
  tables: ['usuarios'],
  conflictResolution: 'timestamp-based'
})
```

## Configuration Requirements

### Environment Variables
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Schema
Ensure the following tables exist in Supabase:
- `usuarios` (users)
- `secciones` (sections)
- `actividades` (activities)
- `documentos` (documents)
- `mensajes` (messages)
- `uploaded_files` (file metadata)

### Storage Buckets
Required storage buckets:
- `osyris-files` (main file storage)
- `osyris-backups` (backup storage)

### Row Level Security Policies
```sql
-- Example RLS policy for usuarios table
CREATE POLICY "Users can view their own data" ON usuarios
    FOR SELECT USING (auth.uid() = id::text);

CREATE POLICY "Admins can view all data" ON usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid() 
            AND rol = 'admin'
        )
    );
```

## API Endpoints

### Database
- `GET /rest/v1/usuarios` - List users
- `POST /rest/v1/usuarios` - Create user
- `PATCH /rest/v1/usuarios?id=eq.{id}` - Update user
- `DELETE /rest/v1/usuarios?id=eq.{id}` - Delete user

### Storage
- `POST /storage/v1/object/{bucket}/{path}` - Upload file
- `GET /storage/v1/object/public/{bucket}/{path}` - Get public URL
- `DELETE /storage/v1/object/{bucket}/{path}` - Delete file

### Auth
- `POST /auth/v1/signup` - Register user
- `POST /auth/v1/token?grant_type=password` - Login
- `POST /auth/v1/logout` - Logout

## Error Handling

### Common Errors
- **401 Unauthorized**: Invalid or expired API key
- **403 Forbidden**: RLS policy violation
- **404 Not Found**: Resource doesn't exist
- **413 Payload Too Large**: File size exceeds limit
- **429 Too Many Requests**: Rate limit exceeded

### Retry Strategies
- **Network errors**: Exponential backoff with 3 retries
- **Rate limits**: Linear backoff with 5 retries
- **Server errors**: Exponential backoff with 2 retries

## Performance Optimization

### Connection Pooling
- Maintain persistent connections
- Pool size: 10 concurrent connections
- Connection timeout: 30 seconds

### Caching
- Query result caching for 5 minutes
- File metadata caching for 1 hour
- Schema information caching for 24 hours

### Batch Operations
- Bulk inserts: 1000 records per batch
- Parallel uploads: 5 files simultaneously
- Transaction batching for related operations

## Security Considerations

### Credential Management
- Never hardcode API keys in code
- Use environment variables for all credentials
- Rotate service keys regularly
- Monitor API key usage

### Data Protection
- Enable Row Level Security on all tables
- Use service key only for admin operations
- Validate all input data
- Encrypt sensitive data at rest

### Access Control
- Implement proper authentication checks
- Use least privilege principle
- Audit all database operations
- Monitor suspicious activity

This MCP integration provides a robust, secure, and performant interface between Claude Code agents and Supabase services.
