'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Home, Calendar, Users, LogOut, Settings, ClipboardCheck, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useEventoHoy } from '@/hooks/useEventoHoy'

// Tabs permanentes
const tabsPermanentes = [
  { href: '/aula-virtual', label: 'Inicio', icon: Home, exact: true },
  { href: '/aula-virtual/educandos', label: 'Educandos', icon: Users },
  { href: '/aula-virtual/calendario', label: 'Calendario', icon: Calendar },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { hayEventoHoy, evento } = useEventoHoy()

  const handleLogout = () => {
    localStorage.removeItem('osyris_user')
    router.push('/')
  }

  // Construir tabs contextuales si hay evento hoy
  const tabsContextuales = hayEventoHoy && evento ? [
    { 
      href: `/aula-virtual/asistencia/${evento.id}`, 
      label: `🏕️ Asistencia - ${evento.titulo}`, 
      icon: ClipboardCheck,
      isContextual: true,
      exact: false
    },
    { 
      href: `/aula-virtual/verificacion-circulares?actividad=${evento.id}`, 
      label: `✓ Circulares - ${evento.titulo}`, 
      icon: FileCheck,
      isContextual: true,
      exact: false
    },
  ] : []

  const allTabs = [...tabsPermanentes, ...tabsContextuales]

  return (
    <>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetTitle className="flex items-center gap-3 mb-6">
          <Image
            src="/images/logo-osyris.png"
            alt="Logo Grupo Scout Osyris"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border-2 border-primary"
          />
          <span className="text-lg font-semibold">Aula Virtual</span>
        </SheetTitle>
        <nav className="flex flex-col gap-2">
          {allTabs.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/')

            const isContextual = 'isContextual' in item && item.isContextual

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isContextual
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
                {isContextual && (
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>
            )
          })}

          {/* Separador */}
          <div className="my-2 border-t border-border" />

          {/* Ajustes */}
          <Link
            href="/aula-virtual/ajustes"
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname === '/aula-virtual/ajustes'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Settings className="h-5 w-5" />
            Ajustes
          </Link>

          {/* Cerrar sesión */}
          <button
            onClick={() => {
              setOpen(false)
              setShowLogoutDialog(true)
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </nav>
      </SheetContent>
    </Sheet>

    {/* Logout Confirmation Dialog */}
    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de cerrar tu sesión en la plataforma del Grupo Scout Osyris.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Cerrar sesión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
