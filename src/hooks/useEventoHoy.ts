'use client'

import { useState, useEffect, useCallback } from 'react'
import { getApiUrl } from '@/lib/api-utils'

const API_URL = getApiUrl()

// Tipos de actividades que activan tabs contextuales
const TIPOS_EVENTO_ESPECIAL = ['campamento', 'salida', 'evento_especial', 'evento']

interface EventoHoy {
  id: number
  titulo: string
  tipo: string
  fecha_inicio: string
  fecha_fin?: string
  lugar?: string
}

interface UseEventoHoyReturn {
  hayEventoHoy: boolean
  evento: EventoHoy | null
  eventos: EventoHoy[]
  loading: boolean
  error: string | null
}

/**
 * Hook para detectar si hay un evento especial HOY
 * (campamento, salida, evento especial)
 * 
 * NO incluye reuniones de sábado normales
 */
export function useEventoHoy(): UseEventoHoyReturn {
  const [eventos, setEventos] = useState<EventoHoy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEventosHoy = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      // Obtener fecha de hoy en formato YYYY-MM-DD
      const hoy = new Date()
      const fechaHoy = hoy.toISOString().split('T')[0]

      // Query actividades del día
      const res = await fetch(`${API_URL}/api/actividades?fecha=${fechaHoy}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error('Error al obtener actividades')
      }

      const data = await res.json()
      const actividades = data.data || data || []

      // Filtrar solo eventos especiales (no reuniones normales)
      const eventosEspeciales = actividades.filter((a: EventoHoy) => {
        // Verificar si es un tipo de evento especial
        if (TIPOS_EVENTO_ESPECIAL.includes(a.tipo?.toLowerCase())) {
          return true
        }
        
        // También incluir si el título contiene palabras clave
        const tituloLower = a.titulo?.toLowerCase() || ''
        const esEventoEspecial = 
          tituloLower.includes('campamento') ||
          tituloLower.includes('campa') ||
          tituloLower.includes('salida') ||
          tituloLower.includes('festival') ||
          tituloLower.includes('jordà') ||
          tituloLower.includes('jorda') ||
          tituloLower.includes('final de ronda') ||
          tituloLower.includes('fin de ronda')

        return esEventoEspecial
      })

      // Verificar si hoy está dentro del rango de fechas del evento
      const eventosActivos = eventosEspeciales.filter((e: EventoHoy) => {
        const fechaInicio = new Date(e.fecha_inicio)
        const fechaFin = e.fecha_fin ? new Date(e.fecha_fin) : fechaInicio
        
        // Normalizar a inicio del día
        fechaInicio.setHours(0, 0, 0, 0)
        fechaFin.setHours(23, 59, 59, 999)
        hoy.setHours(12, 0, 0, 0)
        
        return hoy >= fechaInicio && hoy <= fechaFin
      })

      setEventos(eventosActivos)
    } catch (err) {
      console.error('Error en useEventoHoy:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEventosHoy()
  }, [fetchEventosHoy])

  return {
    hayEventoHoy: eventos.length > 0,
    evento: eventos[0] || null,
    eventos,
    loading,
    error
  }
}
