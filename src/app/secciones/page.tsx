import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function SeccionesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary py-12 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 text-center text-primary-foreground">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">Nuestras Secciones</h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4">
              El escultismo se adapta a las diferentes etapas de desarrollo de niños y jóvenes
            </p>
          </div>
        </section>

        {/* Secciones Overview */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">El Método Scout por Edades</h2>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                En el Grupo Scout Osyris, adaptamos la metodología scout a las diferentes etapas de desarrollo,
                dividiendo a los educandos en cinco secciones según su edad. Cada sección tiene su propio simbolismo,
                objetivos educativos y actividades adaptadas.
              </p>
            </div>

            <div className="space-y-12 sm:space-y-16">
              {sections.map((section, i) => (
                <div
                  key={i}
                  className={`flex flex-col lg:flex-row gap-6 sm:gap-8 items-center ${i % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}
                >
                  <div className="lg:w-1/2 w-full">
                    <div className={`rounded-lg overflow-hidden h-48 sm:h-56 md:h-64 ${section.gradientClass}`}>
                      <img
                        src={section.image || "/placeholder.svg?height=300&width=600"}
                        alt={section.title}
                        className="w-full h-full object-cover mix-blend-overlay"
                      />
                    </div>
                  </div>
                  <div className="lg:w-1/2 w-full space-y-3 sm:space-y-4">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${section.badgeClass}`}>
                      {section.ageRange}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold">{section.title}</h3>
                    <p className="text-base sm:text-lg font-medium">{section.subtitle}</p>
                    <p className="text-sm sm:text-base text-muted-foreground">{section.description}</p>
                    <div className="pt-2 sm:pt-4">
                      <Button asChild>
                        <Link href={section.href} >
                          Conocer más
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Progression Section */}
        <section className="py-12 sm:py-16 bg-muted">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Progresión Personal</h2>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                El escultismo se basa en la progresión personal, donde cada niño y joven avanza a su propio ritmo,
                adquiriendo habilidades y valores a través de un sistema de etapas y especialidades.
              </p>
            </div>

            <div className="relative border-l-2 border-primary pl-8 space-y-12 max-w-2xl mx-auto">
              {progressionSteps.map((step, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gray-200 dark:bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">¿Quieres formar parte de nuestra familia scout?</h2>
            <p className="max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base px-4">
              Si estás interesado en que tu hijo/a forme parte del Grupo Scout Osyris o quieres unirte como monitor, no
              dudes en contactar con nosotros.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <Button asChild>
                <Link href="/contacto">Contacta con nosotros</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/sobre-nosotros">Conoce más sobre nosotros</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

// Data for sections
const sections = [
  {
    title: "Castores",
    subtitle: "Colonia La Veleta",
    ageRange: "5-7 años",
    description:
      "Los Castores son los más pequeños del grupo. A través del juego y la fantasía, aprenden a compartir y a descubrir el mundo que les rodea. Su lema es 'Compartir' y su símbolo es el castor, un animal que trabaja en equipo para construir su hogar.",
    gradientClass: "bg-gradient-to-br from-orange-400 to-orange-600",
    badgeClass: "badge-castores",
    image: "/placeholder.svg?height=300&width=600",
    href: "/secciones/castores",
  },
  {
    title: "Lobatos",
    subtitle: "Manada Waingunga",
    ageRange: "7-10 años",
    description:
      "Los Lobatos forman la Manada, inspirada en 'El Libro de la Selva' de Rudyard Kipling. Aprenden a través del juego y la aventura, desarrollando su autonomía y responsabilidad. Su lema es 'Haremos lo mejor' y su símbolo es el lobo.",
    gradientClass: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    badgeClass: "badge-manada",
    image: "/placeholder.svg?height=300&width=600",
    href: "/secciones/manada",
  },
  {
    title: "Tropa",
    subtitle: "Tropa Brownsea",
    ageRange: "10-13 años",
    description:
      "La Tropa se organiza en patrullas, pequeños grupos donde los scouts aprenden a trabajar en equipo y a asumir responsabilidades. Desarrollan habilidades técnicas y valores a través de la aventura y la vida en la naturaleza. Su lema es 'Siempre Listos'.",
    gradientClass: "bg-gradient-to-br from-blue-400 to-blue-600",
    badgeClass: "badge-tropa",
    image: "/placeholder.svg?height=300&width=600",
    href: "/secciones/tropa",
  },
  {
    title: "Pioneros",
    subtitle: "Posta Kanhiwara",
    ageRange: "13-16 años",
    description:
      "Los Pioneros trabajan en proyectos que ellos mismos diseñan y ejecutan, desarrollando su autonomía y capacidad de liderazgo. Exploran temas sociales y ambientales, y comienzan a comprometerse con la comunidad. Su lema es 'Descubrir'.",
    gradientClass: "bg-gradient-to-br from-red-400 to-red-600",
    badgeClass: "badge-pioneros",
    image: "/placeholder.svg?height=300&width=600",
    href: "/secciones/pioneros",
  },
  {
    title: "Rutas",
    subtitle: "Ruta Walhalla",
    ageRange: "16-19 años",
    description:
      "Los Rutas son jóvenes que se preparan para la vida adulta a través del servicio a la comunidad y proyectos de mayor envergadura. Desarrollan su compromiso social y su proyecto de vida. Su lema es 'Servir' y representan la culminación del proceso educativo scout.",
    gradientClass: "bg-gradient-to-br from-green-500 to-green-700",
    badgeClass: "badge-rutas",
    image: "/placeholder.svg?height=300&width=600",
    href: "/secciones/rutas",
  },
]

// Data for progression steps
const progressionSteps = [
  {
    title: "Integración",
    description:
      "El niño o joven se familiariza con el grupo, conoce a sus compañeros y aprende los elementos básicos del escultismo.",
  },
  {
    title: "Participación",
    description:
      "Comienza a participar activamente en las actividades y a asumir pequeñas responsabilidades dentro de su sección.",
  },
  {
    title: "Animación",
    description: "Desarrolla habilidades de liderazgo y comienza a proponer y liderar actividades para sus compañeros.",
  },
  {
    title: "Compromiso",
    description:
      "Asume un compromiso personal con los valores scouts y comienza a proyectarlos en su vida diaria y en su entorno.",
  },
  {
    title: "Servicio",
    description:
      "Culmina su progresión scout con un compromiso de servicio a la comunidad y a los demás, preparándose para la vida adulta.",
  },
]

