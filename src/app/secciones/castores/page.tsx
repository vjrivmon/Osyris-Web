import type { Metadata } from "next"
import DynamicSectionPage from "@/components/ui/dynamic-section-page"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Castores - Colonia La Veleta (5-7 años)",
  description: "Sección de Castores del Grupo Scout Osyris. Colonia La Veleta para niños de 5 a 7 años. Aprendemos a compartir a través del juego y la fantasía.",
  alternates: {
    canonical: `${SITE_URL}/secciones/castores`,
  },
  openGraph: {
    title: "Castores - Colonia La Veleta (5-7 años) | Grupo Scout Osyris",
    description: "Sección de Castores para niños de 5 a 7 años. Aprendemos a compartir a través del juego.",
    url: `${SITE_URL}/secciones/castores`,
  },
}

export default function CastoresPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([
        { name: 'Secciones', path: '/secciones' },
        { name: 'Castores', path: '/secciones/castores' },
      ])} />
      <DynamicSectionPage sectionSlug="castores" />
    </>
  )
}
