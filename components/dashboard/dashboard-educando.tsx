import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { CalendarView } from "./calendar-view"
import { TeamMembers } from "./team-members"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface DashboardEducandoProps {
  user: User
}

export default function DashboardEducando({ user }: DashboardEducandoProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user.name}</h1>
          <p className="text-muted-foreground">Panel de control para Educandos - Consulta tus actividades y equipo</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 px-3 py-1">
            Educando
          </Badge>
          <Button asChild size="sm">
            <Link href="/dashboard/perfil">Editar perfil</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Próximos eventos</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <div className="bg-accent-secondary/10 text-accent-secondary rounded-full p-3">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Miembros en tu equipo</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <div className="bg-secondary/10 text-secondary rounded-full p-3">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Estado documentación</p>
                <p className="text-2xl font-bold">Completa</p>
              </div>
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="eventos" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="equipo">Mi Equipo</TabsTrigger>
          <TabsTrigger value="documentacion">Documentación</TabsTrigger>
        </TabsList>

        <TabsContent value="eventos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Consulta los próximos eventos de tu sección</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Equipo</CardTitle>
              <CardDescription>Conoce a los miembros de tu equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMembers />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Documentación</CardTitle>
              <CardDescription>Verifica el estado de tu documentación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Documentos requeridos</h3>
                  </div>
                  <div className="divide-y">
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary rounded-full p-2 mt-0.5">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Autorización general</p>
                          <p className="text-sm text-muted-foreground">Subido: 15/01/2025</p>
                        </div>
                      </div>
                      <Badge>Completo</Badge>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary rounded-full p-2 mt-0.5">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Ficha médica</p>
                          <p className="text-sm text-muted-foreground">Subido: 15/01/2025</p>
                        </div>
                      </div>
                      <Badge>Completo</Badge>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary rounded-full p-2 mt-0.5">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Autorización de imágenes</p>
                          <p className="text-sm text-muted-foreground">Subido: 15/01/2025</p>
                        </div>
                      </div>
                      <Badge>Completo</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

