'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getApiUrl } from '@/lib/api-utils'

// CRIT-002: Cache configuration - reduced TTL to prevent stale notifications
const CACHE_TTL = 30 * 1000 // 30 seconds (reduced from 2 minutes)
const CACHE_VERSION = 'v2' // Increment to force cache invalidation
const POLLING_INTERVAL = 30 * 1000 // 30 seconds polling when visible

// Tipos de notificaciones
// MED-005: Agregado 'mensaje_scouter' para mensajes directos de scouters a familias
export type TipoNotificacion = 'urgente' | 'importante' | 'informativo' | 'recordatorio' | 'mensaje_scouter'
export type PrioridadNotificacion = 'alta' | 'normal' | 'baja'
export type CategoriaNotificacion = 'documentos' | 'actividades' | 'galeria' | 'general' | 'comunicados'
export type EstadoNotificacion = 'no_leida' | 'leida' | 'archivada'

export interface NotificacionFamilia {
  id: number
  familiar_id: number
  scout_id: number
  scout_nombre?: string
  scout_apellidos?: string
  titulo: string
  mensaje: string
  tipo: TipoNotificacion
  prioridad: PrioridadNotificacion
  categoria?: CategoriaNotificacion
  enlace_accion?: string
  metadata?: Record<string, any>
  fecha_creacion: string
  fecha_lectura?: string
  fecha_archivado?: string
  fecha_expiracion?: string
  estado: EstadoNotificacion
  remitente_nombre?: string
  remitente_rol?: string
}

export interface PreferenciasNotificacion {
  id: number
  familiar_id: number
  email_habilitado: boolean
  email_urgentes: boolean
  email_importantes: boolean
  email_informativos: boolean
  email_resumen_semanal: boolean
  sms_habilitado: boolean
  sms_solo_urgentes: boolean
  push_habilitado: boolean
  push_urgentes: boolean
  push_importantes: boolean
  horario_inicio: string
  horario_fin: string
  fin_de_semana_diferenciado: boolean
  horario_fin_semana_inicio: string
  horario_fin_semana_fin: string
  modo_no_molestar: boolean
  vacaciones_activo: boolean
  vacaciones_inicio?: string
  vacaciones_fin?: string
  frecuencia_notificaciones: 'inmediatas' | 'diario' | 'semanal'
  contactos_adicionales: ContactoAdicional[]
}

export interface ContactoAdicional {
  id: number
  nombre: string
  relacion: string
  email?: string
  telefono?: string
  recibir_urgentes: boolean
  recibir_importantes: boolean
  recibir_informativos: boolean
}

export interface PlantillaMensaje {
  id: number
  nombre: string
  asunto: string
  contenido: string
  categoria: CategoriaNotificacion
  variables: string[]
}

// Opciones para el hook
interface UseNotificacionesFamiliaOptions {
  autoRefetch?: boolean
  refetchInterval?: number
  cacheKey?: string
  scoutId?: number
  enablePolling?: boolean // CRIT-002: Enable polling when visible
  enableVisibilityRefetch?: boolean // CRIT-002: Refetch on visibility change
}

// Hook principal
export function useNotificacionesFamilia({
  autoRefetch = true,
  refetchInterval = CACHE_TTL, // CRIT-002: Use constant TTL (30s)
  cacheKey = 'notificaciones-familia',
  scoutId,
  enablePolling = true, // CRIT-002: Enable by default
  enableVisibilityRefetch = true // CRIT-002: Enable by default
}: UseNotificacionesFamiliaOptions = {}) {
  const { user, token, isAuthenticated } = useAuth()
  const [notificaciones, setNotificaciones] = useState<NotificacionFamilia[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preferencias, setPreferencias] = useState<PreferenciasNotificacion | null>(null)
  const [loadingPreferencias, setLoadingPreferencias] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false) // CRIT-002: Track manual refresh
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchRef = useRef<number>(0) // CRIT-002: Track last fetch time

  // CRIT-002: Build versioned cache key to force invalidation when version changes
  const getVersionedCacheKey = useCallback((baseKey: string) => {
    return `${CACHE_VERSION}-${baseKey}`
  }, [])

  // CRIT-002: Invalidate cache function
  const invalidateCache = useCallback(() => {
    const baseKey = scoutId ? `${cacheKey}-${scoutId}` : cacheKey
    const versionedKey = getVersionedCacheKey(baseKey)
    localStorage.removeItem(versionedKey)
    localStorage.removeItem(`${versionedKey}-timestamp`)
    // Also remove old non-versioned cache
    localStorage.removeItem(baseKey)
    localStorage.removeItem(`${baseKey}-timestamp`)
  }, [cacheKey, scoutId, getVersionedCacheKey])

  // Obtener notificaciones
  const fetchNotificaciones = useCallback(async (options: {
    soloNoLeidas?: boolean
    tipo?: TipoNotificacion
    categoria?: CategoriaNotificacion
    prioridad?: PrioridadNotificacion
    limit?: number
    skipCache?: boolean // CRIT-002: Option to skip cache entirely
  } = {}) => {
    if (!isAuthenticated || !token || !user) {
      return []
    }

    setLoading(true)
    setError(null)

    try {
      // CRIT-002: Use versioned cache key
      const baseKey = scoutId ? `${cacheKey}-${scoutId}` : cacheKey
      const versionedKey = getVersionedCacheKey(baseKey)

      // CRIT-002: Check cache only if not skipping and not filtering
      if (!options.skipCache && !options.soloNoLeidas) {
        const cached = localStorage.getItem(versionedKey)
        const cacheTimestamp = localStorage.getItem(`${versionedKey}-timestamp`)

        if (cached && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp)
          if (cacheAge < CACHE_TTL) {
            const cachedData = JSON.parse(cached)
            setNotificaciones(cachedData)
            setLoading(false)
            return cachedData
          }
        }
      }

      // Construir URL con parámetros
      const params = new URLSearchParams()
      if (options.soloNoLeidas) params.append('solo_no_leidas', 'true')
      if (options.tipo) params.append('tipo', options.tipo)
      if (options.categoria) params.append('categoria', options.categoria)
      if (options.prioridad) params.append('prioridad', options.prioridad)
      if (options.limit) params.append('limit', options.limit.toString())
      if (scoutId) params.append('scout_id', scoutId.toString())

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/notificaciones_familia/listar?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const notificacionesData = result.data || []

      setNotificaciones(notificacionesData)
      lastFetchRef.current = Date.now() // CRIT-002: Track last fetch

      // CRIT-002: Save to versioned cache if not filtering
      if (!options.soloNoLeidas) {
        localStorage.setItem(versionedKey, JSON.stringify(notificacionesData))
        localStorage.setItem(`${versionedKey}-timestamp`, Date.now().toString())
      }

      return notificacionesData

    } catch (err) {
      console.error('Error fetching notificaciones:', err)

      // CRIT-002: Only use cache as fallback, NO hardcoded static data
      const baseKey = scoutId ? `${cacheKey}-${scoutId}` : cacheKey
      const versionedKey = getVersionedCacheKey(baseKey)
      const cached = localStorage.getItem(versionedKey)

      if (cached) {
        const cachedData = JSON.parse(cached)
        setNotificaciones(cachedData)
        setError('Error de conexion. Mostrando datos guardados localmente.')
        return cachedData
      } else {
        // CRIT-002: Return empty array instead of hardcoded fallback data
        setError('No se pudieron cargar las notificaciones. Verifica tu conexion.')
        setNotificaciones([])
        return []
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token, user, cacheKey, scoutId, getVersionedCacheKey])

  // Obtener preferencias
  const fetchPreferencias = useCallback(async () => {
    if (!isAuthenticated || !token || !user) {
      return
    }

    setLoadingPreferencias(true)

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/notificaciones_familia/preferencias`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setPreferencias(result.data)

    } catch (err) {
      console.error('Error fetching preferencias:', err)

      // Preferencias de fallback
      const fallbackPreferencias: PreferenciasNotificacion = {
        id: 1,
        familiar_id: user?.id || 1,
        email_habilitado: true,
        email_urgentes: true,
        email_importantes: true,
        email_informativos: false,
        email_resumen_semanal: true,
        sms_habilitado: true,
        sms_solo_urgentes: true,
        push_habilitado: true,
        push_urgentes: true,
        push_importantes: true,
        horario_inicio: "09:00",
        horario_fin: "21:00",
        fin_de_semana_diferenciado: false,
        horario_fin_semana_inicio: "10:00",
        horario_fin_semana_fin: "20:00",
        modo_no_molestar: false,
        vacaciones_activo: false,
        frecuencia_notificaciones: "inmediatas",
        contactos_adicionales: []
      }
      setPreferencias(fallbackPreferencias)
    } finally {
      setLoadingPreferencias(false)
    }
  }, [isAuthenticated, token, user])

  // Marcar como leída
  const marcarComoLeida = useCallback(async (notificacionId: number) => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/notificaciones_familia/marcar-leida/${notificacionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Actualizar estado local
      setNotificaciones(prev => prev.map(notif =>
        notif.id === notificacionId
          ? { ...notif, estado: 'leida', fecha_lectura: new Date().toISOString() }
          : notif
      ))

      // CRIT-002: Invalidate cache after action
      invalidateCache()

      return true
    } catch (err) {
      console.error('Error marcando notificación como leída:', err)
      setError('Error al marcar la notificación como leída')
      return false
    }
  }, [token, invalidateCache])

  // Marcar todas como leídas
  const marcarTodasComoLeidas = useCallback(async () => {
    if (!token) return false

    try {
      const params = scoutId ? `?scout_id=${scoutId}` : ''
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/notificaciones_familia/marcar-todas-leidas${params}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // Actualizar estado local
      setNotificaciones(prev => prev.map(notif => ({
        ...notif,
        estado: 'leida',
        fecha_lectura: new Date().toISOString()
      })))

      // CRIT-002: Invalidate cache after action
      invalidateCache()

      return result.afectadas || 0
    } catch (err) {
      console.error('Error marcando todas las notificaciones como leídas:', err)
      setError('Error al marcar todas las notificaciones como leídas')
      return false
    }
  }, [token, scoutId, invalidateCache])

  // Archivar notificación
  const archivarNotificacion = useCallback(async (notificacionId: number) => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/notificaciones_familia/archivar/${notificacionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Actualizar estado local
      setNotificaciones(prev => prev.map(notif =>
        notif.id === notificacionId
          ? { ...notif, estado: 'archivada', fecha_archivado: new Date().toISOString() }
          : notif
      ))

      // CRIT-002: Invalidate cache after action
      invalidateCache()

      return true
    } catch (err) {
      console.error('Error archivando notificación:', err)
      setError('Error al archivar la notificación')
      return false
    }
  }, [token, invalidateCache])

  // Eliminar notificación
  const eliminarNotificacion = useCallback(async (notificacionId: number) => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/notificaciones_familia/eliminar/${notificacionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Actualizar estado local
      setNotificaciones(prev => prev.filter(notif => notif.id !== notificacionId))

      // CRIT-002: Invalidate cache after action
      invalidateCache()

      return true
    } catch (err) {
      console.error('Error eliminando notificación:', err)
      setError('Error al eliminar la notificación')
      return false
    }
  }, [token, invalidateCache])

  // Actualizar preferencias
  const actualizarPreferencias = useCallback(async (nuevasPreferencias: Partial<PreferenciasNotificacion>) => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/notificaciones_familia/actualizar-preferencias`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevasPreferencias)
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setPreferencias(result.data)

      return true
    } catch (err) {
      console.error('Error actualizando preferencias:', err)
      setError('Error al actualizar las preferencias')
      return false
    }
  }, [token])

  // Enviar mensaje a monitor
  const enviarMensajeMonitor = useCallback(async (mensaje: {
    scout_id: number
    asunto: string
    contenido: string
    categoria: CategoriaNotificacion
    urgencia?: TipoNotificacion
  }) => {
    if (!token) return { success: false, message: 'No autenticado' }

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/notificaciones_familia/enviar-mensaje`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mensaje)
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // Refrescar notificaciones
      fetchNotificaciones()

      return { success: true, data: result.data }
    } catch (err) {
      console.error('Error enviando mensaje a monitor:', err)
      return { success: false, message: 'Error al enviar el mensaje' }
    }
  }, [token, fetchNotificaciones])

  // Obtener contador de no leídas
  const getContadorNoLeidas = useCallback(async () => {
    if (!isAuthenticated || !token || !user) {
      return 0
    }

    try {
      const params = scoutId ? `?scout_id=${scoutId}` : ''
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/notificaciones_familia/contador-no-leidas${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data?.no_leidas || 0
    } catch (err) {
      console.error('Error obteniendo contador de no leídas:', err)
      return notificaciones.filter(n => n.estado === 'no_leida').length
    }
  }, [isAuthenticated, token, user, scoutId, notificaciones])

  // Refetch
  const refetch = useCallback(async () => {
    await fetchNotificaciones()
  }, [fetchNotificaciones])

  // CRIT-002: Force refresh - invalidates cache and fetches fresh data
  const forceRefresh = useCallback(async () => {
    setIsRefreshing(true)
    invalidateCache()
    try {
      await fetchNotificaciones({ skipCache: true })
    } finally {
      setIsRefreshing(false)
    }
  }, [invalidateCache, fetchNotificaciones])

  // Efectos
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificaciones()
      fetchPreferencias()
    }
  }, [isAuthenticated, fetchNotificaciones, fetchPreferencias])

  // CRIT-002: Polling when component is visible
  useEffect(() => {
    if (!enablePolling || !isAuthenticated) return

    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      pollingIntervalRef.current = setInterval(() => {
        // Only fetch if document is visible
        if (document.visibilityState === 'visible') {
          fetchNotificaciones({ soloNoLeidas: true })
        }
      }, POLLING_INTERVAL)
    }

    startPolling()

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [enablePolling, isAuthenticated, fetchNotificaciones])

  // CRIT-002: Refetch when window becomes visible
  useEffect(() => {
    if (!enableVisibilityRefetch || !isAuthenticated) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if enough time has passed since last fetch
        const timeSinceLastFetch = Date.now() - lastFetchRef.current
        if (timeSinceLastFetch > CACHE_TTL) {
          fetchNotificaciones({ skipCache: true })
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enableVisibilityRefetch, isAuthenticated, fetchNotificaciones])

  // Auto-refetch (legacy support)
  useEffect(() => {
    if (!autoRefetch || !isAuthenticated) return

    const interval = setInterval(() => {
      fetchNotificaciones({ soloNoLeidas: true })
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [autoRefetch, refetchInterval, fetchNotificaciones, isAuthenticated])

  return {
    // Datos
    notificaciones,
    preferencias,

    // Estados de carga
    loading,
    loadingPreferencias,
    error,
    isRefreshing, // CRIT-002: Expose refresh state

    // Acciones
    refetch,
    forceRefresh, // CRIT-002: Force refresh with cache invalidation
    invalidateCache, // CRIT-002: Manually invalidate cache
    marcarComoLeida,
    marcarTodasComoLeidas,
    archivarNotificacion,
    eliminarNotificacion,
    actualizarPreferencias,
    enviarMensajeMonitor,
    getContadorNoLeidas,

    // Métodos de filtrado
    fetchNotificaciones
  }
}

// Hook para estadísticas de notificaciones
export function useNotificacionesStats(scoutId?: number) {
  const { notificaciones } = useNotificacionesFamilia({ scoutId })

  const stats = {
    total: notificaciones.length,
    noLeidas: notificaciones.filter(n => n.estado === 'no_leida').length,
    leidas: notificaciones.filter(n => n.estado === 'leida').length,
    archivadas: notificaciones.filter(n => n.estado === 'archivada').length,
    urgentes: notificaciones.filter(n => n.tipo === 'urgente').length,
    importantes: notificaciones.filter(n => n.tipo === 'importante').length,
    informativas: notificaciones.filter(n => n.tipo === 'informativo').length,
    recordatorios: notificaciones.filter(n => n.tipo === 'recordatorio').length,
    mensajesScouter: notificaciones.filter(n => n.tipo === 'mensaje_scouter').length, // MED-005
    documentos: notificaciones.filter(n => n.categoria === 'documentos').length,
    actividades: notificaciones.filter(n => n.categoria === 'actividades').length,
    galeria: notificaciones.filter(n => n.categoria === 'galeria').length,
    general: notificaciones.filter(n => n.categoria === 'general').length,
    comunicados: notificaciones.filter(n => n.categoria === 'comunicados').length,
    prioridadAlta: notificaciones.filter(n => n.prioridad === 'alta').length,
    prioridadNormal: notificaciones.filter(n => n.prioridad === 'normal').length,
    prioridadBaja: notificaciones.filter(n => n.prioridad === 'baja').length,
  }

  return stats
}

// Hook para plantillas de mensaje
export function usePlantillasMensaje() {
  const [plantillas, setPlantillas] = useState<PlantillaMensaje[]>([])
  const [loading, setLoading] = useState(false)
  const { token, isAuthenticated } = useAuth()

  const fetchPlantillas = useCallback(async () => {
    if (!isAuthenticated || !token) return

    setLoading(true)
    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/notificaciones_familia/plantillas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setPlantillas(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching plantillas:', err)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    fetchPlantillas()
  }, [fetchPlantillas])

  // Plantillas predefinidas
  const plantillasPredefinidas: PlantillaMensaje[] = [
    {
      id: -1,
      nombre: "Ausencia justificada",
      asunto: "Ausencia de {{nombre_scout}} - {{fecha_actividad}}",
      contenido: "Estimado/a monitor/a,\n\nLe comunico que {{nombre_scout}} no podrá asistir a la actividad del día {{fecha_actividad}} debido a {{motivo}}.\n\nAgradezco su comprensión.\n\nAtentamente,\n{{nombre_familiar}}",
      categoria: "actividades",
      variables: ["nombre_scout", "fecha_actividad", "motivo", "nombre_familiar"]
    },
    {
      id: -2,
      nombre: "Consulta documento",
      asunto: "Consulta sobre documento requerido - {{nombre_scout}}",
      contenido: "Estimado/a monitor/a,\n\nMe gustaría saber qué documentación necesito proporcionar para {{nombre_scout}} para {{tipo_documento}}.\n\nSi hubiera algún formulario o plazo específico, agradezco que me lo indiquen.\n\nMuchas gracias,\n{{nombre_familiar}}",
      categoria: "documentos",
      variables: ["nombre_scout", "tipo_documento", "nombre_familiar"]
    },
    {
      id: -3,
      nombre: "Duda actividad próxima",
      asunto: "Duda sobre actividad - {{nombre_actividad}}",
      contenido: "Hola,\n\nTengo una pregunta sobre la actividad \"{{nombre_actividad}}\" del día {{fecha_actividad}}.\n\n{{consulta_especifica}}\n\nGracias por su ayuda,\n{{nombre_familiar}}",
      categoria: "actividades",
      variables: ["nombre_actividad", "fecha_actividad", "consulta_especifica", "nombre_familiar"]
    },
    {
      id: -4,
      nombre: "Información médica",
      asunto: "Información médica importante - {{nombre_scout}}",
      contenido: "Estimado/a monitor/a,\n\nQuiero comunicarle que {{nombre_scout}} tiene {{informacion_medica}} que es importante que conozcan para las actividades.\n\n{{detalles_adicionales}}\n\nSi necesitan más información o algún documento médico, por favor avísenme.\n\nAtentamente,\n{{nombre_familiar}}",
      categoria: "general",
      variables: ["nombre_scout", "informacion_medica", "detalles_adicionales", "nombre_familiar"]
    },
    {
      id: -5,
      nombre: "Contacto general",
      asunto: "Contacto - {{nombre_familiar}} ({{nombre_scout}})",
      contenido: "Hola,\n\nSoy {{nombre_familiar}}, padre/madre/tutor de {{nombre_scout}} de la sección {{seccion}}.\n\n{{motivo_contacto}}\n\nQuedo a su disposición para cualquier cosa que necesiten.\n\nGracias,\n{{nombre_familiar}}\n{{telefono_contacto}}",
      categoria: "general",
      variables: ["nombre_familiar", "nombre_scout", "seccion", "motivo_contacto", "telefono_contacto"]
    }
  ]

  return {
    plantillas: [...plantillas, ...plantillasPredefinidas],
    loading,
    refetch: fetchPlantillas
  }
}