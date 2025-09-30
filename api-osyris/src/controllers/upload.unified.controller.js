/**
 * 📁 UNIFIED UPLOAD CONTROLLER - OSYRIS SCOUT MANAGEMENT
 * Automatic environment-aware upload handling
 * Switches between local (development) and Supabase (production) seamlessly
 */

const path = require('path')

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || 
                    process.env.DATABASE_TYPE === 'supabase'

// Load appropriate controller based on environment
let uploadController

if (isProduction) {
  console.log('☁️ Using Supabase upload controller (Production)')
  uploadController = require('./upload.supabase.controller')
} else {
  console.log('🏠 Using local upload controller (Development)')
  uploadController = require('./upload.local.controller')
}

/**
 * 🔄 Unified upload middleware
 * Automatically routes to correct storage provider
 */
const upload = uploadController.upload

/**
 * 📤 Upload file with environment detection
 */
const uploadFile = async (req, res) => {
  try {
    console.log(`📤 Processing upload request in ${isProduction ? 'production' : 'development'} mode`)

    // Add environment metadata
    if (req.body) {
      req.body.environment = isProduction ? 'production' : 'development'
      req.body.storageType = isProduction ? 'supabase' : 'local'
    }

    // Delegate to appropriate controller
    return await uploadController.uploadFile(req, res)

  } catch (error) {
    console.error('❌ Upload error:', error)
    return res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
      environment: isProduction ? 'production' : 'development'
    })
  }
}

/**
 * 📋 Get files with environment awareness
 */
const getFiles = async (req, res) => {
  try {
    // Add environment info to response
    const originalGetFiles = uploadController.getFiles
    const result = await originalGetFiles(req, res)
    
    if (result && !res.headersSent) {
      return res.json({
        ...result,
        environment: isProduction ? 'production' : 'development',
        storageType: isProduction ? 'supabase' : 'local'
      })
    }

    return result

  } catch (error) {
    console.error('❌ Get files error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: error.message
    })
  }
}

/**
 * 🗑️ Delete file with environment detection
 */
const deleteFile = async (req, res) => {
  try {
    console.log(`🗑️ Deleting file in ${isProduction ? 'production' : 'development'} mode`)
    return await uploadController.deleteFile(req, res)

  } catch (error) {
    console.error('❌ Delete error:', error)
    return res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    })
  }
}

/**
 * 📁 Get folders with environment info
 */
const getFolders = async (req, res) => {
  try {
    if (uploadController.getFolders) {
      return await uploadController.getFolders(req, res)
    } else {
      // Fallback for controllers without getFolders
      return res.json({
        success: true,
        data: ['profiles', 'documents', 'activities', 'general'],
        environment: isProduction ? 'production' : 'development'
      })
    }

  } catch (error) {
    console.error('❌ Get folders error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve folders',
      error: error.message
    })
  }
}

/**
 * 📊 Get file statistics
 */
const getFileStats = async (req, res) => {
  try {
    if (uploadController.getFileStats) {
      return await uploadController.getFileStats(req, res)
    } else {
      // Basic stats fallback
      return res.json({
        success: true,
        data: {
          total: 0,
          totalSize: 0,
          byType: {}
        },
        environment: isProduction ? 'production' : 'development'
      })
    }

  } catch (error) {
    console.error('❌ Get stats error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    })
  }
}

/**
 * 🔄 Migrate files between storage providers
 * Special function for migrating files when switching environments
 */
const migrateFiles = async (req, res) => {
  try {
    const { direction = 'local-to-supabase', dryRun = false } = req.body

    console.log(`🔄 Starting file migration: ${direction}`)

    if (direction === 'local-to-supabase') {
      // Load both controllers
      const localController = require('./upload.local.controller')
      const supabaseController = require('./upload.supabase.controller')

      // Get all local files
      const localFiles = await localController.getFiles({
        query: { limit: 1000 }
      }, {
        json: (data) => data
      })

      if (!localFiles.success || !localFiles.data) {
        throw new Error('Failed to retrieve local files')
      }

      const migrationResults = []

      for (const file of localFiles.data) {
        try {
          if (!dryRun) {
            // Read local file
            const filePath = path.join(__dirname, '../../uploads', file.file_path)
            const fileBuffer = await require('fs').promises.readFile(filePath)

            // Upload to Supabase
            const uploadResult = await supabaseController.uploadFile({
              file: {
                buffer: fileBuffer,
                originalname: file.original_name,
                mimetype: file.file_type,
                size: file.file_size
              },
              body: {
                folder: file.folder,
                altText: file.alt_text
              }
            }, {
              status: () => ({ json: (data) => data })
            })

            migrationResults.push({
              file: file.original_name,
              status: 'success',
              result: uploadResult
            })
          } else {
            // Dry run - just log what would be migrated
            migrationResults.push({
              file: file.original_name,
              status: 'dry-run',
              wouldMigrate: true
            })
          }

        } catch (fileError) {
          migrationResults.push({
            file: file.original_name,
            status: 'error',
            error: fileError.message
          })
        }
      }

      return res.json({
        success: true,
        message: `File migration ${dryRun ? 'simulation' : 'completed'}`,
        direction,
        dryRun,
        totalFiles: localFiles.data.length,
        results: migrationResults
      })

    } else if (direction === 'supabase-to-local') {
      // Implement reverse migration if needed
      return res.status(501).json({
        success: false,
        message: 'Supabase to local migration not yet implemented'
      })

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid migration direction'
      })
    }

  } catch (error) {
    console.error('❌ Migration error:', error)
    return res.status(500).json({
      success: false,
      message: 'File migration failed',
      error: error.message
    })
  }
}

/**
 * 🔍 Get current storage configuration
 */
const getStorageConfig = async (req, res) => {
  const config = {
    environment: isProduction ? 'production' : 'development',
    storageType: isProduction ? 'supabase' : 'local',
    features: {
      upload: true,
      download: true,
      delete: true,
      folders: true,
      statistics: !!uploadController.getFileStats,
      migration: true
    }
  }

  if (isProduction) {
    config.supabase = {
      bucket: 'osyris-files',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      cdnEnabled: true
    }
  } else {
    config.local = {
      uploadPath: './uploads/',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      baseUrl: 'http://localhost:5000/uploads'
    }
  }

  return res.json({
    success: true,
    config
  })
}

/**
 * 🔄 Switch storage provider
 * Allows runtime switching between storage providers
 */
const switchStorageProvider = async (req, res) => {
  const { provider } = req.body

  if (!['local', 'supabase'].includes(provider)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid storage provider. Must be "local" or "supabase"'
    })
  }

  try {
    // Reload the appropriate controller
    if (provider === 'supabase') {
      uploadController = require('./upload.supabase.controller')
      process.env.DATABASE_TYPE = 'supabase'
    } else {
      uploadController = require('./upload.local.controller')
      process.env.DATABASE_TYPE = 'sqlite'
    }

    console.log(`✅ Switched to ${provider} storage provider`)

    return res.json({
      success: true,
      message: `Switched to ${provider} storage provider`,
      currentProvider: provider
    })

  } catch (error) {
    console.error('❌ Switch error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to switch storage provider',
      error: error.message
    })
  }
}

// Export unified controller
module.exports = {
  // Core upload functionality
  upload,
  uploadFile,
  getFiles,
  deleteFile,
  getFolders,
  getFileStats,

  // Environment management
  migrateFiles,
  getStorageConfig,
  switchStorageProvider,

  // Environment info
  isProduction,
  currentStorage: isProduction ? 'supabase' : 'local'
}
