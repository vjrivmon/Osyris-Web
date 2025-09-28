import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function RutasPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-500 to-green-700 py-16 md:py-24 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block mb-4 text-5xl">🧭</div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">Rutas - Clan Walhalla</h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">"Servir" - Jóvenes de 16 a 19 años</p>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Rutas en actividad"
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <div className="md:w-1/2 space-y-4">
                <h2 className="text-2xl font-bold">¿Quiénes son los Rutas?</h2>
                <p>
                  Los Rutas son jóvenes de 16 a 19 años que forman el Clan Walhalla. Esta es la última etapa del proceso
                  educativo scout, donde los jóvenes se preparan para la vida adulta a través del servicio a la
                  comunidad y proyectos de mayor envergadura.
                </p>
                <p>
                  Su lema es "Servir", reflejando su compromiso con la sociedad y su disposición para contribuir
                  activamente a la mejora de su entorno. Los Rutas desarrollan un fuerte sentido de ciudadanía y
                  responsabilidad social.
                </p>
                <p>
                  En esta sección, los jóvenes definen su proyecto de vida, consolidan sus valores y ponen en práctica
                  todo lo aprendido en las etapas anteriores. Trabajan en proyectos de servicio significativos y asumen
                  roles de liderazgo dentro del grupo scout.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">¿Qué hacen los Rutas?</h2>
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
                <div className="bg-green-50 border-l-4 border-green-700 p-4 rounded">
                  <h3 className="font-bold mb-2">El Clan</h3>
                  <p>
                    Los Rutas se organizan en un Clan, una comunidad de jóvenes que funciona de manera democrática y
                    autogestionada. El Clan toma decisiones por consenso y se organiza según las necesidades de sus
                    proyectos.
                  </p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-700 p-4 rounded">
                  <h3 className="font-bold mb-2">El Servicio</h3>
                  <p>
                    El servicio a la comunidad es el eje central de la metodología Ruta. Los proyectos de servicio son
                    diseñados, planificados y ejecutados por los propios Rutas, abordando necesidades reales de su
                    entorno.
                  </p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-700 p-4 rounded">
                  <h3 className="font-bold mb-2">El Proyecto Personal</h3>
                  <p>
                    Cada Ruta desarrolla un proyecto personal que refleja sus intereses, habilidades y aspiraciones.
                    Este proyecto contribuye a su crecimiento personal y a la definición de su proyecto de vida.
                  </p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-700 p-4 rounded">
                  <h3 className="font-bold mb-2">La Ruta</h3>
                  <p>
                    La "Ruta" es un viaje físico y simbólico que realizan los miembros del Clan, generalmente al
                    finalizar un proyecto importante. Es un momento de reflexión, celebración y renovación del
                    compromiso con los valores scouts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 bg-green-50">
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
            <div className="flex justify-start">
              <Button asChild variant="outline">
                <Link href="/secciones/pioneros" >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior: Pioneros
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
    icon: "🤝",
    title: "Servicio Comunitario",
    description:
      "Proyectos de servicio a largo plazo que abordan necesidades reales de la comunidad y generan un impacto positivo.",
  },
  {
    icon: "🌍",
    title: "Proyectos Internacionales",
    description:
      "Participación en proyectos y encuentros internacionales que amplían su visión del mundo y fomentan la ciudadanía global.",
  },
  {
    icon: "🧗‍♂️",
    title: "Aventura",
    description:
      "Rutas de montaña, travesías y expediciones que ponen a prueba sus habilidades y fortalecen el espíritu de equipo.",
  },
  {
    icon: "🔄",
    title: "Autogestión",
    description:
      "Gestión autónoma del Clan, incluyendo la planificación de actividades, la administración de recursos y la toma de decisiones.",
  },
  {
    icon: "🎯",
    title: "Proyecto de Vida",
    description:
      "Reflexión y definición de su proyecto de vida, incluyendo aspectos vocacionales, personales y de compromiso social.",
  },
  {
    icon: "👥",
    title: "Liderazgo",
    description:
      "Ejercicio del liderazgo dentro del grupo scout, apoyando a las secciones menores y asumiendo responsabilidades.",
  },
]

// Data for scouters
const scouters = [
  {
    name: "Pedro Gómez",
    role: "Coordinador de Rutas",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Lucía Fernández",
    role: "Scouter de Rutas",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Miguel Torres",
    role: "Scouter de Rutas",
    photo: "/placeholder.svg?height=100&width=100",
  },
]

