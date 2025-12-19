"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api-utils"

interface User {
  id: number
  email: string
  nombre: string
  apellidos: string
  rol: string
  estado: string
  seccion?: string
  seccion_id?: number
}

interface EditUserModalProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated?: (userId: number, updates: Partial<User>) => void
}

interface FormData {
  nombre: string
  apellidos: string
  email: string
  rol: "admin" | "scouter"
  estado: "activo" | "inactivo"
  seccion_id?: number
}

interface FormErrors {
  nombre?: string
  apellidos?: string
  email?: string
  rol?: string
  estado?: string
}

// Secciones disponibles
const secciones = [
  { id: 1, nombre: "Castores" },
  { id: 2, nombre: "Lobatos" },
  { id: 3, nombre: "Tropa" },
  { id: 4, nombre: "Pioneros" },
  { id: 5, nombre: "Rutas" }
]

// Mapeo de nombres de sección a IDs
const SECTION_NAME_TO_ID: Record<string, number> = {
  "Castores": 1,
  "Lobatos": 2,
  "Manada": 2,
  "Tropa": 3,
  "Pioneros": 4,
  "Rutas": 5
}

export function EditUserModal({ user, open, onOpenChange, onUserUpdated }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellidos: "",
    email: "",
    rol: "scouter",
    estado: "activo",
    seccion_id: undefined
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const { toast } = useToast()

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (user && open) {
      // Extraer seccion_id del nombre de la sección si no está disponible directamente
      let seccionId = user.seccion_id
      if (!seccionId && user.seccion) {
        // Intentar obtener el ID del nombre
        seccionId = SECTION_NAME_TO_ID[user.seccion]
        // Si no coincide, intentar extraer de "Sección X"
        if (!seccionId) {
          const match = user.seccion.match(/Sección (\d+)/)
          if (match) {
            seccionId = parseInt(match[1])
          }
        }
      }

      setFormData({
        nombre: user.nombre || "",
        apellidos: user.apellidos || "",
        email: user.email || "",
        rol: (user.rol as "admin" | "scouter") || "scouter",
        estado: (user.estado as "activo" | "inactivo") || "activo",
        seccion_id: seccionId
      })
      setErrors({})
    }
  }, [user, open])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son obligatorios"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const apiUrl = getApiUrl()

      // Preparar los datos para la API de admin
      const adminData: Record<string, unknown> = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        rol: formData.rol,
        estado: formData.estado
      }

      // Solo incluir seccion_id si es scouter
      if (formData.rol === "scouter" && formData.seccion_id) {
        adminData.seccion_id = formData.seccion_id
      } else if (formData.rol === "admin") {
        // Si es admin, quitar la sección
        adminData.seccion_id = null
      }

      // Actualizar datos del usuario (nombre, apellidos, rol, estado, seccion)
      const adminResponse = await fetch(`${apiUrl}/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(adminData)
      })

      const adminResult = await adminResponse.json()

      if (!adminResult.success) {
        throw new Error(adminResult.message || "Error al actualizar el usuario")
      }

      // Si el email cambió, actualizar también con el endpoint de usuarios
      if (formData.email !== user.email) {
        const emailResponse = await fetch(`${apiUrl}/api/usuarios/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ email: formData.email })
        })

        const emailResult = await emailResponse.json()

        if (!emailResult.success) {
          // Si falla el cambio de email, avisar pero no fallar completamente
          toast({
            title: "Aviso",
            description: "Los datos se actualizaron, pero el email no pudo cambiarse: " + (emailResult.message || "Error desconocido"),
            variant: "destructive",
          })
        }
      }

      toast({
        title: "Usuario actualizado",
        description: `Los datos de ${formData.nombre} ${formData.apellidos} se han actualizado correctamente.`,
      })

      // Obtener el nombre de la sección para el callback
      const seccionNombre = formData.seccion_id
        ? secciones.find(s => s.id === formData.seccion_id)?.nombre
        : undefined

      // Callback con los datos actualizados
      onUserUpdated?.(user.id, {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        rol: formData.rol,
        estado: formData.estado,
        seccion: seccionNombre
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al actualizar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Usuario
            </DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario. Los cambios se guardarán inmediatamente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nombre y Apellidos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre *</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className={errors.nombre ? "border-red-500" : ""}
                  placeholder="Vicente"
                />
                {errors.nombre && (
                  <p className="text-xs text-red-500">{errors.nombre}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-apellidos">Apellidos *</Label>
                <Input
                  id="edit-apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange("apellidos", e.target.value)}
                  className={errors.apellidos ? "border-red-500" : ""}
                  placeholder="Rivas"
                />
                {errors.apellidos && (
                  <p className="text-xs text-red-500">{errors.apellidos}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                placeholder="usuario@ejemplo.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Rol y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rol">Rol *</Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value: "admin" | "scouter") => handleInputChange("rol", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="bg-red-600">Admin</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="scouter">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-600">Scouter</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-estado">Estado *</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: "activo" | "inactivo") => handleInputChange("estado", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="inactivo">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactivo</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sección (solo para scouters) */}
            {formData.rol === "scouter" && (
              <div className="space-y-2">
                <Label htmlFor="edit-seccion">Sección Scout</Label>
                <Select
                  value={formData.seccion_id?.toString() || "none"}
                  onValueChange={(value: string) => handleInputChange("seccion_id", value === "none" ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una sección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Sin sección asignada</span>
                    </SelectItem>
                    {secciones.map((seccion) => (
                      <SelectItem key={seccion.id} value={seccion.id.toString()}>
                        {seccion.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
