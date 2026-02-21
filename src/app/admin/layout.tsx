"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminNavTabs } from "@/components/admin/admin-nav-tabs"
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav"
import { Button } from "@/components/ui/button"
import { LogOut, Shield, User, Bell } from "lucide-react"
import { getCurrentUser, clearAuthData } from "@/lib/auth-utils"
import { getApiUrl } from "@/lib/api-utils"
import { NotificacionesUrgentesModal, type NotificacionUrgente } from "@/components/notificaciones/NotificacionesUrgentesModal"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [notificacionesOpen, setNotificacionesOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [contadorNoLeidas, setContadorNoLeidas] = useState(0)
  const [urgentesModalOpen, setUrgentesModalOpen] = useState(false)
  const [notificacionesUrgentes, setNotificacionesUrgentes] = useState<NotificacionUrgente[]>([])
  const router = useRouter()
  const API_URL = getApiUrl()

  useEffect(() => {
    const userData = getCurrentUser()
    setUserInfo(userData)
  }, [])

  // Cargar notificaciones scouter
  const fetchNotificaciones = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/api/notificaciones-scouter`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        const items = data.data || data || []
        setNotificaciones(Array.isArray(items) ? items : [])
        setContadorNoLeidas(Array.isArray(items) ? items.filter((n: any) => !n.leida).length : 0)

        // Filtrar urgentes
        const urgentes = (Array.isArray(items) ? items : []).filter((n: any) => n.urgente && !n.leida)
        setNotificacionesUrgentes(urgentes)

        if (urgentes.length > 0 && !sessionStorage.getItem('notif_modal_shown')) {
          setUrgentesModalOpen(true)
        }
      }
    } catch (err) {
      console.error('Error fetching admin notificaciones:', err)
    }
  }, [API_URL])

  useEffect(() => {
    fetchNotificaciones()
    const interval = setInterval(fetchNotificaciones, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchNotificaciones])

  const marcarComoLeida = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      await fetch(`${API_URL}/api/notificaciones-scouter/${id}/leida`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
      setContadorNoLeidas(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marcando como leída:', err)
    }
  }

  const handleUrgentesClose = async () => {
    setUrgentesModalOpen(false)
    sessionStorage.setItem('notif_modal_shown', '1')

    const token = localStorage.getItem('token')
    if (!token) return

    for (const notif of notificacionesUrgentes) {
      try {
        await fetch(`${API_URL}/api/notificaciones-scouter/${notif.id}/leida`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      } catch { /* silently continue */ }
    }

    const urgIds = new Set(notificacionesUrgentes.map(n => n.id))
    setNotificaciones(prev => prev.map(n => urgIds.has(n.id) ? { ...n, leida: true } : n))
    setContadorNoLeidas(prev => Math.max(0, prev - notificacionesUrgentes.length))
    setNotificacionesUrgentes([])
  }

  const handleLogout = () => {
    clearAuthData()
    router.push("/")
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
        {/* Header horizontal */}
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container mx-auto px-4">
            <div className="flex h-14 items-center justify-between gap-4">
              {/* Left: Mobile menu + Logo */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <AdminMobileNav />
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-lg hidden sm:inline">Panel Admin</span>
                </Link>
              </div>

              {/* Center: Navigation tabs */}
              <div className="flex-1 flex justify-center">
                <AdminNavTabs />
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* User info - only on desktop */}
                {userInfo && (
                  <div className="hidden lg:flex items-center gap-2 px-2 py-1 rounded-md bg-muted text-sm">
                    <User className="h-4 w-4" />
                    <span className="text-muted-foreground">
                      {userInfo.nombre}
                    </span>
                  </div>
                )}

                {/* Notificaciones */}
                <Popover open={notificacionesOpen} onOpenChange={setNotificacionesOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {contadorNoLeidas > 0 && (
                        <span className={`absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ${notificacionesUrgentes.length > 0 ? 'h-6 w-6 animate-pulse ring-2 ring-red-300' : 'h-5 w-5'}`}>
                          {contadorNoLeidas > 9 ? '9+' : contadorNoLeidas}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                    <div className="p-3 border-b">
                      <h4 className="font-semibold text-sm">Notificaciones</h4>
                    </div>
                    <ScrollArea className="h-[300px]">
                      {notificaciones.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          <Bell className="h-6 w-6 mx-auto mb-2 opacity-50" />
                          <p>Sin notificaciones</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notificaciones.slice(0, 10).map((notif: any) => (
                            <div
                              key={notif.id}
                              className={`p-3 hover:bg-accent cursor-pointer transition-colors text-sm ${!notif.leida ? 'bg-blue-50/50 dark:bg-blue-950/50' : ''}`}
                              onClick={() => { if (!notif.leida) marcarComoLeida(notif.id) }}
                            >
                              <div className="flex items-start gap-2">
                                <Bell className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{notif.titulo}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.mensaje}</p>
                                </div>
                                {!notif.leida && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>

                {/* Logout button - Mobile (icon only) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLogoutDialog(true)}
                  className="md:hidden"
                  aria-label="Cerrar sesion"
                  title="Cerrar sesion"
                >
                  <LogOut className="h-4 w-4" />
                </Button>

                {/* Logout button - Desktop (with text) */}
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Cerrar sesion"
                  title="Cerrar sesion"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>

                {/* Logout Confirmation Dialog */}
                <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cerrar sesion de administrador?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Estas a punto de cerrar tu sesion administrativa. Perderas el acceso a todas las funciones de administrador.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>
                        Cancelar
                      </AlertDialogCancel>
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

        {/* Page Content - Centered */}
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </main>

        <NotificacionesUrgentesModal
          isOpen={urgentesModalOpen}
          notificaciones={notificacionesUrgentes}
          onClose={handleUrgentesClose}
        />
      </div>
    </ProtectedRoute>
  )
}
