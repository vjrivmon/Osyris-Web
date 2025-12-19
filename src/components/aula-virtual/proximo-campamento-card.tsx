'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tent,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  FileText,
  ExternalLink,
  Euro,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  ProximoCampamento,
  InscripcionCampamento,
  ScoutSinConfirmar
} from '@/hooks/useDashboardScouter'

interface ProximoCampamentoCardProps {
  data: ProximoCampamento | null
  expanded: boolean
  onToggleExpand: () => void
  loading?: boolean
  className?: string
}

export function ProximoCampamentoCard({
  data,
  expanded,
  onToggleExpand,
  loading,
  className
}: ProximoCampamentoCardProps) {
  const [activeFilter, setActiveFilter] = useState<'todos' | 'pendientes' | 'completados' | 'no_asisten' | 'sin_inscribir'>('todos')

  if (!data) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tent className="h-5 w-5 text-emerald-600" />
            Proximo Campamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No hay campamentos programados proximamente
          </div>
        </CardContent>
      </Card>
    )
  }

  const { actividad, estadisticas, inscripciones, educandos_sin_inscribir } = data
  const fechaInicio = new Date(actividad.fecha_inicio)
  const fechaFin = actividad.fecha_fin ? new Date(actividad.fecha_fin) : null

  const formatFecha = (fecha: Date) =>
    fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })

  // Filtrar inscripciones
  const inscripcionesFiltradas = inscripciones?.filter(i => {
    switch (activeFilter) {
      case 'pendientes':
        return i.asistira && (!i.circular_firmada_drive_id || !i.justificante_pago_drive_id)
      case 'completados':
        return i.asistira && i.circular_firmada_drive_id && i.justificante_pago_drive_id
      case 'no_asisten':
        return !i.asistira || i.estado === 'no_asiste'
      case 'sin_inscribir':
        return false // Se muestra lista separada
      default:
        return true
    }
  }) || []

  // Calcular totales para filtros
  const totalPendientes = inscripciones?.filter(
    i => i.asistira && (!i.circular_firmada_drive_id || !i.justificante_pago_drive_id)
  ).length || 0
  const totalCompletados = inscripciones?.filter(
    i => i.asistira && i.circular_firmada_drive_id && i.justificante_pago_drive_id
  ).length || 0
  const totalNoAsisten = inscripciones?.filter(
    i => !i.asistira || i.estado === 'no_asiste'
  ).length || 0
  const totalSinInscribir = educandos_sin_inscribir?.length || estadisticas.sinResponder || 0

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tent className="h-5 w-5 text-emerald-600" />
            Proximo Campamento
          </CardTitle>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            {actividad.seccion_nombre || 'Todas las secciones'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info del campamento */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900">{actividad.titulo}</h3>
            {actividad.precio && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Euro className="h-3 w-3 mr-1" />
                {actividad.precio}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatFecha(fechaInicio)}
              {fechaFin && ` - ${formatFecha(fechaFin)}`}
            </span>
            {actividad.lugar && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {actividad.lugar}
              </span>
            )}
          </div>

          {/* Link a circular */}
          {actividad.circular_drive_url && (
            <a
              href={actividad.circular_drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <FileText className="h-4 w-4" />
              Ver circular
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Estadisticas principales */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-2xl font-bold">{estadisticas.inscritos}</span>
            </div>
            <span className="text-xs text-emerald-700">Inscritos</span>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <CreditCard className="h-4 w-4" />
              <span className="text-2xl font-bold">{estadisticas.pagados}</span>
            </div>
            <span className="text-xs text-blue-700">Pagados</span>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
              <HelpCircle className="h-4 w-4" />
              <span className="text-2xl font-bold">{totalSinInscribir}</span>
            </div>
            <span className="text-xs text-yellow-700">Sin responder</span>
          </div>
        </div>

        {/* Estadisticas de documentos */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-3 w-3 text-purple-500" />
              <span className="font-semibold text-purple-600">{estadisticas.circularesSubidas}</span>
            </div>
            <span className="text-gray-600">Circulares</span>
          </div>

          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CreditCard className="h-3 w-3 text-green-500" />
              <span className="font-semibold text-green-600">{estadisticas.justificantesSubidos}</span>
            </div>
            <span className="text-gray-600">Justificantes</span>
          </div>

          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span className="font-semibold text-red-600">{estadisticas.noAsisten}</span>
            </div>
            <span className="text-gray-600">No asisten</span>
          </div>
        </div>

        {/* Lista expandible */}
        {expanded && (inscripciones || educandos_sin_inscribir) && (
          <div className="border-t pt-4 space-y-3">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={activeFilter === 'todos'}
                onClick={() => setActiveFilter('todos')}
                label={`Todos (${inscripciones?.length || 0})`}
              />
              <FilterButton
                active={activeFilter === 'sin_inscribir'}
                onClick={() => setActiveFilter('sin_inscribir')}
                label={`Sin responder (${totalSinInscribir})`}
                variant="yellow"
              />
              <FilterButton
                active={activeFilter === 'pendientes'}
                onClick={() => setActiveFilter('pendientes')}
                label={`Docs. pendientes (${totalPendientes})`}
                variant="orange"
              />
              <FilterButton
                active={activeFilter === 'completados'}
                onClick={() => setActiveFilter('completados')}
                label={`Completos (${totalCompletados})`}
                variant="green"
              />
              <FilterButton
                active={activeFilter === 'no_asisten'}
                onClick={() => setActiveFilter('no_asisten')}
                label={`No asisten (${totalNoAsisten})`}
                variant="red"
              />
            </div>

            {/* Lista */}
            <div className="max-h-72 overflow-y-auto space-y-2">
              {activeFilter === 'sin_inscribir' ? (
                // Mostrar educandos sin inscribir
                educandos_sin_inscribir && educandos_sin_inscribir.length > 0 ? (
                  educandos_sin_inscribir.map(educando => (
                    <EducandoSinInscribirItem key={educando.id} educando={educando} />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Todos los educandos han respondido
                  </p>
                )
              ) : inscripcionesFiltradas.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay inscripciones en esta categoria
                </p>
              ) : (
                inscripcionesFiltradas.map(inscripcion => (
                  <InscripcionItem key={inscripcion.id} inscripcion={inscripcion} />
                ))
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

function FilterButton({
  active,
  onClick,
  label,
  variant = 'default'
}: {
  active: boolean
  onClick: () => void
  label: string
  variant?: 'default' | 'yellow' | 'orange' | 'green' | 'red'
}) {
  const variantStyles = {
    default: active ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    yellow: active ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    orange: active ? 'bg-orange-200 text-orange-800' : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    green: active ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200',
    red: active ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium transition-colors',
        variantStyles[variant]
      )}
    >
      {label}
    </button>
  )
}

function EducandoSinInscribirItem({ educando }: { educando: ScoutSinConfirmar }) {
  return (
    <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-yellow-500" />
        <p className="text-sm font-medium text-yellow-800">
          {educando.nombre} {educando.apellidos}
        </p>
      </div>
      <Badge variant="outline" className="text-xs bg-yellow-100 border-yellow-300 text-yellow-700">
        Sin responder
      </Badge>
    </div>
  )
}

function InscripcionItem({ inscripcion }: { inscripcion: InscripcionCampamento }) {
  const tieneCircular = !!inscripcion.circular_firmada_drive_id
  const tieneJustificante = !!inscripcion.justificante_pago_drive_id
  const noAsiste = !inscripcion.asistira || inscripcion.estado === 'no_asiste'

  if (noAsiste) {
    return (
      <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm font-medium text-red-800">
            {inscripcion.educando_nombre} {inscripcion.educando_apellidos}
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-red-100 border-red-300 text-red-700">
          No asiste
        </Badge>
      </div>
    )
  }

  const isComplete = tieneCircular && tieneJustificante

  return (
    <div className={cn(
      'p-3 border rounded-lg',
      isComplete ? 'bg-green-50 border-green-200' : 'bg-white'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          <p className="text-sm font-medium">
            {inscripcion.educando_nombre} {inscripcion.educando_apellidos}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            inscripcion.pagado
              ? 'bg-green-100 border-green-300 text-green-700'
              : 'bg-gray-100 border-gray-300 text-gray-600'
          )}
        >
          {inscripcion.pagado ? 'Pagado' : 'Sin pagar'}
        </Badge>
      </div>

      <div className="flex gap-3 text-xs">
        <div className={cn(
          'flex items-center gap-1',
          tieneCircular ? 'text-green-600' : 'text-gray-400'
        )}>
          <FileText className="h-3 w-3" />
          {tieneCircular ? 'Circular OK' : 'Sin circular'}
        </div>
        <div className={cn(
          'flex items-center gap-1',
          tieneJustificante ? 'text-green-600' : 'text-gray-400'
        )}>
          <CreditCard className="h-3 w-3" />
          {tieneJustificante ? 'Justificante OK' : 'Sin justificante'}
        </div>
      </div>
    </div>
  )
}
