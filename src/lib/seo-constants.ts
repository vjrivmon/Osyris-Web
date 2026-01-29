export const SITE_URL = 'https://gruposcoutosyris.es'
export const SITE_NAME = 'Grupo Scout Osyris'

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo-osyris.png`,
  sameAs: [
    'https://www.instagram.com/gruposcoutosyris/',
    'https://www.facebook.com/GrupoScoutOsyris/',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@grupoosyris.es',
    contactType: 'customer service',
    availableLanguage: 'Spanish',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calle Poeta Ricard Sanmartí nº3',
    addressLocality: 'Valencia',
    addressRegion: 'Comunidad Valenciana',
    postalCode: '46020',
    addressCountry: 'ES',
  },
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'es',
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
  },
}

export function buildBreadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: SITE_URL,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
      })),
    ],
  }
}
