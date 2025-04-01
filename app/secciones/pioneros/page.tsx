import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function PionerosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-red-400 to-red-600 py-16 md:py-24 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block mb-4 text-5xl">🔍</div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              Pioneros - Posta Kanhiwara
            </h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">"Descubrir" - Jóvenes de 13 a 16 años</p>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Pioneros en actividad"
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <div className="md:w-1/2 space-y-4">
                <h2 className="text-2xl font-bold">¿Quiénes son los Pioneros?</h2>
                <p>
                  Los Pioneros son jóvenes de 13 a 16 años que forman la Posta Kanhiwara. En esta etapa, comienzan a
                  tomar decisiones más importantes, a diseñar sus propios proyectos y a asumir un mayor compromiso con
                  la comunidad.
                </p>
                <p>
                  Su lema es "Descubrir", reflejando la etapa de exploración personal y social en la que se encuentran.
                  Los Pioneros exploran sus intereses, descubren sus capacidades y comienzan a definir su identidad y su
                  papel en la sociedad.
                </p>
                <p>
                  En esta sección, los jóvenes trabajan en proyectos que ellos mismos diseñan y ejecutan, desarrollando
                  su autonomía, capacidad de liderazgo y sentido de la responsabilidad. Exploran temas sociales y
                  ambientales, y comienzan a comprometerse activamente con la comunidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">¿Qué hacen los Pioneros?</h2>
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
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h3 className="font-bold mb-2">La Posta</h3>
                  <p>
                    Los Pioneros se organizan en una Posta, que funciona como una comunidad donde todos participan en la
                    toma de decisiones. Dentro de la Posta, se forman equipos de trabajo para desarrollar proyectos
                    específicos.
                  </p>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h3 className="font-bold mb-2">Los Proyectos</h3>
                  <p>
                    La metodología se centra en el desarrollo de proyectos diseñados y ejecutados por los propios
                    Pioneros. Estos proyectos pueden ser de servicio comunitario, medioambientales, culturales o de
                    aventura.
                  </p>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h3 className="font-bold mb-2">La Empresa</h3>
                  <p>
                    La "Empresa" es un proyecto de mayor envergadura que involucra a toda la Posta y que se desarrolla a
                    lo largo de varios meses. Incluye fases de ideación, planificación, ejecución y evaluación.
                  </p>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h3 className="font-bold mb-2">La Progresión Personal</h3>
                  <p>
                    Cada Pionero avanza en su progresión personal a través de retos y compromisos que asume. Se fomenta
                    la reflexión sobre los valores scouts y su aplicación en la vida diaria, así como el desarrollo de
                    habilidades de liderazgo y trabajo en equipo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 bg-red-50">
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
                <Link href="/secciones/tropa">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior: Tropa
                </Link>
              </Button>
              <Button asChild className="mt-4 sm:mt-0">
                <Link href="/secciones/rutas">
                  Siguiente: Rutas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

// Data for activities
const activities = [
  {
    icon: "🌍",
    title: "Proyectos Sociales",
    description:
      "Iniciativas de servicio a la comunidad donde los Pioneros identifican necesidades y desarrollan soluciones.",
  },
  {
    icon: "🏕️",
    title: "Aventura",
    description:
      "Actividades de aventura como travesías, rutas de montaña y campamentos que ponen a prueba sus habilidades.",
  },
  {
    icon: "🧠",
    title: "Desarrollo Personal",
    description:
      "Actividades enfocadas en el autoconocimiento, la definición de valores personales y el desarrollo de habilidades.",
  },
  {
    icon: "👥",
    title: "Liderazgo",
    description: "Oportunidades para ejercer el liderazgo, coordinar equipos y asumir responsabilidades en proyectos.",
  },
  {
    icon: "🌱",
    title: "Medio Ambiente",
    description:
      "Proyectos de conservación y educación ambiental que fomentan la conciencia ecológica y la sostenibilidad.",
  },
  {
    icon: "🎭",
    title: "Expresión",
    description: "Actividades artísticas y culturales que permiten a los Pioneros expresar sus ideas y emociones.",
  },
]

// Data for scouters
const scouters = [
  {
    name: "Laura Sánchez",
    role: "Coordinadora de Pioneros",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Javier Díaz",
    role: "Scouter de Pioneros",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Sara Fernández",
    role: "Scouter de Pioneros",
    photo: "/placeholder.svg?height=100&width=100",
  },
]

