'use client'

import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface AsistenciaCounterProps {
  confirmados: number
  noAsisten: number
  pendientes: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'compact' | 'minimal'
  showLabels?: boolean
  className?: string
}

export function AsistenciaCounter({
  confirmados,
  noAsisten,
  pendientes,
  size = 'md',
  variant = 'full',
  showLabels = false,
  className
}: AsistenciaCounterProps) {
  const total = confirmados + noAsisten + pendientes

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs gap-1.5'
      case 'md':
        return 'text-sm gap-2'
      case 'lg':
        return 'text-base gap-3'
      default:
        return 'text-sm gap-2'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3'
      case 'md':
        return 'h-4 w-4'
      case 'lg':
        return 'h-5 w-5'
      default:
        return 'h-4 w-4'
    }
  }

  if (variant === 'minimal') {
    return (
      <span className={cn('text-gray-600', getSizeClasses(), className)}>
        {confirmados}/{total}
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center', getSizeClasses(), className)}>
        <span className="text-green-600 font-medium" title="Confirmados">
          {confirmados}
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-red-600 font-medium" title="No asisten">
          {noAsisten}
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-yellow-600 font-medium" title="Pendientes">
          {pendientes}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center', getSizeClasses(), className)}>
      <div
        className="flex items-center gap-1 text-green-600"
        title={showLabels ? undefined : `${confirmados} Confirmados`}
      >
        <CheckCircle className={getIconSize()} />
        <span className="font-medium">{confirmados}</span>
        {showLabels && <span className="text-green-700">Asisten</span>}
      </div>

      <div
        className="flex items-center gap-1 text-red-600"
        title={showLabels ? undefined : `${noAsisten} No asisten`}
      >
        <XCircle className={getIconSize()} />
        <span className="font-medium">{noAsisten}</span>
        {showLabels && <span className="text-red-700">No asisten</span>}
      </div>

      <div
        className="flex items-center gap-1 text-yellow-600"
        title={showLabels ? undefined : `${pendientes} Pendientes`}
      >
        <Clock className={getIconSize()} />
        <span className="font-medium">{pendientes}</span>
        {showLabels && <span className="text-yellow-700">Pendientes</span>}
      </div>
    </div>
  )
}

interface AsistenciaProgressProps {
  confirmados: number
  noAsisten: number
  pendientes: number
  className?: string
}

export function AsistenciaProgress({
  confirmados,
  noAsisten,
  pendientes,
  className
}: AsistenciaProgressProps) {
  const total = confirmados + noAsisten + pendientes

  if (total === 0) {
    return null
  }

  const confirmadosPct = (confirmados / total) * 100
  const noAsistenPct = (noAsisten / total) * 100
  const pendientesPct = (pendientes / total) * 100

  return (
    <div className={cn('w-full', className)}>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
        {confirmadosPct > 0 && (
          <div
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${confirmadosPct}%` }}
            title={`${confirmados} confirmados`}
          />
        )}
        {noAsistenPct > 0 && (
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${noAsistenPct}%` }}
            title={`${noAsisten} no asisten`}
          />
        )}
        {pendientesPct > 0 && (
          <div
            className="bg-yellow-400 transition-all duration-300"
            style={{ width: `${pendientesPct}%` }}
            title={`${pendientes} pendientes`}
          />
        )}
      </div>
    </div>
  )
}

interface AsistenciaCardProps {
  confirmados: number
  noAsisten: number
  pendientes: number
  className?: string
}

export function AsistenciaCard({
  confirmados,
  noAsisten,
  pendientes,
  className
}: AsistenciaCardProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg', className)}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
          <CheckCircle className="h-4 w-4" />
          <span className="text-lg font-bold">{confirmados}</span>
        </div>
        <span className="text-xs text-gray-600">Asisten</span>
      </div>

      <div className="text-center border-x border-gray-200">
        <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
          <XCircle className="h-4 w-4" />
          <span className="text-lg font-bold">{noAsisten}</span>
        </div>
        <span className="text-xs text-gray-600">No asisten</span>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
          <Clock className="h-4 w-4" />
          <span className="text-lg font-bold">{pendientes}</span>
        </div>
        <span className="text-xs text-gray-600">Pendientes</span>
      </div>
    </div>
  )
}
