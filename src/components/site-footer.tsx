import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Scout pattern overlay - Flor de lis */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 6c-3 5-4 11-4 16 0-5-1-11-4-16-1 4-1 8 0 12-4-4-9-7-15-7 4 3 7 7 8 11-5-3-11-4-16-4 5 3 10 7 12 12-3-1-7-1-10 0 3 2 6 4 7 7l-5 1c3 2 5 4 6 7 0 3-2 6-3 8h5c2-3 3-5 6-7 1 2 3 5 3 8h5c0-3 2-6 3-8 3 2 4 4 6 7h5c-2-2-3-5-3-8 2-3 3-5 6-7l-5-1c1-3 4-5 7-7-3-1-7-1-10 0 2-5 7-9 12-12-5 0-11 1-16 4 1-4 4-8 8-11-6 0-11 3-15 7 1-4 1-8 0-12z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Scout sections color bar */}
        <div className="flex h-1 mb-8 rounded-full overflow-hidden">
          <div className="flex-1 bg-orange-500"></div>
          <div className="flex-1 bg-yellow-400"></div>
          <div className="flex-1 bg-blue-500"></div>
          <div className="flex-1 bg-red-600"></div>
          <div className="flex-1 bg-green-700"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/images/logo-osyris.png"
                  alt="Logo Grupo Scout Osyris"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border-2 border-white/30 shadow-lg"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold">Grupo Scout Osyris</h3>
                <span className="text-xs text-primary-foreground/70 flex items-center gap-1">
                  <span className="text-secondary">&#9884;</span> MEV-MSC
                </span>
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
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="text-secondary">&#9654;</span> Enlaces Rapidos
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
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="text-secondary">&#9650;</span> Secciones
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/secciones/castores" className="hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Castores (5-7 anos)
                </Link>
              </li>
              <li>
                <Link href="/secciones/manada" className="hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  Manada (7-10 anos)
                </Link>
              </li>
              <li>
                <Link href="/secciones/tropa" className="hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Tropa (10-13 anos)
                </Link>
              </li>
              <li>
                <Link href="/secciones/pioneros" className="hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Pioneros (13-16 anos)
                </Link>
              </li>
              <li>
                <Link href="/secciones/rutas" className="hover:text-secondary transition-colors text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-700"></span>
                  Rutas (16-19 anos)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="text-secondary">&#9993;</span> Contacto
            </h4>
            <address className="not-italic space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-secondary" />
                <span className="text-sm">Calle Poeta Ricard Sanmarti n3, Barrio de Benimaclet, Valencia</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span className="text-sm">+34 600 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-secondary" />
                <span className="text-sm">info@grupoosyris.es</span>
              </div>
            </address>
            {/* Scout affiliation badge */}
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-xs text-primary-foreground/70 text-center">
                Miembro de<br/>
                <span className="font-semibold text-primary-foreground">Moviment Escolta de Valencia</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60 text-center sm:text-left">
              &copy; {new Date().getFullYear()} Grupo Scout Osyris. Todos los derechos reservados.
            </p>
            <p className="text-xs text-primary-foreground/40 flex items-center gap-1">
              <span className="text-secondary">&#9884;</span> Siempre listos, siempre Osyris
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
