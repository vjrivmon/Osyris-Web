"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z.string().email("Introduce un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

// Tipo para los datos del formulario
type LoginValues = z.infer<typeof loginSchema>

// Mock de usuarios para simular la base de datos
const MOCK_USERS = [
  { email: "kraal@osyris.es", password: "kraal123", role: "kraal" },
  { email: "monitor@osyris.es", password: "monitor123", role: "kraal" },
]

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Inicializar React Hook Form con validación de Zod
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Verificar si hay una sesión activa al cargar la página
  useEffect(() => {
    const savedUser = localStorage.getItem("osyris_user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        if (userData.role) {
          // Redireccionar según el rol (solo kraal disponible)
          if (userData.role === "kraal") {
            router.push("/aula-virtual")
          }
        }
      } catch (err) {
        localStorage.removeItem("osyris_user")
      }
    }
  }, [router])

  // Función de login
  const handleLogin = async (values: LoginValues) => {
    setIsLoggingIn(true)
    setError(null)

    try {
      // Simular latencia de API
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Buscar usuario en nuestro "mock de base de datos"
      const user = MOCK_USERS.find(
        (u) => u.email === values.email && u.password === values.password
      )

      if (user) {
        // Guardar sesión en localStorage
        localStorage.setItem("osyris_user", JSON.stringify({
          email: user.email,
          role: user.role,
          lastLogin: new Date().toISOString(),
        }))

        // Redireccionar según el rol (solo kraal disponible)
        if (user.role === "kraal") {
          // Los usuarios kraal van directamente al aula virtual
          router.push("/aula-virtual")
        }
      } else {
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.")
      }
    } catch (err) {
      console.error("Error en el proceso de login:", err)
      setError("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-section-pattern p-4">
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver al inicio</span>
          </Link>
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src="/images/logo-osyris.png"
            alt="Logo Grupo Scout Osyris"
            className="h-20 w-20 rounded-full border-4 border-primary shadow-lg"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acceso a la plataforma</CardTitle>
            <CardDescription>
              Introduce tus credenciales para acceder a la plataforma del Grupo Scout Osyris
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="tu.correo@ejemplo.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              ¿Has olvidado tu contraseña?{" "}
              <Link href="/recuperar-contrasena" className="text-primary hover:underline">
                Recuperar contraseña
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Grupo Scout Osyris. Todos los derechos reservados.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link href="/terminos" className="hover:underline">
              Términos de uso
            </Link>
            <Link href="/privacidad" className="hover:underline">
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

