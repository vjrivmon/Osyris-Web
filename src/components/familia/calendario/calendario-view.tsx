'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Filter,
  Grid3X3,
  List,
  AlertCircle
} from 'lucide-react'
import { useCalendarioFamilia, ActividadCalendario } from '@/hooks/useCalendarioFamilia'
import { ConfirmationBadge } from './confirmation-badge'
import { EventoDetailModal } from './evento-detail-modal'
import { ActivityFilter } from './activity-filter'

interface CalendarioViewProps {
  className?: string
}

export function CalendarioView({ className }: CalendarioViewProps) {
  const {
    actividades,
    loading,
    error,
    proximasActividades,
    actividadesPorMes,
    refetch
  } = useCalendarioFamilia()

  const [fechaActual, setFechaActual] = useState(new Date())
  const [selectedActividad, setSelectedActividad] = useState<ActividadCalendario | null>(null)
  const [vistaMode, setVistaMode] = useState<'mes' | 'lista'>('mes')
  const [filtros, setFiltros] = useState({
    seccion: 'todas',
    tipo: 'todos',
    confirmacion: 'todos'
  })

  // Colores por sección
  const coloresSeccion = {
    'Colonia La Veleta': '#FF6B35', // Naranja
    'Manada Waingunga': '#FFD93D', // Amarillo
    'Tropa Brownsea': '#6BCF7F', // Verde
    'Posta Kanhiwara': '#E74C3C', // Rojo
    'Ruta Walhalla': '#2E7D32' // Verde botella
  }

  // Filtrar actividades según los filtros seleccionados
  const actividadesFiltradas = useMemo(() => {
    let actividadesFiltradas = vistaMode === 'mes'
      ? actividadesPorMes(fechaActual.getFullYear(), fechaActual.getMonth() + 1)
      : proximasActividades(90) // Próximos 90 días en vista lista

    if (filtros.seccion !== 'todas') {
      actividadesFiltradas = actividadesFiltradas.filter(a => a.seccion === filtros.seccion)
    }

    if (filtros.tipo !== 'todos') {
      actividadesFiltradas = actividadesFiltradas.filter(a => a.tipo === filtros.tipo)
    }

    if (filtros.confirmacion !== 'todos') {
      actividadesFiltradas = actividadesFiltradas.filter(a => {
        const tienePendientes = a.scoutIds.some(scoutId =>
          !a.confirmaciones[scoutId] || a.confirmaciones[scoutId] === 'pendiente'
        )
        const tieneConfirmados = a.scoutIds.some(scoutId =>
          a.confirmaciones[scoutId] === 'confirmado'
        )

        if (filtros.confirmacion === 'pendientes') return tienePendientes
        if (filtros.confirmacion === 'confirmadas') return tieneConfirmados
        return true
      })
    }

    return actividadesFiltradas
  }, [vistaMode, fechaActual, actividadesPorMes, proximasActividades, filtros])

  // Generar días del mes para vista calendario
  const generarDiasMes = useMemo(() => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()

    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    const diaInicioSemana = primerDia.getDay() || 7 // Convertir domingo (0) a 7
    const diasMes = ultimoDia.getDate()

    const dias = []

    // Agregar días vacíos al inicio
    for (let i = 1; i < diaInicioSemana; i++) {
      dias.push(null)
    }

    // Agregar días del mes
    for (let i = 1; i <= diasMes; i++) {
      dias.push(i)
    }

    return dias
  }, [fechaActual])

  // Obtener actividades para un día específico
  const obtenerActividadesPorDia = (dia: number) => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()

    return actividadesFiltradas.filter(actividad => {
      const fechaActividad = new Date(actividad.fechaInicio)
      return fechaActividad.getDate() === dia &&
             fechaActividad.getMonth() === mes &&
             fechaActividad.getFullYear() === año
    })
  }

  // Navegación de meses
  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    setFechaActual(prev => {
      const nuevaFecha = new Date(prev)
      if (direccion === 'anterior') {
        nuevaFecha.setMonth(prev.getMonth() - 1)
      } else {
        nuevaFecha.setMonth(prev.getMonth() + 1)
      }
      return nuevaFecha
    })
  }

  // Navegación a mes actual
  const irMesActual = () => {
    setFechaActual(new Date())
  }

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  if (loading) {
    return <CalendarioViewSkeleton />
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button onClick={refetch} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendario de Actividades</h2>
          <p className="text-muted-foreground">
            {vistaMode === 'mes'
              ? `Mes: ${nombresMeses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`
              : 'Próximas actividades'
            }
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVistaMode(vistaMode === 'mes' ? 'lista' : 'mes')}
          >
            {vistaMode === 'mes' ? (
              <>
                <List className="h-4 w-4 mr-2" />
                Vista Lista
              </>
            ) : (
              <>
                <Grid3X3 className="h-4 w-4 mr-2" />
                Vista Mes
              </>
            )}
          </Button>

          {vistaMode === 'mes' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes('anterior')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={irMesActual}
              >
                Mes Actual
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes('siguiente')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      <ActivityFilter
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />

      {/* Vista Mes */}
      {vistaMode === 'mes' && (
        <Card>
          <CardContent className="p-6">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {nombresDias.map(dia => (
                <div key={dia} className="text-center text-sm font-medium text-muted-foreground">
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {generarDiasMes.map((dia, index) => {
                const esHoy = dia === new Date().getDate() &&
                             fechaActual.getMonth() === new Date().getMonth() &&
                             fechaActual.getFullYear() === new Date().getFullYear()

                const actividadesDia = dia ? obtenerActividadesPorDia(dia) : []

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-2 border rounded-lg transition-all duration-200
                      ${dia ? 'hover:bg-primary/10 hover:border-primary/40 hover:shadow-md hover:scale-105 cursor-pointer' : ''}
                      ${esHoy ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                    `}
                    onClick={() => {
                      if (dia && actividadesDia.length > 0) {
                        // En un futuro podríamos mostrar un resumen del día
                      }
                    }}
                  >
                    {dia && (
                      <>
                        <div className={`
                          text-sm font-medium mb-1
                          ${esHoy ? 'text-blue-600' : 'text-gray-700'}
                        `}>
                          {dia}
                        </div>

                        <div className="space-y-1">
                          {actividadesDia.slice(0, 2).map(actividad => (
                            <div
                              key={actividad.id}
                              className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                              style={{
                                backgroundColor: coloresSeccion[actividad.seccion as keyof typeof coloresSeccion] + '20',
                                borderLeft: `3px solid ${coloresSeccion[actividad.seccion as keyof typeof coloresSeccion]}`
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedActividad(actividad)
                              }}
                            >
                              <div className="font-medium truncate">
                                {actividad.titulo}
                              </div>
                              <div className="flex items-center space-x-1">
                                <ConfirmationBadge
                                  estado={actividad.scoutIds.length > 0 ?
                                    actividad.scoutIds.some(scoutId =>
                                      actividad.confirmaciones[scoutId] === 'confirmado'
                                    ) ? 'confirmado' : 'pendiente' : 'pendiente'
                                  }
                                  size="sm"
                                />
                                <span className="text-gray-600">
                                  {actividad.scoutIds.length}
                                </span>
                              </div>
                            </div>
                          ))}

                          {actividadesDia.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{actividadesDia.length - 2} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista Lista */}
      {vistaMode === 'lista' && (
        <div className="space-y-4">
          {actividadesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay actividades</h3>
                <p className="text-muted-foreground">
                  No se encontraron actividades con los filtros seleccionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            actividadesFiltradas.map(actividad => (
              <Card
                key={actividad.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedActividad(actividad)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold">{actividad.titulo}</h3>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: coloresSeccion[actividad.seccion as keyof typeof coloresSeccion],
                            color: coloresSeccion[actividad.seccion as keyof typeof coloresSeccion]
                          }}
                        >
                          {actividad.seccion}
                        </Badge>
                        <Badge variant="secondary">
                          {actividad.tipo}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {actividad.descripcion}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span>
                            {actividad.fechaInicio.toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {actividad.fechaInicio.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="truncate">{actividad.lugar}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{actividad.scoutIds.length} {actividad.scoutIds.length === 1 ? 'hijo' : 'hijos'}</span>
                        </div>
                      </div>

                      {actividad.precio && (
                        <div className="mt-3 flex items-center space-x-2">
                          <span className="text-sm font-medium">Precio:</span>
                          <span className="text-sm">€{actividad.precio}</span>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <ConfirmationBadge
                        estado={
                          actividad.scoutIds.length > 0 ?
                            actividad.scoutIds.some(scoutId =>
                              actividad.confirmaciones[scoutId] === 'confirmado'
                            ) ? 'confirmado' :
                            actividad.scoutIds.some(scoutId =>
                              actividad.confirmaciones[scoutId] === 'no_asiste'
                            ) ? 'no_asiste' : 'pendiente'
                          : 'pendiente'
                        }
                      />

                      <Button size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedActividad && (
        <EventoDetailModal
          actividad={selectedActividad}
          isOpen={!!selectedActividad}
          onClose={() => setSelectedActividad(null)}
        />
      )}
    </div>
  )
}

function CalendarioViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Filtros Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Calendario Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
              <Skeleton key={dia} className="h-6 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}