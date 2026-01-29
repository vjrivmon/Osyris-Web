import type { Metadata } from "next"
import DynamicSectionPage from "@/components/ui/dynamic-section-page"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Ruta Walhalla - Rutas (16-19 años)",
  description: "Sección de Rutas del Grupo Scout Osyris. Ruta Walhalla para jóvenes de 16 a 19 años. Servicio a la comunidad, travesías y proyecto de vida.",
  alternates: {
    canonical: `${SITE_URL}/secciones/rutas`,
  },
  openGraph: {
    title: "Ruta Walhalla - Rutas (16-19 años) | Grupo Scout Osyris",
    description: "Sección de Rutas para jóvenes de 16 a 19 años. Servicio a la comunidad y proyecto de vida.",
    url: `${SITE_URL}/secciones/rutas`,
  },
}

export default function RutasPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([
        { name: 'Secciones', path: '/secciones' },
        { name: 'Rutas', path: '/secciones/rutas' },
      ])} />
      <DynamicSectionPage sectionSlug="rutas" />
    </>
  )
}
