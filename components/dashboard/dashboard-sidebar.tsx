"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, FileText, Settings, Home, Tent, BookOpen, MessageSquare, Menu, X } from "lucide-react"
import { useState } from "react"

export function DashboardSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const sidebarItems = [
    {
      title: "Inicio",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      roles: ["kraal", "coordinador", "comite", "familia"],
    },
    {
      title: "Miembros",
      href: "/dashboard/miembros",
      icon: <Users className="h-5 w-5" />,
      roles: ["kraal", "coordinador"],
    },
    {
      title: "Calendario",
      href: "/dashboard/calendario",
      icon: <CalendarDays className="h-5 w-5" />,
      roles: ["kraal", "coordinador", "comite", "familia"],
    },
    {
      title: "Documentos",
      href: "/dashboard/documentos",
      icon: <FileText className="h-5 w-5" />,
      roles: ["kraal", "coordinador", "comite"],
    },
    {
      title: "Actividades",
      href: "/dashboard/actividades",
      icon: <BookOpen className="h-5 w-5" />,
      roles: ["kraal", "coordinador"],
    },
    {
      title: "Campamentos",
      href: "/dashboard/campamentos",
      icon: <Tent className="h-5 w-5" />,
      roles: ["kraal", "coordinador", "comite"],
    },
    {
      title: "Comunicaciones",
      href: "/dashboard/comunicaciones",
      icon: <MessageSquare className="h-5 w-5" />,
      roles: ["kraal", "coordinador", "comite"],
    },
    {
      title: "Configuración",
      href: "/dashboard/configuracion",
      icon: <Settings className="h-5 w-5" />,
      roles: ["kraal", "coordinador", "comite", "familia"],
    },
  ]

  // Mostrar todos los elementos para simplificar
  const filteredItems = sidebarItems

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden" onClick={toggleSidebar}>
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform border-r bg-background transition-transform duration-200 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-semibold">Navegación</h2>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}

