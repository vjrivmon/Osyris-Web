/**
 * 🔗 PAGE CONNECTOR SYSTEM - OSYRIS CMS
 * Connects database pages to real web pages with dynamic content injection
 */

import { getApiUrl } from './auth-utils'

export interface PageConnection {
  slug: string
  pageType: 'section' | 'markdown' | 'custom'
  sectionType?: 'castores' | 'manada' | 'tropa' | 'pioneros' | 'rutas'
  templatePath?: string
  dataMapping: ContentMapping[]
}

export interface ContentMapping {
  id: string
  type: 'text' | 'textarea' | 'image' | 'list' | 'object'
  selector: string
  label: string
  defaultContent: string
  maxLength?: number
  required?: boolean
  section?: string // For organizing content into sections
}

export interface DatabasePage {
  id: number
  titulo: string
  slug: string
  contenido: string
  resumen?: string
  estado: 'borrador' | 'publicada' | 'archivada'
  fecha_actualizacion: string
}

export interface ParsedContent {
  [key: string]: any
}

/**
 * Page connection definitions - Maps database pages to web components
 */
export const PAGE_CONNECTIONS: PageConnection[] = [
  // Scout Section Pages
  {
    slug: 'castores',
    pageType: 'section',
    sectionType: 'castores',
    templatePath: '/app/secciones/castores/page.tsx',
    dataMapping: [
      {
        id: 'hero-title',
        type: 'text',
        selector: '[data-edit="hero-title"]',
        label: 'Título principal',
        defaultContent: 'Castores - Colonia La Veleta',
        maxLength: 100,
        required: true,
        section: 'hero'
      },
      {
        id: 'hero-subtitle',
        type: 'text',
        selector: '[data-edit="hero-subtitle"]',
        label: 'Subtítulo del héroe',
        defaultContent: '"Compartir" - Niños y niñas de 5 a 7 años',
        maxLength: 150,
        section: 'hero'
      },
      {
        id: 'hero-image',
        type: 'image',
        selector: '[data-edit="hero-image"]',
        label: 'Imagen principal',
        defaultContent: '/placeholder.svg?height=400&width=600',
        section: 'hero'
      },
      {
        id: 'about-description',
        type: 'textarea',
        selector: '[data-edit="about-description"]',
        label: 'Descripción principal',
        defaultContent: 'Los Castores son los más pequeños del grupo scout...',
        maxLength: 1000,
        section: 'about'
      },
      {
        id: 'about-details',
        type: 'textarea',
        selector: '[data-edit="about-details"]',
        label: 'Detalles adicionales',
        defaultContent: 'En la Colonia La Veleta, los niños y niñas...',
        maxLength: 1000,
        section: 'about'
      },
      {
        id: 'about-frame',
        type: 'textarea',
        selector: '[data-edit="about-frame"]',
        label: 'Marco simbólico',
        defaultContent: 'El marco simbólico de los Castores...',
        maxLength: 1000,
        section: 'about'
      },
      {
        id: 'activities',
        type: 'list',
        selector: '[data-edit="activities"]',
        label: 'Lista de actividades',
        defaultContent: '[]',
        section: 'activities'
      },
      {
        id: 'methodology',
        type: 'list',
        selector: '[data-edit="methodology"]',
        label: 'Metodología educativa',
        defaultContent: '[]',
        section: 'methodology'
      },
      {
        id: 'team',
        type: 'list',
        selector: '[data-edit="team"]',
        label: 'Equipo de monitores',
        defaultContent: '[]',
        section: 'team'
      }
    ]
  },
  {
    slug: 'manada',
    pageType: 'section',
    sectionType: 'manada',
    templatePath: '/app/secciones/manada/page.tsx',
    dataMapping: [
      {
        id: 'hero-title',
        type: 'text',
        selector: '[data-edit="hero-title"]',
        label: 'Título principal',
        defaultContent: 'Lobatos - Manada Waingunga',
        maxLength: 100,
        required: true,
        section: 'hero'
      },
      // Similar mapping structure for other sections...
    ]
  },
  // Add more page connections for other sections and pages...
]

/**
 * Parses markdown content from database into structured data
 */
export function parseMarkdownContent(markdownContent: string): ParsedContent {
  const parsed: ParsedContent = {}

  // Split content by headers to identify sections
  const sections = markdownContent.split(/^#{1,3}\s+/m).filter(Boolean)

  sections.forEach((section, index) => {
    const lines = section.trim().split('\n')
    const title = lines[0]?.trim() || ''
    const content = lines.slice(1).join('\n').trim()

    // Identify section types based on title keywords
    const sectionType = identifySectionType(title)

    if (sectionType === 'activities') {
      parsed.activities = parseActivitiesList(content)
    } else if (sectionType === 'methodology') {
      parsed.methodology = parseMethodologyList(content)
    } else if (sectionType === 'team') {
      parsed.team = parseTeamList(content)
    } else if (sectionType === 'hero' && index === 0) {
      parsed.heroTitle = title
      parsed.heroDescription = content
    } else if (sectionType === 'about') {
      parsed.aboutDescription = content
    } else {
      // Generic content sections
      parsed[`section_${index}`] = {
        title,
        content,
        type: sectionType
      }
    }
  })

  return parsed
}

/**
 * Identifies section type based on title content
 */
function identifySectionType(title: string): string {
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes('actividad') || lowerTitle.includes('qué hac')) {
    return 'activities'
  }
  if (lowerTitle.includes('metodolog') || lowerTitle.includes('método') || lowerTitle.includes('cómo')) {
    return 'methodology'
  }
  if (lowerTitle.includes('equipo') || lowerTitle.includes('monitor') || lowerTitle.includes('scouter')) {
    return 'team'
  }
  if (lowerTitle.includes('quién') || lowerTitle.includes('sobre') || lowerTitle.includes('nosotros')) {
    return 'about'
  }
  if (lowerTitle.includes('marco') || lowerTitle.includes('simbólico') || lowerTitle.includes('historia')) {
    return 'frame'
  }

  return 'content'
}

/**
 * Parses activities list from markdown
 */
function parseActivitiesList(content: string): Array<{icon: string, title: string, description: string}> {
  const activities = []
  const activityBlocks = content.split(/^[-*]\s+/m).filter(Boolean)

  activityBlocks.forEach(block => {
    const lines = block.trim().split('\n')
    const firstLine = lines[0] || ''

    // Extract emoji/icon from start of line
    const iconMatch = firstLine.match(/^([\u{1F000}-\u{1F6FF}]|[\u{2600}-\u{26FF}])\s*/u)
    const icon = iconMatch ? iconMatch[1] : '🎯'

    // Extract title (bold text or first significant text)
    const titleMatch = firstLine.replace(iconMatch?.[0] || '', '').match(/\*\*(.*?)\*\*|^([^.]+)/)
    const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : 'Actividad'

    // Rest is description
    const description = lines.slice(titleMatch ? 1 : 0).join('\n').trim() || 'Descripción de la actividad'

    activities.push({ icon, title, description })
  })

  return activities
}

/**
 * Parses methodology list from markdown
 */
function parseMethodologyList(content: string): Array<{title: string, description: string}> {
  const methodology = []
  const methodBlocks = content.split(/^[-*]\s+/m).filter(Boolean)

  methodBlocks.forEach(block => {
    const lines = block.trim().split('\n')
    const titleMatch = lines[0]?.match(/\*\*(.*?)\*\*|^([^.]+)/)
    const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : 'Método'
    const description = lines.slice(1).join('\n').trim() || 'Descripción del método educativo'

    methodology.push({ title, description })
  })

  return methodology
}

/**
 * Parses team list from markdown
 */
function parseTeamList(content: string): Array<{name: string, role: string, photo?: string}> {
  const team = []
  const memberBlocks = content.split(/^[-*]\s+/m).filter(Boolean)

  memberBlocks.forEach(block => {
    const lines = block.trim().split('\n')
    const firstLine = lines[0] || ''

    // Extract name (usually in bold or at start)
    const nameMatch = firstLine.match(/\*\*(.*?)\*\*|^([^-:,]+)/)
    const name = nameMatch ? (nameMatch[1] || nameMatch[2]).trim() : 'Monitor'

    // Extract role (usually after dash or colon)
    const roleMatch = firstLine.match(/[-:]\s*(.+)$/) ||
                     lines[1]?.match(/^Rol:\s*(.+)/) ||
                     lines[1]?.match(/^(.+)$/)
    const role = roleMatch ? roleMatch[1].trim() : 'Scouter'

    // Look for photo reference
    const photoMatch = block.match(/!\[.*?\]\((.*?)\)/)
    const photo = photoMatch ? photoMatch[1] : '/placeholder.svg?height=100&width=100'

    team.push({ name, role, photo })
  })

  return team
}

/**
 * Converts parsed content back to markdown format
 */
export function contentToMarkdown(parsedContent: ParsedContent): string {
  let markdown = ''

  // Build markdown from parsed content
  if (parsedContent.heroTitle) {
    markdown += `# ${parsedContent.heroTitle}\n\n`
    if (parsedContent.heroDescription) {
      markdown += `${parsedContent.heroDescription}\n\n`
    }
  }

  if (parsedContent.aboutDescription) {
    markdown += `## Acerca de Nosotros\n\n${parsedContent.aboutDescription}\n\n`
  }

  if (parsedContent.activities && Array.isArray(parsedContent.activities)) {
    markdown += `## Actividades\n\n`
    parsedContent.activities.forEach(activity => {
      markdown += `- ${activity.icon} **${activity.title}**: ${activity.description}\n`
    })
    markdown += '\n'
  }

  if (parsedContent.methodology && Array.isArray(parsedContent.methodology)) {
    markdown += `## Metodología\n\n`
    parsedContent.methodology.forEach(method => {
      markdown += `- **${method.title}**: ${method.description}\n`
    })
    markdown += '\n'
  }

  if (parsedContent.team && Array.isArray(parsedContent.team)) {
    markdown += `## Nuestro Equipo\n\n`
    parsedContent.team.forEach(member => {
      markdown += `- **${member.name}** - ${member.role}\n`
      if (member.photo && member.photo !== '/placeholder.svg?height=100&width=100') {
        markdown += `  ![${member.name}](${member.photo})\n`
      }
    })
    markdown += '\n'
  }

  // Add any additional sections
  Object.keys(parsedContent).forEach(key => {
    if (key.startsWith('section_') && typeof parsedContent[key] === 'object') {
      const section = parsedContent[key]
      markdown += `## ${section.title}\n\n${section.content}\n\n`
    }
  })

  return markdown.trim()
}

/**
 * Gets page connection configuration by slug
 */
export function getPageConnection(slug: string): PageConnection | null {
  return PAGE_CONNECTIONS.find(connection => connection.slug === slug) || null
}

/**
 * Transforms database page to component-ready data
 */
export function transformDatabaseToComponent(
  databasePage: DatabasePage,
  connection?: PageConnection
): any {
  const parsedContent = parseMarkdownContent(databasePage.contenido)

  if (!connection) {
    connection = getPageConnection(databasePage.slug)
  }

  if (!connection) {
    // Return generic page data
    return {
      title: databasePage.titulo,
      content: parsedContent,
      slug: databasePage.slug,
      status: databasePage.estado,
      lastUpdated: databasePage.fecha_actualizacion
    }
  }

  // Transform based on page type
  if (connection.pageType === 'section') {
    return transformToSectionData(databasePage, parsedContent, connection)
  } else {
    return {
      title: databasePage.titulo,
      content: parsedContent,
      slug: databasePage.slug,
      status: databasePage.estado,
      lastUpdated: databasePage.fecha_actualizacion,
      connection
    }
  }
}

/**
 * Transforms to section page data structure
 */
function transformToSectionData(
  databasePage: DatabasePage,
  parsedContent: ParsedContent,
  connection: PageConnection
): any {
  const sectionNames = {
    castores: { name: 'Castores', fullName: 'Colonia La Veleta', emoji: '🦫', motto: 'Compartir' },
    manada: { name: 'Manada', fullName: 'Manada Waingunga', emoji: '🐺', motto: 'Haremos lo mejor' },
    tropa: { name: 'Tropa', fullName: 'Tropa Brownsea', emoji: '⚜️', motto: 'Siempre listos' },
    pioneros: { name: 'Pioneros', fullName: 'Posta Kanhiwara', emoji: '🏔️', motto: 'Descubrir' },
    rutas: { name: 'Rutas', fullName: 'Ruta Walhalla', emoji: '🎒', motto: 'Servir' }
  }

  const sectionInfo = sectionNames[connection.sectionType as keyof typeof sectionNames]

  if (!sectionInfo) {
    throw new Error(`Unknown section type: ${connection.sectionType}`)
  }

  return {
    name: sectionInfo.name,
    fullName: sectionInfo.fullName,
    slug: databasePage.slug,
    emoji: sectionInfo.emoji,
    motto: sectionInfo.motto,
    ageRange: getAgeRangeForSection(connection.sectionType!),
    colors: getSectionColors(connection.sectionType!),
    description: parsedContent.aboutDescription || parsedContent.heroDescription || 'Descripción de la sección scout',
    details: parsedContent.aboutDetails || '',
    frame: parsedContent.aboutFrame || parsedContent.frame || '',
    activities: parsedContent.activities || getDefaultActivities(connection.sectionType!),
    methodology: parsedContent.methodology || getDefaultMethodology(connection.sectionType!),
    team: parsedContent.team || getDefaultTeam(),
    navigation: getSectionNavigation(connection.sectionType!)
  }
}

/**
 * Helper functions for section data
 */
function getAgeRangeForSection(sectionType: string): string {
  const ranges = {
    castores: 'Niños y niñas de 5 a 7 años',
    manada: 'Niños y niñas de 7 a 10 años',
    tropa: 'Chicos y chicas de 10 a 13 años',
    pioneros: 'Jóvenes de 13 a 16 años',
    rutas: 'Jóvenes de 16 a 19 años'
  }
  return ranges[sectionType as keyof typeof ranges] || 'Edad variable'
}

function getSectionColors(sectionType: string): {from: string, to: string, accent: string} {
  const colors = {
    castores: { from: 'from-orange-400', to: 'to-orange-600', accent: 'orange' },
    manada: { from: 'from-yellow-400', to: 'to-yellow-600', accent: 'yellow' },
    tropa: { from: 'from-green-400', to: 'to-green-600', accent: 'green' },
    pioneros: { from: 'from-red-400', to: 'to-red-600', accent: 'red' },
    rutas: { from: 'from-green-600', to: 'to-green-800', accent: 'green' }
  }
  return colors[sectionType as keyof typeof colors] || colors.castores
}

function getSectionNavigation(sectionType: string): {prev?: {href: string, title: string}, next?: {href: string, title: string}} {
  const navigation = {
    castores: {
      prev: { href: '/secciones', title: 'Volver a Secciones' },
      next: { href: '/secciones/manada', title: 'Siguiente: Manada' }
    },
    manada: {
      prev: { href: '/secciones/castores', title: 'Anterior: Castores' },
      next: { href: '/secciones/tropa', title: 'Siguiente: Tropa' }
    },
    tropa: {
      prev: { href: '/secciones/manada', title: 'Anterior: Manada' },
      next: { href: '/secciones/pioneros', title: 'Siguiente: Pioneros' }
    },
    pioneros: {
      prev: { href: '/secciones/tropa', title: 'Anterior: Tropa' },
      next: { href: '/secciones/rutas', title: 'Siguiente: Rutas' }
    },
    rutas: {
      prev: { href: '/secciones/pioneros', title: 'Anterior: Pioneros' },
      next: undefined
    }
  }
  return navigation[sectionType as keyof typeof navigation] || { prev: { href: '/secciones', title: 'Volver a Secciones' } }
}

function getDefaultActivities(sectionType: string): Array<{icon: string, title: string, description: string}> {
  return [
    { icon: '🎮', title: 'Juegos', description: 'Juegos adaptados a la edad de la sección' },
    { icon: '🌳', title: 'Naturaleza', description: 'Actividades al aire libre y contacto con la naturaleza' },
    { icon: '🎨', title: 'Manualidades', description: 'Talleres creativos y trabajos manuales' }
  ]
}

function getDefaultMethodology(sectionType: string): Array<{title: string, description: string}> {
  return [
    { title: 'Aprender haciendo', description: 'La experiencia directa es la base del aprendizaje' },
    { title: 'Pequeños grupos', description: 'Trabajo en equipos reducidos para mejor convivencia' },
    { title: 'Progresión personal', description: 'Cada persona avanza a su propio ritmo' }
  ]
}

function getDefaultTeam(): Array<{name: string, role: string, photo?: string}> {
  return [
    { name: 'Monitor Principal', role: 'Coordinador de Sección', photo: '/placeholder.svg?height=100&width=100' },
    { name: 'Monitor Adjunto', role: 'Scouter de Sección', photo: '/placeholder.svg?height=100&width=100' }
  ]
}

/**
 * Updates database content with changes from component
 */
export async function updateDatabaseFromComponent(
  pageId: number,
  changes: { [elementId: string]: any },
  connection?: PageConnection
): Promise<boolean> {
  try {
    // Get current page data
    const response = await fetch(`${getApiUrl()}/api/paginas/${pageId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch current page data')
    }

    const { data: currentPage } = await response.json()
    const parsedContent = parseMarkdownContent(currentPage.contenido)

    // Apply changes to parsed content
    Object.keys(changes).forEach(elementId => {
      const value = changes[elementId]

      if (elementId === 'hero-title') {
        parsedContent.heroTitle = value
      } else if (elementId === 'about-description') {
        parsedContent.aboutDescription = value
      } else if (elementId === 'about-details') {
        parsedContent.aboutDetails = value
      } else if (elementId === 'about-frame') {
        parsedContent.aboutFrame = value
      } else if (elementId === 'activities') {
        parsedContent.activities = value
      } else if (elementId === 'methodology') {
        parsedContent.methodology = value
      } else if (elementId === 'team') {
        parsedContent.team = value
      }
    })

    // Convert back to markdown
    const updatedMarkdown = contentToMarkdown(parsedContent)

    // Update database
    const updateResponse = await fetch(`${getApiUrl()}/api/paginas/${pageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('osyris_token')}`
      },
      body: JSON.stringify({
        contenido: updatedMarkdown,
        fecha_actualizacion: new Date().toISOString()
      })
    })

    return updateResponse.ok
  } catch (error) {
    console.error('Error updating database from component:', error)
    return false
  }
}

/**
 * Fetches page data with connection information
 */
export async function fetchPageWithConnection(slug: string): Promise<{
  page: DatabasePage | null,
  connection: PageConnection | null,
  transformedData: any
}> {
  try {
    const connection = getPageConnection(slug)

    // Fetch page from database by slug
    const response = await fetch(`${getApiUrl()}/api/paginas/slug/${slug}`)

    if (!response.ok) {
      return { page: null, connection, transformedData: null }
    }

    const { data: page } = await response.json()
    const transformedData = transformDatabaseToComponent(page, connection)

    return { page, connection, transformedData }
  } catch (error) {
    console.error('Error fetching page with connection:', error)
    return { page: null, connection: null, transformedData: null }
  }
}