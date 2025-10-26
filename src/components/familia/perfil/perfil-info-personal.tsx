"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard
} from "lucide-react"

interface PerfilInfoPersonalProps {
  perfil: any
  onSave: (datos: any) => Promise<void>
  isLoading: boolean
}

export function PerfilInfoPersonal({ perfil, onSave, isLoading }: PerfilInfoPersonalProps) {
  const [formData, setFormData] = useState({
    nombre: perfil?.nombre || "",
    apellidos: perfil?.apellidos || "",
    email: perfil?.email || "",
    telefono: perfil?.telefono || "",
    telefono_secundario: perfil?.telefono_secundario || "",
    relacion: perfil?.relacion || "",
    direccion: perfil?.direccion || "",
    dni: perfil?.dni || "",
    fecha_nacimiento: perfil?.fecha_nacimiento || ""
  })

  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState<string>(perfil?.foto_perfil || "")
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [guardado, setGuardado] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const opcionesRelacion = [
    { value: "padre", label: "Padre" },
    { value: "madre", label: "Madre" },
    { value: "tutor", label: "Tutor/a Legal" },
    { value: "abuelo", label: "Abuelo/a" },
    { value: "otro", label: "Otro familiar" }
  ]

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {}

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio"
    }
    if (!formData.apellidos.trim()) {
      nuevosErrores.apellidos = "Los apellidos son obligatorios"
    }
    if (!formData.email.trim()) {
      nuevosErrores.email = "El email es obligatorio"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = "El email no es válido"
    }
    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio"
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(formData.telefono)) {
      nuevosErrores.telefono = "El teléfono no es válido"
    }
    if (!formData.relacion) {
      nuevosErrores.relacion = "La relación es obligatoria"
    }

    // Validación de DNI español
    if (formData.dni && !/^[0-9]{8}[A-HJ-NP-TV-Z]$/.test(formData.dni)) {
      nuevosErrores.dni = "El DNI no es válido (formato: 8 números + 1 letra)"
    }

    // Validación de fecha de nacimiento
    if (formData.fecha_nacimiento) {
      const fechaNac = new Date(formData.fecha_nacimiento)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fechaNac.getFullYear()
      if (edad < 18 || edad > 100) {
        nuevosErrores.fecha_nacimiento = "La fecha de nacimiento no es válida"
      }
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error al escribir
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrores(prev => ({ ...prev, foto: "El archivo debe ser una imagen" }))
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrores(prev => ({ ...prev, foto: "La imagen no puede superar los 5MB" }))
        return
      }

      setFotoPerfil(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewFoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setErrores(prev => ({ ...prev, foto: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return
    }

    try {
      const datosGuardar: typeof formData & { foto_perfil?: string } = { ...formData }

      // Si hay una foto nueva, incluirla en los datos
      if (fotoPerfil) {
        // Aquí debería subir la foto y obtener la URL
        // Por ahora, simulamos que se sube correctamente
        datosGuardar.foto_perfil = previewFoto
      }

      await onSave(datosGuardar)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
      setFotoPerfil(null) // Limpiar foto temporal
    } catch (error) {
      console.error("Error al guardar perfil:", error)
    }
  }

  const getIniciales = () => {
    const nombre = formData.nombre.split(" ")[0]?.[0] || ""
    const apellido = formData.apellidos.split(" ")[0]?.[0] || ""
    return (nombre + apellido).toUpperCase()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Foto de perfil y información básica */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-gray-200">
              <AvatarImage src={previewFoto} alt="Foto de perfil" />
              <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                {getIniciales()}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              size="sm"
              className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFotoChange}
          />
          <p className="text-xs text-gray-500 text-center">
            JPG, PNG o GIF<br />Máximo 5MB
          </p>
          {errores.foto && (
            <p className="text-xs text-red-600 text-center">{errores.foto}</p>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className={`pl-10 ${errores.nombre ? "border-red-500" : ""}`}
                  placeholder="Tu nombre"
                />
              </div>
              {errores.nombre && (
                <p className="text-sm text-red-600">{errores.nombre}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input
                id="apellidos"
                value={formData.apellidos}
                onChange={(e) => handleInputChange("apellidos", e.target.value)}
                className={errores.apellidos ? "border-red-500" : ""}
                placeholder="Tus apellidos"
              />
              {errores.apellidos && (
                <p className="text-sm text-red-600">{errores.apellidos}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 ${errores.email ? "border-red-500" : ""}`}
                  placeholder="tu@email.com"
                />
              </div>
              {errores.email && (
                <p className="text-sm text-red-600">{errores.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relacion">Relación *</Label>
              <Select value={formData.relacion} onValueChange={(value) => handleInputChange("relacion", value)}>
                <SelectTrigger className={errores.relacion ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecciona tu relación" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesRelacion.map((opcion) => (
                    <SelectItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errores.relacion && (
                <p className="text-sm text-red-600">{errores.relacion}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Información de contacto */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información de Contacto</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono Principal *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                className={`pl-10 ${errores.telefono ? "border-red-500" : ""}`}
                placeholder="+34 600 123 456"
              />
            </div>
            {errores.telefono && (
              <p className="text-sm text-red-600">{errores.telefono}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono_secundario">Teléfono Secundario</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="telefono_secundario"
                type="tel"
                value={formData.telefono_secundario}
                onChange={(e) => handleInputChange("telefono_secundario", e.target.value)}
                className="pl-10"
                placeholder="+34 600 123 456"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange("direccion", e.target.value)}
              className="pl-10 min-h-[80px]"
              placeholder="Calle, número, ciudad, código postal..."
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Información adicional */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información Adicional</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => handleInputChange("dni", e.target.value.toUpperCase())}
                className={`pl-10 ${errores.dni ? "border-red-500" : ""}`}
                placeholder="12345678A"
                maxLength={9}
              />
            </div>
            {errores.dni && (
              <p className="text-sm text-red-600">{errores.dni}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => handleInputChange("fecha_nacimiento", e.target.value)}
                className={`pl-10 ${errores.fecha_nacimiento ? "border-red-500" : ""}`}
              />
            </div>
            {errores.fecha_nacimiento && (
              <p className="text-sm text-red-600">{errores.fecha_nacimiento}</p>
            )}
          </div>
        </div>
      </div>

      {/* Alertas de estado */}
      {guardado && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Tu perfil ha sido actualizado correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData({
              nombre: perfil?.nombre || "",
              apellidos: perfil?.apellidos || "",
              email: perfil?.email || "",
              telefono: perfil?.telefono || "",
              telefono_secundario: perfil?.telefono_secundario || "",
              relacion: perfil?.relacion || "",
              direccion: perfil?.direccion || "",
              dni: perfil?.dni || "",
              fecha_nacimiento: perfil?.fecha_nacimiento || ""
            })
            setPreviewFoto(perfil?.foto_perfil || "")
            setFotoPerfil(null)
            setErrores({})
          }}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}