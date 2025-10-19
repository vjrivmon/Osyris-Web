/**
 * Google Drive Controller
 * Gestión de documentos mediante Google Drive API
 * Grupo Scout Osyris - Sistema de Gestión
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('../middleware/auth.middleware');

// Configuración de Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(__dirname, '../../config/google-drive-token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../../config/google-drive-credentials.json');

class GoogleDriveService {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.folderId = null; // ID del folder principal de Osyris
  }

  /**
   * Inicializar autenticación con Google Drive
   */
  async initializeAuth() {
    try {
      const credentials = this.loadCredentials();
      const { client_secret, client_id, redirect_uris } = credentials.web;

      this.auth = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      // Cargar token si existe
      if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        this.auth.setCredentials(token);
      }

      this.drive = google.drive({ version: 'v3', auth: this.auth });

      // Buscar o crear folder principal
      await this.ensureOsyrisFolder();

      return true;
    } catch (error) {
      console.error('Error inicializando Google Drive:', error);
      return false;
    }
  }

  /**
   * Cargar credenciales desde archivo
   */
  loadCredentials() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error('Archivo de credenciales de Google Drive no encontrado');
    }
    return JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  }

  /**
   * Asegurar que exista el folder principal de Osyris
   */
  async ensureOsyrisFolder() {
    try {
      // Buscar folder existente
      const response = await this.drive.files.list({
        q: "name='Osyris Scout Management' and mimeType='application/vnd.google-apps.folder'",
        fields: 'files(id, name)'
      });

      if (response.data.files.length > 0) {
        this.folderId = response.data.files[0].id;
        console.log('✅ Folder Osyris encontrado:', this.folderId);
      } else {
        // Crear nuevo folder
        const fileMetadata = {
          name: 'Osyris Scout Management',
          mimeType: 'application/vnd.google-apps.folder'
        };

        const folder = await this.drive.files.create({
          resource: fileMetadata,
          fields: 'id'
        });

        this.folderId = folder.data.id;
        console.log('✅ Folder Osyris creado:', this.folderId);
      }
    } catch (error) {
      console.error('Error gestionando folder Osyris:', error);
      throw error;
    }
  }

  /**
   * Listar documentos
   */
  async listDocuments(options = {}) {
    const { category, search, limit = 20, offset = 0 } = options;

    try {
      let query = `'${this.folderId}' in parents and trashed=false`;

      if (search) {
        query += ` and name contains '${search}'`;
      }

      if (category) {
        query += ` and name contains '${category}'`;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink)',
        pageSize: limit,
        pageToken: offset > 0 ? await this.getPageToken(offset) : undefined
      });

      // Formatear documentos
      const documents = response.data.files.map(file => ({
        id: file.id,
        titulo: file.name,
        tipo_archivo: this.getFileType(file.mimeType),
        tamaño_archivo: parseInt(file.size) || 0,
        url_descarga: file.webContentLink,
        url_vista: file.webViewLink,
        categoria: this.extractCategory(file.name),
        fecha_subida: file.createdTime,
        fecha_modificacion: file.modifiedTime,
        extension: this.getFileExtension(file.name)
      }));

      return {
        success: true,
        documents,
        total: response.data.files.length
      };

    } catch (error) {
      console.error('Error listando documentos:', error);
      return {
        success: false,
        message: 'Error al listar documentos',
        error: error.message
      };
    }
  }

  /**
   * Obtener documento por ID
   */
  async getDocument(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, parents'
      });

      const file = response.data;

      return {
        success: true,
        document: {
          id: file.id,
          titulo: file.name,
          tipo_archivo: this.getFileType(file.mimeType),
          tamaño_archivo: parseInt(file.size) || 0,
          url_descarga: file.webContentLink,
          url_vista: file.webViewLink,
          categoria: this.extractCategory(file.name),
          fecha_subida: file.createdTime,
          fecha_modificacion: file.modifiedTime,
          extension: this.getFileExtension(file.name),
          parent_folder: file.parents[0]
        }
      };

    } catch (error) {
      console.error('Error obteniendo documento:', error);
      return {
        success: false,
        message: 'Error al obtener documento',
        error: error.message
      };
    }
  }

  /**
   * Subir archivo
   */
  async uploadFile(fileData, metadata = {}) {
    try {
      const { filename, mimetype, buffer } = fileData;
      const { category = 'general', description = '' } = metadata;

      // Preparar nombre de archivo con categoría
      const prefixedName = category ? `[${category}] ${filename}` : filename;

      const fileMetadata = {
        name: prefixedName,
        parents: [this.folderId]
      };

      const media = {
        mimeType: mimetype,
        body: buffer
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size, webViewLink, webContentLink'
      });

      return {
        success: true,
        message: 'Archivo subido correctamente',
        document: {
          id: response.data.id,
          titulo: response.data.name,
          tipo_archivo: this.getFileType(response.data.mimeType),
          tamaño_archivo: parseInt(response.data.size) || 0,
          url_descarga: response.data.webContentLink,
          url_vista: response.data.webViewLink,
          categoria: category,
          fecha_subida: new Date().toISOString(),
          extension: this.getFileExtension(filename)
        }
      };

    } catch (error) {
      console.error('Error subiendo archivo:', error);
      return {
        success: false,
        message: 'Error al subir archivo',
        error: error.message
      };
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });

      return {
        success: true,
        message: 'Archivo eliminado correctamente'
      };

    } catch (error) {
      console.error('Error eliminando archivo:', error);
      return {
        success: false,
        message: 'Error al eliminar archivo',
        error: error.message
      };
    }
  }

  /**
   * Crear subfolder
   */
  async createFolder(folderName, parentFolderId = null) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : [this.folderId]
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id, name'
      });

      return {
        success: true,
        folder: {
          id: response.data.id,
          name: response.data.name
        }
      };

    } catch (error) {
      console.error('Error creando folder:', error);
      return {
        success: false,
        message: 'Error al crear folder',
        error: error.message
      };
    }
  }

  // Métodos auxiliares
  getFileType(mimeType) {
    const typeMap = {
      'application/pdf': 'PDF',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/vnd.ms-excel': 'Excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
      'image/jpeg': 'Imagen',
      'image/png': 'Imagen',
      'image/gif': 'Imagen',
      'text/plain': 'Texto'
    };
    return typeMap[mimeType] || 'Otro';
  }

  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  extractCategory(filename) {
    // Buscar categoría en formato [categoría] nombre_archivo.ext
    const match = filename.match(/^\[([^\]]+)\]/);
    return match ? match[1] : 'general';
  }

  async getPageToken(offset) {
    // Implementar paginación si es necesario
    return null;
  }
}

// Instancia singleton del servicio
const driveService = new GoogleDriveService();

/**
 * Inicializar servicio Google Drive
 */
exports.initializeService = async (req, res) => {
  try {
    const initialized = await driveService.initializeAuth();

    if (initialized) {
      res.json({
        success: true,
        message: 'Servicio Google Drive inicializado correctamente',
        folderId: driveService.folderId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al inicializar servicio Google Drive'
      });
    }
  } catch (error) {
    console.error('Error inicializando servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al inicializar servicio Google Drive',
      error: error.message
    });
  }
};

/**
 * Listar documentos
 */
exports.listDocuments = async (req, res) => {
  try {
    // Asegurar que el servicio esté inicializado
    if (!driveService.drive) {
      await driveService.initializeAuth();
    }

    const { category, search, limit, offset } = req.query;
    const result = await driveService.listDocuments({
      category,
      search,
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    res.json(result);
  } catch (error) {
    console.error('Error listando documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar documentos',
      error: error.message
    });
  }
};

/**
 * Obtener documento por ID
 */
exports.getDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!driveService.drive) {
      await driveService.initializeAuth();
    }

    const result = await driveService.getDocument(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener documento',
      error: error.message
    });
  }
};

/**
 * Subir archivo
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    if (!driveService.drive) {
      await driveService.initializeAuth();
    }

    const file = req.files.file;
    const { category, description } = req.body;

    // Validar archivo
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 50MB'
      });
    }

    const result = await driveService.uploadFile(
      {
        filename: file.name,
        mimetype: file.mimetype,
        buffer: file.data
      },
      { category, description }
    );

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir archivo',
      error: error.message
    });
  }
};

/**
 * Eliminar documento
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!driveService.drive) {
      await driveService.initializeAuth();
    }

    const result = await driveService.deleteFile(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar documento',
      error: error.message
    });
  }
};

/**
 * Crear folder
 */
exports.createFolder = async (req, res) => {
  try {
    const { folderName, parentFolderId } = req.body;

    if (!folderName) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del folder es requerido'
      });
    }

    if (!driveService.drive) {
      await driveService.initializeAuth();
    }

    const result = await driveService.createFolder(folderName, parentFolderId);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error creando folder:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear folder',
      error: error.message
    });
  }
};

// Exportar el servicio para uso en otros controladores
exports.driveService = driveService;