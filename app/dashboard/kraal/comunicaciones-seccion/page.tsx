import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, Paperclip, Send } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ComunicacionesSeccionPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Comunicaciones</h1>
        <p className="text-muted-foreground">Gestiona las comunicaciones con familias y educandos</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar mensaje..." className="pl-8" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Mensaje
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes Recibidos</CardTitle>
              <CardDescription>Comunicaciones de familias y coordinación</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={`p-4 hover:bg-muted/50 cursor-pointer ${message.unread ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={message.avatar} alt={message.from} />
                          <AvatarFallback>{getInitials(message.from)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium text-sm">{message.from}</h3>
                      </div>
                      <span className="text-xs text-muted-foreground">{message.date}</span>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{message.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{message.preview}</p>
                    <div className="flex items-center mt-2">
                      {message.unread && (
                        <Badge variant="default" className="mr-2">
                          Nuevo
                        </Badge>
                      )}
                      <Badge variant="outline">{message.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Enviar Comunicación</CardTitle>
              <CardDescription>Envía un mensaje a las familias o a la coordinación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="message-recipients">Destinatarios</Label>
                <Select>
                  <SelectTrigger id="message-recipients">
                    <SelectValue placeholder="Selecciona destinatarios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-families">Todas las familias de Lobatos</SelectItem>
                    <SelectItem value="specific-family">Familia específica</SelectItem>
                    <SelectItem value="coordination">Coordinación</SelectItem>
                    <SelectItem value="all-monitors">Todos los monitores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message-subject">Asunto</Label>
                <Input id="message-subject" placeholder="Asunto del mensaje" />
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="message-content">Mensaje</Label>
                <Textarea
                  id="message-content"
                  placeholder="Escribe tu mensaje aquí..."
                  className="min-h-[200px] flex-1"
                />
              </div>
              <div className="space-y-2">
                <Label>Adjuntos</Label>
                <div className="border border-dashed rounded-md p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Arrastra y suelta archivos aquí o haz clic para seleccionar
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Paperclip className="mr-2 h-4 w-4" />
                    Seleccionar archivos
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Paperclip className="mr-2 h-4 w-4" />
                <span>Sin archivos adjuntos</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Guardar borrador</Button>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensaje
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="recibidos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recibidos">Recibidos</TabsTrigger>
          <TabsTrigger value="enviados">Enviados</TabsTrigger>
          <TabsTrigger value="borradores">Borradores</TabsTrigger>
          <TabsTrigger value="archivados">Archivados</TabsTrigger>
        </TabsList>

        <TabsContent value="recibidos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes Recibidos</CardTitle>
              <CardDescription>Historial de mensajes recibidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div key={i} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={message.avatar} alt={message.from} />
                          <AvatarFallback>{getInitials(message.from)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium">{message.from}</h3>
                      </div>
                      <Badge variant="outline">{message.date}</Badge>
                    </div>
                    <h4 className="font-semibold mb-2">{message.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{message.preview}</p>
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
        </TabsContent>

        <TabsContent value="enviados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes Enviados</CardTitle>
              <CardDescription>Historial de mensajes enviados</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido de mensajes enviados</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borradores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Borradores</CardTitle>
              <CardDescription>Mensajes guardados como borrador</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido de borradores</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archivados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes Archivados</CardTitle>
              <CardDescription>Mensajes guardados en archivo</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido de mensajes archivados</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
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
const messages = [
  {
    from: "Ana Martínez (Familia de Pablo)",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "Hace 2 días",
    title: "Consulta sobre actividad",
    type: "Consulta",
    preview:
      "Hola, quería consultar si para la salida del fin de semana es necesario llevar saco de dormir o se duerme en camas. Gracias de antemano.",
    unread: true,
  },
  {
    from: "Coordinación de Grupo",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "Hace 3 días",
    title: "Autorización pendiente",
    type: "Recordatorio",
    preview:
      "Recordamos que hay varias familias que aún no han entregado la autorización para el campamento de verano. Por favor, contacta con ellas para recordárselo.",
    unread: true,
  },
  {
    from: "Carlos Rodríguez (Coordinador de Materiales)",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "Hace 1 semana",
    title: "Material para actividad",
    type: "Información",
    preview:
      "Te confirmo que ya está reservado el material que solicitaste para la actividad del próximo sábado. Puedes pasar a recogerlo el viernes por la tarde.",
    unread: false,
  },
  {
    from: "María López (Familia de Sofía)",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "Hace 1 semana",
    title: "Alergias alimentarias",
    type: "Importante",
    preview:
      "Quería recordarte que mi hija Sofía tiene alergia a los frutos secos. Por favor, tenedlo en cuenta para las meriendas de las próximas reuniones.",
    unread: false,
  },
  {
    from: "Javier Sánchez (Tesorero)",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "Hace 2 semanas",
    title: "Presupuesto campamento",
    type: "Administración",
    preview:
      "Necesito que me envíes el presupuesto detallado para las actividades de tu sección en el campamento de verano antes del viernes.",
    unread: false,
  },
]

