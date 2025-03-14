"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarDays,
  Users,
  FileText,
  Settings,
  ClipboardList,
  FolderOpen,
  BookOpen,
  PiggyBank,
  Tent,
  MessageSquare,
} from "lucide-react"

export default function KraalDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!user || (user.role !== "kraal" && user.role !== "coordinador")) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Kraal</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user.name}. Gestiona tu sección y accede a los recursos del grupo.
        </p>
      </header>

      <Tabs defaultValue="seccion" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <TabsTrigger value="seccion">Mi Sección</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="actividades">Actividades</TabsTrigger>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="seccion" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Miembros
                </CardTitle>
                <CardDescription>Gestiona los miembros de tu sección</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver miembros</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comunicaciones
                </CardTitle>
                <CardDescription>Envía mensajes a las familias</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Gestionar comunicaciones</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Progresión
                </CardTitle>
                <CardDescription>Seguimiento de progresión personal</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver progresión</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Fichas de Actividad
                </CardTitle>
                <CardDescription>Gestiona las fichas de actividades</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver fichas</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Documentos Compartidos
                </CardTitle>
                <CardDescription>Accede a documentos del grupo</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver documentos</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recursos Educativos
                </CardTitle>
                <CardDescription>Material de apoyo y recursos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver recursos</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendario" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Calendario de Grupo
                </CardTitle>
                <CardDescription>Ver y gestionar eventos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Abrir calendario</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tent className="h-5 w-5" />
                  Campamentos
                </CardTitle>
                <CardDescription>Planificación de campamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver campamentos</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Planificación
                </CardTitle>
                <CardDescription>Gestiona las actividades</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Planificar actividades</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Presupuestos
                </CardTitle>
                <CardDescription>Gestión económica de actividades</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver presupuestos</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recursos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add resource management cards here */}
          </div>
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Ajustes de Perfil
                </CardTitle>
                <CardDescription>Gestiona tu cuenta</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Editar perfil</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

