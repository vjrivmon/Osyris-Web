'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Grid3X3,
  List,
  AlertCircle
} from 'lucide-react'
import { useCalendarioFamilia, ActividadCalendario } from '@/hooks/useCalendarioFamilia'
import { useFamiliaData } from '@/hooks/useFamiliaData'
import { useAuth } from '@/contexts/AuthContext'
import { ConfirmationBadge } from './confirmation-badge'
import { EventoDetailModal } from './evento-detail-modal'
import { InscripcionCampamentoWizard } from './inscripcion-campamento-wizard'
import { ActivityFilter } from './activity-filter'
import { TipoEventoBadge, TipoEventoDot } from './tipo-evento-badge'
import { getTipoEventoConfig } from './tipos-evento'
import { AsistenciaCounter } from './asistencia-counter'
import type { ActividadCampamento } from '@/types/familia'

interface CalendarioViewProps {
  className?: string
  hijoSeleccionado?: number
}

export function CalendarioView({ className, hijoSeleccionado }: CalendarioViewProps) {
  const {
    actividades,
    loading,
    error,
    proximasActividades,
    actividadesPorMes,
    refetch
  } = useCalendarioFamilia()

  const { hijos } = useFamiliaData()
  const { user } = useAuth()

  const [fechaActual, setFechaActual] = useState(new Date())
  const [selectedActividad, setSelectedActividad] = useState<ActividadCalendario | null>(null)
  const [vistaMode, setVistaMode] = useState<'mes' | 'lista'>('mes')
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    confirmacion: 'todos'
  })

  // Estados para wizard de campamento
  const [campamentoWizardOpen, setCampamentoWizardOpen] = useState(false)
  const [selectedCampamento, setSelectedCampamento] = useState<ActividadCampamento | null>(null)

  // Educandos participantes en el campamento seleccionado
  // Ordenados por seccion_id para mostrar primero las secciones menores (Castores < Manada < Tropa < Pioneros < Rutas)
  const educandosParticipantes = useMemo(() => {
    if (!selectedCampamento || !hijos) return []
    return hijos
      .filter(hijo =>
        selectedCampamento.scoutIds.includes(hijo.id.toString())
      )
      .sort((a, b) => (a.seccion_id || 99) - (b.seccion_id || 99))
  }, [selectedCampamento, hijos])

  // Calcular el índice del educando seleccionado basándose en hijoSeleccionado o sessionStorage
  const selectedEducandoIndex = useMemo(() => {
    if (!educandosParticipantes.length) return 0

    // Primero intentar con el prop hijoSeleccionado
    if (hijoSeleccionado) {
      const index = educandosParticipantes.findIndex(e => e.id === hijoSeleccionado)
      if (index >= 0) return index
    }

    // Fallback: intentar leer de sessionStorage
    if (typeof window !== 'undefined') {
      const savedId = sessionStorage.getItem('hijoSeleccionado')
      if (savedId) {
        const index = educandosParticipantes.findIndex(e => e.id === parseInt(savedId, 10))
        if (index >= 0) return index
      }
    }

    return 0
  }, [hijoSeleccionado, educandosParticipantes])

  // Educando actualmente seleccionado para el wizard
  const educandoActual = educandosParticipantes[selectedEducandoIndex] || null

  // Datos del familiar para prellenar
  const familiarData = useMemo(() => ({
    nombre: user ? `${user.nombre} ${user.apellidos || ''}`.trim() : '',
    email: user?.email || '',
    telefono: (user as any)?.telefono || ''
  }), [user])

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

    if (filtros.tipo !== 'todos') {
      // Mapear los tipos del filtro a los tipos de la base de datos
      // Los tipos del filtro pueden agrupar varios tipos relacionados
      const tipoMap: Record<string, string[]> = {
        'reunion_sabado': ['reunion', 'reunion_sabado'],
        'salida': ['salida', 'excursion'],
        'campamento': ['campamento'],
        'evento_especial': ['evento', 'evento_especial', 'actividad'],
        'asamblea': ['asamblea'],
        'formacion': ['formacion'],
        'festivo': ['festivo'],
        'jornada': ['jornada'],
        'consejo_grupo': ['consejo_grupo'],
        'reunion_kraal': ['reunion_kraal']
      }
      const tiposABuscar = tipoMap[filtros.tipo] || [filtros.tipo]
      actividadesFiltradas = actividadesFiltradas.filter(a => tiposABuscar.includes(a.tipo))
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
      const offset = direccion === 'anterior' ? -1 : 1
      return new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    })
  }

  // Navegación a mes actual
  const irMesActual = () => {
    setFechaActual(new Date())
  }

  // Manejar clic en actividad
  const handleActividadClick = (actividad: ActividadCalendario) => {
    if (actividad.tipo === 'campamento') {
      // Convertir a ActividadCampamento para el wizard
      const actividadCampamento: ActividadCampamento = {
        id: actividad.id,
        titulo: actividad.titulo,
        descripcion: actividad.descripcion || '',
        fecha: actividad.fechaInicio.toISOString().split('T')[0],
        fechaFin: actividad.fechaFin?.toISOString().split('T')[0],
        lugar: actividad.lugar,
        costo: actividad.precio,
        scoutIds: actividad.scoutIds,
        confirmaciones: actividad.confirmaciones,
        campamento: actividad.campamento // Los datos adicionales del campamento
      }
      setSelectedCampamento(actividadCampamento)
      setCampamentoWizardOpen(true)
    } else {
      // Para otros tipos de actividad, usar el modal generico
      setSelectedActividad(actividad)
    }
  }

  // Cerrar wizard de campamento (sin auto-ciclo para evitar abrir otro popup automáticamente)
  const handleCloseCampamentoWizard = () => {
    setCampamentoWizardOpen(false)
    setSelectedCampamento(null)
    refetch() // Actualizar datos
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Calendario de Actividades</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {vistaMode === 'mes'
              ? `${nombresMeses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`
              : 'Próximas actividades'
            }
          </p>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVistaMode(vistaMode === 'mes' ? 'lista' : 'mes')}
          >
            {vistaMode === 'mes' ? (
              <>
                <List className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Vista Lista</span>
              </>
            ) : (
              <>
                <Grid3X3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Vista Mes</span>
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
                <CalendarIcon className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Hoy</span>
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
          <CardContent className="p-3 sm:p-6">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
              {nombresDias.map(dia => (
                <div key={dia} className="text-center text-xs sm:text-sm font-medium text-muted-foreground">
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {generarDiasMes.map((dia, index) => {
                const esHoy = dia === new Date().getDate() &&
                             fechaActual.getMonth() === new Date().getMonth() &&
                             fechaActual.getFullYear() === new Date().getFullYear()

                const actividadesDia = dia ? obtenerActividadesPorDia(dia) : []

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[52px] sm:min-h-[80px] p-1 sm:p-2 border rounded-lg transition-all duration-200
                      ${dia ? 'hover:bg-primary/10 hover:border-primary/40 hover:shadow-md cursor-pointer' : ''}
                      ${esHoy ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-700' : 'border-border'}
                    `}
                    onClick={() => {
                      if (dia && actividadesDia.length === 1) {
                        handleActividadClick(actividadesDia[0])
                      }
                    }}
                  >
                    {dia && (
                      <>
                        <div className={`
                          text-xs sm:text-sm font-medium mb-0.5 sm:mb-1
                          ${esHoy ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}
                        `}>
                          {dia}
                        </div>

                        {/* Mobile: dots de color */}
                        <div className="flex flex-wrap gap-0.5 sm:hidden">
                          {actividadesDia.slice(0, 4).map(actividad => {
                            const tipoConfig = getTipoEventoConfig(actividad.tipo || 'reunion_sabado')
                            return (
                              <div
                                key={actividad.id}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: tipoConfig.hexColor }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleActividadClick(actividad)
                                }}
                              />
                            )
                          })}
                          {actividadesDia.length > 4 && (
                            <span className="text-[8px] text-muted-foreground leading-none">+{actividadesDia.length - 4}</span>
                          )}
                        </div>

                        {/* Desktop: cards de actividad con texto */}
                        <div className="hidden sm:block space-y-1">
                          {actividadesDia.slice(0, 2).map(actividad => {
                            const tipoConfig = getTipoEventoConfig(actividad.tipo || 'reunion_sabado')
                            const TipoIcon = tipoConfig.icon
                            const confirmados = actividad.scoutIds.filter(scoutId =>
                              actividad.confirmaciones[scoutId] === 'confirmado'
                            ).length
                            const total = actividad.scoutIds.length

                            return (
                              <div
                                key={actividad.id}
                                className={`text-xs p-1.5 rounded-md cursor-pointer transition-all hover:shadow-sm hover:scale-[1.02] ${tipoConfig.bgColor} border-l-4`}
                                style={{ borderLeftColor: tipoConfig.hexColor }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleActividadClick(actividad)
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  <TipoIcon className="h-3 w-3 shrink-0" />
                                  <span className="font-medium truncate">{actividad.titulo}</span>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                  {actividad.tipo === 'campamento' && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 bg-white/50 dark:bg-black/30">
                                      Inscribete
                                    </Badge>
                                  )}
                                  {actividad.tipo !== 'campamento' && total > 0 && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {confirmados}/{total}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}

                          {actividadesDia.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{actividadesDia.length - 2} mas
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
                onClick={() => handleActividadClick(actividad)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold">{actividad.titulo}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
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
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: coloresSeccion[actividad.seccion as keyof typeof coloresSeccion],
                              color: coloresSeccion[actividad.seccion as keyof typeof coloresSeccion]
                            }}
                          >
                            {actividad.seccion}
                          </Badge>
                          <TipoEventoBadge tipo={actividad.tipo || 'reunion_sabado'} size="sm" />
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                        {actividad.descripcion}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {actividad.fechaInicio.toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>
                            {actividad.fechaInicio.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{actividad.lugar}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>{actividad.scoutIds.length} {actividad.scoutIds.length === 1 ? 'hijo' : 'hijos'}</span>
                        </div>
                      </div>

                      {actividad.precio && (
                        <div className="mt-3 flex items-center space-x-2">
                          <span className="text-sm font-medium">Precio:</span>
                          <span className="text-sm">{actividad.precio}€</span>
                        </div>
                      )}
                    </div>

                    <Button size="sm" variant="outline" className="w-full sm:w-auto shrink-0">
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal de detalles para actividades normales */}
      {selectedActividad && (
        <EventoDetailModal
          actividad={selectedActividad}
          isOpen={!!selectedActividad}
          onClose={() => setSelectedActividad(null)}
          hijoSeleccionado={hijoSeleccionado}
        />
      )}

      {/* Wizard de inscripcion a campamento */}
      {selectedCampamento && educandoActual && (
        <InscripcionCampamentoWizard
          key={`wizard-${selectedCampamento.id}-${educandoActual.id}`}
          isOpen={campamentoWizardOpen}
          onClose={handleCloseCampamentoWizard}
          actividad={selectedCampamento}
          educando={educandoActual}
          familiarData={familiarData}
        />
      )}
    </div>
  )
}

function CalendarioViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-7 sm:h-8 w-48 sm:w-64 mb-2" />
          <Skeleton className="h-4 w-36 sm:w-48" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-9 sm:w-24" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9 sm:w-16" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Calendario Skeleton */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(dia => (
              <Skeleton key={dia} className="h-5 sm:h-6 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: 35 }, (_, i) => (
              <Skeleton key={i} className="h-[52px] sm:h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}