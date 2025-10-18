"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NewUser {
  email: string
  password: string
  nombre: string
  apellidos: string
  rol: "admin" | "scouter" | "usuario"
}

interface QuickAddModalProps {
  onUserAdded?: (user: NewUser) => void
  trigger?: React.ReactNode
}

export function QuickAddModal({ onUserAdded, trigger }: QuickAddModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<NewUser>({
    email: "",
    password: "",
    nombre: "",
    apellidos: "",
    rol: "scouter"
  })
  const [errors, setErrors] = useState<Partial<NewUser>>({})
  const { toast } = useToast()

  const validateForm = (): boolean => {
    const newErrors: Partial<NewUser> = {}

    if (!formData.email) {
      newErrors.email = "El email es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres"
    }

    if (!formData.nombre) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.apellidos) {
      newErrors.apellidos = "Los apellidos son obligatorios"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Usuario creado",
          description: `${formData.nombre} ${formData.apellidos} ha sido agregado exitosamente.`,
        })

        // Reset form
        setFormData({
          email: "",
          password: "",
          nombre: "",
          apellidos: "",
          rol: "scouter"
        })
        setErrors({})

        // Callback
        onUserAdded?.(formData)

        // Close modal
        setOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo crear el usuario",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof NewUser, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const defaultTrigger = (
    <Button className="bg-green-600 hover:bg-green-700">
      <UserPlus className="h-4 w-4 mr-2" />
      Agregar Usuario
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Agregar Nuevo Usuario
            </DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario para el sistema de gestión Osyris.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className={errors.nombre ? "border-red-500" : ""}
                  placeholder="Juan"
                />
                {errors.nombre && (
                  <p className="text-xs text-red-500">{errors.nombre}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange("apellidos", e.target.value)}
                  className={errors.apellidos ? "border-red-500" : ""}
                  placeholder="Pérez"
                />
                {errors.apellidos && (
                  <p className="text-xs text-red-500">{errors.apellidos}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                placeholder="juan@ejemplo.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={errors.password ? "border-red-500" : ""}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select
                value={formData.rol}
                onValueChange={(value: any) => handleInputChange("rol", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Admin</Badge>
                      <span>Acceso completo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="scouter">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-600">Scouter</Badge>
                      <span>Monitor/Coordinador</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="usuario">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Usuario</Badge>
                      <span>Acceso limitado</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}