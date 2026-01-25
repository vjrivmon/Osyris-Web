'use client'

import { cn } from '@/lib/utils'

export interface FleurDeLisProps {
  size?: number
  color?: string
  opacity?: number
  className?: string
  /** Si es true, añade sombra sutil */
  shadow?: boolean
}

/**
 * FleurDeLis - Flor de lis decorativa scout
 * Diseño basado en la flor de lis del logo del Grupo Scout Osyris
 * con los tres pétalos característicos y las ondulaciones laterales
 */
export function FleurDeLis({
  size = 40,
  color = 'currentColor',
  opacity = 1,
  className,
  shadow = false
}: FleurDeLisProps) {
  const shadowId = `fleur-shadow-${Math.random().toString(36).substr(2, 9)}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      className={cn('select-none', className)}
      style={{ opacity }}
      aria-hidden="true"
      role="presentation"
    >
      {shadow && (
        <defs>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>
      )}

      <g fill={color} filter={shadow ? `url(#${shadowId})` : undefined}>
        {/* Pétalo central superior - la punta principal */}
        <path
          d="M50 2
             C50 2, 44 12, 44 25
             C44 35, 46 42, 50 50
             C54 42, 56 35, 56 25
             C56 12, 50 2, 50 2Z"
        />

        {/* Pétalo izquierdo - curva hacia afuera */}
        <path
          d="M44 50
             C40 48, 32 42, 22 40
             C12 38, 5 42, 8 52
             C11 62, 22 68, 35 65
             C42 63, 44 58, 44 50Z"
        />

        {/* Pétalo derecho - curva hacia afuera */}
        <path
          d="M56 50
             C60 48, 68 42, 78 40
             C88 38, 95 42, 92 52
             C89 62, 78 68, 65 65
             C58 63, 56 58, 56 50Z"
        />

        {/* Ondulación/voluta inferior izquierda */}
        <path
          d="M35 65
             C28 68, 18 72, 12 82
             C8 90, 15 92, 22 88
             C30 84, 38 76, 42 68
             C40 67, 37 66, 35 65Z"
        />

        {/* Ondulación/voluta inferior derecha */}
        <path
          d="M65 65
             C72 68, 82 72, 88 82
             C92 90, 85 92, 78 88
             C70 84, 62 76, 58 68
             C60 67, 63 66, 65 65Z"
        />

        {/* Cuerpo central que une todo */}
        <path
          d="M44 50
             L44 70
             C44 72, 46 74, 50 74
             C54 74, 56 72, 56 70
             L56 50
             C54 55, 50 58, 50 58
             C50 58, 46 55, 44 50Z"
        />

        {/* Base/tallo inferior */}
        <path
          d="M46 74
             L46 115
             C46 117, 48 118, 50 118
             C52 118, 54 117, 54 115
             L54 74
             C52 74, 50 74, 50 74
             C50 74, 48 74, 46 74Z"
        />

        {/* Banda horizontal decorativa (como en el logo) */}
        <rect x="40" y="68" width="20" height="4" rx="2" />
      </g>
    </svg>
  )
}

export default FleurDeLis
