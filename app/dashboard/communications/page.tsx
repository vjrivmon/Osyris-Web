"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Filter, PenSquare, Search, Send } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export default function CommunicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMessages = messages.filter(
    (message) =>
      message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.recipients.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Comunicaciones</h1>
        <p className="text-muted-foreground">Gestiona todas las comunicaciones del grupo scout.</p>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="compose">Redactar</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar mensajes..."
                className="pl-8 w-[200px] sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Mensajes Enviados</CardTitle>
              <CardDescription>Historial de mensajes y circulares enviados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMessages.map((message, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex-shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={message.avatar} alt={message.sender} />
                        <AvatarFallback>{getInitials(message.sender)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="font-semibold text-lg">{message.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{message.type}</Badge>
                          <span className="text-sm text-muted-foreground">{message.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        De: {message.sender} • Para: {message.recipients}
                      </p>
                      <p className="text-sm line-clamp-2">{message.content}</p>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          Reenviar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Redactar Nuevo Mensaje</CardTitle>
              <CardDescription>Crea y envía un nuevo mensaje o circular</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="message-type" className="text-sm font-medium">
                  Tipo de mensaje
                </label>
                <Select defaultValue="circular">
                  <SelectTrigger id="message-type">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circular">Circular</SelectItem>
                    <SelectItem value="announcement">Anuncio</SelectItem>
                    <SelectItem value="reminder">Recordatorio</SelectItem>
                    <SelectItem value="summary">Resumen de Actividad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="recipients" className="text-sm font-medium">
                  Destinatarios
                </label>
                <Select defaultValue="all">
                  <SelectTrigger id="recipients">
                    <SelectValue placeholder="Selecciona los destinatarios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="families">Familias</SelectItem>
                    <SelectItem value="kraal">Kraal</SelectItem>
                    <SelectItem value="committee">Comité</SelectItem>
                    <SelectItem value="castores">Familias Castores</SelectItem>
                    <SelectItem value="lobatos">Familias Lobatos</SelectItem>
                    <SelectItem value="scouts">Familias Scouts</SelectItem>
                    <SelectItem value="escultas">Familias Escultas</SelectItem>
                    <SelectItem value="rovers">Familias Rovers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Asunto
                </label>
                <Input id="subject" placeholder="Introduce el asunto del mensaje" />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Contenido
                </label>
                <Textarea id="content" placeholder="Escribe el contenido del mensaje..." className="min-h-[200px]" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Adjuntos</label>
                <div className="border border-dashed rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <PenSquare className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra y suelta archivos aquí o haz clic para seleccionar
                    </p>
                    <Button variant="outline" size="sm">
                      Seleccionar Archivos
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="send-copy" />
                <label htmlFor="send-copy" className="text-sm font-medium">
                  Enviarme una copia
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Guardar como borrador</Button>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensaje
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Mensajes</CardTitle>
              <CardDescription>Plantillas predefinidas para comunicaciones frecuentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template, i) => (
                  <div key={i} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{template.description}</p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button size="sm">Usar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Mock data
const messages = [
  {
    title: "Información Campamento de Verano",
    sender: "María García",
    recipients: "Todas las Familias",
    date: "Hace 3 días",
    type: "Circular",
    content:
      "Estimadas familias, os enviamos la información detallada sobre el campamento de verano que se realizará del 15 al 30 de julio en los Pirineos. Adjuntamos la autorización que deberéis entregar firmada antes del 15 de junio, así como la lista de material necesario y el programa de actividades previsto.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    title: "Recordatorio Cuotas Trimestrales",
    sender: "Ana Martínez",
    recipients: "Todas las Familias",
    date: "Hace 1 semana",
    type: "Recordatorio",
    content:
      "Queridas familias, os recordamos que el plazo para el pago de las cuotas trimestrales finaliza el próximo viernes 10 de junio. Podéis realizar el pago mediante transferencia bancaria a la cuenta habitual indicando el nombre del educando y la sección a la que pertenece.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    title: "Resumen Actividad Sierra Norte",
    sender: "Carlos Rodríguez",
    recipients: "Familias Scouts",
    date: "Hace 2 semanas",
    type: "Resumen",
    content:
      "Os compartimos algunas fotos y un breve resumen de la fantástica actividad que realizamos el pasado fin de semana en la Sierra Norte. Los chicos y chicas disfrutaron de actividades de orientación, construcciones con madera y una velada nocturna con historias de aventuras. Estamos muy contentos con su participación y entusiasmo.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    title: "Convocatoria Reunión Kraal",
    sender: "Ana Martínez",
    recipients: "Kraal",
    date: "Hace 3 semanas",
    type: "Anuncio",
    content:
      "Convocamos a todo el Kraal a la reunión mensual que tendrá lugar el próximo viernes 20 de mayo a las 20:00h en el local. Trataremos temas importantes como la planificación del campamento de verano y la evaluación del trimestre. Se ruega puntualidad y confirmación de asistencia.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    title: "Información Salida Fin de Semana Lobatos",
    sender: "María García",
    recipients: "Familias Lobatos",
    date: "Hace 1 mes",
    type: "Circular",
    content:
      "Queridas familias de la Manada, os informamos sobre la próxima salida de fin de semana que realizaremos los días 3 y 4 de junio en el albergue 'El Pinar'. Adjuntamos la autorización, información sobre el lugar, horarios de salida y regreso, así como la lista de material necesario.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const templates = [
  {
    name: "Circular Campamento",
    type: "Circular",
    description:
      "Plantilla para informar sobre los detalles de un campamento, incluyendo fechas, lugar, material necesario y programa de actividades.",
  },
  {
    name: "Recordatorio Cuotas",
    type: "Recordatorio",
    description:
      "Plantilla para recordar a las familias el pago de las cuotas trimestrales o anuales, incluyendo información sobre métodos de pago y plazos.",
  },
  {
    name: "Resumen de Actividad",
    type: "Resumen",
    description:
      "Plantilla para compartir un resumen y fotos de una actividad realizada, destacando los aspectos más relevantes y agradeciendo la participación.",
  },
  {
    name: "Convocatoria Reunión",
    type: "Anuncio",
    description:
      "Plantilla para convocar a una reunión, especificando fecha, hora, lugar, orden del día y solicitando confirmación de asistencia.",
  },
  {
    name: "Información Salida",
    type: "Circular",
    description:
      "Plantilla para informar sobre una salida de un día o fin de semana, incluyendo detalles logísticos y material necesario.",
  },
  {
    name: "Bienvenida Nuevas Familias",
    type: "Circular",
    description:
      "Plantilla para dar la bienvenida a nuevas familias que se incorporan al grupo, incluyendo información básica y contactos importantes.",
  },
]

