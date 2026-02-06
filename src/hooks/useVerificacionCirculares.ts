'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Circular {
  id: number
  actividad_id: number
  educando_id: number
  circular_firmada_drive_id: string | null
  circular_firmada_url: string | null
  fecha_subida_circular: string | null
  circular_verificada: boolean
  circular_verificada_por: number | null
  circular_verificada_fecha: string | null
  pagado: boolean
  estado: string
  educando_nombre: string
  educando_apellidos: string
  seccion_nombre: string
  seccion_id: number
  seccion_color: string
  familiar_nombre: string | null
  familiar_apellidos: string | null
  verificador_nombre: string | null
  verificador_apellidos: string | null
}

interface EstadisticasVerificacion {
  total_subidas: number
  verificadas: number
  pendientes_verificar: number
  sin_subir: number
}

interface UseVerificacionCircularesReturn {
  circulares: Circular[]
  estadisticas: EstadisticasVerificacion | null
  loading: boolean
  error: string | null
  verificarCircular: (inscripcionId: number) => Promise<void>
  refresh: () => Promise<void>
}

export function useVerificacionCirculares(actividadId: number, seccionId?: number): UseVerificacionCircularesReturn {
  const { token } = useAuth()
  const [circulares, setCirculares] = useState<Circular[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasVerificacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const fetchData = useCallback(async () => {
    if (!actividadId || !token) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (seccionId) params.append('seccion_id', String(seccionId))

      const [circularesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/inscripciones-campamento/actividad/${actividadId}/circulares-pendientes?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/inscripciones-campamento/actividad/${actividadId}/estadisticas-verificacion?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (!circularesRes.ok || !statsRes.ok) {
        throw new Error('Error al cargar datos de verificación')
      }

      const [circularesData, statsData] = await Promise.all([
        circularesRes.json(),
        statsRes.json()
      ])

      setCirculares(circularesData.data || [])
      setEstadisticas(statsData.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [actividadId, seccionId, token, API_URL])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const verificarCircular = async (inscripcionId: number) => {
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/inscripciones-campamento/${inscripcionId}/verificar-circular`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al verificar circular')
      }

      // Refrescar datos
      await fetchData()
    } catch (err) {
      throw err
    }
  }

  return {
    circulares,
    estadisticas,
    loading,
    error,
    verificarCircular,
    refresh: fetchData
  }
}
