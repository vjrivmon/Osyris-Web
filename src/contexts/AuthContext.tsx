'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { clearAuthData, isSessionExpired, setAuthData } from '@/lib/auth-utils'
import { getApiUrl } from '@/lib/api-utils'

// Configuración de sesión
const SESSION_DURATION_HOURS = 24
const SESSION_DURATION_MS = SESSION_DURATION_HOURS * 60 * 60 * 1000

interface User {
  id: number
  nombre: string
  apellidos: string
  email: string
  rol: 'admin' | 'editor' | 'coordinador' | 'scouter' | 'familia' | 'educando'
  seccion_id?: number
  seccion_nombre?: string
  activo: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  authReady: boolean  // Indica que la autenticación está completamente sincronizada
  sessionExpired: boolean  // Indica que la sesión ha expirado
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
  waitForAuthReady: () => Promise<void>  // Espera hasta que authReady sea true
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    authReady: false,  // Se pone true cuando la autenticación está completamente sincronizada
    sessionExpired: false  // Se pone true cuando la sesión ha expirado
  })

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

      // Si no hay token o usuario válido, no hay sesión
      if (!isValidToken || !isValidUserStr) {
        console.log('❌ [AuthContext] No hay token o usuario válido en localStorage')
        clearAuthData() // Limpiar cualquier dato residual o corrupto
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          authReady: true,  // Auth está listo aunque no haya sesión
          sessionExpired: false
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
            console.log('🔒 [AuthContext] Sesión expirada, limpiando datos...')
            clearAuthData()
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              authReady: true,
              sessionExpired: true  // Marcar que la sesión expiró
            })
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

        console.log('✅ [AuthContext] Usuario cargado:', { id: user.id, email: user.email, rol: user.rol })

        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          authReady: true,  // Auth completamente sincronizado
          sessionExpired: false
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
          sessionExpired: false
        })
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      // En caso de error, limpiar sesión para seguridad
      clearAuthData()
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authReady: true,
        sessionExpired: false
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

        console.log(`✅ [AuthContext] Login exitoso: ${usuario.email} (${usuario.rol})`)
        console.log(`✅ [AuthContext] Sesión expira: ${expiresAt.toLocaleString()}`)

        // Actualizar estado con authReady: false primero
        setAuthState({
          user: userWithSession,
          token,
          isAuthenticated: true,
          isLoading: false,
          authReady: false,  // Aún no está listo, esperamos propagación
          sessionExpired: false
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

  const logout = () => {
    console.log('👋 Logging out, clearing all auth data')
    clearAuthData()
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      authReady: true,  // Auth está listo aunque no haya sesión
      sessionExpired: false
    })
  }

  const refreshUser = async () => {
    await checkAuthStatus()
  }

  // Función que espera hasta que authReady sea true
  const waitForAuthReady = (): Promise<void> => {
    return new Promise((resolve) => {
      // Si ya está listo, resolver inmediatamente
      if (authState.authReady) {
        resolve()
        return
      }

      // Si no, verificar periódicamente
      const checkInterval = setInterval(() => {
        // Re-leer el estado actual desde localStorage como fallback
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            if (user.expiresAt) {
              // Hay sesión válida, podemos resolver
              clearInterval(checkInterval)
              console.log('✅ [waitForAuthReady] Sesión detectada, resolviendo...')
              resolve()
              return
            }
          } catch {
            // Ignorar errores de parsing
          }
        }
      }, 50)

      // Timeout después de 2 segundos para evitar espera infinita
      setTimeout(() => {
        clearInterval(checkInterval)
        console.log('⚠️ [waitForAuthReady] Timeout alcanzado, resolviendo de todas formas')
        resolve()
      }, 2000)
    })
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshUser,
        waitForAuthReady
      }}
    >
      {children}
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
    // Durante el build estático o SSR sin AuthProvider, retornar valores seguros
    if (typeof window === 'undefined') {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authReady: false,
        sessionExpired: false,
        login: async () => false,
        logout: () => {},
        refreshUser: async () => {},
        waitForAuthReady: async () => {}
      }
    }
    throw error
  }
}

export { AuthContext }
