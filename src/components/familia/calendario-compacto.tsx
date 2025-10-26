'use client'

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import { ActividadCalendario } from "@/types/familia"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CalendarioCompactoProps {
  seccionId?: number
  className?: string
}

export function CalendarioCompacto({ seccionId, className }: CalendarioCompactoProps) {
  const [mesActual, setMesActual] = useState(new Date())
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null)

  // TODO: Reemplazar con datos reales de la API
  const actividadesMock: ActividadCalendario[] = [
    {
      id: 1,
      titulo: "Reunión Semanal",
      descripcion: "Reunión de sección con juegos y actividades",
      fecha: "2025-10-25",
      hora: "17:00",
      lugar: "Local Scout",
      seccion: "Manada Waingunga",
      seccion_id: 2,
      tipo: "reunion",
      confirmacion: "confirmado",
      requiere_confirmacion: true
    },
    {
      id: 2,
      titulo: "Campamento de Otoño",
      descripcion: "Campamento de fin de semana en la Sierra",
      fecha: "2025-10-27",
      hora: "09:00",
      lugar: "Sierra de Guadarrama",
      seccion: "Manada Waingunga",
      seccion_id: 2,
      tipo: "campamento",
      confirmacion: "pendiente",
      costo: 35,
      requiere_confirmacion: true,
      fecha_limite_confirmacion: "2025-10-23"
    },
    {
      id: 3,
      titulo: "Excursión al Zoo",
      descripcion: "Visita educativa al zoológico",
      fecha: "2025-11-03",
      hora: "10:00",
      lugar: "Zoo Aquarium Madrid",
      seccion: "Colonia La Veleta",
      seccion_id: 1,
      tipo: "excursion",
      confirmacion: "pendiente",
      costo: 15,
      requiere_confirmacion: true
    }
  ]

  // Filtrar actividades por sección si se proporciona
  const actividades = useMemo(() => {
    if (seccionId) {
      return actividadesMock.filter(a => a.seccion_id === seccionId)
    }
    return actividadesMock
  }, [seccionId])

  // Obtener actividades del mes actual
  const actividadesMes = useMemo(() => {
    return actividades.filter(actividad => {
      const fechaActividad = new Date(actividad.fecha)
      return (
        fechaActividad.getMonth() === mesActual.getMonth() &&
        fechaActividad.getFullYear() === mesActual.getFullYear()
      )
    })
  }, [actividades, mesActual])

  // Obtener próximas actividades (próximos 30 días)
  const proximasActividades = useMemo(() => {
    const hoy = new Date()
    const dentro30Dias = new Date()
    dentro30Dias.setDate(hoy.getDate() + 30)

    return actividades
      .filter(actividad => {
        const fechaActividad = new Date(actividad.fecha)
        return fechaActividad >= hoy && fechaActividad <= dentro30Dias
      })
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 3)
  }, [actividades])

  // Actividades del día seleccionado
  const actividadesDia = useMemo(() => {
    if (!diaSeleccionado) return []
    return actividades.filter(actividad => {
      const fechaActividad = new Date(actividad.fecha)
      return (
        fechaActividad.getDate() === diaSeleccionado.getDate() &&
        fechaActividad.getMonth() === diaSeleccionado.getMonth() &&
        fechaActividad.getFullYear() === diaSeleccionado.getFullYear()
      )
    })
  }, [actividades, diaSeleccionado])

  // Generar días del calendario
  const diasCalendario = useMemo(() => {
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1)
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0)
    const primerDiaSemana = primerDia.getDay()
    const diasMes = ultimoDia.getDate()

    const dias: (Date | null)[] = []

    // Añadir días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null)
    }

    // Añadir días del mes
    for (let dia = 1; dia <= diasMes; dia++) {
      dias.push(new Date(mesActual.getFullYear(), mesActual.getMonth(), dia))
    }

    return dias
  }, [mesActual])

  // Verificar si un día tiene actividades
  const tieneActividades = (dia: Date) => {
    return actividades.some(actividad => {
      const fechaActividad = new Date(actividad.fecha)
      return (
        fechaActividad.getDate() === dia.getDate() &&
        fechaActividad.getMonth() === dia.getMonth() &&
        fechaActividad.getFullYear() === dia.getFullYear()
      )
    })
  }

  const mesAnterior = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))
  }

  const mesSiguiente = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))
  }

  const getTipoColor = (tipo: ActividadCalendario['tipo']) => {
    switch (tipo) {
      case 'reunion':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'campamento':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'excursion':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'actividad_especial':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'formacion':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getConfirmacionBadge = (confirmacion?: string) => {
    switch (confirmacion) {
      case 'confirmado':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmado
          </Badge>
        )
      case 'pendiente':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      case 'rechazado':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rechazado
          </Badge>
        )
      default:
        return null
    }
  }

  const hoy = new Date()

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Calendario</span>
            </CardTitle>
            <CardDescription className="mt-1">
              {actividadesMes.length} actividad{actividadesMes.length !== 1 ? 'es' : ''} este mes
            </CardDescription>
          </div>

          {/* Navegación de meses */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={mesAnterior}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="outline" size="icon" onClick={mesSiguiente}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Mini calendario */}
        <div className="mb-4">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(dia => (
              <div key={dia} className="text-center text-xs font-medium text-muted-foreground py-1">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {diasCalendario.map((dia, index) => {
              if (!dia) {
                return <div key={index} className="aspect-square" />
              }

              const esHoy =
                dia.getDate() === hoy.getDate() &&
                dia.getMonth() === hoy.getMonth() &&
                dia.getFullYear() === hoy.getFullYear()

              const tieneEvento = tieneActividades(dia)
              const esSeleccionado = diaSeleccionado &&
                dia.getDate() === diaSeleccionado.getDate() &&
                dia.getMonth() === diaSeleccionado.getMonth()

              return (
                <button
                  key={index}
                  onClick={() => setDiaSeleccionado(dia)}
                  className={cn(
                    "aspect-square rounded-md text-sm flex flex-col items-center justify-center relative transition-colors",
                    "hover:bg-accent",
                    esHoy && "bg-primary text-primary-foreground font-bold",
                    esSeleccionado && !esHoy && "ring-2 ring-primary",
                    !esHoy && !esSeleccionado && "text-foreground"
                  )}
                >
                  <span>{dia.getDate()}</span>
                  {tieneEvento && (
                    <div className={cn(
                      "w-1 h-1 rounded-full mt-0.5",
                      esHoy ? "bg-primary-foreground" : "bg-primary"
                    )} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Próximas actividades */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Próximas Actividades</h4>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/familia/calendario">
                Ver todas
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>

          {proximasActividades.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay actividades programadas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {proximasActividades.map(actividad => (
                <div
                  key={actividad.id}
                  className="p-3 rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate">{actividad.titulo}</h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className={getTipoColor(actividad.tipo)}>
                          {actividad.tipo}
                        </Badge>
                        {actividad.confirmacion && getConfirmacionBadge(actividad.confirmacion)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{new Date(actividad.fecha).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{actividad.hora}</span>
                    </div>

                    {actividad.lugar && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{actividad.lugar}</span>
                      </div>
                    )}

                    {actividad.costo && (
                      <div className="flex items-center space-x-1 font-medium text-foreground">
                        <span>Coste: €{actividad.costo}</span>
                      </div>
                    )}
                  </div>

                  {actividad.confirmacion === 'pendiente' && (
                    <div className="mt-2 flex space-x-2">
                      <Button size="sm" className="flex-1 text-xs">Confirmar</Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs">Rechazar</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
