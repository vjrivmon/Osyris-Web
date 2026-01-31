'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Tent,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  MapPin,
  Edit
} from "lucide-react"
import { TipoEventoBadge, getTipoEventoConfig, TIPOS_EVENTO, TipoEvento, AsistenciaCard } from '@/components/familia/calendario'
import { getApiUrl } from '@/lib/api-utils'
import { EventoFormModal } from '@/components/aula-virtual/evento-form-modal'
import { EventoCellKraal } from '@/components/aula-virtual/evento-cell-kraal'
import { AsistenciaDetailModal } from '@/components/aula-virtual/asistencia-detail-modal'

interface Actividad {
  id: number
  titulo: string
  descripcion: string
  tipo: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  seccion_id: number
  seccion_nombre: string
  lugar: string
  visibilidad: string
  requiere_confirmacion: boolean
  precio?: number
  confirmados: number
  no_asisten: number
  pendientes: number
  total_educandos: number
}

export default function CalendarioKraalPage() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fechaActual, setFechaActual] = useState(new Date())
  const [activeTab, setActiveTab] = useState('calendario')
  const [modalOpen, setModalOpen] = useState(false)
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null)
  const [asistenciaModalOpen, setAsistenciaModalOpen] = useState(false)
  const [actividadParaAsistencia, setActividadParaAsistencia] = useState<Actividad | null>(null)

  const handleNuevaActividad = () => {
    setActividadSeleccionada(null)
    setModalOpen(true)
  }

  const handleEditarActividad = (actividad: Actividad) => {
    setActividadSeleccionada(actividad)
    setModalOpen(true)
  }

  const handleVerAsistencia = (actividad: Actividad) => {
    setActividadParaAsistencia(actividad)
    setAsistenciaModalOpen(true)
  }

  const handleActividadGuardada = () => {
    fetchActividades()
  }

  const fetchActividades = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()
      const anio = fechaActual.getFullYear()
      const mes = fechaActual.getMonth() + 1

      const response = await fetch(
        `${apiUrl}/api/actividades/mes/${anio}/${mes}?visibilidad=kraal`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Error al cargar actividades')

      const data = await response.json()
      setActividades(data.data || [])
    } catch (err) {
      setError('Error al cargar las actividades')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActividades()
  }, [fechaActual])

  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    setFechaActual(prev => {
      const offset = direccion === 'anterior' ? -1 : 1
      return new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    })
  }

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const generarDiasMes = () => {
    const anio = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()
    const primerDia = new Date(anio, mes, 1)
    const ultimoDia = new Date(anio, mes + 1, 0)
    const diaInicioSemana = primerDia.getDay() || 7
    const diasMes = ultimoDia.getDate()

    const dias: (number | null)[] = []
    for (let i = 1; i < diaInicioSemana; i++) {
      dias.push(null)
    }
    for (let i = 1; i <= diasMes; i++) {
      dias.push(i)
    }
    return dias
  }

  const obtenerActividadesPorDia = (dia: number) => {
    const anio = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()

    return actividades.filter(actividad => {
      const fechaActividad = new Date(actividad.fecha_inicio)
      return fechaActividad.getDate() === dia &&
             fechaActividad.getMonth() === mes &&
             fechaActividad.getFullYear() === anio
    })
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Gestiona las actividades y confirmaciones de asistencia
          </p>
        </div>
        <Button onClick={handleNuevaActividad} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Actividad
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="calendario" className="flex-1">
            <Calendar className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Calendario</span>
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex-1">
            <Users className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Lista de Eventos</span>
          </TabsTrigger>
          <TabsTrigger value="leyenda" className="flex-1">
            <Filter className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Tipos de Evento</span>
          </TabsTrigger>
        </TabsList>

        {/* Vista Calendario */}
        <TabsContent value="calendario">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {nombresMeses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navegarMes('anterior')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setFechaActual(new Date())}>
                    Hoy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navegarMes('siguiente')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              {/* Dias de la semana */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-2 sm:mb-4">
                {[
                  { short: 'L', full: 'Lun' },
                  { short: 'M', full: 'Mar' },
                  { short: 'X', full: 'Mie' },
                  { short: 'J', full: 'Jue' },
                  { short: 'V', full: 'Vie' },
                  { short: 'S', full: 'Sab' },
                  { short: 'D', full: 'Dom' }
                ].map(dia => (
                  <div key={dia.full} className="text-center text-xs sm:text-sm font-medium text-muted-foreground">
                    <span className="sm:hidden">{dia.short}</span>
                    <span className="hidden sm:inline">{dia.full}</span>
                  </div>
                ))}
              </div>

              {/* Dias del mes */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
                {generarDiasMes().map((dia, index) => {
                  const esHoy = dia === new Date().getDate() &&
                               fechaActual.getMonth() === new Date().getMonth() &&
                               fechaActual.getFullYear() === new Date().getFullYear()

                  const actividadesDia = dia ? obtenerActividadesPorDia(dia) : []

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[50px] sm:min-h-[80px] lg:min-h-[100px] p-0.5 sm:p-2 border rounded-md sm:rounded-lg transition-all
                        ${dia ? 'hover:bg-primary/5 cursor-pointer' : ''}
                        ${esHoy ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-700' : 'border-border'}
                      `}
                    >
                      {dia && (
                        <>
                          <div className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${esHoy ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                            {dia}
                          </div>
                          <div className="space-y-0.5 sm:space-y-1">
                            {actividadesDia.slice(0, 2).map(actividad => (
                              <EventoCellKraal
                                key={actividad.id}
                                evento={actividad}
                                onEdit={() => handleEditarActividad(actividad)}
                                onViewAsistencia={() => handleVerAsistencia(actividad)}
                              />
                            ))}
                            {actividadesDia.length > 2 && (
                              <div className="text-[10px] sm:text-xs text-muted-foreground text-center py-0.5">
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
        </TabsContent>

        {/* Vista Lista */}
        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <CardTitle>Proximos Eventos</CardTitle>
              <CardDescription>Lista de actividades del mes actual</CardDescription>
            </CardHeader>
            <CardContent>
              {actividades.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay actividades este mes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actividades.map(actividad => {
                    const tipoConfig = getTipoEventoConfig(actividad.tipo)
                    const fecha = new Date(actividad.fecha_inicio)

                    return (
                      <div
                        key={actividad.id}
                        onClick={() => handleVerAsistencia(actividad)}
                        className="p-3 sm:p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 hover:shadow-sm group"
                      >
                        {/* Layout responsive: stack en móvil, row en desktop */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {/* Info principal */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${tipoConfig.bgColor}`}>
                              <tipoConfig.icon className={`h-5 w-5 ${tipoConfig.textColor}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium truncate">{actividad.titulo}</h4>
                              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                                <span>{fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                <span className="hidden sm:inline">|</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-[120px] sm:max-w-none">{actividad.lugar}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Acciones y stats - en móvil se muestran debajo */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0">
                            <TipoEventoBadge tipo={actividad.tipo} size="sm" />
                            {/* Stats simplificados en móvil */}
                            <div className="hidden sm:block">
                              <AsistenciaCard
                                confirmados={actividad.confirmados || 0}
                                noAsisten={actividad.no_asisten || 0}
                                pendientes={actividad.pendientes || 0}
                                className="scale-75 origin-right"
                              />
                            </div>
                            {/* Stats compactos solo en móvil */}
                            <div className="flex items-center gap-1 text-xs sm:hidden">
                              <span className="text-green-600 font-medium">{actividad.confirmados || 0}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-red-600 font-medium">{actividad.no_asisten || 0}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-amber-600 font-medium">{actividad.pendientes || 0}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditarActividad(actividad)
                              }}
                              className="opacity-70 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leyenda de tipos */}
        <TabsContent value="leyenda">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Eventos</CardTitle>
              <CardDescription>Leyenda de colores y tipos de actividades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(TIPOS_EVENTO) as TipoEvento[]).map(tipo => {
                  const config = TIPOS_EVENTO[tipo]
                  return (
                    <div
                      key={tipo}
                      className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <config.icon className={`h-5 w-5 ${config.textColor}`} />
                        <span className={`font-medium ${config.textColor}`}>{config.label}</span>
                      </div>
                      <div className="flex gap-2">
                        {config.soloKraal && (
                          <Badge variant="secondary" className="text-xs">Solo Kraal</Badge>
                        )}
                        {config.requiereInscripcion && (
                          <Badge variant="outline" className="text-xs">Inscripcion</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de edicion */}
      <EventoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        actividad={actividadSeleccionada}
        onSave={handleActividadGuardada}
      />

      {/* Modal de asistencia detallada */}
      <AsistenciaDetailModal
        open={asistenciaModalOpen}
        onOpenChange={setAsistenciaModalOpen}
        actividad={actividadParaAsistencia}
        onEdit={() => {
          setAsistenciaModalOpen(false)
          if (actividadParaAsistencia) {
            handleEditarActividad(actividadParaAsistencia)
          }
        }}
      />
    </div>
  )
}
