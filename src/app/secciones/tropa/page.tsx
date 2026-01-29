import type { Metadata } from "next"
import DynamicSectionPage from "@/components/ui/dynamic-section-page"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Tropa Brownsea - Scouts (10-13 años)",
  description: "Sección de Tropa del Grupo Scout Osyris. Tropa Brownsea para jóvenes de 10 a 13 años. Sistema de patrullas, vida en la naturaleza y aventura.",
  alternates: {
    canonical: `${SITE_URL}/secciones/tropa`,
  },
  openGraph: {
    title: "Tropa Brownsea - Scouts (10-13 años) | Grupo Scout Osyris",
    description: "Sección de Tropa para jóvenes de 10 a 13 años. Sistema de patrullas y vida en la naturaleza.",
    url: `${SITE_URL}/secciones/tropa`,
  },
}

export default function TropaPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([
        { name: 'Secciones', path: '/secciones' },
        { name: 'Tropa', path: '/secciones/tropa' },
      ])} />
      <DynamicSectionPage sectionSlug="tropa" />
    </>
  )
}
