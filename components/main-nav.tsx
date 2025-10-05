"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useEditMode } from "@/contexts/EditModeContext"
import { EditModeToggle } from "@/components/editable/EditModeToggle"
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
import { useToast } from "@/hooks/use-toast"

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
  const isMobile = useIsMobile()
  const { isAuthenticated, user, logout } = useAuth()
  const { disableEditMode } = useEditMode()
  const { toast } = useToast()

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const confirmLogout = () => {
    disableEditMode()
    logout()
    setIsOpen(false)
    setShowLogoutDialog(false)

    toast({
      title: "✅ Sesión cerrada",
      description: "Has cerrado sesión correctamente",
      duration: 3000,
      className: "!bg-green-600 !text-white !border-green-700",
    })

    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Always on the left */}
          <Link
            href="/"
            className="flex items-center transition-transform hover:scale-105">
            <img
              src="/images/logo-osyris.png"
              alt="Logo Grupo Scout Osyris"
              className="h-10 w-10 rounded-full border-2 border-primary shadow-md"
            />
            <span className="ml-2 font-semibold text-lg hidden lg:inline">Grupo Scout Osyris</span>
          </Link>

          {/* Mobile Navigation - On the right */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menú">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] sm:w-[385px] bg-background">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <div className="flex items-center mb-6">
                  <img
                    src="/images/logo-osyris.png"
                    alt="Logo Grupo Scout Osyris"
                    className="h-10 w-10 rounded-full border-2 border-primary"
                  />
                  <span className="ml-2 font-semibold text-lg">Grupo Scout Osyris</span>
                </div>

                <nav className="flex flex-col gap-4">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between text-lg font-medium transition-colors hover:text-primary p-2 rounded-md",
                      pathname === "/" ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted",
                    )}
                    >
                    <span>Inicio</span>
                    {pathname === "/" && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Actual
                      </Badge>
                    )}
                  </Link>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground px-2">Secciones</h3>
                    <div className="space-y-1 pl-2">
                      <Link
                        href="/secciones/castores"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted"
                        >
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span>Castores (5-7 años)</span>
                      </Link>
                      <Link
                        href="/secciones/manada"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted"
                        >
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                        <span>Manada (7-10 años)</span>
                      </Link>
                      <Link
                        href="/secciones/tropa"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted"
                        >
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Tropa (10-13 años)</span>
                      </Link>
                      <Link
                        href="/secciones/pioneros"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted"
                        >
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        <span>Pioneros (13-16 años)</span>
                      </Link>
                      <Link
                        href="/secciones/rutas"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted"
                        >
                        <span className="w-2 h-2 rounded-full bg-green-700"></span>
                        <span>Rutas (16-19 años)</span>
                      </Link>
                    </div>
                  </div>

                  <Link
                    href="/calendario"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary p-2 rounded-md",
                      pathname === "/calendario" ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted",
                    )}
                  >
                    Calendario
                  </Link>

                  <Link
                    href="/galeria"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary p-2 rounded-md",
                      pathname === "/galeria" ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted",
                    )}
                  >
                    Galería
                  </Link>

                  <Link
                    href="/sobre-nosotros"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary p-2 rounded-md",
                      pathname === "/sobre-nosotros" ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted",
                    )}
                  >
                    Sobre Nosotros
                  </Link>

                  <Link
                    href="/contacto"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary p-2 rounded-md",
                      pathname === "/contacto" ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted",
                    )}
                  >
                    Contacto
                  </Link>

                  <div className="mt-4">
                    {isAuthenticated && user?.rol === 'admin' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-md">
                          <User className="h-4 w-4 text-primary" />
                          <div className="text-sm">
                            <div className="font-medium">{user.email}</div>
                            <div className="text-xs text-muted-foreground">Administrador</div>
                          </div>
                        </div>
                        <div className="w-full">
                          <EditModeToggle />
                        </div>
                        <Button onClick={handleLogoutClick} variant="destructive" className="w-full">
                          <LogOut className="h-4 w-4 mr-2" />
                          Cerrar sesión
                        </Button>
                      </div>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Acceder
                        </Link>
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === "/" ? "text-primary font-medium" : "text-foreground",
                      )}
                    >
                      Inicio
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      pathname === "/secciones" || pathname.startsWith("/secciones/")
                        ? "text-primary font-medium"
                        : "text-foreground",
                    )}
                  >
                    Secciones
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-background">
                      <li className="row-span-5">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                            href="/secciones"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium text-white">Nuestras Secciones</div>
                            <p className="text-sm leading-tight text-white/90">
                              Descubre las diferentes etapas del escultismo en el Grupo Scout Osyris
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem
                        href="/secciones/castores"
                        title="Castores"
                        className="border-l-4 border-orange-500"
                        icon={<span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>}
                      >
                        Colonia La Veleta (5-7 años)
                      </ListItem>
                      <ListItem
                        href="/secciones/manada"
                        title="Manada"
                        className="border-l-4 border-yellow-400"
                        icon={<span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>}
                      >
                        Manada Waingunga (7-10 años)
                      </ListItem>
                      <ListItem
                        href="/secciones/tropa"
                        title="Tropa"
                        className="border-l-4 border-blue-500"
                        icon={<span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>}
                      >
                        Tropa Brownsea (10-13 años)
                      </ListItem>
                      <ListItem
                        href="/secciones/pioneros"
                        title="Pioneros"
                        className="border-l-4 border-red-600"
                        icon={<span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span>}
                      >
                        Posta Kanhiwara (13-16 años)
                      </ListItem>
                      <ListItem
                        href="/secciones/rutas"
                        title="Rutas"
                        className="border-l-4 border-green-700"
                        icon={<span className="w-3 h-3 rounded-full bg-green-700 mr-2"></span>}
                      >
                        Ruta Walhalla (16-19 años)
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/calendario"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === "/calendario" ? "text-primary font-medium" : "text-foreground",
                      )}
                    >
                      Calendario
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/galeria"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === "/galeria" ? "text-primary font-medium" : "text-foreground",
                      )}
                    >
                      Galería
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      pathname === "/sobre-nosotros" || pathname === "/contacto"
                        ? "text-primary font-medium"
                        : "text-foreground",
                    )}
                  >
                    Sobre Nosotros
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] md:grid-cols-2 bg-background">
                      <ListItem
                        href="/sobre-nosotros"
                        title="Quiénes Somos"
                        icon={<span className="w-3 h-3 rounded-full bg-primary mr-2"></span>}
                      >
                        Historia y valores del Grupo Scout Osyris
                      </ListItem>
                      <ListItem
                        href="/sobre-nosotros/kraal"
                        title="Nuestro Kraal"
                        icon={<span className="w-3 h-3 rounded-full bg-primary mr-2"></span>}
                      >
                        Conoce al equipo de monitores
                      </ListItem>
                      <ListItem
                        href="/sobre-nosotros/comite"
                        title="Comité de Grupo"
                        icon={<span className="w-3 h-3 rounded-full bg-primary mr-2"></span>}
                      >
                        Familias y colaboradores
                      </ListItem>
                      <ListItem
                        href="/contacto"
                        title="Contacto"
                        icon={<span className="w-3 h-3 rounded-full bg-primary mr-2"></span>}
                      >
                        Cómo contactar con nosotros
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {isAuthenticated && user?.rol === 'admin' && (
                <EditModeToggle />
              )}
              {isAuthenticated && user?.rol === 'admin' ? (
                <div className="hidden lg:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <Button onClick={handleLogoutClick} variant="destructive" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </Button>
                </div>
              ) : (
                <Button asChild className="hidden md:inline-flex">
                  <Link href="/login">Acceder</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmación de cierre de sesión */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a cerrar la sesión de <strong>{user?.email}</strong>. Tendrás que volver a iniciar sesión para acceder al panel de administración.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string
    icon?: React.ReactNode
  }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none flex items-center">
            {icon}
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

