import { useState, useCallback, useEffect } from 'react'
import { getApiUrl } from '@/lib/api-utils'
import type {
  CircularActividad,
  CampoCustomCircular,
  PerfilSaludData,
  ContactoEmergencia,
  CircularRespuesta,
  CircularFormularioResponse,
  DatosFirmaCircular,
  CircularResultado
} from '@/types/circular-digital'

const API_URL = getApiUrl()

function getAuthHeaders() {
  const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export function useCircularDigital(actividadId: number, educandoId: number) {
  const [circularConfig, setCircularConfig] = useState<CircularActividad | null>(null)
  const [camposCustom, setCamposCustom] = useState<CampoCustomCircular[]>([])
  const [perfilSalud, setPerfilSalud] = useState<PerfilSaludData | null>(null)
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([])
  const [educando, setEducando] = useState<{ id: number; nombre: string; apellidos: string; fecha_nacimiento: string; seccion_nombre: string } | null>(null)
  const [respuestaExistente, setRespuestaExistente] = useState<CircularRespuesta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFormulario = useCallback(async () => {
    if (!actividadId || !educandoId) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_URL}/api/circular/${actividadId}/formulario?educandoId=${educandoId}`,
        { headers: getAuthHeaders() }
      )
      const data = await res.json()
      if (data.success) {
        const d = data.data as CircularFormularioResponse
        setCircularConfig(d.circular)
        setCamposCustom(d.camposCustom)
        setPerfilSalud(d.perfilSalud)
        setContactos(d.contactos)
        setEducando(d.educando)
        setRespuestaExistente(d.respuestaExistente)
      } else {
        setError(data.message || 'Error cargando circular')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }, [actividadId, educandoId])

  useEffect(() => {
    fetchFormulario()
  }, [fetchFormulario])

  const firmar = useCallback(async (datos: DatosFirmaCircular): Promise<CircularResultado> => {
    const res = await fetch(`${API_URL}/api/circular/${actividadId}/firmar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos)
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message || 'Error al firmar')
    return {
      success: true,
      circularRespuestaId: data.data.circularRespuestaId,
      pdfUrl: data.data.pdfUrl || '',
      pdfDriveId: data.data.pdfDriveId || ''
    }
  }, [actividadId])

  return {
    circularConfig,
    camposCustom,
    perfilSalud,
    contactos,
    educando,
    respuestaExistente,
    isLoading,
    error,
    firmar,
    estadoActual: respuestaExistente?.estado || null,
    refetch: fetchFormulario
  }
}

// Hook para listar circulares del familiar
export function useCircularesFamiliar() {
  const [circulares, setCirculares] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/circulares/mis-circulares`, { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) setCirculares(data.data || [])
    } catch {
      setError('Error cargando circulares')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])
  return { circulares, isLoading, error, refetch: fetch_ }
}
