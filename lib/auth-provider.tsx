"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
  role: "kraal" | "comite" | "familia" | "educando"
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga del usuario desde localStorage o cookie
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Simulación de autenticación
    // En una implementación real, esto haría una petición a la API
    setIsLoading(true)

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simular usuario autenticado
      const mockUser = {
        id: "user-1",
        name: "Usuario Demo",
        email,
        role: email.includes("kraal")
          ? "kraal"
          : email.includes("comite")
            ? "comite"
            : email.includes("familia")
              ? "familia"
              : "educando",
      } as User

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
    } catch (error) {
      console.error("Error de autenticación:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

