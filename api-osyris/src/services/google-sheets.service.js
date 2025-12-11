/**
 * Servicio de Google Sheets para el sistema de contacto
 * Osyris Scout Management System
 *
 * Gestiona la lectura/escritura de mensajes de contacto en Google Sheets
 */

const { google } = require('googleapis');
const SHEETS_CONFIG = require('../config/google-sheets.config');

let sheetsClient = null;
let authClient = null;

/**
 * Escapa el nombre de la hoja para usar en rangos de la API
 * Los nombres con espacios deben ir entre comillas simples
 * @param {string} sheetName - Nombre de la hoja
 * @returns {string} Nombre escapado
 */
function escapeSheetName(sheetName) {
  if (sheetName.includes(' ') || sheetName.includes("'")) {
    // Escapar comillas simples duplicándolas y envolver en comillas simples
    return `'${sheetName.replace(/'/g, "''")}'`;
  }
  return sheetName;
}

/**
 * Inicializa el cliente de Google Sheets con credenciales de cuenta de servicio
 */
async function initializeSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  try {
    // Crear cliente de autenticación
    authClient = new google.auth.GoogleAuth({
      keyFile: SHEETS_CONFIG.CREDENTIALS_PATH,
      scopes: SHEETS_CONFIG.SCOPES
    });

    // Crear cliente de Sheets
    sheetsClient = google.sheets({ version: 'v4', auth: authClient });

    console.log('✅ Google Sheets client inicializado correctamente');
    return sheetsClient;
  } catch (error) {
    console.error('❌ Error inicializando Google Sheets client:', error.message);
    throw error;
  }
}

/**
 * Formatea la fecha actual para el spreadsheet
 * @returns {string} Fecha formateada: DD/MM/YYYY HH:mm:ss
 */
function formatDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Añade un mensaje de contacto al spreadsheet
 * @param {Object} data - Datos del mensaje
 * @param {string} data.nombre - Nombre del remitente
 * @param {string} data.email - Email del remitente
 * @param {string} data.asunto - Asunto del mensaje
 * @param {string} data.mensaje - Contenido del mensaje
 * @param {string} [data.ip] - IP del remitente
 * @param {string} [data.userAgent] - User Agent del navegador
 * @returns {Promise<Object>} Resultado de la operación
 */
async function appendContactMessage(data) {
  try {
    const client = await initializeSheetsClient();

    const { nombre, email, asunto, mensaje, ip = '', userAgent = '' } = data;

    // Preparar la fila de datos
    const row = [
      formatDate(),                    // A: Fecha
      nombre,                          // B: Nombre
      email,                           // C: Email
      asunto,                          // D: Asunto
      mensaje,                         // E: Mensaje
      SHEETS_CONFIG.ESTADOS.PENDIENTE, // F: Estado
      ip,                              // G: IP
      userAgent                        // H: UserAgent
    ];

    // Añadir la fila al spreadsheet
    const sheetRange = `${escapeSheetName(SHEETS_CONFIG.SHEET_NAME)}!A:H`;
    const response = await client.spreadsheets.values.append({
      spreadsheetId: SHEETS_CONFIG.SPREADSHEET_ID,
      range: sheetRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row]
      }
    });

    console.log(`✅ Mensaje de contacto guardado en Google Sheets: ${email}`);

    return {
      success: true,
      updatedRange: response.data.updates?.updatedRange,
      updatedRows: response.data.updates?.updatedRows
    };
  } catch (error) {
    console.error('❌ Error guardando mensaje en Google Sheets:', error.message);

    // Si es error de permisos, dar instrucciones claras
    if (error.message.includes('permission') || error.code === 403) {
      console.error('⚠️ El spreadsheet no está compartido con la cuenta de servicio.');
      console.error(`   Compartir con: osyris-drive-service@osyris-documentos.iam.gserviceaccount.com`);
    }

    throw error;
  }
}

/**
 * Obtiene todos los mensajes de contacto
 * @param {number} [limit=100] - Número máximo de mensajes a obtener
 * @returns {Promise<Array>} Lista de mensajes
 */
async function getContactMessages(limit = 100) {
  try {
    const client = await initializeSheetsClient();

    const sheetRange = `${escapeSheetName(SHEETS_CONFIG.SHEET_NAME)}!A2:H${limit + 1}`; // +1 porque empieza en fila 2
    const response = await client.spreadsheets.values.get({
      spreadsheetId: SHEETS_CONFIG.SPREADSHEET_ID,
      range: sheetRange
    });

    const rows = response.data.values || [];

    // Mapear a objetos
    const messages = rows.map((row, index) => ({
      id: index + 1,
      fecha: row[0] || '',
      nombre: row[1] || '',
      email: row[2] || '',
      asunto: row[3] || '',
      mensaje: row[4] || '',
      estado: row[5] || SHEETS_CONFIG.ESTADOS.PENDIENTE,
      ip: row[6] || '',
      userAgent: row[7] || ''
    }));

    return messages;
  } catch (error) {
    console.error('❌ Error obteniendo mensajes de Google Sheets:', error.message);
    throw error;
  }
}

/**
 * Actualiza el estado de un mensaje
 * @param {number} rowNumber - Número de fila (empezando desde 2)
 * @param {string} estado - Nuevo estado
 * @returns {Promise<Object>} Resultado de la operación
 */
async function updateMessageStatus(rowNumber, estado) {
  try {
    const client = await initializeSheetsClient();

    const sheetRange = `${escapeSheetName(SHEETS_CONFIG.SHEET_NAME)}!F${rowNumber}`;
    const response = await client.spreadsheets.values.update({
      spreadsheetId: SHEETS_CONFIG.SPREADSHEET_ID,
      range: sheetRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[estado]]
      }
    });

    console.log(`✅ Estado de mensaje actualizado a: ${estado}`);

    return {
      success: true,
      updatedCells: response.data.updatedCells
    };
  } catch (error) {
    console.error('❌ Error actualizando estado del mensaje:', error.message);
    throw error;
  }
}

/**
 * Verifica la conexión con Google Sheets
 * @returns {Promise<boolean>} true si la conexión es exitosa
 */
async function verifySheetsConnection() {
  try {
    const client = await initializeSheetsClient();

    // Intentar leer metadatos del spreadsheet
    const response = await client.spreadsheets.get({
      spreadsheetId: SHEETS_CONFIG.SPREADSHEET_ID
    });

    console.log(`✅ Conexión con Google Sheets verificada: "${response.data.properties.title}"`);
    return true;
  } catch (error) {
    console.error('❌ Error verificando conexión con Google Sheets:', error.message);
    return false;
  }
}

module.exports = {
  initializeSheetsClient,
  appendContactMessage,
  getContactMessages,
  updateMessageStatus,
  verifySheetsConnection,
  SHEETS_CONFIG
};
