"use client"
import { unstable_noStore as noStore } from 'next/cache'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StaticText } from "@/components/ui/static-content"
import { SeamlessVideoLoop } from "@/components/ui/seamless-video-loop"
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
  Loader2,
  Send,
  UsersRound,
  HandHeart,
  Target,
  TreePine,
  TrendingUp,
  GraduationCap
} from "lucide-react"

export default function Home() {
  noStore()
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">
        {/* Hero Section - Improved with better visuals and call to action */}
        <section className="relative bg-black overflow-hidden py-20 sm:py-28 md:py-36 lg:py-48">
          {/* Video Background with seamless loop */}
          <SeamlessVideoLoop
            src="/videos/hero-background.mp4"
            opacity={0.6}
          />

          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary/30"></div>

          <div className="container relative z-10 mx-auto px-4 sm:px-6 text-center">
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-primary shadow-md dark:bg-white/10 dark:text-white">
              <span className="text-secondary">&#9884;</span>
              Educando en valores desde 1981
            </div>
            <StaticText
              content="Grupo Scout Osyris"
              tag="h1"
              className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white px-2"
            />
            <StaticText
              content="Formando jóvenes a través del método scout, promoviendo valores, aventura y servicio a la comunidad desde 1981."
              tag="p"
              className="mx-auto mt-4 sm:mt-6 max-w-3xl text-base sm:text-lg md:text-xl leading-relaxed text-white px-4"
            />
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4">
              <Button asChild size="lg" className="bg-secondary text-black hover:bg-secondary/90 w-full sm:w-auto">
                <Link href="/secciones">Descubre nuestras secciones</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
              >
                <Link href="/contacto">Contacta con nosotros</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Section - New section highlighting key aspects */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Compass className="h-8 w-8 text-primary" />
                </div>
                <StaticText
                  content="Aventura y Aprendizaje"
                  tag="h3"
                  className="mb-2 text-xl font-bold"
                />
                <StaticText
                  content="Actividades emocionantes que combinan diversión y desarrollo personal en un entorno seguro."
                  tag="p"
                  className="text-muted-foreground"
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <StaticText
                  content="Valores y Amistad"
                  tag="h3"
                  className="mb-2 text-xl font-bold"
                />
                <StaticText
                  content="Fomentamos valores como el respeto, la responsabilidad y la amistad a través del método scout."
                  tag="p"
                  className="text-muted-foreground"
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Tent className="h-8 w-8 text-primary" />
                </div>
                <StaticText
                  content="Naturaleza y Sostenibilidad"
                  tag="h3"
                  className="mb-2 text-xl font-bold"
                />
                <StaticText
                  content="Conectamos con la naturaleza y aprendemos a cuidar nuestro entorno a través de actividades al aire libre."
                  tag="p"
                  className="text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Trust indicators */}
        <section className="py-12 sm:py-16 bg-primary">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 md:gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-2 sm:mb-3">45</div>
                <p className="text-base sm:text-lg md:text-xl font-medium text-white">Años de experiencia</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-2 sm:mb-3">130+</div>
                <p className="text-base sm:text-lg md:text-xl font-medium text-white">Educandos activos</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-2 sm:mb-3">100%</div>
                <p className="text-base sm:text-lg md:text-xl font-medium text-white">Compromiso scout</p>
              </div>
            </div>
          </div>
        </section>

        {/* Secciones - Improved with better visuals and layout */}
        <section className="bg-section-pattern py-12 sm:py-16 scout-pattern">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-12 text-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-2xl text-primary">&#9650;</span>
              </div>
              <StaticText
                content="Nuestras Secciones"
                tag="h2"
                className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold"
              />
              <StaticText
                content="El escultismo se adapta a las diferentes etapas de desarrollo de ninos y jovenes, ofreciendo actividades y metodologias especificas para cada edad."
                tag="p"
                className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground px-4"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {sections.map((section, i) => (
                <Link href={section.href} key={i} className="group" >
                  <Card className={`h-full overflow-hidden transition-all duration-300 hover:shadow-lg group-hover:translate-y-[-5px] scout-card scout-card-${section.slug}`}>
                    <div className="relative h-40 overflow-hidden bg-white dark:bg-slate-900">
                      {/* Section color accent bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${section.accentColor}`}></div>
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        {section.logo && (
                          <Image
                            src={section.logo}
                            alt={`Logo ${section.title}`}
                            width={120}
                            height={120}
                            className="object-contain transition-transform group-hover:scale-105"
                          />
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-lg">{section.icon}</span>
                        <h3 className="text-xl font-bold">{section.title}</h3>
                      </div>
                      <p className="mb-2 text-sm font-medium text-muted-foreground">{section.ageRange}</p>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Valores - Enhanced with better visuals */}
        <section className="bg-primary py-12 sm:py-16 text-primary-foreground relative overflow-hidden">
          {/* Scout pattern background - Flor de lis */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5c-2 4-3 8-3 12 0-4-1-8-3-12-1 3-1 6 0 9-3-3-7-5-11-5 3 2 5 5 6 8-4-2-8-3-12-3 4 2 7 5 9 9-2-1-5-1-7 0 2 1 4 3 5 5l-4 1c2 1 3 3 4 5 0 2-1 4-2 6h4c1-2 2-4 4-5 1 2 2 4 2 6h4c0-2 1-4 2-6 2 1 3 3 4 5h4c-1-2-2-4-2-6 1-2 2-4 4-5l-4-1c1-2 3-4 5-5-2-1-5-1-7 0 2-4 5-7 9-9-4 0-8 1-12 3 1-3 3-6 6-8-4 0-8 2-11 5 1-3 1-6 0-9z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }} />
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="mb-8 sm:mb-12 text-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-2xl text-secondary">&#9884;</span>
              </div>
              <StaticText
                content="Nuestros Valores"
                tag="h2"
                className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold"
              />
              <StaticText
                content="El escultismo se basa en valores fundamentales que guian nuestras actividades y nuestra forma de entender la educacion."
                tag="p"
                className="mx-auto max-w-2xl text-sm sm:text-base text-primary-foreground/80 px-4"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {values.map((value, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-primary-foreground/10 p-6 text-center transition-colors hover:bg-primary-foreground/20"
                >
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary-foreground p-4 text-primary">
                    {value.icon}
                  </div>
                  <StaticText
                    content={value.title}
                    tag="h3"
                    className="mb-2 text-xl font-bold"
                  />
                  <StaticText
                    content={value.description}
                    tag="p"
                    className="text-primary-foreground/80"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Us Section - With image and form */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                {/* Left side - Image */}
                <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-xl order-2 lg:order-1">
                  <Image
                    src="/images/unete-a-nosotros.jpg"
                    alt="Grupo Scout Osyris - Unete a nosotros"
                    width={600}
                    height={500}
                    className="w-full h-full object-cover"
                    priority
                  />
                  {/* Scout badge overlay */}
                  <div className="absolute bottom-4 right-4 bg-primary/90 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                    <span>&#9884;</span> Siempre listos
                  </div>
                </div>

                {/* Right side - Title and Form */}
                <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
                  <div>
                    <div className="inline-flex items-center gap-2 text-primary mb-2">
                      <span className="text-xl">&#9650;</span>
                      <span className="text-sm font-medium">Forma parte de la aventura</span>
                    </div>
                    <StaticText
                      content="Unete al grupo"
                      tag="h2"
                      className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
                    />
                    <StaticText
                      content="Descubre una comunidad donde tus hijos crecerán rodeados de valores, naturaleza y amistad."
                      tag="p"
                      className="text-base sm:text-lg text-muted-foreground"
                    />
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Déjanos tus datos</CardTitle>
                      <CardDescription>
                        Actualmente tenemos lista de espera. Mándanos una solicitud y nos pondremos en contacto contigo lo antes posible.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="join-name">Tu nombre</Label>
                          <Input
                            id="join-name"
                            type="text"
                            placeholder="Ej: María García"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="join-email">Tu correo electrónico</Label>
                          <Input
                            id="join-email"
                            type="email"
                            placeholder="tu@email.com"
                          />
                        </div>
                      </form>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" size="lg">
                        <Send className="mr-2 h-4 w-4" />
                        Enviar
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios - Enhanced with better cards */}
        <section className="bg-gray-100 dark:bg-slate-900 py-12 sm:py-16 scout-pattern">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-12 text-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-2xl text-primary">&#10084;</span>
              </div>
              <StaticText
                content="Testimonios"
                tag="h2"
                className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold"
              />
              <StaticText
                content="Descubre lo que opinan las familias y antiguos miembros sobre su experiencia en el Grupo Scout Osyris."
                tag="p"
                className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground px-4"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="flex h-full flex-col bg-card scout-card">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-6 text-4xl text-primary">"</div>
                    <p className="italic">{testimonial.text}</p>
                    <div className="mt-auto flex items-center gap-4 pt-8">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${testimonial.bgColor}`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <span className="text-primary text-xs">&#9884;</span> {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
    slug: "castores",
    ageRange: "5-7 anos",
    description: "Colonia La Veleta",
    gradientClass: "bg-gradient-to-br from-orange-400 to-orange-600",
    accentColor: "bg-orange-500",
    icon: "🦫",
    logo: "/images/secciones/castores.png",
    href: "/secciones/castores",
  },
  {
    title: "Manada",
    slug: "manada",
    ageRange: "7-10 anos",
    description: "Manada Waingunga",
    gradientClass: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    accentColor: "bg-yellow-400",
    icon: "🐺",
    logo: "/images/secciones/manada.png",
    href: "/secciones/manada",
  },
  {
    title: "Tropa",
    slug: "tropa",
    ageRange: "10-13 anos",
    description: "Tropa Brownsea",
    gradientClass: "bg-gradient-to-br from-blue-400 to-blue-600",
    accentColor: "bg-blue-500",
    icon: "🏕️",
    logo: "/images/secciones/tropa.png",
    href: "/secciones/tropa",
  },
  {
    title: "Pioneros",
    slug: "pioneros",
    ageRange: "13-16 anos",
    description: "Posta Kanhiwara",
    gradientClass: "bg-gradient-to-br from-red-400 to-red-600",
    accentColor: "bg-red-600",
    icon: "🧭",
    logo: "/images/secciones/pioneros.png",
    href: "/secciones/pioneros",
  },
  {
    title: "Rutas",
    slug: "rutas",
    ageRange: "16-19 anos",
    description: "Ruta Walhalla",
    gradientClass: "bg-gradient-to-br from-green-500 to-green-700",
    accentColor: "bg-green-700",
    icon: "🌍",
    logo: "/images/secciones/rutas.png",
    href: "/secciones/rutas",
  },
]

// Valores data
const values = [
  {
    icon: <UsersRound className="h-12 w-12" />,
    title: "Comunidad",
    description:
      "Fomentamos el sentido de pertenencia y el trabajo en equipo, creando vínculos fuertes entre todos los miembros.",
  },
  {
    icon: <TreePine className="h-12 w-12" />,
    title: "Naturaleza",
    description: "Promovemos el respeto y cuidado del medio ambiente a través de actividades al aire libre.",
  },
  {
    icon: <Target className="h-12 w-12" />,
    title: "Compromiso",
    description: "Desarrollamos la responsabilidad personal y el compromiso con los demás y con la sociedad.",
  },
  {
    icon: <GraduationCap className="h-12 w-12" />,
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
    name: "Antonio Almela",
    role: "Antiguo Scouter",
    initials: "AA",
    bgColor: "bg-gradient-to-br from-blue-500 to-blue-700",
    text: "Un gran grupo scout con gente buena de verdad y valores que hacen que los niños y niñas crezcan y disfruten cada momento",
  },
  {
    name: "Juanjo",
    role: "Antiguo Scouter",
    initials: "J",
    bgColor: "bg-gradient-to-br from-green-500 to-green-700",
    text: "Magnífico grupo con gente variada en cuanto a edad y procedencia, valores y principios Scouts, excelente Proyecto Educativo y un Kraal implicado al máximo. Grupo 100% recomendable.",
  },
  {
    name: "Eva Bujanda",
    role: "Antigua Scouter",
    initials: "EB",
    bgColor: "bg-gradient-to-br from-purple-500 to-purple-700",
    text: "Un grupo con muchos años de experiencia educando en valores. Geniales sus monitores y sus niños!",
  },
]
