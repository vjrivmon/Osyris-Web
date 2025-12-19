'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getTipoEventoConfig, TipoEvento } from './tipos-evento'

interface TipoEventoBadgeProps {
  tipo: TipoEvento | string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showLabel?: boolean
  className?: string
}

export function TipoEventoBadge({
  tipo,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className
}: TipoEventoBadgeProps) {
  const config = getTipoEventoConfig(tipo)
  const Icon = config.icon

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-1.5 py-0.5'
      case 'md':
        return 'text-sm px-2 py-0.5'
      case 'lg':
        return 'text-base px-2.5 py-1'
      default:
        return 'text-sm px-2 py-0.5'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3'
      case 'md':
        return 'h-3.5 w-3.5'
      case 'lg':
        return 'h-4 w-4'
      default:
        return 'h-3.5 w-3.5'
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1',
        config.bgColor,
        config.textColor,
        config.borderColor,
        'border',
        getSizeClasses(),
        className
      )}
    >
      {showIcon && <Icon className={getIconSize()} />}
      {showLabel && <span>{config.label}</span>}
    </Badge>
  )
}

interface TipoEventoDotProps {
  tipo: TipoEvento | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TipoEventoDot({
  tipo,
  size = 'md',
  className
}: TipoEventoDotProps) {
  const config = getTipoEventoConfig(tipo)

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2 w-2'
      case 'md':
        return 'h-2.5 w-2.5'
      case 'lg':
        return 'h-3 w-3'
      default:
        return 'h-2.5 w-2.5'
    }
  }

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        config.dotColor,
        getSizeClasses(),
        className
      )}
      title={config.label}
    />
  )
}
