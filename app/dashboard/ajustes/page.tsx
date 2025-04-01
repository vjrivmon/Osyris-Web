"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Upload } from "lucide-react"

export default function SettingsPage() {
  // Perfil
  const [profileData, setProfileData] = useState({
    name: "María García",
    email: "maria.garcia@osyris.org",
    phone: "600123456",
    bio: "Coordinadora de Lobatos en el Grupo Scout Osyris desde 2018.",
    avatar: "/placeholder.svg?height=128&width=128",
  })

  // Notificaciones
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    activitySummary: true,
    upcomingEvents: true,
    newMessages: true,
    documentUpdates: false,
  })

  // Seguridad
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Privacidad
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "all",
    contactInfo: "members",
    activityLog: true,
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Perfil actualizado",
      description: "Tu información de perfil ha sido actualizada correctamente.",
    })
  }

  const handleNotificationsUpdate = () => {
    toast({
      title: "Preferencias de notificaciones actualizadas",
      description: "Tus preferencias de notificaciones han sido guardadas.",
    })
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }

    if (securityData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres.",
        variant: "destructive",
      })
      return
    }

    // Reset form
    setSecurityData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    toast({
      title: "Contraseña actualizada",
      description: "Tu contraseña ha sido actualizada correctamente.",
    })
  }

  const handlePrivacyUpdate = () => {
    toast({
      title: "Configuración de privacidad actualizada",
      description: "Tus preferencias de privacidad han sido guardadas.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">Gestiona tu perfil, preferencias y configuración de la cuenta.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="privacy">Privacidad</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Gestiona tu información personal y de contacto.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={profileData.avatar} alt={profileData.name} />
                      <AvatarFallback>{getInitials(profileData.name)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Cambiar foto
                    </Button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Guardar cambios</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Configura cómo y cuándo quieres recibir notificaciones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Canales de notificación</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Notificaciones por email</Label>
                      <p className="text-sm text-muted-foreground">Recibe notificaciones en tu correo electrónico.</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Notificaciones push</Label>
                      <p className="text-sm text-muted-foreground">Recibe notificaciones en tu navegador.</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tipos de notificaciones</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="activity-summary">Resumen de actividad</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe un resumen semanal de la actividad del grupo.
                      </p>
                    </div>
                    <Switch
                      id="activity-summary"
                      checked={notifications.activitySummary}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, activitySummary: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="upcoming-events">Próximos eventos</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe recordatorios de próximos eventos y actividades.
                      </p>
                    </div>
                    <Switch
                      id="upcoming-events"
                      checked={notifications.upcomingEvents}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, upcomingEvents: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-messages">Nuevos mensajes</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe notificaciones cuando recibas nuevos mensajes.
                      </p>
                    </div>
                    <Switch
                      id="new-messages"
                      checked={notifications.newMessages}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, newMessages: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="document-updates">Actualizaciones de documentos</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe notificaciones cuando se actualicen documentos importantes.
                      </p>
                    </div>
                    <Switch
                      id="document-updates"
                      checked={notifications.documentUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, documentUpdates: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationsUpdate}>Guardar preferencias</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Gestiona tu contraseña y la seguridad de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Cambiar contraseña</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Contraseña actual</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nueva contraseña</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Cambiar contraseña</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacidad</CardTitle>
              <CardDescription>Configura quién puede ver tu información y cómo se utiliza.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Visibilidad del perfil</h3>
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">¿Quién puede ver tu perfil?</Label>
                  <Select
                    value={privacySettings.profileVisibility}
                    onValueChange={(value) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}
                  >
                    <SelectTrigger id="profile-visibility">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los miembros</SelectItem>
                      <SelectItem value="kraal">Solo Kraal</SelectItem>
                      <SelectItem value="section">Solo mi sección</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información de contacto</h3>
                <div className="space-y-2">
                  <Label htmlFor="contact-info">¿Quién puede ver tu información de contacto?</Label>
                  <Select
                    value={privacySettings.contactInfo}
                    onValueChange={(value) => setPrivacySettings({ ...privacySettings, contactInfo: value })}
                  >
                    <SelectTrigger id="contact-info">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="members">Todos los miembros</SelectItem>
                      <SelectItem value="kraal">Solo Kraal</SelectItem>
                      <SelectItem value="none">Nadie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Registro de actividad</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activity-log">Registro de actividad</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que se registre tu actividad en la plataforma para mejorar la experiencia.
                    </p>
                  </div>
                  <Switch
                    id="activity-log"
                    checked={privacySettings.activityLog}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, activityLog: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePrivacyUpdate}>Guardar configuración</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

