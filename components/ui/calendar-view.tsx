"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, MapPin, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: number
  title: string
  date: string
  time: string
  location: string
  section: string
  type: 'reunion' | 'actividad' | 'campamento' | 'especial'
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

const SECTION_COLORS = {
  "Castores": "bg-orange-100 text-orange-800 border-orange-200",
  "Lobatos": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Tropa": "bg-green-100 text-green-800 border-green-200",
  "Pioneros": "bg-red-100 text-red-800 border-red-200",
  "Rutas": "bg-blue-100 text-blue-800 border-blue-200",
  "General": "bg-gray-100 text-gray-800 border-gray-200"
}

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
                        "p-1 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 flex flex-col",
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
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs p-1 rounded border text-center truncate",
                              SECTION_COLORS[event.section as keyof typeof SECTION_COLORS] || SECTION_COLORS.General
                            )}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayEvents.length - 2} más
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
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Secciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(SECTION_COLORS).map(([section, colors]) => (
                <div key={section} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded border", colors)} />
                  <span className="text-sm">{section}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Event Details */}
          {selectedEvent && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                  <Badge variant={getBadgeVariant(selectedEvent.type)}>
                    {selectedEvent.section}
                  </Badge>
                </div>
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
                  <p className="text-sm text-muted-foreground mt-3">
                    {selectedEvent.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

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
                <CardTitle className="text-lg">Próximas Actividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events
                    .filter(event => new Date(event.date) >= new Date())
                    .slice(0, 5)
                    .map(event => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs">{event.time}</span>
                          <Badge variant="outline">{event.section}</Badge>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}