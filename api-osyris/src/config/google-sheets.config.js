/**
 * Configuración de Google Sheets API para el sistema de contacto
 * Osyris Scout Management System
 */

const path = require('path');

const SHEETS_CONFIG = {
  // ID del spreadsheet para mensajes de contacto
  SPREADSHEET_ID: process.env.GOOGLE_SHEETS_CONTACTO_ID || '1RrbFtyUbkOVbuusTxZkC34zZ1EqqWnMwSuugTsA8tVM',

  // Nombre de la hoja donde se guardan los mensajes
  // NOTA: "Hoja 1" es el nombre de la pestaña dentro del spreadsheet "Mensajes Web"
  SHEET_NAME: process.env.GOOGLE_SHEETS_SHEET_NAME || 'Hoja 1',

  // Ruta a las credenciales de la cuenta de servicio
  CREDENTIALS_PATH: process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(__dirname, '../../credentials/google-service-account.json'),

  // Scopes necesarios para Google Sheets API
  SCOPES: [
    'https://www.googleapis.com/auth/spreadsheets'
  ],

  // Columnas del spreadsheet
  COLUMNS: {
    FECHA: 'A',
    NOMBRE: 'B',
    EMAIL: 'C',
    ASUNTO: 'D',
    MENSAJE: 'E',
    ESTADO: 'F',
    IP: 'G',
    USER_AGENT: 'H'
  },

  // Estados posibles de un mensaje
  ESTADOS: {
    PENDIENTE: 'Pendiente',
    LEIDO: 'Leído',
    RESPONDIDO: 'Respondido'
  },

  // URL del spreadsheet para incluir en emails
  SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1RrbFtyUbkOVbuusTxZkC34zZ1EqqWnMwSuugTsA8tVM/edit'
};

module.exports = SHEETS_CONFIG;
