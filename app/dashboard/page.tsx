import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  Calendar,
  FileText,
  MessageSquare,
  Package,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCog,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function KraalDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control - Kraal</h1>
        <p className="text-muted-foreground">Bienvenido al panel de control del Grupo Scout Osyris.</p>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="monitor">Vista Monitor</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Pendientes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 desde la semana pasada</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximas Actividades</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Próximos 7 días</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">153</div>
                <p className="text-xs text-muted-foreground">+5 desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensajes No Leídos</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">+3 desde ayer</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Próximas Actividades</CardTitle>
                <CardDescription>Calendario de eventos para los próximos días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingActivities.map((activity, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-14 text-center">
                        <div className="text-xl font-bold">{activity.day}</div>
                        <div className="text-xs text-muted-foreground">{activity.month}</div>
                      </div>
                      <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.time} • {activity.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={activity.status === "Confirmada" ? "default" : "outline"}>
                          {activity.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button asChild variant="outline">
                    <Link href="/aula-virtual/calendario">Ver calendario completo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Tareas Pendientes</CardTitle>
                <CardDescription>Tareas que requieren tu atención</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {task.priority === "Alta" ? (
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      ) : task.priority === "Media" ? (
                        <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-sm">{task.title}</p>
                          <Badge
                            variant={
                              task.priority === "Alta"
                                ? "destructive"
                                : task.priority === "Media"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground">Vence: {task.dueDate}</p>
                          <Button variant="ghost" size="sm">
                            Completar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Actividades</CardTitle>
              <CardDescription>Vista detallada de todas las actividades programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activitiesByMonth.map((month, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-lg mb-4">{month.name}</h3>
                    <div className="space-y-4">
                      {month.activities.map((activity, j) => (
                        <div key={j} className="flex items-start border-l-4 border-primary pl-4 pb-4">
                          <div className="w-14 text-center">
                            <div className="text-xl font-bold">{activity.day}</div>
                            <div className="text-xs text-muted-foreground">{month.shortName}</div>
                          </div>
                          <div className="ml-4 space-y-1 flex-1">
                            <p className="text-sm font-medium leading-none">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.time} • {activity.location}
                            </p>
                            <p className="text-sm mt-2">{activity.description}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant={activity.status === "Confirmada" ? "default" : "outline"}>
                              {activity.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              Ver detalles
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Recientes</CardTitle>
              <CardDescription>Últimos documentos subidos o actualizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center p-2 rounded-lg hover:bg-muted/50">
                    <FileText className="h-10 w-10 text-primary" />
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Subido por {doc.uploadedBy} • {doc.date}
                      </p>
                    </div>
                    <div className="ml-auto flex space-x-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button asChild variant="outline">
                  <Link href="/aula-virtual/documentos">Ver todos los documentos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCog className="mr-2 h-5 w-5" />
                Vista de Monitor
              </CardTitle>
              <CardDescription>Gestiona tus educandos y actividades específicas de tu sección</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Selecciona una de las siguientes opciones para gestionar tus responsabilidades como monitor:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <Users className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-medium">Mis Educandos</h3>
                        <p className="text-sm text-muted-foreground">Gestiona los educandos a tu cargo</p>
                        <Button asChild className="mt-2">
                          <Link href="/aula-virtual/monitor-view">Acceder</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <Calendar className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-medium">Actividades de Sección</h3>
                        <p className="text-sm text-muted-foreground">Planifica actividades para tu sección</p>
                        <Button asChild className="mt-2">
                          <Link href="/aula-virtual/actividades-seccion">Acceder</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <MessageSquare className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-medium">Comunicaciones</h3>
                        <p className="text-sm text-muted-foreground">Envía mensajes a familias y educandos</p>
                        <Button asChild className="mt-2">
                          <Link href="/aula-virtual/comunicaciones">Acceder</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
            <CardDescription>Estado actual del inventario de material</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryItems.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-muted-foreground mr-2" />
                      <span>{item.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${item.quantity < 5 ? "text-destructive" : "text-primary"}`}>
                      {item.quantity} disponibles
                    </span>
                  </div>
                  <Progress value={(item.quantity / item.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link href="/aula-virtual/inventario" >
                  Ver inventario completo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comunicaciones</CardTitle>
            <CardDescription>Últimas circulares y mensajes enviados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {communications.map((comm, i) => (
                <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                  <p className="font-medium text-sm">{comm.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Enviado por {comm.sender} • {comm.date}
                  </p>
                  <p className="text-sm mt-1 line-clamp-2">{comm.preview}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link href="/aula-virtual/comunicaciones" >
                  Ver todas las comunicaciones
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Miembros</CardTitle>
            <CardDescription>Resumen de miembros por sección</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sections.map((section, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-medium">{section.name}</span>
                  <span className="text-sm">{section.count} miembros</span>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>{sections.reduce((acc, section) => acc + section.count, 0)} miembros</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link href="/aula-virtual/miembros" >
                  Ver todos los miembros
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Mock data
const upcomingActivities = [
  {
    day: "15",
    month: "Jun",
    title: "Reunión Semanal",
    time: "17:00 - 19:00",
    location: "Local Scout",
    status: "Confirmada",
  },
  {
    day: "22",
    month: "Jun",
    title: "Salida de Fin de Semana",
    time: "09:00",
    location: "Sierra Norte",
    status: "Pendiente",
  },
  {
    day: "29",
    month: "Jun",
    title: "Preparación Campamento",
    time: "17:00 - 19:00",
    location: "Local Scout",
    status: "Confirmada",
  },
]

const pendingTasks = [
  {
    title: "Completar lista de material campamento",
    description: "Revisar y finalizar la lista de material necesario para el campamento de verano",
    priority: "Alta",
    dueDate: "15 Jun",
  },
  {
    title: "Confirmar reserva Sierra Norte",
    description: "Llamar para confirmar la reserva del albergue para la salida de fin de semana",
    priority: "Media",
    dueDate: "18 Jun",
  },
  {
    title: "Actualizar fichas médicas",
    description: "Revisar que todas las fichas médicas estén actualizadas antes del campamento",
    priority: "Baja",
    dueDate: "25 Jun",
  },
]

const activitiesByMonth = [
  {
    name: "Junio 2024",
    shortName: "Jun",
    activities: [
      {
        day: "15",
        title: "Reunión Semanal",
        time: "17:00 - 19:00",
        location: "Local Scout",
        description: "Actividades regulares de la sección con juegos y dinámicas.",
        status: "Confirmada",
      },
      {
        day: "22",
        title: "Salida de Fin de Semana",
        time: "09:00",
        location: "Sierra Norte",
        description: "Acampada de fin de semana con actividades de orientación y supervivencia.",
        status: "Pendiente",
      },
      {
        day: "29",
        title: "Preparación Campamento",
        time: "17:00 - 19:00",
        location: "Local Scout",
        description: "Reunión para preparar el material y las actividades del campamento de verano.",
        status: "Confirmada",
      },
    ],
  },
  {
    name: "Julio 2024",
    shortName: "Jul",
    activities: [
      {
        day: "15",
        title: "Campamento de Verano",
        time: "08:00",
        location: "Pirineos",
        description: "Campamento anual de verano con actividades de montaña, talleres y juegos.",
        status: "Confirmada",
      },
    ],
  },
]

const recentDocuments = [
  { name: "Autorización Campamento Verano.pdf", uploadedBy: "María García", date: "Hace 2 días" },
  { name: "Listado Lobatos 2024.xlsx", uploadedBy: "Carlos Rodríguez", date: "Hace 3 días" },
  { name: "Presupuesto Anual 2024.pdf", uploadedBy: "Ana Martínez", date: "Hace 5 días" },
  { name: "Planificación Actividades Junio.docx", uploadedBy: "Juan López", date: "Hace 1 semana" },
]

const inventoryItems = [
  { name: "Tiendas de campaña", quantity: 12, total: 15 },
  { name: "Hornillos", quantity: 8, total: 10 },
  { name: "Cuerdas (50m)", quantity: 4, total: 6 },
  { name: "Botiquines", quantity: 3, total: 5 },
]

const communications = [
  {
    title: "Información Campamento de Verano",
    sender: "María García",
    date: "Hace 3 días",
    preview:
      "Estimadas familias, os enviamos la información detallada sobre el campamento de verano que se realizará del 15 al 30 de julio en...",
  },
  {
    title: "Recordatorio Cuotas Trimestrales",
    sender: "Ana Martínez",
    date: "Hace 1 semana",
    preview:
      "Queridas familias, os recordamos que el plazo para el pago de las cuotas trimestrales finaliza el próximo viernes...",
  },
  {
    title: "Resumen Actividad Sierra Norte",
    sender: "Carlos Rodríguez",
    date: "Hace 2 semanas",
    preview:
      "Os compartimos algunas fotos y un breve resumen de la fantástica actividad que realizamos el pasado fin de semana...",
  },
]

const sections = [
  { name: "Castores", count: 15 },
  { name: "Lobatos", count: 37 },
  { name: "Tropa", count: 36 },
  { name: "Pioneros", count: 27 },
  { name: "Rutas", count: 21 },
  { name: "Kraal", count: 22 },
]

