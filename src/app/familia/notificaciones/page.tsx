'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Mail, MessageSquare } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export default function NotificacionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
        <p className="text-muted-foreground mt-2">
          Configura tus preferencias de notificaciones
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferencias de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Notificaciones por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones importantes en tu correo electrónico
              </p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="activity-notifications">Notificaciones de Actividades</Label>
              <p className="text-sm text-muted-foreground">
                Alertas sobre nuevas actividades y eventos
              </p>
            </div>
            <Switch id="activity-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="gallery-notifications">Notificaciones de Galería</Label>
              <p className="text-sm text-muted-foreground">
                Aviso cuando se suban nuevas fotos de tus hijos
              </p>
            </div>
            <Switch id="gallery-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="document-notifications">Notificaciones de Documentos</Label>
              <p className="text-sm text-muted-foreground">
                Alertas sobre documentos nuevos o que vencen pronto
              </p>
            </div>
            <Switch id="document-notifications" defaultChecked />
          </div>

          <div className="pt-4 border-t">
            <Button>Guardar Preferencias</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
