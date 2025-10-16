'use client'

import React, { useState, useEffect } from 'react'
import SectionPageTemplate from "@/components/ui/section-page-template"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  AlertTriangle
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
        motto: "Compartir",
        ageRange: "Niños y niñas de 5 a 7 años",
        colors: {
          from: "from-orange-400",
          to: "to-orange-600",
          accent: "orange"
        },
        description: "Los Castores son los más pequeños del grupo scout. A través del juego y la fantasía, aprenden a compartir y a descubrir el mundo que les rodea.",
        details: "En la Colonia La Veleta, los niños y niñas de 5 a 7 años comienzan su aventura scout en un ambiente seguro y divertido.",
        frame: "El marco simbólico de los Castores está inspirado en el cuento 'Los amigos del bosque'.",
        activities: [
          { icon: "🎮", title: "Juegos", description: "Juegos cooperativos, de imaginación y al aire libre." },
          { icon: "🌳", title: "Naturaleza", description: "Primeros contactos con la naturaleza." },
          { icon: "🎨", title: "Manualidades", description: "Talleres creativos donde desarrollan su imaginación." }
        ],
        methodology: [
          { title: "El Juego", description: "El juego es la principal herramienta educativa para los Castores." },
          { title: "La Fantasía", description: "El marco simbólico permite vivir aventuras imaginarias." },
          { title: "El Pequeño Grupo", description: "Se organizan en pequeños grupos llamados 'madrigueras'." }
        ],
        team: [
          { name: "Monitor Principal", role: "Coordinador de Castores", photo: "/placeholder.svg?height=100&width=100" },
          { name: "Monitor Adjunto", role: "Scouter de Castores", photo: "/placeholder.svg?height=100&width=100" }
        ],
        navigation: {
          prev: { href: "/secciones", title: "Volver a Secciones" },
          next: { href: "/secciones/manada", title: "Siguiente: Manada" }
        }
      },
      'manada': {
        name: "Manada",
        fullName: "Manada Waingunga",
        slug: "manada",
        emoji: "🐺",
        motto: "Haremos lo mejor",
        ageRange: "Niños y niñas de 7 a 10 años",
        colors: {
          from: "from-yellow-400",
          to: "to-yellow-600",
          accent: "yellow"
        },
        description: "La Manada vive la aventura del Libro de la Selva, desarrollando su autonomía y aprendiendo a trabajar en grupo.",
        details: "En la Manada Waingunga, los niños y niñas de 7 a 10 años viven aventuras siguiendo las huellas de Mowgli.",
        frame: "El marco simbólico está basado en el Libro de la Selva de Rudyard Kipling.",
        activities: [
          { icon: "🏃", title: "Aventuras", description: "Grandes juegos y aventuras basadas en el Libro de la Selva." },
          { icon: "🌲", title: "Exploración", description: "Exploración del entorno natural y urbano." },
          { icon: "🎯", title: "Especialidades", description: "Desarrollo de habilidades a través de las especialidades." }
        ],
        methodology: [
          { title: "El Juego Aventura", description: "Grandes juegos que recrean las aventuras de Mowgli." },
          { title: "La Ley de la Manada", description: "Principios que guían la convivencia en la manada." },
          { title: "Las Especialidades", description: "Sistema de progresión personal basado en habilidades." }
        ],
        team: [
          { name: "Akela", role: "Jefe de Manada", photo: "/placeholder.svg?height=100&width=100" },
          { name: "Bagheera", role: "Subjefe de Manada", photo: "/placeholder.svg?height=100&width=100" },
          { name: "Baloo", role: "Ayudante de Manada", photo: "/placeholder.svg?height=100&width=100" }
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
        motto: "Siempre listos",
        ageRange: "Chicos y chicas de 10 a 13 años",
        colors: {
          from: "from-green-400",
          to: "to-green-600",
          accent: "green"
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
          { name: "Jefe de Tropa", role: "Scouter Principal", photo: "/placeholder.svg?height=100&width=100" },
          { name: "Subjefe de Tropa", role: "Scouter Adjunto", photo: "/placeholder.svg?height=100&width=100" }
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
        motto: "Unidos en el servicio",
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
          { name: "Jefe de Posta", role: "Scouter Principal", photo: "/placeholder.svg?height=100&width=100" },
          { name: "Subjefe de Posta", role: "Scouter Adjunto", photo: "/placeholder.svg?height=100&width=100" }
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
          { name: "Jefe de Ruta", role: "Scouter Principal", photo: "/placeholder.svg?height=100&width=100" },
          { name: "Subjefe de Ruta", role: "Scouter Adjunto", photo: "/placeholder.svg?height=100&width=100" }
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