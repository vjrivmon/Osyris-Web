'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { clearAuthData, isSessionExpired } from '@/lib/auth-utils'
import { getApiUrl } from '@/lib/api-utils'

interface User {
  id: number
  nombre: string
  apellidos: string
  email: string
  rol: 'admin' | 'editor' | 'coordinador' | 'scouter' | 'padre' | 'educando'
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
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Verificar el token con el servidor usando la URL dinámica del API
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch((error) => {
        console.error('❌ Failed to connect to auth server:', error)
        console.log('📡 API URL used for verify:', apiUrl)
        // Si el servidor no responde, limpiar sesión para forzar login
        clearAuthData()
        throw error
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          token,
          isAuthenticated: true,
          isLoading: false
        })
      } else {
        // Token inválido o servidor rechazó la sesión
        console.warn('⚠️ Invalid token or unauthorized, clearing session')
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

        localStorage.setItem('token', token)
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
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
