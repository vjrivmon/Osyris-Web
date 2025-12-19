'use client'

import { useState, useCallback } from 'react'
import { TipoDocumento } from '@/types/familia'
import { getApiUrl } from '@/lib/api-utils'

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
  estado: 'subido' | 'faltante' | 'pendiente_revision'
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
      const response = await fetch(`${getApiUrl()}/api/drive/plantillas`, {
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
      const response = await fetch(`${getApiUrl()}/api/drive/plantilla/${fileId}/download`, {
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
      const response = await fetch(`${getApiUrl()}/api/drive/educando/${educandoId}/documentos`, {
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
   * Función helper para hacer fetch con reintentos automáticos
   * Útil para manejar errores temporales como "Failed to fetch" por renovación de tokens
   */
  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<Response> => {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options)
        return response
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Error desconocido')
        console.warn(`⚠️ Intento ${attempt}/${maxRetries} falló: ${lastError.message}`)

        // Si no es el último intento, esperar antes de reintentar
        if (attempt < maxRetries) {
          // Espera exponencial: 1s, 2s, 4s
          const waitTime = delayMs * Math.pow(2, attempt - 1)
          console.log(`🔄 Reintentando en ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }

    throw lastError || new Error('Error después de múltiples reintentos')
  }

  /**
   * Sube un documento a la carpeta del educando
   * Incluye reintentos automáticos para manejar errores temporales de red/tokens
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

      // Usar fetchWithRetry para manejar errores temporales
      const response = await fetchWithRetry(
        `${getApiUrl()}/api/drive/documento/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        },
        3, // máximo 3 reintentos
        1000 // delay inicial de 1 segundo
      )

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
