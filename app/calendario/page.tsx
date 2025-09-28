"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, Users } from "lucide-react"

const activities = [
  {
    id: 1,
    title: "Reunión Castores",
    date: "2024-12-01",
    time: "16:00 - 17:30",
    location: "Local Scout",
    section: "Castores",
    type: "reunion"
  },
  {
    id: 2,
    title: "Actividad Tropa",
    date: "2024-12-03",
    time: "18:00 - 20:00",
    location: "Parque Municipal",
    section: "Tropa",
    type: "actividad"
  },
  {
    id: 3,
    title: "Campamento Pioneros",
    date: "2024-12-07",
    time: "Todo el día",
    location: "Casa de Campo",
    section: "Pioneros",
    type: "campamento"
  }
]

export default function CalendarioPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Calendario de Actividades</h1>
            <p className="text-lg text-muted-foreground">
              Próximas actividades del Grupo Scout Osyris
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      {activity.title}
                    </CardTitle>
                    <Badge variant={activity.type === 'campamento' ? 'destructive' : 'default'}>
                      {activity.section}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {activity.date} - {activity.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {activity.location}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Para más información sobre las actividades, contacta con los responsables de cada sección.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}