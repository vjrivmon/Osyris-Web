"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Key, User as UserIcon, Edit, X, Bell, ArrowLeft } from "lucide-react"
import { getApiUrl } from "@/lib/api-utils"
import Link from "next/link"

export default function PerfilFamiliaPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: ""
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    actividades: true,
    galeria: true,
    documentos: true
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        toast({
          title: "Error",
          description: "No se encontraron datos de usuario",
          variant: "destructive"
        })
        return
      }

      const user = JSON.parse(userStr)
      setUserData(user)

      // Cargar datos completos del usuario desde el backend
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()
      
      const response = await fetch(`${apiUrl}/api/usuarios/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const userInfo = result.data
          // Actualizar userData completo
          setUserData({
            ...user,
            ...userInfo
          })
          // Actualizar formData
          setFormData({
            nombre: userInfo.nombre || "",
            apellidos: userInfo.apellidos || "",
            email: userInfo.email || "",
            telefono: userInfo.telefono || "",
            direccion: userInfo.direccion || ""
          })
        }
      } else {
        // Si falla la API, intentar usar los datos de localStorage
        console.warn('No se pudieron cargar los datos completos, usando localStorage')
        setFormData({
          nombre: user.nombre || "",
          apellidos: user.apellidos || "",
          email: user.email || "",
          telefono: user.telefono || "",
          direccion: user.direccion || ""
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/usuarios/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        // Actualizar localStorage con los nuevos datos
        const updatedUser = { ...userData, ...formData }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUserData(updatedUser)

        toast({
          title: "✅ Perfil actualizado",
          description: "Tus datos se han guardado correctamente"
        })
        
        // Salir del modo edición
        setIsEditing(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo actualizar el perfil",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar los datos",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    // Restaurar los datos originales
    setFormData({
      nombre: userData.nombre || "",
      apellidos: userData.apellidos || "",
      email: userData.email || "",
      telefono: userData.telefono || "",
      direccion: userData.direccion || ""
    })
    setIsEditing(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Todos los campos de contraseña son obligatorios",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 8 caracteres",
        variant: "destructive"
      })
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "✅ Contraseña actualizada",
          description: "Tu contraseña se ha cambiado correctamente"
        })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        setShowPasswordForm(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo cambiar la contraseña",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cambiar la contraseña",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = () => {
    // Guardar preferencias en localStorage
    localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences))

    toast({
      title: "✅ Preferencias guardadas",
      description: "Tus preferencias de notificación se han actualizado correctamente"
    })
  }

  const getInitials = (nombre: string, apellidos?: string) => {
    if (!nombre) return "U"
    const firstInitial = nombre.charAt(0).toUpperCase()
    const lastInitial = apellidos ? apellidos.charAt(0).toUpperCase() : ""
    return firstInitial + lastInitial
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb - Volver */}
      <Link
        href="/familia/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu información personal y familiar
        </p>
      </div>

      {/* Información del perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData?.avatar || undefined} alt={userData?.nombre} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {getInitials(userData?.nombre, userData?.apellidos)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {userData?.nombre} {userData?.apellidos}
              </CardTitle>
              <CardDescription>Familiar</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formulario de datos personales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              <CardTitle>Información Personal</CardTitle>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
          <CardDescription>
            {isEditing ? "Modifica tus datos personales" : "Información de tu perfil"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El email no se puede modificar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Cambio de contraseña */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Seguridad</CardTitle>
          </div>
          <CardDescription>
            Cambia tu contraseña de acceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordForm(true)}
            >
              <Key className="mr-2 h-4 w-4" />
              Cambiar Contraseña
            </Button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Preferencias de Notificaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Preferencias de Notificaciones</CardTitle>
          </div>
          <CardDescription>
            Configura cómo quieres recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Notificaciones por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones importantes en tu correo electrónico
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={notificationPreferences.email}
              onCheckedChange={(checked) => setNotificationPreferences({...notificationPreferences, email: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="activity-notifications">Notificaciones de Actividades</Label>
              <p className="text-sm text-muted-foreground">
                Alertas sobre nuevas actividades y eventos
              </p>
            </div>
            <Switch
              id="activity-notifications"
              checked={notificationPreferences.actividades}
              onCheckedChange={(checked) => setNotificationPreferences({...notificationPreferences, actividades: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="gallery-notifications">Notificaciones de Galería</Label>
              <p className="text-sm text-muted-foreground">
                Aviso cuando se suban nuevas fotos de tus hijos
              </p>
            </div>
            <Switch
              id="gallery-notifications"
              checked={notificationPreferences.galeria}
              onCheckedChange={(checked) => setNotificationPreferences({...notificationPreferences, galeria: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="document-notifications">Notificaciones de Documentos</Label>
              <p className="text-sm text-muted-foreground">
                Alertas sobre documentos nuevos o que vencen pronto
              </p>
            </div>
            <Switch
              id="document-notifications"
              checked={notificationPreferences.documentos}
              onCheckedChange={(checked) => setNotificationPreferences({...notificationPreferences, documentos: checked})}
            />
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleSaveNotifications}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Preferencias
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

