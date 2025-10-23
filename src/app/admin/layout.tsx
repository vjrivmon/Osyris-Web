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
              "flex flex-col h-full border-r bg-card transition-all duration-300 ease-in-out border-gray-700 dark:border-gray-600",
              sidebarCollapsed ? "w-16" : "w-64"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-gray-600">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">CRM Admin</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Panel de Gestión</span>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                      "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                      isActive
                        ? "bg-gray-700 text-white dark:bg-gray-600"
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
            <div className="p-4 border-t border-gray-700 dark:border-gray-600">
              {!sidebarCollapsed && (
                <div className="bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-800 dark:text-gray-300">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-medium">Modo Admin</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
            <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-gray-700 dark:border-gray-600">
              {/* Mobile navigation content - same as desktop but not collapsed */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">CRM Admin</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Panel de Gestión</span>
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
                        "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                        isActive
                          ? "bg-gray-700 text-white dark:bg-gray-600"
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
          <header className="flex items-center justify-between border-b bg-card px-4 py-3 border-gray-700 dark:border-gray-600">
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
                <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Panel de Gestión CRM</h1>
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
                className="md:hidden text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4" />
              </Button>

              <button
                onClick={() => setShowLogoutDialog(true)}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900/50">
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
                className="bg-gray-700 hover:bg-gray-800"
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