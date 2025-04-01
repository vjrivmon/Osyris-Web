import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function KraalPage() {
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
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">Nuestro Kraal</h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">
              Conoce al equipo de monitores que hacen posible el Grupo Scout Osyris
            </p>
          </div>
        </section>

        {/* Coordinación Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Coordinación de Grupo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {coordinationTeam.map((member, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-64 relative">
                    <img
                      src={member.photo || "/placeholder.svg?height=300&width=300"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-primary mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground mb-4">{member.description}</p>
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

        {/* Secciones Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12">Scouters por Secciones</h2>

            {sections.map((section, i) => (
              <div key={i} className="mb-16 last:mb-0">
                <div className={`h-2 ${section.colorClass} max-w-xs mx-auto mb-4 rounded`}></div>
                <h3 className="text-xl font-bold text-center mb-8">{section.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {section.members.map((member, j) => (
                    <Card key={j} className="overflow-hidden h-full">
                      <div className="h-48 relative">
                        <img
                          src={member.photo || "/placeholder.svg?height=200&width=200"}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-bold mb-1">{member.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                        <p className="text-xs text-muted-foreground">{member.experience}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Join Us Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">¿Quieres formar parte de nuestro Kraal?</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Si tienes experiencia scout, ganas de aprender y quieres contribuir a la educación de niños y jóvenes,
              ¡únete a nuestro equipo!
            </p>
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

// Mock data
const coordinationTeam = [
  {
    name: "María García",
    role: "Coordinadora de Grupo",
    description:
      "Más de 10 años de experiencia en el escultismo. Coordina y supervisa todas las actividades del grupo.",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Carlos Rodríguez",
    role: "Secretario de Grupo",
    description: "Responsable de la gestión administrativa y documentación del grupo.",
    photo: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Ana Martínez",
    role: "Tesorera de Grupo",
    description: "Encargada de la gestión económica y financiera del grupo.",
    photo: "/placeholder.svg?height=300&width=300",
  },
]

const sections = [
  {
    name: "Castores - Colonia La Veleta",
    colorClass: "bg-orange-500",
    members: [
      {
        name: "Laura Sánchez",
        role: "Coordinadora de Castores",
        experience: "5 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Pedro Gómez",
        role: "Scouter de Castores",
        experience: "3 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Lucía Fernández",
        role: "Scouter de Castores",
        experience: "2 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
    ],
  },
  {
    name: "Lobatos - Manada Waingunga",
    colorClass: "bg-yellow-400",
    members: [
      {
        name: "Miguel Torres",
        role: "Coordinador de Lobatos",
        experience: "7 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Carmen Ruiz",
        role: "Scouter de Lobatos",
        experience: "4 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Javier Serrano",
        role: "Scouter de Lobatos",
        experience: "3 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Elena Moreno",
        role: "Scouter de Lobatos",
        experience: "2 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
    ],
  },
  {
    name: "Tropa - Tropa Brownsea",
    colorClass: "bg-blue-500",
    members: [
      {
        name: "Raúl Jiménez",
        role: "Coordinador de Tropa",
        experience: "6 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Cristina Díaz",
        role: "Scouter de Tropa",
        experience: "4 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Antonio Navarro",
        role: "Scouter de Tropa",
        experience: "3 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
    ],
  },
  {
    name: "Pioneros - Posta Kanhiwara",
    colorClass: "bg-red-600",
    members: [
      {
        name: "Sara García",
        role: "Coordinadora de Pioneros",
        experience: "8 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Héctor Rivas",
        role: "Scouter de Pioneros",
        experience: "5 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
    ],
  },
  {
    name: "Rutas - Ruta Walhalla",
    colorClass: "bg-green-700",
    members: [
      {
        name: "Itziar Sánchez",
        role: "Coordinadora de Rutas",
        experience: "9 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
      {
        name: "Álvaro Santandreu",
        role: "Scouter de Rutas",
        experience: "6 años en el grupo",
        photo: "/placeholder.svg?height=200&width=200",
      },
    ],
  },
]

