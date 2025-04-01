import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MessageSquare, Award, Star, BookOpen, ChevronRight, Download } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function EducandosDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, Pablo</h1>
        <p className="text-muted-foreground">
          Tu espacio personal en el Grupo Scout Osyris. Aquí puedes ver tu progresión, actividades y comunicarte con tus
          monitores.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Actividades</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Próxima: Campamento de Verano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insignias</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Última: Supervivencia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 sin leer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etapa Actual</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Participación</div>
            <p className="text-xs text-muted-foreground">Progreso: 65%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="progression">Mi Progresión</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Mi Sección: Pioneros</CardTitle>
                <CardDescription>Información sobre tu sección y compañeros</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center">
                      <img src="/placeholder.svg?height=80&width=80" alt="Logo Pioneros" className="h-16 w-16" />
                    </div>
                    <h3 className="text-lg font-medium text-center md:text-left">Posta Kanhiwara</h3>
                    <Badge className="bg-red-600">Pioneros (13-16 años)</Badge>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tus monitores</h4>
                      <div className="flex flex-wrap gap-3">
                        {monitors.map((monitor, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={monitor.avatar} alt={monitor.name} />
                              <AvatarFallback>{getInitials(monitor.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{monitor.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Tu equipo</h4>
                      <div className="flex flex-wrap gap-2">
                        {team.map((member, i) => (
                          <div key={i} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                            <span className="w-2 h-2 rounded-full bg-red-600"></span>
                            <span className="text-xs">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Proyecto actual</h4>
                      <p className="text-sm">Campaña de sensibilización medioambiental en el barrio</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progreso</span>
                          <span>65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/educandos/seccion">Ver más sobre mi sección</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Próximas Actividades</CardTitle>
                <CardDescription>Calendario de actividades programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingActivities.map((activity, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                        <p className="text-sm">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/educandos/calendario">Ver calendario completo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mis Insignias</CardTitle>
                <CardDescription>Especialidades y reconocimientos obtenidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {badges.slice(0, 8).map((badge, i) => (
                    <div key={i} className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center mb-2">
                        <badge.icon className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="text-xs font-medium">{badge.name}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/educandos/insignias" className="flex items-center">
                      Ver todas mis insignias
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mensajes Recientes</CardTitle>
                <CardDescription>Comunicaciones de tus monitores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={message.avatar} alt={message.from} />
                        <AvatarFallback>{getInitials(message.from)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{message.from}</p>
                          <p className="text-xs text-muted-foreground">{message.date}</p>
                        </div>
                        <p className="text-sm font-medium">{message.subject}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{message.preview}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/educandos/mensajes">Ver todos los mensajes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progression" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Progresión Scout</CardTitle>
              <CardDescription>Seguimiento de tu desarrollo personal en el escultismo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Etapa actual: Participación</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    En esta etapa estás participando activamente en las actividades y asumiendo pequeñas
                    responsabilidades dentro de tu sección.
                  </p>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progreso hacia la siguiente etapa</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-3" />
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-xs text-muted-foreground">Etapa completada</div>
                      <div className="text-sm font-medium mt-1">Integración</div>
                      <Badge className="mt-2" variant="outline">
                        100%
                      </Badge>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-xs text-muted-foreground">Etapa actual</div>
                      <div className="text-sm font-medium mt-1">Participación</div>
                      <Badge className="mt-2" variant="secondary">
                        65%
                      </Badge>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-xs text-muted-foreground">Próxima etapa</div>
                      <div className="text-sm font-medium mt-1">Animación</div>
                      <Badge className="mt-2" variant="outline">
                        0%
                      </Badge>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-xs text-muted-foreground">Etapa final</div>
                      <div className="text-sm font-medium mt-1">Compromiso</div>
                      <Badge className="mt-2" variant="outline">
                        0%
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Mis Insignias y Especialidades</h3>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {badges.map((badge, i) => (
                      <div key={i} className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center mb-2">
                          <badge.icon className="h-8 w-8 text-red-600" />
                        </div>
                        <p className="text-sm font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.date}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Objetivos Personales</h3>
                  <div className="mt-4 space-y-3">
                    {goals.map((goal, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border">
                          <span className="text-xs">{i + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{goal.title}</p>
                          <p className="text-xs text-muted-foreground">{goal.description}</p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progreso</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar informe de progresión
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividades y Proyectos</CardTitle>
              <CardDescription>Información sobre las actividades y proyectos en los que participas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Proyecto actual</h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-base font-medium">Campaña de sensibilización medioambiental</h4>
                          <p className="text-sm text-muted-foreground">Proyecto trimestral de la Posta Kanhiwara</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm">
                          Proyecto para concienciar sobre la importancia del cuidado del medio ambiente en nuestro
                          barrio, a través de actividades de limpieza, talleres y charlas informativas.
                        </p>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progreso del proyecto</span>
                            <span>65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="rounded-lg bg-background p-2">
                            <p className="text-xs text-muted-foreground">Fecha de inicio</p>
                            <p className="text-sm font-medium">15 de abril, 2023</p>
                          </div>
                          <div className="rounded-lg bg-background p-2">
                            <p className="text-xs text-muted-foreground">Fecha de finalización</p>
                            <p className="text-sm font-medium">30 de junio, 2023</p>
                          </div>
                          <div className="rounded-lg bg-background p-2">
                            <p className="text-xs text-muted-foreground">Tu rol</p>
                            <p className="text-sm font-medium">Coordinador de talleres</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Próximas Actividades</h3>
                  <div className="mt-4 space-y-3">
                    {upcomingActivities.map((activity, i) => (
                      <div key={i} className="flex items-start gap-4 rounded-lg bg-muted p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{activity.title}</h4>
                          <p className="text-xs text-muted-foreground">{activity.date}</p>
                          <p className="text-sm mt-1">{activity.description}</p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              Pioneros
                            </Badge>
                            {activity.tags?.map((tag, j) => (
                              <Badge
                                key={j}
                                variant="secondary"
                                className="bg-red-600/10 text-red-600 hover:bg-red-600/20"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Detalles
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Actividades Pasadas</h3>
                  <div className="mt-4 space-y-3">
                    {pastActivities.map((activity, i) => (
                      <div key={i} className="flex items-start gap-4 rounded-lg bg-muted p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted-foreground/30">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{activity.title}</h4>
                          <p className="text-xs text-muted-foreground">{activity.date}</p>
                          <p className="text-sm mt-1">{activity.description}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver fotos
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes</CardTitle>
              <CardDescription>Comunicaciones con tus monitores y compañeros</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="inbox" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="inbox">Bandeja de entrada</TabsTrigger>
                  <TabsTrigger value="sent">Enviados</TabsTrigger>
                </TabsList>

                <TabsContent value="inbox" className="space-y-4">
                  <div className="space-y-4">
                    {messages.map((message, i) => (
                      <div key={i} className="flex gap-3 rounded-lg border p-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={message.avatar} alt={message.from} />
                          <AvatarFallback>{getInitials(message.from)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{message.from}</p>
                            <p className="text-xs text-muted-foreground">{message.date}</p>
                          </div>
                          <p className="text-sm font-medium">{message.subject}</p>
                          <p className="text-sm text-muted-foreground">{message.preview}</p>
                          <div className="pt-2">
                            <Button variant="outline" size="sm">
                              Responder
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="sent" className="space-y-4">
                  <div className="space-y-4">
                    {sentMessages.map((message, i) => (
                      <div key={i} className="flex gap-3 rounded-lg border p-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Pablo Navarro" />
                          <AvatarFallback>PN</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Para: {message.to}</p>
                            <p className="text-xs text-muted-foreground">{message.date}</p>
                          </div>
                          <p className="text-sm font-medium">{message.subject}</p>
                          <p className="text-sm text-muted-foreground">{message.preview}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-4">Nuevo Mensaje</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="recipient" className="text-sm font-medium">
                      Destinatario
                    </label>
                    <select id="recipient" className="w-full p-2 border rounded-md">
                      <option value="">Selecciona un destinatario</option>
                      <option value="laura">Laura Sánchez (Monitora)</option>
                      <option value="david">David Gómez (Monitor)</option>
                      <option value="all">Todos los monitores</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Asunto
                    </label>
                    <input id="subject" className="w-full p-2 border rounded-md" placeholder="Asunto del mensaje" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      className="w-full p-2 border rounded-md min-h-[150px]"
                      placeholder="Escribe tu mensaje aquí..."
                    ></textarea>
                  </div>
                  <Button className="w-full">Enviar mensaje</Button>
                </div>
              </div>
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

const monitors = [
  {
    name: "Laura Sánchez",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "David Gómez",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const team = ["Pablo Navarro", "Elena Ruiz", "Marcos López", "Sara Fernández", "Javier Díaz"]

const upcomingActivities = [
  {
    title: "Campamento de Verano",
    date: "15-30 de julio, 2023",
    description: "Campamento anual en la Sierra de Gredos",
    tags: ["Campamento", "Naturaleza"],
  },
  {
    title: "Taller de Medio Ambiente",
    date: "3 de junio, 2023",
    description: "Taller sobre reciclaje y cuidado del entorno",
    tags: ["Taller", "Proyecto"],
  },
  {
    title: "Salida de fin de semana",
    date: "17-18 de junio, 2023",
    description: "Acampada en el Parque Natural de Peñalara",
    tags: ["Acampada", "Montaña"],
  },
]

const pastActivities = [
  {
    title: "Día de San Jorge",
    date: "23 de abril, 2023",
    description: "Celebración del patrón de los scouts con juegos y actividades",
  },
  {
    title: "Limpieza del río",
    date: "15 de abril, 2023",
    description: "Actividad de servicio para limpiar las orillas del río",
  },
  {
    title: "Taller de primeros auxilios",
    date: "1 de abril, 2023",
    description: "Formación básica en primeros auxilios",
  },
]

const badges = [
  {
    name: "Supervivencia",
    date: "Mayo 2023",
    icon: Award,
  },
  {
    name: "Orientación",
    date: "Marzo 2023",
    icon: Award,
  },
  {
    name: "Cocina",
    date: "Febrero 2023",
    icon: Award,
  },
  {
    name: "Acampada",
    date: "Enero 2023",
    icon: Award,
  },
  {
    name: "Pionerismo",
    date: "Diciembre 2022",
    icon: Award,
  },
  {
    name: "Naturaleza",
    date: "Noviembre 2022",
    icon: Award,
  },
  {
    name: "Primeros Auxilios",
    date: "Octubre 2022",
    icon: Award,
  },
]

const goals = [
  {
    title: "Aprender técnicas avanzadas de orientación",
    description: "Dominar el uso de brújula y mapas topográficos",
    progress: 80,
  },
  {
    title: "Mejorar habilidades de liderazgo",
    description: "Coordinar actividades para el grupo y asumir responsabilidades",
    progress: 65,
  },
  {
    title: "Completar proyecto de servicio comunitario",
    description: "Organizar una jornada de limpieza en el parque local",
    progress: 40,
  },
]

const messages = [
  {
    from: "Laura Sánchez",
    subject: "Información Campamento de Verano",
    preview:
      "Hola Pablo, te envío la información detallada sobre el campamento de verano que realizaremos en julio. Necesitamos que confirmes tu asistencia antes del 1 de junio y que entregues la autorización firmada por tus padres.",
    date: "Hace 2 días",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    from: "David Gómez",
    subject: "Proyecto Medioambiental",
    preview:
      "Buenos días equipo, os recuerdo que este sábado tenemos la reunión para planificar las actividades del proyecto de sensibilización medioambiental. Traed vuestras ideas y propuestas.",
    date: "Hace 5 días",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const sentMessages = [
  {
    to: "Laura Sánchez",
    subject: "Re: Información Campamento de Verano",
    preview:
      "Hola Laura, gracias por la información. Confirmo mi asistencia al campamento. Entregaré la autorización este sábado en la reunión. Un saludo.",
    date: "Hace 1 día",
  },
  {
    to: "Todos los monitores",
    subject: "Duda sobre material",
    preview:
      "Hola a todos, tengo una duda sobre el material que necesitamos para la salida del próximo fin de semana. ¿Es necesario llevar saco de dormir o dormiremos en literas?",
    date: "Hace 1 semana",
  },
]

