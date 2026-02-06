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
  cartilla_vacunacion: {
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
  fechaFin?: string  // Para campamentos multi-día
  hora: string
  horaFin?: string
  lugar?: string
  seccion: string
  seccion_id: number
  tipo: 'reunion' | 'campamento' | 'excursion' | 'actividad_especial' | 'formacion'
  tipoOriginal?: string  // Tipo original de la API (para distinguir tipos específicos)
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

// ========================================
// TIPOS PARA SISTEMA DE CAMPAMENTOS v2.0
// ========================================

/**
 * Estados de inscripcion a campamento
 */
export type EstadoInscripcionCampamento =
  | 'pendiente'      // Inscrito pero faltan datos/documentos
  | 'inscrito'       // Inscripcion completa
  | 'no_asiste'      // Confirmado que no asiste
  | 'lista_espera'   // En lista de espera
  | 'cancelado'      // Cancelado

/**
 * Recordatorio predefinido para campamentos
 */
export interface RecordatorioPredefinido {
  id: string
  texto: string
  activo: boolean
}

/**
 * Detalles de logistica de un campamento
 */
export interface CampamentoDetalles {
  // Logistica
  lugar_salida?: string
  hora_salida?: string
  mapa_salida_url?: string
  lugar_regreso?: string
  hora_regreso?: string

  // Pago
  precio?: number
  numero_cuenta?: string
  concepto_pago?: string

  // Recordatorios
  recordatorios_predefinidos?: RecordatorioPredefinido[]
  recordatorios_personalizados?: string[]

  // Circular/Autorizacion
  circular_drive_id?: string
  circular_drive_url?: string
  circular_nombre?: string

  // Google Sheets de inscripciones
  sheets_inscripciones_id?: string
}

/**
 * Actividad con detalles de campamento extendidos
 */
export interface ActividadCampamento {
  id: number | string
  titulo: string
  descripcion: string
  fecha: string
  fechaFin?: string
  lugar?: string
  costo?: number
  scoutIds: string[]
  confirmaciones: { [scoutId: string]: 'confirmado' | 'pendiente' | 'no_asiste' }
  // Detalles del campamento
  campamento?: CampamentoDetalles
  // Issue #7: Fecha límite de inscripción
  fecha_limite_inscripcion?: string
}

/**
 * Datos de inscripcion a campamento
 */
export interface InscripcionCampamento {
  id: number
  actividad_id: number
  educando_id: number
  familiar_id: number
  estado: EstadoInscripcionCampamento

  // Datos del educando
  educando_nombre: string
  educando_apellidos: string
  educando_fecha_nacimiento?: string
  seccion_nombre: string
  seccion_color?: string

  // Datos del familiar
  familiar_nombre: string
  familiar_apellidos: string
  familiar_email: string
  familiar_telefono?: string

  // Datos de salud
  alergias?: string
  intolerancias?: string
  dieta_especial?: string
  medicacion?: string
  observaciones_medicas?: string

  // Contacto de emergencia
  telefono_emergencia?: string
  persona_emergencia?: string

  // Confirmaciones
  datos_confirmados: boolean
  fecha_confirmacion_datos?: string

  // Pago
  pagado: boolean
  fecha_pago?: string
  metodo_pago?: string
  referencia_pago?: string

  // Observaciones
  observaciones?: string

  // Timestamps
  created_at?: string
  updated_at?: string
}

/**
 * Inscripcion completa con documentos subidos
 */
export interface InscripcionCampamentoCompleta extends InscripcionCampamento {
  // Datos del familiar para el formulario
  email_familiar?: string
  telefono_familiar?: string
  nombre_familiar?: string

  // Documentos subidos
  circular_firmada_drive_id?: string
  circular_firmada_url?: string
  fecha_subida_circular?: string
  justificante_pago_drive_id?: string
  justificante_pago_url?: string
  fecha_subida_justificante?: string

  // Estados de envio por email
  circular_enviada_seccion?: boolean
  justificante_enviado_tesoreria?: boolean

  // Datos de la actividad (joinados)
  actividad_titulo?: string
  actividad_fecha_inicio?: string
  actividad_fecha_fin?: string
  actividad_lugar?: string
  actividad_precio?: number
}

/**
 * Estado de documentos de una inscripcion
 */
export interface DocumentosInscripcion {
  circular_firmada: {
    subida: boolean
    drive_id?: string
    url?: string
    fecha_subida?: string
    enviada_seccion: boolean
  }
  justificante_pago: {
    subido: boolean
    drive_id?: string
    url?: string
    fecha_subida?: string
    enviado_tesoreria: boolean
  }
}

/**
 * Datos para crear/actualizar inscripcion
 */
export interface DatosInscripcionCampamento {
  actividad_id: number
  educando_id: number
  asistira: boolean

  // Datos del familiar
  email_familiar?: string
  telefono_familiar?: string
  nombre_familiar?: string

  // Datos de salud
  alergias?: string
  intolerancias?: string
  dieta_especial?: string
  medicacion?: string
  observaciones_medicas?: string

  // Contacto de emergencia
  telefono_emergencia?: string
  persona_emergencia?: string

  // Observaciones
  observaciones?: string

  // Estado de confirmacion
  datos_confirmados?: boolean
}

/**
 * Estadisticas de un campamento
 */
export interface EstadisticasCampamento {
  total: number
  inscritos: number
  pendientes: number
  no_asisten: number
  lista_espera: number
  cancelados: number
  pagados: number
  sin_pagar: number
  dietas?: {
    con_alergias: number
    con_intolerancias: number
    con_dieta_especial: number
    con_medicacion: number
    total_con_restricciones: number
  }
}

/**
 * Configuracion de colores para estados de inscripcion
 */
export const INSCRIPCION_ESTADO_CONFIG = {
  pendiente: {
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    label: 'Pendiente',
    icon: 'Clock',
    emoji: '⏰'
  },
  inscrito: {
    color: 'bg-green-50 text-green-700 border-green-200',
    label: 'Inscrito',
    icon: 'CheckCircle',
    emoji: '✅'
  },
  no_asiste: {
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    label: 'No asiste',
    icon: 'XCircle',
    emoji: '❌'
  },
  lista_espera: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Lista de espera',
    icon: 'Clock',
    emoji: '⏳'
  },
  cancelado: {
    color: 'bg-red-50 text-red-700 border-red-200',
    label: 'Cancelado',
    icon: 'Ban',
    emoji: '🚫'
  }
} as const

/**
 * Utilidades para trabajar con inscripciones de campamento
 */
export const InscripcionCampamentoUtils = {
  /**
   * Obtiene la configuracion de un estado de inscripcion
   */
  getEstadoConfig: (estado: EstadoInscripcionCampamento) => {
    return INSCRIPCION_ESTADO_CONFIG[estado] || INSCRIPCION_ESTADO_CONFIG.pendiente
  },

  /**
   * Verifica si la inscripcion esta completa
   */
  estaCompleta: (inscripcion: InscripcionCampamentoCompleta): boolean => {
    return (
      inscripcion.estado === 'inscrito' &&
      inscripcion.datos_confirmados &&
      !!inscripcion.circular_firmada_drive_id &&
      inscripcion.pagado
    )
  },

  /**
   * Obtiene los pasos pendientes de una inscripcion
   */
  getPasosPendientes: (inscripcion: InscripcionCampamentoCompleta): string[] => {
    const pasos: string[] = []

    if (!inscripcion.datos_confirmados) {
      pasos.push('Confirmar datos')
    }
    if (!inscripcion.circular_firmada_drive_id) {
      pasos.push('Subir circular firmada')
    }
    if (!inscripcion.pagado && !inscripcion.justificante_pago_drive_id) {
      pasos.push('Subir justificante de pago')
    }

    return pasos
  },

  /**
   * Calcula el progreso de la inscripcion (0-100)
   */
  calcularProgreso: (inscripcion: InscripcionCampamentoCompleta): number => {
    let completados = 0
    const total = 4 // 4 pasos: datos, circular, pago, confirmacion final

    if (inscripcion.datos_confirmados) completados++
    if (inscripcion.circular_firmada_drive_id) completados++
    if (inscripcion.justificante_pago_drive_id || inscripcion.pagado) completados++
    if (inscripcion.estado === 'inscrito') completados++

    return Math.round((completados / total) * 100)
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
