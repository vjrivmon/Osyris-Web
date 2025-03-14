"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, FileText, Tent } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.name}. Aquí puedes gestionar todas las actividades del grupo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">153</div>
            <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Actividades</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Próximos 30 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campamentos</CardTitle>
            <Tent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Planificados este año</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Actividades</CardTitle>
            <CardDescription>Actividades programadas para los próximos días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Reunión semanal</p>
                  <p className="text-sm text-muted-foreground">14 de marzo, 2025</p>
                </div>
                <Button size="sm" variant="outline">
                  Ver detalles
                </Button>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Festival Navidad</p>
                  <p className="text-sm text-muted-foreground">21 de diciembre, 2024</p>
                </div>
                <Button size="sm" variant="outline">
                  Ver detalles
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Campamento Aniversario</p>
                  <p className="text-sm text-muted-foreground">8-15 de febrero, 2025</p>
                </div>
                <Button size="sm" variant="outline">
                  Ver detalles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Link href="/dashboard/miembros">
                  <Users className="h-6 w-6 mb-1" />
                  <span>Miembros</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Link href="/dashboard/calendario">
                  <CalendarDays className="h-6 w-6 mb-1" />
                  <span>Calendario</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Link href="/dashboard/documentos">
                  <FileText className="h-6 w-6 mb-1" />
                  <span>Documentos</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Link href="/dashboard/campamentos">
                  <Tent className="h-6 w-6 mb-1" />
                  <span>Campamentos</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

