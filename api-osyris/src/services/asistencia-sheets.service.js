/**
 * Servicio de Google Sheets para gestión de asistencia de sábados
 * Osyris Scout Management System
 *
 * Funcionalidades:
 * - Crear carpeta del mes si no existe
 * - Crear carpeta de la fecha de reunión
 * - Crear/actualizar Excel (Google Sheets) con 5 hojas (secciones)
 * - Actualizar estado de asistencia de un educando
 */

const { google } = require('googleapis');
const {
  initializeDriveClient,
  findFolderByName,
  createFolder
} = require('./google-drive.service');
const { DRIVE_CONFIG } = require('../config/google-drive.config');
const { query } = require('../config/db.config');
const AsistenciaSheetsModel = require('../models/asistencia-sheets.model');

let sheetsClient = null;

// ========== INICIALIZACIÓN ==========

/**
 * Inicializa el cliente de Google Sheets con Service Account
 */
async function initializeSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: DRIVE_CONFIG.CREDENTIALS_PATH,
      scopes: DRIVE_CONFIG.SCOPES  // Usa scopes centralizados (drive + spreadsheets)
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets client (asistencia) inicializado correctamente');
    return sheetsClient;
  } catch (error) {
    console.error('❌ Error inicializando Google Sheets client:', error.message);
    throw error;
  }
}

// ========== FUNCIONES AUXILIARES ==========

/**
 * Formatea fecha para nombre de carpeta: "14 DIC"
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatFechaParaCarpeta(fecha) {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = DRIVE_CONFIG.MESES_ABREV[fecha.getMonth()];
  return `${dia} ${mes}`;
}

/**
 * Obtiene nombre del mes en mayúsculas: "DICIEMBRE"
 * @param {Date} fecha - Fecha
 * @returns {string} Nombre del mes
 */
function getMesEnMayusculas(fecha) {
  return DRIVE_CONFIG.MESES_ES[fecha.getMonth()];
}

/**
 * Formatea fecha para nombre de archivo: "14_DIC_2025"
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatFechaParaArchivo(fecha) {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = DRIVE_CONFIG.MESES_ABREV[fecha.getMonth()];
  const anio = fecha.getFullYear();
  return `${dia}_${mes}_${anio}`;
}

/**
 * Formatea fecha y hora para celda: "14/12/2025 10:30"
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha y hora formateadas
 */
function formatFechaHoraParaCelda(fecha = new Date()) {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  const hora = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
}

// ========== GESTIÓN DE CARPETAS ==========

/**
 * Obtiene la carpeta raíz de asistencia (sin crear subcarpetas)
 * El spreadsheet de asistencia es una plantilla única donde se añaden hojas por fecha
 * Ya no se crean subcarpetas por mes/fecha
 * @param {Date} fechaReunion - Fecha de la reunión (solo para logging)
 * @returns {Object} { carpetaRaiz } con id de la carpeta raíz
 */
async function getOrCreateAsistenciaFolders(fechaReunion) {
  const asistenciaFolderId = DRIVE_CONFIG.ASISTENCIA_FOLDER_ID;

  if (!asistenciaFolderId) {
    throw new Error('GOOGLE_DRIVE_ASISTENCIA_FOLDER_ID no configurado');
  }

  const fechaStr = formatFechaParaCarpeta(fechaReunion);
  console.log(`📁 Usando carpeta raíz de asistencia para fecha: ${fechaStr}`);

  // Retornamos la carpeta raíz directamente, sin crear subcarpetas
  // El spreadsheet es una plantilla única compartida
  return {
    carpetaMes: { id: asistenciaFolderId, name: 'REGISTRO DE ASISTENCIA' },
    carpetaFecha: { id: asistenciaFolderId, name: 'REGISTRO DE ASISTENCIA' }
  };
}

// ========== GESTIÓN DE EDUCANDOS ==========

/**
 * Obtiene todos los educandos de una sección con su estado de vinculación
 * @param {number} seccionId - ID de la sección
 * @returns {Array} Lista de educandos con datos completos
 */
async function getEducandosPorSeccion(seccionId) {
  try {
    const educandos = await query(`
      SELECT
        e.id,
        e.nombre,
        e.apellidos,
        e.activo,
        s.nombre as seccion_nombre,
        CASE WHEN EXISTS (
          SELECT 1 FROM familiares_educandos fe WHERE fe.educando_id = e.id
        ) THEN true ELSE false END as tiene_familia_vinculada
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
}

/**
 * Obtiene información de un educando específico
 * @param {number} educandoId - ID del educando
 * @returns {Object} Datos del educando
 */
async function getEducandoInfo(educandoId) {
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
}

/**
 * Obtiene la fecha de una actividad
 * @param {number} actividadId - ID de la actividad
 * @returns {Date} Fecha de la actividad
 */
async function getFechaActividad(actividadId) {
  try {
    const result = await query(
      'SELECT fecha_inicio FROM actividades WHERE id = $1',
      [actividadId]
    );
    if (result[0]) {
      return new Date(result[0].fecha_inicio);
    }
    return new Date(); // Fallback a fecha actual
  } catch (error) {
    console.error('Error obteniendo fecha de actividad:', error);
    return new Date();
  }
}

// ========== GESTIÓN DE SPREADSHEETS ==========

/**
 * Obtiene o crea hojas en el spreadsheet mensual existente
 * NOTA: Debido a limitaciones de cuota del Service Account, NO podemos crear nuevos archivos.
 * En su lugar, usamos la PLANTILLA existente y añadimos hojas por fecha de reunión.
 *
 * Estructura esperada en la plantilla:
 * - Hojas base: Castores, Manada, Tropa, Pioneros, Rutas (para referencia)
 * - Hojas por fecha: "13_DIC_Castores", "13_DIC_Manada", etc.
 *
 * @param {string} carpetaFechaId - ID de la carpeta (no usado, mantenido por compatibilidad)
 * @param {string} nombreArchivo - Nombre del archivo (no usado, usamos la plantilla)
 * @param {Date} fechaReunion - Fecha de la reunión
 * @returns {string} ID del spreadsheet (plantilla)
 */
async function createAsistenciaSpreadsheet(carpetaFechaId, nombreArchivo, fechaReunion) {
  const sheets = await initializeSheetsClient();

  const plantillaId = DRIVE_CONFIG.ASISTENCIA_PLANTILLA_ID;

  if (!plantillaId) {
    throw new Error('No se ha configurado el ID de la plantilla de asistencia (ASISTENCIA_PLANTILLA_ID)');
  }

  console.log(`📋 Usando plantilla de asistencia existente (ID: ${plantillaId})...`);

  // Formato de fecha para los nombres de hojas: "13_DIC"
  const fechaPrefix = formatFechaParaCarpeta(fechaReunion).replace(' ', '_');

  // Para cada sección, crear una hoja con el formato: "13_DIC_Castores"
  const secciones = DRIVE_CONFIG.SECCIONES_ASISTENCIA;

  for (const seccion of secciones) {
    const nombreHoja = `${fechaPrefix}_${seccion.nombre}`;

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
          values: [['Nº', 'Educando', 'Asiste', 'Comentarios']]
        }
      });
    }

    // Rellenar con educandos y aplicar formato profesional
    await initializeSeccionSheet(plantillaId, nombreHoja, seccion.id);
  }

  console.log(`✅ Hojas de asistencia para ${fechaPrefix} creadas/actualizadas correctamente`);
  return plantillaId;
}

/**
 * Verifica si una hoja existe en un spreadsheet
 */
async function checkSheetExists(spreadsheetId, sheetName) {
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
}

/**
 * Crea una nueva hoja en un spreadsheet existente
 */
async function createSheet(spreadsheetId, sheetName) {
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
}

/**
 * Inicializa una hoja con los educandos de una sección
 * Incluye formato profesional: colores, anchos, dropdown, formato condicional
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} nombreHoja - Nombre de la hoja (sección)
 * @param {number} seccionId - ID de la sección en BD
 */
async function initializeSeccionSheet(spreadsheetId, nombreHoja, seccionId) {
  const sheets = await initializeSheetsClient();

  // Obtener educandos de la sección
  const educandos = await getEducandosPorSeccion(seccionId);

  if (educandos.length === 0) {
    console.log(`⚠️ No hay educandos en la sección "${nombreHoja}"`);
    return;
  }

  // Filas de datos: un educando por fila
  // Columnas: Nº, Educando, Asiste, Observaciones
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
}

/**
 * Aplica formato profesional a una hoja de asistencia
 * - Cabecera con fondo morado y texto blanco
 * - Anchos de columna apropiados
 * - Dropdown para columna Asiste
 * - Formato condicional (verde=Sí, rojo=No)
 * - Primera fila congelada
 */
async function applyProfessionalFormat(spreadsheetId, nombreHoja, numEducandos) {
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
}

/**
 * Aplica formato a una hoja de asistencia
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} nombreHoja - Nombre de la hoja
 * @param {number} numEducandos - Número de educandos
 */
async function formatSheet(spreadsheetId, nombreHoja, numEducandos) {
  const sheets = await initializeSheetsClient();

  // Obtener el sheetId
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties'
  });

  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === nombreHoja);
  if (!sheet) return;

  const sheetId = sheet.properties.sheetId;

  // Aplicar formato (4 columnas: Nº, Educando, Asiste, Comentarios)
  const requests = [
    // Encabezado en negrita y con fondo
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 4  // 4 columnas: A, B, C, D
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.4, blue: 0.6 },
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    },
    // Ajustar ancho de columnas
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 40 },      // A: Nº (estrecha)
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
        properties: { pixelSize: 250 },     // B: Educando (ancha)
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 },
        properties: { pixelSize: 80 },      // C: Asiste (pequeña)
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 },
        properties: { pixelSize: 300 },     // D: Comentarios (ancha)
        fields: 'pixelSize'
      }
    },
    // Congelar primera fila
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenRowCount: 1 }
        },
        fields: 'gridProperties.frozenRowCount'
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests }
  });
}

/**
 * Encuentra la fila de un educando en una hoja específica
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} nombreHoja - Nombre de la hoja
 * @param {string} nombreCompleto - Nombre completo del educando (formato: "Apellidos, Nombre")
 * @returns {number|null} Número de fila (1-indexed) o null si no se encuentra
 */
async function findEducandoRowInSheet(spreadsheetId, nombreHoja, nombreCompleto) {
  const sheets = await initializeSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${nombreHoja}'!B:B`
  });

  const values = response.data.values || [];

  // Buscar la fila que coincida con el nombre
  for (let i = 1; i < values.length; i++) { // Empezar en 1 para saltar encabezado
    if (values[i] && values[i][0] === nombreCompleto) {
      return i + 1; // +1 porque las filas en Sheets son 1-indexed
    }
  }

  return null;
}

// ========== FUNCIÓN PRINCIPAL ==========

/**
 * Actualiza el estado de asistencia de un educando en el spreadsheet
 * Si no existe el spreadsheet, lo crea con toda la estructura
 *
 * @param {number} actividadId - ID de la actividad/reunión
 * @param {number} educandoId - ID del educando
 * @param {string} estado - 'confirmado' | 'no_asiste' | 'pendiente'
 * @param {string} comentario - Comentario opcional (obligatorio si no_asiste)
 */
async function updateAsistenciaEducando(actividadId, educandoId, estado, comentario = '') {
  try {
    console.log(`\n📊 Actualizando asistencia: actividad=${actividadId}, educando=${educandoId}, estado=${estado}`);

    // 1. Verificar si ya existe spreadsheet para esta actividad
    let sheetInfo = await AsistenciaSheetsModel.findByActividadId(actividadId);

    // 2. Si no existe, crear toda la estructura
    if (!sheetInfo) {
      console.log('📊 No existe spreadsheet, creando estructura completa...');

      // Obtener fecha de la actividad
      const fechaReunion = await getFechaActividad(actividadId);

      // Crear carpetas (mes + fecha)
      const { carpetaMes, carpetaFecha } = await getOrCreateAsistenciaFolders(fechaReunion);

      // Crear nombre del archivo
      const nombreArchivo = `Asistencia_${formatFechaParaArchivo(fechaReunion)}`;

      // Crear el spreadsheet con las 5 hojas
      const spreadsheetId = await createAsistenciaSpreadsheet(
        carpetaFecha.id,
        nombreArchivo,
        fechaReunion
      );

      // Guardar relación en BD
      sheetInfo = await AsistenciaSheetsModel.create({
        actividad_id: actividadId,
        spreadsheet_id: spreadsheetId,
        carpeta_mes_id: carpetaMes.id,
        carpeta_fecha_id: carpetaFecha.id,
        nombre_archivo: nombreArchivo,
        fecha_reunion: fechaReunion.toISOString().split('T')[0]
      });

      console.log(`✅ Spreadsheet creado y guardado en BD: ${spreadsheetId}`);
    }

    // 3. Obtener información del educando
    const educando = await getEducandoInfo(educandoId);
    if (!educando) {
      throw new Error(`Educando ${educandoId} no encontrado`);
    }

    // 4. Determinar la hoja (sección) donde actualizar
    const seccion = DRIVE_CONFIG.SECCIONES_ASISTENCIA.find(s => s.id === educando.seccion_id);
    if (!seccion) {
      throw new Error(`Sección ${educando.seccion_id} no encontrada en configuración`);
    }

    // Obtener fecha de reunión para construir el nombre de la hoja
    const fechaReunion = await getFechaActividad(actividadId);
    const fechaPrefix = formatFechaParaCarpeta(fechaReunion).replace(' ', '_');

    // Nombre de hoja con formato: "13_DIC_Pioneros"
    const nombreHoja = `${fechaPrefix}_${seccion.nombre}`;
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

    // 6. Mapear estado al texto del Excel (columna "Asiste")
    // La plantilla usa valores simples: "Sí" o "No"
    let estadoTexto;
    switch (estado) {
      case 'confirmado':
        estadoTexto = 'Sí';
        break;
      case 'no_asiste':
        estadoTexto = 'No';
        break;
      default:
        estadoTexto = '';  // Pendiente = vacío
    }

    // 7. Actualizar las celdas (Asiste, Comentarios) - Columnas C y D
    const sheets = await initializeSheetsClient();
    const range = `'${nombreHoja}'!C${rowNumber}:D${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetInfo.spreadsheet_id,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[estadoTexto, comentario || '']]
      }
    });

    // 8. Aplicar color según estado
    await applyRowColor(sheetInfo.spreadsheet_id, nombreHoja, rowNumber, estado);

    // 9. Actualizar timestamp en BD
    await AsistenciaSheetsModel.updateTimestamp(actividadId);

    console.log(`✅ Asistencia actualizada: ${nombreCompleto} → ${estadoTexto}`);

  } catch (error) {
    console.error('❌ Error actualizando asistencia en Sheets:', error);
    // No relanzamos el error para no bloquear la confirmación principal
  }
}

/**
 * Aplica color a la fila según el estado de asistencia
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} nombreHoja - Nombre de la hoja
 * @param {number} rowNumber - Número de fila
 * @param {string} estado - 'confirmado' | 'no_asiste' | 'pendiente'
 */
async function applyRowColor(spreadsheetId, nombreHoja, rowNumber, estado) {
  const sheets = await initializeSheetsClient();

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
  switch (estado) {
    case 'confirmado':
      backgroundColor = { red: 0.85, green: 0.95, blue: 0.85 }; // Verde claro
      break;
    case 'no_asiste':
      backgroundColor = { red: 0.95, green: 0.85, blue: 0.85 }; // Rojo claro
      break;
    default:
      backgroundColor = { red: 1, green: 1, blue: 1 }; // Blanco (sin color)
  }

  const requests = [{
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: rowNumber - 1,
        endRowIndex: rowNumber,
        startColumnIndex: 0,
        endColumnIndex: 4  // 4 columnas: A, B, C, D (Nº, Educando, Asiste, Comentarios)
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
}

/**
 * Obtiene el URL del spreadsheet de una actividad
 * @param {number} actividadId - ID de la actividad
 * @returns {string|null} URL del spreadsheet o null si no existe
 */
async function getSpreadsheetUrl(actividadId) {
  const sheetInfo = await AsistenciaSheetsModel.findByActividadId(actividadId);
  if (sheetInfo) {
    return `https://docs.google.com/spreadsheets/d/${sheetInfo.spreadsheet_id}/edit`;
  }
  return null;
}

module.exports = {
  // Funciones principales
  updateAsistenciaEducando,
  getSpreadsheetUrl,

  // Funciones auxiliares (exportadas para testing)
  getOrCreateAsistenciaFolders,
  createAsistenciaSpreadsheet,
  initializeSeccionSheet,
  getEducandosPorSeccion,
  findEducandoRowInSheet,

  // Funciones de formato
  formatFechaParaCarpeta,
  getMesEnMayusculas,
  formatFechaParaArchivo,
  formatFechaHoraParaCelda
};
