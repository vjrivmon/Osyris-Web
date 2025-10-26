'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getApiUrl } from '@/lib/api-utils'

interface AlertaUrgente {
  id: number
  tipo: 'documento' | 'actividad' | 'mensaje' | 'pago' | 'medico'
  titulo: string
  descripcion: string
  prioridad: 'alta' | 'media' | 'baja'
  fecha_creacion: string
  fecha_limite?: string
  leido: boolean
  accion?: {
    texto: string
    href: string
    metodo?: 'get' | 'post'
  }
  scout_nombre?: string
  seccion?: string
}

interface ActividadProxima {
  id: number
  titulo: string
  descripcion?: string
  fecha: string
  hora_inicio: string
  hora_fin?: string
  lugar: string
  seccion: string
  tipo: 'jornada' | 'campamento' | 'reunion' | 'taller' | 'especial'
  estado: 'confirmada' | 'pendiente' | 'cancelada'
  confirmacion: 'pendiente' | 'confirmado' | 'rechazado'
  costo?: number
  requiere_autorizacion?: boolean
  fecha_limite_confirmacion?: string
  scout_id?: number
  scout_nombre?: string
  monitores?: string[]
  material_requerido?: string[]
}

interface NotificacionNoLeida {
  id: number
  tipo: 'mensaje' | 'actividad' | 'documento' | 'general'
  titulo: string
  mensaje: string
  remitente: string
  fecha_envio: string
  leida: boolean
  accion?: {
    texto: string
    href: string
  }
  scout_nombre?: string
}

interface Estadisticas {
  actividadesMes: number
  documentosPendientes: number
  mensajesNoLeidos: number
  proximaActividad?: string
  hijosActivos: number
  progresoGeneral: number
}

interface UseDashboardDataOptions {
  autoRefetch?: boolean
  refetchInterval?: number
  cacheKey?: string
}

interface UseDashboardDataReturn {
  alertas: AlertaUrgente[] | null
  actividades: ActividadProxima[] | null
  notificaciones: NotificacionNoLeida[] | null
  estadisticas: Estadisticas | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  marcarAlertaComoLeida: (alertaId: number) => Promise<boolean>
  confirmarActividad: (actividadId: number, confirmado: boolean) => Promise<boolean>
  marcarNotificacionComoLeida: (notificacionId: number) => Promise<boolean>
}

export function useDashboardData({
  autoRefetch = true,
  refetchInterval = 5 * 60 * 1000, // 5 minutos
  cacheKey = 'dashboard-data'
}: UseDashboardDataOptions = {}): UseDashboardDataReturn {
  const { user, token, isAuthenticated } = useAuth()
  const [alertas, setAlertas] = useState<AlertaUrgente[] | null>(null)
  const [actividades, setActividades] = useState<ActividadProxima[] | null>(null)
  const [notificaciones, setNotificaciones] = useState<NotificacionNoLeida[] | null>(null)
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !token || !user) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Intentar obtener desde cache primero
      const cached = localStorage.getItem(cacheKey)
      const cacheTimestamp = localStorage.getItem(`${cacheKey}-timestamp`)
      
      if (cached && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp)
        if (cacheAge < refetchInterval) {
          const cachedData = JSON.parse(cached)
          setAlertas(cachedData.alertas)
          setActividades(cachedData.actividades)
          setNotificaciones(cachedData.notificaciones)
          setEstadisticas(cachedData.estadisticas)
          setLoading(false)
          return
        }
      }

      const apiUrl = getApiUrl()
      
      // Obtener datos del dashboard
      const [alertasRes, actividadesRes, notificacionesRes, statsRes] = await Promise.allSettled([
        fetch(`${apiUrl}/api/familia/alertas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/familia/actividades/proximas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/familia/notificaciones/no-leidas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/familia/estadisticas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      // Procesar alertas
      if (alertasRes.status === 'fulfilled') {
        const alertasData = await alertasRes.value.json()
        setAlertas(alertasData)
      } else {
        // NO usar datos mock - mostrar vacío si no hay datos reales
        setAlertas([])
      }

      // Procesar actividades
      if (actividadesRes.status === 'fulfilled') {
        const actividadesData = await actividadesRes.value.json()
        setActividades(actividadesData)
      } else {
        // NO usar datos mock - mostrar vacío si no hay actividades reales
        setActividades([])
      }

      // Procesar notificaciones
      if (notificacionesRes.status === 'fulfilled') {
        const notificacionesData = await notificacionesRes.value.json()
        setNotificaciones(notificacionesData)
      } else {
        // NO usar datos mock - mostrar vacío si no hay notificaciones reales
        setNotificaciones([])
      }

      // Procesar estadísticas
      if (statsRes.status === 'fulfilled') {
        const statsData = await statsRes.value.json()
        setEstadisticas(statsData)
      } else {
        // Usar datos simulados para estadísticas
        const mockStats: Estadisticas = {
          actividadesMes: 4,
          documentosPendientes: 2,
          mensajesNoLeidos: 3,
          proximaActividad: "Jornada de Integración - 2 Nov",
          hijosActivos: 2,
          progresoGeneral: 65
        }
        setEstadisticas(mockStats)
      }

      // Guardar en cache
      const dashboardData = {
        alertas,
        actividades,
        notificaciones,
        estadisticas
      }
      localStorage.setItem(cacheKey, JSON.stringify(dashboardData))
      localStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString())

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      
      // Si hay error, intentar usar datos del cache aunque sea viejo
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const cachedData = JSON.parse(cached)
        setAlertas(cachedData.alertas)
        setActividades(cachedData.actividades)
        setNotificaciones(cachedData.notificaciones)
        setEstadisticas(cachedData.estadisticas)
        setError('Usando datos guardados localmente')
      } else {
        setError('No se pudieron cargar los datos del dashboard')
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token, user, cacheKey, refetchInterval])

  const refetch = useCallback(async () => {
    await fetchDashboardData()
  }, [fetchDashboardData])

  const marcarAlertaComoLeida = useCallback(async (alertaId: number): Promise<boolean> => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/familia/alertas/${alertaId}/leer`, {
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
      setAlertas(prev => prev ? prev.map(alerta => 
        alerta.id === alertaId ? { ...alerta, leido: true } : alerta
      ) : null)

      // Invalidar cache
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(`${cacheKey}-timestamp`)

      return true
    } catch (err) {
      console.error('Error marking alerta as leida:', err)
      return false
    }
  }, [token, cacheKey])

  const confirmarActividad = useCallback(async (actividadId: number, confirmado: boolean): Promise<boolean> => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/familia/actividades/${actividadId}/confirmar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmado })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Actualizar estado local
      setActividades(prev => prev ? prev.map(actividad => 
        actividad.id === actividadId ? { 
          ...actividad, 
          confirmacion: confirmado ? 'confirmado' : 'rechazado' 
        } : actividad
      ) : null)

      // Invalidar cache
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(`${cacheKey}-timestamp`)

      return true
    } catch (err) {
      console.error('Error confirming actividad:', err)
      return false
    }
  }, [token, cacheKey])

  const marcarNotificacionComoLeida = useCallback(async (notificacionId: number): Promise<boolean> => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/familia/notificaciones/${notificacionId}/leer`, {
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
      setNotificaciones(prev => prev ? prev.map(notificacion => 
        notificacion.id === notificacionId ? { ...notificacion, leida: true } : notificacion
      ) : null)

      // Invalidar cache
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(`${cacheKey}-timestamp`)

      return true
    } catch (err) {
      console.error('Error marking notificacion as leida:', err)
      return false
    }
  }, [token, cacheKey])

  // Efecto inicial
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Auto-refetch
  useEffect(() => {
    if (!autoRefetch) return

    const interval = setInterval(() => {
      fetchDashboardData()
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [autoRefetch, refetchInterval, fetchDashboardData])

  // Refetch cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated, fetchDashboardData])

  return {
    alertas,
    actividades,
    notificaciones,
    estadisticas,
    loading,
    error,
    refetch,
    marcarAlertaComoLeida,
    confirmarActividad,
    marcarNotificacionComoLeida
  }
}

// Hook para obtener alertas urgentes específicas
export function useAlertasUrgentes() {
  const { alertas } = useDashboardData()
  
  return alertas?.filter(alerta => 
    alerta.prioridad === 'alta' && !alerta.leido
  ) || []
}

// Hook para obtener actividades pendientes de confirmación
export function useActividadesPendientes() {
  const { actividades } = useDashboardData()
  
  return actividades?.filter(actividad => 
    actividad.confirmacion === 'pendiente'
  ) || []
}

// Hook para obtener estadísticas rápidas
export function useQuickStats() {
  const { estadisticas } = useDashboardData()
  const { alertas } = useDashboardData()
  const { notificaciones } = useDashboardData()
  
  return {
    alertasCriticas: alertas?.filter(a => a.prioridad === 'alta' && !a.leido).length || 0,
    mensajesNoLeidos: notificaciones?.filter(n => !n.leida).length || 0,
    actividadesMes: estadisticas?.actividadesMes || 0,
    progresoGeneral: estadisticas?.progresoGeneral || 0,
    proximaActividad: estadisticas?.proximaActividad
  }
}