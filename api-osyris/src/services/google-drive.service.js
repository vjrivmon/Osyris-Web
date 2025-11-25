/**
 * Servicio de Google Drive para gestión de documentos de educandos
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const {
  DRIVE_CONFIG,
  getDocumentFileName,
  getTipoDocumentoConfig,
  getSeccionFolderId
} = require('../config/google-drive.config');
const {
  getValidAccessToken,
  isOAuthConfigured,
  hasValidTokens
} = require('../config/google-oauth.config');

let driveClient = null;

/**
 * Inicializa el cliente de Google Drive con Service Account
 */
const initializeDriveClient = async () => {
  if (driveClient) return driveClient;

  try {
    // Verificar que existe el archivo de credenciales
    if (!fs.existsSync(DRIVE_CONFIG.CREDENTIALS_PATH)) {
      throw new Error(`Archivo de credenciales no encontrado: ${DRIVE_CONFIG.CREDENTIALS_PATH}`);
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: DRIVE_CONFIG.CREDENTIALS_PATH,
      scopes: DRIVE_CONFIG.SCOPES
    });

    driveClient = google.drive({ version: 'v3', auth });
    console.log('✅ Google Drive client inicializado correctamente');
    return driveClient;
  } catch (error) {
    console.error('❌ Error inicializando Google Drive client:', error.message);
    throw error;
  }
};

/**
 * Busca una carpeta por nombre dentro de una carpeta padre
 */
const findFolderByName = async (folderName, parentFolderId) => {
  const drive = await initializeDriveClient();

  const response = await drive.files.list({
    q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive'
  });

  return response.data.files.length > 0 ? response.data.files[0] : null;
};

/**
 * Crea una carpeta en Google Drive
 */
const createFolder = async (folderName, parentFolderId) => {
  const drive = await initializeDriveClient();

  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId]
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    fields: 'id, name'
  });

  console.log(`📁 Carpeta creada: ${folderName} (ID: ${response.data.id})`);
  return response.data;
};

/**
 * Obtiene o crea la carpeta de un educando
 * Estructura: Sección > Año > Nombre Educando
 */
const getOrCreateEducandoFolder = async (seccionSlug, anioNacimiento, nombreEducando) => {
  // 1. Obtener ID de carpeta de sección
  const seccionFolderId = getSeccionFolderId(seccionSlug);
  if (!seccionFolderId) {
    throw new Error(`No se encontró configuración para la sección: ${seccionSlug}`);
  }

  const drive = await initializeDriveClient();

  // 2. NUEVO: Buscar carpeta del educando en CUALQUIER subcarpeta de año
  // Esto evita problemas cuando el año en Drive no coincide con fecha_nacimiento
  const searchResponse = await drive.files.list({
    q: `name='${nombreEducando}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name, parents)',
    spaces: 'drive'
  });

  // Verificar que la carpeta encontrada está dentro de la sección correcta
  for (const folder of searchResponse.data.files) {
    if (folder.parents && folder.parents.length > 0) {
      // Obtener la carpeta padre (año)
      const parentResponse = await drive.files.get({
        fileId: folder.parents[0],
        fields: 'id, name, parents'
      });

      // Verificar si el abuelo es la carpeta de sección
      if (parentResponse.data.parents && parentResponse.data.parents.includes(seccionFolderId)) {
        return folder;
      }
    }
  }

  // 3. Si no se encuentra, crear en la carpeta del año de nacimiento
  let anioFolder = await findFolderByName(anioNacimiento.toString(), seccionFolderId);
  if (!anioFolder) {
    anioFolder = await createFolder(anioNacimiento.toString(), seccionFolderId);
  }

  const educandoFolder = await createFolder(nombreEducando, anioFolder.id);
  return educandoFolder;
};

/**
 * Lista los archivos en la carpeta de un educando
 */
const listEducandoDocuments = async (educandoFolderId) => {
  const drive = await initializeDriveClient();

  const response = await drive.files.list({
    q: `'${educandoFolderId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
    orderBy: 'name'
  });

  return response.data.files;
};

/**
 * Lista las plantillas disponibles
 */
const listPlantillas = async () => {
  if (!DRIVE_CONFIG.TEMPLATES_FOLDER_ID) {
    throw new Error('TEMPLATES_FOLDER_ID no configurado');
  }

  const drive = await initializeDriveClient();

  const response = await drive.files.list({
    q: `'${DRIVE_CONFIG.TEMPLATES_FOLDER_ID}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, size, webViewLink)',
    orderBy: 'name'
  });

  // Mapear plantillas con información adicional
  const plantillas = response.data.files.map(file => {
    // Buscar qué tipo de documento corresponde usando PREFIJO
    let tipoDocumento = null;
    const fileNameUpper = file.name.toUpperCase();

    for (const [tipo, config] of Object.entries(DRIVE_CONFIG.TIPOS_DOCUMENTO)) {
      if (config.plantilla) {
        const prefijo = config.prefijo.toUpperCase();
        // Verificar si el nombre del archivo comienza con el prefijo
        if (fileNameUpper.startsWith(prefijo + '_') ||
            fileNameUpper.startsWith(prefijo + ' ') ||
            fileNameUpper.startsWith(prefijo + '-')) {
          tipoDocumento = tipo;
          break;
        }
      }
    }

    return {
      ...file,
      tipoDocumento,
      config: tipoDocumento ? DRIVE_CONFIG.TIPOS_DOCUMENTO[tipoDocumento] : null
    };
  });

  return plantillas;
};

/**
 * Descarga un archivo de Google Drive
 * @returns Buffer con el contenido del archivo
 */
const downloadFile = async (fileId) => {
  const drive = await initializeDriveClient();

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(response.data);
};

/**
 * Obtiene metadatos de un archivo
 */
const getFileMetadata = async (fileId) => {
  const drive = await initializeDriveClient();

  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents'
  });

  return response.data;
};

/**
 * Obtiene cliente de Drive con OAuth2 (para uploads)
 * Usa el token del usuario real que tiene cuota de almacenamiento
 */
const getOAuthDriveClient = async () => {
  if (!isOAuthConfigured()) {
    throw new Error('OAuth no configurado. Añade GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET al .env');
  }

  if (!hasValidTokens()) {
    throw new Error('No hay autorización OAuth. Un admin debe visitar /api/drive/oauth/authorize');
  }

  const accessToken = await getValidAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.drive({ version: 'v3', auth: oauth2Client });
};

/**
 * Sube un archivo a la carpeta de un educando
 * Usa OAuth2 para que el archivo pertenezca al usuario real (con cuota)
 */
const uploadDocument = async (educandoFolderId, fileName, fileBuffer, mimeType) => {
  // Usar OAuth2 para uploads (Service Account no tiene cuota de almacenamiento)
  const drive = await getOAuthDriveClient();

  // Crear stream desde buffer
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileBuffer);

  const fileMetadata = {
    name: fileName,
    parents: [educandoFolderId]
  };

  const media = {
    mimeType: mimeType,
    body: bufferStream
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink, size'
  });

  console.log(`📄 Archivo subido: ${fileName} (ID: ${response.data.id})`);
  return response.data;
};

/**
 * Elimina un archivo de Google Drive
 */
const deleteFile = async (fileId) => {
  const drive = await initializeDriveClient();
  await drive.files.delete({ fileId });
  console.log(`🗑️ Archivo eliminado: ${fileId}`);
  return true;
};

/**
 * Busca documentos de un educando por tipo (usando prefijo)
 */
const findDocumentByType = async (educandoFolderId, tipoDocumento, nombreEducando) => {
  const tipoConfig = getTipoDocumentoConfig(tipoDocumento);
  if (!tipoConfig) return null;

  const drive = await initializeDriveClient();

  // Buscar archivo que comience con el prefijo del documento
  const response = await drive.files.list({
    q: `'${educandoFolderId}' in parents and name contains '${tipoConfig.prefijo}_' and trashed=false`,
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
    orderBy: 'modifiedTime desc'
  });

  return response.data.files.length > 0 ? response.data.files[0] : null;
};

/**
 * Verifica el estado de documentos de un educando
 * Compara documentos requeridos vs existentes en Drive usando PREFIJOS
 * Soporta formatos: "DOC01_" o "DOC01 -" o "DOC01-"
 * Filtra documentos opcionales según edad del educando
 */
const checkDocumentStatus = async (educandoFolderId, nombreEducando, edadEducando = 0, educandoId = null) => {
  const documentosEnDrive = await listEducandoDocuments(educandoFolderId);

  // Consultar documentos pendientes de revisión en BD si tenemos educandoId
  let documentosBD = [];
  if (educandoId) {
    try {
      const { query } = require('../config/db.config');
      documentosBD = await query(`
        SELECT google_drive_file_id, tipo_documento, estado_revision, estado
        FROM documentos_familia
        WHERE educando_id = $1
      `, [educandoId]);
    } catch (err) {
      console.error('Error consultando documentos BD:', err);
    }
  }

  const status = {};

  for (const [tipo, config] of Object.entries(DRIVE_CONFIG.TIPOS_DOCUMENTO)) {
    // Filtrar documentos que requieren edad mínima
    if (config.edadMinima && edadEducando < config.edadMinima) {
      continue; // Saltar documentos para los que el educando no tiene edad suficiente
    }

    // Buscar documento soportando AMBOS formatos:
    // - Nuevo: "A02_SIP_Nombre.pdf" o "DOC01_Ficha_Inscripcion_Nombre.pdf"
    // - Antiguo: "DOC01 - Nombre.pdf" (sin tipo en el nombre)
    const encontrado = documentosEnDrive.find(doc => {
      const docName = doc.name.toUpperCase();
      const prefijo = config.prefijo.toUpperCase();
      const nombreArchivo = config.nombreArchivo?.toUpperCase();

      // 1. Formato NUEVO: PREFIJO_NOMBREARCHIVO_nombre.pdf
      if (nombreArchivo) {
        const patronNuevo = `${prefijo}_${nombreArchivo}_`;
        const patronNuevoAlt = `${prefijo}_${nombreArchivo}.`;
        if (docName.startsWith(patronNuevo) || docName.startsWith(patronNuevoAlt)) {
          return true;
        }
      }

      // 2. Formato ANTIGUO: "PREFIJO - Nombre.pdf"
      // Solo permitir para prefijos ÚNICOS (no A02 que es compartido por SIP y Vacunas)
      const prefijosCompartidos = ['A02']; // A02 tiene SIP y Vacunas
      const esPrefijoUnico = !prefijosCompartidos.includes(prefijo);

      if (esPrefijoUnico) {
        if (docName.startsWith(prefijo + ' - ') ||
            docName.startsWith(prefijo + '- ') ||
            docName.startsWith(prefijo + ' -')) {
          return true;
        }
      }

      return false;
    });

    // Determinar estado final considerando BD
    let estadoFinal = 'faltante';
    if (encontrado) {
      // Buscar en BD si este documento tiene estado pendiente_revision
      const docBD = documentosBD.find(d =>
        d.google_drive_file_id === encontrado.id ||
        d.tipo_documento === tipo
      );

      if (docBD) {
        // Usar estado de BD
        if (docBD.estado_revision === 'pendiente' || docBD.estado === 'pendiente_revision') {
          estadoFinal = 'pendiente_revision';
        } else if (docBD.estado_revision === 'aprobado' || docBD.estado === 'vigente') {
          estadoFinal = 'subido'; // Aprobado
        } else if (docBD.estado_revision === 'rechazado' || docBD.estado === 'rechazado') {
          estadoFinal = 'rechazado';
        } else {
          estadoFinal = 'subido'; // Por defecto si existe
        }
      } else {
        // No hay registro en BD pero existe en Drive (subido manualmente)
        estadoFinal = 'subido';
      }
    }

    status[tipo] = {
      tipo,
      nombre: config.nombre,
      prefijo: config.prefijo,
      obligatorio: config.obligatorio,
      tienePlantilla: !!config.plantilla,
      plantillaNombre: config.plantilla,
      estado: estadoFinal,
      archivo: encontrado || null
    };
  }

  return status;
};

/**
 * Obtiene la estructura completa de carpetas de un educando
 * @param {string} seccionSlug - Slug de la sección
 * @param {number} anioNacimiento - Año de nacimiento
 * @param {string} nombreEducando - Nombre completo del educando
 * @param {number} edadEducando - Edad actual del educando (para filtrar documentos opcionales)
 * @param {number} educandoId - ID del educando para consultar estado en BD
 */
const getEducandoFolderStructure = async (seccionSlug, anioNacimiento, nombreEducando, edadEducando = 0, educandoId = null) => {
  try {
    const folder = await getOrCreateEducandoFolder(seccionSlug, anioNacimiento, nombreEducando);
    const documentos = await listEducandoDocuments(folder.id);
    const status = await checkDocumentStatus(folder.id, nombreEducando, edadEducando, educandoId);

    return {
      folder,
      documentos,
      status,
      resumen: {
        total: Object.keys(status).length,
        completos: Object.values(status).filter(s => s.estado === 'subido').length,
        pendientes: Object.values(status).filter(s => s.estado === 'pendiente_revision').length,
        faltantes: Object.values(status).filter(s => s.estado === 'faltante' && s.obligatorio).length,
        opcionalesFaltantes: Object.values(status).filter(s => s.estado === 'faltante' && !s.obligatorio).length
      }
    };
  } catch (error) {
    console.error('Error obteniendo estructura de educando:', error);
    throw error;
  }
};

/**
 * Descarga el contenido de un archivo de Drive usando Service Account
 * Permite acceder sin requerir login del usuario final
 */
const downloadFileContent = async (fileId) => {
  const drive = await initializeDriveClient();

  // Obtener metadata del archivo
  const fileInfo = await drive.files.get({
    fileId: fileId,
    fields: 'id, name, mimeType, size'
  });

  // Descargar el contenido como buffer
  const response = await drive.files.get({
    fileId: fileId,
    alt: 'media'
  }, {
    responseType: 'arraybuffer'
  });

  return {
    data: Buffer.from(response.data),
    mimeType: fileInfo.data.mimeType,
    fileName: fileInfo.data.name,
    size: parseInt(fileInfo.data.size || '0')
  };
};

module.exports = {
  initializeDriveClient,
  findFolderByName,
  createFolder,
  getOrCreateEducandoFolder,
  listEducandoDocuments,
  listPlantillas,
  downloadFile,
  getFileMetadata,
  uploadDocument,
  deleteFile,
  findDocumentByType,
  checkDocumentStatus,
  getEducandoFolderStructure,
  getDocumentFileName,
  getTipoDocumentoConfig,
  downloadFileContent,
  DRIVE_CONFIG
};
