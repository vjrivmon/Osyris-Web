import type { Metadata } from "next"
import ContactoContent from "@/components/pages/contacto-content"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, buildBreadcrumbs } from "@/lib/seo-constants"

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta con el Grupo Scout Osyris en Valencia. Dirección, teléfono, email y formulario de contacto. Reuniones los sábados en Benimaclet.",
  alternates: {
    canonical: `${SITE_URL}/contacto`,
  },
  openGraph: {
    title: "Contacto | Grupo Scout Osyris",
    description: "Contacta con el Grupo Scout Osyris en Valencia. Dirección, teléfono, email y formulario de contacto.",
    url: `${SITE_URL}/contacto`,
  },
}

export default function ContactoPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbs([{ name: 'Contacto', path: '/contacto' }])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Grupo Scout Osyris',
          description: 'Grupo scout educativo para jóvenes de 5 a 19 años en Valencia.',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Calle Poeta Ricard Sanmartí nº3',
            addressLocality: 'Valencia',
            addressRegion: 'Comunidad Valenciana',
            postalCode: '46020',
            addressCountry: 'ES',
          },
          telephone: '+34 600 123 456',
          email: 'info@grupoosyris.es',
          url: `${SITE_URL}/contacto`,
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: 'Saturday',
              opens: '17:00',
              closes: '19:00',
              description: 'Reuniones semanales',
            },
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: 'Friday',
              opens: '20:00',
              closes: '22:00',
              description: 'Reuniones de Kraal',
            },
          ],
        }}
      />
      <ContactoContent />
    </>
  )
}
