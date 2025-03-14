import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, FileText, Users, Landmark } from "lucide-react"
import Link from "next/link"
import { DocumentsList } from "./documents-list"
import { CalendarView } from "./calendar-view"
import { MembersList } from "./members-list"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface DashboardComiteProps {
  user: User
}

export default function DashboardComite({ user }: DashboardComiteProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user.name}</h1>
          <p className="text-muted-foreground">Panel de control para Comité - Gestiona la administración del grupo</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-accent-tertiary/10 text-accent-tertiary border-accent-tertiary/20 px-3 py-1"
          >
            Comité
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
                <p className="text-sm font-medium text-muted-foreground mb-1">Total miembros</p>
                <p className="text-2xl font-bold">87</p>
              </div>
              <div className="bg-accent-tertiary/10 text-accent-tertiary rounded-full p-3">
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
                <p className="text-2xl font-bold">5</p>
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
                <p className="text-sm font-medium text-muted-foreground mb-1">Subvenciones</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documentacion" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="documentacion">Documentación</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="miembros">Miembros</TabsTrigger>
        </TabsList>

        <TabsContent value="documentacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentación Administrativa</CardTitle>
              <CardDescription>Gestiona la documentación administrativa del grupo</CardDescription>
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

        <TabsContent value="miembros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listado de Miembros</CardTitle>
              <CardDescription>Visualiza todos los miembros del grupo</CardDescription>
            </CardHeader>
            <CardContent>
              <MembersList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

