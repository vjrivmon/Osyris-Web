/**
 * Unified authentication utilities for the Osyris Scout Management System
 * Handles token storage and retrieval consistently across the application
 */

import { getApiUrl as getCentralApiUrl, apiEndpoint } from './api-utils'

// ============================================================================
// SESIÓN EXPIRADA - Error personalizado y sistema de callbacks globales
// ============================================================================

/**
 * Razones por las que una sesión puede expirar
 */
export type SessionExpiredReason = 'inactivity' | 'token_expired' | 'token_invalid' | 'manual'

/**
 * Error personalizado para indicar que la sesión ha expirado
 * Permite distinguir un 401 de otros errores HTTP
 */
export class SessionExpiredError extends Error {
  public readonly reason: SessionExpiredReason
  public readonly statusCode: number

  constructor(reason: SessionExpiredReason = 'token_invalid', statusCode: number = 401) {
    const messages: Record<SessionExpiredReason, string> = {
      inactivity: 'Tu sesión se cerró por inactividad',
      token_expired: 'Tu sesión ha expirado',
      token_invalid: 'Tu sesión no es válida',
      manual: 'Sesión cerrada'
    }
    super(messages[reason])
    this.name = 'SessionExpiredError'
    this.reason = reason
    this.statusCode = statusCode
  }
}

/**
 * Tipo para el callback de logout global
 */
type LogoutCallback = (reason: SessionExpiredReason) => void

/**
 * Callbacks registrados para ser notificados cuando ocurre un 401
 * Permite que AuthContext se registre y maneje el logout centralizadamente
 */
let globalLogoutCallbacks: LogoutCallback[] = []

/**
 * Registra un callback que será llamado cuando se detecte un 401
 * Usado por AuthContext para manejar el logout de forma centralizada
 */
export const registerLogoutCallback = (callback: LogoutCallback): void => {
  if (!globalLogoutCallbacks.includes(callback)) {
    globalLogoutCallbacks.push(callback)
    console.log('🔐 [auth-utils] Callback de logout registrado')
  }
}

/**
 * Elimina un callback de logout previamente registrado
 */
export const unregisterLogoutCallback = (callback: LogoutCallback): void => {
  globalLogoutCallbacks = globalLogoutCallbacks.filter(cb => cb !== callback)
  console.log('🔐 [auth-utils] Callback de logout desregistrado')
}

/**
 * Notifica a todos los callbacks registrados que la sesión expiró
 */
const notifyLogoutCallbacks = (reason: SessionExpiredReason): void => {
  console.log(`🔔 [auth-utils] Notificando ${globalLogoutCallbacks.length} callbacks de logout, razón: ${reason}`)
  globalLogoutCallbacks.forEach(callback => {
    try {
      callback(reason)
    } catch (err) {
      console.error('[auth-utils] Error en callback de logout:', err)
    }
  })
}

export interface UserData {
  id: number
  nombre: string
  apellidos: string
  email: string
  rol: string
  roles?: string[]
  activo: boolean
  seccion_id?: number | null
  token?: string
  lastLogin?: string
  expiresAt?: string
}

// Configuración de expiración de sesión
const SESSION_DURATION_HOURS = 24 // Sesión expira después de 24 horas
const SESSION_DURATION_MS = SESSION_DURATION_HOURS * 60 * 60 * 1000

/**
 * Check if session has expired
 */
export const isSessionExpired = (): boolean => {
  const userStr = localStorage.getItem('osyris_user')
  if (!userStr) return true

  try {
    const user: UserData = JSON.parse(userStr)

    // Si no hay expiresAt, añadir expiración por defecto (no invalidar sesión)
    if (!user.expiresAt) {
      console.warn('⚠️ Session without expiration date, adding default expiration...')
      const now = new Date()
      const newExpiresAt = new Date(now.getTime() + SESSION_DURATION_MS)
      user.expiresAt = newExpiresAt.toISOString()
      user.lastLogin = user.lastLogin || now.toISOString()

      // Actualizar localStorage con la nueva expiración
      localStorage.setItem('osyris_user', JSON.stringify(user))
      localStorage.setItem('user', JSON.stringify(user))

      console.log(`✅ Session updated, expires at: ${newExpiresAt.toLocaleString()}`)
      return false // La sesión es válida después de añadir expiración
    }

    const now = new Date().getTime()
    const expiresAt = new Date(user.expiresAt).getTime()

    if (now > expiresAt) {
      console.warn('⚠️ Session expired, clearing...')
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking session expiration:', error)
    return true
  }
}

/**
 * Get authentication token from localStorage
 * Checks multiple locations for backward compatibility and validates expiration
 */
export const getAuthToken = (): string | null => {
  // Check if session has expired
  if (isSessionExpired()) {
    clearAuthData()
    return null
  }

  // First try direct token storage (new method)
  const directToken = localStorage.getItem('token')
  if (directToken) {
    return directToken
  }

  // Then try from user data (fallback for existing sessions)
  const userStr = localStorage.getItem('osyris_user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      if (user.token) {
        return user.token
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
  }

  // Check for legacy token storage
  const legacyToken = localStorage.getItem('osyris_token')
  if (legacyToken) {
    return legacyToken
  }

  return null
}

/**
 * Get current user data from localStorage
 */
export const getCurrentUser = (): UserData | null => {
  const userStr = localStorage.getItem('osyris_user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }
  return null
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  const user = getCurrentUser()
  return !!(token && user)
}

/**
 * Check if current user has admin role
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser()
  return user?.rol === 'superadmin'
}

/**
 * Store authentication data with expiration
 */
export const setAuthData = (token: string, userData: Omit<UserData, 'token' | 'lastLogin' | 'expiresAt'>) => {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS)

  // Store token separately for easy access
  localStorage.setItem('token', token)

  // Store user data with token, timestamp and expiration
  const completeUserData: UserData = {
    ...userData,
    token,
    lastLogin: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  }
  localStorage.setItem('osyris_user', JSON.stringify(completeUserData))

  // IMPORTANTE: También guardar en 'user' para compatibilidad con AuthContext
  localStorage.setItem('user', JSON.stringify(completeUserData))

  // Store role separately for quick access
  localStorage.setItem('userRole', userData.rol)

  console.log(`✅ Session stored, expires at: ${expiresAt.toLocaleString()}`)
}

/**
 * Clear all authentication data - COMPLETA limpieza de sesión
 * IMPORTANTE: Esta función limpia TODOS los datos cacheados para evitar
 * que el estado de un usuario persista cuando otro usuario inicia sesión
 */
export const clearAuthData = () => {
  console.log('🧹 [clearAuthData] Limpiando TODOS los datos de autenticación y cache...')

  // Limpiar localStorage - datos de autenticación
  localStorage.removeItem('token')
  localStorage.removeItem('osyris_user')
  localStorage.removeItem('user')
  localStorage.removeItem('userRole')
  localStorage.removeItem('osyris_token') // Legacy

  // Limpiar cualquier dato de familia/portal
  localStorage.removeItem('familia-data')
  localStorage.removeItem('familia-data-cache')
  localStorage.removeItem('familia-hijos-cache')

  // Limpiar caches de hooks (calendario, etc.)
  localStorage.removeItem('calendario-familia-data')
  localStorage.removeItem('calendario-familia-data-timestamp')

  // Limpiar sessionStorage también
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('osyris_user')
    sessionStorage.removeItem('selectedHijo')
  }

  // IMPORTANTE: Limpiar TODOS los caches que puedan contener datos de usuario
  // Esto incluye caches con patrones como:
  // - osyris_*
  // - familia_*
  // - familia-data-user-* (cache por usuario de useFamiliaData)
  // - calendario-*
  // - auth_*
  // - *-timestamp (timestamps de cache)
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.startsWith('osyris_') ||
      key.startsWith('familia_') ||
      key.startsWith('familia-data') ||
      key.startsWith('calendario-') ||
      key.startsWith('auth_') ||
      key.endsWith('-timestamp') ||
      key.includes('-user-') // Caches específicos de usuario
    )) {
      keysToRemove.push(key)
    }
  }

  console.log(`🧹 [clearAuthData] Eliminando ${keysToRemove.length} claves de cache:`, keysToRemove)
  keysToRemove.forEach(key => localStorage.removeItem(key))

  console.log('✅ [clearAuthData] Limpieza completada - todos los datos de sesión y cache eliminados')
}

/**
 * Get API URL based on environment with runtime detection
 * This now uses the centralized implementation from lib/api-utils.ts
 */
export const getApiUrl = (): string => {
  return getCentralApiUrl()
}

/**
 * IP del servidor de producción (for backward compatibility)
 * @deprecated Use getApiUrl() instead
 */
const PRODUCTION_SERVER_IP = '116.203.98.142'

/**
 * Get API URL with automatic fallback
 * @deprecated This function is kept for backward compatibility but now uses the centralized getApiUrl()
 */
export const getApiUrlWithFallback = async (): Promise<string> => {
  return getApiUrl()
}

/**
 * Make authenticated API request and return JSON
 */
export const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  const apiUrl = getApiUrl()

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Make authenticated API request and return raw Response (for cases where we need response headers, status codes, etc.)
 */
export const makeAuthenticatedRequestRaw = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  const apiUrl = getApiUrl()

  return fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
}

// ============================================================================
// AUTHENTICATED FETCH - Interceptor centralizado de 401
// ============================================================================

/**
 * Opciones para authenticatedFetch
 */
export interface AuthenticatedFetchOptions extends RequestInit {
  /** Si es true, no dispara el logout automático en 401 (útil para login) */
  skipAuthCheck?: boolean
  /** Si es true, añade automáticamente el header Authorization */
  addAuthHeader?: boolean
}

/**
 * Wrapper de fetch que intercepta respuestas 401 y dispara logout global
 *
 * Ventajas:
 * - Centraliza el manejo de 401 en un solo lugar
 * - Automáticamente notifica a AuthContext para mostrar modal
 * - Lanza SessionExpiredError para que el código que llama pueda manejarlo
 * - NO usa cache cuando hay error de autenticación
 *
 * @param url - URL completa o endpoint relativo
 * @param options - Opciones de fetch + opciones adicionales
 * @returns Response - La respuesta del servidor
 * @throws SessionExpiredError - Si el servidor devuelve 401
 */
export const authenticatedFetch = async (
  url: string,
  options: AuthenticatedFetchOptions = {}
): Promise<Response> => {
  const { skipAuthCheck = false, addAuthHeader = true, ...fetchOptions } = options

  // Construir headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers
  }

  // Añadir token de autorización si se solicita
  if (addAuthHeader) {
    const token = getAuthToken()
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  // Construir URL completa si es relativa
  const fullUrl = url.startsWith('http') ? url : `${getApiUrl()}${url}`

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers
    })

    // Interceptar 401 Unauthorized
    if (response.status === 401 && !skipAuthCheck) {
      console.warn('🔒 [authenticatedFetch] 401 recibido - sesión inválida o expirada')

      // Notificar a todos los listeners (AuthContext) que la sesión expiró
      notifyLogoutCallbacks('token_invalid')

      // Lanzar error específico para que el código que llama pueda manejarlo
      throw new SessionExpiredError('token_invalid', 401)
    }

    // 403 puede indicar token expirado en algunos backends
    if (response.status === 403 && !skipAuthCheck) {
      // Verificar si es realmente un problema de sesión o de permisos
      try {
        const clonedResponse = response.clone()
        const errorBody = await clonedResponse.json()

        // Si el mensaje indica expiración de token, tratar como 401
        if (errorBody.message?.toLowerCase().includes('expired') ||
            errorBody.message?.toLowerCase().includes('token') ||
            errorBody.error?.toLowerCase().includes('unauthorized')) {
          console.warn('🔒 [authenticatedFetch] 403 con mensaje de token - tratando como sesión expirada')
          notifyLogoutCallbacks('token_expired')
          throw new SessionExpiredError('token_expired', 403)
        }
      } catch (parseError) {
        // Si no podemos parsear el body, dejar que continúe como 403 normal
        if (parseError instanceof SessionExpiredError) {
          throw parseError
        }
      }
    }

    return response
  } catch (error) {
    // Re-lanzar SessionExpiredError sin modificar
    if (error instanceof SessionExpiredError) {
      throw error
    }

    // Para errores de red, verificar si podría ser problema de autenticación
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[authenticatedFetch] Error de red:', error)
    }

    throw error
  }
}

/**
 * Versión de authenticatedFetch que parsea JSON automáticamente
 * Útil para la mayoría de casos de uso
 */
export const authenticatedFetchJson = async <T = unknown>(
  url: string,
  options: AuthenticatedFetchOptions = {}
): Promise<T> => {
  const response = await authenticatedFetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  return response.json()
}