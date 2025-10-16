"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { StaticText, StaticImage, StaticList } from "@/components/ui/static-content"
import { useSectionContent } from "@/hooks/useSectionContent"
import Link from "next/link"
import { ArrowRight, Award, Calendar, FileText, Heart, MapPin, Users } from "lucide-react"

// Timeline events data
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

// Values data
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

// Sections data
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

export default function SobreNosotrosPage() {
  // Cargar contenido desde la API
  const { content, isLoading } = useSectionContent('sobre-nosotros')

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

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
            <StaticText
              contentId={200}
              identificador="hero-title"
              seccion="sobre-nosotros"
              as="h1"
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6"
            >
              Sobre Nosotros
            </StaticText>
            <StaticText
              contentId={201}
              identificador="hero-subtitle"
              seccion="sobre-nosotros"
              as="p"
              multiline
              className="mt-4 text-xl max-w-3xl mx-auto"
            >
              Conoce la historia, valores y personas que forman el Grupo Scout Osyris
            </StaticText>
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
                    <StaticText
                      contentId={202}
                      identificador="historia-title"
                      seccion="sobre-nosotros"
                      as="h2"
                      className="text-2xl font-bold mb-4"
                    >
                      Nuestra Historia
                    </StaticText>
                    <StaticText
                      contentId={203}
                      identificador="historia-parrafo-1"
                      seccion="sobre-nosotros"
                      as="p"
                      multiline
                      className="mb-4"
                    >
                      El Grupo Scout Osyris fue fundado el 23 de febrero de 1981, siendo su primera ronda la que
                      corresponde a los años 1980-1981. Desde entonces, hemos estado comprometidos con la educación en
                      valores de niños y jóvenes a través del método scout.
                    </StaticText>
                    <StaticText
                      contentId={204}
                      identificador="historia-parrafo-2"
                      seccion="sobre-nosotros"
                      as="p"
                      multiline
                      className="mb-4"
                    >
                      Estamos adscritos al Moviment Escolta de València (MEV) y tenemos nuestro domicilio en la
                      Fundación Patronato de la Juventud Obrera: Colegio Sagrada Familia (P.J.O.), en el Barrio de
                      Benimaclet.
                    </StaticText>
                    <StaticText
                      contentId={205}
                      identificador="historia-parrafo-3"
                      seccion="sobre-nosotros"
                      as="p"
                      multiline
                    >
                      A lo largo de más de 40 años de historia, hemos formado a cientos de niños, niñas y jóvenes,
                      contribuyendo a su desarrollo integral y a su compromiso con la sociedad.
                    </StaticText>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-md h-80 bg-muted rounded-lg overflow-hidden">
                      <StaticImage
                        contentId={206}
                        identificador="historia-imagen"
                        seccion="sobre-nosotros"
                        src="/placeholder.svg?height=400&width=600"
                        alt="Historia del Grupo Scout Osyris"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                        <StaticText
                          contentId={207}
                          identificador="historia-imagen-caption"
                          seccion="sobre-nosotros"
                          as="p"
                          className="text-sm"
                        >
                          Primeros años del Grupo Scout Osyris
                        </StaticText>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <StaticText
                    contentId={208}
                    identificador="timeline-title"
                    seccion="sobre-nosotros"
                    as="h3"
                    className="text-xl font-bold mb-4"
                  >
                    {getContent('timeline-title', 'Línea del Tiempo')}
                  </StaticText>
                  <StaticList<{year: string; description: string}>
                    contentId={209}
                    identificador="timeline-events"
                    seccion="sobre-nosotros"
                    fallback={timelineEvents}
                    emptyItem={{ year: '', description: '' }}
                    className="relative border-l-2 border-primary pl-8 space-y-8"
                    addButtonText="Añadir evento"
                    render={(event) => (
                      <div className="relative">
                        <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                        <h4 className="text-lg font-semibold">{event.year}</h4>
                        <p className="text-muted-foreground">{event.description}</p>
                      </div>
                    )}
                    itemEditor={(item, onChange) => (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Año</label>
                          <input
                            type="text"
                            value={item.year}
                            onChange={(e) => onChange({ ...item, year: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Descripción</label>
                          <textarea
                            value={item.description}
                            onChange={(e) => onChange({ ...item, description: e.target.value })}
                            rows={3}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                      </div>
                    )}
                  >
                    {JSON.stringify(getJson('timeline-events', timelineEvents))}
                  </StaticList>
                </div>
              </TabsContent>

              <TabsContent value="valores" className="space-y-6">
                <StaticText
                  contentId={208}
                  identificador="valores-title"
                  seccion="sobre-nosotros"
                  as="h2"
                  className="text-2xl font-bold text-center mb-8"
                >
                  Nuestros Valores
                </StaticText>
                <StaticList<{icon: string; title: string; description: string}>
                  contentId={210}
                  identificador="valores-list"
                  seccion="sobre-nosotros"
                  fallback={values.map(v => ({ icon: 'Users', title: v.title, description: v.description }))}
                  emptyItem={{ icon: 'Users', title: '', description: '' }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  addButtonText="Añadir valor"
                  render={(value) => {
                    const IconComponent = {
                      Users: <Users className="h-8 w-8" />,
                      Heart: <Heart className="h-8 w-8" />,
                      Award: <Award className="h-8 w-8" />,
                      MapPin: <MapPin className="h-8 w-8" />,
                      Calendar: <Calendar className="h-8 w-8" />,
                      FileText: <FileText className="h-8 w-8" />
                    }[value.icon as keyof typeof IconComponent] || <Users className="h-8 w-8" />

                    return (
                      <Card className="overflow-hidden">
                        <div className="h-2 bg-primary"></div>
                        <CardContent className="pt-6">
                          <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">{IconComponent}</div>
                          </div>
                          <h3 className="text-xl font-bold text-center mb-2">{value.title}</h3>
                          <p className="text-center text-muted-foreground">{value.description}</p>
                        </CardContent>
                      </Card>
                    )
                  }}
                  itemEditor={(item, onChange) => (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Ícono</label>
                        <select
                          value={item.icon}
                          onChange={(e) => onChange({ ...item, icon: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="Users">Users</option>
                          <option value="Heart">Heart</option>
                          <option value="Award">Award</option>
                          <option value="MapPin">MapPin</option>
                          <option value="Calendar">Calendar</option>
                          <option value="FileText">FileText</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Título</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => onChange({ ...item, title: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Descripción</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => onChange({ ...item, description: e.target.value })}
                          rows={3}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                    </div>
                  )}
                >
                  {JSON.stringify(getJson('valores-list', values.map(v => ({ icon: 'Users', title: v.title, description: v.description }))))}
                </StaticList>

                <div className="mt-12 bg-muted p-6 rounded-lg">
                  <StaticText
                    contentId={209}
                    identificador="mision-title"
                    seccion="sobre-nosotros"
                    as="h3"
                    className="text-xl font-bold mb-4"
                  >
                    Nuestra Misión
                  </StaticText>
                  <StaticText
                    contentId={210}
                    identificador="mision-parrafo-1"
                    seccion="sobre-nosotros"
                    as="p"
                    multiline
                    className="mb-4"
                  >
                    El Moviment Escolta de la Diòcesi de València – M.S.C. (M.E.V. M.SC.) tiene por fin contribuir a la
                    educación y desarrollo integral de la infancia y la juventud a través de la vivencia de los valores
                    del Escultismo, en conformidad con las enseñanzas y vida de la Iglesia Católica.
                  </StaticText>
                  <StaticText
                    contentId={211}
                    identificador="mision-parrafo-2"
                    seccion="sobre-nosotros"
                    as="p"
                    multiline
                  >
                    De esta manera, el Grupo Scout Osyris promueve la formación de personas que ejerzan la ciudadanía
                    responsable y comprometida con la sociedad, para que sean así agentes de cambio en la comunidad
                    local, nacional e internacional.
                  </StaticText>
                </div>
              </TabsContent>

              <TabsContent value="metodologia" className="space-y-6">
                <StaticText
                  contentId={212}
                  identificador="metodologia-title"
                  seccion="sobre-nosotros"
                  as="h2"
                  className="text-2xl font-bold text-center mb-8"
                >
                  Nuestra Metodología
                </StaticText>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <StaticText
                      contentId={213}
                      identificador="metodo-scout-title"
                      seccion="sobre-nosotros"
                      as="h3"
                      className="text-xl font-bold mb-4"
                    >
                      El Método Scout
                    </StaticText>
                    <StaticText
                      contentId={214}
                      identificador="metodo-scout-intro"
                      seccion="sobre-nosotros"
                      as="p"
                      multiline
                      className="mb-4"
                    >
                      El método scout es un sistema de autoeducación progresiva basado en:
                    </StaticText>
                    <StaticList<{text: string}>
                      contentId={216}
                      identificador="metodo-scout-items"
                      seccion="sobre-nosotros"
                      fallback={[
                        { text: 'La Promesa y la Ley Scout' },
                        { text: 'La educación por la acción' },
                        { text: 'El sistema de patrullas o equipos' },
                        { text: 'Programas progresivos y atractivos' },
                        { text: 'Contacto con la naturaleza' },
                        { text: 'Apoyo de adultos' }
                      ]}
                      emptyItem={{ text: '' }}
                      className="list-disc pl-5 space-y-2 mb-4"
                      addButtonText="Añadir punto"
                      render={(item) => <li>{item.text}</li>}
                      itemEditor={(item, onChange) => (
                        <div>
                          <label className="text-sm font-medium">Texto</label>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => onChange({ ...item, text: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                      )}
                    >
                      {JSON.stringify(getJson('metodo-scout-items', [
                        { text: 'La Promesa y la Ley Scout' },
                        { text: 'La educación por la acción' },
                        { text: 'El sistema de patrullas o equipos' },
                        { text: 'Programas progresivos y atractivos' },
                        { text: 'Contacto con la naturaleza' },
                        { text: 'Apoyo de adultos' }
                      ]))}
                    </StaticList>
                    <StaticText
                      contentId={215}
                      identificador="metodo-scout-conclusion"
                      seccion="sobre-nosotros"
                      as="p"
                      multiline
                    >
                      A través de este método, buscamos el desarrollo integral de niños y jóvenes, potenciando su
                      autonomía, responsabilidad, solidaridad y compromiso.
                    </StaticText>
                  </div>
                  <div>
                    <StaticText
                      contentId={216}
                      identificador="secciones-title"
                      seccion="sobre-nosotros"
                      as="h3"
                      className="text-xl font-bold mb-4"
                    >
                      Educación por Secciones
                    </StaticText>
                    <StaticText
                      contentId={217}
                      identificador="secciones-intro"
                      seccion="sobre-nosotros"
                      as="p"
                      multiline
                      className="mb-4"
                    >
                      Adaptamos nuestra metodología a las diferentes etapas de desarrollo, dividiendo a los educandos en
                      cinco secciones según su edad:
                    </StaticText>
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
            <StaticText
              contentId={218}
              identificador="cta-title"
              seccion="sobre-nosotros"
              as="h2"
              className="text-3xl font-bold mb-6"
            >
              ¿Quieres conocer a nuestro equipo?
            </StaticText>
            <StaticText
              contentId={219}
              identificador="cta-description"
              seccion="sobre-nosotros"
              as="p"
              multiline
              className="max-w-2xl mx-auto mb-8"
            >
              Descubre quiénes son las personas que hacen posible el Grupo Scout Osyris: nuestro Kraal de monitores y el
              Comité de Grupo.
            </StaticText>
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
  );
}
