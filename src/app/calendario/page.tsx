import type { Metadata } from "next"
import CalendarioContent from "@/components/pages/calendario-content"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Calendario de Actividades",
  description: "Calendario de actividades del Grupo Scout Osyris. Consulta las fechas de reuniones, acampadas, campamentos y eventos especiales.",
  alternates: {
    canonical: `${SITE_URL}/calendario`,
  },
  openGraph: {
    title: "Calendario de Actividades | Grupo Scout Osyris",
    description: "Calendario de actividades del Grupo Scout Osyris. Reuniones, acampadas y campamentos.",
    url: `${SITE_URL}/calendario`,
  },
}

export default function CalendarioPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([{ name: 'Calendario', path: '/calendario' }])} />
      <CalendarioContent />
    </>
  )
}
