"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, MapPin, Info, Calendar, Download, Users, Tent, Mountain, Star, CalendarDays, GraduationCap, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateGoogleCalendarUrl, downloadICSFile, type CalendarExportEvent } from "@/lib/calendar-export"

// Tipos de evento soportados (todos los tipos del backend)
type EventType = 'reunion' | 'reunion_sabado' | 'campamento' | 'salida' | 'excursion' | 'evento_especial' | 'evento' | 'actividad' | 'jornada' | 'festivo' | 'asamblea' | 'formacion' | 'otro'

interface CalendarEvent {
  id: number
  title: string
  date: string
  time: string
  location: string
  section: string
  type: EventType
  description?: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
  className?: string
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const DAYS = ["L", "M", "X", "J", "V", "S", "D"]

// Colores por sección scout - Definidos según identidad visual del grupo
const SECTION_COLORS = {
  // Castores: Naranja (#F97316)
  "Castores": {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
    dot: "bg-orange-500",
    card: "border-l-4 border-l-orange-500 bg-orange-50",
    hex: "#F97316"
  },
  // Manada/Lobatos: Amarillo (#EAB308)
  "Manada": {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
    dot: "bg-yellow-500",
    card: "border-l-4 border-l-yellow-500 bg-yellow-50",
    hex: "#EAB308"
  },
  "Lobatos": {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
    dot: "bg-yellow-500",
    card: "border-l-4 border-l-yellow-500 bg-yellow-50",
    hex: "#EAB308"
  },
  // Tropa: Verde (#22C55E)
  "Tropa": {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
    dot: "bg-green-500",
    card: "border-l-4 border-l-green-500 bg-green-50",
    hex: "#22C55E"
  },
  // Pioneros: Rojo (#EF4444)
  "Pioneros": {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    dot: "bg-red-500",
    card: "border-l-4 border-l-red-500 bg-red-50",
    hex: "#EF4444"
  },
  // Rutas: Azul oscuro (#1D4ED8)
  "Rutas": {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
    dot: "bg-blue-700",
    card: "border-l-4 border-l-blue-700 bg-blue-50",
    hex: "#1D4ED8"
  },
  // General/Grupo: Gris (#6B7280)
  "General": {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
    dot: "bg-gray-500",
    card: "border-l-4 border-l-gray-500 bg-gray-50",
    hex: "#6B7280"
  },
  "Grupo": {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
    dot: "bg-gray-500",
    card: "border-l-4 border-l-gray-500 bg-gray-50",
    hex: "#6B7280"
  }
}

// Lista de secciones para la leyenda (orden oficial scout)
const SECTION_LEGEND = [
  { name: "Castores", color: SECTION_COLORS.Castores },
  { name: "Manada", color: SECTION_COLORS.Manada },
  { name: "Tropa", color: SECTION_COLORS.Tropa },
  { name: "Pioneros", color: SECTION_COLORS.Pioneros },
  { name: "Rutas", color: SECTION_COLORS.Rutas },
  { name: "General", color: SECTION_COLORS.General },
]

// Helper para obtener colores de sección
const getSectionColors = (section: string) => {
  return SECTION_COLORS[section as keyof typeof SECTION_COLORS] || SECTION_COLORS.General
}

// Configuracion de tipos de evento con colores e iconos
const EVENT_TYPE_CONFIG: Record<EventType, { icon: LucideIcon; label: string; color: string; bgColor: string; textColor: string; hex: string }> = {
  reunion: { icon: Users, label: 'Reunion', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700', hex: '#3b82f6' },
  reunion_sabado: { icon: Users, label: 'Reunion', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700', hex: '#3b82f6' },
  campamento: { icon: Tent, label: 'Campamento', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700', hex: '#22c55e' },
  salida: { icon: Mountain, label: 'Salida', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700', hex: '#a855f7' },
  excursion: { icon: Mountain, label: 'Excursion', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700', hex: '#a855f7' },
  evento_especial: { icon: Star, label: 'Evento', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700', hex: '#f97316' },
  evento: { icon: Star, label: 'Evento', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700', hex: '#f97316' },
  actividad: { icon: CalendarDays, label: 'Actividad', color: 'teal', bgColor: 'bg-teal-100', textColor: 'text-teal-700', hex: '#14b8a6' },
  jornada: { icon: CalendarDays, label: 'Jornada', color: 'teal', bgColor: 'bg-teal-100', textColor: 'text-teal-700', hex: '#14b8a6' },
  festivo: { icon: Calendar, label: 'Festivo', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-600', hex: '#6b7280' },
  asamblea: { icon: Users, label: 'Asamblea', color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700', hex: '#6366f1' },
  formacion: { icon: GraduationCap, label: 'Formacion', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', hex: '#eab308' },
  otro: { icon: Calendar, label: 'Otro', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700', hex: '#6b7280' }
}

// Lista de tipos de evento para la leyenda (principales, visibles para familias)
const EVENT_TYPE_LEGEND = [
  { type: 'reunion_sabado' as EventType, config: EVENT_TYPE_CONFIG.reunion_sabado },
  { type: 'campamento' as EventType, config: EVENT_TYPE_CONFIG.campamento },
  { type: 'salida' as EventType, config: EVENT_TYPE_CONFIG.salida },
  { type: 'evento_especial' as EventType, config: EVENT_TYPE_CONFIG.evento_especial },
  { type: 'asamblea' as EventType, config: EVENT_TYPE_CONFIG.asamblea },
  { type: 'formacion' as EventType, config: EVENT_TYPE_CONFIG.formacion }
]

// Helper para obtener configuracion de tipo de evento
const getEventTypeConfig = (type: EventType) => {
  return EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.otro
}

// Helper para convertir CalendarEvent a CalendarExportEvent
const toExportEvent = (event: CalendarEvent): CalendarExportEvent => ({
  title: event.title,
  date: event.date,
  time: event.time,
  location: event.location,
  description: event.description,
  section: event.section
})

export function CalendarView({ events, className }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7 // Convert to Monday = 0

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Get events for specific date
  const getEventsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => event.date === dateStr)
  }

  // Generate calendar days - ALWAYS 42 cells (6 rows x 7 columns)
  const calendarDays = []

  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ type: 'empty', day: null, key: `empty-start-${i}` })
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ type: 'day', day: day, key: `day-${day}` })
  }

  // Fill remaining cells to complete 6 rows (42 total cells)
  let emptyEndCounter = 0
  while (calendarDays.length < 42) {
    calendarDays.push({ type: 'empty', day: null, key: `empty-end-${emptyEndCounter}` })
    emptyEndCounter++
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'campamento': return 'destructive'
      case 'especial': return 'default'
      case 'actividad': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Calendar Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Mes anterior</span>
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Mes siguiente</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-lg">Calendario Mensual</CardTitle>
              <CardDescription>
                {events.length === 0
                  ? "No hay actividades programadas actualmente"
                  : "Haz clic en cualquier día para ver los detalles de las actividades"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
                {DAYS.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid - Fixed 6 rows */}
              <div className="grid grid-cols-7 grid-rows-6 gap-1 h-96">
                {calendarDays.map((dayObj) => {
                  if (dayObj.day === null) {
                    return <div key={dayObj.key} className="p-1" />
                  }

                  const day = dayObj.day
                  const dayEvents = getEventsForDate(day)
                  const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString()

                  return (
                    <div
                      key={dayObj.key}
                      className={cn(
                        "p-1 border rounded-lg cursor-pointer transition-all duration-200 flex flex-col",
                        "hover:bg-primary/10 hover:border-primary/40 hover:shadow-md hover:scale-105",
                        isToday && "bg-primary/10 border-primary"
                      )}
                      onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1 flex-shrink-0",
                        isToday && "text-primary font-bold"
                      )}>
                        {day}
                      </div>
                      <div className="flex-1 space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map(event => {
                          const colors = getSectionColors(event.section)
                          const typeConfig = getEventTypeConfig(event.type)
                          const TypeIcon = typeConfig.icon
                          return (
                            <div
                              key={event.id}
                              className={cn(
                                "text-xs p-1 rounded border text-center truncate flex items-center gap-1",
                                colors.bg,
                                colors.text,
                                colors.border
                              )}
                              title={`${typeConfig.label} - ${event.section}: ${event.title}`}
                            >
                              <TypeIcon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{event.title}</span>
                            </div>
                          )
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                            <div className="flex -space-x-1">
                              {dayEvents.slice(2, 5).map((event, idx) => {
                                const colors = getSectionColors(event.section)
                                return (
                                  <span
                                    key={idx}
                                    className={cn("w-2 h-2 rounded-full border border-white", colors.dot)}
                                  />
                                )
                              })}
                            </div>
                            <span>+{dayEvents.length - 2}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          {/* Leyenda de Tipos de Evento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Tipos de Actividad
              </CardTitle>
              <CardDescription>
                Iconos por tipo de evento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_TYPE_LEGEND.map(({ type, config }) => {
                  const Icon = config.icon
                  return (
                    <div
                      key={type}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border transition-colors hover:bg-muted/50",
                        config.bgColor
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", config.textColor)} />
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Leyenda de Colores por Seccion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 via-green-500 to-blue-700" />
                Leyenda de Secciones
              </CardTitle>
              <CardDescription>
                Colores identificativos por seccion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {SECTION_LEGEND.map(({ name, color }) => (
                  <div
                    key={name}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-colors hover:bg-muted/50",
                      color.border
                    )}
                  >
                    <div
                      className={cn("w-3 h-3 rounded-full flex-shrink-0", color.dot)}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Event Details */}
          {selectedEvent && (() => {
            const eventColors = getSectionColors(selectedEvent.section)
            const typeConfig = getEventTypeConfig(selectedEvent.type)
            const TypeIcon = typeConfig.icon
            return (
              <Card className={cn("overflow-hidden", eventColors.card)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{selectedEvent.title}</CardTitle>
                    <Badge
                      className={cn(
                        "flex-shrink-0",
                        eventColors.bg,
                        eventColors.text,
                        eventColors.border
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full mr-1.5", eventColors.dot)} />
                      {selectedEvent.section}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className={cn("text-xs", typeConfig.bgColor, typeConfig.textColor)}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {typeConfig.label}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(selectedEvent.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  {selectedEvent.description && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                      {selectedEvent.description}
                    </p>
                  )}

                  {/* Calendar Export Buttons */}
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <a
                      href={generateGoogleCalendarUrl(toExportEvent(selectedEvent))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Añadir a Google Calendar
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => downloadICSFile(toExportEvent(selectedEvent))}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar .ics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Info when no events */}
          {events.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Las actividades se mostrarán aquí cuando sean programadas por los responsables de cada sección.
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    <strong>Contacto:</strong> kraal@grupoosyris.es
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Teléfono:</strong> 666 123 456
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events (only when there are events) */}
          {events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proximas Actividades</CardTitle>
                <CardDescription>
                  Eventos programados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {events
                    .filter(event => new Date(event.date) >= new Date())
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map(event => {
                      const colors = getSectionColors(event.section)
                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-all hover:shadow-md",
                            colors.card
                          )}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start gap-2">
                            <span className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", colors.dot)} />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{event.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString('es-ES', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-muted-foreground">{event.time}</span>
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs px-1.5 py-0", colors.bg, colors.text, colors.border)}
                                >
                                  {event.section}
                                </Badge>
                              </div>
                              {/* Quick export buttons */}
                              <div className="flex gap-1 mt-2 pt-2 border-t border-border/50">
                                <a
                                  href={generateGoogleCalendarUrl(toExportEvent(event))}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1"
                                >
                                  <Button variant="ghost" size="sm" className="w-full h-7 text-xs">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Google
                                  </Button>
                                </a>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1 h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    downloadICSFile(toExportEvent(event))
                                  }}
                                >
                                  <Download className="mr-1 h-3 w-3" />
                                  .ics
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                  {events.filter(event => new Date(event.date) >= new Date()).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay actividades proximas programadas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}