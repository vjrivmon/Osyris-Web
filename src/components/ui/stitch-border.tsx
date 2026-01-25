'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type StitchStyle = 'dashed' | 'running' | 'cross' | 'blanket'

interface StitchBorderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Estilo de las puntadas */
  stitchStyle?: StitchStyle
  /** Color del hilo */
  color?: string
  /** Espaciado entre puntadas */
  spacing?: number
  /** Grosor del hilo */
  thickness?: number
  /** Padding interno */
  padding?: number
  children: React.ReactNode
}

/**
 * StitchBorder - Borde con efecto de costura/puntadas
 *
 * Simula el efecto de un borde cosido a mano, como en los
 * parches y badges scout.
 *
 * Estilos:
 * - dashed: Puntadas cortas (- - - -)
 * - running: Puntadas largas (── ── ──)
 * - cross: Puntadas en X (╳ ╳ ╳)
 * - blanket: Puntadas de manta (┴ ┴ ┴)
 */
export function StitchBorder({
  stitchStyle = 'dashed',
  color = '#5C4033',
  spacing = 8,
  thickness = 2,
  padding = 16,
  className,
  children,
  ...props
}: StitchBorderProps) {
  const renderStitchBorder = () => {
    switch (stitchStyle) {
      case 'dashed':
        return <DashedStitch color={color} spacing={spacing} thickness={thickness} />
      case 'running':
        return <RunningStitch color={color} spacing={spacing} thickness={thickness} />
      case 'cross':
        return <CrossStitch color={color} spacing={spacing} thickness={thickness} />
      case 'blanket':
        return <BlanketStitch color={color} spacing={spacing} thickness={thickness} />
      default:
        return <DashedStitch color={color} spacing={spacing} thickness={thickness} />
    }
  }

  return (
    <div
      className={cn('relative', className)}
      style={{ padding }}
      {...props}
    >
      {/* Borde de puntadas SVG */}
      {renderStitchBorder()}

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

interface StitchProps {
  color: string
  spacing: number
  thickness: number
}

/**
 * Puntadas cortas estilo dashed
 */
function DashedStitch({ color, spacing, thickness }: StitchProps) {
  const dashLength = spacing * 0.6
  const gap = spacing * 0.4

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
    >
      <rect
        x={thickness}
        y={thickness}
        width="calc(100% - 4px)"
        height="calc(100% - 4px)"
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={`${dashLength} ${gap}`}
        rx="4"
        style={{
          width: `calc(100% - ${thickness * 2}px)`,
          height: `calc(100% - ${thickness * 2}px)`
        }}
      />
    </svg>
  )
}

/**
 * Puntadas largas estilo running stitch
 */
function RunningStitch({ color, spacing, thickness }: StitchProps) {
  const dashLength = spacing * 1.5
  const gap = spacing * 0.5

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
    >
      <rect
        x={thickness}
        y={thickness}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={`${dashLength} ${gap}`}
        strokeLinecap="round"
        rx="6"
        style={{
          width: `calc(100% - ${thickness * 2}px)`,
          height: `calc(100% - ${thickness * 2}px)`
        }}
      />
    </svg>
  )
}

/**
 * Puntadas en X (cross stitch)
 */
function CrossStitch({ color, spacing, thickness }: StitchProps) {
  const crossSize = spacing * 0.8

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
    >
      <defs>
        <pattern
          id="cross-pattern"
          width={spacing}
          height={spacing}
          patternUnits="userSpaceOnUse"
        >
          <line
            x1={spacing * 0.2}
            y1={spacing * 0.2}
            x2={spacing * 0.8}
            y2={spacing * 0.8}
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
          <line
            x1={spacing * 0.8}
            y1={spacing * 0.2}
            x2={spacing * 0.2}
            y2={spacing * 0.8}
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
        </pattern>
      </defs>

      {/* Borde superior */}
      <rect x="0" y="0" width="100%" height={spacing} fill="url(#cross-pattern)" />
      {/* Borde inferior */}
      <rect x="0" y={`calc(100% - ${spacing}px)`} width="100%" height={spacing} fill="url(#cross-pattern)" />
      {/* Borde izquierdo */}
      <rect x="0" y={spacing} width={spacing} height={`calc(100% - ${spacing * 2}px)`} fill="url(#cross-pattern)" />
      {/* Borde derecho */}
      <rect x={`calc(100% - ${spacing}px)`} y={spacing} width={spacing} height={`calc(100% - ${spacing * 2}px)`} fill="url(#cross-pattern)" />
    </svg>
  )
}

/**
 * Puntadas estilo manta (blanket stitch)
 */
function BlanketStitch({ color, spacing, thickness }: StitchProps) {
  const legHeight = spacing * 0.6

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <defs>
        <pattern
          id="blanket-pattern-h"
          width={spacing}
          height={legHeight + thickness}
          patternUnits="userSpaceOnUse"
        >
          {/* Pata vertical */}
          <line
            x1={spacing / 2}
            y1="0"
            x2={spacing / 2}
            y2={legHeight}
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
          {/* Línea horizontal */}
          <line
            x1="0"
            y1={legHeight}
            x2={spacing}
            y2={legHeight}
            stroke={color}
            strokeWidth={thickness}
          />
        </pattern>
      </defs>

      {/* Borde superior */}
      <rect
        x="0"
        y="0"
        width="100%"
        height={legHeight + thickness}
        fill="url(#blanket-pattern-h)"
      />
      {/* Borde inferior (rotado) */}
      <rect
        x="0"
        y={`calc(100% - ${legHeight + thickness}px)`}
        width="100%"
        height={legHeight + thickness}
        fill="url(#blanket-pattern-h)"
        transform="scale(1, -1)"
        style={{ transformOrigin: '50% calc(100% - 5px)' }}
      />
    </svg>
  )
}

export default StitchBorder
