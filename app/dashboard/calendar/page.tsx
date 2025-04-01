"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedSection, setSelectedSection] = useState("all")

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // Adjust for Sunday as first day of week (0)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Filter events based on selected section
  const filteredEvents = events.filter((event) => selectedSection === "all" || event.section === selectedSection)

  // Get events for a specific day
  const getEventsForDay = (day) => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === day && eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
      )
    })
  }

  // Generate calendar days
  const calendarDays = []
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push(null) // Empty cells for days before the 1st of the month
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
        <p className="text-muted-foreground">Gestiona y visualiza todas las actividades programadas.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por sección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las secciones</SelectItem>
              <SelectItem value="castores">Castores</SelectItem>
              <SelectItem value="lobatos">Lobatos</SelectItem>
              <SelectItem value="scouts">Scouts</SelectItem>
              <SelectItem value="escultas">Escultas</SelectItem>
              <SelectItem value="rovers">Rovers</SelectItem>
              <SelectItem value="kraal">Kraal</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Calendar header - days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, i) => (
              <div key={i} className="text-center font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`min-h-24 border rounded-md p-1 ${
                  day === new Date().getDate() &&
                  currentMonth === new Date().getMonth() &&
                  currentYear === new Date().getFullYear()
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
              >
                {day && (
                  <>
                    <div className="text-right font-medium text-sm p-1">{day}</div>
                    <div className="space-y-1">
                      {getEventsForDay(day).map((event, j) => (
                        <div
                          key={j}
                          className={`text-xs p-1 rounded truncate ${getSectionColor(event.section)}`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>Lista de los próximos eventos programados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents
              .filter((event) => new Date(event.date) >= new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5)
              .map((event, i) => {
                const eventDate = new Date(event.date)
                return (
                  <div
                    key={i}
                    className="flex items-start border-l-4 pl-4 pb-4"
                    style={{ borderColor: getSectionColorHex(event.section) }}
                  >
                    <div className="w-14 text-center">
                      <div className="text-xl font-bold">{eventDate.getDate()}</div>
                      <div className="text-xs text-muted-foreground">
                        {monthNames[eventDate.getMonth()].slice(0, 3)}
                      </div>
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.time} • {event.location} • {getSectionName(event.section)}
                      </p>
                      <p className="text-sm mt-2">{event.description}</p>
                    </div>
                    <div className="ml-auto">
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getSectionColor(section) {
  switch (section) {
    case "castores":
      return "bg-blue-100 text-blue-800"
    case "lobatos":
      return "bg-yellow-100 text-yellow-800"
    case "scouts":
      return "bg-green-100 text-green-800"
    case "escultas":
      return "bg-red-100 text-red-800"
    case "rovers":
      return "bg-purple-100 text-purple-800"
    case "kraal":
      return "bg-gray-100 text-gray-800"
    case "grupo":
      return "bg-emerald-100 text-emerald-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getSectionColorHex(section) {
  switch (section) {
    case "castores":
      return "#3b82f6"
    case "lobatos":
      return "#eab308"
    case "scouts":
      return "#22c55e"
    case "escultas":
      return "#ef4444"
    case "rovers":
      return "#a855f7"
    case "kraal":
      return "#6b7280"
    case "grupo":
      return "#10b981"
    default:
      return "#6b7280"
  }
}

function getSectionName(section) {
  switch (section) {
    case "castores":
      return "Castores"
    case "lobatos":
      return "Lobatos"
    case "scouts":
      return "Scouts"
    case "escultas":
      return "Escultas"
    case "rovers":
      return "Rovers"
    case "kraal":
      return "Kraal"
    case "grupo":
      return "Todo el Grupo"
    default:
      return section
  }
}

// Mock data
const events = [
  {
    title: "Reunión Semanal Lobatos",
    date: "2023-06-15",
    time: "17:00 - 19:00",
    location: "Local Scout",
    section: "lobatos",
    description: "Actividades regulares de la sección con juegos y dinámicas.",
  },
  {
    title: "Salida Sierra Norte",
    date: "2023-06-22",
    time: "09:00 - 18:00",
    location: "Sierra Norte",
    section: "scouts",
    description: "Acampada de fin de semana con actividades de orientación y supervivencia.",
  },
  {
    title: "Preparación Campamento",
    date: "2023-06-29",
    time: "17:00 - 19:00",
    location: "Local Scout",
    section: "grupo",
    description: "Reunión para preparar el material y las actividades del campamento de verano.",
  },
  {
    title: "Reunión Kraal",
    date: "2023-06-10",
    time: "20:00 - 22:00",
    location: "Local Scout",
    section: "kraal",
    description: "Reunión mensual del Kraal para planificar actividades y evaluar el trimestre.",
  },
  {
    title: "Campamento de Verano",
    date: "2023-07-15",
    time: "08:00",
    location: "Pirineos",
    section: "grupo",
    description: "Campamento anual de verano con actividades de montaña, talleres y juegos.",
  },
  {
    title: "Reunión Castores",
    date: "2023-06-15",
    time: "17:00 - 19:00",
    location: "Local Scout",
    section: "castores",
    description: "Actividades y juegos para la sección de Castores.",
  },
  {
    title: "Reunión Escultas",
    date: "2023-06-16",
    time: "18:00 - 20:00",
    location: "Local Scout",
    section: "escultas",
    description: "Planificación de proyectos y actividades para la sección de Escultas.",
  },
  {
    title: "Reunión Rovers",
    date: "2023-06-17",
    time: "19:00 - 21:00",
    location: "Local Scout",
    section: "rovers",
    description: "Desarrollo de proyectos de servicio y actividades para la sección de Rovers.",
  },
]

