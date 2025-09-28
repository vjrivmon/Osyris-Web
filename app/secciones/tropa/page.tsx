import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function TropaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-400 to-blue-600 py-16 md:py-24 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block mb-4 text-5xl">🧭</div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">Tropa - Tropa Brownsea</h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">"Siempre Listos" - Niños y niñas de 10 a 13 años</p>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Scouts en actividad"
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <div className="md:w-1/2 space-y-4">
                <h2 className="text-2xl font-bold">¿Qué es la Tropa Scout?</h2>
                <p>
                  La Tropa Scout está formada por chicos y chicas de 10 a 13 años que se organizan en pequeños grupos
                  llamados "patrullas". Cada patrulla tiene un guía y un subguía que ayudan a coordinar al grupo,
                  fomentando el liderazgo y la responsabilidad.
                </p>
                <p>
                  En la Tropa Brownsea, nombrada en honor a la isla donde Baden-Powell realizó el primer campamento
                  scout, los jóvenes desarrollan habilidades técnicas, aprenden a trabajar en equipo y comienzan a
                  asumir responsabilidades más importantes.
                </p>
                <p>
                  El lema de la Tropa es "Siempre Listos", reflejando la actitud de preparación y disposición para
                  ayudar que caracteriza a los scouts. A través de la aventura y la vida en la naturaleza, los scouts
                  aprenden valores como la lealtad, el servicio y el respeto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">¿Qué hacen en la Tropa?</h2>
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
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-bold mb-2">El Sistema de Patrullas</h3>
                  <p>
                    La Tropa se organiza en patrullas de 6-8 scouts. Cada patrulla tiene un nombre, un emblema y
                    tradiciones propias. Este sistema fomenta el liderazgo, la responsabilidad y el trabajo en equipo.
                  </p>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-bold mb-2">La Aventura</h3>
                  <p>
                    Las actividades se presentan como aventuras donde los scouts deben aplicar conocimientos técnicos,
                    trabajar en equipo y resolver problemas. Las aventuras incluyen excursiones, campamentos y
                    proyectos.
                  </p>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-bold mb-2">Técnicas Scout</h3>
                  <p>
                    Los scouts aprenden habilidades prácticas como orientación, primeros auxilios, construcciones con
                    cuerdas y maderas, cocina al aire libre y técnicas de acampada, que les serán útiles en su vida.
                  </p>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-bold mb-2">La Progresión Personal</h3>
                  <p>
                    Cada scout avanza a su propio ritmo a través de etapas de progresión y especialidades en áreas
                    específicas. Se reconoce su esfuerzo y logros mediante insignias que reflejan sus habilidades.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 bg-blue-50">
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
                <Link href="/secciones/lobatos" >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior: Lobatos
                </Link>
              </Button>
              <Button asChild className="mt-4 sm:mt-0">
                <Link href="/secciones/pioneros" >
                  Siguiente: Pioneros
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
    icon: "🧭",
    title: "Orientación",
    description:
      "Aprenden a usar mapas, brújulas y técnicas de orientación para moverse con seguridad en la naturaleza.",
  },
  {
    icon: "🔥",
    title: "Campismo",
    description:
      "Técnicas de acampada, construcciones con cuerdas y maderas, y habilidades para la vida al aire libre.",
  },
  {
    icon: "🌿",
    title: "Naturaleza",
    description:
      "Conocimiento y respeto por el medio ambiente, identificación de flora y fauna, y prácticas de conservación.",
  },
  {
    icon: "🚶‍♂️",
    title: "Excursiones",
    description:
      "Rutas de senderismo y exploración donde ponen en práctica sus habilidades y fortalecen el espíritu de equipo.",
  },
  {
    icon: "🛠️",
    title: "Proyectos",
    description:
      "Desarrollo de pequeños proyectos en patrulla que fomentan la creatividad, la planificación y el trabajo en equipo.",
  },
  {
    icon: "🧠",
    title: "Especialidades",
    description:
      "Desarrollo de habilidades específicas en áreas de interés personal como primeros auxilios, cocina, astronomía, etc.",
  },
]

// Data for scouters
const scouters = [
  {
    name: "Juan López",
    role: "Coordinador de Tropa",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Elena Ruiz",
    role: "Scouter de Tropa",
    photo: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "David Gómez",
    role: "Scouter de Tropa",
    photo: "/placeholder.svg?height=100&width=100",
  },
]

