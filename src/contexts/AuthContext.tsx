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
  activo: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Verificar si estamos en el servidor
      if (typeof window === 'undefined') {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return
      }

      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      console.log('🔍 [AuthContext] Verificando sesión...')

      // Si no hay token o usuario, no hay sesión
      if (!token || !userStr) {
        console.log('❌ [AuthContext] No hay token o usuario en localStorage')
        clearAuthData() // Limpiar cualquier dato residual
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
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
              isLoading: false
            })
            return
          }

          console.log(`✅ [AuthContext] Sesión válida hasta: ${new Date(user.expiresAt).toLocaleString()}`)
        } else {
          // Sesión antigua sin expiración - limpiar por seguridad
          console.log('⚠️ [AuthContext] Sesión sin fecha de expiración, limpiando...')
          clearAuthData()
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
          return
        }

        console.log('✅ [AuthContext] Usuario cargado:', { id: user.id, email: user.email, rol: user.rol })

        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        })
      } catch (parseError) {
        console.error('❌ [AuthContext] Error parseando usuario de localStorage:', parseError)
        clearAuthData()
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
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
        isLoading: false
      })
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // IMPORTANTE: Limpiar cualquier sesión anterior antes de iniciar nueva
      clearAuthData()

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

        setAuthState({
          user: userWithSession,
          token,
          isAuthenticated: true,
          isLoading: false
        })

        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
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
      isLoading: false
    })
  }

  const refreshUser = async () => {
    await checkAuthStatus()
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshUser
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
        login: async () => false,
        logout: () => {},
        refreshUser: async () => {}
      }
    }
    throw error
  }
}

export { AuthContext }
