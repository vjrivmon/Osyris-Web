import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Users, Award, Heart, Compass } from "lucide-react"
import { Instagram, Youtube } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function SobreNosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="relative rounded-lg overflow-hidden mb-16">
            <div className="absolute inset-0">
              <Image
                src="/placeholder.svg?height=500&width=1200"
                alt="Grupo Scout Osyris"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-osyris-navy/90 to-osyris-navy/70"></div>
            </div>
            <div className="relative z-10 py-20 px-6 md:px-12 max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Sobre Nosotros</h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Somos el Grupo Scout Osyris, una comunidad dedicada a la formación de jóvenes a través del método scout,
                promoviendo valores, aventura y servicio a la comunidad.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-osyris-red hover:bg-osyris-red/90">
                  <Link href="/contacto">Contacta con nosotros</Link>
                </Button>
                <Button asChild variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <Link href="/calendario">Ver actividades</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Información principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-3xl font-bold mb-6">Nuestra Historia</h2>
              <p className="text-lg text-muted-foreground">
                El Grupo Scout Osyris fue fundado en 1985 con la misión de ofrecer a los jóvenes de Benimaclet una
                alternativa educativa basada en los valores del escultismo. Desde entonces, hemos crecido hasta
                convertirnos en una referencia en la educación no formal en Valencia.
              </p>
              <p className="text-lg text-muted-foreground">
                A lo largo de nuestra historia, hemos formado a cientos de jóvenes, organizando campamentos, actividades
                y proyectos comunitarios que han dejado huella tanto en nuestros miembros como en la sociedad.
              </p>
              <p className="text-lg text-muted-foreground">
                Nuestro grupo pertenece a la Federación de Escultismo Valenciano y seguimos el método scout, adaptándolo
                a las necesidades actuales de los jóvenes y manteniendo viva la esencia del escultismo.
              </p>

              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-4">Nuestros Valores</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <Card className="border border-border/50 transition-all hover:border-border hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary/10 text-primary">
                        <Users className="h-6 w-6" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Comunidad</h4>
                      <p className="text-muted-foreground">
                        Fomentamos el sentido de pertenencia y el trabajo en equipo.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border/50 transition-all hover:border-border hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-accent/10 text-accent-foreground">
                        <Award className="h-6 w-6" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Excelencia</h4>
                      <p className="text-muted-foreground">
                        Promovemos el desarrollo personal y la superación constante.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border/50 transition-all hover:border-border hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-accent-tertiary/10 text-accent-tertiary">
                        <Heart className="h-6 w-6" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Servicio</h4>
                      <p className="text-muted-foreground">
                        Educamos en el compromiso con la sociedad y el medio ambiente.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border/50 transition-all hover:border-border hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-secondary/10 text-secondary">
                        <Compass className="h-6 w-6" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Aventura</h4>
                      <p className="text-muted-foreground">
                        Vivimos experiencias que forman el carácter y la autonomía.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-muted rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Información de Contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Dirección</p>
                      <p className="text-muted-foreground">C/ Poeta Ricard Sanmartí, 13</p>
                      <p className="text-muted-foreground">46019 Benimaclet, Valencia</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Horario</p>
                      <p className="text-muted-foreground">Sábados de 16:30 a 18:30</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Síguenos en redes sociales</h4>
                  <div className="flex space-x-3">
                    <Link
                      href="https://www.instagram.com/osyris.scouts/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-full transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </Link>
                    <Link
                      href="https://www.youtube.com/user/GrupoScoutOsyris"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-full transition-colors"
                    >
                      <Youtube className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3079.6536087335166!2d-0.3647121!3d39.4835057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6048b3f0f7c3e5%3A0x7c8c2f3a2e8e8f0!2sC.%20Poeta%20Ricard%20Sanmart%C3%AD%2C%2013%2C%2046019%20Valencia!5e0!3m2!1ses!2ses!4v1710432000000!5m2!1ses!2ses"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación GS Osyris"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Secciones */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Nuestras Secciones</h2>
            <Tabs defaultValue="castores" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
                <TabsTrigger value="castores">Castores</TabsTrigger>
                <TabsTrigger value="lobatos">Lobatos</TabsTrigger>
                <TabsTrigger value="scouts">Scouts</TabsTrigger>
                <TabsTrigger value="escultas">Escultas</TabsTrigger>
                <TabsTrigger value="rovers">Rovers</TabsTrigger>
              </TabsList>

              <TabsContent value="castores" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Castores (6-8 años)</h3>
                    <p className="text-muted-foreground mb-4">
                      Los Castores son los más pequeños del grupo. A través del juego y la fantasía, aprenden a
                      compartir, a respetar a los demás y a descubrir el mundo que les rodea. Su lema es "Compartir".
                    </p>
                    <p className="text-muted-foreground mb-4">
                      En esta sección, los niños y niñas comienzan a desarrollar su autonomía y a formar parte de una
                      comunidad, la Colonia, donde cada uno tiene su papel y responsabilidad.
                    </p>
                    <Button asChild className="mt-2">
                      <Link href="/secciones/castores">Conoce más sobre Castores</Link>
                    </Button>
                  </div>
                  <div className="relative h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Castores en actividad"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="lobatos" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Lobatos (8-11 años)</h3>
                    <p className="text-muted-foreground mb-4">
                      Los Lobatos forman la Manada, inspirada en "El Libro de la Selva". Aprenden a vivir en comunidad,
                      a respetar las normas y a desarrollar habilidades a través del juego y la aventura. Su lema es
                      "Haremos lo mejor".
                    </p>
                    <p className="text-muted-foreground mb-4">
                      En esta etapa, los niños y niñas comienzan a trabajar en pequeños grupos, las Seisenas, donde
                      aprenden a colaborar y a asumir responsabilidades.
                    </p>
                    <Button asChild className="mt-2">
                      <Link href="/secciones/lobatos">Conoce más sobre Lobatos</Link>
                    </Button>
                  </div>
                  <div className="relative h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Lobatos en actividad"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scouts" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Scouts (11-14 años)</h3>
                    <p className="text-muted-foreground mb-4">
                      Los Scouts forman la Tropa, donde aprenden a trabajar en equipo, a tomar decisiones y a
                      desarrollar habilidades técnicas. Su lema es "Siempre Listos".
                    </p>
                    <p className="text-muted-foreground mb-4">
                      En esta sección, los jóvenes se organizan en Patrullas, pequeños grupos autónomos donde cada uno
                      tiene un cargo y responsabilidades. Aprenden a través de la aventura y el contacto con la
                      naturaleza.
                    </p>
                    <Button asChild className="mt-2">
                      <Link href="/secciones/scouts">Conoce más sobre Scouts</Link>
                    </Button>
                  </div>
                  <div className="relative h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Scouts en actividad"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="escultas" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Escultas (14-17 años)</h3>
                    <p className="text-muted-foreground mb-4">
                      Los Escultas forman la Unidad, donde profundizan en su compromiso personal y social. Su lema es
                      "Siempre a Punto".
                    </p>
                    <p className="text-muted-foreground mb-4">
                      En esta etapa, los jóvenes desarrollan proyectos más complejos, aprenden a gestionar su tiempo y
                      recursos, y comienzan a definir su proyecto de vida. Trabajan en equipos y asumen
                      responsabilidades mayores.
                    </p>
                    <Button asChild className="mt-2">
                      <Link href="/secciones/escultas">Conoce más sobre Escultas</Link>
                    </Button>
                  </div>
                  <div className="relative h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Escultas en actividad"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rovers" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Rovers (17-21 años)</h3>
                    <p className="text-muted-foreground mb-4">
                      Los Rovers forman el Clan, donde consolidan su compromiso con la sociedad y desarrollan su
                      proyecto personal. Su lema es "Servir".
                    </p>
                    <p className="text-muted-foreground mb-4">
                      En esta sección, los jóvenes adultos realizan proyectos de servicio a la comunidad, profundizan en
                      su formación personal y se preparan para asumir responsabilidades en la sociedad.
                    </p>
                    <Button asChild className="mt-2">
                      <Link href="/secciones/rovers">Conoce más sobre Rovers</Link>
                    </Button>
                  </div>
                  <div className="relative h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Rovers en actividad"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* CTA */}
          <div className="bg-osyris-gold/10 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Quieres formar parte de nuestra aventura?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Si estás interesado en que tus hijos formen parte del Grupo Scout Osyris o quieres colaborar como
              voluntario, no dudes en contactar con nosotros.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-osyris-red hover:bg-osyris-red/90">
                <Link href="/contacto">Contacta con nosotros</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/calendario">Ver próximas actividades</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

