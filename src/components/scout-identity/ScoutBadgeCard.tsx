'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ScoutBadgeCardProps {
  children: ReactNode
  className?: string
  /** Color del acento (para esquinas y decoraciones) */
  accentColor?: string
  /** Variante del efecto */
  variant?: 'badge' | 'ribbon' | 'stamp'
  /** Mostrar esquinas decorativas */
  showCorners?: boolean
  /** Hover effect */
  hover?: boolean
}

/**
 * ScoutBadgeCard - Tarjeta con efecto de insignia scout
 *
 * Características:
 * - Esquinas decorativas estilo badge/insignia
 * - Efecto de sello o cinta opcional
 * - Ideal para valores, logros, secciones
 */
export function ScoutBadgeCard({
  children,
  className,
  accentColor = '#C9A66B',
  variant = 'badge',
  showCorners = true,
  hover = true
}: ScoutBadgeCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-visible',
        'bg-gradient-to-br from-white to-gray-50/80',
        'border border-gray-200',
        hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {/* Esquinas decorativas */}
      {showCorners && variant === 'badge' && (
        <>
          <CornerDecoration position="top-left" color={accentColor} />
          <CornerDecoration position="top-right" color={accentColor} />
          <CornerDecoration position="bottom-left" color={accentColor} />
          <CornerDecoration position="bottom-right" color={accentColor} />
        </>
      )}

      {/* Efecto de cinta en la parte superior */}
      {variant === 'ribbon' && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 px-6 py-1 rounded-full text-xs font-bold text-white shadow-md"
          style={{ backgroundColor: accentColor }}
        >
          ★
        </div>
      )}

      {/* Efecto de sello en esquina */}
      {variant === 'stamp' && (
        <div
          className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          <span className="text-lg">⚜</span>
        </div>
      )}

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

/**
 * Decoración de esquina estilo badge scout
 */
function CornerDecoration({
  position,
  color
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  color: string
}) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180'
  }

  return (
    <div className={cn('absolute w-6 h-6 pointer-events-none', positionClasses[position])}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Esquina decorativa - forma de L con detalle */}
        <path
          d="M0 0 L8 0 L8 2 L2 2 L2 8 L0 8 Z"
          fill={color}
        />
        {/* Punto decorativo */}
        <circle cx="4" cy="4" r="1.5" fill={color} opacity="0.5" />
      </svg>
    </div>
  )
}

/**
 * ScoutSectionCard - Tarjeta específica para secciones con color
 */
export function ScoutSectionCard({
  children,
  className,
  sectionColor,
  hover = true
}: {
  children: ReactNode
  className?: string
  sectionColor: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-gradient-to-br from-[#faf8f5] to-[#f5f2ed]',
        'border-2',
        hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
      style={{ borderColor: sectionColor }}
    >
      {/* Efecto de puntadas interno */}
      <div
        className="absolute inset-[6px] rounded-lg pointer-events-none"
        style={{
          border: `2px dashed ${sectionColor}`,
          opacity: 0.25
        }}
      />


      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

/**
 * ValuesCard - Tarjeta para valores con efecto de insignia
 */
export function ValuesCard({
  children,
  className,
  hover = true
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-white/10 backdrop-blur-sm',
        'border border-white/20',
        hover && 'transition-all duration-300 hover:bg-white/15 hover:border-white/30',
        className
      )}
    >
      {/* Esquinas doradas */}
      <CornerDecoration position="top-left" color="rgba(255,255,255,0.3)" />
      <CornerDecoration position="top-right" color="rgba(255,255,255,0.3)" />
      <CornerDecoration position="bottom-left" color="rgba(255,255,255,0.3)" />
      <CornerDecoration position="bottom-right" color="rgba(255,255,255,0.3)" />

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default ScoutBadgeCard
