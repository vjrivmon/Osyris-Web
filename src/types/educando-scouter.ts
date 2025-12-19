/**
 * Tipos TypeScript para la gestión de educandos por scouters
 * Usado en /aula-virtual/educandos
 */

/**
 * Estado de un documento del educando
 */
export type EstadoDocumentoEducando = 'subido' | 'faltante' | 'pendiente_revision' | 'rechazado'

/**
 * Información de un documento específico
 */
export interface DocumentoEducando {
  tipo: string
  nombre: string
  prefijo: string
  obligatorio: boolean
  tienePlantilla: boolean
  plantillaNombre?: string
  estado: EstadoDocumentoEducando
  archivo?: {
    id: string
    nombre: string
    fecha: string
    url?: string
  }
}

/**
 * Resumen de documentación de un educando
 */
export interface ResumenDocumentacion {
  completos: number
  total: number
  pendientes: number
  faltantes: number
  opcionalesFaltantes?: number
}

/**
 * Educando con información enriquecida para la vista de scouter
 */
export interface EducandoConDocs {
  id: number
  nombre: string
  apellidos: string
  fecha_nacimiento: string
  edad: number
  genero: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir'
  dni?: string
  pasaporte?: string
  direccion?: string
  codigo_postal?: string
  municipio?: string
  telefono_casa?: string
  telefono_movil?: string
  email?: string
  alergias?: string
  notas_medicas?: string
  seccion_id: number
  seccion_nombre?: string
  seccion_color?: string
  foto_perfil?: string
  activo: boolean
  notas?: string
  fecha_alta?: string

  // Información de familia vinculada
  tiene_familia_vinculada: boolean
  familiares_count: number

  // Información de documentación
  docs_completos: number
  docs_total: number
  docs_pendientes: number
  docs_faltantes: number
}

/**
 * Datos para crear un nuevo educando
 */
export interface CreateEducandoData {
  nombre: string
  apellidos: string
  fecha_nacimiento: string
  seccion_id: number
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir'
  dni?: string
  pasaporte?: string
  direccion?: string
  codigo_postal?: string
  municipio?: string
  telefono_casa?: string
  telefono_movil?: string
  email?: string
  alergias?: string
  notas_medicas?: string
  notas?: string
}

/**
 * Datos para actualizar un educando
 */
export interface UpdateEducandoData extends Partial<CreateEducandoData> {
  activo?: boolean
}

/**
 * Parámetros de filtrado para la lista de educandos
 */
export interface EducandoFilters {
  page?: number
  limit?: number
  search?: string
  orderBy?: 'nombre' | 'apellidos' | 'edad' | 'fecha_nacimiento' | 'genero'
  orderDir?: 'asc' | 'desc'
  genero?: string
  estadoDocs?: 'todos' | 'completos' | 'incompletos' | 'pendientes'
}

/**
 * Respuesta paginada de educandos
 */
export interface EducandosResponse {
  success: boolean
  data: EducandoConDocs[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Datos para enviar notificación de documentación
 */
export interface NotificacionDocumentosData {
  documentos_faltantes?: string[]
  mensaje?: string
}

/**
 * Configuración de colores para estado de documentación
 */
export const DOCS_STATUS_CONFIG = {
  completo: {
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-300',
    icon: 'CheckCircle',
    label: 'Completo'
  },
  parcial: {
    color: 'bg-yellow-100 text-yellow-800',
    borderColor: 'border-yellow-300',
    icon: 'AlertCircle',
    label: 'Incompleto'
  },
  critico: {
    color: 'bg-red-100 text-red-800',
    borderColor: 'border-red-300',
    icon: 'XCircle',
    label: 'Critico'
  },
  pendiente: {
    color: 'bg-amber-100 text-amber-800',
    borderColor: 'border-amber-300',
    icon: 'Clock',
    label: 'Pendiente revision'
  }
} as const

/**
 * Utilidades para trabajar con educandos
 */
export const EducandoUtils = {
  /**
   * Obtiene el estado general de documentación
   */
  getDocsStatus: (educando: EducandoConDocs): keyof typeof DOCS_STATUS_CONFIG => {
    if (educando.docs_pendientes > 0) return 'pendiente'
    if (educando.docs_completos === educando.docs_total) return 'completo'
    if (educando.docs_completos >= educando.docs_total * 0.5) return 'parcial'
    return 'critico'
  },

  /**
   * Obtiene las iniciales del educando
   */
  getIniciales: (educando: EducandoConDocs): string => {
    const primeraInicial = educando.nombre.charAt(0).toUpperCase()
    const segundaInicial = educando.apellidos ? educando.apellidos.charAt(0).toUpperCase() : ''
    return primeraInicial + segundaInicial
  },

  /**
   * Genera un color de fondo para el avatar basado en el nombre
   */
  getAvatarColor: (nombre: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ]
    let hash = 0
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  },

  /**
   * Formatea el género para mostrar
   */
  formatGenero: (genero: string): string => {
    const generos: Record<string, string> = {
      masculino: 'Masculino',
      femenino: 'Femenino',
      otro: 'Otro',
      prefiero_no_decir: 'No especificado'
    }
    return generos[genero] || genero
  },

  /**
   * Obtiene el icono de género
   */
  getGeneroIcon: (genero: string): string => {
    if (genero === 'masculino') return 'male'
    if (genero === 'femenino') return 'female'
    return 'user'
  },

  /**
   * Verifica si puede notificar (tiene familia y docs faltantes)
   */
  puedeNotificar: (educando: EducandoConDocs): boolean => {
    return educando.tiene_familia_vinculada && educando.docs_faltantes > 0
  }
}
