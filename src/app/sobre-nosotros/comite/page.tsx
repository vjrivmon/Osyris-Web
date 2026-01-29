import type { Metadata } from "next"
import ComiteContent from "@/components/pages/comite-content"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Comité de Padres",
  description: "Conoce al Comité de Grupo del Grupo Scout Osyris. El equipo directivo de padres y madres que coordina y gestiona las actividades del grupo.",
  alternates: {
    canonical: `${SITE_URL}/sobre-nosotros/comite`,
  },
  openGraph: {
    title: "Comité de Padres | Grupo Scout Osyris",
    description: "Conoce al Comité de Grupo del Grupo Scout Osyris. El equipo directivo de padres y madres voluntarios.",
    url: `${SITE_URL}/sobre-nosotros/comite`,
  },
}

export default function ComitePage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([
        { name: 'Sobre Nosotros', path: '/sobre-nosotros' },
        { name: 'Comité', path: '/sobre-nosotros/comite' },
      ])} />
      <ComiteContent />
    </>
  )
}
