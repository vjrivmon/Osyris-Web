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
import { getApiUrl } from "@/lib/api-utils"
import { PasswordStrength } from "@/components/ui/password-strength"

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
    nombre: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    apellidos: ""
  })

  const [formErrors, setFormErrors] = useState({
    nombre: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    apellidos: ""
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
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/verify-invitation?token=${token}`)
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
      nombre: "",
      password: "",
      confirmPassword: "",
      telefono: "",
      direccion: "",
      fecha_nacimiento: "",
      apellidos: ""
    }

    if (!formData.nombre) {
      errors.nombre = "El nombre es obligatorio"
    }

    if (!formData.apellidos) {
      errors.apellidos = "Los apellidos son obligatorios"
    }

    if (!formData.telefono) {
      errors.telefono = "El teléfono es obligatorio"
    } else if (!/^\+?[\d\s-()]+$/.test(formData.telefono)) {
      errors.telefono = "El teléfono solo puede contener números, espacios, guiones y paréntesis"
    } else if (formData.telefono.replace(/\D/g, "").length < 9) {
      errors.telefono = "El teléfono debe tener al menos 9 dígitos"
    }

    if (!formData.direccion) {
      errors.direccion = "La dirección es obligatoria"
    }

    if (!formData.fecha_nacimiento) {
      errors.fecha_nacimiento = "La fecha de nacimiento es obligatoria"
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

    // Solo validar sección para scouters, no para familias
    if (invitationData?.rol === 'scouter' && !invitationData?.seccion_id) {
      toast({
        title: "Error",
        description: "Debes tener una sección asignada para completar el registro",
        variant: "destructive"
      })
      return false
    }

    setFormErrors(errors)
    return !errors.nombre && !errors.password && !errors.confirmPassword && !errors.telefono && !errors.direccion && !errors.fecha_nacimiento && !errors.apellidos
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) {
      return
    }

    setIsSubmitting(true)

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/complete-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          nombre: formData.nombre,
          password: formData.password,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          direccion: formData.direccion,
          fecha_nacimiento: formData.fecha_nacimiento
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
        localStorage.setItem("user", JSON.stringify(result.data.usuario))

        // Redirigir al dashboard según el rol del usuario
        const rol = result.data.usuario?.rol || "scouter"
        let dashboardUrl = "/aula-virtual"

        if (rol === "admin") {
          dashboardUrl = "/admin/dashboard"
        } else if (rol === "familia") {
          dashboardUrl = "/familia/dashboard"
        } else if (rol === "comite") {
          dashboardUrl = "/comite/dashboard"
        }
        // scouter y educando van a /aula-virtual

        setTimeout(() => {
          window.location.href = dashboardUrl
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
    // Validación especial para teléfono: solo permitir números, espacios, guiones y paréntesis
    if (field === "telefono") {
      const sanitized = value.replace(/[^\d\s\-+()]/g, "")
      setFormData(prev => ({ ...prev, [field]: sanitized }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Limpiar errores cuando el usuario empieza a escribir
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handlePaste = (e: React.ClipboardEvent, field: string) => {
    // Prevenir pegar en el campo de confirmación de contraseña
    if (field === "confirmPassword") {
      e.preventDefault()
      toast({
        title: "Acción no permitida",
        description: "Debes escribir la contraseña manualmente para confirmarla",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600 dark:text-green-400" />
          <p className="text-muted-foreground">Verificando invitación...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
        <div className="max-w-md w-full mx-4">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-800 dark:text-red-300">Invitación no válida</CardTitle>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <div className="max-w-md w-full mx-4">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-800 dark:text-green-300">¡Registro Completado!</CardTitle>
              <CardDescription>
                Tu cuenta ha sido creada exitosamente. Serás redirigido a tu dashboard en unos momentos...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Loader2 className="h-6 w-8 animate-spin mx-auto text-green-600 dark:text-green-400" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 py-12 px-4">
      <div className="max-w-5xl w-full">
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🏕️</span>
            </div>
            <CardTitle className="text-3xl text-green-800 dark:text-green-300">
              Completa tu Registro
            </CardTitle>
            <CardDescription>
              Únete al Grupo Scout Osyris
            </CardDescription>
          </CardHeader>

          {invitationData && (
            <CardContent>
              <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  <strong>Invitación para:</strong>
                </p>
                <p className="font-medium text-blue-900 dark:text-blue-100 text-lg">
                  {invitationData.nombre} {invitationData.apellidos}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">{invitationData.email}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {invitationData.rol === "admin" && "👑 Administrador"}
                    {invitationData.rol === "scouter" && "⚜️ Scouter"}
                    {invitationData.rol === "familia" && "👨‍👩‍👧‍👦 Familia"}
                    {invitationData.rol === "educando" && "🧒 Educando"}
                  </Badge>
                  {invitationData.seccion_id && (
                    <Badge className="text-xs bg-green-600 hover:bg-green-700 text-white">
                      {invitationData.seccion_id === 1 && "🦫 Castores"}
                      {invitationData.seccion_id === 2 && "🐺 Manada"}
                      {invitationData.seccion_id === 3 && "⚜️ Tropa"}
                      {invitationData.seccion_id === 4 && "🏔️ Pioneros"}
                      {invitationData.seccion_id === 5 && "🎒 Rutas"}
                    </Badge>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección: Información Personal */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground/80 border-b pb-2">
                    📋 Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                        className={formErrors.nombre ? "border-red-500" : ""}
                        placeholder="Tu nombre"
                      />
                      {formErrors.nombre && (
                        <p className="text-xs text-red-500">{formErrors.nombre}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apellidos">Apellidos *</Label>
                      <Input
                        id="apellidos"
                        type="text"
                        value={formData.apellidos}
                        onChange={(e) => handleInputChange("apellidos", e.target.value)}
                        className={formErrors.apellidos ? "border-red-500" : ""}
                        placeholder="Tus apellidos"
                      />
                      {formErrors.apellidos && (
                        <p className="text-xs text-red-500">{formErrors.apellidos}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                      <Input
                        id="fecha_nacimiento"
                        type="date"
                        value={formData.fecha_nacimiento}
                        onChange={(e) => handleInputChange("fecha_nacimiento", e.target.value)}
                        className={formErrors.fecha_nacimiento ? "border-red-500" : ""}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {formErrors.fecha_nacimiento && (
                        <p className="text-xs text-red-500">{formErrors.fecha_nacimiento}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección: Información de Contacto */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground/80 border-b pb-2">
                    📞 Información de Contacto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono *</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange("telefono", e.target.value)}
                        className={formErrors.telefono ? "border-red-500" : ""}
                        placeholder="+34 600 000 000"
                        maxLength={15}
                      />
                      {formErrors.telefono && (
                        <p className="text-xs text-red-500">{formErrors.telefono}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Solo números y caracteres permitidos: + - ( ) espacio</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección *</Label>
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => handleInputChange("direccion", e.target.value)}
                        className={formErrors.direccion ? "border-red-500" : ""}
                        placeholder="Calle, número, ciudad"
                      />
                      {formErrors.direccion && (
                        <p className="text-xs text-red-500">{formErrors.direccion}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección: Contraseña */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground/80 border-b pb-2">
                    🔒 Configuración de Contraseña
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className={formErrors.password ? "border-red-500 pr-10" : "pr-10"}
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
                      <PasswordStrength password={formData.password} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirmar Contraseña *
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        onPaste={(e) => handlePaste(e, "confirmPassword")}
                        onCopy={(e) => e.preventDefault()}
                        className={formErrors.confirmPassword ? "border-red-500" : ""}
                        placeholder="Repite tu contraseña"
                        autoComplete="off"
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Debes escribir la contraseña manualmente para confirmar</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600 dark:text-green-400" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}