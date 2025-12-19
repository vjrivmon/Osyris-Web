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
  RefreshCw,
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
      const nuevaFecha = new Date(prev)
      if (direccion === 'anterior') {
        nuevaFecha.setMonth(prev.getMonth() - 1)
      } else {
        nuevaFecha.setMonth(prev.getMonth() + 1)
      }
      return nuevaFecha
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
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Gestiona las actividades y confirmaciones de asistencia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchActividades()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={handleNuevaActividad}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Actividad
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendario">
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="lista">
            <Users className="h-4 w-4 mr-2" />
            Lista de Eventos
          </TabsTrigger>
          <TabsTrigger value="leyenda">
            <Filter className="h-4 w-4 mr-2" />
            Tipos de Evento
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
            <CardContent>
              {/* Dias de la semana */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(dia => (
                  <div key={dia} className="text-center text-sm font-medium text-muted-foreground">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Dias del mes */}
              <div className="grid grid-cols-7 gap-2">
                {generarDiasMes().map((dia, index) => {
                  const esHoy = dia === new Date().getDate() &&
                               fechaActual.getMonth() === new Date().getMonth() &&
                               fechaActual.getFullYear() === new Date().getFullYear()

                  const actividadesDia = dia ? obtenerActividadesPorDia(dia) : []

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[100px] p-2 border rounded-lg transition-all
                        ${dia ? 'hover:bg-primary/5 cursor-pointer' : ''}
                        ${esHoy ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}
                      `}
                    >
                      {dia && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${esHoy ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {dia}
                          </div>
                          <div className="space-y-1">
                            {actividadesDia.slice(0, 3).map(actividad => (
                              <EventoCellKraal
                                key={actividad.id}
                                evento={actividad}
                                onEdit={() => handleEditarActividad(actividad)}
                                onViewAsistencia={() => handleVerAsistencia(actividad)}
                              />
                            ))}
                            {actividadesDia.length > 3 && (
                              <div className="text-xs text-gray-500 text-center py-0.5">
                                +{actividadesDia.length - 3} mas
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
                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-800/50 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${tipoConfig.bgColor}`}>
                            <tipoConfig.icon className={`h-5 w-5 ${tipoConfig.textColor}`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{actividad.titulo}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              <span>|</span>
                              <MapPin className="h-3 w-3" />
                              <span>{actividad.lugar}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <TipoEventoBadge tipo={actividad.tipo} size="sm" />
                          <AsistenciaCard
                            confirmados={actividad.confirmados || 0}
                            noAsisten={actividad.no_asisten || 0}
                            pendientes={actividad.pendientes || 0}
                            className="scale-75 origin-right"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditarActividad(actividad)
                            }}
                            className="opacity-70 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
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
