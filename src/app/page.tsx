import type { Metadata } from "next"
import HomePageContent from "@/components/home/home-page-content"
import { JsonLd } from "@/components/seo/json-ld"
import { SITE_URL, SITE_NAME } from "@/lib/seo-constants"

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
}

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'NonprofitOrganization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/images/logo-osyris.png`,
          description: 'Grupo Scout Osyris: educación integral para jóvenes de 5 a 19 años en Valencia. Secciones de Castores, Manada, Tropa, Pioneros y Rutas.',
          foundingDate: '1981',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Calle Poeta Ricard Sanmartí nº3',
            addressLocality: 'Valencia',
            addressRegion: 'Comunidad Valenciana',
            postalCode: '46020',
            addressCountry: 'ES',
          },
          areaServed: {
            '@type': 'City',
            name: 'Valencia',
          },
        }}
      />
      <HomePageContent />
    </>
  )
}
