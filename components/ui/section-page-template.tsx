'use client'

import React from 'react'
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import PageEditor from "@/components/ui/page-editor"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface SectionData {
  name: string
  fullName: string
  slug: string
  emoji: string
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

  // Obtener las clases estáticas según el color accent de la sección
  const sectionClasses = accentClasses[sectionData.colors.accent as keyof typeof accentClasses] || accentClasses.orange

  const editableElements = [
    {
      id: 'hero-title',
      type: 'text' as const,
      selector: '[data-edit="hero-title"]',
      label: 'Título principal',
      content: `${sectionData.name} - ${sectionData.fullName}`,
      maxLength: 100
    },
    {
      id: 'hero-subtitle',
      type: 'text' as const,
      selector: '[data-edit="hero-subtitle"]',
      label: 'Subtítulo del héroe',
      content: `"${sectionData.motto}" - ${sectionData.ageRange}`,
      maxLength: 150
    },
    {
      id: 'hero-image',
      type: 'image' as const,
      selector: '[data-edit="hero-image"]',
      label: 'Imagen principal',
      content: '/placeholder.svg?height=400&width=600'
    },
    {
      id: 'about-title',
      type: 'text' as const,
      selector: '[data-edit="about-title"]',
      label: 'Título sección "Quiénes somos"',
      content: `¿Quiénes son los ${sectionData.name}?`,
      maxLength: 100
    },
    {
      id: 'about-description',
      type: 'textarea' as const,
      selector: '[data-edit="about-description"]',
      label: 'Descripción principal',
      content: sectionData.description,
      maxLength: 1000
    },
    {
      id: 'about-details',
      type: 'textarea' as const,
      selector: '[data-edit="about-details"]',
      label: 'Detalles adicionales',
      content: sectionData.details,
      maxLength: 1000
    },
    ...(sectionData.frame ? [{
      id: 'about-frame',
      type: 'textarea' as const,
      selector: '[data-edit="about-frame"]',
      label: 'Marco simbólico',
      content: sectionData.frame,
      maxLength: 1000
    }] : []),
    {
      id: 'activities-title',
      type: 'text' as const,
      selector: '[data-edit="activities-title"]',
      label: 'Título sección actividades',
      content: `¿Qué hacen los ${sectionData.name}?`,
      maxLength: 100
    },
    {
      id: 'methodology-title',
      type: 'text' as const,
      selector: '[data-edit="methodology-title"]',
      label: 'Título metodología',
      content: 'Metodología',
      maxLength: 100
    },
    {
      id: 'team-title',
      type: 'text' as const,
      selector: '[data-edit="team-title"]',
      label: 'Título equipo',
      content: 'Nuestro Equipo',
      maxLength: 100
    }
  ]

  return (
    <PageEditor
      pageName={`${sectionData.name} - ${sectionData.fullName}`}
      pageSlug={sectionData.slug}
      elements={editableElements}
    >
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <MainNav />
          </div>
        </header>
        <main className="flex-1">
          {/* Hero Section */}
          <section className={`relative bg-gradient-to-br ${sectionData.colors.from} ${sectionData.colors.to} py-16 md:py-24 text-white`}>
            <div className="container mx-auto px-4 text-center">
              <div className="inline-block mb-4 text-5xl">{sectionData.emoji}</div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6" data-edit="hero-title">
                {sectionData.name} - {sectionData.fullName}
              </h1>
              <p className="mt-4 text-xl max-w-3xl mx-auto" data-edit="hero-subtitle">
                "{sectionData.motto}" - {sectionData.ageRange}
              </p>
            </div>
          </section>

          {/* About Section */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt={`${sectionData.name} en actividad`}
                    className="rounded-lg w-full h-auto"
                    data-edit="hero-image"
                  />
                </div>
                <div className="md:w-1/2 space-y-4">
                  <h2 className="text-2xl font-bold" data-edit="about-title">
                    ¿Quiénes son los {sectionData.name}?
                  </h2>
                  <p data-edit="about-description">
                    {sectionData.description}
                  </p>
                  <p data-edit="about-details">
                    {sectionData.details}
                  </p>
                  {sectionData.frame && (
                    <p data-edit="about-frame">
                      {sectionData.frame}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Activities Section */}
          <section className="py-12 bg-muted">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8" data-edit="activities-title">
                ¿Qué hacen los {sectionData.name}?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sectionData.activities.map((activity, i) => (
                  <div key={i} className="bg-background rounded-lg p-6 shadow-sm">
                    <div className="text-3xl mb-4">{activity.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                    <p className="text-muted-foreground">{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Methodology Section */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8" data-edit="methodology-title">
                  Metodología
                </h2>
                <div className="space-y-6">
                  {sectionData.methodology.map((method, i) => (
                    <div key={i} className={`${sectionClasses.methodology} p-4 rounded`}>
                      <h3 className="font-bold mb-2 text-foreground">{method.title}</h3>
                      <p className="text-foreground/90">{method.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className={`py-12 ${sectionClasses.teamSection}`}>
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8" data-edit="team-title">
                Nuestro Equipo
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {sectionData.team.map((member, i) => (
                  <div key={i} className={`${sectionClasses.teamCard} rounded-lg p-6 shadow-sm text-center`}>
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-muted">
                      <img
                        src={member.photo || "/placeholder.svg?height=100&width=100"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Navigation Section */}
          <section className="py-8 bg-muted">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                {sectionData.navigation.prev ? (
                  <Button asChild variant="outline">
                    <Link href={sectionData.navigation.prev.href}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {sectionData.navigation.prev.title}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/secciones">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver a Secciones
                    </Link>
                  </Button>
                )}

                {sectionData.navigation.next && (
                  <Button asChild className="mt-4 sm:mt-0">
                    <Link href={sectionData.navigation.next.href}>
                      {sectionData.navigation.next.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </PageEditor>
  )
}

export default SectionPageTemplate