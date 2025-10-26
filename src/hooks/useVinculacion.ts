'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getApiUrl } from '@/lib/api-utils'

// Tipos para vinculación
export interface FamiliarEducandoRelacion {
  id: number
  familiar_id: number
  educando_id: number
  relacion: 'padre' | 'madre' | 'tutor_legal' | 'abuelo' | 'otro'
  es_contacto_principal: boolean
  fecha_creacion: string
  familiar_nombre?: string
  familiar_apellidos?: string
  familiar_email?: string
  educando_nombre?: string
  educando_apellidos?: string
  seccion_nombre?: string
}

export interface VinculacionData {
  familiar_id: number
  educando_id: number
  relacion: 'padre' | 'madre' | 'tutor_legal' | 'abuelo' | 'otro'
  es_contacto_principal?: boolean
}

export interface FamiliarConEducandos {
  id: number
  nombre: string
  apellidos: string
  email: string
  telefono?: string
  educandos: {
    id: number
    nombre: string
    apellidos: string
    seccion_nombre: string
    seccion_color: string
    edad: number
    relacion: string
    es_contacto_principal: boolean
  }[]
}

export function useVinculacion() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  /**
   * Vincular un educando a un familiar
   */
  const vincularEducando = async (vinculacionData: VinculacionData): Promise<FamiliarEducandoRelacion | null> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/familia/vincular`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vinculacionData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al vincular educando')
      }

      const data = await response.json()

      toast({
        title: 'Vinculación exitosa',
        description: 'El educando ha sido vinculado al familiar correctamente',
        variant: 'default'
      })

      return data.data
    } catch (error) {
      console.error('Error al vincular educando:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo vincular el educando',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Desvincular un educando de un familiar
   */
  const desvincularEducando = async (relacionId: number): Promise<boolean> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/familia/desvincular/${relacionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al desvincular educando')
      }

      toast({
        title: 'Desvinculación exitosa',
        description: 'El educando ha sido desvinculado del familiar correctamente',
        variant: 'default'
      })

      return true
    } catch (error) {
      console.error('Error al desvincular educando:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo desvincular el educando',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener familiares de un educando
   */
  const getFamiliaresByEducando = async (educandoId: number): Promise<FamiliarEducandoRelacion[]> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/familia/educando/${educandoId}/familiares`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener familiares')
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error al obtener familiares:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudieron cargar los familiares',
        variant: 'destructive'
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  /**
   * Verificar si un familiar tiene acceso a un educando
   */
  const verificarAcceso = async (educandoId: number): Promise<boolean> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/familia/verificar-acceso/${educandoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al verificar acceso')
      }

      const data = await response.json()
      return data.tieneAcceso || false
    } catch (error) {
      console.error('Error al verificar acceso:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener educandos vinculados de un familiar
   */
  const getEducandosVinculados = async (): Promise<any[]> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${getApiUrl()}/familia/hijos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener educandos vinculados')
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error al obtener educandos vinculados:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudieron cargar los educandos vinculados',
        variant: 'destructive'
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener familiares disponibles para vincular (usuarios con rol 'familia')
   */
  const getFamiliaresDisponibles = async (): Promise<any[]> => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      // Obtener usuarios con rol familia
      const response = await fetch(`${getApiUrl()}/usuarios?rol=familia`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener familias')
      }

      const data = await response.json()
      return data.data || data || []
    } catch (error) {
      console.error('Error al obtener familias disponibles:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudieron cargar las familias',
        variant: 'destructive'
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    vincularEducando,
    desvincularEducando,
    getFamiliaresByEducando,
    verificarAcceso,
    getEducandosVinculados,
    getFamiliaresDisponibles
  }
}
