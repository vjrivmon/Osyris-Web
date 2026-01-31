'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  clearAuthData,
  isSessionExpired,
  setAuthData,
  registerLogoutCallback,
  unregisterLogoutCallback,
  type SessionExpiredReason
} from '@/lib/auth-utils'
import { getApiUrl } from '@/lib/api-utils'
import { useInactivityTimer } from '@/hooks/useInactivityTimer'
import { SessionExpiredModal } from '@/components/auth/session-expired-modal'
import { InactivityWarningModal } from '@/components/auth/inactivity-warning-modal'

// Configuracion de sesion
const SESSION_DURATION_HOURS = 24
const SESSION_DURATION_MS = SESSION_DURATION_HOURS * 60 * 60 * 1000

interface User {
  id: number
  nombre: string
  apellidos: string
  email: string
  rol: 'admin' | 'editor' | 'coordinador' | 'scouter' | 'familia' | 'educando' | 'comite'
  roles?: string[]
  seccion_id?: number
  seccion_nombre?: string
  activo: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  authReady: boolean  // Indica que la autenticacion esta completamente sincronizada
  sessionExpired: boolean  // Indica que la sesion ha expirado
  sessionExpiredReason: SessionExpiredReason | null  // Razon de la expiracion
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  logoutWithReason: (reason: SessionExpiredReason) => void
  refreshUser: () => Promise<void>
  waitForAuthReady: () => Promise<void>  // Espera hasta que authReady sea true
  activeRole: string
  availableRoles: string[]
  switchRole: (role: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    authReady: false,  // Se pone true cuando la autenticacion esta completamente sincronizada
    sessionExpired: false,  // Se pone true cuando la sesion ha expirado
    sessionExpiredReason: null  // Razon de la expiracion
  })

  // Estados para modales
  const [showExpiredModal, setShowExpiredModal] = useState(false)
  const [expiredModalReason, setExpiredModalReason] = useState<SessionExpiredReason>('token_invalid')

  // Multi-role state
  const [activeRole, setActiveRole] = useState<string>('')
  const [availableRoles, setAvailableRoles] = useState<string[]>([])

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Verificar si estamos en el servidor
      if (typeof window === 'undefined') {
        setAuthState(prev => ({ ...prev, isLoading: false, authReady: true, sessionExpired: false }))
        return
      }

      const token = localStorage.getItem('token')
      // Intentar leer de ambas claves por compatibilidad
      let userStr = localStorage.getItem('user')
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        userStr = localStorage.getItem('osyris_user')
      }

      console.log('🔍 [AuthContext] Verificando sesión...')

      // Validar que los datos no estén corruptos
      // A veces localStorage puede tener valores como "undefined" o "null" como strings
      const isValidToken = token && token !== 'undefined' && token !== 'null'
      const isValidUserStr = userStr && userStr !== 'undefined' && userStr !== 'null' && userStr.startsWith('{')

      // Si no hay token o usuario valido, no hay sesion
      if (!isValidToken || !isValidUserStr) {
        console.log('❌ [AuthContext] No hay token o usuario valido en localStorage')
        clearAuthData() // Limpiar cualquier dato residual o corrupto
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          authReady: true,  // Auth esta listo aunque no haya sesion
          sessionExpired: false,
          sessionExpiredReason: null
        })
        return
      }

      try {
        const user = JSON.parse(userStr)

        // Verificar si la sesión ha expirado
        if (user.expiresAt) {
          const now = new Date().getTime()
          const expiresAt = new Date(user.expiresAt).getTime()

          if (now > expiresAt) {
            console.log('🔒 [AuthContext] Sesion expirada, limpiando datos...')
            clearAuthData()
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              authReady: true,
              sessionExpired: true,  // Marcar que la sesion expiro
              sessionExpiredReason: 'token_expired'
            })
            // Mostrar modal de sesion expirada
            setExpiredModalReason('token_expired')
            setShowExpiredModal(true)
            return
          }

          console.log(`✅ [AuthContext] Sesión válida hasta: ${new Date(user.expiresAt).toLocaleString()}`)
        } else {
          // Sesión antigua sin expiración - añadir expiración por defecto en lugar de limpiar
          console.log('⚠️ [AuthContext] Sesión sin fecha de expiración, añadiendo expiración por defecto...')
          const now = new Date()
          const newExpiresAt = new Date(now.getTime() + SESSION_DURATION_MS)
          user.expiresAt = newExpiresAt.toISOString()
          user.lastLogin = user.lastLogin || now.toISOString()

          // Actualizar localStorage con la nueva expiración
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('osyris_user', JSON.stringify(user))

          console.log(`✅ [AuthContext] Sesión actualizada, expira: ${newExpiresAt.toLocaleString()}`)
        }

        console.log('✅ [AuthContext] Usuario cargado:', { id: user.id, email: user.email, rol: user.rol, roles: user.roles })

        // Restore multi-role state
        const userRoles = user.roles || [user.rol]
        setAvailableRoles(userRoles)
        const savedActiveRole = localStorage.getItem('activeRole')
        if (savedActiveRole && userRoles.includes(savedActiveRole)) {
          setActiveRole(savedActiveRole)
        } else {
          setActiveRole(userRoles.includes('familia') ? 'familia' : userRoles[0] || user.rol)
        }

        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          authReady: true,  // Auth completamente sincronizado
          sessionExpired: false,
          sessionExpiredReason: null
        })
      } catch (parseError) {
        console.error('❌ [AuthContext] Error parseando usuario de localStorage:', parseError)
        clearAuthData()
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          authReady: true,
          sessionExpired: false,
          sessionExpiredReason: null
        })
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      // En caso de error, limpiar sesion para seguridad
      clearAuthData()
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authReady: true,
        sessionExpired: false,
        sessionExpiredReason: null
      })
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // IMPORTANTE: Limpiar cualquier sesión anterior antes de iniciar nueva
      clearAuthData()

      // Marcar authReady como false durante el proceso de login
      setAuthState(prev => ({ ...prev, authReady: false, sessionExpired: false }))

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        const { token, usuario } = data

        // Calcular fecha de expiración
        const now = new Date()
        const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS)

        // Crear objeto de usuario con metadatos de sesión
        const userWithSession = {
          ...usuario,
          token,
          lastLogin: now.toISOString(),
          expiresAt: expiresAt.toISOString()
        }

        // Guardar token y usuario con expiración
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userWithSession))
        localStorage.setItem('osyris_user', JSON.stringify(userWithSession)) // Para compatibilidad
        localStorage.setItem('userRole', usuario.rol)

        // Set multi-role state
        const userRoles: string[] = usuario.roles || [usuario.rol]
        setAvailableRoles(userRoles)
        const defaultRole = userRoles.includes('familia') ? 'familia' : userRoles[0] || usuario.rol
        setActiveRole(defaultRole)
        localStorage.setItem('activeRole', defaultRole)

        console.log(`✅ [AuthContext] Login exitoso: ${usuario.email} roles: ${userRoles.join(',')} activeRole: ${defaultRole}`)
        console.log(`✅ [AuthContext] Sesión expira: ${expiresAt.toLocaleString()}`)

        // Actualizar estado con authReady: false primero
        setAuthState({
          user: userWithSession,
          token,
          isAuthenticated: true,
          isLoading: false,
          authReady: false,  // Aun no esta listo, esperamos propagacion
          sessionExpired: false,
          sessionExpiredReason: null
        })

        // Usar un pequeño delay para asegurar que el estado se propague
        // antes de marcar authReady como true
        await new Promise(resolve => setTimeout(resolve, 50))

        // Ahora marcar authReady como true
        setAuthState(prev => ({ ...prev, authReady: true }))
        console.log('✅ [AuthContext] authReady: true - Estado sincronizado')

        return true
      } else {
        // En caso de error de login, marcar authReady como true para desbloquear UI
        setAuthState(prev => ({ ...prev, authReady: true }))
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      // En caso de error, marcar authReady como true para desbloquear UI
      setAuthState(prev => ({ ...prev, authReady: true }))
      return false
    }
  }

  /**
   * Logout con razon especifica - muestra modal apropiado
   */
  const logoutWithReason = useCallback((reason: SessionExpiredReason) => {
    console.log(`👋 [AuthContext] Logout con razon: ${reason}`)
    clearAuthData()

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      authReady: true,
      sessionExpired: true,
      sessionExpiredReason: reason
    })

    // Mostrar modal solo si no es logout manual
    if (reason !== 'manual') {
      setExpiredModalReason(reason)
      setShowExpiredModal(true)
    }
  }, [])

  /**
   * Logout estandar (manual por el usuario)
   */
  const logout = useCallback(() => {
    console.log('👋 [AuthContext] Logging out, clearing all auth data')
    clearAuthData()
    localStorage.removeItem('activeRole')
    setActiveRole('')
    setAvailableRoles([])
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      authReady: true,
      sessionExpired: false,
      sessionExpiredReason: null
    })
    setShowExpiredModal(false)
  }, [])

  const refreshUser = async () => {
    await checkAuthStatus()
  }

  // Funcion que espera hasta que authReady sea true
  const waitForAuthReady = (): Promise<void> => {
    return new Promise((resolve) => {
      // Si ya esta listo, resolver inmediatamente
      if (authState.authReady) {
        resolve()
        return
      }

      // Si no, verificar periodicamente
      const checkInterval = setInterval(() => {
        // Re-leer el estado actual desde localStorage como fallback
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            if (user.expiresAt) {
              // Hay sesion valida, podemos resolver
              clearInterval(checkInterval)
              console.log('✅ [waitForAuthReady] Sesion detectada, resolviendo...')
              resolve()
              return
            }
          } catch {
            // Ignorar errores de parsing
          }
        }
      }, 50)

      // Timeout despues de 2 segundos para evitar espera infinita
      setTimeout(() => {
        clearInterval(checkInterval)
        console.log('⚠️ [waitForAuthReady] Timeout alcanzado, resolviendo de todas formas')
        resolve()
      }, 2000)
    })
  }

  // ============================================================================
  // MULTI-ROLE - Cambiar rol activo
  // ============================================================================

  const switchRole = useCallback((role: string) => {
    if (availableRoles.includes(role)) {
      setActiveRole(role)
      localStorage.setItem('activeRole', role)
      console.log(`🔄 [AuthContext] Rol activo cambiado a: ${role}`)
    }
  }, [availableRoles])

  // ============================================================================
  // INACTIVITY TIMER - Cierre automatico por inactividad
  // ============================================================================

  // Callback cuando expira por inactividad
  const handleInactivityExpire = useCallback(() => {
    console.log('⏰ [AuthContext] Sesion expirada por inactividad')
    logoutWithReason('inactivity')
  }, [logoutWithReason])

  // Hook de inactividad - solo activo cuando hay usuario autenticado
  const {
    secondsRemaining,
    showWarning: showInactivityWarning,
    resetTimer,
    isActive: inactivityTimerActive
  } = useInactivityTimer({
    onExpire: handleInactivityExpire,
    enabled: authState.isAuthenticated && authState.authReady
  })

  // ============================================================================
  // CALLBACK GLOBAL - Interceptor de 401 desde authenticatedFetch
  // ============================================================================

  // Registrar callback global para ser notificado de 401 desde cualquier fetch
  useEffect(() => {
    const handleGlobalLogout = (reason: SessionExpiredReason) => {
      console.log(`🔔 [AuthContext] Callback global de logout recibido: ${reason}`)
      logoutWithReason(reason)
    }

    registerLogoutCallback(handleGlobalLogout)

    return () => {
      unregisterLogoutCallback(handleGlobalLogout)
    }
  }, [logoutWithReason])

  // ============================================================================
  // HANDLERS PARA MODALES
  // ============================================================================

  // Handler para "Continuar conectado" en modal de advertencia
  const handleContinueSession = useCallback(() => {
    console.log('🔄 [AuthContext] Usuario eligio continuar conectado')
    resetTimer()
  }, [resetTimer])

  // Handler para cerrar modal de sesion expirada
  const handleCloseExpiredModal = useCallback(() => {
    setShowExpiredModal(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        logoutWithReason,
        refreshUser,
        waitForAuthReady,
        activeRole,
        availableRoles,
        switchRole
      }}
    >
      {children}

      {/* Modal de advertencia de inactividad */}
      <InactivityWarningModal
        isOpen={showInactivityWarning && authState.isAuthenticated}
        secondsRemaining={secondsRemaining}
        onContinue={handleContinueSession}
        onLogout={logout}
      />

      {/* Modal de sesion expirada */}
      <SessionExpiredModal
        isOpen={showExpiredModal}
        reason={expiredModalReason}
        onClose={handleCloseExpiredModal}
      />
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  try {
    const context = useContext(AuthContext)
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
  } catch (error) {
    // Durante el build estatico o SSR sin AuthProvider, retornar valores seguros
    if (typeof window === 'undefined') {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authReady: false,
        sessionExpired: false,
        sessionExpiredReason: null,
        login: async () => false,
        logout: () => {},
        logoutWithReason: () => {},
        refreshUser: async () => {},
        waitForAuthReady: async () => {},
        activeRole: '',
        availableRoles: [],
        switchRole: () => {}
      }
    }
    throw error
  }
}

export { AuthContext }
