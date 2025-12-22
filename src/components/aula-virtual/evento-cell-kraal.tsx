'use client'

import { cn } from '@/lib/utils'
import { Pencil } from 'lucide-react'
import { AsistenciaBadgeKraal } from './asistencia-badge-kraal'
import { getTipoEventoConfig, TipoEvento } from '@/components/familia/calendario/tipos-evento'

export interface Actividad {
  id: number
  titulo: string
  tipo: TipoEvento | string
  fecha_inicio: string
  fecha_fin?: string
  hora_inicio?: string
  hora_fin?: string
  lugar?: string
  confirmados?: number
  no_asisten?: number
  pendientes?: number
  seccion_nombre?: string
}

interface EventoCellKraalProps {
  evento: Actividad
  onEdit: () => void
  onViewAsistencia: () => void
  className?: string
}

/**
 * Celda de evento para el calendario del Aula Virtual.
 * - Click en el evento -> abre modal de asistencia
 * - Click en icono de lapiz -> abre modal de edicion
 *
 * Diseno mejorado con badges pill-style que encajan con el design system.
 */
export function EventoCellKraal({
  evento,
  onEdit,
  onViewAsistencia,
  className
}: EventoCellKraalProps) {
  const tipoConfig = getTipoEventoConfig(evento.tipo as TipoEvento)
  const TipoIcon = tipoConfig.icon

  return (
    <div
      onClick={onViewAsistencia}
      className={cn(
        // Base - padding reducido en móvil
        'relative text-xs p-1 sm:p-2 rounded-lg cursor-pointer group',
        // Fondo y borde
        tipoConfig.bgColor,
        'border-l-4',
        // Transiciones y hover
        'transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02]',
        // Dark mode
        'dark:bg-opacity-30',
        className
      )}
      style={{ borderLeftColor: tipoConfig.hexColor }}
    >
      {/* Boton editar - esquina superior derecha (solo desktop) */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
        className={cn(
          'absolute top-1 right-1 p-1 rounded-md hidden sm:block',
          'opacity-0 group-hover:opacity-100',
          'transition-all duration-200',
          'hover:bg-white/60 dark:hover:bg-black/30',
          'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1',
          'focus:ring-blue-500'
        )}
        title="Editar evento"
        aria-label="Editar evento"
      >
        <Pencil className="h-3 w-3 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Vista MOVIL: solo icono centrado + indicador de confirmados */}
      <div className="sm:hidden flex flex-col items-center justify-center h-full">
        <TipoIcon className={cn('h-4 w-4', tipoConfig.textColor)} />
        {(evento.confirmados || 0) > 0 && (
          <span className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-0.5">
            {evento.confirmados}
          </span>
        )}
      </div>

      {/* Vista DESKTOP: titulo completo + badge de asistencia */}
      <div className="hidden sm:block">
        {/* Titulo con icono */}
        <div className="flex items-start gap-1.5 mb-1.5 pr-5">
          <TipoIcon className={cn('h-3.5 w-3.5 flex-shrink-0 mt-0.5', tipoConfig.textColor)} />
          <span className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">
            {evento.titulo}
          </span>
        </div>

        {/* Badge de asistencia */}
        <AsistenciaBadgeKraal
          confirmados={evento.confirmados || 0}
          noAsisten={evento.no_asisten || 0}
          pendientes={evento.pendientes || 0}
          size="sm"
        />
      </div>
    </div>
  )
}
