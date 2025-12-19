'use client'

import { cn } from '@/lib/utils'
import { Check, X, Clock } from 'lucide-react'

interface AsistenciaBadgeKraalProps {
  confirmados: number
  noAsisten: number
  pendientes: number
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Badge de asistencia para eventos del calendario del Aula Virtual.
 * Muestra contadores de confirmados/no asisten/pendientes en formato pill.
 * Diseño compacto para celdas del calendario.
 */
export function AsistenciaBadgeKraal({
  confirmados,
  noAsisten,
  pendientes,
  size = 'sm',
  className
}: AsistenciaBadgeKraalProps) {
  const isSmall = size === 'sm'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Confirmados - Verde */}
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full font-medium',
          'bg-green-100 text-green-700',
          'dark:bg-green-900/40 dark:text-green-400',
          isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
        )}
        title="Confirmados"
      >
        <Check className={cn(isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
        {confirmados}
      </span>

      {/* No asisten - Rojo */}
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full font-medium',
          'bg-red-100 text-red-700',
          'dark:bg-red-900/40 dark:text-red-400',
          isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
        )}
        title="No asisten"
      >
        <X className={cn(isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
        {noAsisten}
      </span>

      {/* Pendientes - Amarillo (solo si hay) */}
      {pendientes > 0 && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full font-medium',
            'bg-amber-100 text-amber-700',
            'dark:bg-amber-900/40 dark:text-amber-400',
            isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
          )}
          title="Pendientes"
        >
          <Clock className={cn(isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
          {pendientes}
        </span>
      )}
    </div>
  )
}
