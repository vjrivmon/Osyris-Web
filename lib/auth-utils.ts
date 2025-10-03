/**
 * Unified authentication utilities for the Osyris Scout Management System
 * Handles token storage and retrieval consistently across the application
 */

export interface UserData {
  id: number
  nombre: string
  apellidos: string
  email: string
  rol: string
  activo: boolean
  token?: string
  lastLogin?: string
}

/**
 * Get authentication token from localStorage
 * Checks multiple locations for backward compatibility
 */
export const getAuthToken = (): string | null => {
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
  return user?.rol === 'admin'
}

/**
 * Store authentication data
 */
export const setAuthData = (token: string, userData: Omit<UserData, 'token'>) => {
  // Store token separately for easy access
  localStorage.setItem('token', token)

  // Store user data with token included for completeness
  const completeUserData = {
    ...userData,
    token,
    lastLogin: new Date().toISOString()
  }
  localStorage.setItem('osyris_user', JSON.stringify(completeUserData))

  // Store role separately for quick access
  localStorage.setItem('userRole', userData.rol)
}

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('osyris_user')
  localStorage.removeItem('userRole')
  localStorage.removeItem('osyris_token') // Clear legacy token too
}

/**
 * IP del servidor de producción (fallback)
 */
const PRODUCTION_SERVER_IP = '116.203.98.142'
const API_URL_CACHE_KEY = 'osyris_api_url_cache'

/**
 * Intenta hacer una petición HEAD a una URL para verificar si está disponible
 */
const testApiConnection = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos timeout

    const response = await fetch(`${url}/api/health`, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    })

    clearTimeout(timeoutId)
    return response.ok || response.status === 404 // 404 es OK, significa que el servidor responde
  } catch (error) {
    console.warn(`Failed to connect to ${url}:`, error)
    return false
  }
}

/**
 * Get API URL based on environment with automatic fallback
 */
export const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    // En localhost, usar puerto 5000 directo
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000'
    }

    // Si estamos usando la IP directamente, usar proxy nginx
    if (window.location.hostname === PRODUCTION_SERVER_IP) {
      return `${window.location.protocol}//${window.location.host}`
    }

    // Intentar usar URL cacheada si existe
    const cachedUrl = localStorage.getItem(API_URL_CACHE_KEY)
    if (cachedUrl) {
      return cachedUrl
    }

    // Por defecto, usar el host actual
    return `${window.location.protocol}//${window.location.host}`
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
}

/**
 * Get API URL with automatic fallback to production server IP
 * Esta función intenta primero con el dominio actual, y si falla, usa la IP del servidor
 */
export const getApiUrlWithFallback = async (): Promise<string> => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  }

  // En localhost, siempre usar puerto 5000
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000'
  }

  // Si ya estamos en la IP del servidor, usarla directamente
  if (window.location.hostname === PRODUCTION_SERVER_IP) {
    const ipUrl = `${window.location.protocol}//${window.location.host}`
    localStorage.setItem(API_URL_CACHE_KEY, ipUrl)
    return ipUrl
  }

  // Intentar con la URL actual primero
  const currentUrl = `${window.location.protocol}//${window.location.host}`
  console.log('🔍 Intentando conectar con:', currentUrl)

  const currentWorks = await testApiConnection(currentUrl)
  if (currentWorks) {
    console.log('✅ Conexión exitosa con:', currentUrl)
    localStorage.setItem(API_URL_CACHE_KEY, currentUrl)
    return currentUrl
  }

  // Si falla, intentar con la IP del servidor como fallback
  const fallbackUrl = `http://${PRODUCTION_SERVER_IP}`
  console.log('⚠️ Fallback a IP del servidor:', fallbackUrl)

  const fallbackWorks = await testApiConnection(fallbackUrl)
  if (fallbackWorks) {
    console.log('✅ Conexión exitosa con fallback:', fallbackUrl)
    localStorage.setItem(API_URL_CACHE_KEY, fallbackUrl)
    return fallbackUrl
  }

  // Si todo falla, usar la URL actual como último recurso
  console.error('❌ No se pudo conectar a ninguna URL, usando URL actual')
  return currentUrl
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