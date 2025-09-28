import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function LobatosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 py-16 md:py-24 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block mb-4 text-5xl">🐺</div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              Lobatos - Manada Waingunga
            </h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">"Haremos lo mejor" - Niños y niñas de 7 a 10 años</p>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Lobatos en actividad"
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <div className="md:w-1/2 space-y-4">
                <h2 className="text-2xl font-bold">¿Quiénes son los Lobatos?</h2>
                <p>
                  Los Lobatos forman la Manada, inspirada en "El Libro de la Selva" de Rudyard Kipling. Aprenden a
                  través del juego y la aventura, desarrollando su autonomía y responsabilidad. Su lema es "Haremos lo
                  mejor" y su símbolo es el lobo.
                </p>
                <p>
                  En la Manada Waingunga, los niños y niñas de 7 a 10 años continúan su aventura scout en un ambiente
                  donde desarrollan habilidades sociales, aprenden a trabajar en equipo y comienzan a asumir pequeñas
                  responsabilidades.
                </p>
                <p>
                  El marco simbólico de los Lobatos está inspirado en "El Libro de la Selva", donde los personajes como
                  Akela, Baloo y Bagheera guían a los lobatos en su aprendizaje y crecimiento, enseñándoles valores como
                  la lealtad, el respeto y la ayuda a los demás.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">¿Qué hacen los Lobatos?</h2>
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
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h3 className="font-bold mb-2">La Manada</h3>
                  <p>
                    Los Lobatos se organizan en una Manada, que a su vez se divide en pequeños grupos llamados
                    "seisenas". Cada seisena tiene un seisenero que ayuda a coordinar al grupo, fomentando el liderazgo
                    y la responsabilidad.
                  </p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h3 className="font-bold mb-2">El Juego</h3>
                  <p>
                    El juego sigue siendo la principal herramienta educativa. A través de juegos temáticos basados en
                    "El Libro de la Selva", los Lobatos aprenden valores, desarrollan habilidades y fortalecen su
                    sentido de pertenencia al grupo.
                  </p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h3 className="font-bold mb-2">La Aventura</h3>
                  <p>
                    Las actividades se presentan como aventuras en la selva, donde los Lobatos deben superar desafíos,
                    aprender nuevas habilidades y trabajar juntos para alcanzar objetivos comunes.
                  </p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h3 className="font-bold mb-2">La Progresión Personal</h3>
                  <p>
                    Cada Lobato avanza a su propio ritmo, adquiriendo habilidades y valores a través de un sistema de
                    etapas: Integración, Participación y Animación. También pueden obtener especialidades en áreas
                    específicas de interés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 bg-yellow-50">
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
                <Link href="/secciones/tropa" >
                  Siguiente: Tropa
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
      "Juegos cooperativos, de aventura y al aire libre que fomentan el trabajo en equipo, la agilidad y el aprendizaje de valores.",
  },
  {
    icon: "🌳",
    title: "Naturaleza",
    description:
      "Excursiones y actividades en la naturaleza donde aprenden a respetarla, conocerla y disfrutarla de manera responsable.",
  },
  {
    icon: "🧩",
    title: "Desafíos",
    description:
      "Pequeños retos y pruebas que les ayudan a desarrollar habilidades como la orientación, el rastreo y la observación.",
  },
  {
    icon: "🏕️",
    title: "Acampadas",
    description:
      "Experiencias de acampada donde aprenden a ser más autónomos, a convivir y a disfrutar de la vida al aire libre.",
  },
  {
    icon: "🤝",
    title: "Valores",
    description:
      "Actividades que fomentan valores como la lealtad, el respeto, la ayuda a los demás y el cuidado del entorno.",
  },
  {
    icon: "🎭",
    title: "Expresión",
    description:
      "Danzas de la selva, representaciones y canciones que les ayudan a expresarse y a desarrollar su creatividad.",
  },
]

// Data for scouters
const scouters = [
  {
    name: "María García",
    role: "Coordinadora de Lobatos",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Carlos Rodríguez",
    role: "Scouter de Lobatos",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Ana Martínez",
    role: "Scouter de Lobatos",
    photo: "/placeholder.svg?height=100&width=100",
  },
]

