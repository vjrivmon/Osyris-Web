'use client'

import { useState, useCallback } from 'react'
import { TipoDocumento } from '@/types/familia'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Plantilla {
  id: string
  name: string
  mimeType: string
  size: string
  webViewLink: string
  tipoDocumento: TipoDocumento | null
  config: {
    codigo: string
    nombre: string
    obligatorio: boolean
  } | null
}

interface DocumentoDrive {
  id: string
  name: string
  mimeType: string
  size: string
  createdTime: string
  modifiedTime: string
  webViewLink: string
}

interface EstadoDocumento {
  tipo: TipoDocumento
  nombre: string
  codigo: string
  obligatorio: boolean
  tienePlantilla: boolean
  estado: 'subido' | 'faltante'
  archivo: DocumentoDrive | null
}

interface EstructuraEducando {
  educando: {
    id: number
    nombre: string
    apellidos: string
    seccion: string
  }
  folder: {
    id: string
    name: string
  }
  documentos: DocumentoDrive[]
  status: Record<TipoDocumento, EstadoDocumento>
  resumen: {
    total: number
    completos: number
    faltantes: number
    opcionalesFaltantes: number
  }
}

interface UploadResult {
  success: boolean
  message: string
  data?: {
    documento: unknown
    driveFile: DocumentoDrive
  }
}

export function useGoogleDrive() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [estructuraEducando, setEstructuraEducando] = useState<EstructuraEducando | null>(null)

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('familiaToken') || localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, [])

  /**
   * Obtiene las plantillas disponibles para descargar
   */
  const fetchPlantillas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/drive/plantillas`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al obtener plantillas')
      }

      const data = await response.json()
      setPlantillas(data.data || [])
      return data.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  /**
   * Descarga una plantilla específica
   */
  const downloadPlantilla = useCallback(async (fileId: string, fileName: string) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('familiaToken') || localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/drive/plantilla/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al descargar plantilla')
      }

      // Crear blob y descargar
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Obtiene la estructura de documentos de un educando
   */
  const fetchEducandoDocumentos = useCallback(async (educandoId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/drive/educando/${educandoId}/documentos`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al obtener documentos del educando')
      }

      const data = await response.json()
      setEstructuraEducando(data.data)
      return data.data as EstructuraEducando
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  /**
   * Sube un documento a la carpeta del educando
   */
  const uploadDocumento = useCallback(async (
    educandoId: number,
    tipoDocumento: TipoDocumento,
    file: File
  ): Promise<UploadResult> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('familiaToken') || localStorage.getItem('token')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('educandoId', educandoId.toString())
      formData.append('tipoDocumento', tipoDocumento)

      const response = await fetch(`${API_BASE_URL}/api/drive/documento/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir documento')
      }

      // Refrescar estructura del educando
      await fetchEducandoDocumentos(educandoId)

      return {
        success: true,
        message: data.message,
        data: data.data
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      return {
        success: false,
        message
      }
    } finally {
      setLoading(false)
    }
  }, [fetchEducandoDocumentos])

  /**
   * Obtiene la plantilla para un tipo de documento específico
   */
  const getPlantillaParaTipo = useCallback((tipoDocumento: TipoDocumento): Plantilla | undefined => {
    return plantillas.find(p => p.tipoDocumento === tipoDocumento)
  }, [plantillas])

  /**
   * Verifica si un tipo de documento tiene plantilla disponible
   */
  const tienePlantillaDisponible = useCallback((tipoDocumento: TipoDocumento): boolean => {
    return plantillas.some(p => p.tipoDocumento === tipoDocumento)
  }, [plantillas])

  return {
    // Estado
    loading,
    error,
    plantillas,
    estructuraEducando,

    // Acciones
    fetchPlantillas,
    downloadPlantilla,
    fetchEducandoDocumentos,
    uploadDocumento,

    // Helpers
    getPlantillaParaTipo,
    tienePlantillaDisponible,

    // Limpiar error
    clearError: () => setError(null)
  }
}

export type { Plantilla, DocumentoDrive, EstadoDocumento, EstructuraEducando, UploadResult }
