'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getApiUrl } from '@/lib/api-utils'

// Tipos de datos para educandos
export interface Educando {
  id: number
  nombre: string
  apellidos: string
  genero: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir'
  fecha_nacimiento: string
  edad?: number
  dni?: string
  pasaporte?: string
  direccion?: string
  codigo_postal?: string
  municipio?: string
  telefono_casa?: string
  telefono_movil?: string
  email?: string
  alergias?: string
  notas_medicas?: string
  seccion_id: number
  seccion_nombre?: string
  seccion_color?: string
  foto_perfil?: string
  activo: boolean
  notas?: string
  id_externo?: number
  fecha_alta?: string
  fecha_baja?: string
  fecha_actualizacion?: string
}

export interface EducandoFormData {
  nombre: string
  apellidos: string
  genero: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir'
  fecha_nacimiento: string
  dni?: string
  pasaporte?: string
  direccion?: string
  codigo_postal?: string
  municipio?: string
  telefono_casa?: string
  telefono_movil?: string
  email?: string
  alergias?: string
  notas_medicas?: string
  seccion_id: number
  foto_perfil?: string
  activo?: boolean
  notas?: string
}

export interface EducandoFilters {
  seccion_id?: number
  activo?: boolean
  search?: string
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir'
  limit?: number
  offset?: number
}

export interface EstadisticasEducandos {
  total: number
  activos: number
  inactivos: number
  masculino: number
  femenino: number
  por_seccion: {
    seccion_nombre: string
    seccion_id: number
    por_seccion: number
  }[]
}

export function useEducandos() {
  const [loading, setLoading] = useState(false)
  const [educandos, setEducandos] = useState<Educando[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasEducandos | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0
  })
  const { toast } = useToast()

  /**
   * Obtener lista de educandos con filtros
   */
  const fetchEducandos = async (filters?: EducandoFilters) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      // Construir query string
      const params = new URLSearchParams()
      if (filters?.seccion_id) params.append('seccion_id', filters.seccion_id.toString())
      if (filters?.activo !== undefined) params.append('activo', filters.activo.toString())
      if (filters?.search) params.append('search', filters.search)
      if (filters?.genero) params.append('genero', filters.genero)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`${getApiUrl()}/educandos?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener educandos')
      }

      const data = await response.json()
      setEducandos(data.data || [])

      if (data.pagination) {
        setPagination({
          total: data.pagination.total || 0,
          limit: data.pagination.limit || 50,
          offset: data.pagination.offset || 0
        })
      }

      return data.data
    } catch (error) {
      console.error('Error al obtener educandos:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudieron cargar los educandos',
        variant: 'destructive'
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener un educando por ID
   */
  const fetchEducandoById = async (id: number): Promise<Educando | null> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/educandos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener educando')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error al obtener educando:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo cargar el educando',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Crear nuevo educando
   */
  const createEducando = async (educandoData: EducandoFormData): Promise<Educando | null> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/educandos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(educandoData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear educando')
      }

      const data = await response.json()

      toast({
        title: 'Educando creado',
        description: `${educandoData.nombre} ${educandoData.apellidos} ha sido creado exitosamente`,
        variant: 'default'
      })

      // Recargar lista
      await fetchEducandos()

      return data.data
    } catch (error) {
      console.error('Error al crear educando:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el educando',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualizar educando existente
   */
  const updateEducando = async (id: number, educandoData: Partial<EducandoFormData>): Promise<Educando | null> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/educandos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(educandoData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al actualizar educando')
      }

      const data = await response.json()

      toast({
        title: 'Educando actualizado',
        description: 'Los cambios se han guardado exitosamente',
        variant: 'default'
      })

      // Recargar lista
      await fetchEducandos()

      return data.data
    } catch (error) {
      console.error('Error al actualizar educando:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el educando',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Desactivar educando (soft delete)
   */
  const deactivateEducando = async (id: number): Promise<boolean> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/educandos/${id}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al desactivar educando')
      }

      toast({
        title: 'Educando desactivado',
        description: 'El educando ha sido desactivado exitosamente',
        variant: 'default'
      })

      // Recargar lista
      await fetchEducandos()

      return true
    } catch (error) {
      console.error('Error al desactivar educando:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo desactivar el educando',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reactivar educando
   */
  const reactivateEducando = async (id: number): Promise<boolean> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/educandos/${id}/reactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al reactivar educando')
      }

      toast({
        title: 'Educando reactivado',
        description: 'El educando ha sido reactivado exitosamente',
        variant: 'default'
      })

      // Recargar lista
      await fetchEducandos()

      return true
    } catch (error) {
      console.error('Error al reactivar educando:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo reactivar el educando',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Eliminar permanentemente educando (hard delete)
   */
  const deleteEducando = async (id: number): Promise<boolean> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/educandos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al eliminar educando')
      }

      toast({
        title: 'Educando eliminado',
        description: 'El educando ha sido eliminado permanentemente',
        variant: 'default'
      })

      // Recargar lista
      await fetchEducandos()

      return true
    } catch (error) {
      console.error('Error al eliminar educando:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el educando',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Buscar educandos
   */
  const searchEducandos = async (searchTerm: string): Promise<Educando[]> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/educandos/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al buscar educandos')
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error al buscar educandos:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo realizar la búsqueda',
        variant: 'destructive'
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener educandos por sección
   */
  const fetchEducandosBySeccion = async (seccionId: number): Promise<Educando[]> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/educandos/seccion/${seccionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener educandos de la sección')
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error al obtener educandos por sección:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudieron cargar los educandos de la sección',
        variant: 'destructive'
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener estadísticas de educandos
   */
  const fetchEstadisticas = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/educandos/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener estadísticas')
      }

      const data = await response.json()
      setEstadisticas(data.data)
      return data.data
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudieron cargar las estadísticas',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    educandos,
    estadisticas,
    pagination,
    fetchEducandos,
    fetchEducandoById,
    createEducando,
    updateEducando,
    deactivateEducando,
    reactivateEducando,
    deleteEducando,
    searchEducandos,
    fetchEducandosBySeccion,
    fetchEstadisticas
  }
}
