'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFamiliaData } from '@/hooks/useFamiliaData'
import { getApiUrl } from '@/lib/api-utils'

// Interfaces para la galería familiar
export interface FotoGaleria {
  id: string
  album_id: string
  url: string
  url_thumbnail: string
  titulo: string
  descripcion?: string
  fecha_captura: string
  tamaño_bytes: number
  tamaño_formato: string
  tipo: string
  etiquetas: EtiquetaScout[]
  metadata: {
    camara?: string
    lente?: string
    iso?: number
    apertura?: string
    velocidad?: string
    gps_lat?: number
    gps_lng?: number
  }
  created_at: string
}

export interface EtiquetaScout {
  scout_id: number
  nombre_completo: string
  apodo?: string
  seccion: string
  confianza: number // 0-100
  coords?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface AlbumPrivado {
  id: string
  titulo: string
  descripcion?: string
  fecha_evento: string
  lugar_evento?: string
  tipo_evento: 'campamento' | 'actividad' | 'jornada' | 'reunion' | 'especial'
  seccion: string
  seccion_id: number
  es_publico: boolean
  fotos_count: number
  thumbnail_url?: string
  scouts_etiquetados: number[]
  etiquetas_count: number
  created_at: string
  updated_at: string
}

export interface FotoSeleccionada {
  foto: FotoGaleria
  seleccionada: boolean
}

export interface OpcionesDescarga {
  formato: 'original' | 'comprimido' | 'web'
  calidad: number // 1-100
  incluir_metadata: boolean
  renombrar_archivos: boolean
}

export interface OpcionesCompartir {
  email_destino: string
  mensaje_personal?: string
  expiracion_horas: number
  permitir_descarga: boolean
  limite_descargas?: number
}

export interface UseGaleriaFamiliaOptions {
  autoRefetch?: boolean
  refetchInterval?: number
  cacheKey?: string
}

interface UseGaleriaFamiliaReturn {
  // Datos
  albumes: AlbumPrivado[] | null
  albumActual: AlbumPrivado | null
  fotos: FotoGaleria[] | null
  fotosSeleccionadas: FotoSeleccionada[]
  loading: boolean
  error: string | null

  // Estados UI
  loadingAlbumes: boolean
  loadingFotos: boolean
  loadingDescarga: boolean
  loadingCompartir: boolean

  // Acciones principales
  cargarAlbumes: () => Promise<void>
  cargarAlbum: (albumId: string) => Promise<void>
  seleccionarFoto: (fotoId: string, seleccionada: boolean) => void
  seleccionarTodas: () => void
  deseleccionarTodas: () => void

  // Descargas
  descargarFoto: (foto: FotoGaleria, opciones?: OpcionesDescarga) => Promise<boolean>
  descargarSeleccionadas: (opciones?: OpcionesDescarga) => Promise<boolean>
  descargarAlbumCompleto: (albumId: string, opciones?: OpcionesDescarga) => Promise<boolean>

  // Compartir
  compartirPorEmail: (fotos: FotoGaleria[], opciones: OpcionesCompartir) => Promise<string | null>
  generarEnlaceTemporal: (fotos: FotoGaleria[], expiracionHoras?: number) => Promise<string | null>

  // Búsqueda y filtrado
  buscarFotos: (query: string) => Promise<FotoGaleria[]>
  filtrarPorScout: (scoutId: number) => Promise<FotoGaleria[]>
  filtrarPorFecha: (fechaInicio: string, fechaFin: string) => Promise<FotoGaleria[]>

  // Utilidades
  refrescar: () => Promise<void>
  limpiarSeleccion: () => void
  getEstadisticas: () => {
    totalAlbumes: number
    totalFotos: number
    seleccionadasCount: number
    ultimoAlbum: AlbumPrivado | null
  }
}

export function useGaleriaFamilia({
  autoRefetch = true,
  refetchInterval = 10 * 60 * 1000, // 10 minutos
  cacheKey = 'galeria-familia'
}: UseGaleriaFamiliaOptions = {}): UseGaleriaFamiliaReturn {
  const { user, token, isAuthenticated } = useAuth()
  const { hijos } = useFamiliaData()

  // Estados principales
  const [albumes, setAlbumes] = useState<AlbumPrivado[] | null>(null)
  const [albumActual, setAlbumActual] = useState<AlbumPrivado | null>(null)
  const [fotos, setFotos] = useState<FotoGaleria[] | null>(null)
  const [fotosSeleccionadas, setFotosSeleccionadas] = useState<FotoSeleccionada[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados de carga específicos
  const [loadingAlbumes, setLoadingAlbumes] = useState(false)
  const [loadingFotos, setLoadingFotos] = useState(false)
  const [loadingDescarga, setLoadingDescarga] = useState(false)
  const [loadingCompartir, setLoadingCompartir] = useState(false)

  // Obtener los IDs de los hijos del familiar (memoizado para evitar recreación en cada render)
  const hijosIds = useMemo(() => hijos?.map(hijo => hijo.id) || [], [hijos])

  // Cargar álbumes donde aparecen los hijos
  const cargarAlbumes = useCallback(async () => {
    if (!isAuthenticated || !token || !user || hijosIds.length === 0) {
      return
    }

    setLoadingAlbumes(true)
    setError(null)

    try {
      // Intentar cache primero
      const cacheKeyAlbumes = `${cacheKey}-albumes`
      const cached = localStorage.getItem(cacheKeyAlbumes)
      const cacheTimestamp = localStorage.getItem(`${cacheKeyAlbumes}-timestamp`)

      if (cached && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp)
        if (cacheAge < refetchInterval) {
          setAlbumes(JSON.parse(cached))
          setLoadingAlbumes(false)
          return
        }
      }

      const apiUrl = getApiUrl()
      const hijosQuery = hijosIds.join(',')
      const response = await fetch(`${apiUrl}/api/galeria-privada/albumes?familia_id=${user.id}&hijos_ids=${hijosQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Extraer array de álbumes de la respuesta
      const albumesArray = data.data || data || []

      // Procesar datos
      const albumesProcesados = albumesArray.map((album: any) => ({
        ...album,
        es_nuevo: isAlbumNuevo(album.fecha_evento),
        fotos_count_formatted: formatCount(album.fotos_count),
        etiquetas_count_formatted: formatCount(album.etiquetas_count)
      }))

      setAlbumes(albumesProcesados)

      // Guardar en cache
      localStorage.setItem(cacheKeyAlbumes, JSON.stringify(albumesProcesados))
      localStorage.setItem(`${cacheKeyAlbumes}-timestamp`, Date.now().toString())

    } catch (err) {
      console.error('Error cargando álbumes:', err)

      // Intentar usar cache aunque sea viejo
      const cacheKeyAlbumes = `${cacheKey}-albumes`
      const cached = localStorage.getItem(cacheKeyAlbumes)
      if (cached) {
        setAlbumes(JSON.parse(cached))
        setError('Usando datos guardados localmente')
      } else {
        setError('No se pudieron cargar los álbumes de fotos')
        setAlbumes([])
      }
    } finally {
      setLoadingAlbumes(false)
    }
  }, [isAuthenticated, token, user, hijosIds, cacheKey, refetchInterval])

  // Cargar fotos de un álbum específico
  const cargarAlbum = useCallback(async (albumId: string) => {
    if (!isAuthenticated || !token || !user || !albumId) {
      return
    }

    setLoadingFotos(true)
    setError(null)

    try {
      const apiUrl = getApiUrl()
      const hijosQuery = hijosIds.join(',')
      const response = await fetch(`${apiUrl}/api/galeria-privada/albumes/${albumId}/fotos?familia_id=${user.id}&hijos_ids=${hijosQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Procesar fotos
      const fotosProcesadas = data.fotos.map((foto: any) => ({
        ...foto,
        tamaño_formato: formatFileSize(foto.tamaño_bytes),
        scouts_etiquetados_nombres: foto.etiquetas?.map((etiqueta: any) =>
          etiqueta.apodo || etiqueta.nombre_completo.split(' ')[0]
        ).join(', ') || ''
      }))

      setFotos(fotosProcesadas)
      setAlbumActual(data.album)

      // Limpiar selección anterior
      setFotosSeleccionadas([])

    } catch (err) {
      console.error('Error cargando fotos del álbum:', err)
      setError('No se pudieron cargar las fotos del álbum')
      setFotos([])
      setAlbumActual(null)
    } finally {
      setLoadingFotos(false)
    }
  }, [isAuthenticated, token, user, hijosIds])

  // Selección de fotos
  const seleccionarFoto = useCallback((fotoId: string, seleccionada: boolean) => {
    setFotosSeleccionadas(prev => {
      const existe = prev.find(item => item.foto.id === fotoId)

      if (seleccionada && !existe) {
        const foto = fotos?.find(f => f.id === fotoId)
        if (foto) {
          return [...prev, { foto, seleccionada: true }]
        }
      } else if (!seleccionada && existe) {
        return prev.filter(item => item.foto.id !== fotoId)
      }

      return prev
    })
  }, [fotos])

  const seleccionarTodas = useCallback(() => {
    if (!fotos) return

    const todasSeleccionadas = fotos.map(foto => ({
      foto,
      seleccionada: true
    }))
    setFotosSeleccionadas(todasSeleccionadas)
  }, [fotos])

  const deseleccionarTodas = useCallback(() => {
    setFotosSeleccionadas([])
  }, [])

  // Descargar foto individual
  const descargarFoto = useCallback(async (foto: FotoGaleria, opciones: OpcionesDescarga = getDefaultOpcionesDescarga()): Promise<boolean> => {
    if (!token) return false

    try {
      setLoadingDescarga(true)
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/galeria_privada/descargar/${foto.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          opciones,
          familia_id: user?.id
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Nombre de archivo descriptivo
      const nombreArchivo = opciones.renombrar_archivos
        ? `${foto.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${foto.fecha_captura}.${foto.tipo.split('/')[1]}`
        : foto.url.split('/').pop() || `foto_${foto.id}.${foto.tipo.split('/')[1]}`

      a.download = nombreArchivo
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return true
    } catch (err) {
      console.error('Error descargando foto:', err)
      setError('No se pudo descargar la foto')
      return false
    } finally {
      setLoadingDescarga(false)
    }
  }, [token, user])

  // Descargar fotos seleccionadas
  const descargarSeleccionadas = useCallback(async (opciones: OpcionesDescarga = getDefaultOpcionesDescarga()): Promise<boolean> => {
    if (fotosSeleccionadas.length === 0 || !token) return false

    try {
      setLoadingDescarga(true)
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/galeria_privada/descargar-varias`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          foto_ids: fotosSeleccionadas.map(item => item.foto.id),
          opciones,
          familia_id: user?.id
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fotos_osyris_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return true
    } catch (err) {
      console.error('Error descargando fotos seleccionadas:', err)
      setError('No se pudieron descargar las fotos seleccionadas')
      return false
    } finally {
      setLoadingDescarga(false)
    }
  }, [fotosSeleccionadas, token, user])

  // Descargar álbum completo
  const descargarAlbumCompleto = useCallback(async (albumId: string, opciones: OpcionesDescarga = getDefaultOpcionesDescarga()): Promise<boolean> => {
    if (!token || !albumId) return false

    try {
      setLoadingDescarga(true)
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/galeria-privada/albumes/${albumId}/descargar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          opciones,
          familia_id: user?.id
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `album_${albumActual?.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return true
    } catch (err) {
      console.error('Error descargando álbum:', err)
      setError('No se pudo descargar el álbum completo')
      return false
    } finally {
      setLoadingDescarga(false)
    }
  }, [token, user, albumActual])

  // Compartir por email
  const compartirPorEmail = useCallback(async (fotos: FotoGaleria[], opciones: OpcionesCompartir): Promise<string | null> => {
    if (!token || fotos.length === 0) return null

    try {
      setLoadingCompartir(true)
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/galeria_privada/compartir-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          foto_ids: fotos.map(f => f.id),
          opciones,
          familia_id: user?.id
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.enlace_compartir || null

    } catch (err) {
      console.error('Error compartiendo por email:', err)
      setError('No se pudo compartir por email')
      return null
    } finally {
      setLoadingCompartir(false)
    }
  }, [token, user])

  // Generar enlace temporal
  const generarEnlaceTemporal = useCallback(async (fotos: FotoGaleria[], expiracionHoras: number = 24): Promise<string | null> => {
    if (!token || fotos.length === 0) return null

    try {
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/galeria_privada/generar-enlace`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          foto_ids: fotos.map(f => f.id),
          expiracion_horas: expiracionHoras,
          familia_id: user?.id
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.enlace_temporal || null

    } catch (err) {
      console.error('Error generando enlace temporal:', err)
      setError('No se pudo generar enlace temporal')
      return null
    }
  }, [token, user])

  // Búsqueda y filtrado
  const buscarFotos = useCallback(async (query: string): Promise<FotoGaleria[]> => {
    if (!token || query.trim() === '') return []

    try {
      const apiUrl = getApiUrl()
      const hijosQuery = hijosIds.join(',')

      const response = await fetch(`${apiUrl}/api/galeria_privada/buscar?q=${encodeURIComponent(query)}&hijos_ids=${hijosQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      console.error('Error buscando fotos:', err)
      return []
    }
  }, [token, hijosIds])

  const filtrarPorScout = useCallback(async (scoutId: number): Promise<FotoGaleria[]> => {
    if (!token) return []

    try {
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/galeria_privada/filtrar?scout_id=${scoutId}&familia_id=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      console.error('Error filtrando por scout:', err)
      return []
    }
  }, [token, user])

  const filtrarPorFecha = useCallback(async (fechaInicio: string, fechaFin: string): Promise<FotoGaleria[]> => {
    if (!token) return []

    try {
      const apiUrl = getApiUrl()
      const hijosQuery = hijosIds.join(',')

      const response = await fetch(`${apiUrl}/api/galeria_privada/filtrar?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&hijos_ids=${hijosQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      console.error('Error filtrando por fecha:', err)
      return []
    }
  }, [token, hijosIds])

  // Utilidades
  const refrescar = useCallback(async () => {
    await cargarAlbumes()
    if (albumActual) {
      await cargarAlbum(albumActual.id)
    }
  }, [cargarAlbumes, cargarAlbum, albumActual])

  const limpiarSeleccion = useCallback(() => {
    setFotosSeleccionadas([])
  }, [])

  const getEstadisticas = useCallback(() => {
    return {
      totalAlbumes: albumes?.length || 0,
      totalFotos: albumActual?.fotos_count || fotos?.length || 0,
      seleccionadasCount: fotosSeleccionadas.length,
      ultimoAlbum: albumes?.[0] || null
    }
  }, [albumes, albumActual, fotos, fotosSeleccionadas])

  // Efectos
  useEffect(() => {
    if (isAuthenticated && token && user) {
      cargarAlbumes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, user?.id, hijosIds.length])

  // Auto-refetch
  useEffect(() => {
    if (!autoRefetch || !isAuthenticated) return

    const interval = setInterval(() => {
      cargarAlbumes()
      if (albumActual) {
        cargarAlbum(albumActual.id)
      }
    }, refetchInterval)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefetch, refetchInterval, isAuthenticated, hijosIds.length, albumActual?.id])

  return {
    // Datos
    albumes,
    albumActual,
    fotos,
    fotosSeleccionadas,
    loading,
    error,

    // Estados UI
    loadingAlbumes,
    loadingFotos,
    loadingDescarga,
    loadingCompartir,

    // Acciones principales
    cargarAlbumes,
    cargarAlbum,
    seleccionarFoto,
    seleccionarTodas,
    deseleccionarTodas,

    // Descargas
    descargarFoto,
    descargarSeleccionadas,
    descargarAlbumCompleto,

    // Compartir
    compartirPorEmail,
    generarEnlaceTemporal,

    // Búsqueda y filtrado
    buscarFotos,
    filtrarPorScout,
    filtrarPorFecha,

    // Utilidades
    refrescar,
    limpiarSeleccion,
    getEstadisticas
  }
}

// Funciones auxiliares
function isAlbumNuevo(fechaEvento: string): boolean {
  const fecha = new Date(fechaEvento)
  const ahora = new Date()
  const horasDiferencia = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60)
  return horasDiferencia <= 48
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function getDefaultOpcionesDescarga(): OpcionesDescarga {
  return {
    formato: 'original',
    calidad: 90,
    incluir_metadata: true,
    renombrar_archivos: true
  }
}

// Hook adicional para estadísticas de la galería
export function useGaleriaStats() {
  const { albumes, fotos } = useGaleriaFamilia()

  const stats = {
    totalAlbumes: albumes?.length || 0,
    totalFotos: albumes?.reduce((sum, album) => sum + album.fotos_count, 0) || 0,
    albumesNuevos: albumes?.filter(album => isAlbumNuevo(album.fecha_evento)).length || 0,
    fotosTotales: fotos?.length || 0,
    seccionesRepresentadas: [...new Set(albumes?.map(album => album.seccion) || [])].length,
    ultimoMes: albumes?.filter(album => {
      const fecha = new Date(album.fecha_evento)
      const mesPasado = new Date()
      mesPasado.setMonth(mesPasado.getMonth() - 1)
      return fecha >= mesPasado
    }).length || 0
  }

  return stats
}