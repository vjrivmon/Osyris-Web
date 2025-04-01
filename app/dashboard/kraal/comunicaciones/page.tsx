"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Filter, PenSquare, Search, Send, Trash2, Eye, Copy } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function CommunicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState(initialMessages)
  const [templates, setTemplates] = useState(initialTemplates)

  // Form states
  const [messageType, setMessageType] = useState("circular")
  const [recipients, setRecipients] = useState("all")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [sendCopy, setSendCopy] = useState(false)

  // Template form states
  const [templateName, setTemplateName] = useState("")
  const [templateType, setTemplateType] = useState("circular")
  const [templateDescription, setTemplateDescription] = useState("")
  const [templateContent, setTemplateContent] = useState("")

  const filteredMessages = messages.filter(
    (message) =>
      message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.recipients.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (!subject || !content) {
      toast({
        title: "Error",
        description: "El asunto y el contenido son obligatorios.",
        variant: "destructive",
      })
      return
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      title: subject,
      sender: "María García",
      recipients: getRecipientsText(recipients),
      date: "Justo ahora",
      type: messageType,
      content: content,
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setMessages([newMessage, ...messages])

    // Reset form
    setSubject("")
    setContent("")
    setSendCopy(false)

    toast({
      title: "Mensaje enviado",
      description: "El mensaje ha sido enviado correctamente.",
    })
  }

  const handleSaveTemplate = () => {
    if (!templateName || !templateContent) {
      toast({
        title: "Error",
        description: "El nombre y el contenido de la plantilla son obligatorios.",
        variant: "destructive",
      })
      return
    }

    const newTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      type: templateType,
      description: templateDescription,
      content: templateContent,
    }

    setTemplates([...templates, newTemplate])

    // Reset form
    setTemplateName("")
    setTemplateType("circular")
    setTemplateDescription("")
    setTemplateContent("")

    toast({
      title: "Plantilla guardada",
      description: "La plantilla ha sido guardada correctamente.",
    })
  }

  const handleDeleteMessage = (id) => {
    setMessages(messages.filter((message) => message.id !== id))
    toast({
      title: "Mensaje eliminado",
      description: "El mensaje ha sido eliminado correctamente.",
    })
  }

  const handleDeleteTemplate = (id) => {
    setTemplates(templates.filter((template) => template.id !== id))
    toast({
      title: "Plantilla eliminada",
      description: "La plantilla ha sido eliminada correctamente.",
    })
  }

  const useTemplate = useCallback(
    (template) => {
      setMessageType(template.type)
      setContent(template.content)
      toast({
        title: "Plantilla aplicada",
        description: "La plantilla ha sido aplicada al mensaje.",
      })
    },
    [setContent, setMessageType],
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
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 group"
                    >
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>{message.title}</DialogTitle>
                                <DialogDescription>
                                  De: {message.sender} • Para: {message.recipients} • {message.date}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{message.content}</div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Reenviar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron mensajes que coincidan con tu búsqueda.
                  </div>
                )}
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
                <Label htmlFor="message-type" className="text-sm font-medium">
                  Tipo de mensaje
                </Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger id="message-type">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circular">Circular</SelectItem>
                    <SelectItem value="anuncio">Anuncio</SelectItem>
                    <SelectItem value="recordatorio">Recordatorio</SelectItem>
                    <SelectItem value="resumen">Resumen de Actividad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients" className="text-sm font-medium">
                  Destinatarios
                </Label>
                <Select value={recipients} onValueChange={setRecipients}>
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
                <Label htmlFor="subject" className="text-sm font-medium">
                  Asunto
                </Label>
                <Input
                  id="subject"
                  placeholder="Introduce el asunto del mensaje"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  Contenido
                </Label>
                <Textarea
                  id="content"
                  placeholder="Escribe el contenido del mensaje..."
                  className="min-h-[200px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Adjuntos</Label>
                <div className="border border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50">
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
                <Checkbox id="send-copy" checked={sendCopy} onCheckedChange={setSendCopy} />
                <Label htmlFor="send-copy" className="text-sm font-medium">
                  Enviarme una copia
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Guardar como borrador</Button>
              <Button onClick={handleSendMessage}>
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
                  <div key={i} className="border rounded-lg p-4 hover:bg-muted/50 group">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{template.description}</p>
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{template.name}</DialogTitle>
                            <DialogDescription>Tipo: {template.type}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{template.content}</div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" onClick={() => useTemplate(template)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Usar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add new template card */}
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 min-h-[200px]">
                      <PenSquare className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Crear nueva plantilla</p>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear nueva plantilla</DialogTitle>
                      <DialogDescription>
                        Crea una plantilla personalizada para tus comunicaciones frecuentes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="template-name">Nombre de la plantilla</Label>
                        <Input
                          id="template-name"
                          placeholder="Ej: Recordatorio de reunión"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-type">Tipo de plantilla</Label>
                        <Select value={templateType} onValueChange={setTemplateType}>
                          <SelectTrigger id="template-type">
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="circular">Circular</SelectItem>
                            <SelectItem value="anuncio">Anuncio</SelectItem>
                            <SelectItem value="recordatorio">Recordatorio</SelectItem>
                            <SelectItem value="resumen">Resumen de Actividad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-description">Descripción</Label>
                        <Input
                          id="template-description"
                          placeholder="Breve descripción de la plantilla"
                          value={templateDescription}
                          onChange={(e) => setTemplateDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-content">Contenido</Label>
                        <Textarea
                          id="template-content"
                          placeholder="Escribe el contenido de la plantilla..."
                          className="min-h-[200px]"
                          value={templateContent}
                          onChange={(e) => setTemplateContent(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancelar</Button>
                      <Button onClick={handleSaveTemplate}>Guardar plantilla</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
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

function getRecipientsText(recipientValue) {
  switch (recipientValue) {
    case "all":
      return "Todas las Familias"
    case "families":
      return "Todas las Familias"
    case "kraal":
      return "Kraal"
    case "committee":
      return "Comité"
    case "castores":
      return "Familias Castores"
    case "lobatos":
      return "Familias Lobatos"
    case "scouts":
      return "Familias Scouts"
    case "escultas":
      return "Familias Escultas"
    case "rovers":
      return "Familias Rovers"
    default:
      return "Todos"
  }
}

// Mock data
const initialMessages = [
  {
    id: "msg1",
    title: "Información Campamento de Verano",
    sender: "María García",
    recipients: "Todas las Familias",
    date: "Hace 3 días",
    type: "Circular",
    content:
      "Estimadas familias,\n\nOs enviamos la información detallada sobre el campamento de verano que se realizará del 15 al 30 de julio en los Pirineos. Adjuntamos la autorización que deberéis entregar firmada antes del 15 de junio, así como la lista de material necesario y el programa de actividades previsto.\n\nEl precio del campamento será de 350€ por niño, con un descuento del 10% para hermanos. El pago se realizará en dos plazos: 150€ antes del 1 de junio y el resto antes del 1 de julio.\n\nPara cualquier duda o consulta, no dudéis en contactar con nosotros.\n\nUn cordial saludo,\nMaría García\nCoordinadora de Grupo",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "msg2",
    title: "Recordatorio Cuotas Trimestrales",
    sender: "Ana Martínez",
    recipients: "Todas las Familias",
    date: "Hace 1 semana",
    type: "Recordatorio",
    content:
      "Queridas familias,\n\nOs recordamos que el plazo para el pago de las cuotas trimestrales finaliza el próximo viernes 10 de junio. Podéis realizar el pago mediante transferencia bancaria a la cuenta habitual indicando el nombre del educando y la sección a la que pertenece.\n\nSi alguna familia tiene dificultades para realizar el pago, por favor, poneos en contacto con nosotros para buscar una solución.\n\nGracias por vuestra colaboración,\nAna Martínez\nTesorera",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "msg3",
    title: "Resumen Actividad Sierra Norte",
    sender: "Carlos Rodríguez",
    recipients: "Familias Scouts",
    date: "Hace 2 semanas",
    type: "Resumen",
    content:
      "Estimadas familias de la Tropa,\n\nOs compartimos algunas fotos y un breve resumen de la fantástica actividad que realizamos el pasado fin de semana en la Sierra Norte. Los chicos y chicas disfrutaron de actividades de orientación, construcciones con madera y una velada nocturna con historias de aventuras. Estamos muy contentos con su participación y entusiasmo.\n\nPodéis ver todas las fotos en el álbum compartido en Google Photos.\n\nUn saludo,\nCarlos Rodríguez\nCoordinador de Tropa",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "msg4",
    title: "Convocatoria Reunión Kraal",
    sender: "Ana Martínez",
    recipients: "Kraal",
    date: "Hace 3 semanas",
    type: "Anuncio",
    content:
      "Hola a todos,\n\nConvocamos a todo el Kraal a la reunión mensual que tendrá lugar el próximo viernes 20 de mayo a las 20:00h en el local. Trataremos temas importantes como la planificación del campamento de verano y la evaluación del trimestre.\n\nOrden del día:\n1. Aprobación del acta anterior\n2. Evaluación de actividades realizadas\n3. Planificación del campamento de verano\n4. Ruegos y preguntas\n\nSe ruega puntualidad y confirmación de asistencia.\n\nUn abrazo,\nAna Martínez\nCoordinadora de Grupo",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "msg5",
    title: "Información Salida Fin de Semana Lobatos",
    sender: "María García",
    recipients: "Familias Lobatos",
    date: "Hace 1 mes",
    type: "Circular",
    content:
      "Queridas familias de la Manada,\n\nOs informamos sobre la próxima salida de fin de semana que realizaremos los días 3 y 4 de junio en el albergue 'El Pinar'. Adjuntamos la autorización, información sobre el lugar, horarios de salida y regreso, así como la lista de material necesario.\n\nLa salida tendrá un coste de 35€ por niño, que incluye alojamiento, comidas y materiales para las actividades. El pago se realizará en efectivo el día de la salida.\n\nPara cualquier duda, podéis contactar con los scouters de la Manada.\n\nUn saludo,\nMaría García\nCoordinadora de Lobatos",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const initialTemplates = [
  {
    id: "template1",
    name: "Circular Campamento",
    type: "Circular",
    description:
      "Plantilla para informar sobre los detalles de un campamento, incluyendo fechas, lugar, material necesario y programa de actividades.",
    content:
      "Estimadas familias,\n\nOs enviamos la información detallada sobre el campamento de [NOMBRE_CAMPAMENTO] que se realizará del [FECHA_INICIO] al [FECHA_FIN] en [LUGAR].\n\nAdjuntamos la autorización que deberéis entregar firmada antes del [FECHA_LÍMITE], así como la lista de material necesario y el programa de actividades previsto.\n\nEl precio del campamento será de [PRECIO]€ por niño, con un descuento del 10% para hermanos. El pago se realizará en dos plazos: [PRIMER_PLAZO]€ antes del [FECHA_PRIMER_PLAZO] y el resto antes del [FECHA_SEGUNDO_PLAZO].\n\nPara cualquier duda o consulta, no dudéis en contactar con nosotros.\n\nUn cordial saludo,\n[NOMBRE]\n[CARGO]",
  },
  {
    id: "template2",
    name: "Recordatorio Cuotas",
    type: "Recordatorio",
    description:
      "Plantilla para recordar a las familias el pago de las cuotas trimestrales o anuales, incluyendo información sobre métodos de pago y plazos.",
    content:
      "Queridas familias,\n\nOs recordamos que el plazo para el pago de las cuotas [PERIODO] finaliza el próximo [FECHA_LÍMITE]. Podéis realizar el pago mediante transferencia bancaria a la cuenta habitual indicando el nombre del educando y la sección a la que pertenece.\n\nSi alguna familia tiene dificultades para realizar el pago, por favor, poneos en contacto con nosotros para buscar una solución.\n\nGracias por vuestra colaboración,\n[NOMBRE]\n[CARGO]",
  },
  {
    id: "template3",
    name: "Resumen de Actividad",
    type: "Resumen",
    description:
      "Plantilla para compartir un resumen y fotos de una actividad realizada, destacando los aspectos más relevantes y agradeciendo la participación.",
    content:
      "Estimadas familias de [SECCIÓN],\n\nOs compartimos algunas fotos y un breve resumen de la fantástica actividad que realizamos [FECHA_ACTIVIDAD] en [LUGAR_ACTIVIDAD].\n\n[DESCRIPCIÓN_ACTIVIDAD]\n\nPodéis ver todas las fotos en el álbum compartido en Google Photos.\n\nUn saludo,\n[NOMBRE]\n[CARGO]",
  },
  {
    id: "template4",
    name: "Convocatoria Reunión",
    type: "Anuncio",
    description:
      "Plantilla para convocar a una reunión, especificando fecha, hora, lugar, orden del día y solicitando confirmación de asistencia.",
    content:
      "Hola a todos,\n\nConvocamos a [DESTINATARIOS] a la reunión [TIPO_REUNIÓN] que tendrá lugar el próximo [FECHA] a las [HORA] en [LUGAR]. Trataremos temas importantes como [TEMA_PRINCIPAL].\n\nOrden del día:\n1. [PUNTO_1]\n2. [PUNTO_2]\n3. [PUNTO_3]\n4. Ruegos y preguntas\n\nSe ruega puntualidad y confirmación de asistencia.\n\nUn abrazo,\n[NOMBRE]\n[CARGO]",
  },
  {
    id: "template5",
    name: "Información Salida",
    type: "Circular",
    description:
      "Plantilla para informar sobre una salida de un día o fin de semana, incluyendo detalles logísticos y material necesario.",
    content:
      "Queridas familias de [SECCIÓN],\n\nOs informamos sobre la próxima salida [TIPO_SALIDA] que realizaremos [FECHA] en [LUGAR]. Adjuntamos la autorización, información sobre el lugar, horarios de salida y regreso, así como la lista de material necesario.\n\nLa salida tendrá un coste de [PRECIO]€ por niño, que incluye [CONCEPTOS_INCLUIDOS]. El pago se realizará [MÉTODO_PAGO].\n\nPara cualquier duda, podéis contactar con los scouters de [SECCIÓN].\n\nUn saludo,\n[NOMBRE]\n[CARGO]",
  },
  {
    id: "template6",
    name: "Bienvenida Nuevas Familias",
    type: "Circular",
    description:
      "Plantilla para dar la bienvenida a nuevas familias que se incorporan al grupo, incluyendo información básica y contactos importantes.",
    content:
      "Estimada familia,\n\nEn nombre de todo el Grupo Scout Osyris, queremos daros la más calurosa bienvenida. Estamos encantados de que [NOMBRE_EDUCANDO] se una a nuestra gran familia scout.\n\nAdjuntamos información básica sobre el funcionamiento del grupo, calendario de actividades, cuotas y contactos importantes. También podéis encontrar toda esta información en nuestra web.\n\nLos scouters de [SECCIÓN] se pondrán en contacto con vosotros para explicaros con más detalle el funcionamiento de la sección y resolver cualquier duda que tengáis.\n\nEstamos a vuestra disposición para cualquier consulta o sugerencia.\n\nUn cordial saludo,\n[NOMBRE]\n[CARGO]",
  },
]

