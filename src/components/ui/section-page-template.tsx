'use client'

import React from 'react'
import Image from 'next/image'
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { StaticText, StaticImage } from "@/components/ui/static-content"
// import { useSectionContent } from "@/hooks/useSectionContent" // NO SE USA - datos estáticos
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface SectionData {
  name: string
  fullName: string
  slug: string
  emoji: string
  logo?: string
  heroImage?: string
  motto: string
  ageRange: string
  colors: {
    from: string
    to: string
    accent: string
  }
  description: string
  details: string
  frame?: string
  activities: Array<{
    icon: string
    title: string
    description: string
  }>
  methodology: Array<{
    title: string
    description: string
  }>
  team: Array<{
    name: string
    role: string
    photo?: string
  }>
  navigation: {
    prev?: { href: string; title: string }
    next?: { href: string; title: string }
  }
}

interface SectionPageTemplateProps {
  sectionData: SectionData
}

// Mapeo de IDs base por sección
const SECTION_BASE_IDS: Record<string, number> = {
  'castores': 500,
  'manada': 600,
  'tropa': 700,
  'pioneros': 800,
  'rutas': 900
}

// Mapeo estático de clases por color de sección para garantizar dark mode
const accentClasses = {
  orange: {
    methodology: 'bg-orange-50 border-l-4 border-orange-500 dark:bg-orange-950 dark:border-orange-400',
    teamSection: 'bg-orange-50 dark:bg-orange-950/50',
    teamCard: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
  },
  yellow: {
    methodology: 'bg-yellow-50 border-l-4 border-yellow-500 dark:bg-yellow-950 dark:border-yellow-400',
    teamSection: 'bg-yellow-50 dark:bg-yellow-950/50',
    teamCard: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
  },
  blue: {
    methodology: 'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-950 dark:border-blue-400',
    teamSection: 'bg-blue-50 dark:bg-blue-950/50',
    teamCard: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
  },
  green: {
    methodology: 'bg-green-50 border-l-4 border-green-500 dark:bg-green-950 dark:border-green-400',
    teamSection: 'bg-green-50 dark:bg-green-950/50',
    teamCard: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
  },
  red: {
    methodology: 'bg-red-50 border-l-4 border-red-500 dark:bg-red-950 dark:border-red-400',
    teamSection: 'bg-red-50 dark:bg-red-950/50',
    teamCard: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
  }
}

export function SectionPageTemplate({ sectionData }: SectionPageTemplateProps) {
  // ⚠️ IMPORTANTE: Las páginas de secciones NO cargan contenido del API
  // Usan SOLO datos estáticos pasados como prop desde DynamicSectionPage
  // const { content, isLoading } = useSectionContent(sectionData.slug) // DESHABILITADO
  
  // Función helper - ahora siempre usa fallback (datos estáticos)
  const getContent = (key: string, fallback: string) => {
    return fallback // Siempre usar fallback (datos estáticos)
  }

  // Ensure sectionData has all required properties
  if (!sectionData || !sectionData.colors) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error al cargar los datos de la sección</h1>
            <p className="text-muted-foreground">Los datos de la sección no están disponibles</p>
          </div>
        </div>
      </div>
    )
  }

  // NO hay estado de loading - siempre usar datos estáticos

  // Obtener base ID para esta sección
  const baseId = SECTION_BASE_IDS[sectionData.slug] || 500

  // Obtener las clases estáticas según el color accent de la sección
  const sectionClasses = accentClasses[sectionData.colors.accent as keyof typeof accentClasses] || accentClasses.orange

  return (
    <div className="flex flex-col min-h-screen">
      {/* MainNav ya incluye su propio <header> con sticky top-0 */}
      <MainNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className={`relative bg-white dark:bg-slate-900 py-12 sm:py-16 md:py-24`}>
          <div className="container mx-auto px-4 sm:px-6 text-center">
            {sectionData.logo && (
              <div className="inline-block mb-3 sm:mb-4">
                <Image
                  src={sectionData.logo}
                  alt={`Logo ${sectionData.name}`}
                  width={200}
                  height={200}
                  className="mx-auto"
                  priority
                />
              </div>
            )}
            <StaticText
              contentId={baseId}
              identificador="hero-title"
              seccion={sectionData.slug}
              as="h1"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-slate-900 dark:text-white px-2"
            >
              {getContent('hero-title', `${sectionData.name} - ${sectionData.fullName}`)}
            </StaticText>
            <StaticText
              contentId={baseId + 1}
              identificador="hero-subtitle"
              seccion={sectionData.slug}
              as="p"
              className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-slate-700 dark:text-slate-300 px-4"
            >
              {getContent('hero-subtitle', `"${sectionData.motto}" - ${sectionData.ageRange}`)}
            </StaticText>
          </div>
        </section>

        {/* About Section */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-center">
              <div className="lg:w-1/2 w-full">
                <StaticImage
                  contentId={baseId + 2}
                  identificador="hero-image"
                  seccion={sectionData.slug}
                  className="rounded-lg w-full aspect-[16/9] object-cover object-[center_80%]"
                  alt={`${sectionData.name} en actividad`}
                >
                  {getContent('hero-image', sectionData.heroImage || '/placeholder.svg?height=400&width=600')}
                </StaticImage>
              </div>
              <div className="lg:w-1/2 w-full space-y-3 sm:space-y-4">
                <StaticText
                  contentId={baseId + 3}
                  identificador="about-title"
                  seccion={sectionData.slug}
                  as="h2"
                  className="text-2xl font-bold"
                >
                  {getContent('about-title', `¿Quiénes son los ${sectionData.name}?`)}
                </StaticText>
                <StaticText
                  contentId={baseId + 4}
                  identificador="about-description"
                  seccion={sectionData.slug}
                  as="p"
                  multiline
                >
                  {getContent('about-description', sectionData.description)}
                </StaticText>
                <StaticText
                  contentId={baseId + 5}
                  identificador="about-details"
                  seccion={sectionData.slug}
                  as="p"
                  multiline
                >
                  {getContent('about-details', sectionData.details)}
                </StaticText>
                {sectionData.frame && (
                  <StaticText
                    contentId={baseId + 6}
                    identificador="about-frame"
                    seccion={sectionData.slug}
                    as="p"
                    multiline
                  >
                    {getContent('about-frame', sectionData.frame)}
                  </StaticText>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-8 sm:py-12 bg-muted">
          <div className="container mx-auto px-4 sm:px-6">
            <StaticText
              contentId={baseId + 7}
              identificador="activities-title"
              seccion={sectionData.slug}
              as="h2"
              className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8"
            >
              {getContent('activities-title', `¿Qué hacen los ${sectionData.name}?`)}
            </StaticText>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sectionData.activities.map((activity, i) => (
                <div key={i} className="bg-background rounded-lg p-6 shadow-sm">
                  <div className="text-3xl mb-4">{activity.icon}</div>
                  <StaticText
                    contentId={baseId + 10 + (i * 2)}
                    identificador={`activity-${i}-title`}
                    seccion={sectionData.slug}
                    as="h3"
                    className="text-xl font-bold mb-2"
                  >
                    {getContent(`activity-${i}-title`, activity.title)}
                  </StaticText>
                  <StaticText
                    contentId={baseId + 11 + (i * 2)}
                    identificador={`activity-${i}-description`}
                    seccion={sectionData.slug}
                    as="p"
                    multiline
                    className="text-muted-foreground"
                  >
                    {getContent(`activity-${i}-description`, activity.description)}
                  </StaticText>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <StaticText
                contentId={baseId + 20}
                identificador="methodology-title"
                seccion={sectionData.slug}
                as="h2"
                className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8"
              >
                {getContent('methodology-title', 'Metodología')}
              </StaticText>
              <div className="space-y-4 sm:space-y-6">
                {sectionData.methodology.map((method, i) => (
                  <div key={i} className={`${sectionClasses.methodology} p-4 rounded`}>
                    <StaticText
                      contentId={baseId + 21 + (i * 2)}
                      identificador={`methodology-${i}-title`}
                      seccion={sectionData.slug}
                      as="h3"
                      className="font-bold mb-2 text-foreground"
                    >
                      {getContent(`methodology-${i}-title`, method.title)}
                    </StaticText>
                    <StaticText
                      contentId={baseId + 22 + (i * 2)}
                      identificador={`methodology-${i}-description`}
                      seccion={sectionData.slug}
                      as="p"
                      multiline
                      className="text-foreground/90"
                    >
                      {getContent(`methodology-${i}-description`, method.description)}
                    </StaticText>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className={`py-8 sm:py-12 ${sectionClasses.teamSection}`}>
          <div className="container mx-auto px-4 sm:px-6">
            <StaticText
              contentId={baseId + 30}
              identificador="team-title"
              seccion={sectionData.slug}
              as="h2"
              className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8"
            >
              {getContent('team-title', 'Nuestro Equipo')}
            </StaticText>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-7xl mx-auto">
              {sectionData.team.map((member, i) => (
                <div key={i} className={`${sectionClasses.teamCard} rounded-lg p-6 shadow-sm text-center w-56`}>
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-muted">
                    <StaticImage
                      contentId={baseId + 31 + (i * 3)}
                      identificador={`team-${i}-photo`}
                      seccion={sectionData.slug}
                      className="w-full h-full object-cover"
                      alt={member.name}
                    >
                      {getContent(`team-${i}-photo`, member.photo || "/placeholder.svg?height=100&width=100")}
                    </StaticImage>
                  </div>
                  <StaticText
                    contentId={baseId + 32 + (i * 3)}
                    identificador={`team-${i}-name`}
                    seccion={sectionData.slug}
                    as="h3"
                    className="font-bold text-foreground"
                  >
                    {getContent(`team-${i}-name`, member.name)}
                  </StaticText>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Navigation Section */}
        <section className="py-6 sm:py-8 bg-muted">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-row justify-between items-center gap-2 w-full">
              {sectionData.navigation.prev ? (
                <Button asChild variant="outline" size="sm" className="sm:size-default">
                  <Link href={sectionData.navigation.prev.href}>
                    <ArrowLeft className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">{sectionData.navigation.prev.title}</span>
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm" className="sm:size-default">
                  <Link href="/secciones">
                    <ArrowLeft className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Volver</span>
                  </Link>
                </Button>
              )}

              {sectionData.navigation.next && (
                <Button asChild size="sm" className="sm:size-default">
                  <Link href={sectionData.navigation.next.href}>
                    <span className="hidden sm:inline">{sectionData.navigation.next.title}</span>
                    <ArrowRight className="h-4 w-4 sm:ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

export default SectionPageTemplate
