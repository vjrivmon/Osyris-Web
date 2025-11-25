"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AulaVirtualSidebar } from "@/components/aula-virtual/sidebar"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, Bell, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useNotificacionesScouter } from "@/hooks/useNotificacionesScouter"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function AulaVirtualLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [notificacionesOpen, setNotificacionesOpen] = useState(false)
  const router = useRouter()
  const { notificaciones, contadorNoLeidas, marcarComoLeida, documentosPendientes } = useNotificacionesScouter()

  const handleLogout = () => {
    // Limpiar sesión del localStorage
    localStorage.removeItem("osyris_user")
    // Redirigir a la landing page
    router.push("/")
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AulaVirtualSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-card">
            <AulaVirtualSidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Aula Virtual</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Notificaciones */}
            <Popover open={notificacionesOpen} onOpenChange={setNotificacionesOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {(contadorNoLeidas > 0 || documentosPendientes.length > 0) && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {contadorNoLeidas + documentosPendientes.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b">
                  <h4 className="font-semibold">Notificaciones</h4>
                </div>
                <ScrollArea className="h-[300px]">
                  {documentosPendientes.length === 0 && notificaciones.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No hay notificaciones
                    </div>
                  ) : (
                    <div className="divide-y">
                      {/* Documentos pendientes primero */}
                      {documentosPendientes.length > 0 && (
                        <Link
                          href="/aula-virtual/documentos-pendientes"
                          onClick={() => setNotificacionesOpen(false)}
                          className="block p-3 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-amber-100">
                              <Bell className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {documentosPendientes.length} documento{documentosPendientes.length !== 1 ? 's' : ''} pendiente{documentosPendientes.length !== 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Haz clic para revisar y aprobar
                              </p>
                            </div>
                          </div>
                        </Link>
                      )}
                      {/* Otras notificaciones */}
                      {notificaciones.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 hover:bg-accent cursor-pointer transition-colors ${!notif.leida ? 'bg-blue-50/50' : ''}`}
                          onClick={() => {
                            if (!notif.leida) marcarComoLeida(notif.id)
                            if (notif.enlace_accion) {
                              router.push(notif.enlace_accion)
                              setNotificacionesOpen(false)
                            }
                          }}
                        >
                          <p className="font-medium text-sm">{notif.titulo}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notif.mensaje}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notif.fecha_creacion), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                {documentosPendientes.length > 0 && (
                  <div className="p-2 border-t">
                    <Button asChild variant="ghost" className="w-full" size="sm">
                      <Link href="/aula-virtual/documentos-pendientes">
                        Ver todos los pendientes
                      </Link>
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* User icon */}
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>

            {/* Logout button - Mobile (icon only) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutDialog(true)}
              className="md:hidden"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Logout button - Desktop (with text) */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Estás a punto de cerrar tu sesión en la plataforma del Grupo Scout Osyris.
                    Tendrás que volver a iniciar sesión para acceder al sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setShowLogoutDialog(false)
                      handleLogout()
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cerrar sesión
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      </div>
    </ProtectedRoute>
  )
}