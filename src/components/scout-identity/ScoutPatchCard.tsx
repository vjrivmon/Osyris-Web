'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ScoutPatchCardProps {
  children: ReactNode
  className?: string
  /** Color del borde (hex) */
  borderColor?: string
  /** Variante del efecto */
  variant?: 'default' | 'subtle' | 'strong'
  /** Mostrar efecto de puntadas internas */
  showStitches?: boolean
  /** Hover effect */
  hover?: boolean
}

/**
 * ScoutPatchCard - Tarjeta con efecto de parche scout bordado
 *
 * Características:
 * - Borde con color scout (dorado por defecto)
 * - Efecto de puntadas/costura interna opcional
 * - Fondo con textura sutil de tela
 * - Sombra suave para profundidad
 */
export function ScoutPatchCard({
  children,
  className,
  borderColor = '#C9A66B',
  variant = 'default',
  showStitches = true,
  hover = true
}: ScoutPatchCardProps) {
  const borderWidth = variant === 'subtle' ? 1 : variant === 'strong' ? 3 : 2
  const stitchOpacity = variant === 'subtle' ? 0.25 : variant === 'strong' ? 0.6 : 0.45

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        // Fondo con textura canvas sutil
        'bg-gradient-to-br from-[#faf8f5] to-[#f5f2ed]',
        // Sombra para profundidad
        'shadow-sm',
        // Hover effect
        hover && 'transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      style={{
        border: `${borderWidth}px solid ${borderColor}`,
      }}
    >
      {/* Patrón de textura canvas */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,0,0,.015) 1px, transparent 1px),
            linear-gradient(rgba(0,0,0,.015) 1px, transparent 1px)
          `,
          backgroundSize: '4px 4px'
        }}
      />

      {/* Efecto de puntadas internas */}
      {showStitches && (
        <div
          className="absolute inset-[6px] rounded-lg pointer-events-none"
          style={{
            border: `2px dashed ${borderColor}`,
            opacity: stitchOpacity
          }}
        />
      )}

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

/**
 * CanvasBackground - Fondo con textura de tela canvas
 */
export function CanvasBackground({
  children,
  className,
  pattern = 'grid'
}: {
  children: ReactNode
  className?: string
  pattern?: 'grid' | 'diagonal' | 'dots'
}) {
  const patternStyles = {
    grid: {
      backgroundImage: `
        linear-gradient(90deg, rgba(0,0,0,.02) 1px, transparent 1px),
        linear-gradient(rgba(0,0,0,.02) 1px, transparent 1px)
      `,
      backgroundSize: '4px 4px'
    },
    diagonal: {
      backgroundImage: `
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(0,0,0,.015) 10px,
          rgba(0,0,0,.015) 11px
        )
      `
    },
    dots: {
      backgroundImage: `radial-gradient(circle, rgba(0,0,0,.03) 1px, transparent 1px)`,
      backgroundSize: '8px 8px'
    }
  }

  return (
    <div
      className={cn('bg-[#f8f6f3]', className)}
      style={patternStyles[pattern]}
    >
      {children}
    </div>
  )
}

/**
 * StitchedBorder - Borde con efecto de puntadas
 */
export function StitchedBorder({
  children,
  className,
  color = '#C9A66B',
  dashSize = 8,
  gapSize = 4
}: {
  children: ReactNode
  className?: string
  color?: string
  dashSize?: number
  gapSize?: number
}) {
  return (
    <div
      className={cn('relative', className)}
      style={{
        border: `2px dashed ${color}`,
        borderRadius: '8px',
        // Custom dash pattern usando SVG background
        backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='${encodeURIComponent(color)}' stroke-width='2' stroke-dasharray='${dashSize}%2c ${gapSize}' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e")`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * ScoutHeroBackground - Fondo con patrón sutil para headers verdes
 * Efecto de líneas topográficas/scout
 */
export function ScoutHeroBackground({
  children,
  className,
  pattern = 'topographic'
}: {
  children: ReactNode
  className?: string
  pattern?: 'topographic' | 'diagonal' | 'grid'
}) {
  const patternStyles = {
    topographic: {
      backgroundImage: `
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 40px,
          rgba(255,255,255,0.03) 40px,
          rgba(255,255,255,0.03) 41px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 40px,
          rgba(255,255,255,0.03) 40px,
          rgba(255,255,255,0.03) 41px
        ),
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 20px,
          rgba(255,255,255,0.02) 20px,
          rgba(255,255,255,0.02) 21px
        )
      `
    },
    diagonal: {
      backgroundImage: `
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 15px,
          rgba(255,255,255,0.04) 15px,
          rgba(255,255,255,0.04) 16px
        ),
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 15px,
          rgba(255,255,255,0.04) 15px,
          rgba(255,255,255,0.04) 16px
        )
      `
    },
    grid: {
      backgroundImage: `
        linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px),
        linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px)
      `,
      backgroundSize: '30px 30px'
    }
  }

  return (
    <div
      className={cn('relative', className)}
      style={patternStyles[pattern]}
    >
      {/* Efecto de viñeta sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 100%)'
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default ScoutPatchCard
