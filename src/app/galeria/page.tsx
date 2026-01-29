import type { Metadata } from "next"
import GaleriaContent from "@/components/pages/galeria-content"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Galería de Fotos",
  description: "Galería de fotos del Grupo Scout Osyris. Revive nuestras aventuras, campamentos, actividades y eventos especiales en Valencia.",
  alternates: {
    canonical: `${SITE_URL}/galeria`,
  },
  openGraph: {
    title: "Galería de Fotos | Grupo Scout Osyris",
    description: "Galería de fotos del Grupo Scout Osyris. Campamentos, actividades y eventos especiales.",
    url: `${SITE_URL}/galeria`,
  },
}

export default function GaleriaPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([{ name: 'Galería', path: '/galeria' }])} />
      <GaleriaContent />
    </>
  )
}
