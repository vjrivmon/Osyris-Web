import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo-osyris.png"
                alt="Logo Grupo Scout Osyris"
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border-2 border-white/30 shadow-lg"
                priority
              />
              <div className="flex flex-col">
                <h3 className="text-xl font-bold">Grupo Scout Osyris</h3>
                <span className="text-xs text-primary-foreground/70">Desde 1981 en Valencia</span>
              </div>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Educando en valores desde 1981. Formamos parte del Moviment Escolta de Valencia - Movimiento Scout Catolico.
            </p>
            <div className="pt-2">
              <p className="text-xs text-primary-foreground/60 italic mb-3">"Siempre listos para servir"</p>
              <div className="flex space-x-3">
                <Link
                  href="https://www.facebook.com/osyris.gruposcout/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-secondary hover:text-black transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Link>
                <Link
                  href="https://www.instagram.com/osyris.scouts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-secondary hover:text-black transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </Link>
                <Link
                  href="https://www.youtube.com/@GrupoScoutOsyris"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-secondary hover:text-black transition-all"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </Link>
                <Link
                  href="mailto:info@grupoosyris.es"
                  className="p-2 rounded-full bg-white/10 hover:bg-secondary hover:text-black transition-all"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">
              Enlaces Rapidos
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-secondary transition-colors text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/secciones" className="hover:text-secondary transition-colors text-sm">
                  Secciones
                </Link>
              </li>
              <li>
                <Link href="/calendario" className="hover:text-secondary transition-colors text-sm">
                  Calendario
                </Link>
              </li>
              <li>
                <Link href="/galeria" className="hover:text-secondary transition-colors text-sm">
                  Galeria
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="hover:text-secondary transition-colors text-sm">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-secondary transition-colors text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">
              Secciones
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/secciones/castores" className="hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Castores (5-7 años)
                </Link>
              </li>
              <li>
                <Link href="/secciones/manada" className="hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  Manada (7-10 años)
                </Link>
              </li>
              <li>
                <Link href="/secciones/tropa" className="hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Tropa (10-13 años)
                </Link>
              </li>
              <li>
                <Link href="/secciones/pioneros" className="hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Pioneros (13-16 años)
                </Link>
              </li>
              <li>
                <Link href="/secciones/rutas" className="hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-700"></span>
                  Rutas (16-19 años)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">
              Contacto
            </h4>
            <address className="not-italic space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-secondary" />
                <span className="text-sm">Calle Poeta Ricard Sanmarti n3, Barrio de Benimaclet, Valencia</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span className="text-sm">+34 601 037 577</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-secondary" />
                <span className="text-sm">web.osyris@gmail.com</span>
              </div>
            </address>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60 text-center sm:text-left">
              &copy; {new Date().getFullYear()} Grupo Scout Osyris. Todos los derechos reservados.
            </p>
            <div className="text-center sm:text-right">
              <p className="text-xs text-primary-foreground/50 italic mb-1">
                "Un nuevo escultismo es posible"
              </p>
              <p className="text-sm text-primary-foreground/60">
                Desarrollado por:{" "}
                <Link
                  href="https://www.vicenterivasmonferrer.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-secondary/80 transition-colors font-medium"
                >
                  Vicente Rivas Monferrer
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
