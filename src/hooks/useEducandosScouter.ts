'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  EducandoConDocs,
  EducandoFilters,
  EducandosResponse,
  CreateEducandoData,
  UpdateEducandoData,
  NotificacionDocumentosData,
  DocumentoEducando,
  ResumenDocumentacion
} from '@/types/educando-scouter'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface UseEducandosScouterReturn {
  // Estado
  educandos: EducandoConDocs[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: EducandoFilters

  // Acciones principales
  fetchEducandos: (customFilters?: EducandoFilters) => Promise<void>
  setFilters: (filters: Partial<EducandoFilters>) => void
  resetFilters: () => void

  // CRUD
  createEducando: (data: CreateEducandoData) => Promise<EducandoConDocs | null>
  updateEducando: (id: number, data: UpdateEducandoData) => Promise<EducandoConDocs | null>
  deactivateEducando: (id: number) => Promise<boolean>
  reactivateEducando: (id: number) => Promise<boolean>

  // Documentación
  fetchDocumentacion: (educandoId: number) => Promise<{
    documentos: Record<string, DocumentoEducando>
    resumen: ResumenDocumentacion
  } | null>

  // Notificaciones
  sendNotificacion: (educandoId: number, data: NotificacionDocumentosData) => Promise<boolean>

  // Utilidades
  refetch: () => Promise<void>
}

const defaultFilters: EducandoFilters = {
  page: 1,
  limit: 10,
  search: '',
  orderBy: 'apellidos',
  orderDir: 'asc',
  genero: '',
  estadoDocs: 'todos'
}

export function useEducandosScouter(): UseEducandosScouterReturn {
  const { user, token } = useAuth()

  const [educandos, setEducandos] = useState<EducandoConDocs[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [filters, setFiltersState] = useState<EducandoFilters>(defaultFilters)
  const [resolvedSeccionId, setResolvedSeccionId] = useState<number | null>(null)
  const fetchingSeccion = useRef(false)
  const previousUserId = useRef<number | null>(null)

  // IMPORTANTE: Resetear todo el estado cuando cambia el usuario
  useEffect(() => {
    const currentUserId = user?.id ?? null

    // Si el usuario cambió (incluyendo logout), resetear todo el estado
    if (previousUserId.current !== currentUserId) {
      console.log('🔄 [useEducandosScouter] Usuario cambió, reseteando estado...')
      setEducandos([])
      setError(null)
      setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 })
      setFiltersState(defaultFilters)
      setResolvedSeccionId(null)
      fetchingSeccion.current = false
      previousUserId.current = currentUserId
    }
  }, [user?.id])

  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, [token])

  // Obtener la sección del usuario desde el backend si no está disponible localmente
  const fetchSeccionFromBackend = useCallback(async (): Promise<number | null> => {
    if (fetchingSeccion.current) return null

    try {
      fetchingSeccion.current = true
      const response = await fetch(`${API_URL}/api/dashboard-scouter/summary`, {
        headers: getHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.seccionId) {
          setResolvedSeccionId(data.data.seccionId)
          return data.data.seccionId
        }
      }
      return null
    } catch (err) {
      console.error('Error fetching seccion from backend:', err)
      return null
    } finally {
      fetchingSeccion.current = false
    }
  }, [getHeaders])

  // Obtener el seccion_id efectivo (del usuario o resuelto del backend)
  const getEffectiveSeccionId = useCallback((): number | null => {
    return user?.seccion_id || resolvedSeccionId
  }, [user?.seccion_id, resolvedSeccionId])

  // Fetch educandos con filtros
  const fetchEducandos = useCallback(async (customFilters?: EducandoFilters) => {
    // Obtener seccion_id del usuario o intentar resolverlo desde el backend
    let seccionId = user?.seccion_id || resolvedSeccionId

    if (!seccionId) {
      // Intentar obtener la sección desde el backend
      setLoading(true)
      seccionId = await fetchSeccionFromBackend()

      if (!seccionId) {
        setError('No tienes una sección asignada. Contacta al administrador.')
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const currentFilters = customFilters || filters
      const queryParams = new URLSearchParams()

      if (currentFilters.page) queryParams.append('page', currentFilters.page.toString())
      if (currentFilters.limit) queryParams.append('limit', currentFilters.limit.toString())
      if (currentFilters.search) queryParams.append('search', currentFilters.search)
      if (currentFilters.orderBy) queryParams.append('orderBy', currentFilters.orderBy)
      if (currentFilters.orderDir) queryParams.append('orderDir', currentFilters.orderDir)
      if (currentFilters.genero) queryParams.append('genero', currentFilters.genero)
      if (currentFilters.estadoDocs) queryParams.append('estadoDocs', currentFilters.estadoDocs)

      const response = await fetch(
        `${API_URL}/api/educandos/seccion/${seccionId}/completo?${queryParams.toString()}`,
        { headers: getHeaders() }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener educandos')
      }

      const data: EducandosResponse = await response.json()

      if (data.success) {
        setEducandos(data.data)
        setPagination(data.pagination)
      } else {
        throw new Error('Error en la respuesta del servidor')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error fetching educandos:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.seccion_id, resolvedSeccionId, filters, getHeaders, fetchSeccionFromBackend])

  // Actualizar filtros
  const setFilters = useCallback((newFilters: Partial<EducandoFilters>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters }
      // Reset a página 1 si cambian filtros de búsqueda
      if (newFilters.search !== undefined || newFilters.genero !== undefined || newFilters.estadoDocs !== undefined) {
        updated.page = 1
      }
      return updated
    })
  }, [])

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
  }, [])

  // Crear educando
  const createEducando = useCallback(async (data: CreateEducandoData): Promise<EducandoConDocs | null> => {
    const seccionId = user?.seccion_id || resolvedSeccionId

    if (!seccionId) {
      setError('No tienes una sección asignada')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Forzar la sección del usuario
      const educandoData = {
        ...data,
        seccion_id: seccionId
      }

      const response = await fetch(`${API_URL}/api/educandos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(educandoData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear educando')
      }

      const result = await response.json()

      if (result.success) {
        // Refetch para obtener la lista actualizada
        await fetchEducandos()
        return result.data
      }

      throw new Error('Error en la respuesta del servidor')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error creating educando:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user?.seccion_id, resolvedSeccionId, getHeaders, fetchEducandos])

  // Actualizar educando
  const updateEducando = useCallback(async (id: number, data: UpdateEducandoData): Promise<EducandoConDocs | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/educandos/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar educando')
      }

      const result = await response.json()

      if (result.success) {
        await fetchEducandos()
        return result.data
      }

      throw new Error('Error en la respuesta del servidor')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error updating educando:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [getHeaders, fetchEducandos])

  // Desactivar educando
  const deactivateEducando = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/educandos/${id}/deactivate`, {
        method: 'PATCH',
        headers: getHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al desactivar educando')
      }

      const result = await response.json()

      if (result.success) {
        await fetchEducandos()
        return true
      }

      throw new Error('Error en la respuesta del servidor')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error deactivating educando:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [getHeaders, fetchEducandos])

  // Reactivar educando
  const reactivateEducando = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/educandos/${id}/reactivate`, {
        method: 'PATCH',
        headers: getHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al reactivar educando')
      }

      const result = await response.json()

      if (result.success) {
        await fetchEducandos()
        return true
      }

      throw new Error('Error en la respuesta del servidor')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error reactivating educando:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [getHeaders, fetchEducandos])

  // Obtener documentación de un educando
  const fetchDocumentacion = useCallback(async (educandoId: number): Promise<{
    documentos: Record<string, DocumentoEducando>
    resumen: ResumenDocumentacion
  } | null> => {
    try {
      const response = await fetch(`${API_URL}/api/educandos/${educandoId}/documentacion`, {
        headers: getHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener documentación')
      }

      const result = await response.json()

      if (result.success) {
        return {
          documentos: result.data.documentos,
          resumen: result.data.resumen
        }
      }

      throw new Error('Error en la respuesta del servidor')
    } catch (err) {
      console.error('Error fetching documentacion:', err)
      return null
    }
  }, [getHeaders])

  // Enviar notificación a familia
  const sendNotificacion = useCallback(async (educandoId: number, data: NotificacionDocumentosData): Promise<boolean> => {
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/educandos/${educandoId}/notificar-documentacion`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al enviar notificación')
      }

      const result = await response.json()
      return result.success
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error sending notification:', err)
      return false
    }
  }, [getHeaders])

  // Refetch simple
  const refetch = useCallback(async () => {
    await fetchEducandos()
  }, [fetchEducandos])

  // Cargar educandos cuando cambian los filtros
  useEffect(() => {
    if (token && (user?.seccion_id || resolvedSeccionId)) {
      fetchEducandos()
    } else if (token && !user?.seccion_id && !resolvedSeccionId) {
      // Si no hay seccion_id pero hay token, intentar cargar (fetchEducandos intentará resolver)
      fetchEducandos()
    }
  }, [filters, user?.seccion_id, resolvedSeccionId, token]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    educandos,
    loading,
    error,
    pagination,
    filters,
    fetchEducandos,
    setFilters,
    resetFilters,
    createEducando,
    updateEducando,
    deactivateEducando,
    reactivateEducando,
    fetchDocumentacion,
    sendNotificacion,
    refetch
  }
}
