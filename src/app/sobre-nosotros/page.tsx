import type { Metadata } from "next"
import SobreNosotrosContent from "@/components/pages/sobre-nosotros-content"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Sobre Nosotros - Historia y Valores",
  description: "Conoce la historia del Grupo Scout Osyris, fundado en 1981 en Valencia. Nuestros valores, metodología scout y más de 40 años educando en Benimaclet.",
  alternates: {
    canonical: `${SITE_URL}/sobre-nosotros`,
  },
  openGraph: {
    title: "Sobre Nosotros - Historia y Valores | Grupo Scout Osyris",
    description: "Conoce la historia del Grupo Scout Osyris, fundado en 1981 en Valencia. Nuestros valores y metodología scout.",
    url: `${SITE_URL}/sobre-nosotros`,
  },
}

export default function SobreNosotrosPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([{ name: 'Sobre Nosotros', path: '/sobre-nosotros' }])} />
      <SobreNosotrosContent />
    </>
  )
}
