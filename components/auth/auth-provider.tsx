"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth-types"
import { secureStorage } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

// Credenciales de prueba
const TEST_CREDENTIALS = {
  "kraal@gsosyris.org": "password123",
  "comite@gsosyris.org": "password123",
  "familia@gsosyris.org": "password123",
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Valores iniciales seguros
const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  logout: () => {},
}

const AuthContext = createContext<AuthContextType>(initialState)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  // Cargar usuario desde almacenamiento al inicio
  useEffect(() => {
    try {
      const storedUser = secureStorage.get("user")
      if (storedUser) {
        setUser(storedUser)
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error("Error loading user from storage:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Función de login con credenciales de prueba
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulación simple para pruebas
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Verificar credenciales de prueba
        if (!TEST_CREDENTIALS[email] || TEST_CREDENTIALS[email] !== password) {
          throw new Error(
            "Credenciales incorrectas. Usa kraal@gsosyris.org, comite@gsosyris.org o familia@gsosyris.org con contraseña 'password123'",
          )
        }

        // Crear un usuario según el email
        const role = email.includes("kraal") ? "kraal" : email.includes("comite") ? "comite" : "familia"

        const mockUser = {
          id: "1",
          name: role === "kraal" ? "Scouter Demo" : role === "comite" ? "Comité Demo" : "Familia Demo",
          email,
          role,
          isActive: true,
        }

        // Guardar en almacenamiento
        secureStorage.set("user", mockUser)

        // Actualizar estado
        setUser(mockUser)
        setIsAuthenticated(true)

        toast({
          title: "¡Bienvenido!",
          description: `Has iniciado sesión como ${mockUser.name}`,
        })

        // Redireccionar
        router.push("/dashboard")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
        toast({
          variant: "destructive",
          title: "Error al iniciar sesión",
          description: err instanceof Error ? err.message : "Error desconocido",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [router, toast],
  )

  // Función de logout simplificada
  const logout = useCallback(() => {
    secureStorage.clear()
    setUser(null)
    setIsAuthenticated(false)
    router.push("/")
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    })
  }, [router, toast])

  // Crear valor del contexto
  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

