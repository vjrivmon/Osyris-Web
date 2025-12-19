'use client'

import { useState, useEffect, useCallback } from 'react'
import { getApiUrl } from '@/lib/api-utils'

export interface NotificacionScouter {
  id: number
  educando_id: number
  educando_nombre: string
  educando_apellidos?: string
  seccion_id: number
  seccion_nombre?: string
  seccion_color?: string
  tipo: string
  titulo: string
  mensaje: string
  enlace_accion: string
  metadata?: {
    documento_id?: number
    tipo_documento?: string
    familiar_id?: number
  }
  prioridad: string
  leida: boolean
  fecha_lectura?: string
  fecha_creacion: string
}

export interface DocumentoPendiente {
  id: number
  educando_id: number
  educando_nombre: string
  educando_apellidos: string
  seccion_id: number
  seccion_nombre: string
  seccion_color?: string
  tipo_documento: string
  titulo: string
  archivo_nombre: string
  archivo_ruta: string
  google_drive_file_id?: string
  fecha_subida: string
  estado: string
}

export function useNotificacionesScouter() {
  const [notificaciones, setNotificaciones] = useState<NotificacionScouter[]>([])
  const [documentosPendientes, setDocumentosPendientes] = useState<DocumentoPendiente[]>([])
  const [contadorNoLeidas, setContadorNoLeidas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Cargar notificaciones
  const fetchNotificaciones = useCallback(async (soloNoLeidas = false) => {
    try {
      const params = new URLSearchParams()
      if (soloNoLeidas) params.append('soloNoLeidas', 'true')
      params.append('limit', '10')

      const response = await fetch(
        `${getApiUrl()}/api/notificaciones-scouter?${params.toString()}`,
        { headers: getAuthHeaders() }
      )

      if (!response.ok) throw new Error('Error cargando notificaciones')

      const data = await response.json()
      if (data.success) {
        setNotificaciones(data.data)
      }
    } catch (err) {
      console.error('Error fetching notificaciones:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }, [])

  // Cargar contador de no leídas
  const fetchContador = useCallback(async () => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/notificaciones-scouter/contador`,
        { headers: getAuthHeaders() }
      )

      if (!response.ok) throw new Error('Error cargando contador')

      const data = await response.json()
      if (data.success) {
        setContadorNoLeidas(data.count)
      }
    } catch (err) {
      console.error('Error fetching contador:', err)
    }
  }, [])

  // Cargar documentos pendientes
  const fetchDocumentosPendientes = useCallback(async () => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/notificaciones-scouter/documentos-pendientes`,
        { headers: getAuthHeaders() }
      )

      if (!response.ok) throw new Error('Error cargando documentos pendientes')

      const data = await response.json()
      if (data.success) {
        setDocumentosPendientes(data.data)
      }
    } catch (err) {
      console.error('Error fetching documentos pendientes:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }, [])

  // Marcar notificación como leída
  const marcarComoLeida = async (id: number) => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/notificaciones-scouter/${id}/leida`,
        {
          method: 'PUT',
          headers: getAuthHeaders()
        }
      )

      if (!response.ok) throw new Error('Error marcando como leída')

      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      )
      setContadorNoLeidas(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marcando como leída:', err)
    }
  }

  // Aprobar documento
  const aprobarDocumento = async (documentoId: number) => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/drive/documento/${documentoId}/aprobar`,
        {
          method: 'PUT',
          headers: getAuthHeaders()
        }
      )

      if (!response.ok) throw new Error('Error aprobando documento')

      // Actualizar lista
      setDocumentosPendientes(prev =>
        prev.filter(d => d.id !== documentoId)
      )
      await fetchContador()

      return true
    } catch (err) {
      console.error('Error aprobando documento:', err)
      throw err
    }
  }

  // Rechazar documento
  const rechazarDocumento = async (documentoId: number, motivo: string) => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/drive/documento/${documentoId}/rechazar`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ motivo })
        }
      )

      if (!response.ok) throw new Error('Error rechazando documento')

      // Actualizar lista
      setDocumentosPendientes(prev =>
        prev.filter(d => d.id !== documentoId)
      )
      await fetchContador()

      return true
    } catch (err) {
      console.error('Error rechazando documento:', err)
      throw err
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchNotificaciones(),
        fetchContador(),
        fetchDocumentosPendientes()
      ])
      setLoading(false)
    }

    loadData()
  }, [fetchNotificaciones, fetchContador, fetchDocumentosPendientes])

  return {
    notificaciones,
    documentosPendientes,
    contadorNoLeidas,
    loading,
    error,
    fetchNotificaciones,
    fetchDocumentosPendientes,
    marcarComoLeida,
    aprobarDocumento,
    rechazarDocumento,
    refresh: () => {
      fetchNotificaciones()
      fetchContador()
      fetchDocumentosPendientes()
    }
  }
}
