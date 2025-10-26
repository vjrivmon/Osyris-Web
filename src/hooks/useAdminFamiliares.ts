'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getApiUrl } from '@/lib/api-utils'

// Tipos de datos para la gestión familiar
export interface Familiar {
  id: number
  nombre: string
  apellidos: string
  email: string
  telefono?: string
  rol: 'familia'
  estado: 'PENDIENTE' | 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO'
  educandosVinculados: EducandoVinculado[]
  fechaCreacion: string
  ultimoAcceso?: string
  emailVerificado: boolean
  documentosPendientes: number
  relationType?: 'PADRE' | 'MADRE' | 'TUTOR_LEGAL' | 'ABUELO' | 'OTRO'
  relationDescription?: string
}

export interface EducandoVinculado {
  id: number
  nombre: string
  apellidos: string
  seccion: string
  seccion_id: number
  relacion: string
  esContactoPrincipal: boolean
  fechaVinculacion: string
}

export interface InvitacionFamiliar {
  email: string
  nombre: string
  apellidos: string
  telefono?: string
  educandosIds: number[]
  relationType: 'PADRE' | 'MADRE' | 'TUTOR_LEGAL' | 'ABUELO' | 'OTRO'
  relationDescription?: string
  mensajePersonalizado?: string
}

export interface DocumentoFamiliar {
  id: number
  familiarId: number
  nombre: string
  tipo: string
  url: string
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
  fechaSubida: string
  fechaRevision?: string
  revisor?: string
  comentarios?: string
  familiar: {
    nombre: string
    apellidos: string
    email: string
  }
}

export interface EstadisticasFamiliares {
  totalFamilias: number
  familiasActivas: number
  familiasPendientes: number
  educandosConFamilia: number
  documentosPendientes: number
  documentosAprobados: number
  usoUltimos30Dias: number
  familiasSinAcceso60Dias: number
  estadisticasPorSeccion: {
    seccion: string
    totalEducandos: number
    educandosConFamilia: number
    familiasActivas: number
  }[]
}

export interface VinculacionEducando {
  familiarId: number
  educandoId: number
  relationType: 'PADRE' | 'MADRE' | 'TUTOR_LEGAL' | 'ABUELO' | 'OTRO'
  relationDescription?: string
  esContactoPrincipal: boolean
}

export function useAdminFamiliares() {
  const [loading, setLoading] = useState(false)
  const [familiares, setFamiliares] = useState<Familiar[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasFamiliares | null>(null)
  const [documentosPendientes, setDocumentosPendientes] = useState<DocumentoFamiliar[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [filtros, setFiltros] = useState({
    estado: '',
    seccion: '',
    busqueda: '',
    sortBy: 'fechaCreacion',
    sortOrder: 'desc'
  })
  const { toast } = useToast()

  // Cargar listado de familiares
  const cargarFamiliares = async (page = 1, filtrosAplicados = filtros) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...filtrosAplicados
      })

      const response = await fetch(`${apiUrl}/api/admin/familiares/listar?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setFamiliares(data.familiares)
        setPagination(prev => ({
          ...prev,
          page: data.currentPage,
          total: data.total,
          totalPages: data.totalPages
        }))
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudieron cargar los familiares",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error cargando familiares:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los familiares",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Invitar familiar
  const invitarFamiliar = async (invitacion: InvitacionFamiliar) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/invitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invitacion)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Invitación enviada",
          description: `Se ha enviado la invitación a ${invitacion.email} correctamente`,
        })
        await cargarFamiliares()
        return true
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo enviar la invitación",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error invitando familiar:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar la invitación",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Vincular scout a familiar existente
  const vincularEducando = async (vinculacion: VinculacionEducando) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/vincular-scout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vinculacion)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Vinculación exitosa",
          description: "El scout ha sido vinculado al familiar correctamente",
        })

        // ✅ Invalidar caché del portal de familias para forzar recarga
        localStorage.removeItem('familia-data')
        localStorage.removeItem('familia-data-timestamp')
        console.log('🗑️ [useAdminFamiliares] Cache del portal de familias invalidado después de vinculación')

        await cargarFamiliares()
        return true
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo vincular el scout",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error vinculando scout:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al vincular el scout",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Desvincular scout de familiar
  const desvincularEducando = async (familiarId: number, educandoId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/desvincular-scout`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ familiarId, educandoId })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Desvinculación exitosa",
          description: "El scout ha sido desvinculado del familiar correctamente",
        })

        // ✅ Invalidar caché del portal de familias para forzar recarga
        localStorage.removeItem('familia-data')
        localStorage.removeItem('familia-data-timestamp')
        console.log('🗑️ [useAdminFamiliares] Cache del portal de familias invalidado después de desvinculación')

        await cargarFamiliares()
        return true
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo desvincular el scout",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error desvinculando scout:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al desvincular el scout",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Actualizar estado del familiar
  const actualizarEstadoFamiliar = async (familiarId: number, nuevoEstado: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/actualizar/${familiarId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Estado actualizado",
          description: `El familiar ha sido ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente`,
        })
        await cargarFamiliares()
        return true
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo actualizar el estado",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error actualizando estado:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Resetear contraseña de familiar
  const resetearContrasena = async (familiarId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/reset-password/${familiarId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Contraseña reseteada",
          description: "Se ha enviado un email con las nuevas credenciales",
        })
        return true
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo resetear la contraseña",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error reseteando contraseña:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al resetear la contraseña",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Cargar documentos pendientes
  const cargarDocumentosPendientes = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/documentos-pendientes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setDocumentosPendientes(data.documentos)
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudieron cargar los documentos pendientes",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error cargando documentos pendientes:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los documentos pendientes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Aprobar documento
  const aprobarDocumento = async (documentoId: number, comentarios?: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/aprobar-documento/${documentoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'APROBADO', comentarios })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Documento aprobado",
          description: "El documento ha sido aprobado correctamente",
        })
        await cargarDocumentosPendientes()
        await cargarFamiliares()
        return true
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo aprobar el documento",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error aprobando documento:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al aprobar el documento",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Rechazar documento
  const rechazarDocumento = async (documentoId: number, comentarios: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/aprobar-documento/${documentoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'RECHAZADO', comentarios })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Documento rechazado",
          description: "El documento ha sido rechazado correctamente",
        })
        await cargarDocumentosPendientes()
        await cargarFamiliares()
        return true
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo rechazar el documento",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error rechazando documento:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al rechazar el documento",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setEstadisticas(data.estadisticas)
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudieron cargar las estadísticas",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar las estadísticas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Eliminar familiar
  const eliminarFamiliar = async (familiarId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/eliminar/${familiarId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Familiar eliminado",
          description: "El familiar ha sido eliminado correctamente",
        })
        await cargarFamiliares()
        return true
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo eliminar el familiar",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error eliminando familiar:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el familiar",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Actualizar filtros
  const actualizarFiltros = (nuevosFiltros: Partial<typeof filtros>) => {
    const filtrosActualizados = { ...filtros, ...nuevosFiltros }
    setFiltros(filtrosActualizados)
    return filtrosActualizados
  }

  // Cargar datos iniciales
  useEffect(() => {
    cargarFamiliares()
    cargarEstadisticas()
    cargarDocumentosPendientes()
  }, [])

  return {
    // Estado
    loading,
    familiares,
    estadisticas,
    documentosPendientes,
    pagination,
    filtros,

    // Acciones
    cargarFamiliares,
    invitarFamiliar,
    vincularEducando,
    desvincularEducando,
    actualizarEstadoFamiliar,
    resetearContrasena,
    cargarDocumentosPendientes,
    aprobarDocumento,
    rechazarDocumento,
    cargarEstadisticas,
    eliminarFamiliar,
    actualizarFiltros,
  }
}