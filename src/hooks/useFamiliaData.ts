'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getApiUrl } from '@/lib/api-utils'

interface ScoutHijo {
  id: number
  nombre: string
  apellidos: string
  apodo?: string
  fecha_nacimiento: string
  seccion: string
  seccion_id: number
  seccion_color?: string
  edad: number
  foto?: string
  email?: string
  telefono?: string
  direccion?: string
  activo: boolean
  fecha_ingreso: string
  documentos_estado: 'completo' | 'pendiente' | 'vencido'
  progreso_general?: number
  ultima_actividad?: string
  proxima_actividad?: string
  relacion?: 'padre' | 'madre' | 'tutor_legal' | 'otro'
  es_contacto_principal?: boolean
  monitor_asignado?: {
    nombre: string
    apellidos: string
    foto?: string
    contacto?: string
  }
  contacto_emergencia?: {
    nombre: string
    relacion: string
    telefono: string
  }
  notas_medicas?: string
  alergias?: string[]
  habilidades_especiales?: string[]
}

interface UseFamiliaDataOptions {
  autoRefetch?: boolean
  refetchInterval?: number
  cacheKey?: string
}

interface UseFamiliaDataReturn {
  hijos: ScoutHijo[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateHijo: (hijoId: number, data: Partial<ScoutHijo>) => Promise<boolean>
  addHijo: (data: Omit<ScoutHijo, 'id'>) => Promise<boolean>
  removeHijo: (hijoId: number) => Promise<boolean>
  getHijoById: (hijoId: number) => ScoutHijo | undefined
  getHijosBySeccion: (seccionId: number) => ScoutHijo[]
}

export function useFamiliaData({
  autoRefetch = true,
  refetchInterval = 5 * 60 * 1000, // 5 minutos
  cacheKey = 'familia-data'
}: UseFamiliaDataOptions = {}): UseFamiliaDataReturn {
  const { user, token, isAuthenticated } = useAuth()
  const [hijos, setHijos] = useState<ScoutHijo[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHijos = useCallback(async () => {
    console.log('🚀 [useFamiliaData] Iniciando fetchHijos...')
    console.log('🚀 [useFamiliaData] isAuthenticated:', isAuthenticated)
    console.log('🚀 [useFamiliaData] token:', token ? 'Existe (longitud: ' + token.length + ')' : 'NO existe')
    console.log('🚀 [useFamiliaData] user:', user)

    if (!isAuthenticated || !token || !user) {
      console.log('❌ [useFamiliaData] No autenticado o falta token/user')
      return
    }

    setLoading(true)
    setError(null)

    console.log('✅ [useFamiliaData] Usuario autenticado, obteniendo datos...')

    try {
      // Intentar obtener desde cache primero
      const cached = localStorage.getItem(cacheKey)
      const cacheTimestamp = localStorage.getItem(`${cacheKey}-timestamp`)

      console.log('📦 [useFamiliaData] Cache info:', {
        cacheKey,
        cached: cached ? 'Existe' : 'NO existe',
        cacheTimestamp: cacheTimestamp ? new Date(parseInt(cacheTimestamp)).toLocaleString() : 'NO existe'
      })

      if (cached && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp)
        console.log('⏱️ [useFamiliaData] Cache edad:', Math.floor(cacheAge / 1000), 'segundos')
        console.log('⏱️ [useFamiliaData] Refetch interval:', Math.floor(refetchInterval / 1000), 'segundos')

        if (cacheAge < refetchInterval) {
          console.log('✅ [useFamiliaData] Usando datos del cache')
          const cachedData = JSON.parse(cached)
          console.log('📦 [useFamiliaData] Datos del cache:', cachedData)
          setHijos(cachedData)
          setLoading(false)
          return
        } else {
          console.log('⏱️ [useFamiliaData] Cache expirado, obteniendo datos frescos')
        }
      } else {
        console.log('📦 [useFamiliaData] No hay cache, obteniendo datos frescos')
      }

      // Obtener desde API
      const apiUrl = getApiUrl()
      console.log('🌐 [useFamiliaData] Haciendo petición a:', `${apiUrl}/api/familia/hijos`)

      const response = await fetch(`${apiUrl}/api/familia/hijos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // ============ DEBUG: Ver respuesta completa ============
      console.log('🔍 [useFamiliaData] Respuesta completa de la API:', data)
      console.log('🔍 [useFamiliaData] data.success:', data.success)
      console.log('🔍 [useFamiliaData] data.data:', data.data)

      // Extraer array de educandos de la respuesta { success: true, data: [...] }
      const educandos = data.success ? data.data : data

      console.log('🔍 [useFamiliaData] Educandos extraídos:', educandos)
      console.log('🔍 [useFamiliaData] Cantidad de educandos:', educandos?.length || 0)

      // Procesar datos y normalizar nombres de campos
      const hijosProcesados = (educandos || []).map((hijo: any) => ({
        id: hijo.educando_id || hijo.id,
        nombre: hijo.nombre,
        apellidos: hijo.apellidos,
        seccion: hijo.seccion_nombre || hijo.seccion || 'Sin sección',
        seccion_id: hijo.seccion_id,
        seccion_color: hijo.seccion_color,
        foto: hijo.foto_perfil || hijo.foto,
        fecha_nacimiento: hijo.fecha_nacimiento,
        edad: hijo.edad || calculateEdad(hijo.fecha_nacimiento),
        genero: hijo.genero,
        email: hijo.email,
        telefono: hijo.telefono_movil || hijo.telefono,
        activo: hijo.activo !== undefined ? hijo.activo : true,
        fecha_ingreso: hijo.fecha_alta || hijo.fecha_ingreso || new Date().toISOString().split('T')[0],
        relacion: hijo.relacion,
        es_contacto_principal: hijo.es_contacto_principal,
        // Agregar datos simulados si no vienen de la API
        documentos_estado: hijo.documentos_estado || 'completo',
        progreso_general: hijo.progreso_general || Math.floor(Math.random() * 100),
        ultima_actividad: hijo.ultima_actividad || 'Última semana',
        proxima_actividad: hijo.proxima_actividad || 'Próximo fin de semana'
      }))

      console.log('✅ [useFamiliaData] Hijos procesados:', hijosProcesados)
      console.log('✅ [useFamiliaData] Guardando', hijosProcesados.length, 'hijo(s) en el estado')

      setHijos(hijosProcesados)

      // ⚠️ IMPORTANTE: NO guardar en cache si el array está vacío
      // Esto evita que se cachee el estado "sin hijos" cuando realmente
      // puede haber vinculaciones que aún no se han cargado
      if (hijosProcesados.length > 0) {
        // Guardar en cache solo si hay datos
        localStorage.setItem(cacheKey, JSON.stringify(hijosProcesados))
        localStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString())
        console.log('💾 [useFamiliaData] Datos guardados en cache y estado')
      } else {
        // Si no hay hijos, invalidar el cache para forzar recarga en próximo intento
        localStorage.removeItem(cacheKey)
        localStorage.removeItem(`${cacheKey}-timestamp`)
        console.log('🗑️ [useFamiliaData] No hay hijos, cache invalidado')
      }

    } catch (err) {
      console.error('Error fetching hijos:', err)
      
      // Si hay error, intentar usar datos del cache aunque sea viejo
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setHijos(JSON.parse(cached))
        setError('Usando datos guardados localmente')
      } else {
        // Si no hay cache y hay error, mostrar array vacío
        // NO usar datos mock - los hijos reales se vincularán después
        setError('No se pudieron cargar los datos de tus hijos')
        setHijos([])
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token, user, cacheKey, refetchInterval])

  const refetch = useCallback(async () => {
    await fetchHijos()
  }, [fetchHijos])

  const updateHijo = useCallback(async (hijoId: number, data: Partial<ScoutHijo>) => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/familia/hijos/${hijoId}`, {
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
      setHijos(prev => prev ? prev.map(hijo => 
        hijo.id === hijoId ? { ...hijo, ...data } : hijo
      ) : null)

      // Invalidar cache
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(`${cacheKey}-timestamp`)

      return true
    } catch (err) {
      console.error('Error updating hijo:', err)
      setError('Error al actualizar los datos del scout')
      return false
    }
  }, [token, cacheKey])

  const addHijo = useCallback(async (data: Omit<ScoutHijo, 'id'>) => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/familia/hijos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const nuevoHijo = await response.json()

      // Actualizar estado local
      setHijos(prev => prev ? [...prev, nuevoHijo] : [nuevoHijo])

      // Invalidar cache
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(`${cacheKey}-timestamp`)

      return true
    } catch (err) {
      console.error('Error adding hijo:', err)
      setError('Error al agregar nuevo scout')
      return false
    }
  }, [token, cacheKey])

  const removeHijo = useCallback(async (hijoId: number) => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/familia/hijos/${hijoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Actualizar estado local
      setHijos(prev => prev ? prev.filter(hijo => hijo.id !== hijoId) : null)

      // Invalidar cache
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(`${cacheKey}-timestamp`)

      return true
    } catch (err) {
      console.error('Error removing hijo:', err)
      setError('Error al eliminar el scout')
      return false
    }
  }, [token, cacheKey])

  const getHijoById = useCallback((hijoId: number) => {
    return hijos?.find(hijo => hijo.id === hijoId)
  }, [hijos])

  const getHijosBySeccion = useCallback((seccionId: number) => {
    return hijos?.filter(hijo => hijo.seccion_id === seccionId) || []
  }, [hijos])

  // Efecto inicial
  useEffect(() => {
    if (isAuthenticated && token && user) {
      fetchHijos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, user?.id])

  // Auto-refetch
  useEffect(() => {
    if (!autoRefetch || !isAuthenticated) return

    const interval = setInterval(() => {
      fetchHijos()
    }, refetchInterval)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefetch, refetchInterval, isAuthenticated])

  // NO necesitamos un efecto separado para cuando el usuario se autentica
  // porque ya está cubierto por el efecto inicial

  return {
    hijos,
    loading,
    error,
    refetch,
    updateHijo,
    addHijo,
    removeHijo,
    getHijoById,
    getHijosBySeccion
  }
}

// Función auxiliar para calcular edad
function calculateEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

// Hook para obtener estadísticas de los hijos
export function useFamiliaStats() {
  const { hijos } = useFamiliaData()

  const stats = {
    totalHijos: hijos?.length || 0,
    hijosActivos: hijos?.filter(h => h.activo).length || 0,
    documentosCompletos: hijos?.filter(h => h.documentos_estado === 'completo').length || 0,
    documentosPendientes: hijos?.filter(h => h.documentos_estado === 'pendiente').length || 0,
    documentosVencidos: hijos?.filter(h => h.documentos_estado === 'vencido').length || 0,
    progresoPromedio: hijos?.reduce((sum, h) => sum + (h.progreso_general || 0), 0) / (hijos.length || 0) || 0,
    seccionesRepresentadas: [...new Set(hijos?.map(h => h.seccion) || [])].length
  }

  return stats
}

// Hook para obtener hijos con documentos críticos
export function useHijosConDocumentosCriticos() {
  const { hijos } = useFamiliaData()
  
  return hijos?.filter(hijo => 
    hijo.documentos_estado === 'vencido' || hijo.documentos_estado === 'pendiente'
  ) || []
}