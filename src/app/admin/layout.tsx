"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { getCurrentUser, clearAuthData } from "@/lib/auth-utils"
import {
  Menu,
  LogOut,
  ArrowLeft,
  Shield,
  Settings,
  Upload,
  FileText,
  Users,
  Database,
  ChevronLeft,
  BarChart3,
  TrendingUp,
  Target,
  ChevronDown
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
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
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    {
      href: "/admin/dashboard",
      icon: BarChart3,
      label: "Dashboard",
      id: "dashboard"
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Usuarios",
      id: "users",
      submenu: [
        {
          href: "/admin/users",
          label: "Lista de Usuarios",
          id: "users-list"
        },
        {
          href: "/admin/users/create",
          label: "Agregar Usuario",
          id: "users-create"
        }
      ]
    },
    {
      href: "/admin/analytics",
      icon: TrendingUp,
      label: "Analytics",
      id: "analytics"
    },
    {
      href: "/admin/campaigns",
      icon: Target,
      label: "Campañas",
      id: "campaigns"
    },
    {
      href: "/admin/system",
      icon: Settings,
      label: "Sistema",
      id: "system"
    }
  ]

  useEffect(() => {
    // Obtener información del usuario usando utilidades centralizadas
    const userData = getCurrentUser()
    setUserInfo(userData)
  }, [])

  const handleLogout = () => {
    clearAuthData()
    router.push("/")
  }

  
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <div
            className={cn(
              "flex flex-col h-full border-r bg-card transition-all duration-300 ease-in-out border-red-200 dark:border-red-800",
              sidebarCollapsed ? "w-16" : "w-64"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-red-200 dark:border-red-800">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-red-900 dark:text-red-100">CRM Admin</span>
                    <span className="text-xs text-red-600 dark:text-red-400">Panel de Gestión</span>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2">
              {navigationItems.map((item) => {
                const isActive = item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 mb-1 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300",
                      isActive
                        ? "bg-red-600 text-white"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-red-200 dark:border-red-800">
              {!sidebarCollapsed && (
                <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-medium">Modo Admin</span>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Acceso completo al sistema
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-red-200 dark:border-red-800">
              {/* Mobile navigation content - same as desktop but not collapsed */}
              <div className="flex items-center justify-between p-4 border-b border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-red-900 dark:text-red-100">CRM Admin</span>
                    <span className="text-xs text-red-600 dark:text-red-400">Panel de Gestión</span>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-2">
                {navigationItems.map((item) => {
                  const isActive = item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(item.href + "/")

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 mb-1 rounded-lg text-sm font-medium transition-colors",
                        "hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300",
                        isActive
                          ? "bg-red-600 text-white"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <header className="flex items-center justify-between border-b bg-card px-4 py-3 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold text-red-900 dark:text-red-100">Panel de Gestión CRM</h1>
                  {userInfo && (
                    <span className="text-xs text-muted-foreground">
                      {userInfo.nombre} {userInfo.apellidos} - Administrador
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Logout buttons */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLogoutDialog(true)}
                className="md:hidden text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>

              <button
                onClick={() => setShowLogoutDialog(true)}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-red-50 hover:text-red-700 transition-colors text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-red-50/30 dark:bg-red-950/10">
            {children}
          </main>
        </div>

        {/* Logout Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cerrar sesión de administrador?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de cerrar tu sesión administrativa. Perderás el acceso a todas las funciones de administrador del CMS.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowLogoutDialog(false)
                  handleLogout()
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Cerrar sesión
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}