'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Home, 
  Calendar, 
  Camera, 
  FileText, 
  Bell, 
  User, 
  Phone,
  Mail,
  LogOut,
  Shield,
  HelpCircle,
  ChevronRight,
  Users,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
  requiresAuth?: boolean
}

interface FamiliaNavSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
  className?: string
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/familia/dashboard",
    icon: Home,
    description: "Resumen y acceso rápido"
  },
  {
    title: "Calendario",
    href: "/familia/calendario",
    icon: Calendar,
    description: "Actividades y eventos"
  },
  {
    title: "Galería",
    href: "/familia/galeria",
    icon: Camera,
    description: "Fotos de tus hijos"
  },
  {
    title: "Documentos",
    href: "/familia/documentos",
    icon: FileText,
    description: "Documentación importante"
  },
  {
    title: "Notificaciones",
    href: "/familia/notificaciones",
    icon: Bell,
    badge: "3",
    description: "Mensajes y alertas"
  },
  {
    title: "Mi Perfil",
    href: "/familia/perfil",
    icon: User,
    description: "Datos personales"
  }
]

export function FamiliaNavSidebar({ 
  isOpen = true, 
  onClose, 
  isMobile = false, 
  className 
}: FamiliaNavSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState(3) // Simulación de notificaciones

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === "/familia/dashboard") {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    if (isMobile && onClose) {
      onClose()
    }
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Header del Sidebar */}
      <div className="p-6 border-b bg-gradient-to-r from-green-600 to-green-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-xl">O</span>
            </div>
            <div>
              <h2 className="text-white font-semibold">Grupo Scout Osyris</h2>
              <p className="text-green-100 text-sm">Portal Familias</p>
            </div>
          </div>
          
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {user && (
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={undefined} alt={user.nombre} />
                <AvatarFallback className="text-white bg-white/20">
                  {user.nombre?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  ¡Hola, {user.nombre}!
                </p>
                <p className="text-green-100 text-xs capitalize">
                  {user.rol === 'familia' ? 'Familiar' : user.rol}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const active = isActive(item.href)
          const badgeCount = item.href === "/familia/notificaciones" ? notifications : item.badge
          
          return (
            <Button
              key={item.href}
              variant={active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3 relative",
                active && "bg-green-600 hover:bg-green-700 text-white"
              )}
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium truncate">{item.title}</div>
                <div className={cn(
                  "text-xs truncate",
                  active ? "text-green-100" : "text-muted-foreground"
                )}>
                  {item.description}
                </div>
              </div>
              {badgeCount && (
                <Badge 
                  variant={active ? "secondary" : "destructive"} 
                  className="ml-auto flex-shrink-0"
                >
                  {badgeCount}
                </Badge>
              )}
              <ChevronRight className="h-4 w-4 ml-2 opacity-50 flex-shrink-0" />
            </Button>
          )
        })}
      </nav>

      {/* Contacto de Emergencia */}
      <div className="p-4 border-t bg-blue-50">
        <div className="bg-blue-100 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Contacto Emergencia
            </span>
          </div>
          <div className="space-y-1 text-xs text-blue-700">
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>+34 600 123 456</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-3 w-3" />
              <span>emergencia@osyris.es</span>
            </div>
          </div>
        </div>
      </div>

      {/* Links Rápidos */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => handleNavigation('/contacto')}
          >
            <HelpCircle className="h-3 w-3 mr-2" />
            Ayuda y Soporte
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-3 w-3 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t">
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 Grupo Scout Osyris</p>
          <p className="mt-1">Portal de Familias v1.0</p>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 bg-black/50",
        isOpen ? "block" : "hidden"
      )}>
        <div className={cn(
          "fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <NavContent />
        </div>
      </div>
    )
  }

  return (
    <aside className={cn(
      "w-80 bg-white border-r h-screen sticky top-0 overflow-hidden flex flex-col",
      className
    )}>
      <NavContent />
    </aside>
  )
}

// Componente para el trigger del sidebar en móvil
export function FamiliaNavSidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <Menu className="h-5 w-5" />
    </Button>
  )
}

// Hook para controlar el sidebar en móvil
export function useMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const openSidebar = () => setIsOpen(true)
  const closeSidebar = () => setIsOpen(false)
  const toggleSidebar = () => setIsOpen(!isOpen)

  return {
    isOpen,
    isMobile,
    openSidebar,
    closeSidebar,
    toggleSidebar
  }
}