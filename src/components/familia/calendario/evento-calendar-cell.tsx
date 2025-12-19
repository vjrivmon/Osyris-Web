'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getTipoEventoConfig } from './tipos-evento'
import { TipoEventoDot } from './tipo-evento-badge'
import { AsistenciaCounter } from './asistencia-counter'

interface EventoData {
  id: number
  titulo: string
  tipo: string
  seccion?: string
  fechaInicio: Date
  requiereConfirmacion?: boolean
  requiereInscripcion?: boolean
  confirmaciones?: {
    confirmados: number
    noAsisten: number
    pendientes: number
  }
  inscripcion?: {
    inscrito: boolean
    estado?: 'pendiente' | 'inscrito' | 'no_asiste'
  }
}

interface EventoCalendarCellProps {
  evento: EventoData
  onClick?: () => void
  compact?: boolean
  className?: string
}

export function EventoCalendarCell({
  evento,
  onClick,
  compact = false,
  className
}: EventoCalendarCellProps) {
  const tipoConfig = getTipoEventoConfig(evento.tipo)
  const Icon = tipoConfig.icon

  if (compact) {
    return (
      <div
        className={cn(
          'text-xs p-1 rounded cursor-pointer transition-all',
          'hover:shadow-sm hover:opacity-90',
          tipoConfig.bgColor,
          className
        )}
        style={{ borderLeft: `3px solid` }}
        onClick={onClick}
      >
        <div className="flex items-center gap-1">
          <TipoEventoDot tipo={evento.tipo} size="sm" />
          <span className="font-medium truncate">{evento.titulo}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'text-xs p-1.5 rounded-md cursor-pointer transition-all',
        'hover:shadow-sm hover:scale-[1.02]',
        tipoConfig.bgColor,
        tipoConfig.borderColor,
        'border-l-4',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="font-medium truncate">{evento.titulo}</span>
      </div>

      <div className="flex items-center justify-between">
        {evento.tipo === 'campamento' && evento.inscripcion && !evento.inscripcion.inscrito && (
          <Badge variant="outline" className="text-[10px] px-1 py-0 bg-white/50">
            Inscribete
          </Badge>
        )}

        {evento.tipo === 'campamento' && evento.inscripcion?.inscrito && (
          <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-50 text-green-700 border-green-300">
            Inscrito
          </Badge>
        )}

        {evento.requiereConfirmacion && evento.confirmaciones && (
          <AsistenciaCounter
            confirmados={evento.confirmaciones.confirmados}
            noAsisten={evento.confirmaciones.noAsisten}
            pendientes={evento.confirmaciones.pendientes}
            size="sm"
            variant="minimal"
          />
        )}
      </div>
    </div>
  )
}

interface EventoCalendarCellMultipleProps {
  eventos: EventoData[]
  maxVisible?: number
  onEventoClick?: (evento: EventoData) => void
  onVerMasClick?: () => void
  className?: string
}

export function EventoCalendarCellMultiple({
  eventos,
  maxVisible = 2,
  onEventoClick,
  onVerMasClick,
  className
}: EventoCalendarCellMultipleProps) {
  const eventosVisibles = eventos.slice(0, maxVisible)
  const eventosOcultos = eventos.length - maxVisible

  return (
    <div className={cn('space-y-1', className)}>
      {eventosVisibles.map(evento => (
        <EventoCalendarCell
          key={evento.id}
          evento={evento}
          onClick={() => onEventoClick?.(evento)}
          compact={eventos.length > 1}
        />
      ))}

      {eventosOcultos > 0 && (
        <button
          onClick={onVerMasClick}
          className="text-xs text-gray-500 hover:text-gray-700 w-full text-left pl-1"
        >
          +{eventosOcultos} mas
        </button>
      )}
    </div>
  )
}

interface DiaCalendarioProps {
  dia: number | null
  esHoy?: boolean
  eventos: EventoData[]
  onDiaClick?: () => void
  onEventoClick?: (evento: EventoData) => void
  className?: string
}

export function DiaCalendario({
  dia,
  esHoy = false,
  eventos,
  onDiaClick,
  onEventoClick,
  className
}: DiaCalendarioProps) {
  if (dia === null) {
    return (
      <div className={cn('min-h-[80px] p-2 border rounded-lg border-transparent', className)} />
    )
  }

  return (
    <div
      className={cn(
        'min-h-[80px] p-2 border rounded-lg transition-all duration-200',
        'hover:bg-primary/5 hover:border-primary/40 hover:shadow-md cursor-pointer',
        esHoy ? 'bg-blue-50 border-blue-200' : 'border-gray-200',
        className
      )}
      onClick={onDiaClick}
    >
      <div className={cn(
        'text-sm font-medium mb-1',
        esHoy ? 'text-blue-600' : 'text-gray-700'
      )}>
        {dia}
      </div>

      {eventos.length > 0 && (
        <EventoCalendarCellMultiple
          eventos={eventos}
          maxVisible={2}
          onEventoClick={onEventoClick}
        />
      )}
    </div>
  )
}
