"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditableText } from "@/components/editable/EditableText"
import { EditableImage } from "@/components/editable/EditableImage"
import Link from "next/link"
import { Mail } from "lucide-react"

// Mock data - En fase futura se cargará dinámicamente de BD
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

export default function ComitePage() {
  return (
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
            <EditableText
              contentId={340}
              identificador="hero-title"
              seccion="comite"
              as="h1"
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6"
            >
              Comité de Grupo
            </EditableText>
            <EditableText
              contentId={341}
              identificador="hero-subtitle"
              seccion="comite"
              as="p"
              multiline
              className="mt-4 text-xl max-w-3xl mx-auto"
            >
              El equipo directivo que guía y coordina las actividades del Grupo Scout Osyris
            </EditableText>
          </div>
        </section>

        {/* What is Committee Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <EditableText
                contentId={342}
                identificador="what-title"
                seccion="comite"
                as="h2"
                className="text-2xl font-bold mb-6"
              >
                ¿Qué es el Comité de Grupo?
              </EditableText>
              <EditableText
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
              </EditableText>
            </div>
          </div>
        </section>

        {/* Committee Team Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <EditableText
              contentId={344}
              identificador="members-title"
              seccion="comite"
              as="h2"
              className="text-2xl font-bold text-center mb-8"
            >
              Miembros del Comité
            </EditableText>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {committeeTeam.map((member, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-64 relative">
                    <EditableImage
                      contentId={345 + i * 4}
                      identificador={`member-${i}-photo`}
                      seccion="comite"
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6 text-center">
                    <EditableText
                      contentId={346 + i * 4}
                      identificador={`member-${i}-name`}
                      seccion="comite"
                      as="h3"
                      className="text-xl font-bold mb-1"
                    >
                      {member.name}
                    </EditableText>
                    <EditableText
                      contentId={347 + i * 4}
                      identificador={`member-${i}-role`}
                      seccion="comite"
                      as="p"
                      className="text-primary mb-2"
                    >
                      {member.role}
                    </EditableText>
                    <EditableText
                      contentId={348 + i * 4}
                      identificador={`member-${i}-description`}
                      seccion="comite"
                      as="p"
                      multiline
                      className="text-sm text-muted-foreground mb-4"
                    >
                      {member.description}
                    </EditableText>
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
              <EditableText
                contentId={369}
                identificador="functions-title"
                seccion="comite"
                as="h2"
                className="text-2xl font-bold text-center mb-12"
              >
                Funciones del Comité
              </EditableText>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {committeeFunctions.map((func, i) => (
                  <Card key={i} className="p-6">
                    <div className="text-4xl mb-4 text-center">{func.icon}</div>
                    <EditableText
                      contentId={370 + i * 2}
                      identificador={`function-${i}-title`}
                      seccion="comite"
                      as="h3"
                      className="text-xl font-bold mb-3 text-center"
                    >
                      {func.title}
                    </EditableText>
                    <EditableText
                      contentId={371 + i * 2}
                      identificador={`function-${i}-description`}
                      seccion="comite"
                      as="p"
                      multiline
                      className="text-muted-foreground text-center"
                    >
                      {func.description}
                    </EditableText>
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
              <EditableText
                contentId={382}
                identificador="meetings-title"
                seccion="comite"
                as="h2"
                className="text-2xl font-bold mb-6"
              >
                Reuniones y Participación
              </EditableText>
              <div className="space-y-6">
                <Card className="p-6">
                  <EditableText
                    contentId={383}
                    identificador="meetings-regular-title"
                    seccion="comite"
                    as="h3"
                    className="text-lg font-bold mb-3"
                  >
                    📅 Reuniones Regulares
                  </EditableText>
                  <EditableText
                    contentId={384}
                    identificador="meetings-regular-description"
                    seccion="comite"
                    as="p"
                    multiline
                    className="text-muted-foreground"
                  >
                    El Comité se reúne mensualmente para revisar la marcha del grupo, planificar actividades
                    y tomar decisiones importantes. Las reuniones son abiertas a todos los padres y madres.
                  </EditableText>
                </Card>
                <Card className="p-6">
                  <EditableText
                    contentId={385}
                    identificador="meetings-assembly-title"
                    seccion="comite"
                    as="h3"
                    className="text-lg font-bold mb-3"
                  >
                    🗳️ Asamblea General
                  </EditableText>
                  <EditableText
                    contentId={386}
                    identificador="meetings-assembly-description"
                    seccion="comite"
                    as="p"
                    multiline
                    className="text-muted-foreground"
                  >
                    Una vez al año se celebra la Asamblea General donde se presenta la memoria de actividades,
                    el balance económico y se eligen los nuevos miembros del Comité.
                  </EditableText>
                </Card>
                <Card className="p-6">
                  <EditableText
                    contentId={387}
                    identificador="meetings-participation-title"
                    seccion="comite"
                    as="h3"
                    className="text-lg font-bold mb-3"
                  >
                    🤝 Participación Familiar
                  </EditableText>
                  <EditableText
                    contentId={388}
                    identificador="meetings-participation-description"
                    seccion="comite"
                    as="p"
                    multiline
                    className="text-muted-foreground"
                  >
                    Todas las familias están invitadas a participar en las actividades del grupo y a colaborar
                    con el Comité en la organización de eventos especiales.
                  </EditableText>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <EditableText
              contentId={389}
              identificador="join-title"
              seccion="comite"
              as="h2"
              className="text-3xl font-bold mb-6"
            >
              ¿Quieres formar parte del Comité?
            </EditableText>
            <EditableText
              contentId={390}
              identificador="join-description"
              seccion="comite"
              as="p"
              multiline
              className="max-w-2xl mx-auto mb-8"
            >
              Si quieres contribuir activamente a la educación scout de tu hijo/a y tienes tiempo para dedicar
              al grupo, ¡te invitamos a participar en nuestro Comité!
            </EditableText>
            <Button asChild variant="secondary">
              <Link href="/contacto">Contacta con nosotros</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
