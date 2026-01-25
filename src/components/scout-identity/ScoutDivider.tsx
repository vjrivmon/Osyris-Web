'use client'

import { cn } from '@/lib/utils'

export type ScoutDividerVariant = 'simple' | 'dots' | 'diamond' | 'cross' | 'double'

interface ScoutDividerProps {
  variant?: ScoutDividerVariant
  className?: string
  /** Color de las líneas y elementos (hex) */
  color?: string
}

/**
 * ScoutDivider - Separador elegante con identidad scout
 *
 * Variantes:
 * - simple: Línea dorada con gradiente
 * - dots: Línea con tres puntos centrales
 * - diamond: Línea con rombo central
 * - cross: Línea con cruz scout central
 * - double: Doble línea decorativa
 */
export function ScoutDivider({
  variant = 'dots',
  className,
  color = '#C9A66B'
}: ScoutDividerProps) {
  return (
    <div className={cn('w-full py-8', className)}>
      {variant === 'simple' && <SimpleDivider color={color} />}
      {variant === 'dots' && <DotsDivider color={color} />}
      {variant === 'diamond' && <DiamondDivider color={color} />}
      {variant === 'cross' && <CrossDivider color={color} />}
      {variant === 'double' && <DoubleDivider color={color} />}
    </div>
  )
}

/**
 * Línea simple con gradiente
 */
function SimpleDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center px-8 max-w-4xl mx-auto">
      <div
        className="flex-1 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color} 20%, ${color} 80%, transparent 100%)`
        }}
      />
    </div>
  )
}

/**
 * Línea con tres puntos centrales - Estilo minimalista scout
 */
function DotsDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center px-8 gap-4 max-w-4xl mx-auto">
      {/* Línea izquierda */}
      <div
        className="flex-1 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color} 40%, ${color} 100%)`
        }}
      />

      {/* Tres puntos */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Línea derecha */}
      <div
        className="flex-1 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color} 0%, ${color} 60%, transparent 100%)`
        }}
      />
    </div>
  )
}

/**
 * Línea con rombo central
 */
function DiamondDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center px-8 gap-4 max-w-4xl mx-auto">
      {/* Línea izquierda */}
      <div
        className="flex-1 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color} 40%, ${color} 100%)`
        }}
      />

      {/* Rombo */}
      <div
        className="w-4 h-4 rotate-45"
        style={{ backgroundColor: color }}
      />

      {/* Línea derecha */}
      <div
        className="flex-1 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color} 0%, ${color} 60%, transparent 100%)`
        }}
      />
    </div>
  )
}

/**
 * Línea con cruz scout central
 */
function CrossDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center px-8 gap-4 max-w-4xl mx-auto">
      {/* Línea izquierda */}
      <div
        className="flex-1 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color} 40%, ${color} 100%)`
        }}
      />

      {/* Cruz */}
      <div className="relative w-6 h-6">
        <div
          className="absolute top-1/2 left-0 w-full h-[3px] -translate-y-1/2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Línea derecha */}
      <div
        className="flex-1 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color} 0%, ${color} 60%, transparent 100%)`
        }}
      />
    </div>
  )
}

/**
 * Doble línea decorativa
 */
function DoubleDivider({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-8 max-w-4xl mx-auto">
      <div
        className="w-3/4 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color} 20%, ${color} 80%, transparent 100%)`
        }}
      />
      <div
        className="w-1/2 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}80 30%, ${color}80 70%, transparent 100%)`
        }}
      />
    </div>
  )
}

export default ScoutDivider
