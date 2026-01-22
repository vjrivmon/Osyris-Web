'use client'

import React from 'react'
import SectionPageTemplate from "@/components/ui/section-page-template"
import { useSectionContent } from "@/hooks/useSectionContent"
import { Loader2 } from "lucide-react"

interface DynamicSectionPageProps {
  sectionSlug: string
}

// Datos fallback estáticos (mismo que antes)
const getFallbackData = (slug: string) => {
  const fallbackSections: Record<string, any> = {
    'castores': {
      name: "Castores",
      fullName: "Colonia La Veleta",
      slug: "castores",
      emoji: "🦫",
      motto: "Compartir",
      ageRange: "Niños y niñas de 5 a 7 años",
      colors: { from: "from-orange-400", to: "to-orange-600", accent: "orange" },
      description: "Los Castores son los más pequeños del grupo scout.",
      details: "En la Colonia La Veleta, los niños y niñas de 5 a 7 años comienzan su aventura scout.",
      frame: "El marco simbólico de los Castores está inspirado en el cuento 'Los amigos del bosque'.",
      activities: [
        { icon: "🎮", title: "Juegos", description: "Juegos cooperativos, de imaginación y al aire libre." },
        { icon: "🌳", title: "Naturaleza", description: "Primeros contactos con la naturaleza." },
        { icon: "🎨", title: "Manualidades", description: "Talleres creativos donde desarrollan su imaginación." }
      ],
      methodology: [
        { title: "El Juego", description: "El juego es la principal herramienta educativa para los Castores." },
        { title: "La Fantasía", description: "El marco simbólico permite vivir aventuras imaginarias." }
      ],
      team: [
        { name: "Monitor Principal", role: "Coordinador de Castores", photo: "/placeholder.svg?height=100&width=100" },
        { name: "Monitor Adjunto", role: "Scouter de Castores", photo: "/placeholder.svg?height=100&width=100" }
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
      motto: "Haremos lo mejor",
      ageRange: "Niños y niñas de 7 a 10 años",
      colors: { from: "from-yellow-400", to: "to-yellow-600", accent: "yellow" },
      description: "La Manada vive la aventura del Libro de la Selva.",
      details: "En la Manada Waingunga, los niños y niñas de 7 a 10 años viven aventuras.",
      frame: "El marco simbólico está basado en el Libro de la Selva de Rudyard Kipling.",
      activities: [
        { icon: "🏃", title: "Aventuras", description: "Grandes juegos y aventuras basadas en el Libro de la Selva." },
        { icon: "🌲", title: "Exploración", description: "Exploración del entorno natural y urbano." },
        { icon: "🎯", title: "Especialidades", description: "Desarrollo de habilidades a través de las especialidades." }
      ],
      methodology: [
        { title: "El Juego Aventura", description: "Grandes juegos que recrean las aventuras de Mowgli." },
        { title: "La Ley de la Manada", description: "Principios que guían la convivencia en la manada." }
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
      colors: { from: "from-green-400", to: "to-green-600", accent: "green" },
      description: "La Tropa es donde los scouts desarrollan su autonomía.",
      details: "En la Tropa Brownsea, los scouts viven la aventura en patrullas.",
      frame: "El marco simbólico se basa en la aventura y la exploración.",
      activities: [
        { icon: "🏕️", title: "Campamentos", description: "Campamentos y actividades de aire libre." },
        { icon: "🧭", title: "Exploración", description: "Técnicas de orientación y exploración." },
        { icon: "🤝", title: "Servicio", description: "Proyectos de servicio a la comunidad." }
      ],
      methodology: [
        { title: "Sistema de Patrullas", description: "Organización en pequeños grupos autónomos." },
        { title: "Aventura y Desafío", description: "Actividades que suponen retos y aventuras." }
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
      motto: "Descubrir",
      ageRange: "Jóvenes de 13 a 16 años",
      colors: { from: "from-red-400", to: "to-red-600", accent: "red" },
      description: "Los Pioneros desarrollan proyectos de servicio y aventura.",
      details: "En la Posta Kanhiwara, los jóvenes de 13 a 16 años asumen responsabilidades.",
      frame: "El marco simbólico se centra en la aventura, el servicio y la preparación.",
      activities: [
        { icon: "🎯", title: "Proyectos", description: "Desarrollo de proyectos personales y de grupo." },
        { icon: "⛰️", title: "Aventura", description: "Actividades de montaña y aventura." },
        { icon: "💡", title: "Innovación", description: "Proyectos de innovación y emprendimiento." }
      ],
      methodology: [
        { title: "Proyectos", description: "Metodología basada en el desarrollo de proyectos." },
        { title: "Autogestión", description: "Los jóvenes gestionan sus propias actividades." }
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
      colors: { from: "from-green-600", to: "to-green-800", accent: "green" },
      description: "Las Rutas son los jóvenes más mayores del grupo.",
      details: "En la Ruta Walhalla, los jóvenes de 16 a 19 años se preparan para ser ciudadanos comprometidos.",
      frame: "El marco simbólico se centra en el camino, la ruta hacia la madurez.",
      activities: [
        { icon: "🚶", title: "Rutas", description: "Travesías y caminatas de larga distancia." },
        { icon: "🤲", title: "Servicio", description: "Proyectos de servicio a la comunidad." },
        { icon: "🎓", title: "Formación", description: "Formación para la vida adulta y profesional." }
      ],
      methodology: [
        { title: "La Ruta Personal", description: "Cada joven diseña su propio camino de crecimiento." },
        { title: "El Servicio", description: "Compromiso firme con el servicio a los demás." }
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

  return fallbackSections[slug] || fallbackSections['castores']
}

export function DynamicSectionPage({ sectionSlug }: DynamicSectionPageProps) {
  const { content, isLoading } = useSectionContent(sectionSlug)
  
  // Obtener datos fallback
  const fallbackData = getFallbackData(sectionSlug)
  
  // Mergear datos de API con fallback
  const sectionData = {
    ...fallbackData,
    // Sobrescribir con datos de BD si existen
    ...(content['hero-title'] && { name: content['hero-title'].contenido.split(' - ')[0] }),
    ...(content['hero-subtitle'] && { 
      motto: content['hero-subtitle'].contenido.match(/"(.+?)"/)?.[1] || fallbackData.motto 
    }),
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando {sectionSlug}...</p>
      </div>
    )
  }

  return <SectionPageTemplate sectionData={sectionData} />
}

export default DynamicSectionPage
