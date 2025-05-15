"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  parse,
  addHours,
  parseISO
} from "date-fns"
import { es } from "date-fns/locale"
import { 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  CalendarIcon, 
  Calendar as CalendarPlusIcon,
  Download, 
  ExternalLink,
  X,
  Info,
  Check,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

// Tipo para un evento del calendario
interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string // Formato: "DD MMM", como "07 Sept"
  dateObj?: Date // Fecha real para ordenar/procesar
  sections: string[]
  status: "Confirmada" | "Pendiente"
  duration?: number // Duración en horas (opcional)
  time?: string // Hora de inicio (opcional)
  location?: string // Ubicación (opcional)
}

// Tipo para los datos mensuales
interface MonthData {
  name: string
  events: CalendarEvent[]
}

export default function CalendarioPage() {
  // Estado para la fecha actual y navegación
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [visibleSections, setVisibleSections] = useState<string[]>([
    "Castores", "Manada", "Tropa", "Pioneros", "Rutas", "Grupo"
  ])

  // Generar días para el mes actual
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Para alinear la cuadrícula según el primer día del mes
  const startDay = getDay(monthStart)
  
  // Preparar eventos con fechas parseadas
  useEffect(() => {
    // Convertir las cadenas de fecha en eventos a objetos Date
    calendarByMonth.forEach(month => {
      month.events.forEach(event => {
        try {
          const year = currentDate.getFullYear()
          let dateObj: Date

          // Manejar rangos de fecha (ej: "01-03 Nov")
          if (event.date.includes("-")) {
            const [startDay, endDayMonthStr] = event.date.split("-")
            const [endDayStr, monthStr] = endDayMonthStr.split(" ")
            dateObj = parse(`${startDay} ${monthStr} ${year}`, "dd MMM yyyy", new Date(), { locale: es })
          } else {
            dateObj = parse(`${event.date} ${year}`, "dd MMM yyyy", new Date(), { locale: es })
          }
          
          event.dateObj = dateObj
        } catch (error) {
          console.error(`Error parsing date for event: ${event.title}`)
        }
      })
    })
  }, [currentDate])

  // Filtrar eventos para el mes actual y día específico
  const getEventsForDay = (day: Date): CalendarEvent[] => {
    const allEvents = calendarByMonth.flatMap(month => month.events)
    
    return allEvents.filter(event => {
      // Solo incluir eventos que están visibles según las secciones seleccionadas
      const sectionVisible = event.sections.some(section => visibleSections.includes(section))
      if (!sectionVisible) return false
      
      // Verificar si el evento tiene fecha
      if (!event.dateObj) return false
      
      // Comprobar si el evento es para este día
      if (isSameDay(event.dateObj, day)) return true
      
      // Manejar eventos de varios días
      if (event.date.includes("-")) {
        try {
          const [startDayStr, endDayMonthStr] = event.date.split("-")
          const [endDayStr, monthStr] = endDayMonthStr.split(" ")
          
          const year = currentDate.getFullYear()
          const startDate = parse(`${startDayStr} ${monthStr} ${year}`, "dd MMM yyyy", new Date(), { locale: es })
          const endDate = parse(`${endDayStr} ${monthStr} ${year}`, "dd MMM yyyy", new Date(), { locale: es })
          
          // Verificar si el día actual está dentro del rango del evento
          return day >= startDate && day <= endDate
        } catch (error) {
          return false
        }
      }
      
      return false
    })
  }

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Volver al mes actual
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Mostrar detalles del evento
  const showEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setEventDialogOpen(true)
  }

  // Función para generar enlace de Google Calendar
  const generateGoogleCalendarUrl = (event: CalendarEvent) => {
    try {
      // Parsear la fecha del evento
      if (!event.dateObj) return "#"
      
      let startDate = new Date(event.dateObj)
      let endDate: Date
      
      // Manejar rangos de fecha
      if (event.date.includes("-")) {
        const [startDayStr, endDayMonthStr] = event.date.split("-")
        const [endDayStr, monthStr] = endDayMonthStr.split(" ")
        
        const year = currentDate.getFullYear()
        startDate = parse(`${startDayStr} ${monthStr} ${year}`, "dd MMM yyyy", new Date(), { locale: es })
        endDate = parse(`${endDayStr} ${monthStr} ${year}`, "dd MMM yyyy", new Date(), { locale: es })
        // Añadir un día para la fecha de fin para eventos que duran todo el día
        endDate = addHours(endDate, 23)
      } else {
        // Para eventos de un solo día
        endDate = addHours(startDate, event.duration || 2) // Usar duración o asumir 2h
      }
      
      // Formatear para URL
      const formattedStart = format(startDate, "yyyyMMdd'T'HHmmss")
      const formattedEnd = format(endDate, "yyyyMMdd'T'HHmmss")
      
      // Crear URL para Google Calendar
      const baseUrl = "https://calendar.google.com/calendar/render"
      const url = new URL(baseUrl)
      url.searchParams.append("action", "TEMPLATE")
      url.searchParams.append("text", event.title)
      url.searchParams.append("dates", `${formattedStart}/${formattedEnd}`)
      url.searchParams.append("details", event.description)
      url.searchParams.append("location", event.location || "Grupo Scout Osyris, Valencia")
      
      return url.toString()
    } catch (error) {
      console.error("Error generando enlace de calendario:", error)
      return "#"
    }
  }
  
  // Función para generar enlace de Outlook Calendar
  const generateOutlookCalendarUrl = (event: CalendarEvent) => {
    try {
      if (!event.dateObj) return "#"
      
      let startDate = new Date(event.dateObj)
      let endDate: Date
      
      if (event.date.includes("-")) {
        const [startDayStr, endDayMonthStr] = event.date.split("-")
        const [endDayStr, monthStr] = endDayMonthStr.split(" ")
        
        const year = currentDate.getFullYear()
        startDate = parse(`${startDayStr} ${monthStr} ${year}`, "dd MMM yyyy", new Date(), { locale: es })
        endDate = parse(`${endDayStr} ${monthStr} ${year}`, "dd MMM yyyy", new Date(), { locale: es })
        endDate = addHours(endDate, 23)
      } else {
        endDate = addHours(startDate, event.duration || 2)
      }
      
      const formattedStart = format(startDate, "yyyy-MM-dd'T'HH:mm:ss")
      const formattedEnd = format(endDate, "yyyy-MM-dd'HH:mm:ss")
      
      const baseUrl = "https://outlook.office.com/calendar/0/deeplink/compose"
      const url = new URL(baseUrl)
      url.searchParams.append("subject", event.title)
      url.searchParams.append("startdt", formattedStart)
      url.searchParams.append("enddt", formattedEnd)
      url.searchParams.append("body", event.description)
      url.searchParams.append("location", event.location || "Grupo Scout Osyris, Valencia")
      
      return url.toString()
    } catch (error) {
      console.error("Error generando enlace de Outlook:", error)
      return "#"
    }
  }
  
  // Función para generar archivo .ics (para Apple Calendar y otros)
  const generateIcsFile = (event: CalendarEvent) => {
    try {
      if (!event.dateObj) return
      
      let startDate = new Date(event.dateObj)
      let endDate: Date
      
      if (event.date.includes("-")) {
        const [startDayStr, endDayMonthStr] = event.date.split("-")
        const [endDayStr, monthStr] = endDayMonthStr.split(" ")
        
        const year = currentDate.getFullYear()
        startDate = parse(`${startDayStr} ${monthStr} ${year}`, "dd MMM yyyy", new Date(), { locale: es })
        endDate = parse(`${endDayStr} ${monthStr} ${year}`, "dd MMM yyyy", new Date(), { locale: es })
        endDate = addHours(endDate, 23)
      } else {
        endDate = addHours(startDate, event.duration || 2)
      }
      
      const formattedStart = format(startDate, "yyyyMMdd'T'HHmmss")
      const formattedEnd = format(endDate, "yyyyMMdd'T'HHmmss")
      
      // Crear contenido del archivo ICS
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `SUMMARY:${event.title}`,
        `DTSTART:${formattedStart}`,
        `DTEND:${formattedEnd}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location || "Grupo Scout Osyris, Valencia"}`,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n")
      
      // Crear y descargar el archivo
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `evento-osyris-${event.title.toLowerCase().replace(/\s+/g, "-")}.ics`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error generando archivo ICS:", error)
    }
  }

  // Función para obtener la clase CSS según la sección
  const getSectionBadgeClass = (section: string) => {
    switch (section) {
      case "Castores":
        return "badge-castores"
      case "Manada":
        return "badge-manada"
      case "Tropa":
        return "badge-tropa"
      case "Pioneros":
        return "badge-pioneros"
      case "Rutas":
        return "badge-rutas"
      default:
        return "bg-primary/20 text-primary"
    }
  }

  // Función para obtener eventos próximos (futuros)
  const getUpcomingEvents = (): CalendarEvent[] => {
    const today = new Date()
    const allEvents = calendarByMonth.flatMap(month => month.events)
    
    return allEvents
      .filter(event => 
        event.dateObj && event.dateObj >= today && 
        event.sections.some(section => visibleSections.includes(section))
      )
      .sort((a, b) => {
        if (a.dateObj && b.dateObj) {
          return a.dateObj.getTime() - b.dateObj.getTime()
        }
        return 0
      })
      .slice(0, 5) // Limitar a los próximos 5 eventos
  }

  // Obtener eventos próximos
  const upcomingEvents = getUpcomingEvents()

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary py-12 sm:py-16">
          <div className="container mx-auto px-4 text-center text-primary-foreground">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl mb-3 sm:mb-6">
              Calendario Ronda Solar 2024-2025
            </h1>
            <p className="mt-2 sm:mt-4 text-base sm:text-xl max-w-3xl mx-auto">
              Consulta todas las actividades programadas para esta ronda
            </p>
          </div>
        </section>

        {/* Calendario principal */}
        <section className="py-4 md:py-10">
          <div className="container px-3 sm:px-4">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              {/* Cabecera del calendario */}
              <div className="flex flex-col sm:flex-row justify-between items-center p-3 sm:p-4 border-b bg-background">
                <div className="flex items-center space-x-2 mb-3 sm:mb-0 w-full sm:w-auto justify-center sm:justify-start">
                  <h1 className="text-xl sm:text-2xl font-bold">{format(currentDate, 'MMMM yyyy', { locale: es })}</h1>
                  <Button variant="outline" size="sm" onClick={goToToday} className="ml-2">
                    Hoy
                  </Button>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-start">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="p-2">
                        <h4 className="font-medium mb-2 text-sm">Secciones</h4>
                        <div className="space-y-1">
                          {["Castores", "Manada", "Tropa", "Pioneros", "Rutas", "Grupo"].map((section) => (
                            <DropdownMenuCheckboxItem
                              key={section}
                              checked={visibleSections.includes(section)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setVisibleSections([...visibleSections, section])
                                } else {
                                  setVisibleSections(visibleSections.filter(s => s !== section))
                                }
                              }}
                            >
                              <div className="flex items-center">
                                <span 
                                  className={cn(
                                    "w-2 h-2 rounded-full mr-2",
                                    section === "Castores" ? "bg-orange-500" :
                                    section === "Manada" ? "bg-yellow-400" :
                                    section === "Tropa" ? "bg-blue-500" :
                                    section === "Pioneros" ? "bg-red-600" :
                                    section === "Rutas" ? "bg-green-700" :
                                    "bg-primary"
                                  )}
                                />
                                {section}
                              </div>
                            </DropdownMenuCheckboxItem>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cabecera de días de la semana */}
              <div className="grid grid-cols-7 text-center py-1 sm:py-2 border-b bg-background">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, i) => (
                  <div key={i} className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Cuadrícula del calendario */}
              <div className="grid grid-cols-7 auto-rows-[minmax(80px,1fr)] sm:auto-rows-[minmax(120px,1fr)]">
                {/* Espacios vacíos para alinear con el día de la semana */}
                {Array.from({ length: startDay === 0 ? 6 : startDay - 1 }).map((_, i) => (
                  <div key={`empty-${i}`} className="border-r border-b bg-muted/20"></div>
                ))}

                {/* Días del mes */}
                {monthDays.map((day, i) => {
                  const events = getEventsForDay(day)
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={cn(
                        "border-r border-b p-1 md:p-2 relative",
                        isToday(day) ? "bg-primary/5" : "",
                        !isSameMonth(day, currentDate) ? "text-muted-foreground" : ""
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span 
                          className={cn(
                            "w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-xs sm:text-sm mb-1",
                            isToday(day) ? "bg-primary text-primary-foreground font-bold" : ""
                          )}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                      
                      {/* Lista de eventos del día */}
                      <div className="space-y-1 overflow-hidden max-h-[80%]">
                        {events.length > 0 ? (
                          events.slice(0, 2).map((event, eventIndex) => (
                            <div 
                              key={`${event.id}-${eventIndex}`}
                              onClick={() => showEventDetails(event)}
                              className={cn(
                                "text-xs truncate rounded px-1 py-0.5 cursor-pointer",
                                event.status === "Confirmada" 
                                  ? "bg-primary/20 hover:bg-primary/30" 
                                  : "bg-muted hover:bg-muted/80 border border-dashed",
                                event.sections.includes("Castores") ? "border-l-2 border-l-orange-500" :
                                event.sections.includes("Manada") ? "border-l-2 border-l-yellow-400" :
                                event.sections.includes("Tropa") ? "border-l-2 border-l-blue-500" :
                                event.sections.includes("Pioneros") ? "border-l-2 border-l-red-600" :
                                event.sections.includes("Rutas") ? "border-l-2 border-l-green-700" :
                                "border-l-2 border-l-primary"
                              )}
                            >
                              {event.title}
                            </div>
                          ))
                        ) : null}
                        
                        {/* Indicador de más eventos */}
                        {events.length > 2 && (
                          <div 
                            className="text-xs text-center text-muted-foreground cursor-pointer hover:underline"
                            onClick={() => {
                              // Mostrar el primer evento oculto
                              if (events[2]) showEventDetails(events[2])
                            }}
                          >
                            +{events.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Sección de próximos eventos */}
        <section className="py-6 bg-muted">
          <div className="container px-4">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Próximos Eventos</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Los eventos más cercanos en el calendario</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, i) => (
                  <div 
                    key={`upcoming-${i}`} 
                    className="bg-card rounded-lg border p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => showEventDetails(event)}
                  >
                    <div className="flex gap-3">
                      {/* Fecha */}
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-md flex flex-col items-center justify-center">
                        <span className="text-base sm:text-lg font-bold">
                          {event.dateObj ? format(event.dateObj, "d") : ""}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {event.dateObj ? format(event.dateObj, "MMM", { locale: es }) : ""}
                        </span>
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1">
                        <h3 className="font-medium line-clamp-1 text-sm sm:text-base">{event.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mb-1">{event.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {event.sections.slice(0, 2).map((section, j) => (
                            <Badge key={j} variant="outline" className={`${getSectionBadgeClass(section)} text-xs`}>
                              {section}
                            </Badge>
                          ))}
                          {event.sections.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{event.sections.length - 2}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No hay eventos próximos en el calendario.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Leyenda */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold mb-6 text-center">Leyenda</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="badge-castores mb-2">
                  Castores
                </Badge>
                <span className="text-xs text-muted-foreground">5-7 años</span>
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="badge-manada mb-2">
                  Manada
                </Badge>
                <span className="text-xs text-muted-foreground">7-10 años</span>
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="badge-tropa mb-2">
                  Tropa
                </Badge>
                <span className="text-xs text-muted-foreground">10-13 años</span>
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="badge-pioneros mb-2">
                  Pioneros
                </Badge>
                <span className="text-xs text-muted-foreground">13-16 años</span>
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="badge-rutas mb-2">
                  Rutas
                </Badge>
                <span className="text-xs text-muted-foreground">16-19 años</span>
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="outline" className="bg-primary/20 text-primary mb-2">
                  Grupo
                </Badge>
                <span className="text-xs text-muted-foreground">Todas las secciones</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <div className="flex items-center">
                <Badge variant="default" className="mr-2">
                  Confirmada
                </Badge>
                <span className="text-xs text-muted-foreground">Actividad confirmada</span>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2 border-dashed">
                  Pendiente
                </Badge>
                <span className="text-xs text-muted-foreground">Actividad por confirmar</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Diálogo de detalles del evento */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-md flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">
                    {selectedEvent.dateObj ? format(selectedEvent.dateObj, "d") : ""}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedEvent.dateObj ? format(selectedEvent.dateObj, "MMM", { locale: es }) : ""}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm font-medium">{selectedEvent.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.time || "Hora no especificada"} • {selectedEvent.status}
                  </p>
                  {selectedEvent.location && (
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <MapIcon className="h-3 w-3 text-muted-foreground" />
                      {selectedEvent.location}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Descripción</h4>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Secciones</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedEvent.sections.map((section, i) => (
                    <Badge key={i} variant="outline" className={getSectionBadgeClass(section)}>
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Añadir a mi calendario</h4>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(generateGoogleCalendarUrl(selectedEvent), '_blank')}
                  >
                    <CalendarPlusIcon className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(generateOutlookCalendarUrl(selectedEvent), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Outlook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateIcsFile(selectedEvent)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    iCal
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-start border-t mt-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cerrar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <SiteFooter />
    </div>
  )
}

// Datos del calendario (usando los mismos que en el código original)
const calendarByMonth: MonthData[] = [
  {
    name: "Septiembre 2024",
    events: [
      {
        id: "sept-1",
        date: "07 Sept",
        title: "Primera Reunión",
        description: "Inicio de la ronda solar con juegos y presentaciones.",
        sections: ["Grupo"],
        status: "Confirmada",
        location: "Local Scout"
      },
      {
        id: "sept-2",
        date: "14 Sept",
        title: "Reunión Regular",
        description: "Actividades por secciones.",
        sections: ["Castores", "Manada", "Tropa", "Pioneros", "Rutas"],
        status: "Confirmada",
        location: "Local Scout"
      },
      {
        id: "sept-3",
        date: "21 Sept",
        title: "Reunión Regular",
        description: "Actividades por secciones.",
        sections: ["Castores", "Manada", "Tropa", "Pioneros", "Rutas"],
        status: "Confirmada",
        location: "Local Scout"
      },
      {
        id: "sept-4",
        date: "28 Sept",
        title: "Reunión Regular + Xocolatà",
        description: "Actividades por secciones y merienda con chocolate.",
        sections: ["Grupo"],
        status: "Confirmada",
        location: "Local Scout"
      },
    ],
  },
  // El resto de los meses sigue igual...
  {
    name: "Octubre 2024",
    events: [
      {
        id: "oct-1",
        date: "05 Oct",
        title: "Inicio Ronda",
        description: "Ceremonia oficial de inicio de la ronda solar.",
        sections: ["Grupo"],
        status: "Confirmada",
        location: "Local Scout"
      },
      {
        id: "oct-2",
        date: "12 Oct",
        title: "Reunión Regular",
        description: "Actividades por secciones.",
        sections: ["Castores", "Manada", "Tropa", "Pioneros", "Rutas"],
        status: "Confirmada",
        location: "Local Scout"
      },
      {
        id: "oct-3",
        date: "19 Oct",
        title: "Reunión Regular",
        description: "Actividades por secciones.",
        sections: ["Castores", "Manada", "Tropa", "Pioneros", "Rutas"],
        status: "Confirmada",
        location: "Local Scout"
      },
      {
        id: "oct-4",
        date: "26 Oct",
        title: "Reunión Regular + Asamblea",
        description: "Actividades por secciones y asamblea de grupo.",
        sections: ["Grupo"],
        status: "Confirmada",
        location: "Local Scout"
      },
    ],
  },
  {
    name: "Noviembre 2024",
    events: [
      {
        id: "nov-1",
        date: "01-03 Nov",
        title: "Campamento de Inicio",
        description: "Campamento de inicio de ronda con todas las secciones.",
        sections: ["Grupo"],
        status: "Confirmada",
        location: "Sierra de Espadán"
      },
      // ... resto de eventos
    ],
  },
  // ... resto de meses
]

// Icono de mapa personalizado
function MapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  )
}

