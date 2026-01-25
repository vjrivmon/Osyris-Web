"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { NavTabs } from "@/components/aula-virtual/nav-tabs"
import { MobileNav } from "@/components/aula-virtual/mobile-nav"
import { Button } from "@/components/ui/button"
import { LogOut, Bell, User, X, Trash2, CheckCheck } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function AulaVirtualLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [notificacionesOpen, setNotificacionesOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const {
    notificaciones,
    contadorNoLeidas,
    marcarComoLeida,
    eliminarNotificacion,
    eliminarTodasLeidas,
    marcarTodasComoLeidas,
    documentosPendientes
  } = useNotificacionesScouter()

  // Handlers para notificaciones
  const handleEliminarNotificacion = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingId(id)

    // Esperar animación
    setTimeout(async () => {
      const success = await eliminarNotificacion(id)
      setDeletingId(null)
      if (success) {
        toast({
          title: "Notificación eliminada",
          description: "Se ha eliminado correctamente",
        })
      }
    }, 200)
  }

  const handleMarcarTodasLeidas = async () => {
    const count = await marcarTodasComoLeidas()
    if (count > 0) {
      toast({
        title: "Notificaciones marcadas",
        description: `${count} notificación(es) marcada(s) como leída(s)`,
      })
    }
  }

  const handleLimpiarLeidas = async () => {
    const count = await eliminarTodasLeidas()
    if (count > 0) {
      toast({
        title: "Notificaciones limpiadas",
        description: `${count} notificación(es) eliminada(s)`,
      })
    } else {
      toast({
        title: "Sin notificaciones leídas",
        description: "No hay notificaciones leídas para eliminar",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("osyris_user")
    router.push("/")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header con navegacion horizontal */}
        <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container mx-auto px-4">
            <div className="flex h-14 items-center justify-between gap-4">
              {/* Logo con link */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href="/aula-virtual" className="flex items-center gap-2">
                  <Image
                    src="/images/logo-osyris.png"
                    alt="Logo Grupo Scout Osyris"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border-2 border-primary"
                    priority
                  />
                  <span className="font-semibold text-lg hidden sm:inline">Aula Virtual</span>
                </Link>
              </div>

              {/* Navegacion central */}
              <div className="flex-1 flex justify-center">
                <NavTabs />
              </div>

              {/* Acciones del header */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <ThemeToggle />

                {/* Notificaciones */}
                <Popover open={notificacionesOpen} onOpenChange={setNotificacionesOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-6 w-6" />
                      {(contadorNoLeidas > 0 || documentosPendientes.length > 0) && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {contadorNoLeidas + documentosPendientes.length}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 p-0" align="end">
                    {/* Header con acciones */}
                    <div className="p-3 border-b flex items-center justify-between gap-2">
                      <h4 className="font-semibold">Notificaciones</h4>
                      <div className="flex items-center gap-1">
                        {/* Marcar todas como leidas */}
                        {contadorNoLeidas > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarcarTodasLeidas}
                            className="h-8 px-2 text-xs"
                            title="Marcar todas como leidas"
                          >
                            <CheckCheck className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Leidas</span>
                          </Button>
                        )}
                        {/* Limpiar leidas */}
                        {notificaciones.some(n => n.leida) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLimpiarLeidas}
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                            title="Eliminar notificaciones leidas"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Limpiar</span>
                          </Button>
                        )}
                      </div>
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
                                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                                  <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
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
                          {/* Otras notificaciones con boton X */}
                          {notificaciones.slice(0, 5).map((notif) => (
                            <div
                              key={notif.id}
                              className={`group relative p-3 hover:bg-accent cursor-pointer transition-all ${
                                !notif.leida ? 'bg-blue-50/50 dark:bg-blue-950/50' : ''
                              } ${deletingId === notif.id ? 'animate-fade-out' : ''}`}
                              onClick={() => {
                                if (!notif.leida) marcarComoLeida(notif.id)
                                if (notif.enlace_accion) {
                                  router.push(notif.enlace_accion)
                                  setNotificacionesOpen(false)
                                }
                              }}
                            >
                              <div className="pr-6">
                                <p className="font-medium text-sm">{notif.titulo}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{notif.mensaje}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(notif.fecha_creacion), { addSuffix: true, locale: es })}
                                </p>
                              </div>
                              {/* Boton X - visible al hover, area tactil 32x32 (Fitts) */}
                              <button
                                onClick={(e) => handleEliminarNotificacion(notif.id, e)}
                                className="absolute right-2 top-2 h-8 w-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                                title="Eliminar notificacion"
                                aria-label="Eliminar notificacion"
                              >
                                <X className="h-4 w-4" />
                              </button>
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

                {/* User icon - solo visible en desktop */}
                <Button variant="ghost" size="icon" asChild className="hidden md:flex">
                  <Link href="/aula-virtual/ajustes">
                    <User className="h-6 w-6" />
                  </Link>
                </Button>

                {/* Logout button - Desktop (with text) */}
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="hidden lg:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Cerrar sesion"
                  title="Cerrar sesion"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Salir</span>
                </button>

                {/* Menu hamburguesa - derecha (solo movil) */}
                <MobileNav />

                {/* Logout Confirmation Dialog */}
                <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cerrar sesion?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Estas a punto de cerrar tu sesion en la plataforma del Grupo Scout Osyris.
                        Tendras que volver a iniciar sesion para acceder al sistema.
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
                        Cerrar sesion
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Sin sidebar, centrado */}
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </main>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </ProtectedRoute>
  )
}
