"use client"
import { unstable_noStore as noStore } from 'next/cache'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StaticText, StaticImage, StaticList } from "@/components/ui/static-content"
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
        <section className="relative bg-hero-pattern bg-cover bg-center py-20 sm:py-28 md:py-36 lg:py-48">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
          <div className="container relative z-10 mx-auto px-4 sm:px-6 text-center">
            <div className="mb-4 sm:mb-6 inline-block rounded-full bg-white px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-primary shadow-md dark:bg-white/10 dark:text-white">
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
        <section className="bg-section-pattern py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-12 text-center">
              <StaticText
                content="Nuestras Secciones"
                tag="h2"
                className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold"
              />
              <StaticText
                content="El escultismo se adapta a las diferentes etapas de desarrollo de niños y jóvenes, ofreciendo actividades y metodologías específicas para cada edad."
                tag="p"
                className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground px-4"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
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
          </div>
        </section>

        {/* Valores - Enhanced with better visuals */}
        <section className="bg-primary py-12 sm:py-16 text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-12 text-center">
              <StaticText
                content="Nuestros Valores"
                tag="h2"
                className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold"
              />
              <StaticText
                content="El escultismo se basa en valores fundamentales que guían nuestras actividades y nuestra forma de entender la educación."
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
                  <StaticImage
                    src="/placeholder.svg?height=500&width=600"
                    alt="Grupo Scout Osyris - Aventura"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right side - Title and Form */}
                <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
                  <div>
                    
                    <StaticText
                      content="Únete al grupo"
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
        <section className="bg-gray-100 dark:bg-slate-900 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-12 text-center">
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
                <Card key={index} className="flex h-full flex-col bg-white">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-6 text-4xl">"</div>
                    <p className="italic">{testimonial.text}</p>
                    <div className="mt-auto flex items-center gap-4 pt-8">
                      <div className="h-12 w-12 overflow-hidden rounded-full">
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
    avatar: "/placeholder.svg?height=100&width=100",
    text: "Un gran grupo scout con gente buena de verdad y valores que hacen que los niños y niñas crezcan y disfruten cada momento",
  },
  {
    name: "Juanjo",
    role: "Antiguo Scouter",
    avatar: "/placeholder.svg?height=100&width=100",
    text: "Magnífico grupo con gente variada en cuanto a edad y procedencia, valores y principios Scouts, excelente Proyecto Educativo y un Kraal implicado al máximo. Grupo 100% recomendable.",
  },
  {
    name: "Eva Bujanda",
    role: "Antigua Scouter",
    avatar: "/placeholder.svg?height=100&width=100",
    text: "Un grupo con muchos años de experiencia educando en valores. Geniales sus monitores y sus niños!",
  },
]
