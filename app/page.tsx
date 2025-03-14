import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Users, Award, Heart } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Suspense } from "react"

// Componente de tarjeta de características optimizado
function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any; 
  title: string; 
  description: string 
}) {
  return (
    <Card className="border border-border/50 transition-all hover:border-border hover:shadow-md">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary/10 text-primary mx-auto">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// Componente de sección de funcionalidades
function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Comunidad",
      description: "Fomentamos el sentido de pertenencia y el trabajo en equipo."
    },
    {
      icon: Award,
      title: "Excelencia",
      description: "Promovemos el desarrollo personal y la superación constante."
    },
    {
      icon: Heart,
      title: "Servicio",
      description: "Educamos en el compromiso con la sociedad y el medio ambiente."
    },
    {
      icon: CalendarDays,
      title: "Actividades",
      description: "Organizamos campamentos, excursiones y actividades educativas."
    }
  ]
  
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">¿Qué ofrecemos?</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          En el Grupo Scout Osyris trabajamos para el desarrollo integral de niños y jóvenes a través de actividades
          educativas y divertidas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  )
}

// Componente de llamada a la acción
function CTASection() {
  return (
    <section className="bg-osyris-gold/10 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">¿Quieres formar parte de nuestra aventura?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
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
    </section>
  )
}

// Página principal optimizada
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-osyris-navy/90 scout-pattern" />
          <div className="relative container mx-auto px-4 py-24 sm:py-32">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Grupo Scout Osyris</h1>
              <p className="mt-6 text-xl text-white/90">
                Formando jóvenes a través del método scout, promoviendo valores, aventura y servicio a la comunidad
                desde 1981.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-osyris-red hover:bg-osyris-red/90">
                  <Link href="/sobre-nosotros">Conoce más</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <Link href="/calendario">Ver actividades</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Cargar las secciones con Suspense para mejorar el rendimiento */}
        <Suspense fallback={<div className="h-96 flex items-center justify-center">Cargando...</div>}>
          <FeaturesSection />
        </Suspense>

        <Suspense fallback={<div className="h-64 flex items-center justify-center">Cargando...</div>}>
          <CTASection />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

