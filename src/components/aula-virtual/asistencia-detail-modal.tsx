'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pencil,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MapPin,
  Calendar
} from 'lucide-react'
import { TipoEventoBadge } from '@/components/familia/calendario/tipo-evento-badge'
import { TipoEvento } from '@/components/familia/calendario/tipos-evento'
import { Actividad } from './evento-cell-kraal'

interface ConfirmacionDetalle {
  id: number
  educando_id: number
  educando_nombre: string
  educando_apellidos: string
  estado: 'confirmado' | 'no_asiste' | 'pendiente'
  comentarios?: string
  confirmado_en?: string
  familiar_nombre?: string
  familiar_apellidos?: string
}

interface AsistenciaDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actividad: Actividad | null
  onEdit: () => void
}

function getInitials(nombre: string, apellidos: string): string {
  const n = nombre?.charAt(0)?.toUpperCase() || ''
  const a = apellidos?.charAt(0)?.toUpperCase() || ''
  return `${n}${a}`
}

function formatDate(fecha: string): string {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

/**
 * Modal de asistencia detallada para el calendario del Aula Virtual.
 * Muestra la lista de educandos organizados por estado de confirmacion.
 * Solo lectura - no permite modificar estados.
 */
export function AsistenciaDetailModal({
  open,
  onOpenChange,
  actividad,
  onEdit
}: AsistenciaDetailModalProps) {
  const [confirmaciones, setConfirmaciones] = useState<ConfirmacionDetalle[]>([])
  const [pendientesSinConfirmar, setPendientesSinConfirmar] = useState<ConfirmacionDetalle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && actividad) {
      fetchConfirmaciones()
    }
  }, [open, actividad])

  const fetchConfirmaciones = async () => {
    if (!actividad) return

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

      const response = await fetch(
        `${apiUrl}/api/confirmaciones/actividades/${actividad.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Error al obtener confirmaciones')
      }

      const data = await response.json()

      if (data.success) {
        setConfirmaciones(data.data.confirmaciones || [])
        setPendientesSinConfirmar(data.data.scouts_sin_confirmar || [])
      }
    } catch (err) {
      console.error('Error fetching confirmaciones:', err)
      setError('No se pudieron cargar las confirmaciones')
    } finally {
      setLoading(false)
    }
  }

  // Separar por estado
  const asisten = confirmaciones.filter(c => c.estado === 'confirmado')
  const noAsisten = confirmaciones.filter(c => c.estado === 'no_asiste')
  const pendientes = pendientesSinConfirmar

  const total = asisten.length + noAsisten.length + pendientes.length
  const porcentajeAsisten = total > 0 ? (asisten.length / total) * 100 : 0

  if (!actividad) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pr-8">
          {/* Badge de tipo */}
          <div className="flex items-center gap-2 mb-1">
            <TipoEventoBadge tipo={actividad.tipo as TipoEvento} size="sm" />
          </div>

          {/* Titulo y boton editar */}
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl font-bold leading-tight">
              {actividad.titulo}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onEdit()
              }}
              className="flex-shrink-0 mt-0.5"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Editar
            </Button>
          </div>

          {/* Fecha y lugar */}
          <DialogDescription className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(actividad.fecha_inicio)}
            </span>
            {actividad.lugar && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {actividad.lugar}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Barra de progreso */}
        <div className="px-1 py-4 flex-shrink-0 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Asistencia confirmada
            </span>
            <span className="text-sm font-semibold">
              {asisten.length}/{total} educandos
            </span>
          </div>
          <Progress value={porcentajeAsisten} className="h-2" />
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Asisten: {asisten.length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              No asisten: {noAsisten.length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Pendientes: {pendientes.length}
            </span>
          </div>
        </div>

        {/* Contenido con tabs */}
        <div className="flex-1 min-h-0 flex flex-col">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchConfirmaciones} className="mt-4">
                Reintentar
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="pendientes" className="flex-1 min-h-0 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                <TabsTrigger
                  value="asisten"
                  className="data-[state=active]:text-green-600 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/20"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Asisten ({asisten.length})
                </TabsTrigger>
                <TabsTrigger
                  value="no-asisten"
                  className="data-[state=active]:text-red-600 data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-900/20"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  No ({noAsisten.length})
                </TabsTrigger>
                <TabsTrigger
                  value="pendientes"
                  className="data-[state=active]:text-amber-600 data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/20"
                >
                  <Clock className="h-4 w-4 mr-1.5" />
                  Pend. ({pendientes.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 min-h-0 overflow-y-auto mt-2 pb-2">
                <TabsContent value="asisten" className="mt-0 data-[state=active]:block">
                  <EducandoList educandos={asisten} estado="confirmado" />
                </TabsContent>

                <TabsContent value="no-asisten" className="mt-0 data-[state=active]:block">
                  <EducandoList educandos={noAsisten} estado="no_asiste" />
                </TabsContent>

                <TabsContent value="pendientes" className="mt-0 data-[state=active]:block">
                  <EducandoList educandos={pendientes} estado="pendiente" />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Sub-componente para lista de educandos
interface EducandoListProps {
  educandos: ConfirmacionDetalle[]
  estado: 'confirmado' | 'no_asiste' | 'pendiente'
}

function EducandoList({ educandos, estado }: EducandoListProps) {
  if (educandos.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">
          {estado === 'confirmado' && 'Nadie ha confirmado asistencia todavia'}
          {estado === 'no_asiste' && 'Nadie ha indicado que no asistira'}
          {estado === 'pendiente' && 'Todos han confirmado su asistencia'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 px-1">
      {educandos.map((educando) => (
        <div
          key={educando.id || educando.educando_id}
          className={cn(
            'flex items-center justify-between p-3 rounded-lg',
            'bg-muted/50 hover:bg-muted/70 transition-colors'
          )}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className={cn(
                'text-xs font-medium',
                estado === 'confirmado' && 'bg-green-100 text-green-700',
                estado === 'no_asiste' && 'bg-red-100 text-red-700',
                estado === 'pendiente' && 'bg-amber-100 text-amber-700'
              )}>
                {getInitials(educando.educando_nombre, educando.educando_apellidos)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {educando.educando_nombre} {educando.educando_apellidos}
              </p>
              {educando.comentarios && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">
                  &ldquo;{educando.comentarios}&rdquo;
                </p>
              )}
              {educando.familiar_nombre && estado !== 'pendiente' && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirmado por {educando.familiar_nombre}
                </p>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              estado === 'confirmado' && 'border-green-300 text-green-700 bg-green-50',
              estado === 'no_asiste' && 'border-red-300 text-red-700 bg-red-50',
              estado === 'pendiente' && 'border-amber-300 text-amber-700 bg-amber-50'
            )}
          >
            {estado === 'confirmado' && 'Asiste'}
            {estado === 'no_asiste' && 'No asiste'}
            {estado === 'pendiente' && 'Pendiente'}
          </Badge>
        </div>
      ))}
    </div>
  )
}
