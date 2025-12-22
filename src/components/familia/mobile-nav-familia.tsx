'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Home, FileText, Calendar, ImageIcon, User, LogOut } from 'lucide-react'
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

const navItems = [
  { href: '/familia/dashboard', label: 'Inicio', icon: Home, exact: true },
  { href: '/familia/documentos', label: 'Documentos', icon: FileText },
  { href: '/familia/calendario', label: 'Calendario', icon: Calendar },
  { href: '/familia/galeria', label: 'Galeria', icon: ImageIcon },
  { href: '/familia/perfil', label: 'Mi Perfil', icon: User },
]

export function MobileNavFamilia() {
  const [open, setOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('osyris_user')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

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
          <img
            src="/images/logo-osyris.png"
            alt="Logo Grupo Scout Osyris"
            className="h-8 w-8 rounded-full border-2 border-primary"
          />
          <span className="text-lg font-semibold">Portal Familias</span>
        </SheetTitle>
        <nav className="flex flex-col gap-2">
          {navItems.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}

          {/* Separador */}
          <div className="my-2 border-t border-border" />

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
