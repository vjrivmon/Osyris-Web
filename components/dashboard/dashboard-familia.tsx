import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, FileText, Bell, CreditCard, Users } from "lucide-react"
import Link from "next/link"
import { DocumentsList } from "./documents-list"
import { CalendarView } from "./calendar-view"
import { ChildrenList } from "./children-list"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface DashboardFamiliaProps {
  user: User
}

export default function DashboardFamilia({ user }: DashboardFamiliaProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user.name}</h1>
          <p className="text-muted-foreground">Panel de control para Familias - Gestiona la información de tus hijos</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 px-3 py-1">
            Familia
          </Badge>
          <Button asChild size="sm">
            <Link href="/dashboard/perfil">Editar perfil</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Hijos inscritos</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <div className="bg-accent/10 text-accent rounded-full p-3">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Documentos pendientes</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-sm font-medium text-muted-foreground mb-1">Pagos pendientes</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <div className="bg-destructive/10 text-destructive rounded-full p-3">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hijos" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="hijos">Mis Hijos</TabsTrigger>
          <TabsTrigger value="documentacion">Documentación</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="recordatorios">Recordatorios</TabsTrigger>
        </TabsList>

        <TabsContent value="hijos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mis Hijos</CardTitle>
              <CardDescription>Información sobre tus hijos y sus actividades</CardDescription>
            </CardHeader>
            <CardContent>
              <ChildrenList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentación</CardTitle>
              <CardDescription>Gestiona las autorizaciones y documentos de tus hijos</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Actividades</CardTitle>
              <CardDescription>Visualiza las actividades programadas para tus hijos</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recordatorios</CardTitle>
              <CardDescription>Recordatorios de pagos e inscripciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Recordatorios activos</h3>
                  </div>
                  <div className="divide-y">
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        <div className="bg-destructive/10 text-destructive rounded-full p-2 mt-0.5">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Pago Campamento de Verano</p>
                          <p className="text-sm text-muted-foreground">Fecha límite: 30/04/2025</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        <div className="bg-accent/10 text-accent rounded-full p-2 mt-0.5">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Inscripción Festival de Primavera</p>
                          <p className="text-sm text-muted-foreground">Fecha límite: 15/04/2025</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
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

