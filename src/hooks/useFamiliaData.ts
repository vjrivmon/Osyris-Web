'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getApiUrl } from '@/lib/api-utils'
import { authenticatedFetch, SessionExpiredError } from '@/lib/auth-utils'

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
  seccionesHijos: number[] // IDs de secciones únicas de los hijos
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
  cacheKey: baseCacheKey = 'familia-data'
}: UseFamiliaDataOptions = {}): UseFamiliaDataReturn {
  const { user, token, isAuthenticated, isLoading: authLoading, authReady } = useAuth()
  const [hijos, setHijos] = useState<ScoutHijo[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // IMPORTANTE: Cache key incluye el ID del usuario para evitar mezcla de datos entre cuentas
  const cacheKey = user?.id ? `${baseCacheKey}-user-${user.id}` : baseCacheKey

  const fetchHijos = useCallback(async (retryCount: number = 0) => {
    console.log('🚀 [useFamiliaData] Iniciando fetchHijos...' + (retryCount > 0 ? ` (reintento ${retryCount})` : ''))
    console.log('🚀 [useFamiliaData] authLoading:', authLoading)
    console.log('🚀 [useFamiliaData] authReady:', authReady)
    console.log('🚀 [useFamiliaData] isAuthenticated:', isAuthenticated)
    console.log('🚀 [useFamiliaData] token:', token ? 'Existe (longitud: ' + token.length + ')' : 'NO existe')
    console.log('🚀 [useFamiliaData] user:', user)

    // Obtener token - preferir AuthContext, pero usar localStorage como fallback
    // Esto es necesario porque después del login, el AuthContext puede tardar en actualizarse
    let effectiveToken = token
    let effectiveUser = user

    // SIEMPRE intentar obtener del localStorage como fallback
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    console.log('🔍 [useFamiliaData] localStorage check:', {
      storedToken: storedToken ? `Existe (${storedToken.length} chars)` : 'NO existe',
      storedUser: storedUser ? `Existe (${storedUser.length} chars)` : 'NO existe'
    })

    if (!effectiveToken || !effectiveUser) {
      if (storedToken && storedUser) {
        try {
          effectiveToken = storedToken
          effectiveUser = JSON.parse(storedUser)
          console.log('🔄 [useFamiliaData] Usando datos de localStorage como fallback:', effectiveUser)
        } catch (e) {
          console.log('❌ [useFamiliaData] Error parseando usuario de localStorage:', e)
        }
      } else {
        console.log('⚠️ [useFamiliaData] localStorage vacío, no hay fallback disponible')
      }
    }

    // NO intentar cargar datos mientras la autenticación está cargando
    // (a menos que tengamos datos del localStorage)
    if (authLoading && !effectiveToken) {
      console.log('⏳ [useFamiliaData] Esperando a que AuthContext termine de cargar...')
      return
    }

    if (!effectiveToken || !effectiveUser) {
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

      // Obtener desde API usando authenticatedFetch (intercepta 401)
      const apiUrl = getApiUrl()
      console.log('🌐 [useFamiliaData] Haciendo peticion a:', `${apiUrl}/api/familia/hijos`)

      // Usamos authenticatedFetch para interceptar 401 automaticamente
      // Si hay 401, lanzara SessionExpiredError y notificara a AuthContext
      const response = await authenticatedFetch(`${apiUrl}/api/familia/hijos`, {
        headers: {
          'Authorization': `Bearer ${effectiveToken}`
        }
      })

      // IMPORTANTE: Retry con backoff para errores 403 que pueden ser temporales
      // (race condition despues del login donde el token aun no esta sincronizado)
      // NOTA: 401 ya es manejado por authenticatedFetch y lanza SessionExpiredError
      if (response.status === 403 && retryCount < 3) {
        console.log(`⏳ [useFamiliaData] 403 recibido, reintentando (${retryCount + 1}/3)...`)
        setLoading(false)
        // Backoff exponencial: 500ms, 1000ms, 1500ms
        await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)))
        return fetchHijos(retryCount + 1)
      }

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

      // IMPORTANTE: Si es error de sesion expirada, NO usar cache
      // El modal de sesion expirada se mostrara automaticamente via AuthContext
      if (err instanceof SessionExpiredError) {
        console.log('🔒 [useFamiliaData] Sesion expirada - NO usar cache, limpiando datos')
        // Limpiar cache para este usuario
        localStorage.removeItem(cacheKey)
        localStorage.removeItem(`${cacheKey}-timestamp`)
        // NO establecer error ni hijos - el modal de sesion expirada se encargara
        setHijos(null)
        setError(null)
        return // Salir sin hacer nada mas
      }

      // Para otros errores, intentar usar datos del cache aunque sea viejo
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setHijos(JSON.parse(cached))
        setError('Usando datos guardados localmente')
      } else {
        // Si no hay cache y hay error, mostrar array vacio
        // NO usar datos mock - los hijos reales se vincularan despues
        setError('No se pudieron cargar los datos de tus hijos')
        setHijos([])
      }
    } finally {
      setLoading(false)
    }
  }, [authLoading, authReady, isAuthenticated, token, user, cacheKey, refetchInterval])

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

  // Secciones únicas de los hijos (para filtrar calendario)
  // Usamos serialización para evitar que la referencia cambie innecesariamente
  // cuando el contenido es el mismo - esto previene re-renders en useEffect
  const seccionesHijosKey = useMemo(() => {
    if (!hijos || hijos.length === 0) return ''
    return [...new Set(hijos.map(h => h.seccion_id).filter(Boolean))].sort((a, b) => a - b).join(',')
  }, [hijos])

  const seccionesHijos = useMemo(() => {
    if (!seccionesHijosKey) return []
    return seccionesHijosKey.split(',').map(Number)
  }, [seccionesHijosKey])

  // Referencia para trackear el usuario anterior y evitar cargas duplicadas
  const prevUserIdRef = useRef<number | null>(null)
  const loadingRef = useRef(false)

  // Efecto principal: manejar cambios de usuario y carga de datos
  // IMPORTANTE: Esperamos a que authReady sea true para evitar race conditions post-login
  useEffect(() => {
    const currentUserId = user?.id || null

    // Si el usuario cambió (de uno a otro diferente), limpiar datos anteriores
    if (prevUserIdRef.current !== null && prevUserIdRef.current !== currentUserId) {
      console.log('🔄 [useFamiliaData] Usuario cambió de', prevUserIdRef.current, 'a', currentUserId, '- limpiando datos')
      setHijos(null)
      setError(null)
    }

    prevUserIdRef.current = currentUserId

    // IMPORTANTE: No cargar hasta que authReady sea true
    // Esto evita la race condition después del login
    if (!authReady) {
      console.log('⏳ [useFamiliaData] Esperando authReady...')
      return
    }

    // Si hay usuario autenticado y no estamos cargando, cargar datos
    if (!authLoading && isAuthenticated && token && user && !loadingRef.current) {
      console.log('✅ [useFamiliaData] authReady: true, cargando hijos para:', user.id)
      loadingRef.current = true
      fetchHijos().finally(() => {
        loadingRef.current = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, authLoading, isAuthenticated, token, user?.id])

  // Efecto para detectar login desde localStorage (cuando AuthContext tarda en actualizarse)
  // NOTA: Este efecto es un fallback por si el efecto principal no detecta el login
  useEffect(() => {
    // Solo ejecutar si authReady es true, no tenemos datos y no estamos cargando
    // (si authReady es true y el efecto principal no cargó, este es el fallback)
    if (!authReady || hijos !== null || loading || loadingRef.current) return

    const checkLocalStorage = () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          if (parsedUser?.id && parsedUser?.expiresAt) {
            // Verificar que la sesión no ha expirado
            const now = new Date().getTime()
            const expiresAt = new Date(parsedUser.expiresAt).getTime()
            if (now < expiresAt) {
              console.log('🔄 [useFamiliaData] Fallback: Detectado login en localStorage, forzando carga para usuario:', parsedUser.id)
              loadingRef.current = true
              fetchHijos().finally(() => {
                loadingRef.current = false
              })
              return true
            }
          }
        } catch {
          // Ignorar errores
        }
      }
      return false
    }

    // Verificar inmediatamente
    if (checkLocalStorage()) return

    // Reintentar cada 300ms durante 2 segundos (útil justo después del login)
    let attempts = 0
    const maxAttempts = 7
    const intervalId = setInterval(() => {
      attempts++
      if (checkLocalStorage() || attempts >= maxAttempts) {
        clearInterval(intervalId)
      }
    }, 300)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, hijos, loading])

  // Auto-refetch
  useEffect(() => {
    if (!autoRefetch || !isAuthenticated) return

    const interval = setInterval(() => {
      fetchHijos()
    }, refetchInterval)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefetch, refetchInterval, isAuthenticated])

  return {
    hijos,
    loading,
    error,
    seccionesHijos,
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