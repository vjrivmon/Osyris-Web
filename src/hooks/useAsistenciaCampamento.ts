'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getApiUrl } from '@/lib/api-utils'

const API_URL = getApiUrl()

interface EducandoAsistencia {
  inscripcion_id: number
  actividad_id: number
  educando_id: number
  estado_inscripcion: string
  educando_nombre: string
  educando_apellidos: string
  seccion_id: number
  seccion_nombre: string
  seccion_color: string
  ha_llegado: boolean
  hora_llegada: string | null
  registrado_por: number | null
  registrado_por_nombre: string | null
  sip_entregado: boolean
  sip_registrado_por: number | null
  sip_registrado_por_nombre: string | null
  sip_hora_registro: string | null
  observaciones: string | null
}

interface Actividad {
  id: number
  titulo: string
  fecha: string
  tipo: string
}

interface Estadisticas {
  total_inscritos: number
  han_llegado: number
  sip_entregados: number
  completos: number
}

interface UseAsistenciaCampamentoReturn {
  educandos: EducandoAsistencia[]
  actividad: Actividad | null
  estadisticas: Estadisticas | null
  loading: boolean
  error: string | null
  marcarLlegada: (educandoId: number, llegado?: boolean) => Promise<void>
  marcarSIP: (educandoId: number, entregado?: boolean) => Promise<void>
  marcarNoAsiste: (educandoId: number, observaciones?: string) => Promise<void>
  actualizarObservaciones: (educandoId: number, observaciones: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useAsistenciaCampamento(actividadId: number, seccionId?: number): UseAsistenciaCampamentoReturn {
  const { token } = useAuth()
  const [educandos, setEducandos] = useState<EducandoAsistencia[]>([])
  const [actividad, setActividad] = useState<Actividad | null>(null)
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!actividadId || !token) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (seccionId) params.append('seccion_id', String(seccionId))

      const [asistenciaRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/asistencia/${actividadId}?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/asistencia/${actividadId}/estadisticas?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (!asistenciaRes.ok) {
        const errData = await asistenciaRes.json()
        throw new Error(errData.message || 'Error al cargar asistencia')
      }

      const asistenciaData = await asistenciaRes.json()
      const statsData = await statsRes.json()

      setEducandos(asistenciaData.data || [])
      setActividad(asistenciaData.actividad || null)
      setEstadisticas(statsData.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [actividadId, seccionId, token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const marcarLlegada = async (educandoId: number, llegado = true) => {
    if (!token) return

    // Optimistic update
    setEducandos(prev => prev.map(e => 
      e.educando_id === educandoId 
        ? { ...e, ha_llegado: llegado, hora_llegada: llegado ? new Date().toISOString() : null }
        : e
    ))

    try {
      const res = await fetch(`${API_URL}/api/asistencia/${actividadId}/educando/${educandoId}/llegada`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ llegado })
      })

      if (!res.ok) throw new Error('Error al marcar llegada')
      
      // Refrescar estadísticas
      const statsRes = await fetch(`${API_URL}/api/asistencia/${actividadId}/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setEstadisticas(statsData.data)
      }
    } catch (err) {
      // Revertir optimistic update
      await fetchData()
      throw err
    }
  }

  const marcarSIP = async (educandoId: number, entregado = true) => {
    if (!token) return

    // Optimistic update
    setEducandos(prev => prev.map(e => 
      e.educando_id === educandoId 
        ? { ...e, sip_entregado: entregado, sip_hora_registro: entregado ? new Date().toISOString() : null }
        : e
    ))

    try {
      const res = await fetch(`${API_URL}/api/asistencia/${actividadId}/educando/${educandoId}/sip`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entregado })
      })

      if (!res.ok) throw new Error('Error al marcar SIP')
      
      // Refrescar estadísticas
      const statsRes = await fetch(`${API_URL}/api/asistencia/${actividadId}/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setEstadisticas(statsData.data)
      }
    } catch (err) {
      await fetchData()
      throw err
    }
  }

  const marcarNoAsiste = async (educandoId: number, observaciones?: string) => {
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/api/asistencia/${actividadId}/educando/${educandoId}/no-asiste`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ observaciones })
      })

      if (!res.ok) throw new Error('Error al marcar no asiste')
      
      await fetchData()
    } catch (err) {
      throw err
    }
  }

  const actualizarObservaciones = async (educandoId: number, observaciones: string) => {
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/api/asistencia/${actividadId}/educando/${educandoId}/observaciones`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ observaciones })
      })

      if (!res.ok) throw new Error('Error al actualizar observaciones')
      
      setEducandos(prev => prev.map(e => 
        e.educando_id === educandoId ? { ...e, observaciones } : e
      ))
    } catch (err) {
      throw err
    }
  }

  return {
    educandos,
    actividad,
    estadisticas,
    loading,
    error,
    marcarLlegada,
    marcarSIP,
    marcarNoAsiste,
    actualizarObservaciones,
    refresh: fetchData
  }
}
