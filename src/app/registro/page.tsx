"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InvitationData {
  email: string
  nombre: string
  apellidos: string
  rol: string
  seccion_id?: number
  expiresAt: string
}

// Componente que usa useSearchParams - debe estar envuelto en Suspense
function RegisterPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: ""
  })

  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: ""
  })

  useEffect(() => {
    if (!token) {
      setError("No se proporcionó un token de invitación válido")
      setIsLoading(false)
      return
    }

    verifyInvitation()
  }, [token])

  const verifyInvitation = async () => {
    try {
      const response = await fetch(`/api/auth/verify-invitation?token=${token}`)
      const result = await response.json()

      if (result.success) {
        setInvitationData(result.data)
      } else {
        setError(result.message || "Invitación no válida o ha expirado")
      }
    } catch (error) {
      console.error("Error verifying invitation:", error)
      setError("Ocurrió un error al verificar la invitación")
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors = {
      password: "",
      confirmPassword: ""
    }

    if (!formData.password) {
      errors.password = "La contraseña es obligatoria"
    } else if (formData.password.length < 6) {
      errors.password = "Mínimo 6 caracteres"
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
    }

    setFormErrors(errors)
    return !errors.password && !errors.confirmPassword
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          telefono: formData.telefono || undefined,
          direccion: formData.direccion || undefined,
          fecha_nacimiento: formData.fecha_nacimiento || undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsCompleted(true)
        toast({
          title: "¡Registro completado!",
          description: "Tu cuenta ha sido creada exitosamente",
        })

        // Guardar token
        localStorage.setItem("token", result.data.token)
        localStorage.setItem("user", JSON.stringify(result.data.user))

        // Redirigir al dashboard después de un breve momento
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 2000)
      } else {
        setError(result.message || "No se pudo completar el registro")
      }
    } catch (error) {
      console.error("Error completing registration:", error)
      setError("Ocurrió un error al completar el registro")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar errores cuando el usuario empieza a escribir
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-muted-foreground">Verificando invitación...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-md w-full mx-4">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">Invitación no válida</CardTitle>
              <CardDescription>
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => window.location.href = "/login"}
                className="bg-red-600 hover:bg-red-700"
              >
                Ir al Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-md w-full mx-4">
          <Card className="border-green-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">¡Registro Completado!</CardTitle>
              <CardDescription>
                Tu cuenta ha sido creada exitosamente. Serás redirigido a tu dashboard en unos momentos...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Loader2 className="h-6 w-8 animate-spin mx-auto text-green-600" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🏕️</span>
            </div>
            <CardTitle className="text-2xl text-green-800">
              Completa tu Registro
            </CardTitle>
            <CardDescription>
              Únete al Grupo Scout Osyris
            </CardDescription>
          </CardHeader>

          {invitationData && (
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Invitación para:</strong>
                </p>
                <p className="font-medium text-blue-900">
                  {invitationData.nombre} {invitationData.apellidos}
                </p>
                <p className="text-sm text-blue-700">{invitationData.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {invitationData.rol === "admin" ? "Administrador" : "Scouter"}
                  </Badge>
                  {invitationData.seccion_id && (
                    <Badge variant="outline" className="text-xs">
                      Sección asignada
                    </Badge>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={formErrors.password ? "border-red-500" : ""}
                      placeholder="Mínimo 6 caracteres"
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
                  {formErrors.password && (
                    <p className="text-xs text-red-500">{formErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={formErrors.confirmPassword ? "border-red-500" : ""}
                    placeholder="Repite tu contraseña"
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono (opcional)</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección (opcional)</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    placeholder="Calle, número, ciudad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento (opcional)</Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => handleInputChange("fecha_nacimiento", e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Completando registro...
                    </>
                  ) : (
                    "Completar Registro"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Al completar el registro, aceptas los términos y condiciones del Grupo Scout Osyris.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

// Componente principal con Suspense boundary
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}