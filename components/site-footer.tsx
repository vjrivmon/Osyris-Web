import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/images/logo-osyris.png" alt="Logo Grupo Scout Osyris" className="h-12 w-12" />
              <h3 className="text-xl font-bold">Grupo Scout Osyris</h3>
            </div>
            <p className="text-primary-foreground/80">
              Educando en valores desde 1981. Pertenecemos al Moviment Escolta de València - MSC.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.facebook.com/osyris.gruposcout/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/osyris.scouts"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.youtube.com/@GrupoScoutOsyris"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:info@grupoosyris.es"
                className="hover:text-secondary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-secondary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/secciones" className="hover:text-secondary transition-colors">
                  Secciones
                </Link>
              </li>
              <li>
                <Link href="/calendario" className="hover:text-secondary transition-colors">
                  Calendario
                </Link>
              </li>
              <li>
                <Link href="/galeria" className="hover:text-secondary transition-colors">
                  Galería
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="hover:text-secondary transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-secondary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Secciones</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/secciones/castores" className="hover:text-secondary transition-colors">
                  Castores (5-7 años)
                </Link>
              </li>
              <li>
                <Link href="/secciones/manada" className="hover:text-secondary transition-colors">
                  Manada (7-10 años)
                </Link>
              </li>
              <li>
                <Link href="/secciones/tropa" className="hover:text-secondary transition-colors">
                  Tropa (10-13 años)
                </Link>
              </li>
              <li>
                <Link href="/secciones/pioneros" className="hover:text-secondary transition-colors">
                  Pioneros (13-16 años)
                </Link>
              </li>
              <li>
                <Link href="/secciones/rutas" className="hover:text-secondary transition-colors">
                  Rutas (16-19 años)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <address className="not-italic space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Calle Poeta Ricard Sanmartí nº3, Barrio de Benimaclet, Valencia</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>+34 600 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>info@grupoosyris.es</span>
              </div>
            </address>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Grupo Scout Osyris. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

