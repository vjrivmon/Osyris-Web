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
 * Detecta el tipo de documento basándose en el nombre del archivo
 * NUEVO FLUJO: Primero prefijos, luego palabras clave
 * @returns {string|null} - El tipo de documento o null si no se identifica
 */
const detectarTipoDocumento = (nombreArchivo) => {
  const nombreNormalizado = nombreArchivo.toUpperCase().replace(/[_\-\s\.]+/g, '');
  const nombrePartes = nombreArchivo.toUpperCase();

  console.log(`🔍 Analizando archivo: "${nombreArchivo}"`);

  // FASE 1: Detección por PREFIJO (máxima prioridad)
  for (const [tipo, config] of Object.entries(DRIVE_CONFIG.TIPOS_DOCUMENTO)) {
    const prefijo = config.prefijo.toUpperCase();
    const prefijosAlternativos = config.prefijosAlternativos || [];

    // Verificar prefijos alternativos primero
    for (const altPrefijo of prefijosAlternativos) {
      const altPrefijoUpper = altPrefijo.toUpperCase();
      if (nombrePartes.startsWith(`${altPrefijoUpper}_`) ||
          nombrePartes.startsWith(`${altPrefijoUpper}-`) ||
          nombrePartes.startsWith(`${altPrefijoUpper} `) ||
          nombrePartes.startsWith(`${altPrefijoUpper}.`)) {
        console.log(`   ✅ Detectado por prefijo alternativo "${altPrefijo}" → ${tipo}`);
        return tipo;
      }
    }

    // Verificar prefijo principal
    if (nombrePartes.startsWith(`${prefijo}_`) ||
        nombrePartes.startsWith(`${prefijo}-`) ||
        nombrePartes.startsWith(`${prefijo} `)) {
      // Para prefijos compartidos (A02), necesitamos verificar nombreArchivo
      if (prefijo === 'A02') {
        const nombreArchivoConfig = config.nombreArchivo?.toUpperCase();
        if (nombreArchivoConfig && nombrePartes.includes(nombreArchivoConfig)) {
          console.log(`   ✅ Detectado por prefijo compartido "${prefijo}" + "${nombreArchivoConfig}" → ${tipo}`);
          return tipo;
        }
      } else {
        console.log(`   ✅ Detectado por prefijo principal "${prefijo}" → ${tipo}`);
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
    if (encontrado) {
      // Buscar en BD si este documento tiene estado pendiente_revision
      const docBD = documentosBD.find(d =>
        d.google_drive_file_id === encontrado.id ||
        d.tipo_documento === tipo
      );

      if (docBD) {
        if (docBD.estado_revision === 'pendiente' || docBD.estado === 'pendiente_revision') {
          estadoFinal = 'pendiente_revision';
        } else if (docBD.estado_revision === 'aprobado' || docBD.estado === 'vigente') {
          estadoFinal = 'subido';
        } else if (docBD.estado_revision === 'rechazado' || docBD.estado === 'rechazado') {
          estadoFinal = 'rechazado';
        } else {
          estadoFinal = 'subido';
        }
      } else {
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
