"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Camera,
  User,
  ChevronLeft,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getApiUrl } from "@/lib/api-utils"

interface FamiliaSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function FamiliaSidebar({ collapsed, onToggle }: FamiliaSidebarProps) {
  const pathname = usePathname()
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Cargar datos actualizados del usuario desde la API
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const apiUrl = getApiUrl()
        const response = await fetch(`${apiUrl}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            // Actualizar localStorage con datos frescos
            localStorage.setItem('user', JSON.stringify(data.data))
            setUserData(data.data)
            return
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }

      // Fallback: cargar desde localStorage si la API falla
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUserData(user)
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }

    fetchUserData()
  }, [])

  const getInitials = (nombre: string, apellidos?: string) => {
    if (!nombre) return "U"
    const firstInitial = nombre.charAt(0).toUpperCase()
    const lastInitial = apellidos ? apellidos.charAt(0).toUpperCase() : ""
    return firstInitial + lastInitial
  }

  const navigationItems = [
    {
      href: "/familia/dashboard",
      icon: Home,
      label: "DASHBOARD",
      id: "dashboard"
    },
    {
      href: "/familia/galeria",
      icon: Camera,
      label: "GALERÍA",
      id: "galeria"
    },
    {
      href: "/familia/perfil",
      icon: User,
      label: "MI PERFIL",
      id: "perfil"
    }
  ]

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Navegación principal"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img
              src="/images/logo-osyris.png"
              alt="Logo Grupo Scout Osyris"
              className="h-8 w-8 rounded-full border-2 border-primary"
            />
            <span className="font-semibold text-sm">Portal Familias</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2" role="menubar">
        {navigationItems.map((item) => {
          const isActive = item.href === "/familia/dashboard"
            ? pathname === "/familia/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-1",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive && "bg-primary/10 text-primary",
                collapsed && "justify-center"
              )}
              role="menuitem"
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Footer */}
      {userData && (
        <div className="border-t p-3">
          <Link
            href="/familia/perfil"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Perfil y ajustes" : undefined}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={userData.avatar || undefined} alt={userData.nombre} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(userData.nombre, userData.apellidos)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userData.nombre}
                </p>
                <p className="text-xs capitalize truncate text-blue-600 dark:text-blue-400">
                  Familiar
                </p>
              </div>
            )}
            {!collapsed && (
              <Settings className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            )}
          </Link>
        </div>
      )}
    </div>
  )
}
