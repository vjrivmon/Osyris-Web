/**
 * 📁 UNIFIED UPLOAD CONTROLLER - OSYRIS SCOUT MANAGEMENT
 * Automatic environment-aware upload handling
 * Switches between local (development) and Supabase (production) seamlessly
 */

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' ||
                    process.env.DATABASE_TYPE === 'supabase';

// Load appropriate controller based on environment
let uploadController;

try {
  if (isProduction) {
    console.log('☁️ Using Supabase upload controller (Production)');
    uploadController = require('./upload.supabase.controller');
  } else {
    console.log('🏠 Using local upload controller (Development)');
    // Check if local controller exists
    try {
      uploadController = require('./upload.local.controller');
    } catch (error) {
      console.log('⚠️ Local controller not found, using fallback implementation');
      // Fallback to basic implementation if local controller doesn't exist
      const multer = require('multer');
      const path = require('path');
      const fs = require('fs').promises;
      const { v4: uuidv4 } = require('uuid');

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads');
      fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

      // Basic multer configuration for local storage
      const upload = multer({
        storage: multer.diskStorage({
          destination: async (req, file, cb) => {
            const folder = req.body.folder || 'general';
            const uploadPath = path.join(uploadsDir, folder);
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const fileExtension = path.extname(file.originalname);
            const fileName = `${uuidv4()}${fileExtension}`;
            cb(null, fileName);
          }
        }),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        fileFilter: (req, file, cb) => {
          const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'image/webp', 'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ];
          cb(null, allowedTypes.includes(file.mimetype));
        }
      });

      uploadController = {
        upload,
        uploadFile: async (req, res) => {
          if (!req.file) {
            return res.status(400).json({
              success: false,
              message: 'No file provided'
            });
          }

          const { folder = 'general', altText = '' } = req.body;
          const fileUrl = `/uploads/${folder}/${req.file.filename}`;

          return res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
              id: Date.now(),
              filename: req.file.filename,
              originalName: req.file.originalname,
              url: fileUrl,
              type: req.file.mimetype,
              size: req.file.size,
              folder: folder,
              altText: altText,
              uploadedAt: new Date().toISOString()
            },
            environment: 'development',
            storageType: 'local'
          });
        },
        getFiles: async (req, res) => res.json({ success: true, data: [], environment: 'development' }),
        deleteFile: async (req, res) => res.json({ success: true, message: 'File deleted', environment: 'development' }),
        getFolders: async (req, res) => res.json({ success: true, data: ['general', 'profiles', 'documents'], environment: 'development' }),
        getFileStats: async (req, res) => res.json({ success: true, data: { total: 0, totalSize: 0 }, environment: 'development' })
      };
    }
  }
} catch (error) {
  console.error('❌ Error loading upload controller:', error);
  throw error;
}

/**
 * 🔄 Unified upload middleware
 */
const upload = uploadController.upload;

/**
 * 📤 Upload file with environment detection
 */
const uploadFile = async (req, res) => {
  try {
    console.log(`📤 Processing upload request in ${isProduction ? 'production' : 'development'} mode`);

    // Add environment metadata
    if (req.body) {
      req.body.environment = isProduction ? 'production' : 'development';
      req.body.storageType = isProduction ? 'supabase' : 'local';
    }

    // Delegate to appropriate controller
    return await uploadController.uploadFile(req, res);

  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
      environment: isProduction ? 'production' : 'development'
    });
  }
};

// 📋 Get files with environment awareness
const getFiles = async (req, res) => {
  try {
    // Delegate to appropriate controller and add environment info
    return await uploadController.getFiles(req, res);
  } catch (error) {
    console.error('❌ Get files error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: error.message,
      environment: isProduction ? 'production' : 'development'
    });
  }
};

// 🗑️ Delete file with environment detection
const deleteFile = async (req, res) => {
  try {
    console.log(`🗑️ Deleting file in ${isProduction ? 'production' : 'development'} mode`);
    return await uploadController.deleteFile(req, res);
  } catch (error) {
    console.error('❌ Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message,
      environment: isProduction ? 'production' : 'development'
    });
  }
};

// 📁 Get folders with environment info
const getFolders = async (req, res) => {
  try {
    if (uploadController.getFolders) {
      return await uploadController.getFolders(req, res);
    } else {
      // Fallback for controllers without getFolders
      return res.json({
        success: true,
        data: ['profiles', 'documents', 'activities', 'general'],
        environment: isProduction ? 'production' : 'development'
      });
    }
  } catch (error) {
    console.error('❌ Get folders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve folders',
      error: error.message,
      environment: isProduction ? 'production' : 'development'
    });
  }
};

// 📊 Get file statistics
const getFileStats = async (req, res) => {
  try {
    if (uploadController.getFileStats) {
      return await uploadController.getFileStats(req, res);
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
      });
    }
  } catch (error) {
    console.error('❌ Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message,
      environment: isProduction ? 'production' : 'development'
    });
  }
};

// 🔍 Get current storage configuration
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
      migration: false
    }
  };

  if (isProduction) {
    config.supabase = {
      bucket: 'osyris-files',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      cdnEnabled: true
    };
  } else {
    config.local = {
      uploadPath: './uploads/',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      baseUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads`
    };
  }

  return res.json({
    success: true,
    config
  });
};

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
  getStorageConfig,

  // Environment info
  isProduction,
  currentStorage: isProduction ? 'supabase' : 'local'
};