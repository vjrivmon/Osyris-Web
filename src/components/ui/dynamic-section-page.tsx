'use client'

import React, { useState, useEffect } from 'react'
import SectionPageTemplate from "@/components/ui/section-page-template"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  ArrowLeft
} from "lucide-react"

interface DynamicSectionPageProps {
  sectionSlug: string
}

export function DynamicSectionPage({ sectionSlug }: DynamicSectionPageProps) {
  const [sectionData, setSectionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  useEffect(() => {
    loadSectionData()
  }, [sectionSlug])

  const loadSectionData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log(`📄 Loading static data for section: ${sectionSlug}`)

      // ⚠️ IMPORTANTE: Las páginas de secciones usan SOLO datos estáticos locales
      // NO se cargan desde base de datos para mantener el contenido correcto y original
      const fallbackData = getFallbackData(sectionSlug)
      setSectionData(fallbackData)
      setIsUsingFallback(true)
      setLastUpdate(new Date().toISOString())

      console.log('✅ Static section data loaded')
    } catch (err) {
      console.error('❌ Error loading section data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')

      // Use fallback data in case of error
      const fallbackData = getFallbackData(sectionSlug)
      setSectionData(fallbackData)
      setIsUsingFallback(true)
      setLastUpdate(new Date().toISOString())
    } finally {
      setIsLoading(false)
    }
  }

  const getFallbackData = (slug: string) => {
    // Fallback data structure based on the original hardcoded data
    const fallbackSections = {
      'castores': {
        name: "Castores",
        fullName: "Colonia La Veleta",
        slug: "castores",
        emoji: "🦫",
        logo: "/images/secciones/castores.png",
        motto: "Compartir",
        ageRange: "Niños y niñas de 5 a 7 años",
        colors: {
          from: "from-orange-400",
          to: "to-orange-600",
          accent: "orange"
        },
        description: "La Colonia del grupo scout Osyris está formada por niños y niñas de 5 a 7 años. Somos la sección más pequeña del grupo. Nuestro lema es \"Compartir\" y vestimos de naranja.",
        details: "En 2012, cuando reabrimos la Colonia en el Osyris decidimos llamarla La Veleta, para que marcara la dirección del grupo y cimentara el futuro del mismo.",
        frame: "El marco simbólico que seguimos es el libro \"El río de los Castores\" de Fernando Martínez Gil. A través de él, los castores y castoras ayudan a Moi, un pequeño castor, a salvar a su amigo el río, que está enfermo por culpa de la acción humana. Viajando a través del bosque, conocerán distintos personajes como Barú, Kalú, Kibu, Rasti o Lekes; que les enseñarán los valores scout que trabajamos en el grupo.",
        activities: [
          { icon: "🏗️", title: "Presas", description: "Pequeños proyectos sobre temáticas que eligen los propios castores y castoras sobre los que se trabaja durante un periodo de tiempo." },
          { icon: "📓", title: "Cuaderno de Presa", description: "Es un cuadernito que utilizamos como herramienta para trabajar la progresión personal y consolidar la educación en valores." },
          { icon: "🎮", title: "Juegos", description: "Trabajamos la autonomía, el trabajo en equipo y las relaciones sociales a través de juegos." }
        ],
        methodology: [
          { title: "Aprender Jugando", description: "El juego es nuestra principal herramienta educativa. A través de él, los castores desarrollan habilidades sociales y valores scout de forma natural y divertida." },
          { title: "El Marco Simbólico", description: "Las aventuras de Moi y sus amigos del bosque nos permiten vivir experiencias que transmiten valores como la amistad, el cuidado del medio ambiente y la cooperación." },
          { title: "La Colonia", description: "Trabajamos todos juntos como una gran familia, donde cada castor aprende a compartir, respetar y ayudar a los demás." }
        ],
        team: [
          { name: "Lekes", role: "", photo: "/images/kraal/_noelia.png" },
          { name: "Rasti", role: "", photo: "/images/kraal/_joan.png" },
          { name: "Barú", role: "", photo: "/images/kraal/_jaume.png" },
          { name: "Kibu", role: "", photo: "/images/kraal/_alvaros.png" }
        ],
        navigation: {
          prev: { href: "/secciones", title: "Volver" },
          next: { href: "/secciones/manada", title: "Siguiente: Manada" }
        }
      },
      'manada': {
        name: "Manada",
        fullName: "Manada Waingunga",
        slug: "manada",
        emoji: "🐺",
        logo: "/images/secciones/manada.png",
        motto: "Haremos lo mejor",
        ageRange: "Niños y niñas de 7 a 10 años",
        colors: {
          from: "from-yellow-400",
          to: "to-yellow-600",
          accent: "yellow"
        },
        description: "La Manada Waingunga es la sección amarilla del Grupo Scout Osyris, formada por las lobatas y los lobatos, niños y niñas que comienzan su camino en el escultismo aprendiendo a convivir, descubrir y crecer junto a los demás.",
        details: "Nuestra ambientación se inspira en El Libro de la Selva, donde Mowgli aprende de la naturaleza y de sus amigos. Por eso, los scouters tomamos nombres de personajes como Baloo, Bagheera o Akela, que acompañan y guían a los lobatos en su aprendizaje.",
        frame: "En la manada trabajamos en seisenas, pequeños grupos de seis miembros que se organizan con autonomía. Cada seisena tiene su seisenera, que ayuda a coordinar al grupo y a que todos participen y aporten lo mejor de sí.",
        activities: [
          { icon: "🎯", title: "Las Cazas", description: "Durante el trimestre, la manada elige qué caza quiere emprender: un proyecto común que marca la temática de nuestras actividades, salidas y talleres." },
          { icon: "👥", title: "Trabajo en Seisenas", description: "Las propias seisenas preparan algunas actividades, aprenden a organizarse y, sobre todo, a disfrutar colaborando." },
          { icon: "🏕️", title: "Naturaleza y Aventura", description: "Nos encanta salir a la naturaleza, explorar nuevos lugares, acampar bajo las estrellas y compartir experiencias que nos ayudan a crecer como personas y como grupo." }
        ],
        methodology: [
          { title: "El Libro de la Selva", description: "Nuestra ambientación se inspira en las aventuras de Mowgli. Los scouters tomamos nombres de personajes que acompañan y guían a los lobatos en su aprendizaje." },
          { title: "Las Seisenas", description: "Pequeños grupos de seis miembros que se organizan con autonomía. Cada seisena tiene su seisenera, que ayuda a coordinar al grupo." },
          { title: "Aprender Jugando", description: "En la Manada Waingunga aprendemos jugando, ayudándonos y cuidando del entorno y de los demás." }
        ],
        team: [
          { name: "Germà Gris", role: "", photo: "/images/kraal/_lopo.png" },
          { name: "Akela", role: "", photo: "/images/kraal/_itziar.png" },
          { name: "Baloo", role: "", photo: "/images/kraal/_hector.png" },
          { name: "Brumby", role: "", photo: "/images/kraal/_asier.png" },
          { name: "Oonai", role: "", photo: "/images/kraal/_maria.png" }
        ],
        navigation: {
          prev: { href: "/secciones/castores", title: "Anterior: Castores" },
          next: { href: "/secciones/tropa", title: "Siguiente: Tropa" }
        }
      },
      'tropa': {
        name: "Tropa",
        fullName: "Tropa Brownsea",
        slug: "tropa",
        emoji: "⚜️",
        logo: "/images/secciones/tropa.png",
        heroImage: "/images/secciones/tropa-actividad.webp",
        motto: "Siempre listos",
        ageRange: "Chicos y chicas de 10 a 13 años",
        colors: {
          from: "from-blue-400",
          to: "to-blue-600",
          accent: "blue"
        },
        description: "La Tropa es donde los scouts desarrollan su autonomía, liderazgo y espíritu de servicio a través de las patrullas.",
        details: "En la Tropa Brownsea, los scouts viven la aventura en patrullas, desarrollando su carácter y habilidades.",
        frame: "El marco simbólico se basa en la aventura y la exploración, siguiendo la tradición scout.",
        activities: [
          { icon: "🏕️", title: "Campamentos", description: "Campamentos y actividades de aire libre." },
          { icon: "🧭", title: "Exploración", description: "Técnicas de orientación y exploración." },
          { icon: "🤝", title: "Servicio", description: "Proyectos de servicio a la comunidad." }
        ],
        methodology: [
          { title: "Sistema de Patrullas", description: "Organización en pequeños grupos autónomos." },
          { title: "Aventura y Desafío", description: "Actividades que suponen retos y aventuras." },
          { title: "Servicio", description: "Compromiso con el servicio a los demás." }
        ],
        team: [
          { name: "Vicente", role: "", photo: "/images/kraal/_vicente.png" },
          { name: "Amelia", role: "", photo: "/images/kraal/_amelia.png" },
          { name: "Lucía", role: "", photo: "/images/kraal/_lucia.png" },
          { name: "Mateo", role: "", photo: "/images/kraal/_mateo.png" }
        ],
        navigation: {
          prev: { href: "/secciones/manada", title: "Anterior: Manada" },
          next: { href: "/secciones/pioneros", title: "Siguiente: Pioneros" }
        }
      },
      'pioneros': {
        name: "Pioneros",
        fullName: "Posta Kanhiwara",
        slug: "pioneros",
        emoji: "🏔️",
        logo: "/images/secciones/pioneros.png",
        motto: "Descubrir",
        ageRange: "Jóvenes de 13 a 16 años",
        colors: {
          from: "from-red-400",
          to: "to-red-600",
          accent: "red"
        },
        description: "Los Pioneros desarrollan proyectos de servicio y aventura, preparándose para ser ciudadanos comprometidos.",
        details: "En la Posta Kanhiwara, los jóvenes de 13 a 16 años asumen responsabilidades y desarrollan proyectos.",
        frame: "El marco simbólico se centra en la aventura, el servicio y la preparación para la vida adulta.",
        activities: [
          { icon: "🎯", title: "Proyectos", description: "Desarrollo de proyectos personales y de grupo." },
          { icon: "⛰️", title: "Aventura", description: "Actividades de montaña y aventura." },
          { icon: "💡", title: "Innovación", description: "Proyectos de innovación y emprendimiento." }
        ],
        methodology: [
          { title: "Proyectos", description: "Metodología basada en el desarrollo de proyectos." },
          { title: "Autogestión", description: "Los jóvenes gestionan sus propias actividades." },
          { title: "Compromiso Social", description: "Fuerte componente de servicio a la comunidad." }
        ],
        team: [
          { name: "Esther", role: "", photo: "/images/kraal/_esther.png" },
          { name: "Rodrigo", role: "", photo: "/images/kraal/_rodrigo.png" },
          { name: "Elena", role: "", photo: "/images/kraal/_elena.png" },
          { name: "Miguel", role: "", photo: "/images/kraal/_miguel.png" }
        ],
        navigation: {
          prev: { href: "/secciones/tropa", title: "Anterior: Tropa" },
          next: { href: "/secciones/rutas", title: "Siguiente: Rutas" }
        }
      },
      'rutas': {
        name: "Rutas",
        fullName: "Ruta Walhalla",
        slug: "rutas",
        emoji: "🎒",
        logo: "/images/secciones/rutas.png",
        motto: "Servir",
        ageRange: "Jóvenes de 16 a 19 años",
        colors: {
          from: "from-green-600",
          to: "to-green-800",
          accent: "green"
        },
        description: "Las Rutas son los jóvenes más mayores del grupo, comprometidos con el servicio y la preparación para la vida adulta.",
        details: "En la Ruta Walhalla, los jóvenes de 16 a 19 años se preparan para ser ciudadanos comprometidos.",
        frame: "El marco simbólico se centra en el camino, la ruta hacia la madurez y el compromiso social.",
        activities: [
          { icon: "🚶", title: "Rutas", description: "Travesías y caminatas de larga distancia." },
          { icon: "🤲", title: "Servicio", description: "Proyectos de servicio a la comunidad." },
          { icon: "🎓", title: "Formación", description: "Formación para la vida adulta y profesional." }
        ],
        methodology: [
          { title: "La Ruta Personal", description: "Cada joven diseña su propio camino de crecimiento." },
          { title: "El Servicio", description: "Compromiso firme con el servicio a los demás." },
          { title: "La Responsabilidad", description: "Preparación para asumir responsabilidades adultas." }
        ],
        team: [
          { name: "Mireia", role: "", photo: "/images/kraal/_mireia.png" },
          { name: "Artur", role: "", photo: "/images/kraal/_artur.png" },
          { name: "Alejandra", role: "", photo: "/images/kraal/_alejandra.png" }
        ],
        navigation: {
          prev: { href: "/secciones/pioneros", title: "Anterior: Pioneros" },
          next: undefined
        }
      }
    }

    return fallbackSections[slug as keyof typeof fallbackSections] || fallbackSections['castores']
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-96 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Cargando página</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Preparando el contenido de la sección...
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cargando {sectionSlug}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !isUsingFallback) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-96 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-red-900">Error de conexión</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No se pudo conectar con la base de datos para obtener el contenido.
                </p>
                <p className="text-xs text-red-600 mb-4 font-mono bg-red-50 p-2 rounded">
                  {error}
                </p>
                <Button onClick={loadSectionData} className="bg-red-600 hover:bg-red-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!sectionData) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-96 border-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Página no encontrada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No se encontró contenido para la sección "{sectionSlug}".
                </p>
                <Button onClick={() => window.history.back()} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Main Content */}
      <SectionPageTemplate sectionData={sectionData} />
    </div>
  )
}

export default DynamicSectionPage