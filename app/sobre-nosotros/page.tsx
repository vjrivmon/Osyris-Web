import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Award, Calendar, FileText, Heart, MapPin, Users } from "lucide-react"

export default function SobreNosotrosPage() {
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
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">Sobre Nosotros</h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">
              Conoce la historia, valores y personas que forman el Grupo Scout Osyris
            </p>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="historia" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-2xl grid-cols-3">
                  <TabsTrigger value="historia">Historia</TabsTrigger>
                  <TabsTrigger value="valores">Valores</TabsTrigger>
                  <TabsTrigger value="metodologia">Metodología</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="historia" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Nuestra Historia</h2>
                    <p className="mb-4">
                      El Grupo Scout Osyris fue fundado el 23 de febrero de 1981, siendo su primera ronda la que
                      corresponde a los años 1980-1981. Desde entonces, hemos estado comprometidos con la educación en
                      valores de niños y jóvenes a través del método scout.
                    </p>
                    <p className="mb-4">
                      Estamos adscritos al Moviment Escolta de València (MEV) y tenemos nuestro domicilio en la
                      Fundación Patronato de la Juventud Obrera: Colegio Sagrada Familia (P.J.O.), en el Barrio de
                      Benimaclet.
                    </p>
                    <p>
                      A lo largo de más de 40 años de historia, hemos formado a cientos de niños, niñas y jóvenes,
                      contribuyendo a su desarrollo integral y a su compromiso con la sociedad.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-md h-80 bg-muted rounded-lg overflow-hidden">
                      <img
                        src="/placeholder.svg?height=400&width=600"
                        alt="Historia del Grupo Scout Osyris"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                        <p className="text-sm">Primeros años del Grupo Scout Osyris</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Línea del Tiempo</h3>
                  <div className="relative border-l-2 border-primary pl-8 space-y-8">
                    {timelineEvents.map((event, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                        <h4 className="text-lg font-semibold">{event.year}</h4>
                        <p className="text-muted-foreground">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="valores" className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-8">Nuestros Valores</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {values.map((value, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="h-2 bg-primary"></div>
                      <CardContent className="pt-6">
                        <div className="flex justify-center mb-4">
                          <div className="p-3 rounded-full bg-primary/10 text-primary">{value.icon}</div>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">{value.title}</h3>
                        <p className="text-center text-muted-foreground">{value.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-12 bg-muted p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Nuestra Misión</h3>
                  <p className="mb-4">
                    El Moviment Escolta de la Diòcesi de València – M.S.C. (M.E.V. M.SC.) tiene por fin contribuir a la
                    educación y desarrollo integral de la infancia y la juventud a través de la vivencia de los valores
                    del Escultismo, en conformidad con las enseñanzas y vida de la Iglesia Católica.
                  </p>
                  <p>
                    De esta manera, el Grupo Scout Osyris promueve la formación de personas que ejerzan la ciudadanía
                    responsable y comprometida con la sociedad, para que sean así agentes de cambio en la comunidad
                    local, nacional e internacional.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="metodologia" className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-8">Nuestra Metodología</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">El Método Scout</h3>
                    <p className="mb-4">El método scout es un sistema de autoeducación progresiva basado en:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>La Promesa y la Ley Scout</li>
                      <li>La educación por la acción</li>
                      <li>El sistema de patrullas o equipos</li>
                      <li>Programas progresivos y atractivos</li>
                      <li>Contacto con la naturaleza</li>
                      <li>Apoyo de adultos</li>
                    </ul>
                    <p>
                      A través de este método, buscamos el desarrollo integral de niños y jóvenes, potenciando su
                      autonomía, responsabilidad, solidaridad y compromiso.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Educación por Secciones</h3>
                    <p className="mb-4">
                      Adaptamos nuestra metodología a las diferentes etapas de desarrollo, dividiendo a los educandos en
                      cinco secciones según su edad:
                    </p>
                    <div className="space-y-3">
                      {sections.map((section, i) => (
                        <div key={i} className={`p-3 rounded-lg ${section.bgClass} flex items-center`}>
                          <div className="font-bold w-24">{section.name}</div>
                          <div className="text-sm">{section.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button asChild>
                    <Link href="/secciones">
                      Conoce más sobre nuestras secciones
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">¿Quieres conocer a nuestro equipo?</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Descubre quiénes son las personas que hacen posible el Grupo Scout Osyris: nuestro Kraal de monitores y el
              Comité de Grupo.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="secondary">
                <Link href="/sobre-nosotros/kraal">Conoce a nuestro Kraal</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/sobre-nosotros/comite">Conoce a nuestro Comité</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

// Mock data
const timelineEvents = [
  { year: "1981", description: "Fundación del Grupo Scout Osyris, con su primera ronda solar 1980-1981." },
  { year: "1990", description: "Celebración del 10º aniversario con un gran campamento en los Pirineos." },
  { year: "2000", description: "Ampliación de las secciones y consolidación del grupo en el barrio de Benimaclet." },
  { year: "2006", description: "Renovación del proyecto educativo y metodología del grupo." },
  {
    year: "2016",
    description: "Celebración del 35º aniversario con una gran fiesta y encuentro de antiguos miembros.",
  },
  { year: "2021", description: "40º aniversario del grupo, adaptándonos a los nuevos tiempos y retos." },
  { year: "Actualidad", description: "Seguimos creciendo y formando a niños, niñas y jóvenes en valores scouts." },
]

const values = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "Comunidad",
    description:
      "Fomentamos el sentido de pertenencia y el trabajo en equipo, creando vínculos fuertes entre todos los miembros.",
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Servicio",
    description:
      "Promovemos la actitud de ayuda desinteresada hacia los demás y el compromiso con la mejora de la sociedad.",
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Compromiso",
    description: "Desarrollamos la responsabilidad personal y el compromiso con los demás y con la sociedad.",
  },
  {
    icon: <MapPin className="h-8 w-8" />,
    title: "Naturaleza",
    description: "Fomentamos el respeto y cuidado del medio ambiente a través de actividades al aire libre.",
  },
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "Progresión Personal",
    description:
      "Acompañamos el desarrollo individual de cada persona, respetando sus ritmos y potenciando sus capacidades.",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "Educación",
    description: "Trabajamos por el desarrollo integral de niños y jóvenes a través del método scout.",
  },
]

const sections = [
  {
    name: "Castores",
    description: "5-7 años. Colonia La Veleta. Lema: 'Compartir'",
    bgClass: "bg-orange-100 text-orange-800",
  },
  {
    name: "Lobatos",
    description: "7-10 años. Manada Waingunga. Lema: 'Haremos lo mejor'",
    bgClass: "bg-yellow-100 text-yellow-800",
  },
  {
    name: "Tropa",
    description: "10-13 años. Tropa Brownsea. Lema: 'Listos'",
    bgClass: "bg-blue-100 text-blue-800",
  },
  {
    name: "Pioneros",
    description: "13-16 años. Posta Kanhiwara. Lema: 'Descubrir'",
    bgClass: "bg-red-100 text-red-800",
  },
  {
    name: "Rutas",
    description: "16-19 años. Ruta Walhalla. Lema: 'Servir'",
    bgClass: "bg-green-100 text-green-800",
  },
]

