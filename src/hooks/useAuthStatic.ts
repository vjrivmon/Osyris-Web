'use client'

import { useState, useEffect } from 'react'
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

/**
 * Hook de autenticación seguro para build estático.
 * No usa useContext para evitar errores durante SSR.
 *
 * Importante: Este hook solo devuelve estado no autenticado durante SSR.
 * En el cliente, intentará cargar useAuth dinámicamente.
 */
export function useAuthStatic(): AuthContextType {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: typeof window !== 'undefined'
  })

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      // Cargar autenticación desde localStorage
      // IMPORTANTE: Usar las mismas claves que setAuthData() y AuthContext
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('osyris_user')

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
        } catch {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
      }
    }
  }, [])

  // Funciones simplificadas para el modo estático
  const login = async (email: string, password: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false

    // Login dinámico usando getApiUrl() para producción/desarrollo
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        // Usar las mismas claves que setAuthData() y AuthContext
        localStorage.setItem('token', data.token)
        localStorage.setItem('osyris_user', JSON.stringify(data.user))
        localStorage.setItem('user', JSON.stringify(data.user))

        setAuthState({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false
        })
        return true
      }
    } catch {
      // Error en la llamada API
    }

    return false
  }

  const logout = () => {
    if (typeof window === 'undefined') return

    // Limpiar localStorage usando las claves correctas
    localStorage.removeItem('token')
    localStorage.removeItem('osyris_user')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')

    // Actualizar estado local
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    })
  }

  const refreshUser = async () => {
    if (typeof window === 'undefined') return

    // Usar las claves correctas
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${getApiUrl()}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const responseData = await response.json()
        // La API devuelve { success, data: { usuario, tokenInfo } }
        const user = responseData.data?.usuario

        // Solo guardar si tenemos datos de usuario validos
        if (user && user.id) {
          localStorage.setItem('osyris_user', JSON.stringify(user))
          localStorage.setItem('user', JSON.stringify(user))

          setAuthState(prev => ({
            ...prev,
            user: user,
            isAuthenticated: true,
            isLoading: false
          }))
        }
        // Si no hay usuario, no hacemos nada (mantener datos existentes)
      } else {
        logout()
      }
    } catch {
      logout()
    }
  }

  return {
    ...authState,
    login,
    logout,
    refreshUser
  }
}