"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Megaphone, Mail } from "lucide-react"

export default function CampaignsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Campañas</h1>
        <p className="text-muted-foreground">
          Gestión de campañas de comunicación y marketing
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Campañas de Email
            </CardTitle>
            <CardDescription>
              Crea y gestiona campañas de email marketing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Módulo de Campañas en desarrollo
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Próximamente: Plantillas, segmentación y automatización
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Campañas Scout
            </CardTitle>
            <CardDescription>
              Gestiona actividades y eventos especiales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Módulo de Campañas en desarrollo
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Próximamente: Eventos, inscripciones y seguimiento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Comunicaciones
            </CardTitle>
            <CardDescription>
              Gestiona notificaciones y comunicados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Módulo de Campañas en desarrollo
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Próximamente: SMS, push y notificaciones internas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}