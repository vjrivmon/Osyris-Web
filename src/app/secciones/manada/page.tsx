import type { Metadata } from "next"
import DynamicSectionPage from "@/components/ui/dynamic-section-page"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Manada Waingunga - Lobatos (7-10 años)",
  description: "Sección de Lobatos del Grupo Scout Osyris. Manada Waingunga para niños de 7 a 10 años. Aventura y aprendizaje inspirados en El Libro de la Selva.",
  alternates: {
    canonical: `${SITE_URL}/secciones/manada`,
  },
  openGraph: {
    title: "Manada Waingunga - Lobatos (7-10 años) | Grupo Scout Osyris",
    description: "Sección de Lobatos para niños de 7 a 10 años. Aventura inspirada en El Libro de la Selva.",
    url: `${SITE_URL}/secciones/manada`,
  },
}

export default function ManadaPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([
        { name: 'Secciones', path: '/secciones' },
        { name: 'Manada', path: '/secciones/manada' },
      ])} />
      <DynamicSectionPage sectionSlug="manada" />
    </>
  )
}
