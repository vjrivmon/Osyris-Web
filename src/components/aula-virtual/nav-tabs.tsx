'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSolicitudesDesbloqueo } from '@/hooks/useSolicitudesDesbloqueo'
import {
  Home,
  FileText,
  Calendar,
  MessageSquare,
  Unlock,
  Users,
} from 'lucide-react'

const navItems = [
  { href: '/aula-virtual', label: 'Inicio', icon: Home, exact: true },
  { href: '/aula-virtual/educandos', label: 'Educandos', icon: Users },
  { href: '/aula-virtual/calendario', label: 'Calendario', icon: Calendar },
  { href: '/aula-virtual/documentos', label: 'Documentos', icon: FileText },
  { href: '/aula-virtual/solicitudes-desbloqueo', label: 'Solicitudes', icon: Unlock, showBadge: true },
  { href: '/aula-virtual/comunicaciones', label: 'Mensajes', icon: MessageSquare },
]

export function NavTabs() {
  const pathname = usePathname()
  const { pendientes } = useSolicitudesDesbloqueo()

  return (
    <nav
      className="hidden md:flex items-center gap-1"
      role="navigation"
      aria-label="Navegacion principal"
    >
      {navItems.map(item => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + '/')

        const showBadge = item.showBadge && pendientes > 0

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
                : 'text-muted-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="relative">
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {showBadge && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </div>
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
