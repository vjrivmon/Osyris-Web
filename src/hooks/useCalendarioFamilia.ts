'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getApiUrl } from '@/lib/api-utils'
import { useFamiliaData } from './useFamiliaData'

export interface ActividadCalendario {
  id: string
  titulo: string
  descripcion: string
  fechaInicio: Date
  fechaFin: Date
  lugar: string
  seccion: string
  seccion_id: number
  scoutIds: string[] // IDs de los hijos del familiar que participan
  monitorResponsable: {
    nombre: string
    foto: string
    contacto: string
  }
  precio?: number
  cupoMaximo?: number
  materialNecesario: string[]
  confirmaciones: {
    [scoutId: string]: 'confirmado' | 'pendiente' | 'no_asiste'
  }
  tipo: 'actividad' | 'campamento' | 'jornada' | 'reunion' | 'evento'
  coordenadas?: {
    lat: number
    lng: number
  }
}

export interface ConfirmacionAsistencia {
  id: string
  actividadId: string
  scoutId: string
  estado: 'confirmado' | 'pendiente' | 'no_asiste'
  comentario?: string
  fechaConfirmacion: Date
}

interface UseCalendarioFamiliaOptions {
  autoRefetch?: boolean
  refetchInterval?: number
  cacheKey?: string
}

interface UseCalendarioFamiliaReturn {
  actividades: ActividadCalendario[]
  loading: boolean
  error: string | null
  confirmaciones: ConfirmacionAsistencia[]

  // Funciones
  refetch: () => Promise<void>
  confirmarAsistencia: (actividadId: string, scoutId: string, estado: 'confirmado' | 'no_asiste', comentario?: string) => Promise<boolean>
  modificarConfirmacion: (confirmacionId: string, estado: 'confirmado' | 'no_asiste', comentario?: string) => Promise<boolean>

  // Filtros y utilidades
  actividadesPorMes: (year: number, month: number) => ActividadCalendario[]
  actividadesPorSeccion: (seccionId: number) => ActividadCalendario[]
  actividadesPorScout: (scoutId: string) => ActividadCalendario[]
  proximasActividades: (dias?: number) => ActividadCalendario[]
  actividadesPendientesConfirmacion: () => ActividadCalendario[]
  generarICS: (actividad: ActividadCalendario) => string
}

export function useCalendarioFamilia({
  autoRefetch = true,
  refetchInterval = 5 * 60 * 1000, // 5 minutos
  cacheKey = 'calendario-familia-data'
}: UseCalendarioFamiliaOptions = {}): UseCalendarioFamiliaReturn {
  const { user, token, isAuthenticated } = useAuth()
  const { hijos } = useFamiliaData()
  const [actividades, setActividades] = useState<ActividadCalendario[]>([])
  const [confirmaciones, setConfirmaciones] = useState<ConfirmacionAsistencia[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Colores por sección scout
  const coloresSeccion = {
    'Colonia La Veleta': '#FF6B35', // Naranja
    'Manada Waingunga': '#FFD93D', // Amarillo
    'Tropa Brownsea': '#6BCF7F', // Verde
    'Posta Kanhiwara': '#E74C3C', // Rojo
    'Ruta Walhalla': '#2E7D32' // Verde botella
  }

  const fetchActividades = useCallback(async () => {
    if (!isAuthenticated || !token || !user || !hijos?.length) {
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
          const data = JSON.parse(cached)
          setActividades(data.actividades.map((a: any) => ({
            ...a,
            fechaInicio: new Date(a.fechaInicio),
            fechaFin: new Date(a.fechaFin)
          })))
          setLoading(false)
          return
        }
      }

      // Obtener IDs de los hijos
      const hijosIds = hijos.map(h => h.id.toString())

      // Obtener actividades desde API
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/familia/actividades/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Procesar actividades
      const actividadesProcesadas = data.map((actividad: any) => ({
        ...actividad,
        fechaInicio: new Date(actividad.fechaInicio),
        fechaFin: new Date(actividad.fechaFin),
        scoutIds: hijosIds.filter(id => actividad.scoutIds?.includes(id)),
        confirmaciones: actividad.confirmaciones || {}
      }))

      setActividades(actividadesProcesadas)

      // Guardar en cache
      localStorage.setItem(cacheKey, JSON.stringify({ actividades: actividadesProcesadas }))
      localStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString())

    } catch (err) {
      // Si el endpoint no existe, simplemente no cargamos actividades (sin mostrar error)
      console.log('ℹ️ [useCalendarioFamilia] Endpoint de actividades no disponible todavía')
      setActividades([])
      setError(null) // No mostrar error
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token, user, hijos, cacheKey, refetchInterval])

  const confirmarAsistencia = useCallback(async (
    actividadId: string,
    scoutId: string,
    estado: 'confirmado' | 'no_asiste',
    comentario?: string
  ): Promise<boolean> => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/confirmaciones/confirmar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actividadId,
          scoutId,
          estado,
          comentario
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const confirmacion = await response.json()

      // Actualizar estado local
      setActividades(prev => prev.map(actividad =>
        actividad.id === actividadId
          ? {
              ...actividad,
              confirmaciones: {
                ...actividad.confirmaciones,
                [scoutId]: estado
              }
            }
          : actividad
      ))

      setConfirmaciones(prev => [...prev, {
        ...confirmacion,
        fechaConfirmacion: new Date(confirmacion.fechaConfirmacion)
      }])

      // Invalidar cache
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(`${cacheKey}-timestamp`)

      return true
    } catch (err) {
      console.error('Error confirmando asistencia:', err)
      setError('Error al confirmar asistencia')
      return false
    }
  }, [token, cacheKey])

  const modificarConfirmacion = useCallback(async (
    confirmacionId: string,
    estado: 'confirmado' | 'no_asiste',
    comentario?: string
  ): Promise<boolean> => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/confirmaciones/modificar/${confirmacionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado,
          comentario
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const confirmacionActualizada = await response.json()

      // Actualizar estado local
      setConfirmaciones(prev => prev.map(conf =>
        conf.id === confirmacionId
          ? {
              ...conf,
              estado,
              comentario: comentario || conf.comentario,
              fechaConfirmacion: new Date()
            }
          : conf
      ))

      setActividades(prev => prev.map(actividad => {
        const confirmacion = confirmaciones.find(c => c.id === confirmacionId)
        if (confirmacion && actividad.id === confirmacion.actividadId) {
          return {
            ...actividad,
            confirmaciones: {
              ...actividad.confirmaciones,
              [confirmacion.scoutId]: estado
            }
          }
        }
        return actividad
      }))

      // Invalidar cache
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(`${cacheKey}-timestamp`)

      return true
    } catch (err) {
      console.error('Error modificando confirmación:', err)
      setError('Error al modificar confirmación')
      return false
    }
  }, [token, cacheKey, confirmaciones])

  // Funciones de utilidad
  const actividadesPorMes = useCallback((year: number, month: number) => {
    return actividades.filter(actividad => {
      const fecha = new Date(actividad.fechaInicio)
      return fecha.getFullYear() === year && fecha.getMonth() === month - 1
    })
  }, [actividades])

  const actividadesPorSeccion = useCallback((seccionId: number) => {
    return actividades.filter(actividad => actividad.seccion_id === seccionId)
  }, [actividades])

  const actividadesPorScout = useCallback((scoutId: string) => {
    return actividades.filter(actividad => actividad.scoutIds.includes(scoutId))
  }, [actividades])

  const proximasActividades = useCallback((dias = 30) => {
    const ahora = new Date()
    const limite = new Date(ahora.getTime() + dias * 24 * 60 * 60 * 1000)

    return actividades
      .filter(actividad => actividad.fechaInicio >= ahora && actividad.fechaInicio <= limite)
      .sort((a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime())
  }, [actividades])

  const actividadesPendientesConfirmacion = useCallback(() => {
    return actividades.filter(actividad => {
      const ahora = new Date()
      const fechaLimite = new Date(actividad.fechaInicio.getTime() - 24 * 60 * 60 * 1000) // 24 horas antes

      return actividad.fechaInicio > ahora &&
             actividad.fechaInicio > fechaLimite &&
             actividad.scoutIds.some(scoutId =>
               actividad.confirmaciones[scoutId] === 'pendiente' ||
               !actividad.confirmaciones[scoutId]
             )
    })
  }, [actividades])

  const generarICS = useCallback((actividad: ActividadCalendario): string => {
    const formatearFecha = (fecha: Date) => {
      return fecha.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '')
    }

    const inicio = formatearFecha(actividad.fechaInicio)
    const fin = formatearFecha(actividad.fechaFin)

    // Escapar caracteres especiales para ICS
    const escapeText = (text: string) => {
      return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Osyris Scout Management//Calendario//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${actividad.id}@osyris-scout.es`,
      `DTSTART:${inicio}`,
      `DTEND:${fin}`,
      `SUMMARY:${escapeText(actividad.titulo)}`,
      `DESCRIPTION:${escapeText(actividad.descripcion + '\\n\\nLugar: ' + actividad.lugar + '\\nSección: ' + actividad.seccion)}`,
      `LOCATION:${escapeText(actividad.lugar)}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      `END:VEVENT`,
      'END:VCALENDAR'
    ].join('\r\n')

    return icsContent
  }, [])

  // Efecto inicial
  useEffect(() => {
    if (isAuthenticated && token && user && hijos && hijos.length > 0) {
      fetchActividades()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, user?.id, hijos?.length])

  // Auto-refetch
  useEffect(() => {
    if (!autoRefetch || !isAuthenticated || !hijos || hijos.length === 0) return

    const interval = setInterval(() => {
      fetchActividades()
    }, refetchInterval)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefetch, refetchInterval, isAuthenticated, hijos?.length])

  const refetch = useCallback(async () => {
    await fetchActividades()
  }, [fetchActividades])

  return {
    actividades,
    loading,
    error,
    confirmaciones,
    refetch,
    confirmarAsistencia,
    modificarConfirmacion,
    actividadesPorMes,
    actividadesPorSeccion,
    actividadesPorScout,
    proximasActividades,
    actividadesPendientesConfirmacion,
    generarICS
  }
}