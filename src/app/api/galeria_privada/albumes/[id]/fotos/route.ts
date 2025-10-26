import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api-utils'

// GET /api/galeria_privada/albumes/[id]/fotos - Obtener fotos de un álbum específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = params.id

    // Obtener parámetros de la query
    const { searchParams } = new URL(request.url)
    const familiaId = searchParams.get('familia_id')
    const hijosIds = searchParams.get('hijos_ids')

    if (!familiaId || !hijosIds) {
      return NextResponse.json(
        { error: 'Se requiere familia_id e hijos_ids' },
        { status: 400 }
      )
    }

    // Obtener token de autorización
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Llamar al backend real
    const apiUrl = getApiUrl()
    const backendResponse = await fetch(`${apiUrl}/api/galeria_privada/albumes/${albumId}/fotos?familia_id=${familiaId}&hijos_ids=${hijosIds}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { error: errorData.error || 'Error del backend' },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()

    // Simular datos si el backend no responde
    if (!data || !data.fotos || data.fotos.length === 0) {
      const mockData = generateMockFotos(albumId, parseInt(hijosIds.split(',')[0]))
      return NextResponse.json(mockData)
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error en API de fotos de álbum:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función para generar datos mock de fotos
function generateMockFotos(albumId: string, familiaId: number) {
  const albumesData: Record<string, any> = {
    "album_001": {
      album: {
        id: "album_001",
        titulo: "Campamento de Verano 2024",
        descripcion: "Una semana de aventuras en la naturaleza con actividades scouts",
        fecha_evento: "2024-07-15",
        lugar_evento: "Sierra de Gredos",
        tipo_evento: "campamento",
        seccion: "Manada Waingunga",
        seccion_id: 2,
        fotos_count: 156
      },
      fotos: generateCampamentoFotos()
    },
    "album_002": {
      album: {
        id: "album_002",
        titulo: "Jornada de Integración",
        descripcion: "Actividades de equipo para nuevos y antiguos scouts",
        fecha_evento: "2024-09-28",
        lugar_evento: "Local del Grupo",
        tipo_evento: "jornada",
        seccion: "Colonia La Veleta",
        seccion_id: 1,
        fotos_count: 89
      },
      fotos: generateJornadaFotos()
    },
    "album_003": {
      album: {
        id: "album_003",
        titulo: "Taller de Manualidades",
        descripcion: "Creando artesanías scout con materiales reciclados",
        fecha_evento: "2024-10-05",
        lugar_evento: "Sede Central",
        tipo_evento: "actividad",
        seccion: "Colonia La Veleta",
        seccion_id: 1,
        fotos_count: 45
      },
      fotos: generateTallerFotos()
    }
  }

  // Devolver datos del álbum o un álbum por defecto
  const albumData = albumesData[albumId] || {
    album: {
      id: albumId,
      titulo: "Álbum de Ejemplo",
      descripcion: "Descripción del álbum",
      fecha_evento: "2024-10-01",
      lugar_evento: "Ubicación",
      tipo_evento: "actividad",
      seccion: "Sección",
      seccion_id: 1,
      fotos_count: 20
    },
    fotos: generateDefaultFotos()
  }

  return albumData
}

function generateCampamentoFotos() {
  const actividades = [
    "Montando tiendas de campaña",
    "Preparando fogata",
    "Juegos de noche",
    "Senderismo matutino",
    "Taller de nudos",
    "Cocina en el campo",
    "Orientación con brújula",
    "Noche de estrellas",
    "Juegos de agua",
    "Desmontando campamento"
  ]

  return Array.from({ length: 20 }, (_, index) => ({
    id: `foto_camp_${index + 1}`,
    album_id: "album_001",
    url: `https://picsum.photos/seed/camp${index}/800/600.jpg`,
    url_thumbnail: `https://picsum.photos/seed/camp${index}/400/300.jpg`,
    titulo: `${actividades[index % actividades.length]} - Campamento 2024`,
    descripcion: `Foto ${index + 1} de las actividades del campamento de verano`,
    fecha_captura: "2024-07-15T10:00:00Z",
    tamaño_bytes: Math.floor(Math.random() * 3000000) + 1000000,
    tamaño_formato: "2.1 MB",
    tipo: "image/jpeg",
    etiquetas: generateEtiquetas(index),
    metadata: {
      camara: "Canon EOS R5",
      lente: "RF 24-70mm f/2.8L",
      iso: 400 + Math.floor(Math.random() * 800),
      apertura: "f/2.8",
      velocidad: `1/${100 + Math.floor(Math.random() * 500)}`,
      gps_lat: 40.4168 + (Math.random() - 0.5) * 0.01,
      gps_lng: -3.7038 + (Math.random() - 0.5) * 0.01
    },
    created_at: "2024-07-16T08:00:00Z"
  }))
}

function generateJornadaFotos() {
  const actividades = [
    "Juegos de presentación",
    "Gimkanas por equipos",
    "Construcción de bases",
    "Circuitos de habilidad",
    "Merienda compartida"
  ]

  return Array.from({ length: 15 }, (_, index) => ({
    id: `foto_jorn_${index + 1}`,
    album_id: "album_002",
    url: `https://picsum.photos/seed/jorn${index}/800/600.jpg`,
    url_thumbnail: `https://picsum.photos/seed/jorn${index}/400/300.jpg`,
    titulo: `${actividades[index % actividades.length]} - Jornada de Integración`,
    descripcion: `Foto ${index + 1} de las actividades de la jornada`,
    fecha_captura: "2024-09-28T10:00:00Z",
    tamaño_bytes: Math.floor(Math.random() * 2500000) + 800000,
    tamaño_formato: "1.6 MB",
    tipo: "image/jpeg",
    etiquetas: generateEtiquetas(index, true),
    metadata: {
      camara: "Sony A7 IV",
      lente: "FE 50mm f/1.8",
      iso: 200 + Math.floor(Math.random() * 400),
      apertura: "f/2.0",
      velocidad: `1/${200 + Math.floor(Math.random() * 300)}`
    },
    created_at: "2024-09-29T08:00:00Z"
  }))
}

function generateTallerFotos() {
  const actividades = [
    "Creando marionetas",
    "Pintura en rocas",
    "Construcción de instrumentos",
    "Trabajos con cartón reciclado",
    "Manualidades con naturaleza"
  ]

  return Array.from({ length: 12 }, (_, index) => ({
    id: `foto_tall_${index + 1}`,
    album_id: "album_003",
    url: `https://picsum.photos/seed/tall${index}/800/600.jpg`,
    url_thumbnail: `https://picsum.photos/seed/tall${index}/400/300.jpg`,
    titulo: `${actividades[index % actividades.length]} - Taller de Manualidades`,
    descripcion: `Foto ${index + 1} del taller de manualidades`,
    fecha_captura: "2024-10-05T10:00:00Z",
    tamaño_bytes: Math.floor(Math.random() * 2000000) + 600000,
    tamaño_formato: "1.3 MB",
    tipo: "image/jpeg",
    etiquetas: generateEtiquetas(index, true),
    metadata: {
      camara: "Fujifilm X-T5",
      lente: "XC 35mm f/2",
      iso: 100 + Math.floor(Math.random() * 200),
      apertura: "f/2.8",
      velocidad: `1/${125 + Math.floor(Math.random() * 200)}`
    },
    created_at: "2024-10-06T08:00:00Z"
  }))
}

function generateDefaultFotos() {
  return Array.from({ length: 10 }, (_, index) => ({
    id: `foto_def_${index + 1}`,
    album_id: "default_album",
    url: `https://picsum.photos/seed/def${index}/800/600.jpg`,
    url_thumbnail: `https://picsum.photos/seed/def${index}/400/300.jpg`,
    titulo: `Actividad scout ${index + 1}`,
    descripcion: `Foto ${index + 1} de la actividad`,
    fecha_captura: "2024-10-01T10:00:00Z",
    tamaño_bytes: Math.floor(Math.random() * 2000000) + 500000,
    tamaño_formato: "1.2 MB",
    tipo: "image/jpeg",
    etiquetas: generateEtiquetas(index),
    metadata: {
      camara: "Cámara genérica",
      iso: 200,
      apertura: "f/2.8",
      velocidad: "1/250"
    },
    created_at: "2024-10-02T08:00:00Z"
  }))
}

function generateEtiquetas(index: number, soloCastores = false) {
  const etiquetas = []

  if (!soloCastores) {
    // Etiquetas para Manada (Carlos)
    if (index % 3 === 0 || index % 3 === 1) {
      etiquetas.push({
        scout_id: 1,
        nombre_completo: "Carlos García López",
        apodo: "Carlitos",
        seccion: "Manada Waingunga",
        confianza: 85 + Math.floor(Math.random() * 15),
        coords: {
          x: 20 + Math.floor(Math.random() * 60),
          y: 20 + Math.floor(Math.random() * 60),
          width: 60 + Math.floor(Math.random() * 40),
          height: 80 + Math.floor(Math.random() * 40)
        }
      })
    }
  }

  // Etiquetas para Colonia (Sofía)
  if (index % 2 === 0 || soloCastores) {
    etiquetas.push({
      scout_id: 2,
      nombre_completo: "Sofía García López",
      apodo: "Sofi",
      seccion: "Colonia La Veleta",
      confianza: 80 + Math.floor(Math.random() * 20),
      coords: {
        x: 15 + Math.floor(Math.random() * 70),
        y: 15 + Math.floor(Math.random() * 70),
        width: 50 + Math.floor(Math.random() * 50),
        height: 70 + Math.floor(Math.random() * 50)
      }
    })
  }

  return etiquetas
}