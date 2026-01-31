'use client'

import { useState, useCallback } from 'react'
import { getApiUrl } from '@/lib/api-utils'

export interface CampamentoResumen {
  id: number
  titulo: string
  fecha_inicio: string
  fecha_fin: string
  lugar: string
  total_inscritos: number
}

export interface SeccionStats {
  seccion_id: number
  nombre: string
  color_principal: string
  inscritos: number
  no_asisten: number
}

export interface StatsGlobal {
  total: number
  inscritos: number
  pendientes: number
  no_asisten: number
  lista_espera: number
  cancelados: number
  pagados: number
  sin_pagar: number
}

export interface DietaPersona {
  nombre: string
  apellidos: string
  alergias: string | null
  intolerancias: string | null
  dieta_especial: string | null
  medicacion: string | null
  observaciones_medicas: string | null
  seccion_nombre: string
}

export interface ResumenDietas {
  con_alergias: DietaPersona[]
  con_intolerancias: DietaPersona[]
  con_dieta_especial: DietaPersona[]
  con_medicacion: DietaPersona[]
  total_con_restricciones: number
}

export interface CampamentoDetalle {
  actividad: {
    id: number
    titulo: string
    fecha_inicio: string
    fecha_fin: string
    lugar: string
  }
  stats_global: StatsGlobal
  por_seccion: SeccionStats[]
  dietas: ResumenDietas
  inscripciones: Array<Record<string, unknown>>
  _debug_errors?: Array<{ query: string; error: string }>
}

export interface ExportCSVOptions {
  secciones?: number[]
  soloRestricciones?: boolean
}

export function useDashboardComite() {
  const [campamentos, setCampamentos] = useState<CampamentoResumen[]>([])
  const [detalle, setDetalle] = useState<CampamentoDetalle | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchCampamentos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${getApiUrl()}/api/dashboard-comite/campamentos`,
        { headers: getAuthHeaders() }
      )

      if (!response.ok) {
        throw new Error('Error cargando campamentos')
      }

      const result = await response.json()
      if (result.success) {
        setCampamentos(result.data)
      } else {
        throw new Error(result.message || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error fetching campamentos:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDetalle = useCallback(async (campamentoId: number) => {
    try {
      setLoadingDetalle(true)
      setError(null)

      const response = await fetch(
        `${getApiUrl()}/api/dashboard-comite/campamento/${campamentoId}`,
        { headers: getAuthHeaders() }
      )

      if (!response.ok) {
        throw new Error('Error cargando detalle del campamento')
      }

      const result = await response.json()
      if (result.success) {
        setDetalle(result.data)
        if (result.data._debug_errors?.length) {
          console.warn('[Campamento] Sub-query errors:', result.data._debug_errors)
        }
      } else {
        throw new Error(result.message || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error fetching detalle:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoadingDetalle(false)
    }
  }, [])

  const exportCSV = useCallback((campamentoId: number, options?: ExportCSVOptions) => {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams()
    if (options?.secciones?.length) {
      params.set('secciones', options.secciones.join(','))
    }
    if (options?.soloRestricciones) {
      params.set('solo_restricciones', 'true')
    }
    const qs = params.toString()
    const url = `${getApiUrl()}/api/dashboard-comite/campamento/${campamentoId}/export${qs ? '?' + qs : ''}`
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `asistencia-campamento-${campamentoId}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(blobUrl)
      })
      .catch(err => {
        console.error('Error exportando CSV:', err)
        setError('Error al descargar el archivo CSV')
      })
  }, [])

  return {
    campamentos,
    detalle,
    loading,
    loadingDetalle,
    error,
    fetchCampamentos,
    fetchDetalle,
    exportCSV
  }
}
