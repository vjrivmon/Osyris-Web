"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StaticText, StaticImage } from "@/components/ui/static-content"
import Link from "next/link"

// Mock data - En fase futura se cargará dinámicamente de BD
const committeeTeam = [
  {
    name: "Soledad Hermenegildo Caudevilla",
    role: "Presidencia Comité y Tesorería Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Laura Amparo Monferrer Freire",
    role: "Secretaría comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Javier Santagueda Galindo",
    role: "Tesorería comité",
    photo: "/images/comite/javi.jpg",
  },
  {
    name: "Mercedes Botija Yagüe",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Jorge Marcu Cristea",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Silvia Martínez Vidal",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Sonia Andreu Arias",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Alberto García Briz",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Carmen Pellicer Sifres",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Eugenio Martin Redon",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Marta Carbonell Zaragoza",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Aranzazu Tormos Bernabeu",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Maria Azara Ballester",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Javier Maiques Ribelles",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Catherine Andrés Langa",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Eladio García Carrión",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Emilio Iranzo García",
    role: "Comité",
    photo: "/images/comite/emilio.jpg",
  },
  {
    name: "Maria Teresa Tomás García",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Enrique Perez Lobo",
    role: "Comité",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "María Gracia López Patiño",
    role: "Comité",
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

export default function ComiteContent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* MainNav ya incluye su propio <header> con sticky top-0 */}
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary py-16 md:py-24">
          <div className="container mx-auto px-4 text-center text-primary-foreground">
            <StaticText
              contentId={340}
              identificador="hero-title"
              seccion="comite"
              as="h1"
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6"
            >
              Comité de Grupo
            </StaticText>
            <StaticText
              contentId={341}
              identificador="hero-subtitle"
              seccion="comite"
              as="p"
              multiline
              className="mt-4 text-xl max-w-3xl mx-auto"
            >
              El equipo directivo que guía y coordina las actividades del Grupo Scout Osyris
            </StaticText>
          </div>
        </section>

        {/* What is Committee Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <StaticText
                contentId={342}
                identificador="what-title"
                seccion="comite"
                as="h2"
                className="text-2xl font-bold mb-6"
              >
                ¿Qué es el Comité de Grupo?
              </StaticText>
              <StaticText
                contentId={343}
                identificador="what-description"
                seccion="comite"
                as="p"
                multiline
                className="text-lg text-muted-foreground mb-8"
              >
                El Comité de Grupo es el órgano de gobierno del grupo scout, responsable de la gestión,
                planificación y coordinación de todas las actividades. Está compuesto por padres y madres
                voluntarios que dedican su tiempo para asegurar el buen funcionamiento del grupo.
              </StaticText>
            </div>
          </div>
        </section>

        {/* Committee Team Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <StaticText
              contentId={344}
              identificador="members-title"
              seccion="comite"
              as="h2"
              className="text-2xl font-bold text-center mb-8"
            >
              Miembros del Comité
            </StaticText>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {committeeTeam.map((member, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-64 relative">
                    <StaticImage
                      contentId={345 + i * 4}
                      identificador={`member-${i}-photo`}
                      seccion="comite"
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6 text-center">
                    <StaticText
                      contentId={346 + i * 4}
                      identificador={`member-${i}-name`}
                      seccion="comite"
                      as="h3"
                      className="text-xl font-bold mb-2"
                    >
                      {member.name}
                    </StaticText>
                    <StaticText
                      contentId={347 + i * 4}
                      identificador={`member-${i}-role`}
                      seccion="comite"
                      as="p"
                      className="text-primary"
                    >
                      {member.role}
                    </StaticText>
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
              <StaticText
                contentId={369}
                identificador="functions-title"
                seccion="comite"
                as="h2"
                className="text-2xl font-bold text-center mb-12"
              >
                Funciones del Comité
              </StaticText>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {committeeFunctions.map((func, i) => (
                  <Card key={i} className="p-6">
                    <div className="text-4xl mb-4 text-center">{func.icon}</div>
                    <StaticText
                      contentId={370 + i * 2}
                      identificador={`function-${i}-title`}
                      seccion="comite"
                      as="h3"
                      className="text-xl font-bold mb-3 text-center"
                    >
                      {func.title}
                    </StaticText>
                    <StaticText
                      contentId={371 + i * 2}
                      identificador={`function-${i}-description`}
                      seccion="comite"
                      as="p"
                      multiline
                      className="text-muted-foreground text-center"
                    >
                      {func.description}
                    </StaticText>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Meetings Section */}
        <section className="py-12 bg-white dark:bg-slate-800">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <StaticText
                contentId={382}
                identificador="meetings-title"
                seccion="comite"
                as="h2"
                className="text-2xl font-bold mb-6"
              >
                Reuniones y Participación
              </StaticText>
              <div className="space-y-6">
                <Card className="p-6">
                  <StaticText
                    contentId={383}
                    identificador="meetings-regular-title"
                    seccion="comite"
                    as="h3"
                    className="text-lg font-bold mb-3"
                  >
                    📅 Reuniones Regulares
                  </StaticText>
                  <StaticText
                    contentId={384}
                    identificador="meetings-regular-description"
                    seccion="comite"
                    as="p"
                    multiline
                    className="text-muted-foreground"
                  >
                    El Comité se reúne mensualmente para revisar la marcha del grupo, planificar actividades
                    y tomar decisiones importantes. Las reuniones son abiertas a todos los padres y madres.
                  </StaticText>
                </Card>
                <Card className="p-6">
                  <StaticText
                    contentId={385}
                    identificador="meetings-assembly-title"
                    seccion="comite"
                    as="h3"
                    className="text-lg font-bold mb-3"
                  >
                    🗳️ Asamblea General
                  </StaticText>
                  <StaticText
                    contentId={386}
                    identificador="meetings-assembly-description"
                    seccion="comite"
                    as="p"
                    multiline
                    className="text-muted-foreground"
                  >
                    Una vez al año se celebra la Asamblea General donde se presenta la memoria de actividades,
                    el balance económico y se eligen los nuevos miembros del Comité.
                  </StaticText>
                </Card>
                <Card className="p-6">
                  <StaticText
                    contentId={387}
                    identificador="meetings-participation-title"
                    seccion="comite"
                    as="h3"
                    className="text-lg font-bold mb-3"
                  >
                    🤝 Participación Familiar
                  </StaticText>
                  <StaticText
                    contentId={388}
                    identificador="meetings-participation-description"
                    seccion="comite"
                    as="p"
                    multiline
                    className="text-muted-foreground"
                  >
                    Todas las familias están invitadas a participar en las actividades del grupo y a colaborar
                    con el Comité en la organización de eventos especiales.
                  </StaticText>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="py-16 bg-gray-200 dark:bg-slate-900">
          <div className="container mx-auto px-4 text-center">
            <StaticText
              contentId={389}
              identificador="join-title"
              seccion="comite"
              as="h2"
              className="text-3xl font-bold mb-6"
            >
              ¿Quieres formar parte del Comité?
            </StaticText>
            <StaticText
              contentId={390}
              identificador="join-description"
              seccion="comite"
              as="p"
              multiline
              className="max-w-2xl mx-auto mb-8"
            >
              Si quieres contribuir activamente a la educación scout de tu hijo/a y tienes tiempo para dedicar
              al grupo, ¡te invitamos a participar en nuestro Comité!
            </StaticText>
            <Button asChild>
              <Link href="/contacto">Contacta con nosotros</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
