'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { clearAuthData, isSessionExpired } from '@/lib/auth-utils'
import { getApiUrl } from '@/lib/api-utils'

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

      // Primero verificar si la sesión ha expirado
      if (isSessionExpired()) {
        console.log('🔒 Session expired or invalid, clearing auth data')
        clearAuthData()
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        return
      }

      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      console.log('🔍 [AuthContext] Verificando sesión...')
      console.log('🔍 [AuthContext] Token:', token ? 'Existe' : 'NO existe')
      console.log('🔍 [AuthContext] User:', userStr ? 'Existe' : 'NO existe')

      if (!token || !userStr) {
        console.log('❌ [AuthContext] No hay token o usuario en localStorage')
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return
      }

      try {
        const user = JSON.parse(userStr)
        console.log('✅ [AuthContext] Usuario cargado desde localStorage:', user)

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

        // Guardar TANTO el token COMO el usuario en localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(usuario))

        console.log('✅ [AuthContext] Usuario y token guardados en localStorage:', usuario)

        setAuthState({
          user: usuario,
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
