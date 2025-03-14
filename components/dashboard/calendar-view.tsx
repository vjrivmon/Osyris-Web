"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const MONTHS = [
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

const mockEvents = [
  {
    id: "1",
    date: new Date(2025, 3, 15),
    title: "Salida de Sección",
    type: "Salida",
    section: "Scouts",
  },
  {
    id: "2",
    date: new Date(2025, 3, 20),
    title: "Reunión de Kraal",
    type: "Reunión",
    section: "Kraal",
  },
  {
    id: "3",
    date: new Date(2025, 4, 10),
    title: "Festival de Primavera",
    type: "Evento",
    section: "Grupo",
  },
  {
    id: "4",
    date: new Date(2025, 6, 15),
    title: "Campamento de Verano",
    type: "Campamento",
    section: "Grupo",
  },
]

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSection, setSelectedSection] = useState("all")

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)

  // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
  const startDay = (firstDayOfMonth.getDay() + 6) % 7
  const endDate = lastDayOfMonth.getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const filteredEvents = mockEvents.filter(
    (event) =>
      (selectedSection === "all" || event.section === selectedSection) &&
      event.date.getMonth() === currentMonth &&
      event.date.getFullYear() === currentYear,
  )

  const getEventsForDay = (day: number) => {
    return filteredEvents.filter((event) => event.date.getDate() === day)
  }

  const getDayClass = (day: number) => {
    const today = new Date()
    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

    const hasEvents = getEventsForDay(day).length > 0

    return `relative h-12 border border-border hover:bg-muted/50 ${
      isToday ? "bg-primary/10" : ""
    } ${hasEvents ? "font-medium" : ""}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por sección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las secciones</SelectItem>
              <SelectItem value="Grupo">Grupo</SelectItem>
              <SelectItem value="Kraal">Kraal</SelectItem>
              <SelectItem value="Castores">Castores</SelectItem>
              <SelectItem value="Lobatos">Lobatos</SelectItem>
              <SelectItem value="Scouts">Scouts</SelectItem>
              <SelectItem value="Escultas">Escultas</SelectItem>
              <SelectItem value="Rovers">Rovers</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo evento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {DAYS.map((day) => (
          <div key={day} className="text-center py-2 font-medium">
            {day}
          </div>
        ))}

        {Array.from({ length: startDay }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-12 bg-muted/20" />
        ))}

        {Array.from({ length: endDate }).map((_, index) => {
          const day = index + 1
          const dayEvents = getEventsForDay(day)

          return (
            <div key={`day-${day}`} className={getDayClass(day)}>
              <div className="p-1 h-full">
                <div className="text-xs">{day}</div>
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1">
                    {dayEvents.length === 1 ? (
                      <div className="truncate text-xs px-1 rounded bg-primary/10 text-primary">
                        {dayEvents[0].title}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {dayEvents.length} eventos
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {Array.from({ length: (7 - ((startDay + endDate) % 7)) % 7 }).map((_, index) => (
          <div key={`empty-end-${index}`} className="h-12 bg-muted/20" />
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Próximos eventos</h3>
        <div className="space-y-3">
          {filteredEvents.length > 0 ? (
            filteredEvents
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((event) => (
                <Card key={event.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.date.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          event.type === "Campamento"
                            ? "bg-primary/10 text-primary"
                            : event.type === "Salida"
                              ? "bg-accent/10 text-accent"
                              : event.type === "Reunión"
                                ? "bg-secondary/10 text-secondary"
                                : "bg-accent-secondary/10 text-accent-secondary"
                        }
                      >
                        {event.type}
                      </Badge>
                      <Badge variant="outline">{event.section}</Badge>
                    </div>
                  </div>
                </Card>
              ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No hay eventos programados para este mes</p>
          )}
        </div>
      </div>
    </div>
  )
}

