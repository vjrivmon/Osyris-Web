import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, FileText, Users, MessageSquare, AlertCircle } from "lucide-react"
import Link from "next/link"
import { EducandosList } from "./educandos-list"
import { DocumentsList } from "./documents-list"
import { CalendarView } from "./calendar-view"
import { InventoryList } from "./inventory-list"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface DashboardKraalProps {
  user: User
}

export default function DashboardKraal({ user }: DashboardKraalProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user.name}</h1>
          <p className="text-muted-foreground">Panel de control para Kraal - Gestiona tu sección y responsabilidades</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
            Kraal
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
                <p className="text-sm font-medium text-muted-foreground mb-1">Educandos</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="bg-primary/10 text-primary rounded-full p-3">
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
                <p className="text-2xl font-bold">7</p>
              </div>
              <div className="bg-accent/10 text-accent rounded-full p-3">
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
                <p className="text-2xl font-bold">3</p>
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
                <p className="text-sm font-medium text-muted-foreground mb-1">Alertas</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <div className="bg-destructive/10 text-destructive rounded-full p-3">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="educandos" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="educandos">Educandos</TabsTrigger>
          <TabsTrigger value="documentacion">Documentación</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="comunicacion">Comunicación</TabsTrigger>
        </TabsList>

        <TabsContent value="educandos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listado de Educandos</CardTitle>
              <CardDescription>Gestiona los educandos de tu sección y sus datos</CardDescription>
            </CardHeader>
            <CardContent>
              <EducandosList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentación</CardTitle>
              <CardDescription>Gestiona las autorizaciones y documentos de tu sección</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Eventos</CardTitle>
              <CardDescription>Visualiza y gestiona los eventos programados</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventario del Material</CardTitle>
              <CardDescription>Gestiona el inventario del material del zulo</CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comunicación</CardTitle>
              <CardDescription>Envía circulares, mensajes y anuncios a las familias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild>
                  <Link href="/dashboard/comunicacion/nueva">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Nueva comunicación
                  </Link>
                </Button>

                <div className="border rounded-lg">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Comunicaciones recientes</h3>
                  </div>
                  <div className="divide-y">
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Circular Campamento de Verano</p>
                        <p className="text-sm text-muted-foreground">Enviado: 12/03/2025</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Recordatorio Salida de Sección</p>
                        <p className="text-sm text-muted-foreground">Enviado: 05/03/2025</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Información Festival de Primavera</p>
                        <p className="text-sm text-muted-foreground">Enviado: 28/02/2025</p>
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

