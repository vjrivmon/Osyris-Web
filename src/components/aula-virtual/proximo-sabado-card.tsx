'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  ProximoSabado,
  ConfirmacionSabado,
  ScoutSinConfirmar
} from '@/hooks/useDashboardScouter'

interface ProximoSabadoCardProps {
  data: ProximoSabado | null
  expanded: boolean
  onToggleExpand: () => void
  loading?: boolean
  className?: string
}

export function ProximoSabadoCard({
  data,
  expanded,
  onToggleExpand,
  loading,
  className
}: ProximoSabadoCardProps) {
  const [activeTab, setActiveTab] = useState<'confirmados' | 'no_asisten' | 'pendientes'>('confirmados')

  if (!data) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Proximo Sabado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No hay reuniones de sabado programadas
          </div>
        </CardContent>
      </Card>
    )
  }

  const { actividad, estadisticas, confirmaciones, scouts_sin_confirmar } = data
  const fecha = new Date(actividad.fecha_inicio)
  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  const confirmados = confirmaciones?.filter(c => c.asistira) || []
  const noAsisten = confirmaciones?.filter(c => !c.asistira) || []
  const pendientes = scouts_sin_confirmar || []

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Proximo Sabado
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
            {actividad.seccion_nombre || 'Todas las secciones'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info de la actividad */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{actividad.titulo}</h3>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {fechaFormateada}
            </span>
            {actividad.hora_inicio && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {actividad.hora_inicio.slice(0, 5)}
                {actividad.hora_fin && ` - ${actividad.hora_fin.slice(0, 5)}`}
              </span>
            )}
            {actividad.lugar && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {actividad.lugar}
              </span>
            )}
          </div>
        </div>

        {/* Estadisticas */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted rounded-lg">
          <button
            onClick={() => expanded && setActiveTab('confirmados')}
            className={cn(
              'text-center p-2 rounded-md transition-colors',
              expanded && activeTab === 'confirmados' && 'bg-card shadow-sm'
            )}
          >
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xl font-bold">{estadisticas.confirmados}</span>
            </div>
            <span className="text-xs text-muted-foreground">Asisten</span>
          </button>

          <button
            onClick={() => expanded && setActiveTab('no_asisten')}
            className={cn(
              'text-center p-2 rounded-md border-x border-border transition-colors',
              expanded && activeTab === 'no_asisten' && 'bg-card shadow-sm'
            )}
          >
            <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 mb-1">
              <XCircle className="h-4 w-4" />
              <span className="text-xl font-bold">{estadisticas.noAsisten}</span>
            </div>
            <span className="text-xs text-muted-foreground">No asisten</span>
          </button>

          <button
            onClick={() => expanded && setActiveTab('pendientes')}
            className={cn(
              'text-center p-2 rounded-md transition-colors',
              expanded && activeTab === 'pendientes' && 'bg-card shadow-sm'
            )}
          >
            <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xl font-bold">{estadisticas.pendientes}</span>
            </div>
            <span className="text-xs text-muted-foreground">Pendientes</span>
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="w-full">
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            {estadisticas.confirmados > 0 && (
              <div
                className="bg-green-500 transition-all duration-300"
                style={{
                  width: `${(estadisticas.confirmados / estadisticas.total) * 100}%`
                }}
              />
            )}
            {estadisticas.noAsisten > 0 && (
              <div
                className="bg-red-500 transition-all duration-300"
                style={{
                  width: `${(estadisticas.noAsisten / estadisticas.total) * 100}%`
                }}
              />
            )}
            {estadisticas.pendientes > 0 && (
              <div
                className="bg-yellow-400 transition-all duration-300"
                style={{
                  width: `${(estadisticas.pendientes / estadisticas.total) * 100}%`
                }}
              />
            )}
          </div>
        </div>

        {/* Lista expandible */}
        {expanded && confirmaciones && (
          <div className="border-t pt-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {activeTab === 'confirmados' && (
                <>
                  {confirmados.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No hay confirmaciones todavia
                    </p>
                  ) : (
                    confirmados.map(c => (
                      <ConfirmacionItem key={c.id} confirmacion={c} />
                    ))
                  )}
                </>
              )}

              {activeTab === 'no_asisten' && (
                <>
                  {noAsisten.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Todos asisten
                    </p>
                  ) : (
                    noAsisten.map(c => (
                      <ConfirmacionItem key={c.id} confirmacion={c} />
                    ))
                  )}
                </>
              )}

              {activeTab === 'pendientes' && (
                <>
                  {pendientes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Todos han confirmado
                    </p>
                  ) : (
                    pendientes.map(scout => (
                      <ScoutPendienteItem key={scout.id} scout={scout} />
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Boton expandir */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Cargando...</span>
          ) : expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar lista
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Ver lista completa
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function ConfirmacionItem({ confirmacion }: { confirmacion: ConfirmacionSabado }) {
  const fecha = new Date(confirmacion.confirmado_en)

  return (
    <div className="flex items-center justify-between p-2 bg-card border rounded-lg">
      <div className="flex items-center gap-2">
        {confirmacion.asistira ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <div>
          <p className="text-sm font-medium">
            {confirmacion.educando_nombre} {confirmacion.educando_apellidos}
          </p>
          {confirmacion.comentarios && (
            <p className="text-xs text-muted-foreground">{confirmacion.comentarios}</p>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">
        {fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
      </span>
    </div>
  )
}

function ScoutPendienteItem({ scout }: { scout: ScoutSinConfirmar }) {
  return (
    <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
          {scout.nombre} {scout.apellidos}
        </p>
      </div>
      <Badge variant="outline" className="text-xs bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300">
        Sin confirmar
      </Badge>
    </div>
  )
}
