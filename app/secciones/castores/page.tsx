import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function CastoresPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-400 to-orange-600 py-16 md:py-24 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block mb-4 text-5xl">🦫</div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              Castores - Colonia La Veleta
            </h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">"Compartir" - Niños y niñas de 5 a 7 años</p>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Castores en actividad"
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <div className="md:w-1/2 space-y-4">
                <h2 className="text-2xl font-bold">¿Quiénes son los Castores?</h2>
                <p>
                  Los Castores son los más pequeños del grupo scout. A través del juego y la fantasía, aprenden a
                  compartir y a descubrir el mundo que les rodea. Su lema es "Compartir" y su símbolo es el castor, un
                  animal que trabaja en equipo para construir su hogar.
                </p>
                <p>
                  En la Colonia La Veleta, los niños y niñas de 5 a 7 años comienzan su aventura scout en un ambiente
                  seguro y divertido, donde desarrollan su creatividad, curiosidad y habilidades sociales básicas.
                </p>
                <p>
                  El marco simbólico de los Castores está inspirado en el cuento "Los amigos del bosque", donde los
                  personajes principales son castores que viven en un estanque y aprenden a convivir y a cuidar de la
                  naturaleza.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">¿Qué hacen los Castores?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activities.map((activity, i) => (
                <div key={i} className="bg-background rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">{activity.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                  <p className="text-muted-foreground">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Metodología</h2>
              <div className="space-y-6">
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <h3 className="font-bold mb-2">El Juego</h3>
                  <p>
                    El juego es la principal herramienta educativa para los Castores. A través de juegos divertidos y
                    adaptados a su edad, aprenden valores, desarrollan habilidades y descubren el mundo que les rodea.
                  </p>
                </div>
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <h3 className="font-bold mb-2">La Fantasía</h3>
                  <p>
                    El marco simbólico de "Los amigos del bosque" permite a los Castores vivir aventuras imaginarias que
                    les ayudan a comprender conceptos y valores de forma divertida y adaptada a su edad.
                  </p>
                </div>
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <h3 className="font-bold mb-2">El Pequeño Grupo</h3>
                  <p>
                    Los Castores se organizan en pequeños grupos llamados "madrigueras", donde aprenden a trabajar en
                    equipo, a respetar a los demás y a asumir pequeñas responsabilidades.
                  </p>
                </div>
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <h3 className="font-bold mb-2">La Progresión Personal</h3>
                  <p>
                    Cada Castor avanza a su propio ritmo, adquiriendo habilidades y valores a través de un sistema de
                    etapas adaptado a su edad: Integración, Participación y Animación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 bg-orange-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Nuestro Equipo de Scouters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {scouters.map((scouter, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    <img
                      src={scouter.photo || "/placeholder.svg?height=100&width=100"}
                      alt={scouter.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold">{scouter.name}</h3>
                  <p className="text-sm text-muted-foreground">{scouter.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Navigation Section */}
        <section className="py-8 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <Button asChild variant="outline">
                <Link href="/secciones" >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Secciones
                </Link>
              </Button>
              <Button asChild className="mt-4 sm:mt-0">
                <Link href="/secciones/manada" >
                  Siguiente: Manada
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

// Data for activities
const activities = [
  {
    icon: "🎮",
    title: "Juegos",
    description:
      "Juegos cooperativos, de imaginación y al aire libre que fomentan la diversión, el trabajo en equipo y el aprendizaje.",
  },
  {
    icon: "🌳",
    title: "Naturaleza",
    description:
      "Primeros contactos con la naturaleza, aprendiendo a respetarla y disfrutarla a través de excursiones y actividades sencillas.",
  },
  {
    icon: "🎨",
    title: "Manualidades",
    description:
      "Talleres creativos donde desarrollan su imaginación y habilidades manuales, creando objetos relacionados con el marco simbólico.",
  },
  {
    icon: "🏕️",
    title: "Acampadas",
    description:
      "Primeras experiencias de acampada adaptadas a su edad, donde aprenden a convivir y a ser más autónomos.",
  },
  {
    icon: "🤝",
    title: "Valores",
    description:
      "Actividades que fomentan valores como la amistad, el respeto, la colaboración y el cuidado del entorno.",
  },
  {
    icon: "🎭",
    title: "Expresión",
    description: "Canciones, danzas y representaciones que les ayudan a expresarse y a desarrollar su confianza.",
  },
]

// Data for scouters
const scouters = [
  {
    name: "Laura Sánchez",
    role: "Coordinadora de Castores",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Pedro Gómez",
    role: "Scouter de Castores",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Lucía Fernández",
    role: "Scouter de Castores",
    photo: "/placeholder.svg?height=100&width=100",
  },
]

