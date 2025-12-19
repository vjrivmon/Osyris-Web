'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Home, FileText, Unlock, Calendar, MessageSquare, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useSolicitudesDesbloqueo } from '@/hooks/useSolicitudesDesbloqueo'

const navItems = [
  { href: '/aula-virtual', label: 'Inicio', icon: Home, exact: true },
  { href: '/aula-virtual/educandos', label: 'Educandos', icon: Users },
  { href: '/aula-virtual/calendario', label: 'Calendario', icon: Calendar },
  { href: '/aula-virtual/documentos', label: 'Documentos', icon: FileText },
  { href: '/aula-virtual/solicitudes-desbloqueo', label: 'Solicitudes', icon: Unlock, showBadge: true },
  { href: '/aula-virtual/comunicaciones', label: 'Mensajes', icon: MessageSquare },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { pendientes } = useSolicitudesDesbloqueo()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetTitle className="flex items-center gap-3 mb-6">
          <img
            src="/images/logo-osyris.png"
            alt="Logo Grupo Scout Osyris"
            className="h-8 w-8 rounded-full border-2 border-primary"
          />
          <span className="text-lg font-semibold">Aula Virtual</span>
        </SheetTitle>
        <nav className="flex flex-col gap-2">
          {navItems.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/')

            const showBadge = item.showBadge && pendientes > 0

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
                {showBadge && (
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                )}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
