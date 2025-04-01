import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Users, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ActividadesSeccionPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Actividades de Sección</h1>
        <p className="text-muted-foreground">Gestiona las actividades específicas de tu sección</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Próximas Actividades</TabsTrigger>
          <TabsTrigger value="create">Crear Actividad</TabsTrigger>
          <TabsTrigger value="past">Actividades Pasadas</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Actividades de tu Sección</CardTitle>
              <CardDescription>Actividades programadas para los próximos días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {upcomingActivities.map((activity, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                    <div className="flex items-center md:items-start">
                      <div className="w-16 h-16 flex flex-col items-center justify-center bg-primary/10 rounded-lg">
                        <span className="text-xl font-bold">{activity.day}</span>
                        <span className="text-xs text-muted-foreground">{activity.month}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{activity.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{activity.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          <span>{activity.section}</span>
                        </div>
                      </div>
                      <p className="mt-2">{activity.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant={activity.status === "Confirmada" ? "default" : "outline"}>
                          {activity.status}
                        </Badge>
                        {activity.materials && <Badge variant="secondary">Material solicitado</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 justify-end">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Actividad</CardTitle>
              <CardDescription>Planifica una nueva actividad para tu sección</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="activity-title">Título de la actividad</Label>
                    <Input id="activity-title" placeholder="Título descriptivo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-section">Sección</Label>
                    <Select defaultValue="lobatos">
                      <SelectTrigger id="activity-section">
                        <SelectValue placeholder="Selecciona una sección" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="castores">Castores</SelectItem>
                        <SelectItem value="lobatos">Lobatos</SelectItem>
                        <SelectItem value="tropa">Tropa</SelectItem>
                        <SelectItem value="pioneros">Pioneros</SelectItem>
                        <SelectItem value="rutas">Rutas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-date">Fecha</Label>
                    <Input id="activity-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-time">Hora</Label>
                    <Input id="activity-time" type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-location">Ubicación</Label>
                    <Input id="activity-location" placeholder="Lugar de la actividad" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-status">Estado</Label>
                    <Select defaultValue="pending">
                      <SelectTrigger id="activity-status">
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="draft">Borrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-description">Descripción</Label>
                  <Textarea
                    id="activity-description"
                    placeholder="Describe la actividad, objetivos, etc."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-materials">Materiales necesarios</Label>
                  <Textarea
                    id="activity-materials"
                    placeholder="Lista de materiales necesarios para la actividad"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Actividad</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividades Pasadas</CardTitle>
              <CardDescription>Historial de actividades realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pastActivities.map((activity, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                    <div className="flex items-center md:items-start">
                      <div className="w-16 h-16 flex flex-col items-center justify-center bg-muted rounded-lg">
                        <span className="text-xl font-bold">{activity.day}</span>
                        <span className="text-xs text-muted-foreground">{activity.month}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{activity.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{activity.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          <span>{activity.section}</span>
                        </div>
                      </div>
                      <p className="mt-2">{activity.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary">
                          <CheckCircle className="mr-1 h-3 w-3" /> Completada
                        </Badge>
                        {activity.evaluated && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          >
                            Evaluada
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                      {!activity.evaluated && (
                        <Button variant="outline" size="sm">
                          Evaluar
                        </Button>
                      )}
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

// Mock data
const upcomingActivities = [
  {
    day: "15",
    month: "Jun",
    title: "Juegos de Pistas en el Parque",
    time: "17:00 - 19:00",
    location: "Parque del Retiro",
    section: "Lobatos",
    description: "Actividad de juegos de pistas y orientación para desarrollar habilidades de trabajo en equipo.",
    status: "Confirmada",
    materials: true,
  },
  {
    day: "22",
    month: "Jun",
    title: "Taller de Manualidades",
    time: "17:00 - 19:00",
    location: "Local Scout",
    section: "Lobatos",
    description:
      "Taller de manualidades con materiales reciclados para fomentar la creatividad y conciencia ambiental.",
    status: "Pendiente",
    materials: false,
  },
  {
    day: "29",
    month: "Jun",
    title: "Preparación Campamento",
    time: "17:00 - 19:00",
    location: "Local Scout",
    section: "Lobatos",
    description: "Reunión para preparar el material y las actividades del campamento de verano.",
    status: "Confirmada",
    materials: true,
  },
]

const pastActivities = [
  {
    day: "01",
    month: "Jun",
    title: "Gymkana Deportiva",
    time: "17:00 - 19:00",
    location: "Polideportivo Municipal",
    section: "Lobatos",
    description: "Actividad deportiva con diferentes pruebas y juegos para fomentar el trabajo en equipo.",
    evaluated: true,
  },
  {
    day: "25",
    month: "May",
    title: "Excursión a la Sierra",
    time: "09:00 - 18:00",
    location: "Sierra de Guadarrama",
    section: "Lobatos",
    description: "Excursión de senderismo con actividades de naturaleza y observación de flora y fauna.",
    evaluated: true,
  },
  {
    day: "18",
    month: "May",
    title: "Juegos Tradicionales",
    time: "17:00 - 19:00",
    location: "Local Scout",
    section: "Lobatos",
    description: "Actividad de juegos tradicionales para conocer y valorar los juegos de nuestros abuelos.",
    evaluated: false,
  },
]

