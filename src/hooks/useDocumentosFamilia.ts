'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getApiUrl } from '@/lib/api-utils'

export interface DocumentoFamilia {
  id: string
  scoutId: string
  familiarId: string
  tipoDocumento: 'autorizacion_medica' | 'seguro_accidentes' | 'autorizacion_imagen' |
                 'autorizacion_transporte' | 'ficha_alergias' | 'informe_medico' |
                 'inscripcion' | 'dni' | 'foto_carnet' | 'otro'
  titulo: string
  descripcion?: string
  archivoNombre: string
  archivoRuta: string
  tipoArchivo: string
  tamañoArchivo: number
  fechaVencimiento?: Date
  estado: 'vigente' | 'por_vencer' | 'vencido' | 'pendiente' | 'en_revision'
  fechaSubida: Date
  aprobado: boolean
  aprobadoPor?: string
  version: number
  tags?: string[]
  metadata: {
    dpi?: number
    pagina?: number
    firmas?: number
    compression?: string
    checksum?: string
  }
  alertasConfig: {
    email30dias: boolean
    email15dias: boolean
    email7dias: boolean
    sms: boolean
    push: boolean
  }
}

export interface PlantillaDocumento {
  id: string
  tipo: string
  titulo: string
  descripcion: string
  archivo: string
  formato: 'docx' | 'pdf' | 'odt'
  campos: Array<{
    nombre: string
    tipo: 'texto' | 'fecha' | 'numero' | 'select'
    required: boolean
    opciones?: string[]
  }>
  instrucciones: string[]
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

interface UseDocumentosFamiliaOptions {
  scoutId?: string
  autoRefetch?: boolean
  refetchInterval?: number
  enableCache?: boolean
}

interface UseDocumentosFamiliaReturn {
  // Datos
  documentos: DocumentoFamilia[] | null
  documentosCriticos: DocumentoFamilia[]
  documentosPorScout: Record<string, DocumentoFamilia[]>
  plantillas: PlantillaDocumento[] | null

  // Estados
  loading: boolean
  uploading: boolean
  error: string | null
  uploadProgress: UploadProgress | null

  // Acciones principales
  refetch: () => Promise<void>
  uploadDocumento: (file: File, data: Partial<DocumentoFamilia>) => Promise<boolean>
  updateDocumento: (id: string, data: Partial<DocumentoFamilia>) => Promise<boolean>
  deleteDocumento: (id: string) => Promise<boolean>
  aprobarDocumento: (id: string) => Promise<boolean>

  // Acciones auxiliares
  descargarDocumento: (id: string) => Promise<void>
  descargarPlantilla: (plantillaId: string) => Promise<void>
  previsualizarDocumento: (id: string) => Promise<string>

  // Filtrado y búsqueda
  buscarDocumentos: (query: string) => DocumentoFamilia[]
  filtrarPorEstado: (estado: DocumentoFamilia['estado']) => DocumentoFamilia[]
  filtrarPorTipo: (tipo: DocumentoFamilia['tipoDocumento']) => DocumentoFamilia[]
  documentosVencenEn: (dias: number) => DocumentoFamilia[]

  // Estadísticas
  estadisticas: {
    total: number
    vigentes: number
    porVencer: number
    vencidos: number
    pendientes: number
    enRevision: number
    porcentajeCompletado: number
  }
}

const TIPOS_DOCUMENTO = {
  autorizacion_medica: 'Autorización Médica',
  seguro_accidentes: 'Seguro de Accidentes',
  autorizacion_imagen: 'Autorización de Imagen',
  autorizacion_transporte: 'Autorización de Transporte',
  ficha_alergias: 'Ficha de Alergias',
  informe_medico: 'Informe Médico',
  inscripcion: 'Ficha de Inscripción',
  dni: 'Copia DNI',
  foto_carnet: 'Foto Carnet',
  otro: 'Otro Documento'
}

export function useDocumentosFamilia({
  scoutId,
  autoRefetch = true,
  refetchInterval = 5 * 60 * 1000, // 5 minutos
  enableCache = true
}: UseDocumentosFamiliaOptions = {}): UseDocumentosFamiliaReturn {
  const { user, token, isAuthenticated } = useAuth()
  const [documentos, setDocumentos] = useState<DocumentoFamilia[] | null>(null)
  const [plantillas, setPlantillas] = useState<PlantillaDocumento[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)

  const cacheKey = `documentos-familia-${user?.id}-${scoutId || 'all'}`
  const plantillasCacheKey = `plantillas-documentos`

  // Obtener documentos
  const fetchDocumentos = useCallback(async () => {
    if (!isAuthenticated || !token || !user) return

    setLoading(true)
    setError(null)

    try {
      // Intentar obtener desde cache primero
      if (enableCache) {
        const cached = localStorage.getItem(cacheKey)
        const cacheTimestamp = localStorage.getItem(`${cacheKey}-timestamp`)

        if (cached && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp)
          if (cacheAge < refetchInterval) {
            const parsedCache = JSON.parse(cached)
            // Convertir fechas de string a Date
            parsedCache.forEach((doc: any) => {
              if (doc.fechaSubida) doc.fechaSubida = new Date(doc.fechaSubida)
              if (doc.fechaVencimiento) doc.fechaVencimiento = new Date(doc.fechaVencimiento)
            })
            setDocumentos(parsedCache)
            setLoading(false)
            return
          }
        }
      }

      // Obtener desde API
      const apiUrl = getApiUrl()
      const endpoint = scoutId
        ? `/api/documentos_familia/scout/${scoutId}`
        : '/api/documentos_familia/listar'

      const response = await fetch(`${apiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Procesar datos
      const documentosProcesados = data.map((doc: any) => ({
        ...doc,
        // Asegurar que las fechas sean objetos Date
        fechaSubida: new Date(doc.fecha_subida || doc.fechaSubida),
        fechaVencimiento: doc.fecha_vencimiento ? new Date(doc.fecha_vencimiento) : undefined,
        // Calcular estado automáticamente si no viene
        estado: doc.estado || calcularEstadoDocumento(doc),
        // Valores por defecto
        version: doc.version || 1,
        aprobado: doc.aprobado !== undefined ? doc.aprobado : true,
        alertasConfig: doc.alertas_config || {
          email30dias: true,
          email15dias: true,
          email7dias: true,
          sms: false,
          push: true
        }
      }))

      setDocumentos(documentosProcesados)

      // Guardar en cache
      if (enableCache) {
        localStorage.setItem(cacheKey, JSON.stringify(documentosProcesados))
        localStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString())
      }

    } catch (err) {
      console.error('Error fetching documentos:', err)

      // Si hay error, intentar usar cache aunque sea viejo
      if (enableCache) {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const parsedCache = JSON.parse(cached)
          parsedCache.forEach((doc: any) => {
            if (doc.fechaSubida) doc.fechaSubida = new Date(doc.fechaSubida)
            if (doc.fechaVencimiento) doc.fechaVencimiento = new Date(doc.fechaVencimiento)
          })
          setDocumentos(parsedCache)
          setError('Usando datos guardados localmente')
          setLoading(false)
          return
        }
      }

      setError('No se pudieron cargar los documentos')

      // Datos de fallback para desarrollo
      const fallbackData: DocumentoFamilia[] = generarDatosFallback(scoutId)
      setDocumentos(fallbackData)

    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token, user, scoutId, cacheKey, enableCache, refetchInterval])

  // Obtener plantillas
  const fetchPlantillas = useCallback(async () => {
    if (!isAuthenticated || !token) return

    try {
      const cached = localStorage.getItem(plantillasCacheKey)
      if (cached) {
        setPlantillas(JSON.parse(cached))
        return
      }

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/documentos_familia/plantillas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlantillas(data)
        localStorage.setItem(plantillasCacheKey, JSON.stringify(data))
      } else {
        // Usar plantillas de fallback
        setPlantillas(generarPlantillasFallback())
      }
    } catch (err) {
      console.error('Error fetching plantillas:', err)
      setPlantillas(generarPlantillasFallback())
    }
  }, [isAuthenticated, token, plantillasCacheKey])

  // Subir documento
  const uploadDocumento = useCallback(async (
    file: File,
    data: Partial<DocumentoFamilia>
  ): Promise<boolean> => {
    if (!token) {
      setError('No autorizado')
      return false
    }

    // Validar archivo
    const validationResult = validarArchivo(file)
    if (!validationResult.valid) {
      setError(validationResult.error || 'Archivo no válido')
      return false
    }

    setUploading(true)
    setUploadProgress({
      loaded: 0,
      total: file.size,
      percentage: 0,
      status: 'pending'
    })
    setError(null)

    try {
      const formData = new FormData()
      formData.append('archivo', file)
      formData.append('datos', JSON.stringify({
        ...data,
        familiarId: user?.id,
        fechaSubida: new Date().toISOString()
      }))

      const apiUrl = getApiUrl()
      const xhr = new XMLHttpRequest()

      // Progreso de subida
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100)
          setUploadProgress({
            loaded: e.loaded,
            total: e.total,
            percentage,
            status: 'uploading'
          })
        }
      })

      // Completar subida
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadProgress(prev => prev ? { ...prev, status: 'complete', percentage: 100 } : null)
          fetchDocumentos() // Refrescar documentos
        } else {
          setUploadProgress(prev => prev ? { ...prev, status: 'error', error: 'Error al subir' } : null)
          setError('Error al subir el documento')
        }
        setUploading(false)
      })

      // Error en subida
      xhr.addEventListener('error', () => {
        setUploadProgress(prev => prev ? { ...prev, status: 'error', error: 'Error de conexión' } : null)
        setError('Error de conexión al subir el documento')
        setUploading(false)
      })

      xhr.open('POST', `${apiUrl}/api/documentos_familia/subir`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(formData)

      return true

    } catch (err) {
      console.error('Error uploading documento:', err)
      setError('Error al subir el documento')
      setUploading(false)
      setUploadProgress(prev => prev ? { ...prev, status: 'error', error: 'Error desconocido' } : null)
      return false
    }
  }, [token, user, fetchDocumentos])

  // Actualizar documento
  const updateDocumento = useCallback(async (
    id: string,
    data: Partial<DocumentoFamilia>
  ): Promise<boolean> => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/documentos_familia/actualizar/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Actualizar estado local
      setDocumentos(prev => prev ? prev.map(doc =>
        doc.id === id ? { ...doc, ...data } : doc
      ) : null)

      // Invalidar cache
      if (enableCache) {
        localStorage.removeItem(cacheKey)
        localStorage.removeItem(`${cacheKey}-timestamp`)
      }

      return true
    } catch (err) {
      console.error('Error updating documento:', err)
      setError('Error al actualizar el documento')
      return false
    }
  }, [token, cacheKey, enableCache])

  // Eliminar documento
  const deleteDocumento = useCallback(async (id: string): Promise<boolean> => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/documentos_familia/eliminar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Actualizar estado local
      setDocumentos(prev => prev ? prev.filter(doc => doc.id !== id) : null)

      // Invalidar cache
      if (enableCache) {
        localStorage.removeItem(cacheKey)
        localStorage.removeItem(`${cacheKey}-timestamp`)
      }

      return true
    } catch (err) {
      console.error('Error deleting documento:', err)
      setError('Error al eliminar el documento')
      return false
    }
  }, [token, cacheKey, enableCache])

  // Aprobar documento
  const aprobarDocumento = useCallback(async (id: string): Promise<boolean> => {
    return updateDocumento(id, {
      aprobado: true,
      aprobadoPor: user?.nombre + ' ' + user?.apellidos,
      estado: 'vigente'
    })
  }, [updateDocumento, user])

  // Descargar documento
  const descargarDocumento = useCallback(async (id: string): Promise<void> => {
    if (!token) return

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/documentos_familia/descargar/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al descargar el documento')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Obtener nombre del archivo
      const documento = documentos?.find(d => d.id === id)
      a.download = documento?.archivoNombre || `documento-${id}`

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading documento:', err)
      setError('Error al descargar el documento')
    }
  }, [token, documentos])

  // Descargar plantilla
  const descargarPlantilla = useCallback(async (plantillaId: string): Promise<void> => {
    if (!token) return

    try {
      const plantilla = plantillas?.find(p => p.id === plantillaId)
      if (!plantilla) return

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/documentos_familia/plantilla/${plantillaId}/descargar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al descargar la plantilla')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${plantilla.titulo}.${plantilla.formato}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading plantilla:', err)
      setError('Error al descargar la plantilla')
    }
  }, [token, plantillas])

  // Previsualizar documento
  const previsualizarDocumento = useCallback(async (id: string): Promise<string> => {
    if (!token) return ''

    try {
      const documento = documentos?.find(d => d.id === id)
      if (!documento) return ''

      // Si es imagen, devolver URL directa
      if (documento.tipoArchivo.startsWith('image/')) {
        const apiUrl = getApiUrl()
        return `${apiUrl}/api/documentos_familia/preview/${id}`
      }

      // Para PDF y otros, generar preview
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/documentos_familia/preview/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        return await response.text()
      }

      return ''
    } catch (err) {
      console.error('Error previewing documento:', err)
      return ''
    }
  }, [token, documentos])

  // Funciones de filtrado
  const buscarDocumentos = useCallback((query: string): DocumentoFamilia[] => {
    if (!documentos) return []
    const lowercaseQuery = query.toLowerCase()
    return documentos.filter(doc =>
      doc.titulo.toLowerCase().includes(lowercaseQuery) ||
      doc.descripcion?.toLowerCase().includes(lowercaseQuery) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      TIPOS_DOCUMENTO[doc.tipoDocumento as keyof typeof TIPOS_DOCUMENTO].toLowerCase().includes(lowercaseQuery)
    )
  }, [documentos])

  const filtrarPorEstado = useCallback((estado: DocumentoFamilia['estado']): DocumentoFamilia[] => {
    if (!documentos) return []
    return documentos.filter(doc => doc.estado === estado)
  }, [documentos])

  const filtrarPorTipo = useCallback((tipo: DocumentoFamilia['tipoDocumento']): DocumentoFamilia[] => {
    if (!documentos) return []
    return documentos.filter(doc => doc.tipoDocumento === tipo)
  }, [documentos])

  const documentosVencenEn = useCallback((dias: number): DocumentoFamilia[] => {
    if (!documentos) return []
    const ahora = new Date()
    const limite = new Date(ahora.getTime() + (dias * 24 * 60 * 60 * 1000))

    return documentos.filter(doc => {
      if (!doc.fechaVencimiento) return false
      return doc.fechaVencimiento >= ahora && doc.fechaVencimiento <= limite
    })
  }, [documentos])

  // Refetch
  const refetch = useCallback(async () => {
    await Promise.all([
      fetchDocumentos(),
      fetchPlantillas()
    ])
  }, [fetchDocumentos, fetchPlantillas])

  // Calcular documentos críticos
  const documentosCriticos = documentos?.filter(doc =>
    doc.estado === 'vencido' ||
    doc.estado === 'por_vencer' ||
    doc.estado === 'pendiente'
  ) || []

  // Agrupar documentos por scout
  const documentosPorScout = documentos?.reduce((acc, doc) => {
    if (!acc[doc.scoutId]) {
      acc[doc.scoutId] = []
    }
    acc[doc.scoutId].push(doc)
    return acc
  }, {} as Record<string, DocumentoFamilia[]>) || {}

  // Calcular estadísticas
  const estadisticas = {
    total: documentos?.length || 0,
    vigentes: documentos?.filter(d => d.estado === 'vigente').length || 0,
    porVencer: documentos?.filter(d => d.estado === 'por_vencer').length || 0,
    vencidos: documentos?.filter(d => d.estado === 'vencido').length || 0,
    pendientes: documentos?.filter(d => d.estado === 'pendiente').length || 0,
    enRevision: documentos?.filter(d => d.estado === 'en_revision').length || 0,
    porcentajeCompletado: documentos?.length > 0
      ? Math.round((documentos.filter(d => d.estado === 'vigente').length / documentos.length) * 100)
      : 0
  }

  // Efectos iniciales
  useEffect(() => {
    if (isAuthenticated) {
      fetchDocumentos()
      fetchPlantillas()
    }
  }, [isAuthenticated, fetchDocumentos, fetchPlantillas])

  // Auto-refetch
  useEffect(() => {
    if (!autoRefetch) return

    const interval = setInterval(() => {
      fetchDocumentos()
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [autoRefetch, refetchInterval, fetchDocumentos])

  return {
    // Datos
    documentos,
    documentosCriticos,
    documentosPorScout,
    plantillas,

    // Estados
    loading,
    uploading,
    error,
    uploadProgress,

    // Acciones
    refetch,
    uploadDocumento,
    updateDocumento,
    deleteDocumento,
    aprobarDocumento,
    descargarDocumento,
    descargarPlantilla,
    previsualizarDocumento,

    // Filtrado
    buscarDocumentos,
    filtrarPorEstado,
    filtrarPorTipo,
    documentosVencenEn,

    // Estadísticas
    estadisticas
  }
}

// Funciones auxiliares
function calcularEstadoDocumento(doc: any): DocumentoFamilia['estado'] {
  if (!doc.fecha_vencimiento) return 'vigente'

  const ahora = new Date()
  const vencimiento = new Date(doc.fecha_vencimiento)
  const diasDiff = Math.ceil((vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))

  if (diasDiff < 0) return 'vencido'
  if (diasDiff <= 30) return 'por_vencer'
  return 'vigente'
}

function validarArchivo(file: File): { valid: boolean; error?: string } {
  // Tipos permitidos
  const tiposPermitidos = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  // Validar tipo
  if (!tiposPermitidos.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Se permite PDF, JPG, PNG, DOC, DOCX'
    }
  }

  // Validar tamaño (10MB máximo)
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Máximo 10MB'
    }
  }

  return { valid: true }
}

function generarDatosFallback(scoutId?: string): DocumentoFamilia[] {
  const baseDocumentos: DocumentoFamilia[] = [
    {
      id: '1',
      scoutId: scoutId || '1',
      familiarId: '1',
      tipoDocumento: 'autorizacion_medica',
      titulo: 'Autorización Médica',
      descripcion: 'Autorización para atención médica de emergencia',
      archivoNombre: 'autorizacion_medica_carlos.pdf',
      archivoRuta: '/uploads/autorizacion_medica_carlos.pdf',
      tipoArchivo: 'application/pdf',
      tamañoArchivo: 245760,
      fechaVencimiento: new Date('2025-03-15'),
      estado: 'vigente',
      fechaSubida: new Date('2024-03-15'),
      aprobado: true,
      aprobadoPor: 'Admin Sistema',
      version: 1,
      metadata: { pagina: 2, firmas: 2 },
      alertasConfig: {
        email30dias: true,
        email15dias: true,
        email7dias: true,
        sms: false,
        push: true
      }
    },
    {
      id: '2',
      scoutId: scoutId || '1',
      familiarId: '1',
      tipoDocumento: 'ficha_alergias',
      titulo: 'Ficha de Alergias',
      descripcion: 'Información sobre alergias e intolerancias alimentarias',
      archivoNombre: 'ficha_alergias_carlos.pdf',
      archivoRuta: '/uploads/ficha_alergias_carlos.pdf',
      tipoArchivo: 'application/pdf',
      tamañoArchivo: 153600,
      estado: 'vigente',
      fechaSubida: new Date('2024-02-20'),
      aprobado: true,
      version: 1,
      metadata: { pagina: 1 },
      alertasConfig: {
        email30dias: true,
        email15dias: true,
        email7dias: false,
        sms: false,
        push: true
      }
    },
    {
      id: '3',
      scoutId: scoutId || '2',
      familiarId: '1',
      tipoDocumento: 'autorizacion_medica',
      titulo: 'Autorización Médica',
      descripcion: 'Autorización para atención médica de emergencia',
      archivoNombre: 'autorizacion_medica_sofia.pdf',
      archivoRuta: '/uploads/autorizacion_medica_sofia.pdf',
      tipoArchivo: 'application/pdf',
      tamañoArchivo: 245760,
      fechaVencimiento: new Date('2024-10-30'),
      estado: 'vencido',
      fechaSubida: new Date('2023-10-30'),
      aprobado: true,
      version: 1,
      metadata: { pagina: 2, firmas: 2 },
      alertasConfig: {
        email30dias: true,
        email15dias: true,
        email7dias: true,
        sms: true,
        push: true
      }
    },
    {
      id: '4',
      scoutId: scoutId || '2',
      familiarId: '1',
      tipoDocumento: 'foto_carnet',
      titulo: 'Foto Carnet',
      descripcion: ' fotografía reciente para documentos',
      archivoNombre: 'foto_carnet_sofia.jpg',
      archivoRuta: '/uploads/foto_carnet_sofia.jpg',
      tipoArchivo: 'image/jpeg',
      tamañoArchivo: 81920,
      estado: 'pendiente',
      fechaSubida: new Date(),
      aprobado: false,
      version: 1,
      metadata: { dpi: 300 },
      alertasConfig: {
        email30dias: false,
        email15dias: false,
        email7dias: false,
        sms: false,
        push: true
      }
    }
  ]

  return scoutId
    ? baseDocumentos.filter(doc => doc.scoutId === scoutId)
    : baseDocumentos
}

function generarPlantillasFallback(): PlantillaDocumento[] {
  return [
    {
      id: '1',
      tipo: 'autorizacion_medica',
      titulo: 'Autorización Médica Estándar',
      descripcion: 'Plantilla para autorización de atención médica de emergencia',
      archivo: 'plantillas/autorizacion_medica.docx',
      formato: 'docx',
      campos: [
        { nombre: 'nombre_scout', tipo: 'texto', required: true },
        { nombre: 'fecha_nacimiento', tipo: 'fecha', required: true },
        { nombre: 'grupo_sanguineo', tipo: 'select', required: false, opciones: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
        { nombre: 'alergias', tipo: 'texto', required: true },
        { nombre: 'medicacion_actual', tipo: 'texto', required: false },
        { nombre: 'contacto_emergencia', tipo: 'texto', required: true }
      ],
      instrucciones: [
        'Completa todos los campos obligatorios marcados con *',
        'Si no tiene alergias, escriba "Ninguna"',
        'Incluye teléfono de contacto de emergencia disponible 24h',
        'Firma y fecha al final del documento'
      ]
    },
    {
      id: '2',
      tipo: 'ficha_alergias',
      titulo: 'Ficha de Alergias e Intolerancias',
      descripcion: 'Formulario detallado para declaración de alergias',
      archivo: 'plantillas/ficha_alergias.pdf',
      formato: 'pdf',
      campos: [
        { nombre: 'alergias_alimentarias', tipo: 'texto', required: true },
        { nombre: 'alergias_medicamentos', tipo: 'texto', required: true },
        { nombre: 'alergias_ambientales', tipo: 'texto', required: false },
        { nombre: 'intolerancias', tipo: 'texto', required: false },
        { nombre: 'tratamiento_reacciones', tipo: 'texto', required: true }
      ],
      instrucciones: [
        'Sé específico con cada tipo de alergia',
        'Indica la gravedad de cada reacción (leve, moderada, grave)',
        'Si requiere tratamiento específico, indícalo claramente',
        'Firma del padre/madre o tutor legal'
      ]
    },
    {
      id: '3',
      tipo: 'autorizacion_imagen',
      titulo: 'Autorización de Imagen',
      descripcion: 'Consentimiento para uso de fotografías y videos',
      archivo: 'plantillas/autorizacion_imagen.docx',
      formato: 'docx',
      campos: [
        { nombre: 'nombre_scout', tipo: 'texto', required: true },
        { nombre: 'permiso_fotos', tipo: 'select', required: true, opciones: ['Sí', 'No'] },
        { nombre: 'permiso_videos', tipo: 'select', required: true, opciones: ['Sí', 'No'] },
        { nombre: 'permiso_redes_sociales', tipo: 'select', required: true, opciones: ['Sí', 'No'] },
        { nombre: 'restricciones', tipo: 'texto', required: false }
      ],
      instrucciones: [
        'Marca claramente qué permisos concedes',
        'Si hay restricciones específicas, indícalas',
        'Firma al final del documento'
      ]
    }
  ]
}