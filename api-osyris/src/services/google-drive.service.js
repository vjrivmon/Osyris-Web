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
 * Crea una carpeta para un educando nuevo en Google Drive
 * Estructura: Sección > Año > "Apellidos, Nombre (ID)"
 *
 * @param {Object} educando - Objeto educando con nombre, apellidos, fecha_nacimiento, seccion_id, id
 * @returns {Object|null} - { id, name } de la carpeta creada o null si falla
 */
const createEducandoFolder = async (educando) => {
  try {
    // Validar que tenemos los datos necesarios
    if (!educando || !educando.id || !educando.nombre || !educando.apellidos) {
      console.log('⚠️ [createEducandoFolder] Datos de educando incompletos, no se puede crear carpeta');
      return null;
    }

    // Obtener el slug de la sección
    const seccionSlug = DRIVE_CONFIG.SECCIONES_ASISTENCIA.find(s => s.id === educando.seccion_id)?.slug;
    if (!seccionSlug) {
      console.log(`⚠️ [createEducandoFolder] Sección no encontrada para id=${educando.seccion_id}`);
      return null;
    }

    // Obtener el ID de la carpeta de la sección
    const seccionFolderId = getSeccionFolderId(seccionSlug);
    if (!seccionFolderId) {
      console.log(`⚠️ [createEducandoFolder] Variable GOOGLE_DRIVE_${seccionSlug.toUpperCase()}_FOLDER_ID no configurada`);
      return null;
    }

    const drive = await initializeDriveClient();

    // Calcular año de nacimiento
    const fechaNacimiento = new Date(educando.fecha_nacimiento);
    const anioNacimiento = fechaNacimiento.getFullYear();

    // Buscar o crear carpeta del año dentro de la sección
    let anioFolder = await findFolderByName(anioNacimiento.toString(), seccionFolderId);
    if (!anioFolder) {
      console.log(`📁 Creando carpeta de año ${anioNacimiento} en ${seccionSlug}...`);
      anioFolder = await createFolder(anioNacimiento.toString(), seccionFolderId);
    }

    // Formato del nombre de carpeta: "Apellidos, Nombre (ID)"
    const folderName = `${educando.apellidos}, ${educando.nombre} (${educando.id})`;

    // Verificar si ya existe una carpeta con ese nombre
    const existingFolder = await findFolderByName(folderName, anioFolder.id);
    if (existingFolder) {
      console.log(`📂 Carpeta ya existe para educando ${educando.id}: ${existingFolder.id}`);
      return existingFolder;
    }

    // Crear la carpeta del educando
    const educandoFolder = await createFolder(folderName, anioFolder.id);
    console.log(`✅ Carpeta creada para educando ${educando.id}: ${educandoFolder.id}`);

    return educandoFolder;
  } catch (error) {
    console.error(`❌ [createEducandoFolder] Error creando carpeta para educando ${educando?.id}:`, error.message);
    return null;
  }
};

/**
 * Obtiene o crea la carpeta de un educando
 * Estructura: Sección > Año > Nombre Educando
 *
 * NUEVO: Si el educando tiene drive_folder_id en BD, lo usa directamente.
 * Esto elimina la necesidad de búsquedas por nombre (más robusto).
 */
const getOrCreateEducandoFolder = async (seccionSlug, anioNacimiento, nombreEducando, educandoId = null) => {
  const { query } = require('../config/db.config');

  // PASO 0: Si tenemos educandoId, verificar si ya tiene folder_id en BD
  if (educandoId) {
    try {
      const result = await query(
        'SELECT drive_folder_id FROM educandos WHERE id = $1',
        [educandoId]
      );
      // query() devuelve rows directamente para SELECT
      if (result[0]?.drive_folder_id) {
        const folderId = result[0].drive_folder_id;
        console.log(`✅ Usando drive_folder_id de BD: ${folderId} (sin búsqueda)`);
        return { id: folderId, name: nombreEducando };
      }
    } catch (err) {
      console.log(`⚠️ Error consultando BD: ${err.message}, continuando con búsqueda...`);
    }
  }

  // 1. Obtener ID de carpeta de sección
  const seccionFolderId = getSeccionFolderId(seccionSlug);
  if (!seccionFolderId) {
    throw new Error(`No se encontró configuración para la sección: ${seccionSlug}`);
  }

  const drive = await initializeDriveClient();

  // 2. Buscar carpeta del educando usando búsqueda flexible
  // Primero intentar con nombre exacto, luego con contains si no encuentra
  console.log(`🔍 Buscando carpeta para: "${nombreEducando}" en sección ${seccionSlug}`);

  // Normalizar nombre para búsqueda (quitar espacios extras, normalizar acentos)
  const nombreNormalizado = nombreEducando.trim().replace(/\s+/g, ' ');

  // Búsqueda por nombre exacto
  let searchResponse = await drive.files.list({
    q: `name='${nombreNormalizado}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name, parents)',
    spaces: 'drive'
  });

  console.log(`🔍 Búsqueda exacta encontró: ${searchResponse.data.files.length} carpetas`);

  // Si no encuentra o encuentra carpeta vacía, intentar otras variaciones
  // Variación 1: Nombre sin espacios
  const nombreSinEspacios = nombreNormalizado.replace(/\s+/g, '');
  if (nombreSinEspacios !== nombreNormalizado) {
    console.log(`🔍 Intentando búsqueda sin espacios: "${nombreSinEspacios}"`);
    const sinEspaciosResponse = await drive.files.list({
      q: `name='${nombreSinEspacios}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, parents)',
      spaces: 'drive'
    });
    console.log(`🔍 Búsqueda sin espacios encontró: ${sinEspaciosResponse.data.files.length} carpetas`);

    // Añadir a los resultados
    for (const f of sinEspaciosResponse.data.files) {
      if (!searchResponse.data.files.find(existing => existing.id === f.id)) {
        searchResponse.data.files.push(f);
      }
    }
  }

  // Variación 2: Búsqueda parcial con primer nombre y apellido
  const partes = nombreNormalizado.split(' ');
  const primerNombre = partes[0];
  const primerApellido = partes.length > 1 ? partes[1] : '';
  const segundoApellido = partes.length > 2 ? partes[2] : '';

  if (primerNombre && primerApellido) {
    console.log(`🔍 Intentando búsqueda parcial: "${primerNombre}" y "${primerApellido}"`);
    const parcialResponse = await drive.files.list({
      q: `name contains '${primerNombre}' and name contains '${primerApellido}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, parents)',
      spaces: 'drive'
    });
    console.log(`🔍 Búsqueda parcial encontró: ${parcialResponse.data.files.length} carpetas`);

    // Añadir a los resultados
    for (const f of parcialResponse.data.files) {
      if (!searchResponse.data.files.find(existing => existing.id === f.id)) {
        searchResponse.data.files.push(f);
      }
    }
  }

  // Variación 3: Buscar SOLO por apellido (en caso de formato diferente)
  if (primerApellido) {
    console.log(`🔍 Intentando búsqueda solo por apellido: "${primerApellido}"`);
    const apellidoResponse = await drive.files.list({
      q: `name contains '${primerApellido}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, parents)',
      spaces: 'drive'
    });
    console.log(`🔍 Búsqueda por apellido encontró: ${apellidoResponse.data.files.length} carpetas`);

    // Mostrar TODAS las carpetas encontradas para debug
    for (const f of apellidoResponse.data.files) {
      console.log(`   📁 Carpeta encontrada: "${f.name}"`);
      if (!searchResponse.data.files.find(existing => existing.id === f.id)) {
        searchResponse.data.files.push(f);
      }
    }
  }

  // Variación 4: Formato "Apellido Apellido Nombre" o "Apellidos, Nombre"
  if (primerApellido && segundoApellido && primerNombre) {
    const formatoInverso = `${primerApellido} ${segundoApellido} ${primerNombre}`;
    console.log(`🔍 Intentando formato inverso: "${formatoInverso}"`);
    const inversoResponse = await drive.files.list({
      q: `name='${formatoInverso}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, parents)',
      spaces: 'drive'
    });
    console.log(`🔍 Búsqueda formato inverso encontró: ${inversoResponse.data.files.length} carpetas`);

    for (const f of inversoResponse.data.files) {
      if (!searchResponse.data.files.find(existing => existing.id === f.id)) {
        searchResponse.data.files.push(f);
      }
    }
  }

  console.log(`🔍 Total carpetas a verificar: ${searchResponse.data.files.length}`);

  // Obtener IDs de TODAS las secciones para búsqueda flexible
  const todasLasSecciones = Object.values(DRIVE_CONFIG.SECCIONES_FOLDER_IDS).filter(id => id);
  const seccionesSet = new Set(todasLasSecciones);

  // Verificar carpetas - primero en sección esperada, luego en cualquier sección
  const carpetasEnSeccionEsperada = [];
  const carpetasEnOtrasSecciones = [];

  for (const folder of searchResponse.data.files) {
    console.log(`🔍 Verificando carpeta: "${folder.name}" (ID: ${folder.id})`);
    if (folder.parents && folder.parents.length > 0) {
      try {
        // Obtener la carpeta padre (año)
        const parentResponse = await drive.files.get({
          fileId: folder.parents[0],
          fields: 'id, name, parents'
        });

        console.log(`🔍 Carpeta padre (año): "${parentResponse.data.name}"`);

        // Contar archivos en esta carpeta
        const filesResponse = await drive.files.list({
          q: `'${folder.id}' in parents and trashed=false`,
          fields: 'files(id)',
          spaces: 'drive'
        });
        const numArchivos = filesResponse.data.files.length;

        // Verificar si el abuelo es alguna carpeta de sección
        if (parentResponse.data.parents && parentResponse.data.parents.length > 0) {
          const abueloId = parentResponse.data.parents[0];

          if (abueloId === seccionFolderId) {
            // Está en la sección esperada
            console.log(`📂 Carpeta "${folder.name}" en sección esperada, ${parentResponse.data.name}: ${numArchivos} archivos`);
            carpetasEnSeccionEsperada.push({
              folder,
              anio: parentResponse.data.name,
              numArchivos,
              seccion: 'esperada'
            });
          } else if (seccionesSet.has(abueloId)) {
            // Está en otra sección (documentos subidos a carpeta incorrecta)
            console.log(`📂 Carpeta "${folder.name}" en OTRA sección, ${parentResponse.data.name}: ${numArchivos} archivos`);
            carpetasEnOtrasSecciones.push({
              folder,
              anio: parentResponse.data.name,
              numArchivos,
              seccion: 'otra'
            });
          }
        }
      } catch (err) {
        console.log(`⚠️ Error verificando carpeta padre: ${err.message}`);
      }
    }
  }

  // Prioridad: carpetas con archivos en sección esperada > carpetas con archivos en otras secciones
  // Elegir la que tenga más archivos
  let carpetasValidas = carpetasEnSeccionEsperada.filter(c => c.numArchivos > 0);

  if (carpetasValidas.length === 0) {
    // No hay carpetas con archivos en sección esperada, buscar en otras
    carpetasValidas = carpetasEnOtrasSecciones.filter(c => c.numArchivos > 0);
    if (carpetasValidas.length > 0) {
      console.log(`⚠️ Documentos encontrados en sección diferente a la esperada`);
    }
  }

  // Si aún no hay, usar carpetas vacías de sección esperada
  if (carpetasValidas.length === 0) {
    carpetasValidas = carpetasEnSeccionEsperada;
  }

  // Si hay carpetas válidas, preferir la que tiene más archivos
  if (carpetasValidas.length > 0) {
    // Ordenar por número de archivos descendente
    carpetasValidas.sort((a, b) => b.numArchivos - a.numArchivos);
    const mejorCarpeta = carpetasValidas[0];
    console.log(`✅ Carpeta seleccionada: "${mejorCarpeta.folder.name}" en ${mejorCarpeta.anio} (${mejorCarpeta.numArchivos} archivos)`);

    // AUTO-GUARDAR: Si encontramos carpeta y tenemos educandoId, guardar en BD para futuro
    if (educandoId && mejorCarpeta.folder.id) {
      try {
        await query(
          'UPDATE educandos SET drive_folder_id = $1 WHERE id = $2 AND drive_folder_id IS NULL',
          [mejorCarpeta.folder.id, educandoId]
        );
        console.log(`💾 Guardado drive_folder_id en BD para futuras consultas`);
      } catch (err) {
        console.log(`⚠️ Error guardando folder_id: ${err.message}`);
      }
    }

    return mejorCarpeta.folder;
  }

  // 3. Si no se encuentra, crear en la carpeta del año de nacimiento
  console.log(`📁 No se encontró carpeta existente, creando nueva...`);
  let anioFolder = await findFolderByName(anioNacimiento.toString(), seccionFolderId);
  if (!anioFolder) {
    anioFolder = await createFolder(anioNacimiento.toString(), seccionFolderId);
  }

  const educandoFolder = await createFolder(nombreNormalizado, anioFolder.id);
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
  console.log(`📋 [listPlantillas] Encontrados ${response.data.files.length} archivos en carpeta de plantillas`);

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
          console.log(`   ✅ "${file.name}" → tipo: ${tipo} (prefijo: ${prefijo})`);
          break;
        }
      }
    }

    if (!tipoDocumento) {
      console.log(`   ⚠️ "${file.name}" → No coincide con ningún tipo de documento`);
    }

    return {
      ...file,
      tipoDocumento,
      config: tipoDocumento ? DRIVE_CONFIG.TIPOS_DOCUMENTO[tipoDocumento] : null
    };
  });

  // Log resumen
  const plantillasConTipo = plantillas.filter(p => p.tipoDocumento !== null);
  console.log(`📋 [listPlantillas] ${plantillasConTipo.length} de ${plantillas.length} plantillas tienen tipo asignado`);

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
 * Obtiene o crea la carpeta de "Pendientes de Revisión"
 * Esta carpeta almacena documentos temporalmente hasta que el scouter los apruebe
 */
const getOrCreatePendientesFolder = async () => {
  const drive = await initializeDriveClient();

  // Si ya tenemos el ID configurado, verificar que existe
  if (DRIVE_CONFIG.PENDIENTES_FOLDER_ID) {
    try {
      const response = await drive.files.get({
        fileId: DRIVE_CONFIG.PENDIENTES_FOLDER_ID,
        fields: 'id, name'
      });
      console.log(`✅ Usando carpeta pendientes existente: ${response.data.name}`);
      return response.data;
    } catch (error) {
      console.log(`⚠️ Carpeta pendientes configurada no existe, creando nueva...`);
    }
  }

  // Buscar si ya existe la carpeta
  const folderName = DRIVE_CONFIG.PENDIENTES_FOLDER_NAME;
  const existingFolder = await findFolderByName(folderName, DRIVE_CONFIG.ROOT_FOLDER_ID);

  if (existingFolder) {
    console.log(`✅ Carpeta pendientes encontrada: ${existingFolder.id}`);
    return existingFolder;
  }

  // Crear la carpeta si no existe
  const newFolder = await createFolder(folderName, DRIVE_CONFIG.ROOT_FOLDER_ID);
  console.log(`📁 Carpeta pendientes creada: ${newFolder.id}`);

  // IMPORTANTE: Mostrar mensaje para que el admin guarde el ID
  console.log(`\n⚠️ IMPORTANTE: Añade este ID a tu .env:`);
  console.log(`   GOOGLE_DRIVE_PENDIENTES_FOLDER_ID=${newFolder.id}\n`);

  return newFolder;
};

/**
 * Mueve un archivo de una carpeta a otra en Google Drive
 * Usa OAuth2 ya que el archivo fue subido con OAuth
 */
const moveFileToFolder = async (fileId, newFolderId) => {
  const drive = await getOAuthDriveClient();

  // Obtener el archivo para conocer sus padres actuales
  const file = await drive.files.get({
    fileId: fileId,
    fields: 'id, name, parents'
  });

  const previousParents = file.data.parents ? file.data.parents.join(',') : '';

  // Mover el archivo
  const response = await drive.files.update({
    fileId: fileId,
    addParents: newFolderId,
    removeParents: previousParents,
    fields: 'id, name, parents, webViewLink'
  });

  console.log(`📦 Archivo movido: ${file.data.name} → carpeta ${newFolderId}`);
  return response.data;
};

/**
 * Sube un documento a la carpeta de PENDIENTES (no a la carpeta definitiva)
 * El documento se moverá a la carpeta del educando cuando sea aprobado
 */
const uploadDocumentToPendientes = async (fileName, fileBuffer, mimeType, metadata = {}) => {
  // Obtener carpeta de pendientes
  const pendientesFolder = await getOrCreatePendientesFolder();

  // Usar OAuth2 para uploads
  const drive = await getOAuthDriveClient();

  // Crear stream desde buffer
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileBuffer);

  // Añadir metadata al nombre para identificación (educandoId_tipo_fecha)
  const timestampedFileName = fileName;

  const fileMetadata = {
    name: timestampedFileName,
    parents: [pendientesFolder.id],
    // Añadir propiedades personalizadas para rastreo
    appProperties: {
      educandoId: metadata.educandoId?.toString() || '',
      tipoDocumento: metadata.tipoDocumento || '',
      familiarId: metadata.familiarId?.toString() || '',
      uploadDate: new Date().toISOString()
    }
  };

  const media = {
    mimeType: mimeType,
    body: bufferStream
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink, size, parents'
  });

  console.log(`📄 Archivo subido a PENDIENTES: ${fileName} (ID: ${response.data.id})`);
  return {
    ...response.data,
    isPending: true,
    pendientesFolderId: pendientesFolder.id
  };
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
 * Detecta el tipo de documento basándose en el nombre del archivo
 * NUEVO FLUJO: Primero prefijos (ordenados por longitud), luego palabras clave
 * @returns {string|null} - El tipo de documento o null si no se identifica
 */
const detectarTipoDocumento = (nombreArchivo) => {
  const nombreNormalizado = nombreArchivo.toUpperCase().replace(/[_\-\s\.]+/g, '');
  const nombrePartes = nombreArchivo.toUpperCase();

  console.log(`🔍 Analizando archivo: "${nombreArchivo}"`);

  // FASE 1: Recolectar TODOS los prefijos de todos los tipos
  // y ordenarlos por longitud (más específicos primero)
  const todosPrefijos = [];

  for (const [tipo, config] of Object.entries(DRIVE_CONFIG.TIPOS_DOCUMENTO)) {
    const prefijo = config.prefijo.toUpperCase();
    const prefijosAlternativos = config.prefijosAlternativos || [];

    // Agregar prefijos alternativos
    for (const altPrefijo of prefijosAlternativos) {
      todosPrefijos.push({
        prefijo: altPrefijo.toUpperCase(),
        tipo,
        esAlternativo: true,
        nombreArchivoConfig: config.nombreArchivo?.toUpperCase()
      });
    }

    // Agregar prefijo principal
    todosPrefijos.push({
      prefijo,
      tipo,
      esAlternativo: false,
      nombreArchivoConfig: config.nombreArchivo?.toUpperCase()
    });
  }

  // Ordenar por longitud del prefijo (más largos primero)
  todosPrefijos.sort((a, b) => b.prefijo.length - a.prefijo.length);

  // FASE 1: Detección por PREFIJO (ordenados por especificidad)
  for (const { prefijo, tipo, esAlternativo, nombreArchivoConfig } of todosPrefijos) {
    if (nombrePartes.startsWith(`${prefijo}_`) ||
        nombrePartes.startsWith(`${prefijo}-`) ||
        nombrePartes.startsWith(`${prefijo} `) ||
        nombrePartes.startsWith(`${prefijo}.`)) {
      // Para prefijos compartidos (A02), necesitamos verificar nombreArchivo
      if (prefijo === 'A02' && !esAlternativo) {
        if (nombreArchivoConfig && nombrePartes.includes(nombreArchivoConfig)) {
          console.log(`   ✅ Detectado por prefijo compartido "${prefijo}" + "${nombreArchivoConfig}" → ${tipo}`);
          return tipo;
        }
      } else {
        const tipoPrefijo = esAlternativo ? 'alternativo' : 'principal';
        console.log(`   ✅ Detectado por prefijo ${tipoPrefijo} "${prefijo}" → ${tipo}`);
        return tipo;
      }
    }
  }

  // FASE 2: Detección por PALABRAS CLAVE (para archivos legacy sin prefijo)
  const candidatos = [];

  for (const [tipo, config] of Object.entries(DRIVE_CONFIG.TIPOS_DOCUMENTO)) {
    const palabrasClave = config.palabrasClave || [];
    const exclusiones = config.exclusiones || [];

    // Verificar si tiene palabras clave
    let coincidencias = 0;
    let palabraEncontrada = null;

    for (const palabra of palabrasClave) {
      if (nombreNormalizado.includes(palabra.toUpperCase().replace(/\s+/g, ''))) {
        coincidencias++;
        palabraEncontrada = palabra;
      }
    }

    // Si tiene coincidencias, verificar exclusiones
    if (coincidencias > 0) {
      let tieneExclusion = false;
      for (const exclusion of exclusiones) {
        if (nombreNormalizado.includes(exclusion.toUpperCase().replace(/\s+/g, ''))) {
          tieneExclusion = true;
          console.log(`   ⚠️ Excluido de ${tipo} por palabra "${exclusion}"`);
          break;
        }
      }

      if (!tieneExclusion) {
        candidatos.push({ tipo, coincidencias, palabraEncontrada });
      }
    }
  }

  // Elegir el candidato con más coincidencias
  if (candidatos.length > 0) {
    candidatos.sort((a, b) => b.coincidencias - a.coincidencias);
    const mejor = candidatos[0];
    console.log(`   ✅ Detectado por palabra clave "${mejor.palabraEncontrada}" → ${mejor.tipo}`);
    return mejor.tipo;
  }

  console.log(`   ❌ No se pudo identificar el tipo de documento`);
  return null;
};

/**
 * Verifica el estado de documentos de un educando
 * NUEVO FLUJO INTELIGENTE:
 * 1. Lista todos los archivos de la carpeta
 * 2. Detecta qué tipo de documento es cada archivo (prefijos → palabras clave)
 * 3. Mapea archivos a tipos de documentos
 * 4. Determina estado de cada tipo requerido
 */
const checkDocumentStatus = async (educandoFolderId, nombreEducando, edadEducando = 0, educandoId = null) => {
  const documentosEnDrive = await listEducandoDocuments(educandoFolderId);

  console.log(`\n📋 Verificando documentos de "${nombreEducando}" (${documentosEnDrive.length} archivos en Drive)`);

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

  // PASO 1: Detectar tipo de cada archivo en Drive
  const archivosClasificados = {};

  for (const doc of documentosEnDrive) {
    const tipoDetectado = detectarTipoDocumento(doc.name);
    if (tipoDetectado) {
      // Si ya existe un archivo para este tipo, mantener el más reciente
      if (!archivosClasificados[tipoDetectado] ||
          new Date(doc.modifiedTime) > new Date(archivosClasificados[tipoDetectado].modifiedTime)) {
        archivosClasificados[tipoDetectado] = doc;
      }
    }
  }

  console.log(`📊 Archivos clasificados: ${Object.keys(archivosClasificados).join(', ') || 'ninguno'}`);

  // PASO 2: Construir estado para cada tipo de documento requerido
  const status = {};

  for (const [tipo, config] of Object.entries(DRIVE_CONFIG.TIPOS_DOCUMENTO)) {
    // Filtrar documentos que requieren edad mínima
    if (config.edadMinima && edadEducando < config.edadMinima) {
      continue;
    }

    const encontrado = archivosClasificados[tipo] || null;

    // Determinar estado final considerando BD
    let estadoFinal = 'faltante';

    // Buscar en BD el documento por tipo (independiente de si existe en Drive)
    const docBD = documentosBD.find(d => d.tipo_documento === tipo);

    if (docBD && docBD.google_drive_file_id) {
      // CASO 1: Documento PENDIENTE DE REVISIÓN
      // El archivo está en carpeta PENDIENTES, no en la del educando
      // Confiamos en la BD sin verificar Drive (el archivo está en otra carpeta)
      if (docBD.estado_revision === 'pendiente' || docBD.estado === 'pendiente_revision') {
        estadoFinal = 'pendiente_revision';
        console.log(`📋 Documento ${tipo}: En revisión (archivo en PENDIENTES)`);
      }
      // CASO 2: Documento APROBADO/VIGENTE
      // El archivo debería estar en la carpeta del educando - verificar que existe
      else if (docBD.estado_revision === 'aprobado' || docBD.estado === 'vigente') {
        const fileIdCoincide = encontrado && encontrado.id === docBD.google_drive_file_id;
        if (fileIdCoincide) {
          estadoFinal = 'subido';
        } else if (encontrado) {
          // NUEVO: El archivo existe en Drive con el tipo correcto, aunque el file_id difiera
          // Esto ocurre cuando el archivo fue movido/reemplazado manualmente
          // Aceptar el archivo existente como válido
          console.log(`ℹ️ Documento ${tipo}: file_id difiere (BD: ${docBD.google_drive_file_id}, Drive: ${encontrado.id}) - aceptando archivo existente`);
          estadoFinal = 'subido';
        } else {
          // El archivo aprobado fue eliminado de Drive y no hay reemplazo
          console.log(`⚠️ Documento ${tipo}: BD dice aprobado con file_id=${docBD.google_drive_file_id} pero en Drive no existe`);
          estadoFinal = 'faltante';
        }
      }
      // CASO 3: Documento RECHAZADO
      else if (docBD.estado_revision === 'rechazado' || docBD.estado === 'rechazado') {
        estadoFinal = 'rechazado';
      }
      // CASO 4: Otro estado en BD
      else {
        estadoFinal = encontrado ? 'subido' : 'faltante';
      }
    } else if (encontrado) {
      // Archivo existe en Drive pero NO tiene registro en BD (archivo antiguo/manual)
      estadoFinal = 'subido';
    }
    // Si no hay nada en BD ni en Drive, estadoFinal permanece como 'faltante'

    status[tipo] = {
      tipo,
      nombre: config.nombre,
      prefijo: config.prefijo,
      obligatorio: config.obligatorio,
      tienePlantilla: !!config.plantilla,
      plantillaNombre: config.plantilla,
      estado: estadoFinal,
      archivo: encontrado
    };
  }

  // Log resumen
  const completos = Object.values(status).filter(s => s.estado === 'subido').length;
  const total = Object.keys(status).length;
  console.log(`✅ Resultado: ${completos}/${total} documentos completos\n`);

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
    // IMPORTANTE: Pasar educandoId para usar drive_folder_id de BD si existe
    const folder = await getOrCreateEducandoFolder(seccionSlug, anioNacimiento, nombreEducando, educandoId);
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
 * Descarga el contenido de un archivo para previsualización
 * Intenta primero con OAuth (para archivos subidos por usuarios)
 * Si falla, intenta con Service Account (para archivos legacy)
 */
const downloadFileContent = async (fileId) => {
  // Primero intentar con OAuth (la mayoría de archivos son subidos con OAuth)
  try {
    if (hasValidTokens()) {
      const oauthDrive = await getOAuthDriveClient();

      // Obtener metadata del archivo
      const fileInfo = await oauthDrive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size'
      });

      // Descargar el contenido como buffer
      const response = await oauthDrive.files.get({
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
    }
  } catch (oauthError) {
    console.log('OAuth download falló, intentando Service Account:', oauthError.message);
  }

  // Fallback: intentar con Service Account (archivos legacy o compartidos)
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

/**
 * Lista las circulares disponibles de un tipo de campamento
 * @param {string} tipoCampamento - Tipo: INICIO, NAVIDAD, ANIVERSARIO, PASCUA, VERANO
 * @returns Lista de archivos (circulares) en la subcarpeta
 */
const listCircularesCampamento = async (tipoCampamento) => {
  if (!DRIVE_CONFIG.CAMPAMENTOS_FOLDER_ID) {
    throw new Error('CAMPAMENTOS_FOLDER_ID no configurado');
  }

  const drive = await initializeDriveClient();
  const tipo = tipoCampamento?.toUpperCase() || 'NAVIDAD';

  // Primero buscar la subcarpeta del tipo de campamento
  const subfolderResponse = await drive.files.list({
    q: `'${DRIVE_CONFIG.CAMPAMENTOS_FOLDER_ID}' in parents and name='${tipo}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)'
  });

  let folderId = DRIVE_CONFIG.CAMPAMENTOS_FOLDER_ID;

  // Si existe la subcarpeta, usar esa
  if (subfolderResponse.data.files && subfolderResponse.data.files.length > 0) {
    folderId = subfolderResponse.data.files[0].id;
  }

  // Listar archivos PDF en la carpeta (circulares)
  const response = await drive.files.list({
    q: `'${folderId}' in parents and (mimeType='application/pdf' or name contains 'Circular') and trashed=false`,
    fields: 'files(id, name, mimeType, size, webViewLink, modifiedTime)',
    orderBy: 'modifiedTime desc'
  });

  // Mapear archivos con información adicional
  const circulares = response.data.files.map(file => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: file.size,
    webViewLink: file.webViewLink,
    modifiedTime: file.modifiedTime,
    tipoCampamento: tipo
  }));

  return circulares;
};

/**
 * Mueve la carpeta de un educando de una sección a otra
 * Estructura: Sección > Año > Nombre Educando
 *
 * @param {string} educandoFolderId - ID de la carpeta del educando en Drive
 * @param {string} newSeccionSlug - Slug de la nueva sección (ej: 'pioneros', 'tropa')
 * @param {number} anioNacimiento - Año de nacimiento del educando (para la subcarpeta)
 * @returns {Object} - { success: boolean, newParentId: string }
 */
const moveEducandoFolderToSection = async (educandoFolderId, newSeccionSlug, anioNacimiento) => {
  console.log(`📦 Moviendo carpeta ${educandoFolderId} a sección ${newSeccionSlug}/${anioNacimiento}`);

  // 1. Obtener ID de la carpeta de la nueva sección
  const newSeccionFolderId = getSeccionFolderId(newSeccionSlug);
  if (!newSeccionFolderId) {
    throw new Error(`No se encontró configuración para la sección: ${newSeccionSlug}`);
  }

  const drive = await getOAuthDriveClient();

  // 2. Buscar o crear la carpeta del año dentro de la nueva sección
  let anioFolder = await findFolderByName(anioNacimiento.toString(), newSeccionFolderId);
  if (!anioFolder) {
    console.log(`📁 Creando carpeta de año ${anioNacimiento} en ${newSeccionSlug}...`);
    anioFolder = await createFolder(anioNacimiento.toString(), newSeccionFolderId);
  }

  // 3. Obtener los padres actuales de la carpeta del educando
  const file = await drive.files.get({
    fileId: educandoFolderId,
    fields: 'id, name, parents'
  });

  const previousParents = file.data.parents ? file.data.parents.join(',') : '';
  console.log(`📂 Carpeta actual: "${file.data.name}", padre(s): ${previousParents}`);

  // 4. Mover la carpeta del educando a la nueva ubicación
  const response = await drive.files.update({
    fileId: educandoFolderId,
    addParents: anioFolder.id,
    removeParents: previousParents,
    fields: 'id, name, parents'
  });

  console.log(`✅ Carpeta movida exitosamente a ${newSeccionSlug}/${anioNacimiento}`);

  return {
    success: true,
    newParentId: anioFolder.id,
    folderName: response.data.name,
    newParents: response.data.parents
  };
};

module.exports = {
  initializeDriveClient,
  findFolderByName,
  createFolder,
  createEducandoFolder,
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
  detectarTipoDocumento,  // Exportado para uso en controladores
  // Funciones para flujo de aprobación con carpeta Pendientes
  getOrCreatePendientesFolder,
  moveFileToFolder,
  uploadDocumentToPendientes,
  listCircularesCampamento,
  // Función para cambio de sección
  moveEducandoFolderToSection,
  DRIVE_CONFIG
};
