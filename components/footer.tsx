"use client"

import { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Instagram, Youtube, Twitter } from "lucide-react"

// Componente de enlaces de navegación memoizado
const FooterNavLinks = memo(({ title, links }: { title: string; links: { href: string; label: string }[] }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
))
FooterNavLinks.displayName = "FooterNavLinks"

// Componente de redes sociales memoizado
const SocialLinks = memo(() => (
  <div className="flex space-x-4">
    <Link
      href="https://www.instagram.com/osyris.scouts/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-white/80 hover:text-white transition-colors"
      aria-label="Instagram"
    >
      <Instagram className="h-5 w-5" />
      <span className="sr-only">Instagram</span>
    </Link>
    <Link
      href="https://www.youtube.com/user/GrupoScoutOsyris"
      target="_blank"
      rel="noopener noreferrer"
      className="text-white/80 hover:text-white transition-colors"
      aria-label="YouTube"
    >
      <Youtube className="h-5 w-5" />
      <span className="sr-only">YouTube</span>
    </Link>
    <Link 
      href="https://twitter.com" 
      className="text-white/80 hover:text-white transition-colors"
      aria-label="Twitter"
    >
      <Twitter className="h-5 w-5" />
      <span className="sr-only">Twitter</span>
    </Link>
  </div>
))
SocialLinks.displayName = "SocialLinks"

function Footer() {
  // Año actual para el copyright
  const currentYear = new Date().getFullYear()
  
  // Enlaces rápidos
  const quickLinks = [
    { href: "/", label: "Inicio" },
    { href: "/sobre-nosotros", label: "Sobre Nosotros" },
    { href: "/calendario", label: "Calendario" },
    { href: "/contacto", label: "Contacto" }
  ]
  
  // Enlaces de secciones
  const sectionLinks = [
    { href: "/secciones/castores", label: "Castores" },
    { href: "/secciones/lobatos", label: "Lobatos" },
    { href: "/secciones/scouts", label: "Scouts" },
    { href: "/secciones/escultas", label: "Escultas" },
    { href: "/secciones/rovers", label: "Rovers" }
  ]

  return (
    <footer className="bg-osyris-navy text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_osyris-E1TZNat6NMd1HYB2L396BSVEe9gErJ.png"
                alt="GS Osyris Logo"
                width={60}
                height={60}
                className="h-12 w-12 object-contain"
                loading="lazy" // Cargar la imagen de manera diferida ya que está al final de la página
              />
              <span className="ml-2 text-xl font-bold">GS Osyris</span>
            </Link>
            <p className="text-sm text-white/80">
              Grupo Scout Osyris, comprometidos con la formación de jóvenes a través del método scout.
            </p>
            <SocialLinks />
          </div>

          <FooterNavLinks title="Enlaces rápidos" links={quickLinks} />
          <FooterNavLinks title="Secciones" links={sectionLinks} />

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <address className="not-italic text-white/80">
              <p>C/ Poeta Ricard Sanmartí, 13</p>
              <p>46019 Benimaclet, Valencia</p>
              <p className="mt-2">
                <a href="mailto:info@gsosyris.org" className="hover:text-white transition-colors">
                  info@gsosyris.org
                </a>
              </p>
              <p>
                <a href="tel:+34600000000" className="hover:text-white transition-colors">
                  +34 600 000 000
                </a>
              </p>
            </address>
            <p className="mt-2 text-white/80">
              <span className="font-medium">Horario:</span> Sábados de 16:30 a 18:30
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
          <p>© {currentYear} Grupo Scout Osyris. Todos los derechos reservados.</p>
          <p className="mt-1">
            <Link href="/privacidad" className="hover:text-white transition-colors">
              Política de Privacidad
            </Link>
            {" · "}
            <Link href="/cookies" className="hover:text-white transition-colors">
              Política de Cookies
            </Link>
            {" · "}
            <Link href="/aviso-legal" className="hover:text-white transition-colors">
              Aviso Legal
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

// Exportar como componente memoizado para evitar re-renderizados innecesarios
export default memo(Footer)

