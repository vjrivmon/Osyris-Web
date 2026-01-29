"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StaticText, StaticImage } from "@/components/ui/static-content"
// import { useSectionContent } from "@/hooks/useSectionContent" // NO SE USA - datos estáticos
import Link from "next/link"
import Image from "next/image"

// Jefatura del Grupo Scout Osyris
const coordinationTeam = [
  {
    name: "Oonai",
    photo: "/images/kraal/_maria.png",
  },
  {
    name: "Lucía",
    photo: "/images/kraal/_lucia.png",
  },
]

const sections = [
  {
    name: "Castores - Colonia La Veleta",
    colorClass: "bg-orange-500",
    members: [
      {
        name: "Lekes",
        photo: "/images/kraal/_noelia.png",
      },
      {
        name: "Rasti",
        photo: "/images/kraal/_joan.png",
      },
      {
        name: "Barú",
        photo: "/images/kraal/_jaume.png",
      },
      {
        name: "Kibu",
        photo: "/images/kraal/_alvaros.png",
      },
    ],
  },
  {
    name: "Manada - Manada Waingunga",
    colorClass: "bg-yellow-400",
    members: [
      {
        name: "Germà Gris",
        photo: "/images/kraal/_lopo.png",
      },
      {
        name: "Akela",
        photo: "/images/kraal/_itziar.png",
      },
      {
        name: "Baloo",
        photo: "/images/kraal/_hector.png",
      },
      {
        name: "Brumby",
        photo: "/images/kraal/_asier.png",
      },
      {
        name: "Oonai",
        photo: "/images/kraal/_maria.png",
      },
    ],
  },
  {
    name: "Tropa - Tropa Brownsea",
    colorClass: "bg-blue-500",
    members: [
      {
        name: "Vicente",
        photo: "/images/kraal/_vicente.png",
      },
      {
        name: "Amelia",
        photo: "/images/kraal/_amelia.png",
      },
      {
        name: "Lucía",
        photo: "/images/kraal/_lucia.png",
      },
      {
        name: "Mateo",
        photo: "/images/kraal/_mateo.png",
      },
    ],
  },
  {
    name: "Pioneros - Posta Kanhiwara",
    colorClass: "bg-red-600",
    members: [
      {
        name: "Esther",
        photo: "/images/kraal/_esther.png",
      },
      {
        name: "Rodrigo",
        photo: "/images/kraal/_rodrigo.png",
      },
      {
        name: "Elena",
        photo: "/images/kraal/_elena.png",
      },
      {
        name: "Miguel",
        photo: "/images/kraal/_miguel.png",
      },
    ],
  },
  {
    name: "Rutas - Ruta Walhalla",
    colorClass: "bg-green-700",
    members: [
      {
        name: "Mireia",
        photo: "/images/kraal/_mireia.png",
      },
      {
        name: "Artur",
        photo: "/images/kraal/_artur.png",
      },
      {
        name: "Alejandra",
        photo: "/images/kraal/_alejandra.png",
      },
    ],
  },
]

export default function KraalContent() {
  // ⚠️ IMPORTANTE: Esta página usa SOLO datos estáticos locales
  // NO se carga contenido desde la API

  // Función helper para obtener contenido con fallback (siempre devuelve fallback)
  const getContent = (key: string, fallback: string) => {
    return fallback
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* MainNav ya incluye su propio <header> con sticky top-0 */}
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/kraal/kraal.jpg"
              alt="Kraal"
              fill
              sizes="100vw"
              className="object-cover object-center"
              style={{ objectPosition: 'center 30%' }}
              priority
            />
            <div className="absolute inset-0 bg-primary/80"></div>
          </div>
          <div className="container mx-auto px-4 text-center text-primary-foreground relative z-10">
            <StaticText
              contentId={220}
              identificador="hero-title"
              seccion="kraal"
              as="h1"
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6"
            >
              Nuestro Kraal
            </StaticText>
            <StaticText
              contentId={221}
              identificador="hero-subtitle"
              seccion="kraal"
              as="p"
              multiline
              className="mt-4 text-xl max-w-3xl mx-auto"
            >
              Conoce al equipo de monitores que hacen posible el Grupo Scout Osyris
            </StaticText>
          </div>
        </section>

        {/* Coordinación Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <StaticText
              contentId={222}
              identificador="coordinacion-title"
              seccion="kraal"
              as="h2"
              className="text-2xl font-bold text-center mb-8"
            >
              Jefatura de Grupo
            </StaticText>
            <div className="flex justify-center">
              <div className="flex flex-wrap justify-center gap-8 max-w-7xl">
                {coordinationTeam.map((member, i) => (
                  <Card key={i} className="overflow-hidden w-80">
                    <div className="h-64 relative">
                      <StaticImage
                        contentId={223 + i * 4}
                        identificador={`coord-${i}-photo`}
                        seccion="kraal"
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                      >
                        {getContent(`coord-${i}-photo`, member.photo)}
                      </StaticImage>
                    </div>
                    <CardContent className="p-6 text-center">
                      <StaticText
                        contentId={224 + i * 4}
                        identificador={`coord-${i}-name`}
                        seccion="kraal"
                        as="h3"
                        className="text-xl font-bold"
                      >
                        {member.name}
                      </StaticText>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Secciones Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <StaticText
              contentId={235}
              identificador="secciones-title"
              seccion="kraal"
              as="h2"
              className="text-2xl font-bold text-center mb-12"
            >
              Scouters por Secciones
            </StaticText>

            {sections.map((section, i) => (
              <div key={i} className="mb-16 last:mb-0">
                <div className={`h-2 ${section.colorClass} max-w-xs mx-auto mb-4 rounded`}></div>
                <StaticText
                  contentId={236 + i * 20}
                  identificador={`section-${i}-title`}
                  seccion="kraal"
                  as="h3"
                  className="text-xl font-bold text-center mb-8"
                >
                  {section.name}
                </StaticText>
                <div className="flex justify-center">
                  <div className="flex flex-wrap justify-center gap-6 max-w-7xl">
                    {section.members.map((member, j) => (
                      <Card key={j} className="overflow-hidden w-56">
                        <div className="h-48 relative">
                          <StaticImage
                            contentId={237 + i * 20 + j * 4}
                            identificador={`section-${i}-member-${j}-photo`}
                            seccion="kraal"
                            alt={member.name}
                            className="w-full h-full object-cover object-top"
                          >
                            {getContent(`section-${i}-member-${j}-photo`, member.photo)}
                          </StaticImage>
                        </div>
                        <CardContent className="p-4 text-center">
                          <StaticText
                            contentId={238 + i * 20 + j * 4}
                            identificador={`section-${i}-member-${j}-name`}
                            seccion="kraal"
                            as="h4"
                            className="font-bold"
                          >
                            {member.name}
                          </StaticText>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Join Us Section */}
        <section className="py-16 bg-gray-200 dark:bg-slate-900">
          <div className="container mx-auto px-4 text-center">
            <StaticText
              contentId={336}
              identificador="join-title"
              seccion="kraal"
              as="h2"
              className="text-3xl font-bold mb-6"
            >
              ¿Quieres formar parte de nuestro Kraal?
            </StaticText>
            <StaticText
              contentId={337}
              identificador="join-description"
              seccion="kraal"
              as="p"
              multiline
              className="max-w-2xl mx-auto mb-8"
            >
              Si tienes experiencia scout, ganas de aprender y quieres contribuir a la educación de niños y jóvenes,
              ¡únete a nuestro equipo!
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
