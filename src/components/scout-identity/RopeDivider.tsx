'use client'

import { cn } from '@/lib/utils'

export type RopeDividerVariant = 'simple' | 'wavy' | 'knot' | 'plant'
export type RopeThickness = 'thin' | 'medium' | 'thick'

interface RopeDividerProps {
  variant?: RopeDividerVariant
  className?: string
}

/**
 * RopeDivider - Separador de cuerda trenzada scout
 * Diseño basado en la cuerda dorada del logo del Grupo Scout Osyris
 *
 * REDISEÑO COMPLETO - Cuerda trenzada realista con 3 hebras
 */
export function RopeDivider({
  variant = 'simple',
  className,
}: RopeDividerProps) {
  const getHeight = () => {
    switch (variant) {
      case 'knot':
        return 100
      case 'plant':
        return 140
      default:
        return 50
    }
  }

  return (
    <div
      className={cn(
        'w-full overflow-visible select-none',
        className
      )}
      style={{ height: getHeight() }}
      aria-hidden="true"
      role="presentation"
    >
      {variant === 'simple' && <BraidedRope />}
      {variant === 'wavy' && <WavyBraidedRope />}
      {variant === 'knot' && <KnotBraidedRope />}
      {variant === 'plant' && <PlantBraidedRope />}
    </div>
  )
}

// Colores de la cuerda basados en el logo
const ROPE_COLORS = {
  light: '#E8D5A8',   // Hebra clara
  medium: '#C9A66B',  // Hebra media (color principal)
  dark: '#A07D4A',    // Hebra oscura
  shadow: '#7D5F35',  // Sombra
  highlight: '#F5EBC9' // Brillo
}

/**
 * Cuerda trenzada simple - 3 hebras entrelazadas
 */
function BraidedRope() {
  const ropeWidth = 28
  const segmentWidth = 20
  const numSegments = 65

  return (
    <svg
      viewBox={`0 0 1300 50`}
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      {/* Sombra de la cuerda */}
      <ellipse
        cx="650"
        cy="30"
        rx="640"
        ry="8"
        fill={ROPE_COLORS.shadow}
        opacity="0.2"
      />

      {/* Cuerda trenzada con 3 hebras */}
      <g>
        {Array.from({ length: numSegments }).map((_, i) => {
          const x = i * segmentWidth
          const phase = i % 3

          return (
            <g key={i}>
              {/* Hebra trasera (la que va por detrás) */}
              <ellipse
                cx={x + segmentWidth / 2}
                cy={25}
                rx={segmentWidth / 2 + 2}
                ry={ropeWidth / 2 - 2}
                fill={phase === 0 ? ROPE_COLORS.dark : phase === 1 ? ROPE_COLORS.light : ROPE_COLORS.medium}
                opacity={0.7}
              />

              {/* Hebra del medio */}
              <ellipse
                cx={x + segmentWidth / 2}
                cy={25}
                rx={segmentWidth / 2}
                ry={ropeWidth / 2 - 4}
                fill={phase === 1 ? ROPE_COLORS.dark : phase === 2 ? ROPE_COLORS.light : ROPE_COLORS.medium}
              />

              {/* Hebra frontal (la que cruza por encima) */}
              <path
                d={`M${x},${25 - ropeWidth/3}
                    Q${x + segmentWidth/2},${phase === 0 ? 25 + ropeWidth/3 : 25 - ropeWidth/3}
                    ${x + segmentWidth},${25 - ropeWidth/3}`}
                stroke={phase === 2 ? ROPE_COLORS.dark : phase === 0 ? ROPE_COLORS.light : ROPE_COLORS.medium}
                strokeWidth={ropeWidth / 3}
                fill="none"
                strokeLinecap="round"
              />

              {/* Línea de cruce diagonal */}
              <path
                d={`M${x + 2},${25 + ropeWidth/3}
                    Q${x + segmentWidth/2},${phase === 0 ? 25 - ropeWidth/3 : 25 + ropeWidth/3}
                    ${x + segmentWidth - 2},${25 + ropeWidth/3}`}
                stroke={phase === 0 ? ROPE_COLORS.dark : phase === 1 ? ROPE_COLORS.light : ROPE_COLORS.medium}
                strokeWidth={ropeWidth / 3}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          )
        })}
      </g>

      {/* Highlight superior */}
      <rect
        x="0"
        y="12"
        width="100%"
        height="3"
        fill={ROPE_COLORS.highlight}
        opacity="0.4"
        rx="1.5"
      />
    </svg>
  )
}

/**
 * Cuerda trenzada ondulada
 */
function WavyBraidedRope() {
  const amplitude = 12
  const wavelength = 200

  return (
    <svg
      viewBox="0 0 1300 50"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        {/* Gradiente para simular el trenzado */}
        <linearGradient id="rope-gradient-wavy" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={ROPE_COLORS.light} />
          <stop offset="30%" stopColor={ROPE_COLORS.medium} />
          <stop offset="70%" stopColor={ROPE_COLORS.dark} />
          <stop offset="100%" stopColor={ROPE_COLORS.shadow} />
        </linearGradient>

        {/* Patrón de trenzado diagonal */}
        <pattern id="braid-pattern-wavy" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill={ROPE_COLORS.medium} />
          <path d="M0,0 L8,16 M8,0 L16,16 M-8,0 L0,16 M16,0 L24,16"
                stroke={ROPE_COLORS.light} strokeWidth="4" />
          <path d="M4,0 L12,16 M-4,0 L4,16 M12,0 L20,16"
                stroke={ROPE_COLORS.dark} strokeWidth="3" />
        </pattern>
      </defs>

      {/* Sombra */}
      <path
        d={`M0,28 Q${wavelength/4},${28-amplitude} ${wavelength/2},28
            Q${wavelength*3/4},${28+amplitude} ${wavelength},28
            Q${wavelength*5/4},${28-amplitude} ${wavelength*3/2},28
            Q${wavelength*7/4},${28+amplitude} ${wavelength*2},28
            Q${wavelength*9/4},${28-amplitude} ${wavelength*5/2},28
            Q${wavelength*11/4},${28+amplitude} ${wavelength*3},28
            L1300,28`}
        stroke={ROPE_COLORS.shadow}
        strokeWidth="30"
        fill="none"
        strokeLinecap="round"
        opacity="0.25"
        transform="translate(0, 4)"
      />

      {/* Cuerda principal con patrón */}
      <path
        d={`M0,25 Q${wavelength/4},${25-amplitude} ${wavelength/2},25
            Q${wavelength*3/4},${25+amplitude} ${wavelength},25
            Q${wavelength*5/4},${25-amplitude} ${wavelength*3/2},25
            Q${wavelength*7/4},${25+amplitude} ${wavelength*2},25
            Q${wavelength*9/4},${25-amplitude} ${wavelength*5/2},25
            Q${wavelength*11/4},${25+amplitude} ${wavelength*3},25
            L1300,25`}
        stroke="url(#braid-pattern-wavy)"
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
      />

      {/* Highlight superior siguiendo la onda */}
      <path
        d={`M0,17 Q${wavelength/4},${17-amplitude} ${wavelength/2},17
            Q${wavelength*3/4},${17+amplitude} ${wavelength},17
            Q${wavelength*5/4},${17-amplitude} ${wavelength*3/2},17
            Q${wavelength*7/4},${17+amplitude} ${wavelength*2},17
            Q${wavelength*9/4},${17-amplitude} ${wavelength*5/2},17
            Q${wavelength*11/4},${17+amplitude} ${wavelength*3},17
            L1300,17`}
        stroke={ROPE_COLORS.highlight}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

/**
 * Cuerda con nudo scout central
 */
function KnotBraidedRope() {
  return (
    <svg
      viewBox="0 0 1300 100"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="rope-grad-knot" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={ROPE_COLORS.light} />
          <stop offset="50%" stopColor={ROPE_COLORS.medium} />
          <stop offset="100%" stopColor={ROPE_COLORS.dark} />
        </linearGradient>

        <pattern id="braid-pattern-knot" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill={ROPE_COLORS.medium} />
          <path d="M0,0 L7,14 M7,0 L14,14 M-7,0 L0,14 M14,0 L21,14"
                stroke={ROPE_COLORS.light} strokeWidth="3" />
          <path d="M3.5,0 L10.5,14 M-3.5,0 L3.5,14"
                stroke={ROPE_COLORS.dark} strokeWidth="2" />
        </pattern>
      </defs>

      {/* Sombra cuerda izquierda */}
      <rect x="0" y="54" width="480" height="24" rx="12" fill={ROPE_COLORS.shadow} opacity="0.2" />

      {/* Cuerda izquierda */}
      <rect x="0" y="50" width="480" height="24" rx="12" fill="url(#braid-pattern-knot)" />
      <rect x="0" y="50" width="480" height="5" rx="2" fill={ROPE_COLORS.highlight} opacity="0.4" />

      {/* NUDO CENTRAL */}
      <g transform="translate(650, 50)">
        {/* Sombra del nudo */}
        <ellipse cx="3" cy="5" rx="55" ry="40" fill={ROPE_COLORS.shadow} opacity="0.3" />

        {/* Lazo superior del nudo */}
        <path
          d="M-50,0 C-50,-35 -20,-45 0,-30 C20,-45 50,-35 50,0"
          stroke="url(#braid-pattern-knot)"
          strokeWidth="22"
          fill="none"
          strokeLinecap="round"
        />

        {/* Lazo inferior del nudo */}
        <path
          d="M-50,0 C-50,35 -20,45 0,30 C20,45 50,35 50,0"
          stroke="url(#braid-pattern-knot)"
          strokeWidth="22"
          fill="none"
          strokeLinecap="round"
        />

        {/* Centro del nudo - donde se cruzan */}
        <ellipse cx="0" cy="0" rx="20" ry="15" fill={ROPE_COLORS.medium} />
        <ellipse cx="0" cy="0" rx="18" ry="13" fill="url(#braid-pattern-knot)" />

        {/* Cruces en el centro */}
        <path d="M-12,-8 L12,8" stroke={ROPE_COLORS.dark} strokeWidth="8" strokeLinecap="round" />
        <path d="M-12,8 L12,-8" stroke={ROPE_COLORS.light} strokeWidth="8" strokeLinecap="round" />

        {/* Highlight del nudo */}
        <path
          d="M-45,-5 C-45,-30 -18,-40 0,-28"
          stroke={ROPE_COLORS.highlight}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      {/* Sombra cuerda derecha */}
      <rect x="820" y="54" width="480" height="24" rx="12" fill={ROPE_COLORS.shadow} opacity="0.2" />

      {/* Cuerda derecha */}
      <rect x="820" y="50" width="480" height="24" rx="12" fill="url(#braid-pattern-knot)" />
      <rect x="820" y="50" width="480" height="5" rx="2" fill={ROPE_COLORS.highlight} opacity="0.4" />
    </svg>
  )
}

/**
 * Cuerda con planta Osyris central
 */
function PlantBraidedRope() {
  const leafColor = '#3A5A40'
  const leafLight = '#5A7D60'
  const leafDark = '#2D4A32'
  const flowerRed = '#DC2626'
  const flowerDark = '#B91C1C'
  const flowerCenter = '#FBBF24'
  const stemColor = '#2D4A32'

  return (
    <svg
      viewBox="0 0 1300 140"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      <defs>
        <pattern id="braid-pattern-plant" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill={ROPE_COLORS.medium} />
          <path d="M0,0 L7,14 M7,0 L14,14 M-7,0 L0,14"
                stroke={ROPE_COLORS.light} strokeWidth="3" />
          <path d="M3.5,0 L10.5,14"
                stroke={ROPE_COLORS.dark} strokeWidth="2" />
        </pattern>
      </defs>

      {/* Sombra cuerda izquierda */}
      <rect x="0" y="94" width="430" height="24" rx="12" fill={ROPE_COLORS.shadow} opacity="0.2" />

      {/* Cuerda izquierda */}
      <rect x="0" y="90" width="430" height="24" rx="12" fill="url(#braid-pattern-plant)" />
      <rect x="0" y="90" width="430" height="5" rx="2" fill={ROPE_COLORS.highlight} opacity="0.4" />

      {/* ===== PLANTA OSYRIS CENTRAL ===== */}
      <g transform="translate(650, 85)">
        {/* Sombra de la planta */}
        <ellipse cx="5" cy="30" rx="80" ry="12" fill="rgba(0,0,0,0.15)" />

        {/* Tallo principal */}
        <path
          d="M0,20 C-2,10 0,-10 0,-40 C0,-60 2,-70 0,-75"
          stroke={stemColor}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />

        {/* Tallos secundarios */}
        <path d="M-2,-30 C-15,-35 -30,-40 -50,-45" stroke={stemColor} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M2,-30 C15,-35 30,-40 50,-45" stroke={stemColor} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M-2,-15 C-20,-18 -40,-20 -60,-15" stroke={stemColor} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M2,-15 C20,-18 40,-20 60,-15" stroke={stemColor} strokeWidth="5" fill="none" strokeLinecap="round" />

        {/* HOJAS IZQUIERDAS */}
        {/* Hoja grande superior */}
        <path d="M-8,-25 C-30,-35 -60,-45 -80,-60 C-65,-40 -35,-28 -8,-25" fill={leafColor} />
        <path d="M-10,-25 L-65,-50" stroke={leafDark} strokeWidth="2" opacity="0.4" />

        {/* Hoja media */}
        <path d="M-8,-12 C-35,-15 -70,-18 -85,-30 C-65,-12 -35,-5 -8,-10" fill={leafLight} />
        <path d="M-10,-11 L-70,-22" stroke={leafDark} strokeWidth="2" opacity="0.4" />

        {/* Hoja inferior */}
        <path d="M-6,5 C-30,0 -60,-5 -75,-20 C-55,0 -30,10 -6,8" fill={leafColor} opacity="0.9" />

        {/* HOJAS DERECHAS (espejo) */}
        <path d="M8,-25 C30,-35 60,-45 80,-60 C65,-40 35,-28 8,-25" fill={leafColor} />
        <path d="M10,-25 L65,-50" stroke={leafDark} strokeWidth="2" opacity="0.4" />

        <path d="M8,-12 C35,-15 70,-18 85,-30 C65,-12 35,-5 8,-10" fill={leafLight} />
        <path d="M10,-11 L70,-22" stroke={leafDark} strokeWidth="2" opacity="0.4" />

        <path d="M6,5 C30,0 60,-5 75,-20 C55,0 30,10 6,8" fill={leafColor} opacity="0.9" />

        {/* FLOR PRINCIPAL */}
        <g transform="translate(0, -80)">
          {/* Pétalos */}
          <ellipse cx="0" cy="-15" rx="10" ry="18" fill={flowerRed} />
          <ellipse cx="-14" cy="-8" rx="10" ry="16" fill={flowerRed} transform="rotate(-35)" />
          <ellipse cx="14" cy="-8" rx="10" ry="16" fill={flowerRed} transform="rotate(35)" />
          <ellipse cx="-12" cy="10" rx="9" ry="14" fill={flowerDark} transform="rotate(-70)" />
          <ellipse cx="12" cy="10" rx="9" ry="14" fill={flowerDark} transform="rotate(70)" />

          {/* Centro */}
          <circle cx="0" cy="0" r="12" fill={flowerCenter} />
          <circle cx="0" cy="0" r="7" fill="#D97706" />
          <circle cx="-2" cy="-3" r="3" fill="white" opacity="0.4" />
        </g>

        {/* Flores secundarias */}
        <g transform="translate(-55, -50)">
          <ellipse cx="0" cy="-6" rx="5" ry="9" fill={flowerRed} />
          <ellipse cx="-5" cy="3" rx="5" ry="8" fill={flowerRed} />
          <ellipse cx="5" cy="3" rx="5" ry="8" fill={flowerRed} />
          <circle cx="0" cy="0" r="5" fill={flowerCenter} />
        </g>
        <g transform="translate(55, -50)">
          <ellipse cx="0" cy="-6" rx="5" ry="9" fill={flowerRed} />
          <ellipse cx="-5" cy="3" rx="5" ry="8" fill={flowerRed} />
          <ellipse cx="5" cy="3" rx="5" ry="8" fill={flowerRed} />
          <circle cx="0" cy="0" r="5" fill={flowerCenter} />
        </g>

        {/* Pequeños brotes rojos */}
        <circle cx="-70" cy="-20" r="6" fill={flowerRed} opacity="0.8" />
        <circle cx="70" cy="-20" r="6" fill={flowerRed} opacity="0.8" />
        <circle cx="-40" cy="-55" r="4" fill={flowerRed} opacity="0.7" />
        <circle cx="40" cy="-55" r="4" fill={flowerRed} opacity="0.7" />
      </g>

      {/* Sombra cuerda derecha */}
      <rect x="870" y="94" width="430" height="24" rx="12" fill={ROPE_COLORS.shadow} opacity="0.2" />

      {/* Cuerda derecha */}
      <rect x="870" y="90" width="430" height="24" rx="12" fill="url(#braid-pattern-plant)" />
      <rect x="870" y="90" width="430" height="5" rx="2" fill={ROPE_COLORS.highlight} opacity="0.4" />
    </svg>
  )
}

export default RopeDivider
