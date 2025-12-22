"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Shield,
  Lock,
  Key,
  Smartphone,
  Laptop,
  Monitor,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Download,
  Trash2,
  QrCode,
  Clock,
  MapPin,
  Fingerprint
} from "lucide-react"

export function ConfiguracionSeguridad() {
  const [showPasswordActual, setShowPasswordActual] = useState(false)
  const [showPasswordNueva, setShowPasswordNueva] = useState(false)
  const [showPasswordConfirmacion, setShowPasswordConfirmacion] = useState(false)
  const [formularioPassword, setFormularioPassword] = useState({
    actual: "",
    nueva: "",
    confirmacion: ""
  })
  const [fortalezaPassword, setFortalezaPassword] = useState(0)
  const [erroresPassword, setErroresPassword] = useState<string[]>([])
  const [passwordCambiado, setPasswordCambiado] = useState(false)

  const [dosHabilitado, setDosHabilitado] = useState(false)
  const [mostrarDialogo2FA, setMostrarDialogo2FA] = useState(false)
  const [codigo2FA, setCodigo2FA] = useState("")
  const [codigosRecuperacion, setCodigosRecuperacion] = useState<string[]>([])

  const [sesionesActivas, setSesionesActivas] = useState([
    {
      id: "1",
      dispositivo: "Chrome en Windows",
      tipo: "desktop",
      ubicacion: "Madrid, España",
      fecha: "2025-10-24T10:30:00",
      actual: true,
      ip: "85.84.123.45"
    },
    {
      id: "2",
      dispositivo: "iPhone App",
      tipo: "mobile",
      ubicacion: "Valencia, España",
      fecha: "2025-10-23T18:15:00",
      actual: false,
      ip: "95.17.234.67"
    },
    {
      id: "3",
      dispositivo: "iPad App",
      tipo: "tablet",
      ubicacion: "Madrid, España",
      fecha: "2025-10-22T20:45:00",
      actual: false,
      ip: "85.84.123.45"
    }
  ])

  const validarFortalezaPassword = (password: string) => {
    let fortaleza = 0
    const criterios = []

    if (password.length >= 8) {
      fortaleza += 20
      criterios.push("✓ Mínimo 8 caracteres")
    } else {
      criterios.push("✗ Mínimo 8 caracteres")
    }

    if (/[A-Z]/.test(password)) {
      fortaleza += 20
      criterios.push("✓ Mayúscula")
    } else {
      criterios.push("✗ Mayúscula")
    }

    if (/[a-z]/.test(password)) {
      fortaleza += 20
      criterios.push("✓ Minúscula")
    } else {
      criterios.push("✗ Minúscula")
    }

    if (/\d/.test(password)) {
      fortaleza += 20
      criterios.push("✓ Número")
    } else {
      criterios.push("✗ Número")
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      fortaleza += 20
      criterios.push("✓ Carácter especial")
    } else {
      criterios.push("✗ Carácter especial")
    }

    return { fortaleza, criterios }
  }

  const handlePasswordChange = (campo: string, valor: string) => {
    setFormularioPassword(prev => ({ ...prev, [campo]: valor }))

    if (campo === "nueva") {
      const { fortaleza } = validarFortalezaPassword(valor)
      setFortalezaPassword(fortaleza)
    }

    // Limpiar errores al escribir
    if (erroresPassword.length > 0) {
      setErroresPassword([])
    }
  }

  const getFortalezaColor = (fortaleza: number) => {
    if (fortaleza < 40) return "bg-red-500"
    if (fortaleza < 60) return "bg-orange-500"
    if (fortaleza < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getFortalezaTexto = (fortaleza: number) => {
    if (fortaleza < 40) return "Débil"
    if (fortaleza < 60) return "Aceptable"
    if (fortaleza < 80) return "Buena"
    return "Excelente"
  }

  const validarFormularioPassword = () => {
    const errores = []

    if (!formularioPassword.actual) {
      errores.push("Debes introducir tu contraseña actual")
    }

    if (!formularioPassword.nueva) {
      errores.push("Debes introducir una nueva contraseña")
    } else {
      const { fortaleza } = validarFortalezaPassword(formularioPassword.nueva)
      if (fortaleza < 60) {
        errores.push("La nueva contraseña no es lo suficientemente segura")
      }
    }

    if (formularioPassword.nueva !== formularioPassword.confirmacion) {
      errores.push("Las contraseñas nuevas no coinciden")
    }

    if (formularioPassword.actual === formularioPassword.nueva) {
      errores.push("La nueva contraseña debe ser diferente a la actual")
    }

    setErroresPassword(errores)
    return errores.length === 0
  }

  const handleCambiarPassword = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormularioPassword()) {
      return
    }

    // Simulación de cambio de contraseña
    setPasswordCambiado(true)
    setFormularioPassword({ actual: "", nueva: "", confirmacion: "" })
    setFortalezaPassword(0)

    setTimeout(() => setPasswordCambiado(false), 5000)
  }

  const handleConfigurar2FA = () => {
    // Simulación de configuración 2FA
    setDosHabilitado(true)
    setMostrarDialogo2FA(false)
    setCodigo2FA("")

    // Generar códigos de recuperación simulados
    const nuevosCodigos = Array.from({ length: 10 }, (_, i) =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )
    setCodigosRecuperacion(nuevosCodigos)
  }

  const handleDesactivar2FA = () => {
    setDosHabilitado(false)
    setCodigosRecuperacion([])
  }

  const handleCerrarSesion = async (sesionId: string) => {
    // Simulación de cierre de sesión
    setSesionesActivas(prev => prev.filter(s => s.id !== sesionId))
  }

  const handleCerrarTodasSesiones = async () => {
    // Simulación de cierre de todas las sesiones excepto la actual
    setSesionesActivas(prev => prev.filter(s => s.actual))
  }

  const getIconoDispositivo = (tipo: string) => {
    switch (tipo) {
      case "mobile": return Smartphone
      case "tablet": return Monitor
      default: return Laptop
    }
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const obtenerUbicacionRelativa = (fecha: string) => {
    const ahora = new Date()
    const fechaSesion = new Date(fecha)
    const diferencia = ahora.getTime() - fechaSesion.getTime()
    const horas = Math.floor(diferencia / (1000 * 60 * 60))

    if (horas < 1) return "Ahora mismo"
    if (horas < 24) return `Hace ${horas} horas`
    const dias = Math.floor(horas / 24)
    return `Hace ${dias} día${dias !== 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Cambio de contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCambiarPassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password-actual">Contraseña Actual</Label>
                <div className="relative">
                  <Input
                    id="password-actual"
                    type={showPasswordActual ? "text" : "password"}
                    value={formularioPassword.actual}
                    onChange={(e) => handlePasswordChange("actual", e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswordActual(!showPasswordActual)}
                  >
                    {showPasswordActual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-nueva">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password-nueva"
                    type={showPasswordNueva ? "text" : "password"}
                    value={formularioPassword.nueva}
                    onChange={(e) => handlePasswordChange("nueva", e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                  >
                    {showPasswordNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formularioPassword.nueva && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getFortalezaColor(fortalezaPassword)}`}
                          style={{ width: `${fortalezaPassword}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground min-w-[50px]">
                        {getFortalezaTexto(fortalezaPassword)}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      {validarFortalezaPassword(formularioPassword.nueva).criterios.map((criterio, index) => (
                        <div key={index} className={criterio.startsWith("✓") ? "text-green-600" : "text-red-600"}>
                          {criterio}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-confirmacion">Confirmar Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password-confirmacion"
                    type={showPasswordConfirmacion ? "text" : "password"}
                    value={formularioPassword.confirmacion}
                    onChange={(e) => handlePasswordChange("confirmacion", e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswordConfirmacion(!showPasswordConfirmacion)}
                  >
                    {showPasswordConfirmacion ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {erroresPassword.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {erroresPassword.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {passwordCambiado && (
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  ✅ Tu contraseña ha sido cambiada correctamente.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full md:w-auto">
              <Lock className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Autenticación en dos factores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Autenticación en Dos Pasos (2FA)
          </CardTitle>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Fingerprint className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Autenticación de Dos Factores</p>
                  <p className="text-sm text-muted-foreground">
                    {dosHabilitado
                      ? "Protege tu cuenta con códigos de un solo uso"
                      : "Añade seguridad adicional a tu cuenta"}
                  </p>
                </div>
              </div>
              <Switch
                checked={dosHabilitado}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setMostrarDialogo2FA(true)
                  } else {
                    handleDesactivar2FA()
                  }
                }}
              />
            </div>

            {dosHabilitado && (
              <div className="space-y-4">
                <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    ✅ La autenticación en dos pasos está activada. Tu cuenta está protegida.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Códigos de Recuperación</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Guarda estos códigos en un lugar seguro. Úsalos cuando no tengas acceso a tu dispositivo.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {codigosRecuperacion.map((codigo, index) => (
                      <div key={index} className="bg-card p-2 border rounded text-center font-mono text-sm">
                        {codigo}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generar nuevos
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sesiones activas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Sesiones Activas
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCerrarTodasSesiones}
              disabled={sesionesActivas.filter(s => !s.actual).length === 0}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Todas (excepto actual)
            </Button>
          </CardTitle>
          <CardDescription>
            Gestiona las sesiones activas en tus dispositivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sesionesActivas.map((sesion) => {
              const Icon = getIconoDispositivo(sesion.tipo)
              return (
                <div key={sesion.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{sesion.dispositivo}</p>
                        {sesion.actual && (
                          <Badge variant="default" className="bg-green-600">
                            Sesión actual
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {sesion.ubicacion}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {obtenerUbicacionRelativa(sesion.fecha)}
                        </span>
                        <span>IP: {sesion.ip}</span>
                      </div>
                    </div>
                  </div>
                  {!sesion.actual && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCerrarSesion(sesion.id)}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialogo 2FA */}
      <Dialog open={mostrarDialogo2FA} onOpenChange={setMostrarDialogo2FA}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Autenticación en Dos Pasos</DialogTitle>
            <DialogDescription>
              Escanea este código QR con tu aplicación de autenticación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-card p-4 border rounded-lg">
                <QrCode className="h-48 w-48 text-foreground" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                O introduce este código manualmente:
              </p>
              <code className="bg-muted px-3 py-2 rounded text-sm">
                JBSW Y3DPEHPK3PXP
              </code>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo-2fa">Código de Verificación</Label>
              <Input
                id="codigo-2fa"
                placeholder="000000"
                value={codigo2FA}
                onChange={(e) => setCodigo2FA(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setMostrarDialogo2FA(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfigurar2FA} disabled={codigo2FA.length !== 6}>
                Activar 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}