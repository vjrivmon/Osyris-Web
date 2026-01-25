"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TableOfContents, type TocItem } from "./table-of-contents"
import { Calendar } from "lucide-react"

interface LegalSection {
  id: string
  title: string
  icon?: React.ReactNode
  content: React.ReactNode
}

interface LegalPageTemplateProps {
  title: string
  description?: string
  lastUpdated: string
  version?: string
  sections: LegalSection[]
}

export function LegalPageTemplate({
  title,
  description,
  lastUpdated,
  version = "1.0",
  sections,
}: LegalPageTemplateProps) {
  // Generar items para la tabla de contenidos
  const tocItems: TocItem[] = sections.map((section) => ({
    id: section.id,
    title: section.title,
    icon: section.icon,
  }))

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h1>
            {description && (
              <p className="text-primary-foreground/80 text-lg mb-6">
                {description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Calendar className="h-4 w-4" />
                Ultima actualizacion: {lastUpdated}
              </div>
              <Badge
                variant="secondary"
                className="bg-secondary text-secondary-foreground"
              >
                v{version}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tabla de Contenidos - Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24">
              <Card className="lg:border-0 lg:shadow-none">
                <CardContent className="p-4">
                  <TableOfContents items={tocItems} />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Secciones */}
          <div className="flex-1 max-w-3xl space-y-8">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
              >
                <Card>
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-semibold mb-4">
                      {section.icon && (
                        <span className="text-primary">{section.icon}</span>
                      )}
                      {section.title}
                    </h2>
                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                      {section.content}
                    </div>
                  </CardContent>
                </Card>
              </section>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

// Componente auxiliar para listas en secciones legales
export function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2 list-disc pl-5">{children}</ul>
}

// Componente auxiliar para items destacados
export function LegalHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/50 border-l-4 border-primary p-4 rounded-r-lg my-4">
      {children}
    </div>
  )
}
