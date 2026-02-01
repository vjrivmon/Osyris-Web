import { useState, useCallback, useEffect } from 'react'
import { getApiUrl } from '@/lib/api-utils'
import type { PerfilSaludData, ContactoEmergencia } from '@/types/circular-digital'

const API_URL = getApiUrl()

function getAuthHeaders() {
  const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export function usePerfilSalud(educandoId: number) {
  const [perfil, setPerfil] = useState<PerfilSaludData | null>(null)
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)

  const fetchPerfil = useCallback(async () => {
    if (!educandoId) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/perfil-salud/educando/${educandoId}`, { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) {
        setPerfil(data.data.perfil)
        setContactos(data.data.contactos || [])
        if (data.data.perfil?.ultima_actualizacion) {
          setUltimaActualizacion(new Date(data.data.perfil.ultima_actualizacion))
        }
      }
    } catch {
      setError('Error cargando perfil de salud')
    } finally {
      setIsLoading(false)
    }
  }, [educandoId])

  useEffect(() => { fetchPerfil() }, [fetchPerfil])

  const guardar = useCallback(async (data: Partial<PerfilSaludData>, newContactos: ContactoEmergencia[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/perfil-salud/educando/${educandoId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...data, contactos: newContactos })
      })
      const result = await res.json()
      if (result.success) {
        setPerfil(result.data.perfil)
        setContactos(result.data.contactos || [])
        setUltimaActualizacion(new Date())
      } else {
        setError(result.message)
      }
    } catch {
      setError('Error guardando perfil')
    } finally {
      setIsLoading(false)
    }
  }, [educandoId])

  const necesitaActualizacion = ultimaActualizacion
    ? (Date.now() - ultimaActualizacion.getTime()) > 180 * 24 * 60 * 60 * 1000 // 6 months
    : false

  return { perfil, contactos, isLoading, error, ultimaActualizacion, necesitaActualizacion, guardar, refetch: fetchPerfil }
}
