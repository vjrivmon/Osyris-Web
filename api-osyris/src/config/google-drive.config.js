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
      prefijosAlternativos: ['SIP', 'A02_SIP'],
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
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
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

module.exports = {
  DRIVE_CONFIG,
  getDocumentFileName,
  getTipoDocumentoConfig,
  getSeccionFolderId
};
