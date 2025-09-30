import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PageEditor from "@/components/ui/page-editor"
import Link from "next/link"
import { Mail } from "lucide-react"

// Definición de elementos editables para la página Comité
const editableElements = [
  {
    id: 'hero-title',
    type: 'text' as const,
    selector: '[data-edit="hero-title"]',
    label: 'Título principal',
    content: 'Comité de Grupo',
    maxLength: 100
  },
  {
    id: 'hero-subtitle',
    type: 'text' as const,
    selector: '[data-edit="hero-subtitle"]',
    label: 'Subtítulo del héroe',
    content: 'El equipo directivo que guía y coordina las actividades del Grupo Scout Osyris',
    maxLength: 200
  },
  {
    id: 'what-title',
    type: 'text' as const,
    selector: '[data-edit="what-title"]',
    label: 'Título qué es el comité',
    content: '¿Qué es el Comité de Grupo?',
    maxLength: 100
  },
  {
    id: 'what-description',
    type: 'textarea' as const,
    selector: '[data-edit="what-description"]',
    label: 'Descripción qué es el comité',
    content: 'El Comité de Grupo es el órgano de gobierno del grupo scout, responsable de la gestión, planificación y coordinación de todas las actividades. Está compuesto por padres y madres voluntarios que dedican su tiempo para asegurar el buen funcionamiento del grupo.',
    maxLength: 1000
  },
  {
    id: 'members-title',
    type: 'text' as const,
    selector: '[data-edit="members-title"]',
    label: 'Título miembros',
    content: 'Miembros del Comité',
    maxLength: 100
  },
  {
    id: 'functions-title',
    type: 'text' as const,
    selector: '[data-edit="functions-title"]',
    label: 'Título funciones',
    content: 'Funciones del Comité',
    maxLength: 100
  },
  {
    id: 'meetings-title',
    type: 'text' as const,
    selector: '[data-edit="meetings-title"]',
    label: 'Título reuniones',
    content: 'Reuniones y Participación',
    maxLength: 100
  },
  {
    id: 'join-title',
    type: 'text' as const,
    selector: '[data-edit="join-title"]',
    label: 'Título únete',
    content: '¿Quieres formar parte del Comité?',
    maxLength: 100
  },
  {
    id: 'join-description',
    type: 'textarea' as const,
    selector: '[data-edit="join-description"]',
    label: 'Descripción únete',
    content: 'Si quieres contribuir activamente a la educación scout de tu hijo/a y tienes tiempo para dedicar al grupo, ¡te invitamos a participar en nuestro Comité!',
    maxLength: 500
  }
]

export default function ComitePage() {
  return (
    <PageEditor
      pageName="Comité de Grupo"
      pageSlug="sobre-nosotros-comite"
      elements={editableElements}
    >
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <MainNav />
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-primary py-16 md:py-24">
            <div className="container mx-auto px-4 text-center text-primary-foreground">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6" data-edit="hero-title">
                Comité de Grupo
              </h1>
              <p className="mt-4 text-xl max-w-3xl mx-auto" data-edit="hero-subtitle">
                El equipo directivo que guía y coordina las actividades del Grupo Scout Osyris
              </p>
            </div>
          </section>

          {/* What is Committee Section */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-6" data-edit="what-title">
                  ¿Qué es el Comité de Grupo?
                </h2>
                <p className="text-lg text-muted-foreground mb-8" data-edit="what-description">
                  El Comité de Grupo es el órgano de gobierno del grupo scout, responsable de la gestión,
                  planificación y coordinación de todas las actividades. Está compuesto por padres y madres
                  voluntarios que dedican su tiempo para asegurar el buen funcionamiento del grupo.
                </p>
              </div>
            </div>
          </section>

          {/* Committee Team Section */}
          <section className="py-12 bg-muted">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8" data-edit="members-title">
                Miembros del Comité
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {committeeTeam.map((member, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-64 relative">
                      <img
                        src={member.photo || "/placeholder.svg?height=300&width=300"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className="text-primary mb-2">{member.role}</p>
                      <p className="text-sm text-muted-foreground mb-4">{member.description}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Contactar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Functions Section */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-12" data-edit="functions-title">
                  Funciones del Comité
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {committeeFunctions.map((func, i) => (
                    <Card key={i} className="p-6">
                      <div className="text-4xl mb-4 text-center">{func.icon}</div>
                      <h3 className="text-xl font-bold mb-3 text-center">{func.title}</h3>
                      <p className="text-muted-foreground text-center">{func.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Meetings Section */}
          <section className="py-12 bg-muted">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-6" data-edit="meetings-title">
                  Reuniones y Participación
                </h2>
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-3">📅 Reuniones Regulares</h3>
                    <p className="text-muted-foreground">
                      El Comité se reúne mensualmente para revisar la marcha del grupo, planificar actividades
                      y tomar decisiones importantes. Las reuniones son abiertas a todos los padres y madres.
                    </p>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-3">🗳️ Asamblea General</h3>
                    <p className="text-muted-foreground">
                      Una vez al año se celebra la Asamblea General donde se presenta la memoria de actividades,
                      el balance económico y se eligen los nuevos miembros del Comité.
                    </p>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-3">🤝 Participación Familiar</h3>
                    <p className="text-muted-foreground">
                      Todas las familias están invitadas a participar en las actividades del grupo y a colaborar
                      con el Comité en la organización de eventos especiales.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Join Us Section */}
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6" data-edit="join-title">
                ¿Quieres formar parte del Comité?
              </h2>
              <p className="max-w-2xl mx-auto mb-8" data-edit="join-description">
                Si quieres contribuir activamente a la educación scout de tu hijo/a y tienes tiempo para dedicar
                al grupo, ¡te invitamos a participar en nuestro Comité!
              </p>
              <Button asChild variant="secondary">
                <Link href="/contacto">Contacta con nosotros</Link>
              </Button>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </PageEditor>
  )
}

// Mock data
const committeeTeam = [
  {
    name: "Isabel González",
    role: "Presidenta",
    description:
      "Madre de dos scouts del grupo. Coordina las actividades generales y representa al grupo ante Scouts de España.",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Roberto Fernández",
    role: "Vicepresidente",
    description: "Padre scout con experiencia en gestión. Apoya a la presidenta y coordina proyectos especiales.",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Carmen López",
    role: "Secretaria",
    description: "Responsable de las actas, comunicaciones oficiales y gestión documental del grupo.",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "David Martínez",
    role: "Tesorero",
    description: "Encargado de la gestión económica, presupuestos y control financiero del grupo.",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Pilar Ruiz",
    role: "Vocal de Actividades",
    description: "Coordina la planificación de campamentos, excursiones y eventos especiales.",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Miguel Serrano",
    role: "Vocal de Familias",
    description: "Enlace entre el Comité y las familias, promueve la participación parental.",
    photo: "/placeholder.svg?height=300&width=300",
  },
]

const committeeFunctions = [
  {
    icon: "📋",
    title: "Planificación",
    description: "Planifica y coordina el calendario anual de actividades, campamentos y eventos especiales del grupo."
  },
  {
    icon: "💰",
    title: "Gestión Económica",
    description: "Administra los recursos económicos, elabora presupuestos y controla los gastos e ingresos del grupo."
  },
  {
    icon: "📄",
    title: "Gestión Administrativa",
    description: "Mantiene la documentación oficial, gestiona seguros, permisos y trámites necesarios."
  },
  {
    icon: "🤝",
    title: "Relaciones Institucionales",
    description: "Representa al grupo ante Scouts de España, instituciones locales y otros grupos scouts."
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Apoyo a Familias",
    description: "Facilita la comunicación con las familias y promueve su participación en la vida del grupo."
  },
  {
    icon: "🏕️",
    title: "Apoyo a Scouters",
    description: "Brinda apoyo logístico y material a los equipos de scouters para el desarrollo de sus actividades."
  }
]