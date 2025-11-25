/**
 * Tipos TypeScript consolidados para el Portal de Familias
 */

/**
 * Estados posibles de un documento
 */
export type EstadoDocumento =
  | 'actualizado'        // ✅ Documento al día y correcto
  | 'correcto'           // ✓ Documento válido pero puede necesitar actualización pronto
  | 'pendiente'          // ⏰ Documento pendiente de subir o revisar
  | 'pendiente_revision' // 🔄 Subido, pendiente de revisión por scouter
  | 'aprobado'           // ✅ Aprobado por scouter
  | 'rechazado'          // ❌ Rechazado por scouter (necesita volver a subir)
  | 'falta'              // ❌ Documento faltante o rechazado

/**
 * Tipos de documentos del sistema (alineados con Google Drive)
 */
export type TipoDocumento =
  | 'ficha_inscripcion'      // DOC01
  | 'ficha_sanitaria'        // DOC02
  | 'sip'                    // Anexo 2.1
  | 'vacunas'                // Anexo 2.2 (cartilla_vacunacion)
  | 'dni_padre_madre'        // Anexo 1.1
  | 'regresar_solo'          // DOC08
  | 'autorizacion_whatsapp'  // DOC09
  | 'baja_asociado'          // DOC10

/**
 * Información de un documento específico
 */
export interface Documento {
  id?: number
  tipo: TipoDocumento
  label: string
  estado: EstadoDocumento
  fecha_subida?: string
  fecha_vencimiento?: string
  fecha_ultima_actualizacion?: string
  url_archivo?: string
  notas?: string
}

/**
 * Información básica de un hijo/scout
 */
export interface ScoutHijo {
  id: number
  nombre: string
  apellidos: string
  apodo?: string
  fecha_nacimiento: string
  seccion: string
  seccion_id: number
  seccion_color?: string
  edad: number
  foto?: string
  email?: string
  telefono?: string
  genero?: 'M' | 'F' | 'Otro'
  activo: boolean
  fecha_ingreso: string

  // Estado de documentación
  documentos_estado: 'completo' | 'pendiente' | 'vencido'
  documentos?: Documento[]

  // Información adicional
  progreso_general?: number
  ultima_actividad?: string
  proxima_actividad?: string

  // Relación con el familiar
  relacion?: 'padre' | 'madre' | 'tutor_legal' | 'otro'
  es_contacto_principal?: boolean

  // Información de contacto de emergencia
  contacto_emergencia?: {
    nombre: string
    relacion: string
    telefono: string
  }

  // Información médica
  notas_medicas?: string
  alergias?: string[]

  // Monitor asignado
  monitor_asignado?: {
    nombre: string
    apellidos: string
    foto?: string
    contacto?: string
  }
}

/**
 * Configuración de colores para estados de documentos
 */
export const DOCUMENTO_ESTADO_CONFIG = {
  actualizado: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: 'CheckCircle',
    label: 'Actualizado',
    emoji: '✅'
  },
  correcto: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: 'CheckCircle',
    label: 'Correcto',
    emoji: '✓'
  },
  pendiente: {
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: 'Clock',
    label: 'Pendiente',
    emoji: '⏰'
  },
  pendiente_revision: {
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: 'Clock',
    label: 'Pendiente revisión',
    emoji: '🔄'
  },
  aprobado: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: 'CheckCircle',
    label: 'Aprobado',
    emoji: '✅'
  },
  rechazado: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: 'XCircle',
    label: 'Rechazado',
    emoji: '❌'
  },
  falta: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: 'AlertTriangle',
    label: 'Falta',
    emoji: '❌'
  }
} as const

/**
 * Configuración de tipos de documentos (alineados con Google Drive)
 */
export const DOCUMENTO_TIPO_CONFIG = {
  ficha_inscripcion: {
    label: 'Ficha de Inscripción',
    icon: 'FileText',
    descripcion: 'Documento de inscripción del scout',
    requerido: true,
    codigo: 'DOC01',
    tienePlantilla: true
  },
  ficha_sanitaria: {
    label: 'Ficha Sanitaria',
    icon: 'Heart',
    descripcion: 'Información médica y sanitaria',
    requerido: true,
    codigo: 'DOC02',
    tienePlantilla: true
  },
  sip: {
    label: 'SIP',
    icon: 'Shield',
    descripcion: 'Tarjeta sanitaria (escaneo)',
    requerido: true,
    codigo: 'Anexo 2.1',
    tienePlantilla: false
  },
  vacunas: {
    label: 'Cartilla de Vacunación',
    icon: 'Syringe',
    descripcion: 'Registro de vacunas actualizado (escaneo)',
    requerido: true,
    codigo: 'Anexo 2.2',
    tienePlantilla: false
  },
  dni_padre_madre: {
    label: 'DNI Padre/Madre',
    icon: 'CreditCard',
    descripcion: 'Documento de identidad del tutor legal (escaneo)',
    requerido: true,
    codigo: 'Anexo 1.1',
    tienePlantilla: false
  },
  regresar_solo: {
    label: 'Autorización Regresar Solo',
    icon: 'Home',
    descripcion: 'Autorización para que el educando regrese solo a casa',
    requerido: false,
    codigo: 'DOC08',
    tienePlantilla: true
  },
  autorizacion_whatsapp: {
    label: 'Autorización WhatsApp',
    icon: 'MessageCircle',
    descripcion: 'Autorización para grupos de WhatsApp',
    requerido: false,
    codigo: 'DOC09',
    tienePlantilla: true
  },
  baja_asociado: {
    label: 'Baja Asociado',
    icon: 'UserMinus',
    descripcion: 'Documento para darse de baja del grupo',
    requerido: false,
    codigo: 'DOC10',
    tienePlantilla: true
  }
} as const

/**
 * Actividad/Evento del calendario
 */
export interface ActividadCalendario {
  id: number
  titulo: string
  descripcion?: string
  fecha: string
  hora: string
  lugar?: string
  seccion: string
  seccion_id: number
  tipo: 'reunion' | 'campamento' | 'excursion' | 'actividad_especial' | 'formacion'
  confirmacion?: 'confirmado' | 'pendiente' | 'rechazado'
  costo?: number
  requiere_confirmacion: boolean
  fecha_limite_confirmacion?: string
}

/**
 * Props para componentes de acción rápida
 */
export interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  badge?: number
  color?: string
}

/**
 * Utilidades para trabajar con documentos
 */
export const DocumentoUtils = {
  /**
   * Obtiene el color de un estado de documento
   */
  getEstadoColor: (estado: EstadoDocumento): string => {
    return DOCUMENTO_ESTADO_CONFIG[estado].color
  },

  /**
   * Obtiene el label de un estado de documento
   */
  getEstadoLabel: (estado: EstadoDocumento): string => {
    return DOCUMENTO_ESTADO_CONFIG[estado].label
  },

  /**
   * Obtiene el emoji de un estado de documento
   */
  getEstadoEmoji: (estado: EstadoDocumento): string => {
    return DOCUMENTO_ESTADO_CONFIG[estado].emoji
  },

  /**
   * Verifica si un documento está crítico (falta o pendiente)
   */
  esCritico: (estado: EstadoDocumento): boolean => {
    return estado === 'falta' || estado === 'pendiente'
  },

  /**
   * Obtiene la información de configuración de un tipo de documento
   */
  getTipoConfig: (tipo: TipoDocumento) => {
    return DOCUMENTO_TIPO_CONFIG[tipo]
  },

  /**
   * Calcula el porcentaje de documentos completos
   */
  calcularProgreso: (documentos: Documento[]): number => {
    if (documentos.length === 0) return 0
    const completos = documentos.filter(d =>
      d.estado === 'actualizado' || d.estado === 'correcto'
    ).length
    return Math.round((completos / documentos.length) * 100)
  },

  /**
   * Obtiene los documentos que necesitan atención
   */
  getDocumentosCriticos: (documentos: Documento[]): Documento[] => {
    return documentos.filter(d => DocumentoUtils.esCritico(d.estado))
  }
}

/**
 * Utilidades para trabajar con scouts
 */
export const ScoutUtils = {
  /**
   * Calcula la edad a partir de la fecha de nacimiento
   */
  calcularEdad: (fechaNacimiento: string): number => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  },

  /**
   * Obtiene el emoji de la sección
   */
  getSeccionEmoji: (seccion: string): string => {
    const seccionLower = seccion.toLowerCase()
    if (seccionLower.includes('castor') || seccionLower.includes('veleta')) return '🦫'
    if (seccionLower.includes('manada') || seccionLower.includes('waingunga')) return '🐺'
    if (seccionLower.includes('tropa') || seccionLower.includes('brownsea')) return '⚜️'
    if (seccionLower.includes('pioneer') || seccionLower.includes('kanhiwara')) return '🏔️'
    if (seccionLower.includes('ruta') || seccionLower.includes('walhalla')) return '🎒'
    return '🏕️'
  },

  /**
   * Obtiene las iniciales del nombre
   */
  getIniciales: (nombre: string, apellidos?: string): string => {
    const primeraInicial = nombre.charAt(0).toUpperCase()
    const segundaInicial = apellidos ? apellidos.charAt(0).toUpperCase() : ''
    return primeraInicial + segundaInicial
  }
}
