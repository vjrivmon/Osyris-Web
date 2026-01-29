import type { Metadata } from "next"
import DynamicSectionPage from "@/components/ui/dynamic-section-page"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Posta Kanhiwara - Pioneros (13-16 años)",
  description: "Sección de Pioneros del Grupo Scout Osyris. Posta Kanhiwara para jóvenes de 13 a 16 años. Proyectos, liderazgo y compromiso social.",
  alternates: {
    canonical: `${SITE_URL}/secciones/pioneros`,
  },
  openGraph: {
    title: "Posta Kanhiwara - Pioneros (13-16 años) | Grupo Scout Osyris",
    description: "Sección de Pioneros para jóvenes de 13 a 16 años. Proyectos, liderazgo y compromiso social.",
    url: `${SITE_URL}/secciones/pioneros`,
  },
}

export default function PionerosPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([
        { name: 'Secciones', path: '/secciones' },
        { name: 'Pioneros', path: '/secciones/pioneros' },
      ])} />
      <DynamicSectionPage sectionSlug="pioneros" />
    </>
  )
}
