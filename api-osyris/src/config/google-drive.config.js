/**
 * Configuración de Google Drive API
 *
 * Para configurar:
 * 1. Crear proyecto en Google Cloud Console
 * 2. Habilitar Google Drive API
 * 3. Crear Service Account
 * 4. Descargar JSON de credenciales
 * 5. Compartir carpeta "Documentación Educandos" con el email del Service Account
 */

const path = require('path');

// IDs de carpetas en Google Drive (configurar según tu estructura)
const DRIVE_CONFIG = {
  // ID de la carpeta raíz "Documentación Educandos"
  ROOT_FOLDER_ID: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '',

  // ID de la carpeta de plantillas "1. Documentos digitales"
  TEMPLATES_FOLDER_ID: process.env.GOOGLE_DRIVE_TEMPLATES_FOLDER_ID || '',

  // ID de la carpeta para documentos pendientes de revisión
  // Los documentos se suben aquí primero, y se mueven a la carpeta del educando cuando se aprueban
  PENDIENTES_FOLDER_ID: process.env.GOOGLE_DRIVE_PENDIENTES_FOLDER_ID || '',

  // Nombre de la carpeta de pendientes (se crea automáticamente si no existe)
  PENDIENTES_FOLDER_NAME: 'PENDIENTES_REVISION',

  // ========== CONFIGURACIÓN DE ASISTENCIA SÁBADOS ==========
  // ID de la carpeta raíz "ASISTENCIA SABADOS"
  ASISTENCIA_FOLDER_ID: process.env.GOOGLE_DRIVE_ASISTENCIA_FOLDER_ID || '1sdSVmYQQ-YTzTApLyQ12qWoP6Uu5Htis',

  // ID de la plantilla de asistencia (Google Sheets con 5 hojas: Castores, Manada, Tropa, Pioneros, Rutas)
  // Columnas: Nº, Educando, Asiste, Comentarios
  ASISTENCIA_PLANTILLA_ID: process.env.GOOGLE_DRIVE_ASISTENCIA_PLANTILLA_ID || '131Zo2pXmnRu6I8ciGv2_oSsNdAKuYzQ1YDnxTO__3aE',

  // Nombres de meses en español (mayúsculas) para carpetas
  MESES_ES: ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
             'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'],

  // Abreviaturas de meses para nombres de carpetas de fecha
  MESES_ABREV: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
                'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],

  // Nombres de secciones para hojas del Excel de asistencia
  // Orden: Castores (1), Manada/Lobatos (2), Tropa (3), Pioneros (4), Rutas (5)
  SECCIONES_ASISTENCIA: [
    { id: 1, nombre: 'Castores', slug: 'castores' },
    { id: 2, nombre: 'Manada', slug: 'manada' },
    { id: 3, nombre: 'Tropa', slug: 'tropa' },
    { id: 4, nombre: 'Pioneros', slug: 'pioneros' },
    { id: 5, nombre: 'Rutas', slug: 'rutas' }
  ],

  // Estados de asistencia
  ESTADOS_ASISTENCIA: {
    PENDIENTE: 'Pendiente',
    ASISTIRA: 'Asistirá',
    NO_ASISTIRA: 'No Asistirá'
  },

  // ========== CONFIGURACION DE CAMPAMENTOS ==========
  // ID de la carpeta raiz "CAMPAMENTOS" (compartida con service account)
  CAMPAMENTOS_FOLDER_ID: process.env.GOOGLE_DRIVE_CAMPAMENTOS_FOLDER_ID || '1rbQIw-ysIi5hjcGCX8e59q0sxtm1au46',

  // ID de la plantilla de asistencia para campamentos (Google Sheets con hojas por sección)
  // Similar a la plantilla de asistencia de sábados pero para campamentos
  // Usa la misma plantilla que la asistencia de sábados si no hay una específica configurada
  CAMPAMENTOS_ASISTENCIA_PLANTILLA_ID: process.env.GOOGLE_DRIVE_CAMPAMENTOS_ASISTENCIA_PLANTILLA_ID || '131Zo2pXmnRu6I8ciGv2_oSsNdAKuYzQ1YDnxTO__3aE',

  // Subcarpetas por tipo de campamento
  CAMPAMENTOS_SUBCARPETAS: {
    INICIO: { nombre: 'INICIO', id: null },
    NAVIDAD: { nombre: 'NAVIDAD', id: null },
    ANIVERSARIO: { nombre: 'ANIVERSARIO', id: null },
    PASCUA: { nombre: 'PASCUA', id: null },
    VERANO: { nombre: 'VERANO', id: null }
  },

  // Emails por seccion para enviar circulares firmadas
  EMAILS_SECCIONES: {
    castores: 'castoresosyris@gmail.com',
    manada: 'manadaosyris@gmail.com',
    lobatos: 'manadaosyris@gmail.com',
    tropa: 'tropa.gsosyris@gmail.com',
    pioneros: 'posta.osyris@gmail.com',
    rutas: 'wallhallaruta@gmail.com'
  },

  // Email de tesoreria para justificantes de pago
  EMAIL_TESORERIA: 'tesoreriaosyris@gmail.com',

  // Numero de cuenta por defecto para campamentos
  NUMERO_CUENTA_DEFAULT: 'ES76 3159 0063 5125 0527 9113',

  // Recordatorios predefinidos para campamentos
  RECORDATORIOS_PREDEFINIDOS: [
    { id: 'almuerzo', texto: 'Traer almuerzo, comida y merienda del primer dia', activo: true },
    { id: 'saco', texto: 'Llevar saco de dormir', activo: true },
    { id: 'esterilla', texto: 'Llevar esterilla', activo: true },
    { id: 'ropa_abrigo', texto: 'Llevar ropa de abrigo', activo: true },
    { id: 'sip', texto: 'Traer SIP original', activo: true },
    { id: 'camisa', texto: 'Traer camisa de la seccion', activo: true },
    { id: 'panyoleta', texto: 'Traer panyoleta', activo: true }
  ],

  // Tipos de campamento para categorizar
  TIPOS_CAMPAMENTO: ['INICIO', 'NAVIDAD', 'ANIVERSARIO', 'PASCUA', 'VERANO'],

  // Mapeo de secciones a IDs de carpetas en Drive
  // Nota: "lobatos" y "manada" apuntan a la misma carpeta
  SECCIONES_FOLDER_IDS: {
    castores: process.env.GOOGLE_DRIVE_CASTORES_FOLDER_ID || '',
    lobatos: process.env.GOOGLE_DRIVE_MANADA_FOLDER_ID || '',
    manada: process.env.GOOGLE_DRIVE_MANADA_FOLDER_ID || '',
    tropa: process.env.GOOGLE_DRIVE_TROPA_FOLDER_ID || '',
    pioneros: process.env.GOOGLE_DRIVE_PIONEROS_FOLDER_ID || '',
    rutas: process.env.GOOGLE_DRIVE_RUTAS_FOLDER_ID || ''
  },

  // Tipos de documentos y sus prefijos (formato: PREFIJO_nombre)
  // prefijosAlternativos: Nombres legacy que también deben reconocerse
  // palabrasClave: Palabras que identifican el documento (orden de prioridad)
  // exclusiones: Palabras que descartan este tipo (evita falsos positivos)
  TIPOS_DOCUMENTO: {
    dni_padre_madre: {
      prefijo: 'A01',
      prefijosAlternativos: ['DNI', 'A01_DNI'],
      palabrasClave: ['dni'],
      exclusiones: [],
      nombre: 'DNI Padre/Madre',
      nombreArchivo: 'DNI',
      plantilla: null,
      obligatorio: true,
      edadMinima: null
    },
    sip: {
      prefijo: 'A02',
      prefijosAlternativos: ['SIP', 'A02_SIP', 'D02_SIP'],  // D02_SIP agregado para archivos legacy
      palabrasClave: ['sip', 'tarjetasanitaria'],
      exclusiones: ['ficha', 'sanitaria'],  // Evitar confusión con ficha_sanitaria
      nombre: 'SIP (Tarjeta Sanitaria)',
      nombreArchivo: 'SIP',
      plantilla: null,
      obligatorio: true,
      edadMinima: null
    },
    cartilla_vacunacion: {
      prefijo: 'A02',
      prefijosAlternativos: ['D02_Vacunas', 'A02_Vacunas', 'Vacunas'],
      palabrasClave: ['vacunas', 'vacunacion', 'vacunación', 'cartilla', 'inmunizacion'],
      exclusiones: [],
      nombre: 'Cartilla de Vacunación',
      nombreArchivo: 'Vacunas',
      plantilla: null,
      obligatorio: true,
      edadMinima: null
    },
    ficha_inscripcion: {
      prefijo: 'DOC01',
      prefijosAlternativos: ['D01', 'D01_Inscripcion', 'DOC01_Inscripcion', 'DOC01_Ficha'],
      palabrasClave: ['inscripcion', 'inscripción', 'fichainscripcion', 'fichainscripción'],
      exclusiones: ['sanitaria'],  // Evitar confusión con ficha_sanitaria
      nombre: 'Ficha de Inscripción',
      nombreArchivo: 'Ficha_Inscripcion',
      plantilla: 'DOC01_Ficha de inscripción.pdf',
      obligatorio: true,
      edadMinima: null
    },
    ficha_sanitaria: {
      prefijo: 'DOC02',
      prefijosAlternativos: ['D02', 'D02_Sanitaria', 'DOC02_Sanitaria', 'DOC02_Ficha'],
      palabrasClave: ['sanitaria', 'fichasanitaria', 'medica', 'médica'],
      exclusiones: ['inscripcion', 'inscripción', 'sip', 'tarjeta'],  // Evitar confusiones
      nombre: 'Ficha Sanitaria',
      nombreArchivo: 'Ficha_Sanitaria',
      plantilla: 'DOC02_Ficha sanitaria.pdf',
      obligatorio: true,
      edadMinima: null
    },
    regresar_solo: {
      prefijo: 'DOC08',
      prefijosAlternativos: ['D08', 'DOC08_Regresar'],
      palabrasClave: ['regresarsolo', 'regresar', 'solo', 'sólo', 'volver'],
      exclusiones: ['whatsapp'],
      nombre: 'Autorización Regresar Solo',
      nombreArchivo: 'Regresar_Solo',
      plantilla: 'DOC08_Regresar Solo_Ronda 24 25.pdf',
      obligatorio: false,
      edadMinima: 14
    },
    autorizacion_whatsapp: {
      prefijo: 'DOC09',
      prefijosAlternativos: ['D09', 'DOC09_WhatsApp', 'DOC09_Autorizacion'],
      palabrasClave: ['whatsapp', 'grupos', 'gruposwhatsapp'],
      exclusiones: ['regresar', 'solo'],
      nombre: 'Autorización Grupos WhatsApp',
      nombreArchivo: 'Autorizacion_WhatsApp',
      plantilla: 'DOC09_Autorización grupos WhatsApp.pdf',
      obligatorio: false,
      edadMinima: 14
    }
  },

  // Ruta al archivo de credenciales del Service Account
  CREDENTIALS_PATH: process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(__dirname, '../../credentials/google-service-account.json'),

  // Scopes necesarios para la API
  SCOPES: [
    'https://www.googleapis.com/auth/drive',           // Acceso completo a Drive
    'https://www.googleapis.com/auth/drive.file',      // Crear/editar archivos
    'https://www.googleapis.com/auth/spreadsheets'     // Crear/editar Google Sheets
  ]
};

// Función para obtener el nombre del archivo según formato
const getDocumentFileName = (tipoDocumento, nombreEducando) => {
  const tipo = DRIVE_CONFIG.TIPOS_DOCUMENTO[tipoDocumento];
  if (!tipo) return null;

  // Usar nombreArchivo si existe, sino normalizar nombre
  const nombreDoc = tipo.nombreArchivo || tipo.nombre.replace(/\s+/g, '_');

  // Normalizar nombre del educando (quitar espacios)
  const nombreEducandoNormalizado = nombreEducando.replace(/\s+/g, '');

  // Formato: PREFIJO_NombreDocumento_NombreEducando.pdf
  // Ejemplo: A01_DNI_AndresPastorQuitana.pdf
  return `${tipo.prefijo}_${nombreDoc}_${nombreEducandoNormalizado}.pdf`;
};

// Función para obtener la configuración de un tipo de documento
const getTipoDocumentoConfig = (tipoDocumento) => {
  return DRIVE_CONFIG.TIPOS_DOCUMENTO[tipoDocumento] || null;
};

// Función para obtener el ID de carpeta de una sección
const getSeccionFolderId = (seccionSlug) => {
  if (!seccionSlug) return null;
  const slug = seccionSlug.toLowerCase().replace(/\s+/g, '');
  return DRIVE_CONFIG.SECCIONES_FOLDER_IDS[slug] || null;
};

// Funcion para obtener el email de una seccion (para circulares firmadas)
const getEmailSeccion = (seccionSlug) => {
  if (!seccionSlug) return null;
  const slug = seccionSlug.toLowerCase().replace(/\s+/g, '');
  return DRIVE_CONFIG.EMAILS_SECCIONES[slug] || null;
};

// Funcion para obtener los recordatorios predefinidos
const getRecordatoriosPredefinidos = () => {
  return DRIVE_CONFIG.RECORDATORIOS_PREDEFINIDOS.map(r => ({ ...r }));
};

// Funcion para obtener la configuracion de un tipo de campamento
const getTipoCampamentoConfig = (tipoCampamento) => {
  if (!tipoCampamento) return null;
  const tipo = tipoCampamento.toUpperCase();
  return DRIVE_CONFIG.CAMPAMENTOS_SUBCARPETAS[tipo] || null;
};

// Funcion para validar si es un tipo de campamento valido
const esTipoCampamentoValido = (tipoCampamento) => {
  if (!tipoCampamento) return false;
  return DRIVE_CONFIG.TIPOS_CAMPAMENTO.includes(tipoCampamento.toUpperCase());
};

module.exports = {
  DRIVE_CONFIG,
  getDocumentFileName,
  getTipoDocumentoConfig,
  getSeccionFolderId,
  getEmailSeccion,
  getRecordatoriosPredefinidos,
  getTipoCampamentoConfig,
  esTipoCampamentoValido
};
