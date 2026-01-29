"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StaticText } from "@/components/ui/static-content"
import { SeamlessVideoLoop } from "@/components/ui/seamless-video-loop"
import { ScoutDivider, ScoutPatchCard, CanvasBackground, ScoutSectionCard } from "@/components/scout-identity"
import {
  Tent,
  Heart,
  Compass,
  Send,
  UsersRound,
  Target,
  TreePine,
  GraduationCap
} from "lucide-react"

export default function HomePageContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative bg-black overflow-hidden py-20 sm:py-28 md:py-36 lg:py-48"
          style={{ backgroundImage: 'url(/images/hero-poster.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <SeamlessVideoLoop
            src="/videos/hero-background.mp4"
            poster="/images/hero-poster.webp"
            opacity={0.6}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary/30"></div>

          <div className="container relative z-10 mx-auto px-4 sm:px-6 text-center">
            <div className="mb-4 sm:mb-6 inline-flex items-center rounded-full bg-white px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-primary shadow-md">
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

        {/* Separador con tres puntos */}
        <ScoutDivider variant="dots" className="bg-white" />

        {/* Featured Section - Tarjetas con efecto parche scout */}
        <CanvasBackground pattern="grid" className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="sr-only">Nuestro compromiso scout</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Tarjeta 1 - Aventura */}
              <ScoutPatchCard variant="default" showStitches={true}>
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4 border-2 border-[#C9A66B]/30">
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
                </div>
              </ScoutPatchCard>

              {/* Tarjeta 2 - Valores */}
              <ScoutPatchCard variant="default" showStitches={true}>
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4 border-2 border-[#C9A66B]/30">
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
                </div>
              </ScoutPatchCard>

              {/* Tarjeta 3 - Naturaleza */}
              <ScoutPatchCard variant="default" showStitches={true} className="sm:col-span-2 lg:col-span-1">
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4 border-2 border-[#C9A66B]/30">
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
              </ScoutPatchCard>
            </div>
          </div>
        </CanvasBackground>

        {/* Separador con rombo */}
        <ScoutDivider variant="diamond" className="bg-primary" />

        {/* Stats Section */}
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

        {/* Separador con cruz */}
        <ScoutDivider variant="cross" />

        {/* Secciones */}
        <CanvasBackground pattern="grid" className="py-12 sm:py-16">
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
                <Link href={section.href} key={i} className="group">
                  <ScoutSectionCard sectionColor={section.hexColor} className="h-full">
                    <div className="relative h-36 overflow-hidden flex items-center justify-center p-4">
                      {section.logo && (
                        <Image
                          src={section.logo}
                          alt={`Logo ${section.title}`}
                          width={100}
                          height={100}
                          className="object-contain transition-transform group-hover:scale-110"
                        />
                      )}
                    </div>
                    <div className="p-4 pt-2 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-base">{section.icon}</span>
                        <h3 className="text-lg font-bold">{section.title}</h3>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">{section.ageRange}</p>
                      <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                    </div>
                  </ScoutSectionCard>
                </Link>
              ))}
            </div>
          </div>
        </CanvasBackground>

        {/* Separador doble */}
        <ScoutDivider variant="double" className="bg-primary" />

        {/* Valores */}
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
                <ScoutPatchCard
                  key={i}
                  borderColor="#C9A66B"
                  variant="default"
                  showStitches={true}
                  className="bg-white shadow-lg"
                >
                  <div className="p-6 text-center">
                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-4 text-primary border-2 border-[#C9A66B]/40">
                      {value.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-primary">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  </div>
                </ScoutPatchCard>
              ))}
            </div>
          </div>
        </section>

        {/* Separador con tres puntos */}
        <ScoutDivider variant="dots" />

        {/* Join Us Section */}
        <CanvasBackground pattern="diagonal" className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                {/* Image */}
                <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-xl order-2 lg:order-1">
                  <Image
                    src="/images/unete-a-nosotros.jpg"
                    alt="Grupo Scout Osyris - Únete a nosotros"
                    width={600}
                    height={500}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                {/* Form */}
                <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
                  <div>
                    <div className="text-primary mb-2">
                      <span className="text-sm font-medium">Forma parte de la aventura</span>
                    </div>
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

                  <ScoutPatchCard variant="strong" showStitches={true} hover={false}>
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold mb-1">Déjanos tus datos</h3>
                        <p className="text-sm text-muted-foreground">
                          Actualmente tenemos lista de espera. Mándanos una solicitud y nos pondremos en contacto contigo lo antes posible.
                        </p>
                      </div>
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="join-name">Tu nombre</Label>
                          <Input
                            id="join-name"
                            type="text"
                            placeholder="Ej: María García"
                            className="border-[#C9A66B]/30 focus:border-[#C9A66B]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="join-email">Tu correo electrónico</Label>
                          <Input
                            id="join-email"
                            type="email"
                            placeholder="tu@email.com"
                            className="border-[#C9A66B]/30 focus:border-[#C9A66B]"
                          />
                        </div>
                        <Button className="w-full" size="lg">
                          <Send className="mr-2 h-4 w-4" />
                          Enviar
                        </Button>
                      </form>
                    </div>
                  </ScoutPatchCard>
                </div>
              </div>
            </div>
          </div>
        </CanvasBackground>

        {/* Separador elegante con fondo crema */}
        <div className="bg-[#f5f2ed]">
          <ScoutDivider variant="diamond" />
        </div>

        {/* Testimonios */}
        <section className="py-12 sm:py-16 bg-[#f5f2ed]">
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
                <ScoutPatchCard key={index} variant="subtle" showStitches={true} className="h-full">
                  <div className="flex h-full flex-col p-6">
                    <div className="mb-4 text-5xl text-[#C9A66B] font-serif leading-none">&ldquo;</div>
                    <p className="italic text-muted-foreground flex-grow">{testimonial.text}</p>
                    <div className="flex items-center gap-4 pt-6 mt-auto border-t border-[#C9A66B]/20">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${testimonial.bgColor}`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </ScoutPatchCard>
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
    ageRange: "5-7 años",
    description: "Colonia La Veleta",
    accentColor: "bg-orange-500",
    hexColor: "#f97316",
    icon: "🦫",
    logo: "/images/secciones/castores.png",
    href: "/secciones/castores",
  },
  {
    title: "Manada",
    slug: "manada",
    ageRange: "7-10 años",
    description: "Manada Waingunga",
    accentColor: "bg-yellow-400",
    hexColor: "#facc15",
    icon: "🐺",
    logo: "/images/secciones/manada.png",
    href: "/secciones/manada",
  },
  {
    title: "Tropa",
    slug: "tropa",
    ageRange: "10-13 años",
    description: "Tropa Brownsea",
    accentColor: "bg-blue-500",
    hexColor: "#3b82f6",
    icon: "🏕️",
    logo: "/images/secciones/tropa.png",
    href: "/secciones/tropa",
  },
  {
    title: "Pioneros",
    slug: "pioneros",
    ageRange: "13-16 años",
    description: "Posta Kanhiwara",
    accentColor: "bg-red-600",
    hexColor: "#dc2626",
    icon: "🧭",
    logo: "/images/secciones/pioneros.png",
    href: "/secciones/pioneros",
  },
  {
    title: "Rutas",
    slug: "rutas",
    ageRange: "16-19 años",
    description: "Ruta Walhalla",
    accentColor: "bg-green-700",
    hexColor: "#15803d",
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
    description: "Fomentamos el sentido de pertenencia y el trabajo en equipo, creando vínculos fuertes entre todos los miembros.",
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
