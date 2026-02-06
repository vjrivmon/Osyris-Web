'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEventoHoy } from '@/hooks/useEventoHoy'
import {
  Home,
  Calendar,
  Users,
  ClipboardCheck,
  FileCheck,
} from 'lucide-react'

// Tabs permanentes (siempre visibles)
const tabsPermanentes = [
  { href: '/aula-virtual', label: 'Inicio', icon: Home, exact: true },
  { href: '/aula-virtual/educandos', label: 'Educandos', icon: Users },
  { href: '/aula-virtual/calendario', label: 'Calendario', icon: Calendar },
]

export function NavTabs() {
  const pathname = usePathname()
  const { hayEventoHoy, evento } = useEventoHoy()

  // Construir tabs contextuales si hay evento hoy
  const tabsContextuales = hayEventoHoy && evento ? [
    { 
      href: `/aula-virtual/asistencia/${evento.id}`, 
      label: 'Asistencia', 
      icon: ClipboardCheck,
      badge: evento.titulo,
      exact: false
    },
    { 
      href: `/aula-virtual/verificacion-circulares?actividad=${evento.id}`, 
      label: 'Circulares', 
      icon: FileCheck,
      badge: evento.titulo,
      exact: false
    },
  ] : []

  const allTabs = [...tabsPermanentes, ...tabsContextuales]

  return (
    <nav
      className="hidden md:flex items-center gap-1"
      role="navigation"
      aria-label="Navegación principal"
    >
      {allTabs.map(item => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/')

        const isContextual = 'badge' in item

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-primary text-primary-foreground'
                : isContextual
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'text-muted-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="relative">
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {isContextual && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
