"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Users,
  Bell,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Determine user role from URL path
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (pathname.includes("/aula-virtual") || pathname.includes("/monitor")) {
      setUserRole("kraal")
    } else if (pathname.includes("/comite")) {
      setUserRole("comite")
    } else if (pathname.includes("/familias")) {
      setUserRole("familias")
    } else if (pathname.includes("/educandos")) {
      setUserRole("educandos")
    }
  }, [pathname])

  // Mock user data based on role
  const getUserData = () => {
    switch (userRole) {
      case "kraal":
        return {
          name: "Ana Martínez",
          role: "Kraal/Monitor",
          section: "Lobatos",
          avatar: "/placeholder.svg?height=40&width=40",
          unreadNotifications: 3,
        }
      case "comite":
        return {
          name: "Carlos Rodríguez",
          role: "Presidente",
          section: "Comité",
          avatar: "/placeholder.svg?height=40&width=40",
          unreadNotifications: 5,
        }
      case "familias":
        return {
          name: "Ana Martínez",
          role: "Familia",
          section: "Lobatos y Tropa",
          avatar: "/placeholder.svg?height=40&width=40",
          unreadNotifications: 2,
        }
      case "educandos":
        return {
          name: "Pablo Navarro",
          role: "Educando",
          section: "Pioneros",
          avatar: "/placeholder.svg?height=40&width=40",
          unreadNotifications: 1,
        }
      default:
        return {
          name: "Usuario",
          role: "Invitado",
          section: "",
          avatar: "/placeholder.svg?height=40&width=40",
          unreadNotifications: 0,
        }
    }
  }

  const user = getUserData()

  const handleLogout = () => {
    // Limpiar sesión del localStorage
    localStorage.removeItem("osyris_user")
    // Redirigir a la landing page
    router.push("/")
  }

  // Get section color based on user role and section
  const getSectionColor = () => {
    if (user.section.includes("Lobatos")) return "bg-yellow-400"
    if (user.section.includes("Castores")) return "bg-orange-500"
    if (user.section.includes("Tropa")) return "bg-blue-500"
    if (user.section.includes("Pioneros")) return "bg-red-600"
    if (user.section.includes("Rutas")) return "bg-green-700"
    return "bg-primary"
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar */}
      {isMobile ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[85%] max-w-[300px] p-0">
            <SheetTitle className="sr-only">Panel de control</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <img
                    src="/images/logo-osyris.png"
                    alt="Logo Grupo Scout Osyris"
                    className="h-8 w-8 rounded-full border-2 border-primary shadow-md"
                  />
                  <span className="font-semibold">Grupo Scout Osyris</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="space-y-1 px-2">
                  <NavItem
                    href={`/dashboard/${userRole}`}
                    icon={Home}
                    label="Inicio"
                    active={pathname === `/dashboard/${userRole}`}
                  />
                  <NavItem
                    href={`/dashboard/${userRole}/documentos`}
                    icon={FileText}
                    label="Documentos"
                    active={pathname.includes("/documentos")}
                  />
                  <NavItem
                    href={`/dashboard/${userRole}/calendario`}
                    icon={Calendar}
                    label="Calendario"
                    active={pathname.includes("/calendario")}
                  />
                  <NavItem
                    href={`/dashboard/${userRole}/comunicaciones`}
                    icon={MessageSquare}
                    label="Comunicaciones"
                    active={pathname.includes("/comunicaciones")}
                  />

                  {(userRole === "kraal" || userRole === "comite" || userRole === "monitor") && (
                    <>
                      <div className="pt-4 pb-2">
                        <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Administración
                        </div>
                      </div>
                      <NavItem
                        href={`/dashboard/${userRole}/miembros`}
                        icon={Users}
                        label="Miembros"
                        active={pathname.includes("/miembros")}
                      />
                      <NavItem
                        href={`/dashboard/${userRole}/inventario`}
                        icon={Package}
                        label="Inventario"
                        active={pathname.includes("/inventario")}
                      />
                      <NavItem
                        href={`/dashboard/${userRole}/finanzas`}
                        icon={BarChart3}
                        label="Finanzas"
                        active={pathname.includes("/finanzas")}
                      />
                    </>
                  )}

                  <div className="pt-4 pb-2">
                    <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Servicios
                    </div>
                  </div>
                  <NavItem
                    href={`/dashboard/${userRole}/tienda`}
                    icon={ShoppingBag}
                    label="Tienda"
                    active={pathname.includes("/tienda")}
                  />
                  <NavItem
                    href={`/dashboard/${userRole}/ajustes`}
                    icon={Settings}
                    label="Ajustes"
                    active={pathname.includes("/ajustes")}
                  />

                  <div className="pt-4 pb-2">
                    <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Accesos Directos
                    </div>
                  </div>
                  <NavItem href="/dashboard/comite" icon={Users} label="Comité" active={pathname.includes("/comite")} />
                  <NavItem
                    href="/dashboard/familias"
                    icon={Home}
                    label="Familias"
                    active={pathname.includes("/familias")}
                  />
                  <NavItem
                    href="/dashboard/educandos"
                    icon={Users}
                    label="Educandos"
                    active={pathname.includes("/educandos")}
                  />
                  <NavItem
                    href="/dashboard/aula-virtual"
                    icon={Users}
                    label="Kraal/Monitor"
                    active={pathname.includes("/aula-virtual")}
                  />
                </nav>
              </div>
              <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-8 w-8 border-2" style={{ borderColor: `hsl(var(--primary))` }}>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <span className={`w-2 h-2 rounded-full ${getSectionColor()} mr-1.5`}></span>
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        /* Desktop Sidebar */
        (<div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow border-r bg-card">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
              <Link
                href={`/dashboard/${userRole}`}
                className="flex items-center gap-2"
                >
                <img
                  src="/images/logo-osyris.png"
                  alt="Logo Grupo Scout Osyris"
                  className="h-8 w-8 rounded-full border-2 border-primary shadow-md"
                />
                <span className="font-semibold">Grupo Scout Osyris</span>
              </Link>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              <nav className="flex-1 px-2 space-y-1">
                <NavItem
                  href={`/dashboard/${userRole}`}
                  icon={Home}
                  label="Inicio"
                  active={pathname === `/dashboard/${userRole}`}
                />
                <NavItem
                  href={`/dashboard/${userRole}/documentos`}
                  icon={FileText}
                  label="Documentos"
                  active={pathname.includes("/documentos")}
                />
                <NavItem
                  href={`/dashboard/${userRole}/calendario`}
                  icon={Calendar}
                  label="Calendario"
                  active={pathname.includes("/calendario")}
                />
                <NavItem
                  href={`/dashboard/${userRole}/comunicaciones`}
                  icon={MessageSquare}
                  label="Comunicaciones"
                  active={pathname.includes("/comunicaciones")}
                />

                {(userRole === "kraal" || userRole === "comite" || userRole === "monitor") && (
                  <>
                    <div className="pt-5 pb-2">
                      <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Administración
                      </div>
                    </div>
                    <NavItem
                      href={`/dashboard/${userRole}/miembros`}
                      icon={Users}
                      label="Miembros"
                      active={pathname.includes("/miembros")}
                    />
                    <NavItem
                      href={`/dashboard/${userRole}/inventario`}
                      icon={Package}
                      label="Inventario"
                      active={pathname.includes("/inventario")}
                    />
                    <NavItem
                      href={`/dashboard/${userRole}/finanzas`}
                      icon={BarChart3}
                      label="Finanzas"
                      active={pathname.includes("/finanzas")}
                    />
                  </>
                )}

                <div className="pt-5 pb-2">
                  <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Servicios
                  </div>
                </div>
                <NavItem
                  href={`/dashboard/${userRole}/tienda`}
                  icon={ShoppingBag}
                  label="Tienda"
                  active={pathname.includes("/tienda")}
                />
                <NavItem
                  href={`/dashboard/${userRole}/ajustes`}
                  icon={Settings}
                  label="Ajustes"
                  active={pathname.includes("/ajustes")}
                />

                <div className="pt-5 pb-2">
                  <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Accesos Directos
                  </div>
                </div>
                <NavItem href="/dashboard/comite" icon={Users} label="Comité" active={pathname.includes("/comite")} />
                <NavItem
                  href="/dashboard/familias"
                  icon={Home}
                  label="Familias"
                  active={pathname.includes("/familias")}
                />
                <NavItem
                  href="/dashboard/educandos"
                  icon={Users}
                  label="Educandos"
                  active={pathname.includes("/educandos")}
                />
                <NavItem
                  href="/dashboard/aula-virtual"
                  icon={Users}
                  label="Kraal/Monitor"
                  active={pathname.includes("/aula-virtual")}
                />
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t p-4">
              <div className="flex items-center w-full">
                <Avatar className="h-9 w-9 border-2" style={{ borderColor: `hsl(var(--primary))` }}>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span className={`w-2 h-2 rounded-full ${getSectionColor()} mr-1.5`}></span>
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>)
      )}
      {/* Main content */}
      <div className={cn("flex flex-col flex-1 overflow-hidden", isMobile ? "w-full" : "md:pl-64")}>
        {/* Top navigation */}
        <header className="h-16 bg-card shadow-sm flex items-center px-4 lg:px-6 border-b">
          {isMobile && (
            <SheetTrigger asChild onClick={() => setSidebarOpen(true)}>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
          )}

          <div className="flex-1 flex justify-center lg:justify-start">
            <h1 className="text-xl font-semibold">Panel de Control</h1>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Logout button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {user.unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                      {user.unreadNotifications}
                    </span>
                  )}
                  <span className="sr-only">Notificaciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notificaciones</span>
                  <Badge variant="outline" className="ml-auto">
                    {user.unreadNotifications} nuevas
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification, i) => (
                  <DropdownMenuItem key={i} className="cursor-pointer p-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {notification.isNew && (
                          <Badge className="ml-2 bg-red-600 text-white" variant="secondary">
                            Nuevo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                      <p className="text-sm">{notification.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer justify-center">
                  <Link href={`/dashboard/${userRole}/notificaciones`} className="text-primary text-sm font-medium">
                    Ver todas las notificaciones
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout button for quick access */}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <DashboardBreadcrumb />
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
      >
      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
      {label}
    </Link>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Mock data
const notifications = [
  {
    title: "Recordatorio: Campamento de Verano",
    time: "Hace 2 horas",
    description: "La fecha límite para la inscripción al campamento de verano es el 15 de junio.",
    isNew: true,
  },
  {
    title: "Nueva circular publicada",
    time: "Hace 1 día",
    description: "Se ha publicado una nueva circular sobre la salida a Sierra Norte.",
    isNew: true,
  },
  {
    title: "Actualización de inventario",
    time: "Hace 3 días",
    description: "Se ha actualizado el inventario de material de acampada.",
    isNew: false,
  },
]

