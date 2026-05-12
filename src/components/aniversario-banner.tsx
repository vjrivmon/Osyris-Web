"use client"

import Link from "next/link"

const MENSAJE = "Ya están disponibles las fotos del 45 Aniversario del Grupo Scout Osyris"
const REPETICIONES = 8

export function AniversarioBanner() {
  return (
    <div className="relative w-full bg-[#1b3d2a] border-y border-amber-500/20 banner-shimmer" style={{ height: '44px' }}>

      {/* Zona marquee — termina antes del CTA */}
      <div className="absolute left-0 top-0 bottom-0 overflow-hidden" style={{ right: '160px' }}>
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #1b3d2a, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #1b3d2a, transparent)' }} />

        <div className="flex items-center h-full" style={{ marginLeft: '-60%' }}>
          <div className="banner-marquee items-center">
            {Array.from({ length: REPETICIONES }).map((_, i) => (
              <span key={i} className="flex items-center gap-5 px-10 whitespace-nowrap text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-300 font-bold tracking-widest uppercase text-xs">
                    45 Aniversario
                  </span>
                </span>
                <span className="text-white/75 font-medium">{MENSAJE}</span>
                <span className="text-amber-500/30 text-base select-none">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA fijo alineado con el container del navbar */}
      <div className="absolute inset-y-0 right-0 left-0 pointer-events-none z-20">
        <div className="container mx-auto px-4 h-full flex items-center justify-end">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-px self-stretch py-2.5">
              <div className="h-full bg-amber-500/20" />
            </div>
            <Link
              href="/aniversario-45"
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-100 font-bold transition-colors border border-amber-400/50 hover:border-amber-300 hover:bg-amber-400/10 rounded px-3 py-1 text-xs tracking-wide whitespace-nowrap"
            >
              Ver fotos
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
