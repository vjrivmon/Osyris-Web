import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar, FileText, MessageSquare, Package, Users, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function MonitorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control - Monitor</h1>
        <p className="text-muted-foreground">Bienvenido al panel de control para monitores del Grupo Scout Osyris.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Educandos a cargo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Sección Lobatos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Actividades</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">En los próximos 7 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes No Leídos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">De familias y coordinación</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Requieren tu atención</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="educandos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="educandos">Mis Educandos</TabsTrigger>
          <TabsTrigger value="actividades">Actividades</TabsTrigger>
          <TabsTrigger value="comunicaciones">Comunicaciones</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="educandos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Educandos a mi cargo</CardTitle>
              <CardDescription>Listado de educandos de la sección Lobatos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {educandos.map((educando, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={educando.avatar} alt={educando.name} />
                        <AvatarFallback>{getInitials(educando.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-bold">{educando.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="badge-manada">
                            Lobatos
                          </Badge>
                          <span className="text-sm text-muted-foreground">{educando.age} años</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 md:border-l md:pl-4 mt-4 md:mt-0">
                      <h4 className="font-medium mb-2">Progresión</h4>
                      <p className="text-sm text-muted-foreground mb-2">{educando.progression}</p>
                      <div className="flex flex-wrap gap-2">
                        {educando.badges.map((badge, j) => (
                          <Badge key={j} variant="secondary" className="rounded-full">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="md:border-l md:pl-4 mt-4 md:mt-0">
                      <h4 className="font-medium mb-2">Documentación</h4>
                      <ul className="text-sm space-y-1">
                        {educando.documents.map((doc, j) => (
                          <li key={j} className="flex items-center gap-2">
                            {doc.completed ? (
                              <Badge variant="success" className="rounded-full">
                                Completado
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="rounded-full">
                                Pendiente
                              </Badge>
                            )}
                            <span>{doc.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-2 justify-center mt-4 md:mt-0">
                      <Button variant="outline" size="sm">
                        Ver perfil
                      </Button>
                      <Button variant="outline" size="sm">
                        Contactar familia
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actividades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Actividades</CardTitle>
              <CardDescription>Actividades programadas para tu sección</CardDescription>
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
                    <div className="ml-auto flex space-x-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button asChild variant="outline">
                  <Link href="/dashboard/monitor/calendario">Ver calendario completo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planificar Nueva Actividad</CardTitle>
              <CardDescription>Crea una nueva actividad para tu sección</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="activity-title" className="text-sm font-medium">
                      Título
                    </label>
                    <input
                      id="activity-title"
                      className="w-full p-2 border rounded-md"
                      placeholder="Título de la actividad"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="activity-date" className="text-sm font-medium">
                      Fecha
                    </label>
                    <input id="activity-date" type="date" className="w-full p-2 border rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="activity-time" className="text-sm font-medium">
                      Hora
                    </label>
                    <input id="activity-time" type="time" className="w-full p-2 border rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="activity-location" className="text-sm font-medium">
                      Ubicación
                    </label>
                    <input
                      id="activity-location"
                      className="w-full p-2 border rounded-md"
                      placeholder="Ubicación de la actividad"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="activity-description" className="text-sm font-medium">
                    Descripción
                  </label>
                  <textarea
                    id="activity-description"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    placeholder="Descripción de la actividad"
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <Button>Crear Actividad</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes Recibidos</CardTitle>
              <CardDescription>Comunicaciones de familias y coordinación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div key={i} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{message.title}</h3>
                      <Badge variant="outline">{message.date}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      De: {message.from} • {message.type}
                    </p>
                    <p className="text-sm mb-4">{message.preview}</p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Leer mensaje completo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enviar Comunicación</CardTitle>
              <CardDescription>Envía un mensaje a las familias o a la coordinación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="message-recipients" className="text-sm font-medium">
                  Destinatarios
                </label>
                <select id="message-recipients" className="w-full p-2 border rounded-md">
                  <option value="all-families">Todas las familias de Lobatos</option>
                  <option value="specific-family">Familia específica</option>
                  <option value="coordination">Coordinación</option>
                  <option value="all-monitors">Todos los monitores</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="message-subject" className="text-sm font-medium">
                  Asunto
                </label>
                <input id="message-subject" className="w-full p-2 border rounded-md" placeholder="Asunto del mensaje" />
              </div>
              <div className="space-y-2">
                <label htmlFor="message-content" className="text-sm font-medium">
                  Mensaje
                </label>
                <textarea
                  id="message-content"
                  className="w-full p-2 border rounded-md min-h-[150px]"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adjuntos</label>
                <div className="border border-dashed rounded-md p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Arrastra y suelta archivos aquí o haz clic para seleccionar
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Seleccionar archivos
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Enviar Mensaje</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos de la Sección</CardTitle>
              <CardDescription>Documentos relacionados con tu sección</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center p-2 rounded-lg hover:bg-muted/50">
                    <FileText className="h-10 w-10 text-primary" />
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.category} • Actualizado: {doc.date}
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
              <div className="mt-4 text-center">
                <Button asChild variant="outline">
                  <Link href="/dashboard/monitor/documentos">Ver todos los documentos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subir Nuevo Documento</CardTitle>
              <CardDescription>Sube un nuevo documento para tu sección</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="document-name" className="text-sm font-medium">
                    Nombre del documento
                  </label>
                  <input
                    id="document-name"
                    className="w-full p-2 border rounded-md"
                    placeholder="Nombre del documento"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="document-category" className="text-sm font-medium">
                    Categoría
                  </label>
                  <select id="document-category" className="w-full p-2 border rounded-md">
                    <option value="planning">Planificación</option>
                    <option value="activities">Actividades</option>
                    <option value="evaluations">Evaluaciones</option>
                    <option value="authorizations">Autorizaciones</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="document-description" className="text-sm font-medium">
                    Descripción
                  </label>
                  <textarea
                    id="document-description"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    placeholder="Descripción del documento"
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Archivo</label>
                  <div className="border border-dashed rounded-md p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Arrastra y suelta un archivo aquí o haz clic para seleccionar
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Seleccionar archivo
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Subir Documento</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventario de Material</CardTitle>
            <CardDescription>Material disponible para actividades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-muted-foreground mr-2" />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${item.quantity < 5 ? "text-red-500" : "text-green-500"}`}>
                      {item.quantity} disponibles
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link href="/dashboard/monitor/inventario" >
                  Ver inventario completo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Avisos importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Reunión de Kraal</AlertTitle>
                <AlertDescription>Próxima reunión de Kraal: Viernes 15 de junio a las 20:00h</AlertDescription>
              </Alert>
              <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Campamento</AlertTitle>
                <AlertDescription>
                  Fecha límite para entregar planificaciones del campamento: 20 de junio
                </AlertDescription>
              </Alert>
              <div className="mt-4 text-center">
                <Button variant="outline" className="w-full">
                  Ver todas las notificaciones
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Mock data
const educandos = [
  {
    name: "Pablo Navarro",
    age: 9,
    progression: "Etapa de Participación",
    badges: ["Naturaleza", "Expresión"],
    avatar: "/placeholder.svg?height=100&width=100",
    documents: [
      { name: "Ficha médica", completed: true },
      { name: "Autorización de imágenes", completed: true },
      { name: "Autorización campamento", completed: false },
    ],
  },
  {
    name: "Sofía Moreno",
    age: 8,
    progression: "Etapa de Integración",
    badges: ["Creatividad"],
    avatar: "/placeholder.svg?height=100&width=100",
    documents: [
      { name: "Ficha médica", completed: true },
      { name: "Autorización de imágenes", completed: true },
      { name: "Autorización campamento", completed: false },
    ],
  },
  {
    name: "Daniel Jiménez",
    age: 9,
    progression: "Etapa de Participación",
    badges: ["Deporte", "Naturaleza"],
    avatar: "/placeholder.svg?height=100&width=100",
    documents: [
      { name: "Ficha médica", completed: true },
      { name: "Autorización de imágenes", completed: false },
      { name: "Autorización campamento", completed: false },
    ],
  },
]

const upcomingActivities = [
  {
    day: "15",
    month: "Jun",
    title: "Reunión Semanal",
    time: "17:00 - 19:00",
    location: "Local Scout",
  },
  {
    day: "22",
    month: "Jun",
    title: "Salida de Fin de Semana",
    time: "09:00",
    location: "Sierra Norte",
  },
  {
    day: "29",
    month: "Jun",
    title: "Preparación Campamento",
    time: "17:00 - 19:00",
    location: "Local Scout",
  },
]

const messages = [
  {
    title: "Consulta sobre actividad",
    from: "Ana Martínez (Familia de Pablo)",
    date: "Hace 2 días",
    type: "Consulta",
    preview:
      "Hola, quería consultar si para la salida del fin de semana es necesario llevar saco de dormir o se duerme en camas. Gracias de antemano.",
  },
  {
    title: "Autorización pendiente",
    from: "Coordinación de Grupo",
    date: "Hace 3 días",
    type: "Recordatorio",
    preview:
      "Recordamos que hay varias familias que aún no han entregado la autorización para el campamento de verano. Por favor, contacta con ellas para recordárselo.",
  },
  {
    title: "Material para actividad",
    from: "Carlos Rodríguez (Coordinador de Materiales)",
    date: "Hace 1 semana",
    type: "Información",
    preview:
      "Te confirmo que ya está reservado el material que solicitaste para la actividad del próximo sábado. Puedes pasar a recogerlo el viernes por la tarde.",
  },
]

const documents = [
  {
    name: "Planificación Trimestral Lobatos.pdf",
    category: "Planificación",
    date: "10/05/2025",
  },
  {
    name: "Listado Lobatos 2025.xlsx",
    category: "Listados",
    date: "15/05/2025",
  },
  {
    name: "Autorización Salida Sierra Norte.pdf",
    category: "Autorizaciones",
    date: "20/05/2025",
  },
  {
    name: "Evaluación Actividades Abril.docx",
    category: "Evaluaciones",
    date: "05/05/2025",
  },
]

const inventoryItems = [
  { name: "Pelotas", quantity: 10 },
  { name: "Cuerdas", quantity: 8 },
  { name: "Pañuelos para juegos", quantity: 15 },
  { name: "Material de manualidades", quantity: 4 },
]

