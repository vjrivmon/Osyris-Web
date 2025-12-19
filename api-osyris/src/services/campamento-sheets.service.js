/**
 * Servicio de Google Sheets para gestion de inscripciones a campamentos
 *
 * Estructura del Sheet:
 * Columnas: Marca temporal, Email, Nombre Familiar, Telefono, Nombre Asistente,
 *           Seccion, Asistira, Alergias, Dieta, Circular Subida, Justificante Subido, Estado
 */

const { google } = require('googleapis');
const fs = require('fs');
const { DRIVE_CONFIG } = require('../config/google-drive.config');

let sheetsClient = null;
let driveClient = null;

/**
 * Columnas del Google Sheet de inscripciones
 */
const COLUMNAS_INSCRIPCION = [
  'Marca temporal',
  'Correo electronico',
  'Nombre Madre/Padre/Tutor',
  'Telefono',
  'Nombre del Asistente',
  'Seccion',
  'Asistira',
  'Alergias e intolerancias',
  'Dieta especial',
  'Circular subida',
  'Justificante subido',
  'Estado'
];

/**
 * Inicializa el cliente de Google Sheets con Service Account
 */
const initializeSheetsClient = async () => {
  if (sheetsClient) return sheetsClient;

  try {
    if (!fs.existsSync(DRIVE_CONFIG.CREDENTIALS_PATH)) {
      throw new Error(`Archivo de credenciales no encontrado: ${DRIVE_CONFIG.CREDENTIALS_PATH}`);
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: DRIVE_CONFIG.CREDENTIALS_PATH,
      scopes: DRIVE_CONFIG.SCOPES
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('Google Sheets client inicializado correctamente');
    return sheetsClient;
  } catch (error) {
    console.error('Error inicializando Google Sheets client:', error.message);
    throw error;
  }
};

/**
 * Inicializa el cliente de Google Drive
 */
const initializeDriveClient = async () => {
  if (driveClient) return driveClient;

  try {
    if (!fs.existsSync(DRIVE_CONFIG.CREDENTIALS_PATH)) {
      throw new Error(`Archivo de credenciales no encontrado: ${DRIVE_CONFIG.CREDENTIALS_PATH}`);
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: DRIVE_CONFIG.CREDENTIALS_PATH,
      scopes: DRIVE_CONFIG.SCOPES
    });

    driveClient = google.drive({ version: 'v3', auth });
    return driveClient;
  } catch (error) {
    console.error('Error inicializando Google Drive client:', error.message);
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

  console.log(`Carpeta creada: ${folderName} (ID: ${response.data.id})`);
  return response.data;
};

/**
 * Obtiene o crea la subcarpeta del campamento (INICIO, NAVIDAD, etc.)
 */
const getOrCreateCampamentoFolder = async (tipoCampamento) => {
  const tipo = tipoCampamento.toUpperCase();

  if (!DRIVE_CONFIG.TIPOS_CAMPAMENTO.includes(tipo)) {
    throw new Error(`Tipo de campamento no valido: ${tipoCampamento}`);
  }

  // Buscar si existe la subcarpeta
  let folder = await findFolderByName(tipo, DRIVE_CONFIG.CAMPAMENTOS_FOLDER_ID);

  if (!folder) {
    // Crear la subcarpeta si no existe
    folder = await createFolder(tipo, DRIVE_CONFIG.CAMPAMENTOS_FOLDER_ID);
  }

  return folder;
};

/**
 * Crea un nuevo Google Sheet para inscripciones de un campamento
 *
 * @param {number} campamentoId - ID del campamento en BD
 * @param {string} nombreCampamento - Nombre del campamento (ej: "Campamento de Navidad")
 * @param {string} tipoCampamento - Tipo: INICIO, NAVIDAD, ANIVERSARIO, PASCUA, VERANO
 * @returns {Object} { sheetId, spreadsheetUrl }
 */
const crearHojaInscripciones = async (campamentoId, nombreCampamento, tipoCampamento) => {
  try {
    const sheets = await initializeSheetsClient();
    const drive = await initializeDriveClient();

    // Obtener o crear carpeta del campamento
    const campamentoFolder = await getOrCreateCampamentoFolder(tipoCampamento);

    // Crear el nombre del archivo
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Inscripciones_${nombreCampamento.replace(/\s+/g, '_')}_${fecha}`;

    // Crear el spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: nombreArchivo
        },
        sheets: [
          {
            properties: {
              title: 'Inscripciones',
              gridProperties: {
                frozenRowCount: 1 // Congelar fila de encabezado
              }
            }
          }
        ]
      }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    const spreadsheetUrl = spreadsheet.data.spreadsheetUrl;

    console.log(`Google Sheet creado: ${nombreArchivo} (ID: ${spreadsheetId})`);

    // Agregar encabezados
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Inscripciones!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [COLUMNAS_INSCRIPCION]
      }
    });

    // Formatear encabezados (negrita, fondo gris)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                  textFormat: { bold: true }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: COLUMNAS_INSCRIPCION.length
              }
            }
          }
        ]
      }
    });

    // Mover el archivo a la carpeta del campamento
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: campamentoFolder.id,
      removeParents: 'root',
      fields: 'id, parents'
    });

    console.log(`Sheet movido a carpeta: ${tipoCampamento}`);

    return {
      sheetId: spreadsheetId,
      spreadsheetUrl,
      folderName: tipoCampamento,
      folderId: campamentoFolder.id
    };
  } catch (error) {
    console.error('Error creando hoja de inscripciones:', error.message);
    throw error;
  }
};

/**
 * Agrega una inscripcion al Google Sheet
 *
 * @param {string} sheetId - ID del Google Sheet
 * @param {Object} datos - Datos de la inscripcion
 */
const agregarInscripcion = async (sheetId, datos) => {
  try {
    const sheets = await initializeSheetsClient();

    const fila = [
      new Date().toISOString(),                           // Marca temporal
      datos.email || '',                                  // Correo electronico
      datos.nombreFamiliar || '',                         // Nombre Madre/Padre/Tutor
      datos.telefono || '',                               // Telefono
      datos.nombreAsistente || '',                        // Nombre del Asistente
      datos.seccion || '',                                // Seccion
      datos.asistira ? 'Si' : 'No',                       // Asistira
      datos.alergias || '',                               // Alergias e intolerancias
      datos.dieta || '',                                  // Dieta especial
      datos.circularSubida ? 'Si' : 'No',                // Circular subida
      datos.justificanteSubido ? 'Si' : 'No',            // Justificante subido
      datos.estado || 'Pendiente'                         // Estado
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Inscripciones!A:L',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [fila]
      }
    });

    console.log(`Inscripcion agregada al Sheet: ${datos.nombreAsistente}`);
    return true;
  } catch (error) {
    console.error('Error agregando inscripcion:', error.message);
    throw error;
  }
};

/**
 * Actualiza una inscripcion existente en el Sheet
 *
 * @param {string} sheetId - ID del Google Sheet
 * @param {string} nombreAsistente - Nombre del asistente para buscar
 * @param {Object} datos - Datos actualizados
 */
const actualizarInscripcion = async (sheetId, nombreAsistente, datos) => {
  try {
    const sheets = await initializeSheetsClient();

    // Obtener todas las filas para encontrar la correcta
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Inscripciones!A:L'
    });

    const filas = response.data.values || [];
    let filaIndex = -1;

    // Buscar la fila del asistente (columna E = indice 4)
    for (let i = 1; i < filas.length; i++) {
      if (filas[i][4] === nombreAsistente) {
        filaIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }

    if (filaIndex === -1) {
      console.log(`No se encontro inscripcion para: ${nombreAsistente}`);
      return false;
    }

    // Construir la fila actualizada manteniendo los datos existentes
    const filaExistente = filas[filaIndex - 1];
    const filaActualizada = [
      filaExistente[0],                                                    // Marca temporal (no cambiar)
      datos.email ?? filaExistente[1],
      datos.nombreFamiliar ?? filaExistente[2],
      datos.telefono ?? filaExistente[3],
      filaExistente[4],                                                    // Nombre asistente (no cambiar)
      datos.seccion ?? filaExistente[5],
      datos.asistira !== undefined ? (datos.asistira ? 'Si' : 'No') : filaExistente[6],
      datos.alergias ?? filaExistente[7],
      datos.dieta ?? filaExistente[8],
      datos.circularSubida !== undefined ? (datos.circularSubida ? 'Si' : 'No') : filaExistente[9],
      datos.justificanteSubido !== undefined ? (datos.justificanteSubido ? 'Si' : 'No') : filaExistente[10],
      datos.estado ?? filaExistente[11]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Inscripciones!A${filaIndex}:L${filaIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [filaActualizada]
      }
    });

    console.log(`Inscripcion actualizada: ${nombreAsistente}`);
    return true;
  } catch (error) {
    console.error('Error actualizando inscripcion:', error.message);
    throw error;
  }
};

/**
 * Obtiene todas las inscripciones de un Sheet
 *
 * @param {string} sheetId - ID del Google Sheet
 * @returns {Array} Lista de inscripciones
 */
const getInscripciones = async (sheetId) => {
  try {
    const sheets = await initializeSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Inscripciones!A:L'
    });

    const filas = response.data.values || [];

    if (filas.length <= 1) {
      return []; // Solo encabezados o vacio
    }

    // Convertir a objetos
    const inscripciones = filas.slice(1).map((fila, index) => ({
      fila: index + 2, // Numero de fila en el Sheet
      marcaTemporal: fila[0] || '',
      email: fila[1] || '',
      nombreFamiliar: fila[2] || '',
      telefono: fila[3] || '',
      nombreAsistente: fila[4] || '',
      seccion: fila[5] || '',
      asistira: fila[6] === 'Si',
      alergias: fila[7] || '',
      dieta: fila[8] || '',
      circularSubida: fila[9] === 'Si',
      justificanteSubido: fila[10] === 'Si',
      estado: fila[11] || 'Pendiente'
    }));

    return inscripciones;
  } catch (error) {
    console.error('Error obteniendo inscripciones:', error.message);
    throw error;
  }
};

/**
 * Obtiene estadisticas de un Sheet de inscripciones
 *
 * @param {string} sheetId - ID del Google Sheet
 * @returns {Object} Estadisticas
 */
const getEstadisticasInscripciones = async (sheetId) => {
  try {
    const inscripciones = await getInscripciones(sheetId);

    const stats = {
      total: inscripciones.length,
      asistiran: inscripciones.filter(i => i.asistira).length,
      noAsistiran: inscripciones.filter(i => !i.asistira).length,
      circularesSubidas: inscripciones.filter(i => i.circularSubida).length,
      justificantesSubidos: inscripciones.filter(i => i.justificanteSubido).length,
      pendientes: inscripciones.filter(i => i.estado === 'Pendiente').length,
      inscritos: inscripciones.filter(i => i.estado === 'Inscrito').length
    };

    // Estadisticas por seccion
    stats.porSeccion = {};
    for (const inscripcion of inscripciones) {
      const seccion = inscripcion.seccion || 'Sin seccion';
      if (!stats.porSeccion[seccion]) {
        stats.porSeccion[seccion] = { total: 0, asistiran: 0 };
      }
      stats.porSeccion[seccion].total++;
      if (inscripcion.asistira) {
        stats.porSeccion[seccion].asistiran++;
      }
    }

    return stats;
  } catch (error) {
    console.error('Error obteniendo estadisticas:', error.message);
    throw error;
  }
};

// ========== SISTEMA DE ASISTENCIA POR SECCIÓN ==========
const CampamentoAsistenciaSheetsModel = require('../models/campamento-asistencia-sheets.model');
const { query } = require('../config/db.config');

/**
 * Obtiene todos los educandos de una sección
 * @param {number} seccionId - ID de la sección
 * @returns {Array} Lista de educandos
 */
const getEducandosPorSeccion = async (seccionId) => {
  try {
    const educandos = await query(`
      SELECT
        e.id,
        e.nombre,
        e.apellidos,
        e.activo,
        s.nombre as seccion_nombre
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE e.seccion_id = $1 AND e.activo = true
      ORDER BY e.apellidos ASC, e.nombre ASC
    `, [seccionId]);

    return educandos;
  } catch (error) {
    console.error('Error obteniendo educandos por sección:', error);
    throw error;
  }
};

/**
 * Obtiene información de un educando específico
 * @param {number} educandoId - ID del educando
 * @returns {Object} Datos del educando
 */
const getEducandoInfo = async (educandoId) => {
  try {
    const result = await query(`
      SELECT
        e.id,
        e.nombre,
        e.apellidos,
        e.seccion_id,
        s.nombre as seccion_nombre
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE e.id = $1
    `, [educandoId]);

    return result[0] || null;
  } catch (error) {
    console.error('Error obteniendo info del educando:', error);
    throw error;
  }
};

/**
 * Verifica si una hoja existe en un spreadsheet
 */
const checkSheetExists = async (spreadsheetId, sheetName) => {
  const sheets = await initializeSheetsClient();

  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title'
    });

    const sheetNames = response.data.sheets.map(s => s.properties.title);
    return sheetNames.includes(sheetName);
  } catch (error) {
    console.error('Error verificando hoja:', error.message);
    return false;
  }
};

/**
 * Verifica si una hoja está vacía (solo tiene encabezado o menos de 2 filas)
 * Útil para detectar hojas que existen pero no fueron inicializadas con educandos
 */
const isSheetEmpty = async (spreadsheetId, sheetName) => {
  const sheets = await initializeSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetName}'!A:B`
    });

    const values = response.data.values || [];
    // Vacía si tiene 0 filas o solo 1 fila (encabezado)
    return values.length <= 1;
  } catch (error) {
    console.error('Error verificando si hoja está vacía:', error.message);
    return true; // Si hay error, asumir vacía para intentar inicializar
  }
};

/**
 * Crea una nueva hoja en un spreadsheet existente
 */
const createSheet = async (spreadsheetId, sheetName) => {
  const sheets = await initializeSheetsClient();

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: sheetName
          }
        }
      }]
    }
  });
};

/**
 * Inicializa una hoja de sección con los educandos
 * Columnas: Nº, Educando, Asiste, Observaciones
 */
const inicializarHojaSeccion = async (spreadsheetId, nombreHoja, seccionId) => {
  const sheets = await initializeSheetsClient();

  // Obtener educandos de la sección
  const educandos = await getEducandosPorSeccion(seccionId);

  if (educandos.length === 0) {
    console.log(`⚠️ No hay educandos en la sección "${nombreHoja}"`);
    return;
  }

  // Filas de datos: un educando por fila
  const rows = educandos.map((educando, index) => [
    index + 1,                                    // Nº
    `${educando.apellidos}, ${educando.nombre}`,  // Educando
    '',                                           // Asiste (vacío = pendiente)
    ''                                            // Observaciones
  ]);

  // Escribir datos a partir de la fila 2 (la fila 1 son encabezados)
  const range = `'${nombreHoja}'!A2:D${rows.length + 1}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows
    }
  });

  // Aplicar formato profesional a la hoja
  await applyProfessionalFormat(spreadsheetId, nombreHoja, educandos.length);

  console.log(`📋 Hoja "${nombreHoja}" formateada con ${educandos.length} educandos`);
};

/**
 * Aplica formato profesional a una hoja de asistencia de campamento
 * - Cabecera con fondo morado y texto blanco
 * - Anchos de columna apropiados
 * - Dropdown para columna Asiste
 * - Formato condicional (verde=Sí, rojo=No)
 * - Primera fila congelada
 */
const applyProfessionalFormat = async (spreadsheetId, nombreHoja, numEducandos) => {
  const sheets = await initializeSheetsClient();

  // Obtener el sheetId
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties'
  });

  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === nombreHoja);
  if (!sheet) return;

  const sheetId = sheet.properties.sheetId;
  const lastRow = numEducandos + 1; // +1 para incluir encabezado

  const requests = [
    // 1. Formato de cabecera: fondo morado, texto blanco, negrita, centrado
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 4
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.4, green: 0.2, blue: 0.6 }, // Morado
            textFormat: {
              bold: true,
              foregroundColor: { red: 1, green: 1, blue: 1 }, // Blanco
              fontSize: 11
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
      }
    },
    // 2. Altura de fila de cabecera
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 35 },
        fields: 'pixelSize'
      }
    },
    // 3. Ancho columna A (Nº) - estrecha
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 45 },
        fields: 'pixelSize'
      }
    },
    // 4. Ancho columna B (Educando) - ancha
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
        properties: { pixelSize: 280 },
        fields: 'pixelSize'
      }
    },
    // 5. Ancho columna C (Asiste) - mediana
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 },
        properties: { pixelSize: 80 },
        fields: 'pixelSize'
      }
    },
    // 6. Ancho columna D (Observaciones) - ancha
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 },
        properties: { pixelSize: 350 },
        fields: 'pixelSize'
      }
    },
    // 7. Congelar primera fila
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenRowCount: 1 }
        },
        fields: 'gridProperties.frozenRowCount'
      }
    },
    // 8. Centrar columnas A y C
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: lastRow,
          startColumnIndex: 0,
          endColumnIndex: 1
        },
        cell: {
          userEnteredFormat: { horizontalAlignment: 'CENTER' }
        },
        fields: 'userEnteredFormat.horizontalAlignment'
      }
    },
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: lastRow,
          startColumnIndex: 2,
          endColumnIndex: 3
        },
        cell: {
          userEnteredFormat: { horizontalAlignment: 'CENTER' }
        },
        fields: 'userEnteredFormat.horizontalAlignment'
      }
    },
    // 9. Validación de datos: Dropdown Sí/No para columna Asiste
    {
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: lastRow,
          startColumnIndex: 2,
          endColumnIndex: 3
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: [
              { userEnteredValue: 'Sí' },
              { userEnteredValue: 'No' }
            ]
          },
          showCustomUi: true,
          strict: false
        }
      }
    },
    // 10. Formato condicional: Verde para "Sí"
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{
            sheetId,
            startRowIndex: 1,
            endRowIndex: lastRow,
            startColumnIndex: 2,
            endColumnIndex: 3
          }],
          booleanRule: {
            condition: {
              type: 'TEXT_EQ',
              values: [{ userEnteredValue: 'Sí' }]
            },
            format: {
              backgroundColor: { red: 0.7, green: 0.9, blue: 0.7 } // Verde claro
            }
          }
        },
        index: 0
      }
    },
    // 11. Formato condicional: Rojo para "No"
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{
            sheetId,
            startRowIndex: 1,
            endRowIndex: lastRow,
            startColumnIndex: 2,
            endColumnIndex: 3
          }],
          booleanRule: {
            condition: {
              type: 'TEXT_EQ',
              values: [{ userEnteredValue: 'No' }]
            },
            format: {
              backgroundColor: { red: 0.95, green: 0.7, blue: 0.7 } // Rojo claro
            }
          }
        },
        index: 1
      }
    },
    // 12. Bordes para toda la tabla
    {
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: lastRow,
          startColumnIndex: 0,
          endColumnIndex: 4
        },
        top: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
        bottom: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
        left: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
        right: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
        innerHorizontal: { style: 'SOLID', color: { red: 0.9, green: 0.9, blue: 0.9 } },
        innerVertical: { style: 'SOLID', color: { red: 0.9, green: 0.9, blue: 0.9 } }
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests }
  });
};

/**
 * Crea el spreadsheet de asistencia con hojas por sección para un campamento
 * Si no hay plantilla configurada, crea un nuevo spreadsheet
 *
 * @param {string} tipoCampamento - INICIO, NAVIDAD, etc.
 * @param {string} nombreCampamento - Nombre del campamento
 * @returns {Object} { spreadsheetId, spreadsheetUrl }
 */
const crearAsistenciaPorSeccion = async (tipoCampamento, nombreCampamento) => {
  const sheets = await initializeSheetsClient();
  const drive = await initializeDriveClient();

  const plantillaId = DRIVE_CONFIG.CAMPAMENTOS_ASISTENCIA_PLANTILLA_ID;

  // Obtener o crear carpeta del campamento
  const campamentoFolder = await getOrCreateCampamentoFolder(tipoCampamento);

  const fecha = new Date().toISOString().split('T')[0];
  const nombreArchivo = `Asistencia_${nombreCampamento.replace(/\s+/g, '_')}_${fecha}`;

  let spreadsheetId;
  let spreadsheetUrl;

  if (plantillaId) {
    // Usar plantilla existente - añadir hojas
    console.log(`📋 Usando plantilla de asistencia campamentos (ID: ${plantillaId})...`);
    spreadsheetId = plantillaId;
    spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${plantillaId}/edit`;

    // Crear hojas por sección con prefijo del tipo de campamento
    const secciones = DRIVE_CONFIG.SECCIONES_ASISTENCIA;
    const prefijo = tipoCampamento.toUpperCase();

    for (const seccion of secciones) {
      const nombreHoja = `${prefijo}_${seccion.nombre}`;

      // Verificar si la hoja ya existe
      const hojaExiste = await checkSheetExists(plantillaId, nombreHoja);

      if (!hojaExiste) {
        // Crear nueva hoja
        console.log(`📄 Creando hoja: ${nombreHoja}`);
        await createSheet(plantillaId, nombreHoja);

        // Añadir encabezados
        await sheets.spreadsheets.values.update({
          spreadsheetId: plantillaId,
          range: `'${nombreHoja}'!A1:D1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['Nº', 'Educando', 'Asiste', 'Observaciones']]
          }
        });

        // Rellenar con educandos
        await inicializarHojaSeccion(plantillaId, nombreHoja, seccion.id);
      } else {
        // FIX: La hoja existe, verificar si está vacía (sin educandos)
        const isEmpty = await isSheetEmpty(plantillaId, nombreHoja);
        if (isEmpty) {
          console.log(`📄 Hoja "${nombreHoja}" existe pero está vacía, inicializando con educandos...`);

          // Añadir encabezados si faltan
          await sheets.spreadsheets.values.update({
            spreadsheetId: plantillaId,
            range: `'${nombreHoja}'!A1:D1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [['Nº', 'Educando', 'Asiste', 'Observaciones']]
            }
          });

          // Rellenar con educandos de la sección
          await inicializarHojaSeccion(plantillaId, nombreHoja, seccion.id);
        }
      }
    }
  } else {
    // Crear nuevo spreadsheet con 5 hojas (una por sección)
    console.log(`📋 Creando nuevo spreadsheet de asistencia: ${nombreArchivo}`);

    const secciones = DRIVE_CONFIG.SECCIONES_ASISTENCIA;
    const prefijo = tipoCampamento.toUpperCase();

    const spreadsheet = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: nombreArchivo
        },
        sheets: secciones.map(seccion => ({
          properties: {
            title: `${prefijo}_${seccion.nombre}`,
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }))
      }
    });

    spreadsheetId = spreadsheet.data.spreadsheetId;
    spreadsheetUrl = spreadsheet.data.spreadsheetUrl;

    // Añadir encabezados y educandos a cada hoja
    for (const seccion of secciones) {
      const nombreHoja = `${prefijo}_${seccion.nombre}`;

      // Encabezados
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${nombreHoja}'!A1:D1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Nº', 'Educando', 'Asiste', 'Observaciones']]
        }
      });

      // Rellenar con educandos
      await inicializarHojaSeccion(spreadsheetId, nombreHoja, seccion.id);
    }

    // Mover el archivo a la carpeta del campamento
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: campamentoFolder.id,
      removeParents: 'root',
      fields: 'id, parents'
    });

    console.log(`✅ Spreadsheet de asistencia creado y movido a: ${tipoCampamento}`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    nombreArchivo,
    carpetaId: campamentoFolder.id,
    tipoCampamento: tipoCampamento.toUpperCase()
  };
};

/**
 * Encuentra la fila de un educando en una hoja específica
 */
const findEducandoRowInSheet = async (spreadsheetId, nombreHoja, nombreCompleto) => {
  const sheets = await initializeSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${nombreHoja}'!B:B`
    });

    const values = response.data.values || [];

    // Buscar la fila que coincida con el nombre
    for (let i = 1; i < values.length; i++) {
      if (values[i] && values[i][0] === nombreCompleto) {
        return i + 1; // +1 porque las filas en Sheets son 1-indexed
      }
    }

    return null;
  } catch (error) {
    console.error('Error buscando educando en hoja:', error.message);
    return null;
  }
};

/**
 * Aplica color a la fila según el estado de asistencia
 */
const applyRowColor = async (spreadsheetId, nombreHoja, rowNumber, asiste) => {
  const sheets = await initializeSheetsClient();

  try {
    // Obtener sheetId
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    });

    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === nombreHoja);
    if (!sheet) return;

    const sheetId = sheet.properties.sheetId;

    // Definir colores según estado
    let backgroundColor;
    if (asiste === true) {
      backgroundColor = { red: 0.85, green: 0.95, blue: 0.85 }; // Verde claro
    } else if (asiste === false) {
      backgroundColor = { red: 0.95, green: 0.85, blue: 0.85 }; // Rojo claro
    } else {
      backgroundColor = { red: 1, green: 1, blue: 1 }; // Blanco (pendiente)
    }

    const requests = [{
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: rowNumber - 1,
          endRowIndex: rowNumber,
          startColumnIndex: 0,
          endColumnIndex: 4
        },
        cell: {
          userEnteredFormat: { backgroundColor }
        },
        fields: 'userEnteredFormat.backgroundColor'
      }
    }];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
  } catch (error) {
    console.error('Error aplicando color a fila:', error.message);
  }
};

/**
 * Registra la asistencia de un educando a un campamento
 * Si no existe el spreadsheet, lo crea con todas las hojas por sección
 *
 * @param {number} actividadId - ID del campamento
 * @param {number} educandoId - ID del educando
 * @param {boolean} asiste - true si asiste, false si no
 * @param {string} observaciones - Observaciones opcionales
 * @param {string} tipoCampamento - Tipo de campamento (INICIO, NAVIDAD, etc.)
 * @param {string} nombreCampamento - Nombre del campamento
 */
const registrarAsistenciaCampamento = async (actividadId, educandoId, asiste, observaciones = '', tipoCampamento, nombreCampamento) => {
  try {
    console.log(`\n📊 Registrando asistencia campamento: actividad=${actividadId}, educando=${educandoId}, asiste=${asiste}`);

    // 1. Verificar si ya existe spreadsheet para este campamento
    let sheetInfo = await CampamentoAsistenciaSheetsModel.findByActividadId(actividadId);

    // 2. Si no existe, crear toda la estructura
    if (!sheetInfo) {
      console.log('📊 No existe spreadsheet de asistencia, creando...');

      const resultado = await crearAsistenciaPorSeccion(tipoCampamento, nombreCampamento);

      // Guardar relación en BD
      sheetInfo = await CampamentoAsistenciaSheetsModel.create({
        actividad_id: actividadId,
        spreadsheet_id: resultado.spreadsheetId,
        carpeta_campamento_id: resultado.carpetaId,
        nombre_archivo: resultado.nombreArchivo,
        tipo_campamento: resultado.tipoCampamento
      });

      console.log(`✅ Spreadsheet de asistencia creado: ${resultado.spreadsheetId}`);
    }

    // 3. Obtener información del educando
    const educando = await getEducandoInfo(educandoId);
    if (!educando) {
      throw new Error(`Educando ${educandoId} no encontrado`);
    }

    // 4. Determinar la hoja (sección) donde actualizar
    const seccion = DRIVE_CONFIG.SECCIONES_ASISTENCIA.find(s => s.id === educando.seccion_id);
    if (!seccion) {
      console.warn(`⚠️ Sección ${educando.seccion_id} no encontrada en configuración`);
      return;
    }

    // Nombre de hoja con formato: "NAVIDAD_Pioneros"
    const nombreHoja = `${sheetInfo.tipo_campamento}_${seccion.nombre}`;
    const nombreCompleto = `${educando.apellidos}, ${educando.nombre}`;

    // 5. Encontrar la fila del educando
    const rowNumber = await findEducandoRowInSheet(
      sheetInfo.spreadsheet_id,
      nombreHoja,
      nombreCompleto
    );

    if (!rowNumber) {
      console.warn(`⚠️ Educando "${nombreCompleto}" no encontrado en hoja "${nombreHoja}"`);
      return;
    }

    // 6. Mapear estado al texto del Excel
    const estadoTexto = asiste === true ? 'Sí' : (asiste === false ? 'No' : '');

    // 7. Actualizar las celdas (Asiste, Observaciones) - Columnas C y D
    const sheets = await initializeSheetsClient();
    const range = `'${nombreHoja}'!C${rowNumber}:D${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetInfo.spreadsheet_id,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[estadoTexto, observaciones || '']]
      }
    });

    // 8. Aplicar color según estado
    await applyRowColor(sheetInfo.spreadsheet_id, nombreHoja, rowNumber, asiste);

    // 9. Actualizar timestamp en BD
    await CampamentoAsistenciaSheetsModel.updateTimestamp(actividadId);

    console.log(`✅ Asistencia campamento actualizada: ${nombreCompleto} → ${estadoTexto}`);

    return {
      spreadsheetId: sheetInfo.spreadsheet_id,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetInfo.spreadsheet_id}/edit`
    };

  } catch (error) {
    console.error('❌ Error registrando asistencia en campamento:', error);
    // No relanzamos el error para no bloquear la inscripción principal
  }
};

/**
 * Obtiene el URL del spreadsheet de asistencia de un campamento
 * @param {number} actividadId - ID del campamento
 * @returns {string|null} URL del spreadsheet o null si no existe
 */
const getAsistenciaSpreadsheetUrl = async (actividadId) => {
  const sheetInfo = await CampamentoAsistenciaSheetsModel.findByActividadId(actividadId);
  if (sheetInfo) {
    return `https://docs.google.com/spreadsheets/d/${sheetInfo.spreadsheet_id}/edit`;
  }
  return null;
};

module.exports = {
  initializeSheetsClient,
  crearHojaInscripciones,
  agregarInscripcion,
  actualizarInscripcion,
  getInscripciones,
  getEstadisticasInscripciones,
  getOrCreateCampamentoFolder,
  COLUMNAS_INSCRIPCION,
  // Funciones de asistencia por sección
  crearAsistenciaPorSeccion,
  registrarAsistenciaCampamento,
  getAsistenciaSpreadsheetUrl,
  getEducandosPorSeccion,
  getEducandoInfo
};
