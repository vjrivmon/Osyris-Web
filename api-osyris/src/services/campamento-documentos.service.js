/**
 * Servicio de documentos de campamento para Google Drive
 *
 * Maneja:
 * - Subida de circulares (scouters)
 * - Descarga de circulares (familias)
 * - Subida de circulares firmadas (familias -> email seccion)
 * - Subida de justificantes de pago (familias -> email tesoreria)
 */

const { google } = require('googleapis');
const fs = require('fs');
const stream = require('stream');
const path = require('path');
const {
  DRIVE_CONFIG,
  getEmailSeccion
} = require('../config/google-drive.config');
const { getOrCreateCampamentoFolder } = require('./campamento-sheets.service');
const { getValidAccessToken } = require('../config/google-oauth.config');

let driveClientServiceAccount = null;
let driveClientOAuth = null;

/**
 * Inicializa el cliente de Google Drive con Service Account (solo lectura)
 */
const initializeDriveClientServiceAccount = async () => {
  if (driveClientServiceAccount) return driveClientServiceAccount;

  try {
    if (!fs.existsSync(DRIVE_CONFIG.CREDENTIALS_PATH)) {
      throw new Error(`Archivo de credenciales no encontrado: ${DRIVE_CONFIG.CREDENTIALS_PATH}`);
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: DRIVE_CONFIG.CREDENTIALS_PATH,
      scopes: DRIVE_CONFIG.SCOPES
    });

    driveClientServiceAccount = google.drive({ version: 'v3', auth });
    return driveClientServiceAccount;
  } catch (error) {
    console.error('Error inicializando Google Drive client (Service Account):', error.message);
    throw error;
  }
};

/**
 * Inicializa el cliente de Google Drive con OAuth2 (para uploads)
 * Usa la misma autenticación que el sistema de documentos de educandos
 */
const initializeDriveClientOAuth = async () => {
  try {
    const accessToken = await getValidAccessToken();

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    driveClientOAuth = google.drive({ version: 'v3', auth: oauth2Client });
    return driveClientOAuth;
  } catch (error) {
    console.error('Error inicializando Google Drive client (OAuth2):', error.message);
    throw error;
  }
};

/**
 * Alias para compatibilidad - usa Service Account para lectura
 */
const initializeDriveClient = initializeDriveClientServiceAccount;

/**
 * Normaliza el nombre de la sección para usar como nombre de carpeta
 * @param {string} seccion - Nombre de la sección (ej: "Tropa", "manada", "PIONEROS")
 * @returns {string} - Nombre normalizado en mayúsculas (ej: "TROPA", "MANADA", "PIONEROS")
 */
const normalizarNombreSeccion = (seccion) => {
  const mapeoSecciones = {
    'castores': 'CASTORES',
    'colonia': 'CASTORES',
    'manada': 'MANADA',
    'lobatos': 'MANADA',
    'tropa': 'TROPA',
    'scouts': 'TROPA',
    'pioneros': 'PIONEROS',
    'posta': 'PIONEROS',
    'rutas': 'RUTAS',
    'clan': 'RUTAS'
  };

  const seccionLower = seccion.toLowerCase().trim();
  return mapeoSecciones[seccionLower] || seccion.toUpperCase();
};

/**
 * Sube la circular del campamento (solo scouters)
 * IMPORTANTE: Usa OAuth2 en lugar de Service Account para tener cuota de almacenamiento
 *
 * @param {Buffer|Stream} file - Archivo a subir
 * @param {string} fileName - Nombre del archivo
 * @param {string} mimeType - Tipo MIME del archivo
 * @param {string} tipoCampamento - INICIO, NAVIDAD, etc.
 * @returns {Object} { fileId, fileUrl, fileName }
 */
const subirCircularCampamento = async (file, fileName, mimeType, tipoCampamento) => {
  try {
    // Usar OAuth2 para uploads (tiene cuota de almacenamiento)
    const drive = await initializeDriveClientOAuth();

    // Obtener o crear carpeta del campamento
    const campamentoFolder = await getOrCreateCampamentoFolder(tipoCampamento);

    // Crear stream del archivo
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file);

    // Nombre final del archivo
    const nombreArchivo = `Circular_${tipoCampamento}_${fileName}`;

    const fileMetadata = {
      name: nombreArchivo,
      parents: [campamentoFolder.id]
    };

    const media = {
      mimeType: mimeType || 'application/pdf',
      body: bufferStream
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink'
    });

    console.log(`Circular subida: ${nombreArchivo} (ID: ${response.data.id})`);

    // Hacer el archivo publico para que las familias puedan descargarlo
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    return {
      fileId: response.data.id,
      fileUrl: response.data.webContentLink || `https://drive.google.com/uc?export=download&id=${response.data.id}`,
      fileName: nombreArchivo,
      webViewLink: response.data.webViewLink
    };
  } catch (error) {
    console.error('Error subiendo circular:', error.message);
    throw error;
  }
};

/**
 * Descarga una circular de campamento
 *
 * @param {string} fileId - ID del archivo en Drive
 * @returns {Object} { buffer, mimeType, fileName }
 */
const descargarCircular = async (fileId) => {
  try {
    const drive = await initializeDriveClient();

    // Obtener metadata del archivo
    const metadata = await drive.files.get({
      fileId,
      fields: 'name, mimeType'
    });

    // Descargar contenido
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, {
      responseType: 'arraybuffer'
    });

    return {
      buffer: Buffer.from(response.data),
      mimeType: metadata.data.mimeType,
      fileName: metadata.data.name
    };
  } catch (error) {
    console.error('Error descargando circular:', error.message);
    throw error;
  }
};

/**
 * Elimina la circular de un campamento
 *
 * @param {string} fileId - ID del archivo en Drive
 */
const eliminarCircular = async (fileId) => {
  try {
    const drive = await initializeDriveClient();
    await drive.files.delete({ fileId });
    console.log(`Circular eliminada: ${fileId}`);
    return true;
  } catch (error) {
    console.error('Error eliminando circular:', error.message);
    throw error;
  }
};

/**
 * Sube la circular firmada por la familia
 * IMPORTANTE: Usa OAuth2 en lugar de Service Account para tener cuota de almacenamiento
 *
 * @param {Buffer|Stream} file - Archivo a subir
 * @param {string} fileName - Nombre del archivo
 * @param {string} mimeType - Tipo MIME
 * @param {string} tipoCampamento - INICIO, NAVIDAD, etc.
 * @param {Object} datosEducando - { nombre, seccion }
 * @returns {Object} { fileId, fileUrl, fileName, emailSeccion }
 */
const subirCircularFirmada = async (file, fileName, mimeType, tipoCampamento, datosEducando) => {
  try {
    // Usar OAuth2 para uploads (tiene cuota de almacenamiento)
    const drive = await initializeDriveClientOAuth();

    // Obtener o crear carpeta del campamento (usa Service Account que tiene acceso de lectura)
    const campamentoFolder = await getOrCreateCampamentoFolder(tipoCampamento);

    // Crear subcarpeta "Circulares Firmadas" si no existe
    let firmadosFolder = await findFolderInParent('Circulares_Firmadas', campamentoFolder.id);
    if (!firmadosFolder) {
      const folderMetadata = {
        name: 'Circulares_Firmadas',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [campamentoFolder.id]
      };
      const folderResponse = await drive.files.create({
        resource: folderMetadata,
        fields: 'id, name'
      });
      firmadosFolder = folderResponse.data;
    }

    // Obtener o crear subcarpeta de la sección
    const seccionNormalizada = normalizarNombreSeccion(datosEducando.seccion);
    let seccionFolder = await findFolderInParent(seccionNormalizada, firmadosFolder.id);
    if (!seccionFolder) {
      const seccionFolderMetadata = {
        name: seccionNormalizada,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [firmadosFolder.id]
      };
      const seccionFolderResponse = await drive.files.create({
        resource: seccionFolderMetadata,
        fields: 'id, name'
      });
      seccionFolder = seccionFolderResponse.data;
      console.log(`Carpeta de sección creada: Circulares_Firmadas/${seccionNormalizada}`);
    }

    // Crear stream del archivo
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file);

    // Nombre del archivo: Seccion_NombreEducando_Circular_Firmada.pdf
    const nombreEducandoLimpio = datosEducando.nombre.replace(/\s+/g, '_');
    const seccionLimpia = datosEducando.seccion.replace(/\s+/g, '_');
    const nombreArchivo = `${seccionLimpia}_${nombreEducandoLimpio}_Circular_Firmada.pdf`;

    const fileMetadata = {
      name: nombreArchivo,
      parents: [seccionFolder.id]
    };

    const media = {
      mimeType: mimeType || 'application/pdf',
      body: bufferStream
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink'
    });

    console.log(`Circular firmada subida: ${nombreArchivo}`);

    // Obtener email de la seccion
    const emailSeccion = getEmailSeccion(datosEducando.seccion);

    return {
      fileId: response.data.id,
      fileUrl: response.data.webContentLink || `https://drive.google.com/uc?export=download&id=${response.data.id}`,
      fileName: nombreArchivo,
      webViewLink: response.data.webViewLink,
      emailSeccion
    };
  } catch (error) {
    console.error('Error subiendo circular firmada:', error.message);
    throw error;
  }
};

/**
 * Sube el justificante de pago de la familia
 * IMPORTANTE: Usa OAuth2 en lugar de Service Account para tener cuota de almacenamiento
 *
 * @param {Buffer|Stream} file - Archivo a subir
 * @param {string} fileName - Nombre del archivo
 * @param {string} mimeType - Tipo MIME
 * @param {string} tipoCampamento - INICIO, NAVIDAD, etc.
 * @param {Object} datosEducando - { nombre, seccion }
 * @returns {Object} { fileId, fileUrl, fileName }
 */
const subirJustificantePago = async (file, fileName, mimeType, tipoCampamento, datosEducando) => {
  try {
    // Usar OAuth2 para uploads (tiene cuota de almacenamiento)
    const drive = await initializeDriveClientOAuth();

    // Obtener o crear carpeta del campamento
    const campamentoFolder = await getOrCreateCampamentoFolder(tipoCampamento);

    // Crear subcarpeta "Justificantes_Pago" si no existe
    let justificantesFolder = await findFolderInParent('Justificantes_Pago', campamentoFolder.id);
    if (!justificantesFolder) {
      const folderMetadata = {
        name: 'Justificantes_Pago',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [campamentoFolder.id]
      };
      const folderResponse = await drive.files.create({
        resource: folderMetadata,
        fields: 'id, name'
      });
      justificantesFolder = folderResponse.data;
    }

    // Obtener o crear subcarpeta de la sección
    const seccionNormalizada = normalizarNombreSeccion(datosEducando.seccion);
    let seccionFolder = await findFolderInParent(seccionNormalizada, justificantesFolder.id);
    if (!seccionFolder) {
      const seccionFolderMetadata = {
        name: seccionNormalizada,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [justificantesFolder.id]
      };
      const seccionFolderResponse = await drive.files.create({
        resource: seccionFolderMetadata,
        fields: 'id, name'
      });
      seccionFolder = seccionFolderResponse.data;
      console.log(`Carpeta de sección creada: Justificantes_Pago/${seccionNormalizada}`);
    }

    // Crear stream del archivo
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file);

    // Extension del archivo original
    const extension = path.extname(fileName) || '.pdf';

    // Nombre del archivo: Seccion_NombreEducando_Justificante_Pago.pdf
    const nombreEducandoLimpio = datosEducando.nombre.replace(/\s+/g, '_');
    const seccionLimpia = datosEducando.seccion.replace(/\s+/g, '_');
    const nombreArchivo = `${seccionLimpia}_${nombreEducandoLimpio}_Justificante_Pago${extension}`;

    const fileMetadata = {
      name: nombreArchivo,
      parents: [seccionFolder.id]
    };

    const media = {
      mimeType: mimeType || 'application/pdf',
      body: bufferStream
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink'
    });

    console.log(`Justificante de pago subido: ${nombreArchivo}`);

    return {
      fileId: response.data.id,
      fileUrl: response.data.webContentLink || `https://drive.google.com/uc?export=download&id=${response.data.id}`,
      fileName: nombreArchivo,
      webViewLink: response.data.webViewLink,
      emailTesoreria: DRIVE_CONFIG.EMAIL_TESORERIA
    };
  } catch (error) {
    console.error('Error subiendo justificante de pago:', error.message);
    throw error;
  }
};

/**
 * Busca una carpeta dentro de otra
 */
const findFolderInParent = async (folderName, parentId) => {
  try {
    const drive = await initializeDriveClient();

    const response = await drive.files.list({
      q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    return response.data.files.length > 0 ? response.data.files[0] : null;
  } catch (error) {
    console.error('Error buscando carpeta:', error.message);
    return null;
  }
};

/**
 * Lista todos los archivos en una carpeta de campamento
 *
 * @param {string} tipoCampamento - INICIO, NAVIDAD, etc.
 * @param {string} subcarpeta - Opcional: 'Circulares_Firmadas', 'Justificantes_Pago'
 * @returns {Array} Lista de archivos
 */
const listarArchivosCampamento = async (tipoCampamento, subcarpeta = null) => {
  try {
    const drive = await initializeDriveClient();

    // Obtener carpeta del campamento
    const campamentoFolder = await getOrCreateCampamentoFolder(tipoCampamento);
    let parentId = campamentoFolder.id;

    // Si se especifica subcarpeta, buscarla
    if (subcarpeta) {
      const subFolder = await findFolderInParent(subcarpeta, campamentoFolder.id);
      if (subFolder) {
        parentId = subFolder.id;
      } else {
        return []; // Subcarpeta no existe
      }
    }

    const response = await drive.files.list({
      q: `'${parentId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, createdTime, webViewLink, webContentLink)',
      orderBy: 'createdTime desc'
    });

    return response.data.files.map(file => ({
      id: file.id,
      nombre: file.name,
      mimeType: file.mimeType,
      fechaCreacion: file.createdTime,
      urlDescarga: file.webContentLink || `https://drive.google.com/uc?export=download&id=${file.id}`,
      urlVista: file.webViewLink
    }));
  } catch (error) {
    console.error('Error listando archivos:', error.message);
    throw error;
  }
};

/**
 * Obtiene la URL de descarga publica de un archivo
 *
 * @param {string} fileId - ID del archivo
 * @returns {string} URL de descarga
 */
const getUrlDescarga = async (fileId) => {
  try {
    const drive = await initializeDriveClient();

    const response = await drive.files.get({
      fileId,
      fields: 'webContentLink, webViewLink'
    });

    return response.data.webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`;
  } catch (error) {
    console.error('Error obteniendo URL de descarga:', error.message);
    throw error;
  }
};

module.exports = {
  subirCircularCampamento,
  descargarCircular,
  eliminarCircular,
  subirCircularFirmada,
  subirJustificantePago,
  listarArchivosCampamento,
  getUrlDescarga,
  findFolderInParent
};
