/**
 * Development-only session management
 * Clears stale sessions when server restarts in development mode
 */

import { clearAuthData } from './auth-utils'

const DEV_SESSION_KEY = 'osyris_dev_session_id'

/**
 * Initialize development session management
 * This should be called once when the app loads
 */
export const initDevSessionManagement = () => {
  // Only run in browser
  if (typeof window === 'undefined') return

  // Only run if auto-clear is enabled
  const autoClear = process.env.NEXT_PUBLIC_AUTO_CLEAR_SESSION_ON_DEV === 'true'
  if (!autoClear) return

  // Only run in development
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev) return

  try {
    // Generate a unique session ID for this dev server instance
    const currentSessionId = Date.now().toString()
    const storedSessionId = localStorage.getItem(DEV_SESSION_KEY)

    if (!storedSessionId) {
      // First time running, just store the session ID
      localStorage.setItem(DEV_SESSION_KEY, currentSessionId)
      console.log('🔧 Dev session initialized:', currentSessionId)
    } else {
      // Check if this is a new dev server instance (different session ID)
      // In development, each server restart is a different "session"
      // We detect this by checking if the backend is responding
      checkBackendAndClearIfNeeded(storedSessionId, currentSessionId)
    }
  } catch (error) {
    console.error('Error in dev session management:', error)
  }
}

/**
 * Check if backend is responding and clear session if it's a fresh restart
 */
const checkBackendAndClearIfNeeded = async (storedSessionId: string, currentSessionId: string) => {
  try {
    // Try to verify the current session with backend
    const token = localStorage.getItem('token')
    if (!token) {
      // No token, update session ID
      localStorage.setItem(DEV_SESSION_KEY, currentSessionId)
      return
    }

    // Try to verify token with backend
    const response = await fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).catch(() => null)

    if (!response || !response.ok) {
      // Backend rejected the token or is not responding
      // This means either:
      // 1. Backend was restarted and DB was reset
      // 2. Token is invalid
      console.log('🔄 Backend unavailable or token invalid, clearing dev session')
      clearAuthData()
      localStorage.setItem(DEV_SESSION_KEY, currentSessionId)
    } else {
      // Backend is OK and token is valid
      console.log('✅ Dev session valid, keeping it')
    }
  } catch (error) {
    console.error('Error checking backend:', error)
    // On error, clear session to be safe
    clearAuthData()
    localStorage.setItem(DEV_SESSION_KEY, currentSessionId)
  }
}

/**
 * Force clear development session
 * Useful for testing or manual cleanup
 */
export const forceClearDevSession = () => {
  if (typeof window === 'undefined') return

  console.log('🧹 Force clearing dev session')
  clearAuthData()
  localStorage.removeItem(DEV_SESSION_KEY)
}
