"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { EditableText } from "@/components/editable/EditableText"
import { EditableImage } from "@/components/editable/EditableImage"
import { EditableList } from "@/components/editable/EditableList"
import { useSectionContent } from "@/hooks/useSectionContent"
import {
  CalendarDays,
  FileText,
  MapPin,
  Users,
  Tent,
  Award,
  ArrowRight,
  ChevronRight,
  Heart,
  Compass,
  Loader2
} from "lucide-react"

export default function Home() {
  // Cargar contenido desde la API
  const { content, isLoading } = useSectionContent('landing')

  // Función helper para obtener contenido con fallback
  const getContent = (key: string, fallback: string) => {
    return content[key]?.contenido || fallback
  }

  // Función helper para obtener contenido JSON con fallback
  const getJson = <T,>(key: string, fallback: T[]): T[] => {
    try {
      const jsonContent = content[key]?.contenido

      // Si ya es un array (JSON parseado por PostgreSQL), devolverlo directamente
      if (Array.isArray(jsonContent)) {
        return jsonContent as T[]
      }

      // Si es un string JSON, parsearlo
      if (jsonContent && typeof jsonContent === 'string') {
        const parsed = JSON.parse(jsonContent)
        return Array.isArray(parsed) ? parsed : fallback
      }

      return fallback
    } catch {
      return fallback
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">
        {/* Hero Section - Improved with better visuals and call to action */}
        <section className="relative bg-hero-pattern bg-cover bg-center py-32 md:py-48">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="mb-6 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-medium text-primary shadow-md dark:bg-white/10 dark:text-white">
              Educando en valores desde 1981
            </div>
            <EditableText
              contentId={100}
              identificador="hero-title"
              seccion="landing"
              as="h1"
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white"
            >
              {getContent('hero-title', 'Grupo Scout Osyris')}
            </EditableText>
            <EditableText
              contentId={101}
              identificador="hero-subtitle"
              seccion="landing"
              as="p"
              multiline
              className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-white"
            >
              {getContent('hero-subtitle', 'Formando jóvenes a través del método scout, promoviendo valores, aventura y servicio a la comunidad desde 1981.')}
            </EditableText>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-secondary text-black hover:bg-secondary/90">
                <Link href="/secciones">Descubre nuestras secciones</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/contacto">Contacta con nosotros</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Section - New section highlighting key aspects */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Compass className="h-8 w-8 text-primary" />
                </div>
                <EditableText
                  contentId={102}
                  identificador="feature-1-title"
                  seccion="landing"
                  as="h3"
                  className="mb-2 text-xl font-bold"
                >
                  Aventura y Aprendizaje
                </EditableText>
                <EditableText
                  contentId={103}
                  identificador="feature-1-description"
                  seccion="landing"
                  as="p"
                  multiline
                  className="text-muted-foreground"
                >
                  Actividades emocionantes que combinan diversión y desarrollo personal en un entorno seguro.
                </EditableText>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <EditableText
                  contentId={104}
                  identificador="feature-2-title"
                  seccion="landing"
                  as="h3"
                  className="mb-2 text-xl font-bold"
                >
                  Valores y Amistad
                </EditableText>
                <EditableText
                  contentId={105}
                  identificador="feature-2-description"
                  seccion="landing"
                  as="p"
                  multiline
                  className="text-muted-foreground"
                >
                  Fomentamos valores como el respeto, la responsabilidad y la amistad a través del método scout.
                </EditableText>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Tent className="h-8 w-8 text-primary" />
                </div>
                <EditableText
                  contentId={106}
                  identificador="feature-3-title"
                  seccion="landing"
                  as="h3"
                  className="mb-2 text-xl font-bold"
                >
                  Naturaleza y Sostenibilidad
                </EditableText>
                <EditableText
                  contentId={107}
                  identificador="feature-3-description"
                  seccion="landing"
                  as="p"
                  multiline
                  className="text-muted-foreground"
                >
                  Conectamos con la naturaleza y aprendemos a cuidar nuestro entorno a través de actividades al aire libre.
                </EditableText>
              </div>
            </div>
          </div>
        </section>

        {/* Secciones - Improved with better visuals and layout */}
        <section className="bg-section-pattern py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <EditableText
                contentId={120}
                identificador="sections-title"
                seccion="landing"
                as="h2"
                className="mb-4 text-3xl font-bold"
              >
                {getContent('sections-title', 'Nuestras Secciones')}
              </EditableText>
              <EditableText
                contentId={121}
                identificador="sections-subtitle"
                seccion="landing"
                as="p"
                multiline
                className="mx-auto max-w-2xl text-muted-foreground"
              >
                {getContent('sections-subtitle', 'El escultismo se adapta a las diferentes etapas de desarrollo de niños y jóvenes, ofreciendo actividades y metodologías específicas para cada edad.')}
              </EditableText>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
              {sections.map((section, i) => (
                <Link href={section.href} key={i} className="group" >
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg group-hover:translate-y-[-5px]">
                    <div className="relative h-40 overflow-hidden">
                      <div className={`absolute inset-0 ${section.gradientClass} opacity-90`}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">{section.icon}</span>
                      </div>
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="mb-2 text-xl font-bold">{section.title}</h3>
                      <p className="mb-2 text-sm font-medium text-muted-foreground">{section.ageRange}</p>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/secciones" className="group" >
                  Conoce todas nuestras secciones
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Próximas Actividades - Enhanced with better cards and visuals */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <EditableText
                contentId={122}
                identificador="activities-title"
                seccion="landing"
                as="h2"
                className="mb-4 text-3xl font-bold"
              >
                {getContent('activities-title', 'Próximas Actividades')}
              </EditableText>
              <EditableText
                contentId={123}
                identificador="activities-subtitle"
                seccion="landing"
                as="p"
                multiline
                className="mx-auto max-w-2xl text-muted-foreground"
              >
                {getContent('activities-subtitle', 'Descubre las actividades que tenemos programadas para las próximas semanas.')}
              </EditableText>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingActivities.map((activity, i) => (
                <Card key={i} className="h-full overflow-hidden transition-all hover:shadow-md">
                  <div className="relative h-48 bg-muted">
                    <div className="absolute left-0 top-0 z-10 flex h-16 w-16 flex-col items-center justify-center bg-primary text-primary-foreground">
                      <span className="text-xl font-bold">{activity.day}</span>
                      <span className="text-xs">{activity.month}</span>
                    </div>
                    <img
                      src={activity.image || "/placeholder.svg?height=200&width=400"}
                      alt={activity.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-xl font-bold">{activity.title}</h3>
                    <div className="mb-4 flex flex-wrap items-center gap-4 text-muted-foreground">
                      <div className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <span className="text-sm">{activity.date}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span className="text-sm">{activity.location}</span>
                      </div>
                    </div>
                    <p className="mb-4 text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${activity.sectionClass}`}>
                        {activity.section}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/actividades/${activity.id}`}>Ver detalles</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/calendario" className="group" >
                  Ver calendario completo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Valores - Enhanced with better visuals */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <EditableText
                contentId={109}
                identificador="valores-title"
                seccion="landing"
                as="h2"
                className="mb-4 text-3xl font-bold"
              >
                {getContent('valores-title', 'Nuestros Valores')}
              </EditableText>
              <EditableText
                contentId={110}
                identificador="valores-subtitle"
                seccion="landing"
                as="p"
                multiline
                className="mx-auto max-w-2xl text-primary-foreground/80"
              >
                {getContent('valores-subtitle', 'El escultismo se basa en valores fundamentales que guían nuestras actividades y nuestra forma de entender la educación.')}
              </EditableText>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-primary-foreground/10 p-6 text-center transition-colors hover:bg-primary-foreground/20"
                >
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary-foreground p-4 text-primary">
                    {value.icon}
                  </div>
                  <EditableText
                    contentId={111 + i * 2}
                    identificador={`valor-${i}-title`}
                    seccion="landing"
                    as="h3"
                    className="mb-2 text-xl font-bold"
                  >
                    {getContent(`valor-${i}-title`, value.title)}
                  </EditableText>
                  <EditableText
                    contentId={112 + i * 2}
                    identificador={`valor-${i}-description`}
                    seccion="landing"
                    as="p"
                    multiline
                    className="text-primary-foreground/80"
                  >
                    {getContent(`valor-${i}-description`, value.description)}
                  </EditableText>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="secondary">
                <Link href="/sobre-nosotros" className="group" >
                  Conoce más sobre nosotros
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Join Us Section - New call to action section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="rounded-xl bg-muted p-8 md:p-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <EditableText
                    contentId={124}
                    identificador="join-title"
                    seccion="landing"
                    as="h2"
                    className="mb-4 text-3xl font-bold"
                  >
                    {getContent('join-title', '¿Quieres formar parte de nuestra familia scout?')}
                  </EditableText>
                  <EditableText
                    contentId={125}
                    identificador="join-description"
                    seccion="landing"
                    as="p"
                    multiline
                    className="mb-6 text-muted-foreground"
                  >
                    {getContent('join-description', 'Si estás interesado en que tu hijo/a forme parte del Grupo Scout Osyris o quieres unirte como monitor, no dudes en contactar con nosotros. ¡Te esperamos con los brazos abiertos!')}
                  </EditableText>
                  <Button asChild size="lg">
                    <Link href="/contacto">Contacta con nosotros</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-center">
                  <EditableImage
                    contentId={108}
                    identificador="join-us-image"
                    seccion="landing"
                    alt="Grupo Scout Osyris"
                    className="rounded-lg"
                  >
                    {getContent('join-us-image', '/placeholder.svg?height=300&width=400')}
                  </EditableImage>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios - Enhanced with better cards */}
        <section className="bg-section-pattern py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <EditableText
                contentId={126}
                identificador="testimonials-title"
                seccion="landing"
                as="h2"
                className="mb-4 text-3xl font-bold"
              >
                {getContent('testimonials-title', 'Testimonios')}
              </EditableText>
              <EditableText
                contentId={127}
                identificador="testimonials-subtitle"
                seccion="landing"
                as="p"
                multiline
                className="mx-auto max-w-2xl text-muted-foreground"
              >
                {getContent('testimonials-subtitle', 'Descubre lo que opinan las familias y antiguos miembros sobre su experiencia en el Grupo Scout Osyris.')}
              </EditableText>
            </div>
            <EditableList<{name: string; role: string; avatar: string; text: string}>
              contentId={128}
              identificador="testimonials-list"
              seccion="landing"
              fallback={testimonials}
              emptyItem={{ name: '', role: '', avatar: '/placeholder.svg?height=100&width=100', text: '' }}
              className="grid grid-cols-1 gap-8 md:grid-cols-3"
              addButtonText="Añadir testimonio"
              render={(testimonial) => (
                <Card className="h-full bg-muted/50">
                  <CardContent className="p-6">
                    <div className="mb-6 text-4xl">"</div>
                    <p className="mb-6 italic">{testimonial.text}</p>
                    <div className="flex items-center">
                      <div className="mr-4 h-12 w-12 overflow-hidden rounded-full">
                        <img
                          src={testimonial.avatar || "/placeholder.svg?height=100&width=100"}
                          alt={testimonial.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              itemEditor={(item, onChange, onDelete) => (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Nombre</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onChange({ ...item, name: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rol</label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => onChange({ ...item, role: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Avatar URL</label>
                    <input
                      type="text"
                      value={item.avatar}
                      onChange={(e) => onChange({ ...item, avatar: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Testimonio</label>
                    <textarea
                      value={item.text}
                      onChange={(e) => onChange({ ...item, text: e.target.value })}
                      rows={4}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              )}
            >
              {JSON.stringify(getJson('testimonials-list', testimonials))}
            </EditableList>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

// Secciones data
const sections = [
  {
    title: "Castores",
    ageRange: "5-7 años",
    description: "Colonia La Veleta",
    gradientClass: "bg-gradient-to-br from-orange-400 to-orange-600",
    icon: "🦫",
    href: "/secciones/castores",
  },
  {
    title: "Manada",
    ageRange: "7-10 años",
    description: "Manada Waingunga",
    gradientClass: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    icon: "🐺",
    href: "/secciones/manada",
  },
  {
    title: "Tropa",
    ageRange: "10-13 años",
    description: "Tropa Brownsea",
    gradientClass: "bg-gradient-to-br from-blue-400 to-blue-600",
    icon: "🏕️",
    href: "/secciones/tropa",
  },
  {
    title: "Pioneros",
    ageRange: "13-16 años",
    description: "Posta Kanhiwara",
    gradientClass: "bg-gradient-to-br from-red-400 to-red-600",
    icon: "🧭",
    href: "/secciones/pioneros",
  },
  {
    title: "Rutas",
    ageRange: "16-19 años",
    description: "Ruta Walhalla",
    gradientClass: "bg-gradient-to-br from-green-500 to-green-700",
    icon: "🌍",
    href: "/secciones/rutas",
  },
]

// Valores data
const values = [
  {
    icon: <Users className="h-12 w-12" />,
    title: "Comunidad",
    description:
      "Fomentamos el sentido de pertenencia y el trabajo en equipo, creando vínculos fuertes entre todos los miembros.",
  },
  {
    icon: <Tent className="h-12 w-12" />,
    title: "Naturaleza",
    description: "Promovemos el respeto y cuidado del medio ambiente a través de actividades al aire libre.",
  },
  {
    icon: <Award className="h-12 w-12" />,
    title: "Compromiso",
    description: "Desarrollamos la responsabilidad personal y el compromiso con los demás y con la sociedad.",
  },
  {
    icon: <FileText className="h-12 w-12" />,
    title: "Educación",
    description: "Trabajamos por el desarrollo integral de niños y jóvenes a través del método scout.",
  },
]

// Mock data
const upcomingActivities = [
  {
    id: "1",
    title: "Reunión Semanal",
    day: "15",
    month: "Jun",
    date: "15 de Junio, 2025",
    location: "Local Scout",
    description: "Actividades regulares de cada sección con juegos y dinámicas.",
    section: "Todas las secciones",
    sectionClass: "bg-primary/20 text-primary",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "2",
    title: "Salida Sierra Norte",
    day: "22",
    month: "Jun",
    date: "22-23 de Junio, 2025",
    location: "Sierra Norte",
    description: "Acampada de fin de semana con actividades de orientación y supervivencia.",
    section: "Tropa",
    sectionClass: "badge-tropa",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "3",
    title: "Campamento de Verano",
    day: "15",
    month: "Jul",
    date: "15-30 de Julio, 2025",
    location: "Pirineos",
    description: "Campamento anual de verano con actividades de montaña, talleres y juegos.",
    section: "Todas las secciones",
    sectionClass: "bg-primary/20 text-primary",
    image: "/placeholder.svg?height=200&width=400",
  },
]

const testimonials = [
  {
    name: "María García",
    role: "Madre de Lobato",
    avatar: "/placeholder.svg?height=100&width=100",
    text: "El grupo scout ha sido una experiencia transformadora para mi hijo. Ha ganado confianza, independencia y ha hecho amigos para toda la vida.",
  },
  {
    name: "Carlos Rodríguez",
    role: "Antiguo Ruta",
    avatar: "/placeholder.svg?height=100&width=100",
    text: "Mis años en el Grupo Scout Osyris marcaron mi vida. Los valores que aprendí me han acompañado siempre y me han ayudado a ser quien soy hoy.",
  },
  {
    name: "Ana Martínez",
    role: "Scouter de Pioneros",
    avatar: "/placeholder.svg?height=100&width=100",
    text: "Ver crecer a los chicos y chicas, superar retos y convertirse en personas comprometidas es la mayor recompensa de ser monitor scout.",
  },
]

