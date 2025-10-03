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
 * Get API URL based on environment
 */
export const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    // En localhost, usar puerto 5000 directo
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000'
    }
    // En producción, usar ruta relativa /api que nginx proxea al backend
    // Esto funciona tanto con IP como con dominio
    return `${window.location.protocol}//${window.location.host}`
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
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