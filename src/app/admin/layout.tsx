"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminNavTabs } from "@/components/admin/admin-nav-tabs"
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav"
import { Button } from "@/components/ui/button"
import { LogOut, Shield, User } from "lucide-react"
import { getCurrentUser, clearAuthData } from "@/lib/auth-utils"
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
  const router = useRouter()

  useEffect(() => {
    const userData = getCurrentUser()
    setUserInfo(userData)
  }, [])

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
      </div>
    </ProtectedRoute>
  )
}
