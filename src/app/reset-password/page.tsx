"use client"

import type React from "react"
import { getApiUrl } from '@/lib/api-utils'
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrength } from "@/components/ui/password-strength"
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("No se proporcionó un token de restablecimiento válido")
    }
  }, [token])

  const validateForm = (): boolean => {
    if (!password) {
      setError("La contraseña es obligatoria")
      return false
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return false
    }
    if (!confirmPassword) {
      setError("Confirma tu contraseña")
      return false
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm() || !token) {
      return
    }

    setLoading(true)

    try {
      const API_URL = getApiUrl()
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer la contraseña')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
  }

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-section-pattern p-4">
        <div className="w-full max-w-md">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">Enlace no válido</CardTitle>
              <CardDescription>
                El enlace de restablecimiento de contraseña no es válido o ha expirado.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link href="/recuperar-contrasena">Solicitar nuevo enlace</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-section-pattern p-4">
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/login">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver al inicio de sesión</span>
          </Link>
        </Button>
      </div>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo-osyris.png"
            alt="Logo Grupo Scout Osyris"
            width={80}
            height={80}
            className="h-20 w-20 rounded-full border-4 border-primary shadow-lg"
            priority
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Restablecer contraseña</CardTitle>
            <CardDescription>
              Introduce tu nueva contraseña para completar el restablecimiento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                  </AlertDescription>
                </Alert>
                <Button asChild className="w-full">
                  <Link href="/login">Ir a Iniciar Sesión</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError(null)
                      }}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError(null)
                    }}
                    onPaste={handlePaste}
                  />
                  <p className="text-xs text-muted-foreground">
                    Debes escribir la contraseña manualmente para confirmarla
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Restableciendo...
                    </>
                  ) : (
                    "Restablecer contraseña"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              ¿Recuerdas tu contraseña?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Grupo Scout Osyris. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-section-pattern">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
