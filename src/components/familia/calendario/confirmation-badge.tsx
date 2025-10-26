'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmationBadgeProps {
  estado: 'confirmado' | 'pendiente' | 'no_asiste'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function ConfirmationBadge({
  estado,
  size = 'md',
  showIcon = true,
  className
}: ConfirmationBadgeProps) {
  const getBadgeConfig = () => {
    switch (estado) {
      case 'confirmado':
        return {
          variant: 'default' as const,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          label: 'Confirmado',
          shortLabel: '✅'
        }
      case 'pendiente':
        return {
          variant: 'secondary' as const,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          icon: Clock,
          label: 'Pendiente',
          shortLabel: '⏰'
        }
      case 'no_asiste':
        return {
          variant: 'destructive' as const,
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          icon: XCircle,
          label: 'No asistirá',
          shortLabel: '❌'
        }
      default:
        return {
          variant: 'secondary' as const,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: Clock,
          label: 'Desconocido',
          shortLabel: '?'
        }
    }
  }

  const config = getBadgeConfig()
  const Icon = config.icon

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5'
      case 'md':
        return 'text-sm px-2.5 py-1'
      case 'lg':
        return 'text-base px-3 py-1.5'
      default:
        return 'text-sm px-2.5 py-1'
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

  // Versión compacta para vistas pequeñas
  if (size === 'sm') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium',
          config.bgColor,
          config.textColor,
          getSizeClasses(),
          className
        )}
        title={config.label}
      >
        {config.shortLabel}
      </span>
    )
  }

  // Versión normal con icono y texto
  return (
    <Badge
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1.5',
        config.bgColor,
        config.textColor,
        config.borderColor,
        'border',
        getSizeClasses(),
        className
      )}
    >
      {showIcon && <Icon className={getIconSize()} />}
      <span>{config.label}</span>
    </Badge>
  )
}

// Componente específico para estado de confirmación por scout
interface ScoutConfirmationBadgeProps {
  scoutNombre: string
  estado: 'confirmado' | 'pendiente' | 'no_asiste'
  size?: 'sm' | 'md'
  className?: string
}

export function ScoutConfirmationBadge({
  scoutNombre,
  estado,
  size = 'sm',
  className
}: ScoutConfirmationBadgeProps) {
  const getTooltipText = () => {
    switch (estado) {
      case 'confirmado':
        return `${scoutNombre} confirmó asistencia`
      case 'pendiente':
        return `Esperando confirmación de ${scoutNombre}`
      case 'no_asiste':
        return `${scoutNombre} no asistirá`
      default:
        return `Estado desconocido para ${scoutNombre}`
    }
  }

  return (
    <div
      className={cn('inline-flex items-center space-x-1', className)}
      title={getTooltipText()}
    >
      <span className="text-xs text-gray-600">
        {scoutNombre.split(' ')[0]} {/* Solo el primer nombre */}
      </span>
      <ConfirmationBadge
        estado={estado}
        size={size}
        showIcon={true}
      />
    </div>
  )
}