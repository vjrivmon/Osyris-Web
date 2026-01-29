import type { Metadata } from "next"
import KraalContent from "@/components/pages/kraal-content"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Kraal - Equipo de Monitores",
  description: "Conoce al Kraal del Grupo Scout Osyris. Nuestro equipo de monitores voluntarios formados en educación scout para cada sección.",
  alternates: {
    canonical: `${SITE_URL}/sobre-nosotros/kraal`,
  },
  openGraph: {
    title: "Kraal - Equipo de Monitores | Grupo Scout Osyris",
    description: "Conoce al equipo de monitores del Grupo Scout Osyris. Scouters voluntarios formados en educación scout.",
    url: `${SITE_URL}/sobre-nosotros/kraal`,
  },
}

export default function KraalPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([
        { name: 'Sobre Nosotros', path: '/sobre-nosotros' },
        { name: 'Kraal', path: '/sobre-nosotros/kraal' },
      ])} />
      <KraalContent />
    </>
  )
}
