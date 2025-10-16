/**
 * Unified authentication utilities for the Osyris Scout Management System
 * Handles token storage and retrieval consistently across the application
 */

import { getApiUrl as getCentralApiUrl, apiEndpoint } from './api-utils'

export interface UserData {
  id: number
  nombre: string
  apellidos: string
  email: string
  rol: string
  activo: boolean
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

    // Si no hay expiresAt, la sesión es inválida (sesión antigua sin expiración)
    if (!user.expiresAt) {
      console.warn('⚠️ Session without expiration date, clearing...')
      return true
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
  return user?.rol === 'admin'
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

  // Store role separately for quick access
  localStorage.setItem('userRole', userData.rol)

  console.log(`✅ Session stored, expires at: ${expiresAt.toLocaleString()}`)
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