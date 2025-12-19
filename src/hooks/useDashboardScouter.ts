'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Types para el dashboard
export interface Actividad {
  id: number
  titulo: string
  fecha_inicio: string
  fecha_fin?: string
  hora_inicio?: string
  hora_fin?: string
  lugar?: string
  precio?: number
  tipo: string
  seccion_id?: number
  seccion_nombre?: string
  circular_drive_id?: string
  circular_drive_url?: string
}

export interface EstadisticasSabado {
  confirmados: number
  noAsisten: number
  pendientes: number
  total: number
}

export interface EstadisticasCampamento {
  inscritos: number
  pendientes: number
  noAsisten: number
  pagados: number
  sinPagar: number
  circularesSubidas: number
  justificantesSubidos: number
  sinResponder: number
  total: number
}

export interface ConfirmacionSabado {
  id: number
  asistira: boolean
  comentarios?: string
  confirmado_en: string
  educando_id: number
  educando_nombre: string
  educando_apellidos: string
  familiar_nombre?: string
  familiar_apellidos?: string
}

export interface InscripcionCampamento {
  id: number
  estado: string
  pagado: boolean
  asistira: boolean
  circular_firmada_drive_id?: string
  justificante_pago_drive_id?: string
  created_at: string
  educando_id: number
  educando_nombre: string
  educando_apellidos: string
  familiar_nombre?: string
  familiar_apellidos?: string
}

export interface ScoutSinConfirmar {
  id: number
  nombre: string
  apellidos: string
}

export interface ProximoSabado {
  actividad: Actividad
  estadisticas: EstadisticasSabado
  confirmaciones?: ConfirmacionSabado[]
  scouts_sin_confirmar?: ScoutSinConfirmar[]
}

export interface ProximoCampamento {
  actividad: Actividad
  estadisticas: EstadisticasCampamento
  inscripciones?: InscripcionCampamento[]
  educandos_sin_inscribir?: ScoutSinConfirmar[]
}

export interface NotificacionReciente {
  id: number
  educando_id: number
  educando_nombre: string
  educando_apellidos?: string
  seccion_id: number
  seccion_nombre?: string
  seccion_color?: string
  tipo: string
  titulo: string
  mensaje: string
  enlace_accion?: string
  metadata?: Record<string, unknown>
  prioridad: string
  leida: boolean
  fecha_creacion: string
}

export interface DocumentoPendiente {
  id: number
  tipo_documento: string
  titulo: string
  archivo_nombre: string
  archivo_ruta: string
  fecha_subida: string
  estado: string
  estado_revision: string
  educando_id: number
  educando_nombre: string
  educando_apellidos: string
  seccion_nombre?: string
  seccion_color?: string
}

export interface DashboardData {
  proximoSabado: ProximoSabado | null
  proximoCampamento: ProximoCampamento | null
  actividadReciente: NotificacionReciente[]
  documentosPendientes: DocumentoPendiente[]
  seccionId: number | null
  seccionNombre: string | null
}

export function useDashboardScouter() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sabadoExpanded, setSabadoExpanded] = useState(false)
  const [campamentoExpanded, setCampamentoExpanded] = useState(false)
  const previousUserId = useRef<number | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // IMPORTANTE: Resetear todo el estado cuando cambia el usuario
  useEffect(() => {
    const currentUserId = user?.id ?? null

    // Si el usuario cambió (incluyendo logout), resetear todo el estado
    if (previousUserId.current !== currentUserId) {
      console.log('🔄 [useDashboardScouter] Usuario cambió, reseteando estado...')
      setData(null)
      setError(null)
      setSabadoExpanded(false)
      setCampamentoExpanded(false)
      previousUserId.current = currentUserId
    }
  }, [user?.id])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Cargar resumen del dashboard
  const fetchDashboardSummary = useCallback(async (options?: {
    expandSabado?: boolean
    expandCampamento?: boolean
  }) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options?.expandSabado) params.append('expandSabado', 'true')
      if (options?.expandCampamento) params.append('expandCampamento', 'true')

      const response = await fetch(
        `${API_URL}/api/dashboard-scouter/summary?${params.toString()}`,
        { headers: getAuthHeaders() }
      )

      if (!response.ok) {
        throw new Error('Error cargando datos del dashboard')
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setSabadoExpanded(!!options?.expandSabado)
        setCampamentoExpanded(!!options?.expandCampamento)
      } else {
        throw new Error(result.message || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [API_URL])

  // Obtener detalle del proximo sabado
  const fetchSabadoDetalle = useCallback(async (actividadId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/dashboard-scouter/sabado/${actividadId}/detalle`,
        { headers: getAuthHeaders() }
      )

      if (!response.ok) {
        throw new Error('Error cargando detalle del sabado')
      }

      const result = await response.json()
      if (result.success && data) {
        setData(prev => prev ? {
          ...prev,
          proximoSabado: prev.proximoSabado ? {
            ...prev.proximoSabado,
            confirmaciones: result.data.confirmaciones,
            scouts_sin_confirmar: result.data.scouts_sin_confirmar,
            estadisticas: result.data.estadisticas
          } : null
        } : null)
        setSabadoExpanded(true)
        return result.data
      }
    } catch (err) {
      console.error('Error fetching sabado detalle:', err)
      throw err
    }
  }, [API_URL, data])

  // Obtener detalle del proximo campamento
  const fetchCampamentoDetalle = useCallback(async (actividadId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/dashboard-scouter/campamento/${actividadId}/detalle`,
        { headers: getAuthHeaders() }
      )

      if (!response.ok) {
        throw new Error('Error cargando detalle del campamento')
      }

      const result = await response.json()
      if (result.success && data) {
        setData(prev => prev ? {
          ...prev,
          proximoCampamento: prev.proximoCampamento ? {
            ...prev.proximoCampamento,
            inscripciones: result.data.inscripciones,
            estadisticas: result.data.estadisticas,
            educandos_sin_inscribir: result.data.educandos_sin_inscribir
          } : null
        } : null)
        setCampamentoExpanded(true)
        return result.data
      }
    } catch (err) {
      console.error('Error fetching campamento detalle:', err)
      throw err
    }
  }, [API_URL, data])

  // Expandir/contraer sabado
  const toggleSabadoExpanded = useCallback(async () => {
    if (!sabadoExpanded && data?.proximoSabado?.actividad.id) {
      await fetchSabadoDetalle(data.proximoSabado.actividad.id)
    } else {
      setSabadoExpanded(!sabadoExpanded)
    }
  }, [sabadoExpanded, data, fetchSabadoDetalle])

  // Expandir/contraer campamento
  const toggleCampamentoExpanded = useCallback(async () => {
    if (!campamentoExpanded && data?.proximoCampamento?.actividad.id) {
      await fetchCampamentoDetalle(data.proximoCampamento.actividad.id)
    } else {
      setCampamentoExpanded(!campamentoExpanded)
    }
  }, [campamentoExpanded, data, fetchCampamentoDetalle])

  // Cargar datos iniciales
  useEffect(() => {
    fetchDashboardSummary()
  }, [fetchDashboardSummary])

  // Refrescar datos
  const refresh = useCallback(() => {
    fetchDashboardSummary({
      expandSabado: sabadoExpanded,
      expandCampamento: campamentoExpanded
    })
  }, [fetchDashboardSummary, sabadoExpanded, campamentoExpanded])

  // Limpiar todas las notificaciones
  const limpiarNotificaciones = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/dashboard-scouter/notificaciones`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      )

      if (!response.ok) {
        throw new Error('Error limpiando notificaciones')
      }

      const result = await response.json()
      if (result.success) {
        // Actualizar el estado local eliminando las notificaciones
        setData(prev => prev ? {
          ...prev,
          actividadReciente: []
        } : null)
        return result.eliminadas
      } else {
        throw new Error(result.message || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error limpiando notificaciones:', err)
      throw err
    }
  }, [API_URL])

  return {
    // Datos
    data,
    proximoSabado: data?.proximoSabado,
    proximoCampamento: data?.proximoCampamento,
    actividadReciente: data?.actividadReciente || [],
    documentosPendientes: data?.documentosPendientes || [],
    seccionId: data?.seccionId,
    seccionNombre: data?.seccionNombre,

    // Estados
    loading,
    error,
    sabadoExpanded,
    campamentoExpanded,

    // Acciones
    fetchDashboardSummary,
    fetchSabadoDetalle,
    fetchCampamentoDetalle,
    toggleSabadoExpanded,
    toggleCampamentoExpanded,
    refresh,
    limpiarNotificaciones
  }
}
