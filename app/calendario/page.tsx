"use client"

import { useState, useEffect } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/es"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarDays, MapPin, Users, Info } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"

// Configurar el localizador para español
moment.locale("es")
const localizer = momentLocalizer(moment)

// Tipos para los eventos
interface Event {
  id: number
  title: string
  start: Date
  end: Date
  section: string
  location: string
  description: string
  allDay?: boolean
}

// Eventos de ejemplo
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Reunión semanal Castores",
    start: new Date(2025, 3, 6, 16, 30),
    end: new Date(2025, 3, 6, 18, 30),
    section: "Castores",
    location: "Local del grupo",
    description: "Reunión semanal de la sección de Castores con actividades programadas.",
  },
  {
    id: 2,
    title: "Reunión semanal Lobatos",
    start: new Date(2025, 3, 6, 16, 30),
    end: new Date(2025, 3, 6, 18, 30),
    section: "Lobatos",
    location: "Local del grupo",
    description: "Reunión semanal de la sección de Lobatos con actividades programadas.",
  },
  {
    id: 3,
    title: "Reunión semanal Scouts",
    start: new Date(2025, 3, 6, 16, 30),
    end: new Date(2025, 3, 6, 18, 30),
    section: "Scouts",
    location: "Local del grupo",
    description: "Reunión semanal de la sección de Scouts con actividades programadas.",
  },
  {
    id: 4,
    title: "Reunión semanal Escultas",
    start: new Date(2025, 3, 6, 16, 30),
    end: new Date(2025, 3, 6, 18, 30),
    section: "Escultas",
    location: "Local del grupo",
    description: "Reunión semanal de la sección de Escultas con actividades programadas.",
  },
  {
    id: 5,
    title: "Reunión semanal Rovers",
    start: new Date(2025, 3, 6, 16, 30),
    end: new Date(2025, 3, 6, 18, 30),
    section: "Rovers",
    location: "Local del grupo",
    description: "Reunión semanal de la sección de Rovers con actividades programadas.",
  },
  {
    id: 6,
    title: "Salida de Sección Scouts",
    start: new Date(2025, 3, 20),
    end: new Date(2025, 3, 21),
    section: "Scouts",
    location: "Parque Natural de la Albufera",
    description: "Salida de fin de semana para la sección de Scouts con actividades en la naturaleza.",
    allDay: true,
  },
  {
    id: 7,
    title: "Festival de Primavera",
    start: new Date(2025, 4, 10, 10, 0),
    end: new Date(2025, 4, 10, 18, 0),
    section: "Grupo",
    location: "Local del Grupo",
    description: "Festival con actividades, juegos y comida para familias y educandos.",
  },
  {
    id: 8,
    title: "Campamento de Verano",
    start: new Date(2025, 6, 15),
    end: new Date(2025, 6, 30),
    section: "Grupo",
    location: "Sierra de Gredos",
    description: "Campamento anual de verano con actividades para todas las secciones.",
    allDay: true,
  },
  {
    id: 9,
    title: "Reunión de Kraal",
    start: new Date(2025, 3, 13, 19, 0),
    end: new Date(2025, 3, 13, 21, 0),
    section: "Kraal",
    location: "Local del grupo",
    description: "Reunión de planificación y coordinación del equipo de monitores.",
  },
  {
    id: 10,
    title: "Reunión de Comité",
    start: new Date(2025, 3, 15, 19, 0),
    end: new Date(2025, 3, 15, 21, 0),
    section: "Comité",
    location: "Local del grupo",
    description: "Reunión del comité para tratar temas administrativos y organizativos.",
  },
]

// Función para obtener el color según la sección
const getSectionColor = (section: string) => {
  switch (section) {
    case "Castores":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "Lobatos":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "Scouts":
      return "bg-green-100 text-green-800 border-green-300"
    case "Escultas":
      return "bg-red-100 text-red-800 border-red-300"
    case "Rovers":
      return "bg-purple-100 text-purple-800 border-purple-300"
    case "Kraal":
      return "bg-pink-100 text-pink-800 border-pink-300"
    case "Comité":
      return "bg-orange-100 text-orange-800 border-orange-300"
    case "Grupo":
      return "bg-osyris-gold/20 text-osyris-brown border-osyris-gold/30"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

export default function CalendarioPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [filterSection, setFilterSection] = useState<string>("all")
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month")
  const [date, setDate] = useState<Date>(new Date())

  // Cargar eventos al montar el componente
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      setEvents(mockEvents)
    }, 500)
  }, [])

  // Filtrar eventos por sección
  const filteredEvents = filterSection === "all" ? events : events.filter((event) => event.section === filterSection)

  // Personalizar el estilo de los eventos en el calendario
  const eventStyleGetter = (event: Event) => {
    const style = {
      backgroundColor:
        event.section === "Castores"
          ? "#93c5fd"
          : event.section === "Lobatos"
            ? "#fde68a"
            : event.section === "Scouts"
              ? "#86efac"
              : event.section === "Escultas"
                ? "#fca5a5"
                : event.section === "Rovers"
                  ? "#d8b4fe"
                  : event.section === "Kraal"
                    ? "#f9a8d4"
                    : event.section === "Comité"
                      ? "#fdba74"
                      : "#e9b949",
      color: "#1f2937",
      borderRadius: "4px",
      border: "1px solid #e5e7eb",
      display: "block",
      fontWeight: "500",
      fontSize: "0.875rem",
    }
    return {
      style,
    }
  }

  // Manejar el clic en un evento
  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
  }

  // Próximos eventos (ordenados por fecha)
  const upcomingEvents = [...events]
    .filter((event) => event.start >= new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Calendario de Actividades</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Consulta todas las actividades programadas del Grupo Scout Osyris. Puedes filtrar por sección y cambiar la
              vista del calendario según tus preferencias.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Calendario</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Select value={filterSection} onValueChange={setFilterSection}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrar por sección" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las secciones</SelectItem>
                          <SelectItem value="Castores">Castores</SelectItem>
                          <SelectItem value="Lobatos">Lobatos</SelectItem>
                          <SelectItem value="Scouts">Scouts</SelectItem>
                          <SelectItem value="Escultas">Escultas</SelectItem>
                          <SelectItem value="Rovers">Rovers</SelectItem>
                          <SelectItem value="Kraal">Kraal</SelectItem>
                          <SelectItem value="Comité">Comité</SelectItem>
                          <SelectItem value="Grupo">Grupo</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Button
                          variant={view === "month" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setView("month")}
                        >
                          Mes
                        </Button>
                        <Button
                          variant={view === "week" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setView("week")}
                        >
                          Semana
                        </Button>
                        <Button
                          variant={view === "day" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setView("day")}
                        >
                          Día
                        </Button>
                        <Button
                          variant={view === "agenda" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setView("agenda")}
                        >
                          Agenda
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[700px]">
                    <Calendar
                      localizer={localizer}
                      events={filteredEvents}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
                      views={["month", "week", "day", "agenda"]}
                      view={view}
                      onView={(newView: any) => setView(newView)}
                      date={date}
                      onNavigate={setDate}
                      onSelectEvent={handleSelectEvent}
                      eventPropGetter={eventStyleGetter}
                      messages={{
                        month: "Mes",
                        week: "Semana",
                        day: "Día",
                        agenda: "Agenda",
                        previous: "Anterior",
                        next: "Siguiente",
                        today: "Hoy",
                        showMore: (total) => `+ Ver ${total} más`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Eventos</CardTitle>
                  <CardDescription>Actividades programadas próximamente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event) => (
                        <div key={event.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{event.title}</h3>
                            <Badge className={getSectionColor(event.section)}>{event.section}</Badge>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <CalendarDays className="h-4 w-4 mr-2" />
                              <span>
                                {event.allDay
                                  ? `${event.start.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} - ${event.end.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}`
                                  : event.start.toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "long",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="mt-3 w-full">
                                <Info className="h-4 w-4 mr-2" />
                                Ver detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{event.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-2">
                                <Badge className={getSectionColor(event.section)}>{event.section}</Badge>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>
                                      {event.allDay
                                        ? `${event.start.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })} - ${event.end.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
                                        : event.start.toLocaleDateString("es-ES", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>{event.location}</span>
                                  </div>
                                  {event.section !== "Kraal" && event.section !== "Comité" && (
                                    <div className="flex items-center">
                                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <span>Sección: {event.section}</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium mb-1">Descripción</h4>
                                  <p className="text-muted-foreground">{event.description}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No hay eventos próximos programados</p>
                    )}
                  </div>
                  <div className="mt-6">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/contacto">Contactar para más información</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Diálogo para mostrar detalles del evento seleccionado */}
          {selectedEvent && (
            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {selectedEvent.allDay
                          ? `${moment(selectedEvent.start).format("LL")} - ${moment(selectedEvent.end).format("LL")}`
                          : moment(selectedEvent.start).format("LLLL")}
                      </p>
                      {!selectedEvent.allDay && (
                        <p className="text-sm text-muted-foreground">
                          {`${moment(selectedEvent.start).format("HH:mm")} - ${moment(selectedEvent.end).format("HH:mm")}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <p>{selectedEvent.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="secondary">{selectedEvent.section}</Badge>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <p className="text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Diálogo de información de secciones */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-2" />
                Información de secciones
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Información de Secciones</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Badge className={getSectionColor("Castores")}>Castores (6-8 años)</Badge>
                  <Badge className={getSectionColor("Lobatos")}>Lobatos (8-11 años)</Badge>
                  <Badge className={getSectionColor("Scouts")}>Scouts (11-14 años)</Badge>
                  <Badge className={getSectionColor("Escultas")}>Escultas (14-17 años)</Badge>
                  <Badge className={getSectionColor("Rovers")}>Rovers (17-21 años)</Badge>
                  <Badge className={getSectionColor("Kraal")}>Kraal (Equipo de monitores)</Badge>
                  <Badge className={getSectionColor("Comité")}>Comité (Equipo de gestión)</Badge>
                  <Badge className={getSectionColor("Grupo")}>Grupo (Todas las secciones)</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Las edades son orientativas y pueden variar según el desarrollo personal de cada educando.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  )
}

