# 📁 Upload System Specialist Agent

## Purpose
Specialized agent for managing dual file upload systems: local filesystem (development) and Supabase Storage (production), ensuring seamless file management across environments.

## Capabilities

### 🔄 Dual Storage Management
- **Local Development**: File system-based storage with Express.js
- **Production**: Supabase Storage with CDN distribution
- **Seamless Switching**: Environment-aware storage selection
- **Migration Support**: Transfer files between storage systems

### 📤 Upload Processing
- **Multi-format Support**: Images, documents, PDFs
- **File Validation**: Type, size, and security checks
- **Automatic Optimization**: Image compression and resizing
- **Metadata Management**: File information and alt-text

### 🛡️ Security & Access Control
- **Upload Permissions**: Role-based upload restrictions
- **Virus Scanning**: Malware detection (production)
- **File Encryption**: Sensitive document protection
- **Access Logging**: Complete audit trail

### ⚡ Performance Optimization
- **CDN Integration**: Fast global content delivery
- **Caching Strategy**: Efficient file caching
- **Lazy Loading**: Optimized image loading
- **Compression**: Automatic file compression

## Key Functions

### Storage Management
```javascript
selectStorageProvider()
uploadToLocalStorage(file, metadata)
uploadToSupabaseStorage(file, metadata)
migrateFilesBetweenStorages()
syncFileMetadata()
```

### File Operations
```javascript
validateFile(file)
processImage(file, options)
generateThumbnails(image)
extractMetadata(file)
createFileRecord(file, metadata)
```

### Access Control
```javascript
checkUploadPermissions(user, folder)
generateSecureUrl(fileId, expiration)
revokeFileAccess(fileId)
auditFileAccess(fileId, action)
```

### Migration & Sync
```javascript
migrateLocalToSupabase()
migrateSupabaseToLocal()
syncFilesWithDatabase()
validateFileMigration()
cleanupOrphanedFiles()
```

## Storage Configurations

### 🏠 Local Development Storage
```javascript
const localConfig = {
  uploadPath: './uploads/',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf'],
  structure: {
    root: '/uploads',
    folders: {
      profiles: '/uploads/profiles',
      documents: '/uploads/documents',
      activities: '/uploads/activities',
      general: '/uploads/general'
    }
  },
  server: {
    baseUrl: 'http://localhost:5000',
    staticRoute: '/uploads'
  }
}
```

### ☁️ Supabase Production Storage
```javascript
const supabaseConfig = {
  bucket: 'osyris-files',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['image/*', 'application/pdf', 'application/msword'],
  policies: {
    public: ['profiles/**'],
    authenticated: ['documents/**'],
    admin: ['admin/**']
  },
  cdn: {
    baseUrl: 'https://nwkopngnziocsczqkjra.supabase.co/storage/v1/object/public/osyris-files/',
    transformations: true,
    caching: '1 year'
  }
}
```

## File Processing Pipeline

### 📤 Upload Workflow
```javascript
// 1. Pre-processing
validateFile(file)
checkPermissions(user, folder)
scanForVirus(file) // Production only

// 2. Processing
optimizeImage(file) // If image
extractMetadata(file)
generateThumbnails(file) // If image

// 3. Storage
const storageResult = await uploadToStorage(file, metadata)
const dbRecord = await createDatabaseRecord(storageResult)

// 4. Post-processing
generateCdnUrl(dbRecord)
updateFileReferences(dbRecord)
sendUploadNotification(user, dbRecord)
```

### 🖼️ Image Processing
```javascript
// Automatic image optimization
const processImage = async (image) => {
  const sizes = [
    { name: 'thumbnail', width: 150, height: 150 },
    { name: 'small', width: 300, height: 300 },
    { name: 'medium', width: 600, height: 600 },
    { name: 'large', width: 1200, height: 1200 }
  ]

  const variants = await Promise.all(
    sizes.map(size => resizeImage(image, size))
  )

  return variants
}
```

## Migration Strategies

### 🚀 Initial Migration (Local → Supabase)
1. **File Discovery**
   - Scan local uploads directory
   - Identify all files and metadata
   - Generate migration manifest

2. **Batch Upload**
   - Upload files to Supabase Storage
   - Preserve directory structure
   - Maintain file naming conventions

3. **Database Update**
   - Update file URLs in database
   - Preserve file metadata
   - Update all references

4. **Validation**
   - Verify all files accessible
   - Check file integrity
   - Validate database consistency

### 🔄 Sync Operations
```javascript
// Sync local development with production files
const syncDevWithProd = async () => {
  const prodFiles = await getSupabaseFileList()
  const localFiles = await getLocalFileList()

  const filesToDownload = prodFiles.filter(
    file => !localFiles.includes(file.path)
  )

  await downloadFilesToLocal(filesToDownload)
  await updateLocalDatabase(filesToDownload)
}
```

## File Organization

### 📁 Directory Structure
```
uploads/
├── profiles/          # User profile pictures
│   ├── thumbnails/   # Auto-generated thumbnails
│   └── originals/    # Original profile pictures
├── documents/         # Official documents
│   ├── forms/        # Scout forms and applications
│   ├── certificates/ # Certificates and awards
│   └── policies/     # Rules and policies
├── activities/        # Activity photos and documents
│   ├── 2024/         # Year-based organization
│   └── events/       # Special events
├── sections/          # Section-specific files
│   ├── castores/     # Beaver section files
│   ├── lobatos/      # Wolf cub section files
│   ├── tropa/        # Scout section files
│   ├── pioneros/     # Venturer section files
│   └── rutas/        # Rover section files
└── general/           # General purpose files
```

### 🏷️ File Naming Convention
```javascript
const generateFileName = (originalName, folder, userId) => {
  const timestamp = new Date().toISOString().slice(0, 10)
  const random = Math.random().toString(36).slice(2, 8)
  const extension = path.extname(originalName)

  return `${folder}/${timestamp}_${userId}_${random}${extension}`
}
```

## Security Measures

### 🔒 File Validation
```javascript
const validateFile = (file) => {
  // File type validation
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 'application/msword'
  ]

  // Size validation
  const maxSize = 10 * 1024 * 1024 // 10MB

  // Security checks
  const dangerousExtensions = ['.exe', '.bat', '.sh', '.php']

  return {
    valid: true,
    type: file.mimetype,
    size: file.size,
    safe: !dangerousExtensions.some(ext =>
      file.originalname.toLowerCase().endsWith(ext)
    )
  }
}
```

### 🛡️ Access Control
```javascript
const checkUploadPermissions = (user, folder) => {
  const permissions = {
    admin: ['*'], // All folders
    scouter: ['activities/*', 'sections/*'],
    familia: ['profiles/*'],
    educando: ['profiles/*']
  }

  return permissions[user.rol]?.some(pattern =>
    minimatch(folder, pattern)
  )
}
```

## Performance Optimization

### ⚡ CDN Configuration
```javascript
const cdnConfig = {
  // Supabase Storage CDN
  baseUrl: process.env.SUPABASE_STORAGE_URL,
  transformations: {
    resize: 'width=300,height=300',
    quality: 'quality=85',
    format: 'format=webp'
  },
  headers: {
    'Cache-Control': 'public, max-age=31536000', // 1 year
    'Expires': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  }
}
```

### 🚀 Lazy Loading
```javascript
// Frontend implementation for optimized loading
const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loaded) {
          setLoaded(true)
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [loaded])

  return (
    <div ref={imgRef} className={className}>
      {loaded && <img src={src} alt={alt} />}
    </div>
  )
}
```

## Monitoring & Analytics

### 📊 Upload Metrics
```javascript
const trackUploadMetrics = async (file, user, duration) => {
  await analytics.track('file_upload', {
    fileSize: file.size,
    fileType: file.mimetype,
    uploadDuration: duration,
    userId: user.id,
    userRole: user.rol,
    success: true
  })
}
```

### 🔍 File Usage Analytics
- **Download Tracking**: Monitor file access patterns
- **Storage Usage**: Track storage consumption by section
- **Performance Metrics**: Monitor upload/download speeds
- **Error Tracking**: Log and analyze upload failures

This specialist ensures efficient, secure, and scalable file management across all environments while maintaining data integrity and optimal performance.