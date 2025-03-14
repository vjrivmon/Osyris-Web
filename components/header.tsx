"use client"

import { useState, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, User, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

// Función de utilidad para throttle (limitar la frecuencia de ejecución de una función)
function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall < delay) return
    lastCall = now
    return fn(...args)
  }
}

// Componente de navegación memoizado para evitar re-renderizados innecesarios
const Navigation = memo(
  ({ items, pathname }: { items: { name: string; href: string }[]; pathname: string }) => (
    <>
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary bg-primary/10"
              : "text-foreground/80 hover:text-foreground hover:bg-accent/20"
          )}
        >
          {item.name}
        </Link>
      ))}
    </>
  )
)
Navigation.displayName = "Navigation"

// Componente Avatar memoizado
const UserAvatar = memo(({ user, logout, userNavigation }: any) => {
  if (!user) return null
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.name || "Mi cuenta"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userNavigation.map((item: any) => (
          <DropdownMenuItem key={item.name} asChild>
            <Link href={item.href}>{item.name}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
UserAvatar.displayName = "UserAvatar"

// Componente principal Header optimizado
function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()

  // Memoizar el handler de scroll con throttle para limitar su frecuencia de ejecución
  const handleScroll = useCallback(
    throttle(() => {
      setIsScrolled(window.scrollY > 10)
    }, 100), // Ejecutar como máximo cada 100ms
    []
  )

  useEffect(() => {
    // Añadir event listener optimizado
    window.addEventListener("scroll", handleScroll, { passive: true })
    
    // Limpiar el event listener
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Memoizar los arrays de navegación para evitar re-renderizados
  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Sobre Nosotros", href: "/sobre-nosotros" },
    { name: "Calendario", href: "/calendario" },
    { name: "Contacto", href: "/contacto" },
  ]

  const userNavigation = user
    ? [
        { name: "Mi Perfil", href: "/perfil" },
        { name: "Panel de Control", href: "/dashboard" },
      ]
    : []

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
          : "bg-background border-b"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_osyris-E1TZNat6NMd1HYB2L396BSVEe9gErJ.png"
                alt="GS Osyris Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority // Cargar con prioridad por estar arriba del pliegue
              />
              <span className="hidden font-bold md:inline-block text-xl text-foreground">GS Osyris</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Navigation items={navigation} pathname={pathname} />
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            {!isLoading && (
              <>
                {user ? (
                  <UserAvatar user={user} logout={logout} userNavigation={userNavigation} />
                ) : (
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="bg-osyris-red hover:bg-osyris-red/90 text-white"
                  >
                    <Link href="/login">Acceder</Link>
                  </Button>
                )}
              </>
            )}

            {/* Mobile menu button - optimizado con lazy loading */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between border-b pb-4">
                    <Link href="/" className="flex items-center">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_osyris-E1TZNat6NMd1HYB2L396BSVEe9gErJ.png"
                        alt="GS Osyris Logo"
                        width={40}
                        height={40}
                        className="h-8 w-8 object-contain"
                      />
                      <span className="ml-2 text-lg font-bold">GS Osyris</span>
                    </Link>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                  </div>
                  <nav className="flex flex-col gap-1 py-6">
                    <Navigation items={navigation} pathname={pathname} />
                    {user &&
                      userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="px-3 py-2 text-base font-medium rounded-md text-foreground/80 hover:text-foreground hover:bg-accent/20"
                        >
                          {item.name}
                        </Link>
                      ))}
                  </nav>
                  <div className="mt-auto border-t pt-4">
                    {user ? (
                      <Button variant="outline" className="w-full" onClick={() => logout()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </Button>
                    ) : (
                      <Button asChild className="w-full bg-osyris-red hover:bg-osyris-red/90 text-white">
                        <Link href="/login">Acceder</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

// Exportar el header memoizado para evitar re-renderizados innecesarios
export default memo(Header)

